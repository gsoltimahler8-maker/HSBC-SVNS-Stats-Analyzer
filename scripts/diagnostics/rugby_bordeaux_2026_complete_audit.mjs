import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const COMP_ID = '112';
const SEASON = '2026';
const RESULTS_URL = `${BASE}/fixtures-results?team=All&comp=${COMP_ID}&tab=Results`;
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-bordeaux-2026-complete-audit';

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.mkdir(path.join(OUT_DIR, 'raw'), { recursive: true });

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
};

function norm(v) { return v == null ? '' : String(v).trim(); }
function csvEscape(v) {
  const s = norm(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

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
        title: norm(entry.title),
        homeValue: norm(entry.homeValue),
        awayValue: norm(entry.awayValue),
      });
    }
  }
  return rows;
}

function valueInfo(value) {
  if (Array.isArray(value)) {
    return { type: 'array', size: value.length, nonEmpty: value.length > 0 };
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    return { type: 'object', size: keys.length, nonEmpty: keys.length > 0, keys: keys.slice(0, 30) };
  }
  const text = norm(value);
  return { type: value === null ? 'null' : typeof value, size: text.length, nonEmpty: Boolean(text), preview: text.slice(0, 300) };
}

function collectMatchingKeyPaths(value, keyRegex, currentPath = '$', out = [], depth = 0) {
  if (value == null || depth > 12 || out.length >= 500) return out;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      collectMatchingKeyPaths(value[i], keyRegex, `${currentPath}[${i}]`, out, depth + 1);
    }
    return out;
  }
  if (typeof value !== 'object') return out;

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${currentPath}.${key}`;
    if (keyRegex.test(key)) out.push({ path: childPath, key, ...valueInfo(child) });
    collectMatchingKeyPaths(child, keyRegex, childPath, out, depth + 1);
  }
  return out;
}

function pathHasData(items) {
  return items.some(x => x.nonEmpty);
}

function canonicalStage(value) {
  const s = norm(value).toLowerCase().replace(/[–—_]/g, '-').replace(/\s+/g, ' ');
  if (!s) return null;
  if (/\b(qf|quarter[- ]?finals?)\b/.test(s)) return 'Quarter-Final';
  if (/\b(sf|semi[- ]?finals?)\b/.test(s)) return 'Semi-Final';
  if (/\b(bronze|bronze final|3rd place|third place|3rd-place|third-place|bf)\b/.test(s)) return 'Bronze Final';
  if (/\b(final)\b/.test(s) && !/quarter|semi|bronze/.test(s)) return 'Final';
  if (/\b(5th place|fifth place|5th-place)\b/.test(s)) return '5th Place';
  if (/\b(7th place|seventh place|7th-place)\b/.test(s)) return '7th Place';
  if (/\b(9th place|ninth place|9th-place)\b/.test(s)) return '9th Place';
  if (/\b(pool|group)\b/.test(s)) return 'Pool';
  return null;
}

function stageSignals(md) {
  const fixtureItem = md?.getFixtureItem || {};
  const all = collectMatchingKeyPaths(
    fixtureItem,
    /^(round|roundLabel|roundType|group|groupName|stage|stageName|matchLabel|matchType)$/i
  );
  const signals = [];
  for (const x of all) {
    if (x.type === 'string' || x.type === 'number') {
      const raw = x.preview || '';
      const canonical = canonicalStage(raw);
      if (raw) signals.push({ path: x.path, raw, canonical });
    }
  }
  return signals;
}

function incrementMap(map, key) {
  if (!key) return;
  map[key] = (map[key] || 0) + 1;
}

function sortedFrequency(map) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => ({ key, count }));
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1400 } });
const page = await context.newPage();
await page.goto(RESULTS_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(10000);

async function currentLinks() {
  const hrefs = await page.locator('a[href*="/match-centre/"]').evaluateAll((els) =>
    [...new Set(els.map(a => a.getAttribute('href')).filter(Boolean))]
  );
  return hrefs.filter(x => new RegExp(`^/match-centre/${COMP_ID}/${SEASON}/\\d+`).test(x));
}

let hrefs = await currentLinks();
const discoverySnapshots = [{ step: 0, clicked: false, count: hrefs.length }];
for (let i = 1; i <= 8; i++) {
  let clicked = false;
  const loadMore = page.getByRole('button', { name: /load more/i }).or(page.getByRole('link', { name: /load more/i })).first();
  try {
    if (await loadMore.count() && await loadMore.isVisible()) {
      await loadMore.click({ timeout: 5000 });
      clicked = true;
      await page.waitForTimeout(3500);
    }
  } catch {}
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  const next = await currentLinks();
  discoverySnapshots.push({ step: i, clicked, count: next.length });
  if (next.length === hrefs.length && !clicked) {
    hrefs = next;
    break;
  }
  hrefs = next;
}
await page.screenshot({ path: path.join(OUT_DIR, 'results-page.png'), fullPage: true }).catch(() => {});
await browser.close();

const links = [...new Set(hrefs)].map(href => {
  const m = href.match(/^\/match-centre\/(\d+)\/(\d+)\/(\d+)/);
  return { href, comp: m[1], season: m[2], fixture: m[3] };
});

const matches = [];
const failures = [];
const topLevelKeyFrequency = {};
const commentaryPathFrequency = {};
const pointsPathFrequency = {};
const lineupPathFrequency = {};
const stagePathFrequency = {};

for (let index = 0; index < links.length; index++) {
  const link = links[index];
  try {
    const matchUrl = `${BASE}${link.href}?tab=Match-Stats`;
    const html = await fetchText(matchUrl);
    const next = extractNextData(html);
    const buildId = next.buildId;
    const dataUrl = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${link.comp}/${link.season}/${link.fixture}.json?tab=Match-Stats&comp=${link.comp}&season=${link.season}&fixture=${link.fixture}`;
    const rawText = await fetchText(dataUrl);
    await fs.writeFile(path.join(OUT_DIR, 'raw', `${link.fixture}.json`), rawText);

    const data = JSON.parse(rawText);
    const md = data?.pageProps?.matchData || {};
    const fixtureItem = md?.getFixtureItem || {};
    const stats = flattenStats(md?.allMatchStatsSummary?.playSummary);

    for (const key of Object.keys(md)) incrementMap(topLevelKeyFrequency, key);

    const commentaryPaths = collectMatchingKeyPaths(md, /commentary|commentaries/i);
    const pointsPaths = collectMatchingKeyPaths(md, /points?summary|scoreSummary|scoring/i);
    const lineupPaths = collectMatchingKeyPaths(md, /lineup|lineUp|teamList|teamSheet|squad/i);
    const stagePaths = collectMatchingKeyPaths(fixtureItem, /round|group|stage|matchLabel|matchType/i);

    for (const x of commentaryPaths) incrementMap(commentaryPathFrequency, x.path.replace(/\[\d+\]/g, '[]'));
    for (const x of pointsPaths) incrementMap(pointsPathFrequency, x.path.replace(/\[\d+\]/g, '[]'));
    for (const x of lineupPaths) incrementMap(lineupPathFrequency, x.path.replace(/\[\d+\]/g, '[]'));
    for (const x of stagePaths) incrementMap(stagePathFrequency, x.path.replace(/\[\d+\]/g, '[]'));

    const signals = stageSignals(md);
    const canonicalStages = [...new Set(signals.map(x => x.canonical).filter(Boolean))];
    const stagePotentialConflict = canonicalStages.length > 1;

    matches.push({
      fixtureId: link.fixture,
      competitionId: link.comp,
      season: link.season,
      competition: norm(fixtureItem?.compName),
      dateTime: norm(fixtureItem?.dateTime),
      homeTeam: norm(fixtureItem?.homeTeam?.name),
      homeScore: norm(fixtureItem?.homeTeam?.score),
      awayTeam: norm(fixtureItem?.awayTeam?.name),
      awayScore: norm(fixtureItem?.awayTeam?.score),
      round: norm(fixtureItem?.round),
      roundLabel: norm(fixtureItem?.roundLabel),
      status: norm(fixtureItem?.status),
      venue: norm(fixtureItem?.venue),
      statCount: stats.length,
      statsPresent: stats.length > 0,
      commentaryPresent: pathHasData(commentaryPaths),
      pointsSummaryPresent: pathHasData(pointsPaths),
      lineupPresent: pathHasData(lineupPaths),
      commentaryPaths,
      pointsPaths,
      lineupPaths,
      stagePaths,
      stageSignals: signals,
      canonicalStageSignals: canonicalStages,
      stagePotentialConflict,
      matchDataTopLevelKeys: Object.keys(md).sort(),
      matchUrl,
      dataUrl,
    });
  } catch (error) {
    failures.push({ ...link, error: String(error) });
  }
  if (index < links.length - 1) await sleep(100);
}

matches.sort((a, b) => norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId) - Number(b.fixtureId));

const auditRows = [[
  'fixtureId','dateTime','homeTeam','homeScore','awayTeam','awayScore','round','roundLabel',
  'statsPresent','statCount','pointsSummaryPresent','commentaryPresent','lineupPresent',
  'stagePotentialConflict','canonicalStageSignals','stageSignals'
]];
for (const m of matches) {
  auditRows.push([
    m.fixtureId,m.dateTime,m.homeTeam,m.homeScore,m.awayTeam,m.awayScore,m.round,m.roundLabel,
    m.statsPresent,m.statCount,m.pointsSummaryPresent,m.commentaryPresent,m.lineupPresent,
    m.stagePotentialConflict,m.canonicalStageSignals.join(' | '),
    m.stageSignals.map(x => `${x.path}=${x.raw}${x.canonical ? `=>${x.canonical}` : ''}`).join(' || ')
  ]);
}

await fs.writeFile(path.join(OUT_DIR, 'matches-audit.json'), JSON.stringify(matches, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'matches-audit.csv'), auditRows.map(r => r.map(csvEscape).join(',')).join('\n'));
await fs.writeFile(path.join(OUT_DIR, 'structure-paths.json'), JSON.stringify({
  matchDataTopLevelKeys: sortedFrequency(topLevelKeyFrequency),
  commentaryPaths: sortedFrequency(commentaryPathFrequency),
  pointsSummaryPaths: sortedFrequency(pointsPathFrequency),
  lineupPaths: sortedFrequency(lineupPathFrequency),
  stagePaths: sortedFrequency(stagePathFrequency),
}, null, 2));

const summary = {
  capturedAt: new Date().toISOString(),
  audit: 'Bordeaux 2026 Women complete Match Centre data audit',
  competitionId: COMP_ID,
  season: SEASON,
  resultsUrl: RESULTS_URL,
  discoverySnapshots,
  discoveredLinkCount: links.length,
  collectedCount: matches.length,
  failureCount: failures.length,
  statsPresentCount: matches.filter(x => x.statsPresent).length,
  pointsSummaryPresentCount: matches.filter(x => x.pointsSummaryPresent).length,
  commentaryPresentCount: matches.filter(x => x.commentaryPresent).length,
  lineupPresentCount: matches.filter(x => x.lineupPresent).length,
  stagePotentialConflictCount: matches.filter(x => x.stagePotentialConflict).length,
  stagePotentialConflictFixtures: matches.filter(x => x.stagePotentialConflict).map(x => ({
    fixtureId: x.fixtureId,
    dateTime: x.dateTime,
    teams: `${x.homeTeam} ${x.homeScore}-${x.awayScore} ${x.awayTeam}`,
    round: x.round,
    roundLabel: x.roundLabel,
    signals: x.stageSignals,
  })),
  matchDataTopLevelKeys: sortedFrequency(topLevelKeyFrequency),
  commentaryPathFrequency: sortedFrequency(commentaryPathFrequency).slice(0, 30),
  pointsSummaryPathFrequency: sortedFrequency(pointsPathFrequency).slice(0, 30),
  lineupPathFrequency: sortedFrequency(lineupPathFrequency).slice(0, 30),
  stagePathFrequency: sortedFrequency(stagePathFrequency).slice(0, 30),
  failures,
};

await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
