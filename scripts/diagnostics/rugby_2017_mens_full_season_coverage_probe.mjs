import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-2017-mens-full-season-coverage';
const SOURCE_SEASON = '2017';
const CONCURRENCY = 8;
await fs.mkdir(OUT_DIR, { recursive: true });

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
};
const norm = v => v == null ? '' : String(v).trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Official 2016-17 men's Series denominator: 10 events.
// Rugby.com.au sourceSeason is 2017, including Dubai/Cape Town played in Dec 2016.
const EVENTS = [
  { key:'2017-M-DXB', event:'Dubai 7s', competitionId:'251', seedFixtureId:'31218', seedStatus:'verified_search_index' },
  { key:'2017-M-CPT', event:'Cape Town 7s', competitionId:'252', seedFixtureId:'37392', seedStatus:'verified_search_index' },
  { key:'2017-M-WLG', event:'Wellington 7s', competitionId:'253', seedFixtureId:'37459', seedStatus:'verified_existing' },
  { key:'2017-M-SYD', event:'Sydney 7s', competitionId:'254', seedFixtureId:'37549', seedStatus:'verified_search_index' },
  { key:'2017-M-LAS', event:'Las Vegas 7s', competitionId:'255', discoverRange:[37550,37720], seedStatus:'pending_sparse_discovery' },
  { key:'2017-M-VAN', event:'Vancouver 7s', competitionId:'256', discoverRange:[37550,37720], seedStatus:'pending_sparse_discovery' },
  { key:'2017-M-HKG', event:'Hong Kong 7s', competitionId:'257', seedFixtureId:'37719', seedStatus:'verified_existing' },
  { key:'2017-M-SIN', event:'Singapore 7s', competitionId:'258', seedFixtureId:'37769', seedStatus:'verified_search_index' },
  { key:'2017-M-PAR', event:'Paris 7s', competitionId:'259', discoverRange:[37780,38020], seedStatus:'pending_sparse_discovery' },
  { key:'2017-M-LON', event:'London 7s', competitionId:'260', discoverRange:[37780,38020], seedStatus:'pending_sparse_discovery' },
];

async function fetchText(url) {
  const r = await fetch(url, { headers, redirect:'follow' });
  return { ok:r.ok, status:r.status, text:await r.text(), url:r.url };
}
function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}
function zeroLike(v) {
  const s = norm(v).toUpperCase().replace(/\s+/g,'');
  return !s || ['0','0%','0/0','N/A','NA','-','NULL','NONE'].includes(s);
}
const CORE = new Set([
  'Metres','Carries','Defenders Beaten','Clean Breaks','Passes','Offloads','Turnovers Conceded',
  'Tackles','Missed Tackles','Turnovers Won','Kicks in Play','Rucks Won','Rucks Lost','Possession','Penalties Conceded'
]);
function statsAudit(md) {
  const play = md?.allMatchStatsSummary?.playSummary || {};
  const items = Object.values(play).flatMap(xs => Array.isArray(xs) ? xs : []);
  const core = items.filter(x => CORE.has(norm(x?.title)));
  const coreNonZero = core.filter(x => !zeroLike(x?.homeValue) || !zeroLike(x?.awayValue));
  let quality = 'no_stats';
  if (items.length) {
    quality = 'score_only_or_zero';
    if (coreNonZero.length >= 8) quality = 'rich';
    else if (coreNonZero.length >= 3) quality = 'sparse';
  }
  return { statCount:items.length, coreStatCount:core.length, coreNonZeroCount:coreNonZero.length, quality };
}

const buildSeed = EVENTS.find(e => e.key === '2017-M-HKG');
const buildSeedUrl = `${BASE}/match-centre/${buildSeed.competitionId}/${SOURCE_SEASON}/${buildSeed.seedFixtureId}?tab=Match-Stats`;
const buildPage = await fetchText(buildSeedUrl);
if (!buildPage.ok) throw new Error(`build seed HTTP ${buildPage.status}`);
const buildId = extractNextData(buildPage.text).buildId;
if (!buildId) throw new Error('buildId missing');

async function inspectFixture(compId, fixtureId) {
  const url = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${compId}/${SOURCE_SEASON}/${fixtureId}.json?tab=Match-Stats&comp=${compId}&season=${SOURCE_SEASON}&fixture=${fixtureId}`;
  try {
    const r = await fetchText(url);
    if (!r.ok) return { kind:'http_non_ok', status:r.status, fixtureId };
    let data; try { data = JSON.parse(r.text); } catch { return { kind:'non_json', status:r.status, fixtureId }; }
    const md = data?.pageProps?.matchData;
    const f = md?.getFixtureItem;
    if (!f) return { kind:'no_fixture', status:r.status, fixtureId };
    const actualFixtureId = norm(f.fixtureId || f.id || fixtureId);
    const actualComp = norm(f.compId || f.competitionId || compId);
    const season = norm(f.season || SOURCE_SEASON);
    if (actualFixtureId !== String(fixtureId) || actualComp !== String(compId) || season !== SOURCE_SEASON) {
      return { kind:'other', status:r.status, fixtureId, actualFixtureId, actualComp, season };
    }
    const audit = statsAudit(md);
    return {
      kind:'match', status:r.status, fixtureId:actualFixtureId, competitionId:actualComp, season,
      competitionName:norm(f.compName), dateTime:norm(f.dateTime), round:norm(f.round), group:norm(f.group),
      homeTeam:norm(f?.homeTeam?.name), awayTeam:norm(f?.awayTeam?.name),
      ...audit,
      commentaryPresent:Array.isArray(md?.allMatchCommentary) ? md.allMatchCommentary.length > 0 : Boolean(md?.allMatchCommentary),
      pointsSummaryPresent:Boolean(md?.allMatchStatsSummary?.pointsSummary),
      lineupPresent:Boolean(md?.allMatchStatsSummary?.lineUp),
    };
  } catch (error) {
    return { kind:'error', status:0, fixtureId, error:String(error) };
  }
}

async function sparseDiscover(event) {
  if (event.seedFixtureId) return { seedFixtureId:String(event.seedFixtureId), discovery:'preverified' };
  const [lo,hi] = event.discoverRange;
  const sampled = [];
  for (let id=lo; id<=hi; id+=5) sampled.push(id);
  let cursor = 0;
  const results = new Array(sampled.length);
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= sampled.length) return;
      results[i] = await inspectFixture(event.competitionId, sampled[i]);
      if (i % 12 === 0) await sleep(20);
    }
  }
  await Promise.all(Array.from({length:CONCURRENCY}, () => worker()));
  const hit = results.find(x => x?.kind === 'match');
  return {
    seedFixtureId: hit ? String(hit.fixtureId) : null,
    discovery: hit ? 'sparse_scan_hit' : 'sparse_scan_miss',
    sampledCount: sampled.length,
    matchHits: results.filter(x => x?.kind === 'match').map(x => x.fixtureId),
  };
}

async function reconstruct(event, seedFixtureId) {
  if (!seedFixtureId) return { ...event, resolvedSeedFixtureId:null, error:'seed_not_found', fixtures:[] };
  const centre = Number(seedFixtureId);
  const ids = Array.from({length:181}, (_,i) => centre - 90 + i);
  let cursor = 0;
  const results = new Array(ids.length);
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= ids.length) return;
      results[i] = await inspectFixture(event.competitionId, ids[i]);
      if (i % 15 === 0) await sleep(20);
    }
  }
  await Promise.all(Array.from({length:CONCURRENCY}, () => worker()));
  const fixtures = results.filter(x => x?.kind === 'match').sort((a,b) => norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId)-Number(b.fixtureId));
  const q = {};
  for (const f of fixtures) q[f.quality] = (q[f.quality]||0)+1;
  return {
    ...event,
    resolvedSeedFixtureId:String(seedFixtureId),
    reconstructedFixtureCount:fixtures.length,
    minFixtureId:fixtures.length ? Math.min(...fixtures.map(x=>Number(x.fixtureId))) : null,
    maxFixtureId:fixtures.length ? Math.max(...fixtures.map(x=>Number(x.fixtureId))) : null,
    firstDateTime:fixtures[0]?.dateTime || null,
    lastDateTime:fixtures.at(-1)?.dateTime || null,
    statsQualityCounts:q,
    richStatsCount:fixtures.filter(x=>x.quality==='rich').length,
    sparseStatsCount:fixtures.filter(x=>x.quality==='sparse').length,
    scoreOnlyOrZeroStatsCount:fixtures.filter(x=>x.quality==='score_only_or_zero').length,
    noStatsCount:fixtures.filter(x=>x.quality==='no_stats').length,
    commentaryPresentCount:fixtures.filter(x=>x.commentaryPresent).length,
    pointsSummaryPresentCount:fixtures.filter(x=>x.pointsSummaryPresent).length,
    lineupPresentCount:fixtures.filter(x=>x.lineupPresent).length,
    fixtures,
  };
}

const discovery = [];
const audits = [];
for (const event of EVENTS) {
  const d = await sparseDiscover(event);
  discovery.push({ key:event.key, event:event.event, competitionId:event.competitionId, ...d });
  audits.push(await reconstruct(event, d.seedFixtureId));
  await sleep(80);
}

const eventSummary = audits.map(a => ({
  key:a.key, event:a.event, competitionId:a.competitionId, resolvedSeedFixtureId:a.resolvedSeedFixtureId,
  error:a.error || null, reconstructedFixtureCount:a.reconstructedFixtureCount || 0,
  firstDateTime:a.firstDateTime || null, lastDateTime:a.lastDateTime || null,
  statsQualityCounts:a.statsQualityCounts || {}, richStatsCount:a.richStatsCount || 0,
  sparseStatsCount:a.sparseStatsCount || 0, scoreOnlyOrZeroStatsCount:a.scoreOnlyOrZeroStatsCount || 0,
  noStatsCount:a.noStatsCount || 0, commentaryPresentCount:a.commentaryPresentCount || 0,
  pointsSummaryPresentCount:a.pointsSummaryPresentCount || 0, lineupPresentCount:a.lineupPresentCount || 0,
}));

const officialEventCount = EVENTS.length;
const discoveredEventCount = eventSummary.filter(x=>x.resolvedSeedFixtureId).length;
const reconstructedEventCount = eventSummary.filter(x=>x.reconstructedFixtureCount>0).length;
const reconstructedFixtureCount = eventSummary.reduce((s,x)=>s+x.reconstructedFixtureCount,0);
const richStatsCount = eventSummary.reduce((s,x)=>s+x.richStatsCount,0);
const sparseStatsCount = eventSummary.reduce((s,x)=>s+x.sparseStatsCount,0);
const scoreOnlyOrZeroStatsCount = eventSummary.reduce((s,x)=>s+x.scoreOnlyOrZeroStatsCount,0);
const noStatsCount = eventSummary.reduce((s,x)=>s+x.noStatsCount,0);
const analysisReadyCount = richStatsCount + sparseStatsCount;
const summary = {
  audit:'2016-17 World Rugby Sevens Series men: official 10-event denominator vs Rugby.com.au recoverable Match Stats coverage',
  canonicalSeriesSeason:'2016-17',
  sourceSeason:SOURCE_SEASON,
  officialEventCount,
  discoveredEventCount,
  reconstructedEventCount,
  completeEventCoverage:reconstructedEventCount === officialEventCount,
  reconstructedFixtureCount,
  richStatsCount,
  sparseStatsCount,
  scoreOnlyOrZeroStatsCount,
  noStatsCount,
  analysisReadyCount,
  analysisReadyFixtureRatio:reconstructedFixtureCount ? analysisReadyCount/reconstructedFixtureCount : null,
  seasonTrendEligibility:reconstructedEventCount === officialEventCount ? 'coverage_complete_quality_review_required' : 'not_yet_complete',
  discovery,
  eventSummary,
  buildId,
  capturedAt:new Date().toISOString(),
};
await fs.writeFile(path.join(OUT_DIR,'summary.json'), JSON.stringify(summary,null,2));
await fs.writeFile(path.join(OUT_DIR,'events.json'), JSON.stringify(audits,null,2));
console.log(JSON.stringify(summary,null,2));
