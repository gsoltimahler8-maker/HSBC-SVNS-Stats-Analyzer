import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const SEED = { comp: '257', season: '2017', fixture: 37719 };
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-legacy-fixture-neighborhood';
const INITIAL_RADIUS = 160;
const EXTEND_BLOCK = 120;
const MAX_RADIUS = 640;
const CONCURRENCY = 6;

await fs.mkdir(OUT_DIR, { recursive: true });

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept': 'application/json,text/html;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
};

const norm = (v) => v == null ? '' : String(v).trim();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function csvEscape(v) {
  const s = norm(v);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
function toCsv(rows) { return rows.map(r => r.map(csvEscape).join(',')).join('\n'); }

async function fetchText(url) {
  const r = await fetch(url, { headers, redirect: 'follow' });
  const text = await r.text();
  return { ok: r.ok, status: r.status, text, url: r.url };
}

function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}

function statCount(md) {
  const play = md?.allMatchStatsSummary?.playSummary || {};
  return Object.values(play).reduce((n, xs) => n + (Array.isArray(xs) ? xs.length : 0), 0);
}

function fixtureMeta(fixture, candidateId, md, status) {
  const f = md?.getFixtureItem || {};
  const home = f?.homeTeam || {};
  const away = f?.awayTeam || {};
  const actualFixture = norm(f?.fixtureId || f?.id || fixture);
  const actualComp = norm(f?.compId || f?.competitionId || SEED.comp);
  const actualSeason = norm(f?.season || SEED.season);
  const stats = statCount(md);
  const commentary = md?.allMatchCommentary;
  const points = md?.allMatchStatsSummary?.pointsSummary;
  const lineup = md?.allMatchStatsSummary?.lineUp;
  return {
    requestedFixtureId: String(candidateId),
    fixtureId: actualFixture,
    competitionId: actualComp,
    season: actualSeason,
    competitionName: norm(f?.compName),
    dateTime: norm(f?.dateTime),
    status: norm(f?.status),
    round: norm(f?.round),
    roundLabel: norm(f?.roundLabel),
    roundType: norm(f?.roundType),
    group: norm(f?.group),
    matchLabel: norm(f?.matchLabel),
    venue: norm(f?.venue),
    homeTeam: norm(home?.name),
    homeScore: norm(home?.score),
    awayTeam: norm(away?.name),
    awayScore: norm(away?.score),
    statsPresent: stats > 0,
    statCount: stats,
    commentaryPresent: Array.isArray(commentary) ? commentary.length > 0 : Boolean(commentary),
    pointsSummaryPresent: Boolean(points),
    lineupPresent: Boolean(lineup),
    httpStatus: status,
  };
}

const seedUrl = `${BASE}/match-centre/${SEED.comp}/${SEED.season}/${SEED.fixture}?tab=Match-Stats`;
const seedPage = await fetchText(seedUrl);
if (!seedPage.ok) throw new Error(`Seed page HTTP ${seedPage.status}`);
const seedNext = extractNextData(seedPage.text);
const buildId = seedNext.buildId;
if (!buildId) throw new Error('Seed buildId missing');

async function inspectCandidate(candidateId) {
  const dataUrl = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${SEED.comp}/${SEED.season}/${candidateId}.json?tab=Match-Stats&comp=${SEED.comp}&season=${SEED.season}&fixture=${candidateId}`;
  try {
    const r = await fetchText(dataUrl);
    if (!r.ok) return { candidateId, status: r.status, kind: 'http_non_ok' };
    let data;
    try { data = JSON.parse(r.text); }
    catch { return { candidateId, status: r.status, kind: 'non_json' }; }
    const md = data?.pageProps?.matchData;
    const f = md?.getFixtureItem;
    if (!f) return { candidateId, status: r.status, kind: 'no_fixture' };
    const meta = fixtureMeta(f?.fixtureId || f?.id || candidateId, candidateId, md, r.status);
    const sameCompSeason = meta.competitionId === SEED.comp && meta.season === SEED.season;
    const sameFixture = meta.fixtureId === String(candidateId) || meta.requestedFixtureId === String(candidateId);
    return { candidateId, status: r.status, kind: sameCompSeason && sameFixture ? 'match' : 'other', meta, dataUrl };
  } catch (error) {
    return { candidateId, status: 0, kind: 'error', error: String(error) };
  }
}

async function scanIds(ids) {
  const out = [];
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= ids.length) return;
      out[i] = await inspectCandidate(ids[i]);
      if (i % 25 === 0) await sleep(30);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return out;
}

const scanned = new Map();
async function scanRange(minId, maxId) {
  const ids = [];
  for (let id = minId; id <= maxId; id++) if (!scanned.has(id)) ids.push(id);
  const results = await scanIds(ids);
  results.forEach((r, i) => scanned.set(ids[i], r));
}

let radius = INITIAL_RADIUS;
await scanRange(SEED.fixture - radius, SEED.fixture + radius);

function matchingResults() {
  return [...scanned.values()].filter(x => x?.kind === 'match' && x.meta);
}

// Extend only when matching IDs approach either current boundary. Stop after a clean block.
while (radius < MAX_RADIUS) {
  const matches = matchingResults();
  if (!matches.length) break;
  const ids = matches.map(x => Number(x.meta.fixtureId)).filter(Number.isFinite);
  const low = SEED.fixture - radius;
  const high = SEED.fixture + radius;
  const nearLow = ids.some(id => id <= low + 20);
  const nearHigh = ids.some(id => id >= high - 20);
  if (!nearLow && !nearHigh) break;

  const nextRadius = Math.min(MAX_RADIUS, radius + EXTEND_BLOCK);
  if (nearLow) await scanRange(SEED.fixture - nextRadius, SEED.fixture - radius - 1);
  if (nearHigh) await scanRange(SEED.fixture + radius + 1, SEED.fixture + nextRadius);
  radius = nextRadius;
}

const matches = matchingResults()
  .map(x => ({ ...x.meta, dataUrl: x.dataUrl }))
  .sort((a,b) => norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId) - Number(b.fixtureId));

const uniqueByFixture = new Map();
for (const m of matches) uniqueByFixture.set(m.fixtureId, m);
const fixtures = [...uniqueByFixture.values()].sort((a,b) => norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId) - Number(b.fixtureId));

const ids = fixtures.map(x => Number(x.fixtureId)).filter(Number.isFinite).sort((a,b) => a-b);
const dates = fixtures.map(x => x.dateTime).filter(Boolean).sort();
const teams = [...new Set(fixtures.flatMap(x => [x.homeTeam, x.awayTeam]).filter(Boolean))].sort();
const roundCounts = {};
for (const m of fixtures) {
  const key = m.roundLabel || m.round || m.roundType || m.group || m.matchLabel || '(blank)';
  roundCounts[key] = (roundCounts[key] || 0) + 1;
}

const kindCounts = {};
const statusCounts = {};
for (const r of scanned.values()) {
  kindCounts[r.kind] = (kindCounts[r.kind] || 0) + 1;
  statusCounts[String(r.status)] = (statusCounts[String(r.status)] || 0) + 1;
}

const fixtureRows = [[
  'fixture_id','competition_id','season','competition_name','date_time','round','round_label','round_type','group','match_label','venue',
  'home_team','home_score','away_team','away_score','stats_present','stat_count','commentary_present','points_summary_present','lineup_present','data_url'
]];
for (const m of fixtures) fixtureRows.push([
  m.fixtureId,m.competitionId,m.season,m.competitionName,m.dateTime,m.round,m.roundLabel,m.roundType,m.group,m.matchLabel,m.venue,
  m.homeTeam,m.homeScore,m.awayTeam,m.awayScore,m.statsPresent,m.statCount,m.commentaryPresent,m.pointsSummaryPresent,m.lineupPresent,m.dataUrl
]);
await fs.writeFile(path.join(OUT_DIR, 'hong-kong-2017-fixtures.csv'), toCsv(fixtureRows));
await fs.writeFile(path.join(OUT_DIR, 'scan-results.json'), JSON.stringify([...scanned.values()], null, 2));
await fs.writeFile(path.join(OUT_DIR, 'fixtures.json'), JSON.stringify(fixtures, null, 2));

const summary = {
  audit: 'Hong Kong 2017 legacy fixture-ID neighborhood reconstruction',
  seed: { ...SEED, seedUrl, buildId },
  scanRadiusUsed: radius,
  scanMinFixtureId: SEED.fixture - radius,
  scanMaxFixtureId: SEED.fixture + radius,
  scannedCandidateCount: scanned.size,
  kindCounts,
  httpStatusCounts: statusCounts,
  reconstructedFixtureCount: fixtures.length,
  minMatchedFixtureId: ids[0] ?? null,
  maxMatchedFixtureId: ids.at(-1) ?? null,
  firstDateTime: dates[0] || null,
  lastDateTime: dates.at(-1) || null,
  uniqueTeamCount: teams.length,
  teams,
  roundCounts,
  statsPresentCount: fixtures.filter(x => x.statsPresent).length,
  commentaryPresentCount: fixtures.filter(x => x.commentaryPresent).length,
  pointsSummaryPresentCount: fixtures.filter(x => x.pointsSummaryPresent).length,
  lineupPresentCount: fixtures.filter(x => x.lineupPresent).length,
  fixtureIds: fixtures.map(x => x.fixtureId),
  firstFixtures: fixtures.slice(0, 8),
  lastFixtures: fixtures.slice(-8),
  capturedAt: new Date().toISOString(),
};
await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
