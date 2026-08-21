import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-legacy-hongkong-2016-quality';
const CATALOG_PATH = process.env.CATALOG_PATH || './legacy-sevens-seed-catalog.json';
const RADIUS = 160;
const CONCURRENCY = 6;

await fs.mkdir(OUT_DIR, { recursive: true });
const catalog = JSON.parse(await fs.readFile(CATALOG_PATH, 'utf8'));
const seed = catalog.seeds.find(x => x.eventKey === '2016-M-HKG');
if (!seed) throw new Error('2016-M-HKG seed not found');

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept': 'application/json,text/html;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
};
const norm = v => v == null ? '' : String(v).trim();

async function fetchText(url) {
  const r = await fetch(url, { headers, redirect: 'follow' });
  return { ok: r.ok, status: r.status, text: await r.text(), url: r.url };
}
function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}
function zeroLike(v) {
  const s = norm(v).toUpperCase().replace(/\s+/g, '');
  return !s || ['0','0%','0/0','N/A','NA','-','NULL','NONE'].includes(s);
}
const CORE = new Set([
  'Metres','Carries','Defenders Beaten','Clean Breaks','Passes','Offloads','Turnovers Conceded',
  'Tackles','Missed Tackles','Turnovers Won','Kicks in Play','Rucks Won','Rucks Lost','Possession',
  'Penalties Conceded'
]);
function statsAudit(md) {
  const play = md?.allMatchStatsSummary?.playSummary || {};
  const items = Object.values(play).flatMap(xs => Array.isArray(xs) ? xs : []);
  const core = items.filter(x => CORE.has(norm(x?.title)));
  const coreNonZero = core.filter(x => !zeroLike(x?.homeValue) || !zeroLike(x?.awayValue));
  const informative = items.filter(x => !zeroLike(x?.homeValue) || !zeroLike(x?.awayValue));
  let quality = 'score_only_or_zero';
  if (coreNonZero.length >= 8) quality = 'rich';
  else if (coreNonZero.length >= 3) quality = 'sparse';
  return {
    statCount: items.length,
    informativeStatCount: informative.length,
    coreStatCount: core.length,
    coreNonZeroCount: coreNonZero.length,
    quality,
    sampleCore: core.map(x => ({ title: norm(x?.title), homeValue: norm(x?.homeValue), awayValue: norm(x?.awayValue) }))
  };
}

const seedUrl = `${BASE}/match-centre/${seed.competitionId}/${seed.sourceSeason}/${seed.seedFixtureId}?tab=Match-Stats`;
const seedPage = await fetchText(seedUrl);
if (!seedPage.ok) throw new Error(`Seed page HTTP ${seedPage.status}`);
const buildId = extractNextData(seedPage.text).buildId;
if (!buildId) throw new Error('buildId missing');

async function inspect(candidateId) {
  const url = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${seed.competitionId}/${seed.sourceSeason}/${candidateId}.json?tab=Match-Stats&comp=${seed.competitionId}&season=${seed.sourceSeason}&fixture=${candidateId}`;
  try {
    const r = await fetchText(url);
    if (!r.ok) return { candidateId, kind: 'http_non_ok', status: r.status };
    let data;
    try { data = JSON.parse(r.text); } catch { return { candidateId, kind: 'non_json', status: r.status }; }
    const md = data?.pageProps?.matchData;
    const f = md?.getFixtureItem;
    if (!f) return { candidateId, kind: 'no_fixture', status: r.status };
    const fixtureId = norm(f.fixtureId || f.id || candidateId);
    const comp = norm(f.compId || f.competitionId || seed.competitionId);
    const season = norm(f.season || seed.sourceSeason);
    if (fixtureId !== String(candidateId) || comp !== seed.competitionId || season !== seed.sourceSeason) {
      return { candidateId, kind: 'other', status: r.status };
    }
    const audit = statsAudit(md);
    return {
      candidateId,
      kind: 'match',
      status: r.status,
      fixtureId,
      competitionId: comp,
      season,
      competitionName: norm(f.compName),
      dateTime: norm(f.dateTime),
      round: norm(f.round),
      group: norm(f.group),
      homeTeam: norm(f?.homeTeam?.name),
      homeScore: norm(f?.homeTeam?.score),
      awayTeam: norm(f?.awayTeam?.name),
      awayScore: norm(f?.awayTeam?.score),
      ...audit,
      commentaryPresent: Array.isArray(md?.allMatchCommentary) ? md.allMatchCommentary.length > 0 : Boolean(md?.allMatchCommentary),
      pointsSummaryPresent: Boolean(md?.allMatchStatsSummary?.pointsSummary),
      lineupPresent: Boolean(md?.allMatchStatsSummary?.lineUp),
      dataUrl: url,
    };
  } catch (error) {
    return { candidateId, kind: 'error', status: 0, error: String(error) };
  }
}

const start = Number(seed.seedFixtureId) - RADIUS;
const end = Number(seed.seedFixtureId) + RADIUS;
const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i);
const scanned = new Array(ids.length);
let cursor = 0;
async function worker() {
  while (true) {
    const i = cursor++;
    if (i >= ids.length) return;
    scanned[i] = await inspect(ids[i]);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

const fixtures = scanned.filter(x => x?.kind === 'match').sort((a,b) => a.dateTime.localeCompare(b.dateTime) || Number(a.fixtureId) - Number(b.fixtureId));
const qualityCounts = {};
for (const f of fixtures) qualityCounts[f.quality] = (qualityCounts[f.quality] || 0) + 1;
const kindCounts = {};
for (const x of scanned) kindCounts[x?.kind || 'unknown'] = (kindCounts[x?.kind || 'unknown'] || 0) + 1;
const roundCounts = {};
for (const f of fixtures) roundCounts[f.round || f.group || '(blank)'] = (roundCounts[f.round || f.group || '(blank)'] || 0) + 1;

await fs.writeFile(path.join(OUT_DIR, 'fixtures.json'), JSON.stringify(fixtures, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'scan.json'), JSON.stringify(scanned, null, 2));

const summary = {
  audit: 'Hong Kong 2016 legacy reconstruction plus effective Match Stats density QA',
  catalogSchemaVersion: catalog.schemaVersion,
  seed: { ...seed, seedUrl, buildId },
  scannedCandidateCount: scanned.length,
  scanMinFixtureId: start,
  scanMaxFixtureId: end,
  kindCounts,
  reconstructedFixtureCount: fixtures.length,
  minMatchedFixtureId: fixtures.length ? Math.min(...fixtures.map(x => Number(x.fixtureId))) : null,
  maxMatchedFixtureId: fixtures.length ? Math.max(...fixtures.map(x => Number(x.fixtureId))) : null,
  firstDateTime: fixtures[0]?.dateTime || null,
  lastDateTime: fixtures.at(-1)?.dateTime || null,
  uniqueTeamCount: new Set(fixtures.flatMap(x => [x.homeTeam, x.awayTeam]).filter(Boolean)).size,
  roundCounts,
  statsPresentCount: fixtures.filter(x => x.statCount > 0).length,
  statsQualityCounts: qualityCounts,
  richStatsCount: fixtures.filter(x => x.quality === 'rich').length,
  sparseStatsCount: fixtures.filter(x => x.quality === 'sparse').length,
  scoreOnlyOrZeroStatsCount: fixtures.filter(x => x.quality === 'score_only_or_zero').length,
  commentaryPresentCount: fixtures.filter(x => x.commentaryPresent).length,
  pointsSummaryPresentCount: fixtures.filter(x => x.pointsSummaryPresent).length,
  lineupPresentCount: fixtures.filter(x => x.lineupPresent).length,
  lowestCoreDensityFixtures: [...fixtures].sort((a,b) => a.coreNonZeroCount - b.coreNonZeroCount).slice(0, 10).map(x => ({
    fixtureId: x.fixtureId, dateTime: x.dateTime, homeTeam: x.homeTeam, awayTeam: x.awayTeam,
    statCount: x.statCount, informativeStatCount: x.informativeStatCount, coreNonZeroCount: x.coreNonZeroCount, quality: x.quality,
    sampleCore: x.sampleCore
  })),
  capturedAt: new Date().toISOString()
};
await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
