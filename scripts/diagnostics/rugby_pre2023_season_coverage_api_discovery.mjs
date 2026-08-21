import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const RESULTS_URL = `${BASE}/fixtures-results?team=All&comp=All&tab=Results`;
const GQL_URL = 'https://rugby-au-cms.graphcdn.app/';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-pre2023-season-coverage-api-discovery';
const CATALOG_PATH = process.env.CATALOG_PATH || './legacy-sevens-seed-catalog.json';
const SCAN_RADIUS = 160;
const CONCURRENCY = 6;

await fs.mkdir(OUT_DIR, { recursive: true });
const catalog = JSON.parse(await fs.readFile(CATALOG_PATH, 'utf8'));

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
};
const norm = v => v == null ? '' : String(v).trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchText(url, init = {}) {
  const r = await fetch(url, { ...init, headers: { ...headers, ...(init.headers || {}) }, redirect: 'follow' });
  const text = await r.text();
  return { ok: r.ok, status: r.status, text, url: r.url, contentType: r.headers.get('content-type') || '' };
}
function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}
function uniq(xs) { return [...new Set(xs)]; }
function compactSnippet(text, index, radius = 260) {
  return text.slice(Math.max(0, index - radius), Math.min(text.length, index + radius)).replace(/\s+/g, ' ');
}

async function discoverApiSurface() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const gqlRequests = [];

  page.on('request', req => {
    if (!req.url().includes('rugby-au-cms.graphcdn.app')) return;
    const raw = req.postData() || '';
    try {
      const body = JSON.parse(raw);
      gqlRequests.push({
        operationName: body?.operationName || '',
        variables: body?.variables || {},
        query: body?.query || '',
      });
    } catch {}
  });

  await page.goto(RESULTS_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(7000);
  const html = await page.content();
  const scriptSrcs = uniq(await page.locator('script[src]').evaluateAll(els => els.map(e => e.src).filter(Boolean)));

  const variants = [];
  for (const [name, qs] of [
    ['season2017', 'team=All&comp=All&tab=Results&season=2017'],
    ['year2017', 'team=All&comp=All&tab=Results&year=2017'],
    ['season2022', 'team=All&comp=All&tab=Results&season=2022'],
    ['year2022', 'team=All&comp=All&tab=Results&year=2022'],
  ]) {
    const before = gqlRequests.length;
    await page.goto(`${BASE}/fixtures-results?${qs}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3500);
    const links = await page.locator('a[href*="/match-centre/"]').evaluateAll(els => [...new Set(els.map(a => a.getAttribute('href')).filter(Boolean))]).catch(() => []);
    const newReqs = gqlRequests.slice(before);
    variants.push({
      name,
      finalUrl: page.url(),
      linkCount: links.length,
      legacyLinkCount: links.filter(x => /\/match-centre\/\d+\/(?:19|20(?:0\d|1\d|2[0-2]))\//.test(x)).length,
      graphQlRequests: newReqs.map(x => ({ operationName: x.operationName, variables: x.variables })),
    });
  }

  await browser.close();

  const bundleReports = [];
  const relevantTerms = ['FixturesAndResults', 'getFixtureItems', 'seasonId', 'seasonID', 'season:', 'season', 'year:', 'year'];
  for (const src of scriptSrcs.filter(x => x.startsWith(BASE) && /\/_next\/static\//.test(x)).slice(0, 90)) {
    try {
      const r = await fetchText(src);
      if (!r.ok) continue;
      const lower = r.text.toLowerCase();
      if (!(lower.includes('fixture') || lower.includes('result') || lower.includes('match'))) continue;
      const hits = [];
      for (const term of relevantTerms) {
        let start = 0;
        while (hits.length < 18) {
          const idx = r.text.indexOf(term, start);
          if (idx < 0) break;
          hits.push({ term, snippet: compactSnippet(r.text, idx) });
          start = idx + term.length;
        }
      }
      if (hits.length) bundleReports.push({ src, bodyLength: r.text.length, hits });
    } catch {}
  }

  const introspectionQuery = `query SeasonCoverageIntrospection {
    __schema {
      queryType {
        fields {
          name
          args {
            name
            type { kind name ofType { kind name ofType { kind name } } }
          }
        }
      }
    }
  }`;
  let introspection = { ok: false, status: null, error: null, queryFields: [], seasonArgumentCandidates: [] };
  try {
    const r = await fetchText(GQL_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ operationName: 'SeasonCoverageIntrospection', query: introspectionQuery, variables: {} }),
    });
    const parsed = JSON.parse(r.text);
    const fields = parsed?.data?.__schema?.queryType?.fields || [];
    const candidates = fields.filter(f => {
      const name = norm(f?.name).toLowerCase();
      const args = (f?.args || []).map(a => norm(a?.name).toLowerCase());
      return /fixture|result|match|competition|season/.test(name) || args.some(a => /season|year|date|fixture|competition|comp|team/.test(a));
    });
    introspection = {
      ok: r.ok && fields.length > 0,
      status: r.status,
      errors: parsed?.errors || [],
      queryFieldCount: fields.length,
      queryFields: candidates,
      seasonArgumentCandidates: candidates.filter(f => (f.args || []).some(a => /season|year/i.test(norm(a.name)))),
    };
  } catch (error) {
    introspection = { ok: false, status: null, error: String(error), queryFields: [], seasonArgumentCandidates: [] };
  }

  const fixturesRequests = gqlRequests.filter(x => x.operationName === 'FixturesAndResults');
  const fixturesTemplate = fixturesRequests[0] || null;
  return {
    capturedGraphQlRequestCount: gqlRequests.length,
    fixturesAndResultsCaptured: Boolean(fixturesTemplate),
    fixturesAndResultsVariables: fixturesTemplate?.variables || null,
    fixturesAndResultsQueryRelevantLines: fixturesTemplate?.query
      ? fixturesTemplate.query.split('\n').filter(line => /query FixturesAndResults|season|year|skip|limit|comp|team|getFixtureItems|dateTime/i.test(line)).slice(0, 80)
      : [],
    urlVariants: variants,
    scriptCount: scriptSrcs.length,
    bundleReports,
    introspection,
  };
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
  let quality = 'no_stats';
  if (items.length) {
    quality = 'score_only_or_zero';
    if (coreNonZero.length >= 8) quality = 'rich';
    else if (coreNonZero.length >= 3) quality = 'sparse';
  }
  return { statCount: items.length, informativeStatCount: informative.length, coreStatCount: core.length, coreNonZeroCount: coreNonZero.length, quality };
}

async function reconstructSeedEvent(seed) {
  const seedUrl = `${BASE}/match-centre/${seed.competitionId}/${seed.sourceSeason}/${seed.seedFixtureId}?tab=Match-Stats`;
  const seedPage = await fetchText(seedUrl);
  if (!seedPage.ok) return { seed, seedUrl, error: `seed_http_${seedPage.status}`, fixtures: [] };
  let buildId;
  try { buildId = extractNextData(seedPage.text).buildId; }
  catch (error) { return { seed, seedUrl, error: String(error), fixtures: [] }; }
  if (!buildId) return { seed, seedUrl, error: 'build_id_missing', fixtures: [] };

  const start = Number(seed.seedFixtureId) - SCAN_RADIUS;
  const end = Number(seed.seedFixtureId) + SCAN_RADIUS;
  const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const results = new Array(ids.length);
  let cursor = 0;

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
      if (fixtureId !== String(candidateId) || comp !== seed.competitionId || season !== seed.sourceSeason) return { candidateId, kind: 'other', status: r.status };
      const audit = statsAudit(md);
      return {
        candidateId, kind: 'match', status: r.status,
        fixtureId, competitionId: comp, season,
        competitionName: norm(f.compName), dateTime: norm(f.dateTime), round: norm(f.round), group: norm(f.group),
        homeTeam: norm(f?.homeTeam?.name), awayTeam: norm(f?.awayTeam?.name),
        ...audit,
        commentaryPresent: Array.isArray(md?.allMatchCommentary) ? md.allMatchCommentary.length > 0 : Boolean(md?.allMatchCommentary),
        pointsSummaryPresent: Boolean(md?.allMatchStatsSummary?.pointsSummary),
        lineupPresent: Boolean(md?.allMatchStatsSummary?.lineUp),
      };
    } catch (error) { return { candidateId, kind: 'error', status: 0, error: String(error) }; }
  }

  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= ids.length) return;
      results[i] = await inspect(ids[i]);
      if (i % 30 === 0) await sleep(25);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  const fixtures = results.filter(x => x?.kind === 'match').sort((a,b) => norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId)-Number(b.fixtureId));
  const q = {};
  for (const f of fixtures) q[f.quality] = (q[f.quality] || 0) + 1;
  return {
    seed, seedUrl, buildId,
    reconstructedFixtureCount: fixtures.length,
    firstDateTime: fixtures[0]?.dateTime || null,
    lastDateTime: fixtures.at(-1)?.dateTime || null,
    minFixtureId: fixtures.length ? Math.min(...fixtures.map(x => Number(x.fixtureId))) : null,
    maxFixtureId: fixtures.length ? Math.max(...fixtures.map(x => Number(x.fixtureId))) : null,
    statsQualityCounts: q,
    richStatsCount: fixtures.filter(x => x.quality === 'rich').length,
    sparseStatsCount: fixtures.filter(x => x.quality === 'sparse').length,
    scoreOnlyOrZeroStatsCount: fixtures.filter(x => x.quality === 'score_only_or_zero').length,
    noStatsCount: fixtures.filter(x => x.quality === 'no_stats').length,
    commentaryPresentCount: fixtures.filter(x => x.commentaryPresent).length,
    pointsSummaryPresentCount: fixtures.filter(x => x.pointsSummaryPresent).length,
    lineupPresentCount: fixtures.filter(x => x.lineupPresent).length,
    fixtures,
  };
}

const apiDiscovery = await discoverApiSurface();
const legacySeeds = (catalog.seeds || []).filter(x => Number(x.sourceSeason) <= 2022);
const eventAudits = [];
for (const seed of legacySeeds) {
  eventAudits.push(await reconstructSeedEvent(seed));
  await sleep(120);
}

const seasonMap = new Map();
for (const e of eventAudits) {
  const season = norm(e?.seed?.sourceSeason);
  const gender = norm(e?.seed?.gender) || 'Unknown';
  const key = `${season}|${gender}`;
  if (!seasonMap.has(key)) seasonMap.set(key, {
    sourceSeason: season, gender,
    catalogEventCount: 0, reconstructedEventCount: 0, reconstructedFixtureCount: 0,
    richStatsCount: 0, sparseStatsCount: 0, scoreOnlyOrZeroStatsCount: 0, noStatsCount: 0,
    commentaryPresentCount: 0, pointsSummaryPresentCount: 0, lineupPresentCount: 0,
    eventKeys: [], seasonTrendEligibility: 'undetermined', coverageReason: 'seed_catalog_not_complete',
  });
  const s = seasonMap.get(key);
  s.catalogEventCount++;
  s.eventKeys.push(e?.seed?.eventKey || '');
  if (!e.error && e.reconstructedFixtureCount > 0) s.reconstructedEventCount++;
  s.reconstructedFixtureCount += e.reconstructedFixtureCount || 0;
  s.richStatsCount += e.richStatsCount || 0;
  s.sparseStatsCount += e.sparseStatsCount || 0;
  s.scoreOnlyOrZeroStatsCount += e.scoreOnlyOrZeroStatsCount || 0;
  s.noStatsCount += e.noStatsCount || 0;
  s.commentaryPresentCount += e.commentaryPresentCount || 0;
  s.pointsSummaryPresentCount += e.pointsSummaryPresentCount || 0;
  s.lineupPresentCount += e.lineupPresentCount || 0;
}
const seasonCoverageObserved = [...seasonMap.values()].sort((a,b) => a.sourceSeason.localeCompare(b.sourceSeason) || a.gender.localeCompare(b.gender));

const eventSummary = eventAudits.map(e => ({
  eventKey: e?.seed?.eventKey,
  sourceSeason: e?.seed?.sourceSeason,
  gender: e?.seed?.gender,
  event: e?.seed?.event,
  competitionId: e?.seed?.competitionId,
  seedFixtureId: e?.seed?.seedFixtureId,
  error: e.error || null,
  reconstructedFixtureCount: e.reconstructedFixtureCount || 0,
  firstDateTime: e.firstDateTime || null,
  lastDateTime: e.lastDateTime || null,
  statsQualityCounts: e.statsQualityCounts || {},
  richStatsCount: e.richStatsCount || 0,
  sparseStatsCount: e.sparseStatsCount || 0,
  scoreOnlyOrZeroStatsCount: e.scoreOnlyOrZeroStatsCount || 0,
  noStatsCount: e.noStatsCount || 0,
  commentaryPresentCount: e.commentaryPresentCount || 0,
  pointsSummaryPresentCount: e.pointsSummaryPresentCount || 0,
  lineupPresentCount: e.lineupPresentCount || 0,
}));

await fs.writeFile(path.join(OUT_DIR, 'api-discovery.json'), JSON.stringify(apiDiscovery, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'event-audits.json'), JSON.stringify(eventAudits, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'season-coverage-observed.json'), JSON.stringify(seasonCoverageObserved, null, 2));

const summary = {
  audit: 'Season/year API discovery plus pre-2023 observed season coverage audit',
  catalogSchemaVersion: catalog.schemaVersion,
  legacySeedCount: legacySeeds.length,
  apiDiscovery: {
    capturedGraphQlRequestCount: apiDiscovery.capturedGraphQlRequestCount,
    fixturesAndResultsCaptured: apiDiscovery.fixturesAndResultsCaptured,
    fixturesAndResultsVariables: apiDiscovery.fixturesAndResultsVariables,
    fixturesAndResultsQueryRelevantLines: apiDiscovery.fixturesAndResultsQueryRelevantLines,
    urlVariants: apiDiscovery.urlVariants,
    scriptCount: apiDiscovery.scriptCount,
    bundleReportCount: apiDiscovery.bundleReports.length,
    bundleReports: apiDiscovery.bundleReports.slice(0, 12),
    introspection: apiDiscovery.introspection,
  },
  eventSummary,
  seasonCoverageObserved,
  note: 'seasonCoverageObserved is not yet a complete historical season denominator. seasonTrendEligibility remains undetermined until the official event calendar / complete seed catalog for each season is established.',
  capturedAt: new Date().toISOString(),
};
await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
