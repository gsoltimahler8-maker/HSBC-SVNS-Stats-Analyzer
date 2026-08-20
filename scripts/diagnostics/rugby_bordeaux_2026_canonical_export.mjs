import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const COMP_ID = '112';
const SEASON = '2026';
const RESULTS_URL = `${BASE}/fixtures-results?team=All&comp=${COMP_ID}&tab=Results`;
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-bordeaux-2026-canonical-export';
const RAW_DIR = path.join(OUT_DIR, 'raw');

await fs.mkdir(RAW_DIR, { recursive: true });

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
};

function norm(v) { return v == null ? '' : String(v).trim(); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function csvEscape(v) {
  const s = norm(v);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
function csv(rows) { return rows.map(r => r.map(csvEscape).join(',')).join('\n'); }
function slug(v) {
  return norm(v)
    .toLowerCase()
    .replace(/%/g, ' pct ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
function isScalar(v) { return v == null || ['string','number','boolean'].includes(typeof v); }

async function fetchText(url) {
  const r = await fetch(url, { headers, redirect: 'follow' });
  const text = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}: ${text.slice(0, 300)}`);
  return text;
}

function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}

function flattenStats(playSummary) {
  const rows = [];
  for (const [category, entries] of Object.entries(playSummary || {})) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;
      rows.push({
        category,
        id: norm(entry.id),
        title: norm(entry.title),
        homeValue: norm(entry.homeValue),
        awayValue: norm(entry.awayValue),
      });
    }
  }
  return rows;
}

function scalarMap(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (isScalar(v)) out[k] = v;
  }
  return out;
}

function collectScalarObjects(value, currentPath = '$', out = [], depth = 0) {
  if (value == null || depth > 20) return out;
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectScalarObjects(v, `${currentPath}[${i}]`, out, depth + 1));
    return out;
  }
  if (typeof value !== 'object') return out;

  const scalars = scalarMap(value);
  if (Object.keys(scalars).length) {
    out.push({ path: currentPath, scalars, raw: value });
  }
  for (const [k, v] of Object.entries(value)) {
    if (v && typeof v === 'object') collectScalarObjects(v, `${currentPath}.${k}`, out, depth + 1);
  }
  return out;
}

function keyNorm(k) { return String(k).toLowerCase().replace(/[^a-z0-9]/g, ''); }
function pick(scalars, aliases) {
  const entries = Object.entries(scalars || {});
  const aliasNorms = aliases.map(keyNorm);
  for (const alias of aliasNorms) {
    const exact = entries.find(([k]) => keyNorm(k) === alias);
    if (exact) return norm(exact[1]);
  }
  for (const alias of aliasNorms) {
    const fuzzy = entries.find(([k]) => keyNorm(k).includes(alias) || alias.includes(keyNorm(k)));
    if (fuzzy) return norm(fuzzy[1]);
  }
  return '';
}

function teamName(team) { return norm(team?.name || team?.teamName || team?.displayName); }
function teamId(team) { return norm(team?.teamId || team?.id); }
function teamScore(team) { return norm(team?.score || team?.points); }

function outcome(scoreFor, scoreAgainst) {
  const a = Number(scoreFor), b = Number(scoreAgainst);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return '';
  return a > b ? 'W' : a < b ? 'L' : 'D';
}

async function discoverLinks() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  await page.goto(RESULTS_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(7000);

  async function linksNow() {
    const hrefs = await page.locator('a[href*="/match-centre/"]').evaluateAll(els =>
      [...new Set(els.map(a => a.getAttribute('href')).filter(Boolean))]
    );
    return hrefs.filter(x => /^\/match-centre\/\d+\/\d+\/\d+/.test(x));
  }

  let links = await linksNow();
  const snapshots = [{ step: 0, count: links.length }];
  for (let i = 1; i <= 8; i++) {
    let clicked = false;
    const more = page.getByRole('button', { name: /load more/i }).or(page.getByRole('link', { name: /load more/i })).first();
    try {
      if (await more.count() && await more.isVisible()) {
        await more.click({ timeout: 4000 });
        clicked = true;
        await page.waitForTimeout(3500);
      }
    } catch {}
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    const next = await linksNow();
    snapshots.push({ step: i, clicked, count: next.length });
    if (next.length === links.length && !clicked) { links = next; break; }
    links = next;
  }
  await browser.close();
  return { links: [...new Set(links)], snapshots };
}

const discovery = await discoverLinks();
const links = discovery.links
  .map(href => {
    const m = href.match(/^\/match-centre\/(\d+)\/(\d+)\/(\d+)/);
    return m ? { href, comp: m[1], season: m[2], fixture: m[3] } : null;
  })
  .filter(Boolean)
  .filter(x => x.comp === COMP_ID && x.season === SEASON);

const records = [];
const failures = [];

for (let i = 0; i < links.length; i++) {
  const link = links[i];
  try {
    const matchUrl = `${BASE}${link.href}?tab=Match-Stats`;
    const html = await fetchText(matchUrl);
    const next = extractNextData(html);
    const buildId = next.buildId;
    const dataUrl = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${link.comp}/${link.season}/${link.fixture}.json?tab=Match-Stats&comp=${link.comp}&season=${link.season}&fixture=${link.fixture}`;
    const rawText = await fetchText(dataUrl);
    await fs.writeFile(path.join(RAW_DIR, `${link.fixture}.json`), rawText);
    const data = JSON.parse(rawText);
    const md = data?.pageProps?.matchData || {};
    const fixtureItem = md?.getFixtureItem || {};
    const statsSummary = md?.allMatchStatsSummary || {};

    records.push({
      fixtureId: link.fixture,
      comp: link.comp,
      season: link.season,
      matchUrl,
      dataUrl,
      fixtureItem,
      stats: flattenStats(statsSummary?.playSummary),
      pointsSummary: statsSummary?.pointsSummary ?? null,
      commentary: md?.allMatchCommentary ?? null,
      lineup: statsSummary?.lineUp ?? null,
    });
  } catch (error) {
    failures.push({ ...link, error: String(error) });
  }
  if (i < links.length - 1) await sleep(100);
}

records.sort((a, b) => norm(a.fixtureItem?.dateTime).localeCompare(norm(b.fixtureItem?.dateTime)) || Number(a.fixtureId) - Number(b.fixtureId));

const firstFixture = records[0]?.fixtureItem || {};
const tournamentRows = [[
  'competition_id','season_source','competition_name','gender','results_url','match_count','first_match_datetime','last_match_datetime'
]];
const dates = records.map(r => norm(r.fixtureItem?.dateTime)).filter(Boolean).sort();
const compName = norm(firstFixture?.compName || records.find(r => r.fixtureItem?.compName)?.fixtureItem?.compName);
const gender = /women/i.test(compName) ? 'Women' : /men/i.test(compName) ? 'Men' : '';
tournamentRows.push([COMP_ID,SEASON,compName,gender,RESULTS_URL,records.length,dates[0] || '',dates.at(-1) || '']);

const matchRows = [[
  'match_id','competition_id','season_source','competition_name','date_time','venue','status',
  'home_team_id','home_team','home_score','away_team_id','away_team','away_score',
  'round_raw','round_label_raw','group_raw','stage_raw','match_type_raw','winner_team','source_url','raw_json_file'
]];
for (const r of records) {
  const f = r.fixtureItem || {};
  const home = f.homeTeam || {};
  const away = f.awayTeam || {};
  const hs = teamScore(home), as = teamScore(away);
  const winner = outcome(hs, as) === 'W' ? teamName(home) : outcome(hs, as) === 'L' ? teamName(away) : '';
  matchRows.push([
    r.fixtureId,r.comp,r.season,norm(f.compName),norm(f.dateTime),norm(f.venue),norm(f.status),
    teamId(home),teamName(home),hs,teamId(away),teamName(away),as,
    norm(f.round),norm(f.roundLabel),norm(f.group),norm(f.stage),norm(f.matchType),winner,r.matchUrl,`raw/${r.fixtureId}.json`
  ]);
}

const statKeys = new Map();
for (const r of records) {
  for (const s of r.stats) {
    const base = slug(s.title) || slug(s.id) || 'stat';
    let key = base;
    let n = 2;
    while ([...statKeys.values()].includes(key) && statKeys.get(s.title) !== key) key = `${base}_${n++}`;
    if (!statKeys.has(s.title)) statKeys.set(s.title, key);
  }
}
const statColumns = [...new Set(statKeys.values())].sort();
const teamStatHeader = [
  'match_id','competition_id','season_source','competition_name','date_time','team_id','team','opponent_id','opponent',
  'team_side','team_score','opponent_score','outcome',...statColumns
];
const teamStatRows = [teamStatHeader];
const teamStatLongRows = [[
  'match_id','competition_id','season_source','date_time','team_id','team','opponent_id','opponent','team_side','outcome',
  'category','stat_title','stat_key','raw_value','opponent_raw_value'
]];

for (const r of records) {
  const f = r.fixtureItem || {};
  const sides = [
    { side:'home', team:f.homeTeam || {}, opp:f.awayTeam || {} },
    { side:'away', team:f.awayTeam || {}, opp:f.homeTeam || {} },
  ];
  for (const side of sides) {
    const values = Object.fromEntries(statColumns.map(k => [k, '']));
    for (const s of r.stats) {
      const key = statKeys.get(s.title);
      if (!key) continue;
      values[key] = side.side === 'home' ? s.homeValue : s.awayValue;
      teamStatLongRows.push([
        r.fixtureId,r.comp,r.season,norm(f.dateTime),teamId(side.team),teamName(side.team),teamId(side.opp),teamName(side.opp),side.side,
        outcome(teamScore(side.team), teamScore(side.opp)),s.category,s.title,key,
        side.side === 'home' ? s.homeValue : s.awayValue,
        side.side === 'home' ? s.awayValue : s.homeValue,
      ]);
    }
    teamStatRows.push([
      r.fixtureId,r.comp,r.season,norm(f.compName),norm(f.dateTime),teamId(side.team),teamName(side.team),teamId(side.opp),teamName(side.opp),
      side.side,teamScore(side.team),teamScore(side.opp),outcome(teamScore(side.team), teamScore(side.opp)),
      ...statColumns.map(k => values[k])
    ]);
  }
}

function eventRows(records, fieldName) {
  const rows = [[
    'match_id','path','sequence','period','match_clock','event_type','team_id','team','player_id','player','score','home_score','away_score','text','raw_json'
  ]];
  let sequence = 0;
  for (const r of records) {
    const root = r[fieldName];
    for (const item of collectScalarObjects(root)) {
      sequence++;
      const s = item.scalars;
      rows.push([
        r.fixtureId,item.path,sequence,
        pick(s,['period','half','periodName']),
        pick(s,['matchClock','clock','time','minute','minutes','timestamp']),
        pick(s,['eventType','type','action','title','name']),
        pick(s,['teamId','teamID']),pick(s,['teamName','team']),
        pick(s,['playerId','playerID']),pick(s,['playerName','player','name']),
        pick(s,['score']),pick(s,['homeScore']),pick(s,['awayScore']),
        pick(s,['commentary','comment','text','description','message']),
        JSON.stringify(item.raw)
      ]);
    }
  }
  return rows;
}

const pointsRows = eventRows(records, 'pointsSummary');
const commentaryRows = eventRows(records, 'commentary');

const lineupRows = [[
  'match_id','path','sequence','team_id','team','player_id','player','first_name','last_name','jersey_number','position','role','captain','raw_json'
]];
let lineupSeq = 0;
for (const r of records) {
  for (const item of collectScalarObjects(r.lineup)) {
    lineupSeq++;
    const s = item.scalars;
    lineupRows.push([
      r.fixtureId,item.path,lineupSeq,
      pick(s,['teamId','teamID']),pick(s,['teamName','team']),
      pick(s,['playerId','playerID','personId']),pick(s,['playerName','player','displayName','fullName','name']),
      pick(s,['firstName','givenName']),pick(s,['lastName','surname','familyName']),
      pick(s,['jerseyNumber','shirtNumber','number']),pick(s,['position','positionName']),pick(s,['role','lineupRole','status']),pick(s,['captain','isCaptain']),
      JSON.stringify(item.raw)
    ]);
  }
}

await fs.writeFile(path.join(OUT_DIR, 'tournaments.csv'), csv(tournamentRows));
await fs.writeFile(path.join(OUT_DIR, 'matches.csv'), csv(matchRows));
await fs.writeFile(path.join(OUT_DIR, 'team_match_stats.csv'), csv(teamStatRows));
await fs.writeFile(path.join(OUT_DIR, 'team_match_stats_long.csv'), csv(teamStatLongRows));
await fs.writeFile(path.join(OUT_DIR, 'points_summary.csv'), csv(pointsRows));
await fs.writeFile(path.join(OUT_DIR, 'commentary.csv'), csv(commentaryRows));
await fs.writeFile(path.join(OUT_DIR, 'lineups.csv'), csv(lineupRows));

const summary = {
  audit: 'Bordeaux 2026 Women canonical CSV export',
  competitionId: COMP_ID,
  season: SEASON,
  resultsUrl: RESULTS_URL,
  discoverySnapshots: discovery.snapshots,
  discoveredLinkCount: links.length,
  collectedCount: records.length,
  failureCount: failures.length,
  rawJsonCount: records.length,
  csvFiles: {
    tournaments: tournamentRows.length - 1,
    matches: matchRows.length - 1,
    teamMatchStats: teamStatRows.length - 1,
    teamMatchStatsLong: teamStatLongRows.length - 1,
    pointsSummary: pointsRows.length - 1,
    commentary: commentaryRows.length - 1,
    lineups: lineupRows.length - 1,
  },
  statColumnCount: statColumns.length,
  statColumns,
  commentaryRowsWithText: commentaryRows.slice(1).filter(r => norm(r[13])).length,
  commentaryRowsWithClock: commentaryRows.slice(1).filter(r => norm(r[4])).length,
  pointsRowsWithClock: pointsRows.slice(1).filter(r => norm(r[4])).length,
  lineupRowsWithPlayer: lineupRows.slice(1).filter(r => norm(r[6]) || norm(r[7]) || norm(r[8])).length,
  failures,
  capturedAt: new Date().toISOString(),
};
await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
