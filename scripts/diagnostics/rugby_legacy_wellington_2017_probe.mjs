import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const SEED = { comp: '253', season: '2017', fixture: 37459 };
const RADIUS = 160;
const CONCURRENCY = 6;
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-legacy-wellington-2017';
await fs.mkdir(OUT_DIR, { recursive: true });

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept': 'application/json,text/html;q=0.9,*/*;q=0.8',
};
const norm = v => v == null ? '' : String(v).trim();

async function fetchText(url) {
  const r = await fetch(url, { headers, redirect: 'follow' });
  return { ok: r.ok, status: r.status, text: await r.text() };
}
function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}
function countStats(md) {
  const play = md?.allMatchStatsSummary?.playSummary || {};
  return Object.values(play).reduce((n, x) => n + (Array.isArray(x) ? x.length : 0), 0);
}

const seedUrl = `${BASE}/match-centre/${SEED.comp}/${SEED.season}/${SEED.fixture}?tab=Match-Stats`;
const seedPage = await fetchText(seedUrl);
if (!seedPage.ok) throw new Error(`Seed HTTP ${seedPage.status}`);
const buildId = extractNextData(seedPage.text).buildId;
if (!buildId) throw new Error('buildId missing');

async function inspect(id) {
  const url = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${SEED.comp}/${SEED.season}/${id}.json?tab=Match-Stats&comp=${SEED.comp}&season=${SEED.season}&fixture=${id}`;
  try {
    const r = await fetchText(url);
    if (!r.ok) return { id, kind: 'http_non_ok', status: r.status };
    let data;
    try { data = JSON.parse(r.text); } catch { return { id, kind: 'non_json', status: r.status }; }
    const md = data?.pageProps?.matchData;
    const f = md?.getFixtureItem;
    if (!f) return { id, kind: 'no_fixture', status: r.status };
    const fixtureId = norm(f.fixtureId || f.id || id);
    const comp = norm(f.compId || f.competitionId || SEED.comp);
    const season = norm(f.season || SEED.season);
    if (fixtureId !== String(id) || comp !== SEED.comp || season !== SEED.season) return { id, kind: 'other', status: r.status };
    const stats = countStats(md);
    return {
      id, kind: 'match', status: r.status,
      fixtureId, competitionId: comp, season,
      competitionName: norm(f.compName), dateTime: norm(f.dateTime), venue: norm(f.venue),
      round: norm(f.round), roundLabel: norm(f.roundLabel), roundType: norm(f.roundType), group: norm(f.group), matchLabel: norm(f.matchLabel),
      homeTeam: norm(f.homeTeam?.name), awayTeam: norm(f.awayTeam?.name),
      statsPresent: stats > 0, statCount: stats,
      commentaryPresent: Array.isArray(md?.allMatchCommentary) ? md.allMatchCommentary.length > 0 : Boolean(md?.allMatchCommentary),
      pointsSummaryPresent: Boolean(md?.allMatchStatsSummary?.pointsSummary),
      lineupPresent: Boolean(md?.allMatchStatsSummary?.lineUp),
    };
  } catch (e) {
    return { id, kind: 'error', status: 0, error: String(e) };
  }
}

const ids = [];
for (let id = SEED.fixture - RADIUS; id <= SEED.fixture + RADIUS; id++) ids.push(id);
const results = new Array(ids.length);
let cursor = 0;
async function worker() {
  while (true) {
    const i = cursor++;
    if (i >= ids.length) return;
    results[i] = await inspect(ids[i]);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const fixtures = results.filter(x => x?.kind === 'match').sort((a,b) => a.dateTime.localeCompare(b.dateTime) || a.id - b.id);
const fixtureIds = fixtures.map(x => x.id).sort((a,b) => a-b);
const dates = fixtures.map(x => x.dateTime).filter(Boolean).sort();
const teams = [...new Set(fixtures.flatMap(x => [x.homeTeam, x.awayTeam]).filter(Boolean))].sort();
const roundCounts = {};
for (const x of fixtures) {
  const k = x.roundLabel || x.round || x.roundType || x.group || x.matchLabel || '(blank)';
  roundCounts[k] = (roundCounts[k] || 0) + 1;
}
const kindCounts = {};
for (const x of results) kindCounts[x.kind] = (kindCounts[x.kind] || 0) + 1;

const summary = {
  audit: 'Wellington 2017 legacy fixture-ID neighborhood validation',
  seed: { ...SEED, seedUrl, buildId },
  scannedCandidateCount: results.length,
  scanMinFixtureId: ids[0],
  scanMaxFixtureId: ids.at(-1),
  kindCounts,
  reconstructedFixtureCount: fixtures.length,
  minMatchedFixtureId: fixtureIds[0] ?? null,
  maxMatchedFixtureId: fixtureIds.at(-1) ?? null,
  firstDateTime: dates[0] || null,
  lastDateTime: dates.at(-1) || null,
  uniqueTeamCount: teams.length,
  teams,
  roundCounts,
  statsPresentCount: fixtures.filter(x => x.statsPresent).length,
  commentaryPresentCount: fixtures.filter(x => x.commentaryPresent).length,
  pointsSummaryPresentCount: fixtures.filter(x => x.pointsSummaryPresent).length,
  lineupPresentCount: fixtures.filter(x => x.lineupPresent).length,
  fixtureIds: fixtureIds.map(String),
  firstFixtures: fixtures.slice(0, 8),
  lastFixtures: fixtures.slice(-8),
  capturedAt: new Date().toISOString(),
};
await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'fixtures.json'), JSON.stringify(fixtures, null, 2));
console.log(JSON.stringify(summary, null, 2));
