import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const RESULTS_URL = `${BASE}/fixtures-results?team=All&comp=All&tab=Results`;
const GQL_URL = 'https://rugby-au-cms.graphcdn.app/';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-historical-coverage-matrix';
const MIN_SOURCE_SEASON = 2017; // 2016-17. Hard lower boundary.
const MAX_SOURCE_SEASON = 2026; // 2025-26.
const BASELINE_SOURCE_SEASON = 2026;
const REQUEST_LIMIT = 100;
const MAX_PAGES_PER_TEAM = 100;
const MAX_TEAMS_PER_GENDER = 80;
const DETAIL_CONCURRENCY = 4;

const SEEDS = {
  Men: { comp: '257', season: '2017', fixture: '37719' },
  Women: { comp: '261', season: '2017', fixture: '31250' },
};

await fs.mkdir(OUT_DIR, { recursive: true });

const norm = (v) => v == null ? '' : String(v).trim();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const numericSeason = (v) => /^\d{4}$/.test(norm(v)) ? Number(v) : null;
const canonicalSeason = (sourceSeason) => {
  const y = numericSeason(sourceSeason);
  return y ? `${y - 1}-${String(y).slice(-2)}` : '';
};
function csvEscape(v) {
  const s = norm(v);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
function toCsv(rows) { return rows.map(r => r.map(csvEscape).join(',')).join('\n'); }
function nonEmpty(v) {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return Boolean(norm(v));
}

async function fetchResponse(url, init = {}, attempts = 5) {
  let last = null;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const r = await fetch(url, {
        ...init,
        headers: {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
          'accept-language': 'en-US,en;q=0.9',
          ...(init.headers || {}),
        },
        redirect: 'follow',
      });
      const text = await r.text();
      last = { ok: r.ok, status: r.status, text, url: r.url, headers: r.headers };
      if (r.ok) return last;
      if (![408, 425, 429, 500, 502, 503, 504].includes(r.status)) return last;
    } catch (error) {
      last = { ok: false, status: 0, text: '', url, error: String(error) };
    }
    await sleep(400 * (2 ** attempt));
  }
  return last;
}

function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}

function classifyCompetition(label) {
  const s = norm(label).toLowerCase();
  const excludedReason =
    /challenger/.test(s) ? 'challenger' :
    /olympic/.test(s) ? 'olympic' :
    /world cup/.test(s) ? 'world_cup' :
    /commonwealth/.test(s) ? 'commonwealth' :
    /asia|asian games|rugby europe|oceania|africa/.test(s) ? 'regional' :
    /qualif/.test(s) ? 'qualifier' :
    '';
  const seriesLike = /svns|world rugby sevens series|sevens world series|world sevens series|hsbc sevens series|irb sevens world series/i.test(label);
  const gender = /women|womens|women's/i.test(label) ? 'Women' : /men|mens|men's/i.test(label) ? 'Men' : '';
  return { scope: seriesLike && !excludedReason ? 'series_target' : 'other_sevens', excludedReason, gender };
}

function collectCompetitionLikeObjects(value, currentPath = '$', out = [], depth = 0) {
  if (value == null || depth > 18) return out;
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectCompetitionLikeObjects(v, `${currentPath}[${i}]`, out, depth + 1));
    return out;
  }
  if (typeof value !== 'object') return out;
  const label = norm(value.label || value.name || value.title || value.compName || value.competitionName);
  const rawId = value.value ?? value.id ?? value.compId ?? value.competitionId;
  const id = rawId == null ? '' : norm(rawId);
  if (label && /^\d+$/.test(id) && /(?:svns|sevens|7s)/i.test(label)) out.push({ path: currentPath, id, label });
  for (const [k, v] of Object.entries(value)) {
    if (v && typeof v === 'object') collectCompetitionLikeObjects(v, `${currentPath}.${k}`, out, depth + 1);
  }
  return out;
}

function scalar(v) { return ['string', 'number', 'boolean'].includes(typeof v) ? v : null; }
function firstScalar(obj, keys) {
  for (const key of keys) {
    const v = obj?.[key];
    if (scalar(v) !== null) return norm(v);
  }
  return '';
}
function nestedName(v) {
  if (!v || typeof v !== 'object') return '';
  return norm(v.name || v.displayName || v.teamName || v.title || v.label);
}
function nestedId(v) {
  if (!v || typeof v !== 'object') return '';
  return firstScalar(v, ['teamId', 'teamID', 'id', 'team_id']);
}

function collectFixtureCandidates(value, out = [], currentPath = '$', depth = 0) {
  if (value == null || depth > 20) return out;
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectFixtureCandidates(v, out, `${currentPath}[${i}]`, depth + 1));
    return out;
  }
  if (typeof value !== 'object') return out;
  const season = firstScalar(value, ['season', 'seasonId', 'seasonID']);
  const dateTime = firstScalar(value, ['dateTime', 'datetime', 'startDateTime', 'startTime', 'date']);
  const id = firstScalar(value, ['fixtureId', 'fixtureID', 'matchId', 'matchID', 'id']);
  const hasTeams = Boolean(value.homeTeam || value.awayTeam || value.teamA || value.teamB);
  if (season && dateTime && id && (hasTeams || /fixture|match/i.test(norm(value.__typename)))) {
    const compId = firstScalar(value, ['compId', 'competitionId', 'competitionID']) || firstScalar(value.competition || {}, ['id', 'compId', 'competitionId']);
    const compName = firstScalar(value, ['compName', 'competitionName']) || nestedName(value.competition);
    const homeObj = value.homeTeam || value.teamA;
    const awayObj = value.awayTeam || value.teamB;
    out.push({
      path: currentPath,
      fixtureId: id,
      season,
      dateTime,
      competitionId: compId,
      competitionName: compName,
      homeTeamId: nestedId(homeObj),
      homeTeam: nestedName(homeObj),
      awayTeamId: nestedId(awayObj),
      awayTeam: nestedName(awayObj),
      typename: norm(value.__typename),
    });
  }
  for (const [k, v] of Object.entries(value)) {
    if (v && typeof v === 'object') collectFixtureCandidates(v, out, `${currentPath}.${k}`, depth + 1);
  }
  return out;
}

function dedupeFixtures(xs) {
  const m = new Map();
  for (const x of xs) {
    const key = `${x.fixtureId}|${x.season}|${x.dateTime}`;
    if (!m.has(key)) m.set(key, x);
  }
  return [...m.values()];
}

function isTargetSeriesFixture(x, gender, currentTargetCompIds) {
  const y = numericSeason(x.season);
  if (y == null || y < MIN_SOURCE_SEASON || y > MAX_SOURCE_SEASON) return false;
  const text = `${x.competitionName} ${x.homeTeam} ${x.awayTeam}`;
  if (/challenger|olympic|world cup|commonwealth|asian games|asia rugby|rugby europe|oceania|africa|qualif/i.test(text)) return false;
  const women = /women|womens|women's/i.test(text);
  if (gender === 'Women' && !women) return false;
  if (gender === 'Men' && women) return false;
  const knownCurrentComp = currentTargetCompIds.has(norm(x.competitionId));
  const seriesName = /svns|world rugby sevens series|sevens world series|world sevens series|hsbc.*sevens|irb.*sevens|\b7s\b/i.test(text);
  return knownCurrentComp || seriesName;
}

async function discoverSurface() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  let gqlTemplate = null;
  page.on('request', req => {
    if (gqlTemplate || !req.url().includes('rugby-au-cms.graphcdn.app')) return;
    try {
      const body = JSON.parse(req.postData() || '');
      if (body?.operationName === 'FixturesAndResults' && body?.query) gqlTemplate = body;
    } catch {}
  });

  await page.goto(RESULTS_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  const html = await page.content();
  const next = extractNextData(html);
  const buildId = norm(next.buildId);
  const found = collectCompetitionLikeObjects(next);
  const domOptions = await page.locator('option, [role="option"]').evaluateAll(els => els.map(e => ({
    text: (e.textContent || '').trim(),
    value: e.getAttribute('value') || e.getAttribute('data-value') || '',
  }))).catch(() => []);
  for (const x of domOptions) {
    if (/(?:svns|sevens|7s)/i.test(x.text) && /^\d+$/.test(x.value)) found.push({ path: '$.dom', id: x.value, label: x.text });
  }
  if (!gqlTemplate) {
    await page.goto(`${BASE}/fixtures-results?team=All&comp=257&tab=Results`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(6000);
  }
  await browser.close();
  if (!gqlTemplate) throw new Error('FixturesAndResults GraphQL template not captured');
  if (!buildId) throw new Error('Next.js buildId not found');

  const byId = new Map();
  for (const x of found) {
    const c = { ...x, ...classifyCompetition(x.label) };
    if (!byId.has(x.id)) byId.set(x.id, c);
    else if (c.scope === 'series_target' && byId.get(x.id).scope !== 'series_target') byId.set(x.id, c);
  }
  const filters = [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id));
  const targets = filters.filter(x => x.scope === 'series_target');
  return { buildId, gqlTemplate, filters, targets, targetCompIds: new Set(targets.map(x => x.id)) };
}

async function postGraphQL(body) {
  const r = await fetchResponse(GQL_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  }, 5);
  if (!r?.ok) throw new Error(`GraphQL HTTP ${r?.status || 0}: ${norm(r?.text).slice(0, 500)}`);
  let data;
  try { data = JSON.parse(r.text); }
  catch { throw new Error(`GraphQL non-JSON: ${r.text.slice(0, 500)}`); }
  return { data, textLength: r.text.length };
}

async function getMatchData(buildId, compId, season, fixtureId) {
  if (numericSeason(season) < MIN_SOURCE_SEASON) throw new Error(`PROHIBITED_PRE_BOUNDARY_FIXTURE:${season}/${fixtureId}`);
  const makeUrl = (b) => `${BASE}/_next/data/${encodeURIComponent(b)}/match-centre/${compId}/${season}/${fixtureId}.json?tab=Match-Stats&comp=${compId}&season=${season}&fixture=${fixtureId}`;
  let activeBuildId = buildId;
  let url = makeUrl(activeBuildId);
  let r = await fetchResponse(url, { headers: { accept: 'application/json' } }, 5);
  if (!r?.ok) {
    const pageUrl = `${BASE}/match-centre/${compId}/${season}/${fixtureId}?tab=Match-Stats`;
    const page = await fetchResponse(pageUrl, {}, 4);
    if (page?.ok) {
      try {
        const next = extractNextData(page.text);
        if (next?.buildId) {
          activeBuildId = norm(next.buildId);
          url = makeUrl(activeBuildId);
          r = await fetchResponse(url, { headers: { accept: 'application/json' } }, 5);
        }
      } catch {}
    }
  }
  if (!r?.ok) throw new Error(`Match data HTTP ${r?.status || 0} for ${compId}/${season}/${fixtureId}: ${norm(r?.text).slice(0, 240)}`);
  let json;
  try { json = JSON.parse(r.text); }
  catch { throw new Error(`Match data non-JSON for ${compId}/${season}/${fixtureId}`); }
  return { json, dataUrl: url, buildId: activeBuildId };
}

async function seedTeams(surface, gender) {
  const seed = SEEDS[gender];
  const { json } = await getMatchData(surface.buildId, seed.comp, seed.season, seed.fixture);
  const f = json?.pageProps?.matchData?.getFixtureItem || {};
  const teams = [
    { id: nestedId(f.homeTeam), name: nestedName(f.homeTeam), side: 'home' },
    { id: nestedId(f.awayTeam), name: nestedName(f.awayTeam), side: 'away' },
  ].filter(x => x.id);
  if (!teams.length) throw new Error(`No ${gender} seed team IDs found for ${seed.comp}/${seed.season}/${seed.fixture}`);
  return { seed, teams, competitionName: norm(f.compName), dateTime: norm(f.dateTime) };
}

async function paginateTeam(template, teamId, gender, currentTargetCompIds) {
  const seen = new Map();
  const pages = [];
  const failures = [];
  let skip = 0;
  let noNew = 0;
  for (let pageIndex = 0; pageIndex < MAX_PAGES_PER_TEAM; pageIndex++) {
    try {
      const body = structuredClone(template);
      body.variables = {
        ...(body.variables || {}),
        comps: [],
        teams: [String(teamId)],
        type: 'results',
        skip,
        limit: REQUEST_LIMIT,
      };
      const result = await postGraphQL(body);
      const candidates = dedupeFixtures(collectFixtureCandidates(result.data));
      let eligibleOnPage = 0;
      let olderOnPage = 0;
      let newCount = 0;
      for (const x of candidates) {
        const y = numericSeason(x.season);
        if (y != null && y < MIN_SOURCE_SEASON) { olderOnPage++; continue; }
        if (!isTargetSeriesFixture(x, gender, currentTargetCompIds)) continue;
        eligibleOnPage++;
        const key = `${x.fixtureId}|${x.season}|${x.dateTime}`;
        if (!seen.has(key)) {
          seen.set(key, { ...x, gender, discoveredViaTeamId: String(teamId) });
          newCount++;
        }
      }
      pages.push({ pageIndex, skip, candidateCount: candidates.length, eligibleOnPage, olderOnPage, newCount, responseLength: result.textLength });
      if (!candidates.length) break;
      noNew = newCount ? 0 : noNew + 1;
      if (olderOnPage > 0 && eligibleOnPage === 0) break;
      if (noNew >= 2 && eligibleOnPage === 0) break;
      skip += Math.max(1, candidates.length);
      await sleep(50);
    } catch (error) {
      failures.push({ teamId: String(teamId), gender, skip, error: String(error) });
      break;
    }
  }
  return { fixtures: [...seen.values()], pages, failures };
}

async function discoverByTeamGraph(surface, gender) {
  const seedInfo = await seedTeams(surface, gender);
  const queue = seedInfo.teams.map(x => ({ id: x.id, name: x.name, discoveredFrom: 'seed' }));
  const queued = new Set(queue.map(x => x.id));
  const processed = new Set();
  const teamReports = [];
  const fixtureMap = new Map();
  const failures = [];

  while (queue.length && processed.size < MAX_TEAMS_PER_GENDER) {
    const team = queue.shift();
    if (!team?.id || processed.has(team.id)) continue;
    processed.add(team.id);
    const result = await paginateTeam(surface.gqlTemplate, team.id, gender, surface.targetCompIds);
    failures.push(...result.failures);
    let addedTeams = 0;
    for (const x of result.fixtures) {
      const key = `${x.fixtureId}|${x.season}|${x.dateTime}`;
      if (!fixtureMap.has(key)) fixtureMap.set(key, x);
      for (const candidate of [
        { id: x.homeTeamId, name: x.homeTeam },
        { id: x.awayTeamId, name: x.awayTeam },
      ]) {
        if (!candidate.id || queued.has(candidate.id) || processed.has(candidate.id)) continue;
        queued.add(candidate.id);
        queue.push({ ...candidate, discoveredFrom: x.fixtureId });
        addedTeams++;
      }
    }
    teamReports.push({ team, fixtureCount: result.fixtures.length, addedTeams, pages: result.pages });
    await sleep(80);
  }

  return {
    gender,
    seedInfo,
    processedTeamCount: processed.size,
    queuedTeamCount: queued.size,
    maxTeamLimitReached: processed.size >= MAX_TEAMS_PER_GENDER && queue.length > 0,
    fixtures: [...fixtureMap.values()],
    teamReports,
    failures,
  };
}

function zeroLike(v) {
  const s = norm(v).toUpperCase().replace(/\s+/g, '');
  return !s || ['0', '0%', '0/0', 'N/A', 'NA', '-', 'NULL', 'NONE'].includes(s);
}
const CORE_STATS = new Set([
  'Metres', 'Carries', 'Defenders Beaten', 'Clean Breaks', 'Passes', 'Offloads', 'Turnovers Conceded',
  'Tackles', 'Missed Tackles', 'Turnovers Won', 'Kicks in Play', 'Rucks Won', 'Rucks Lost', 'Possession', 'Penalties Conceded',
]);
function flattenStats(playSummary) {
  return Object.entries(playSummary || {}).flatMap(([category, xs]) => Array.isArray(xs) ? xs.map(x => ({
    category,
    id: norm(x?.id),
    title: norm(x?.title),
    homeValue: norm(x?.homeValue),
    awayValue: norm(x?.awayValue),
  })) : []);
}
function statsAudit(playSummary) {
  const items = flattenStats(playSummary);
  if (!items.length) return { quality: 'no_stats', statCount: 0, informativeStatCount: 0, coreNonZeroCount: 0, items };
  const core = items.filter(x => CORE_STATS.has(x.title));
  const coreNonZero = core.filter(x => !zeroLike(x.homeValue) || !zeroLike(x.awayValue));
  const informative = items.filter(x => !zeroLike(x.homeValue) || !zeroLike(x.awayValue));
  let quality = 'score_only_or_zero';
  if (coreNonZero.length >= 8) quality = 'rich';
  else if (coreNonZero.length >= 3) quality = 'sparse';
  return { quality, statCount: items.length, informativeStatCount: informative.length, coreNonZeroCount: coreNonZero.length, items };
}

function normalizedPath(pathStr) { return pathStr.replace(/\[\d+\]/g, '[]'); }
function shapePaths(value, currentPath = '$', out = new Set(), depth = 0) {
  if (value == null || depth > 6 || out.size >= 1000) return out;
  if (Array.isArray(value)) {
    out.add(`${normalizedPath(currentPath)}[]`);
    for (const item of value.slice(0, 8)) shapePaths(item, `${currentPath}[]`, out, depth + 1);
    return out;
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      const p = `${currentPath}.${k}`;
      out.add(normalizedPath(p));
      shapePaths(v, p, out, depth + 1);
    }
    return out;
  }
  out.add(`${normalizedPath(currentPath)}:<${typeof value}>`);
  return out;
}
function unionInto(set, values) { for (const v of values) set.add(v); }
function increment(map, key, n = 1) { if (key) map[key] = (map[key] || 0) + n; }

async function inspectFixture(surface, fixture) {
  const y = numericSeason(fixture.season);
  if (y == null || y < MIN_SOURCE_SEASON) throw new Error(`PROHIBITED_PRE_BOUNDARY_FIXTURE:${fixture.season}/${fixture.fixtureId}`);
  if (y > MAX_SOURCE_SEASON) throw new Error(`OUT_OF_RANGE_FIXTURE:${fixture.season}/${fixture.fixtureId}`);
  if (!/^\d+$/.test(norm(fixture.competitionId))) throw new Error(`MISSING_COMP_ID:${fixture.fixtureId}`);
  const { json, dataUrl } = await getMatchData(surface.buildId, fixture.competitionId, fixture.season, fixture.fixtureId);
  const md = json?.pageProps?.matchData;
  const f = md?.getFixtureItem;
  if (!md || !f) throw new Error(`MISSING_MATCH_DATA:${fixture.fixtureId}`);
  const actualSeason = norm(f.season || fixture.season);
  if (numericSeason(actualSeason) < MIN_SOURCE_SEASON) throw new Error(`PROHIBITED_RESPONSE_SEASON:${actualSeason}`);
  const summary = md?.allMatchStatsSummary || {};
  const audit = statsAudit(summary?.playSummary);
  return {
    fixtureId: norm(f.id || f.fixtureId || fixture.fixtureId),
    competitionId: norm(f.compId || fixture.competitionId),
    competitionName: norm(f.compName) || fixture.competitionName,
    sourceSeason: actualSeason,
    canonicalSeason: canonicalSeason(actualSeason),
    gender: fixture.gender,
    dateTime: norm(f.dateTime) || fixture.dateTime,
    quality: audit.quality,
    statCount: audit.statCount,
    informativeStatCount: audit.informativeStatCount,
    coreNonZeroCount: audit.coreNonZeroCount,
    statTitles: [...new Set(audit.items.map(x => x.title).filter(Boolean))],
    statCategories: [...new Set(audit.items.map(x => x.category).filter(Boolean))],
    pointsPresent: nonEmpty(summary?.pointsSummary),
    lineupPresent: nonEmpty(summary?.lineUp),
    commentaryPresent: nonEmpty(md?.allMatchCommentary),
    allSeasonStatPresent: nonEmpty(md?.allSeasonStat),
    refereesPresent: nonEmpty(summary?.referees),
    fixtureMetaPresent: nonEmpty(f?.fixtureMeta),
    matchDataKeys: Object.keys(md).sort(),
    statsSummaryKeys: Object.keys(summary).sort(),
    fixtureKeys: Object.keys(f).sort(),
    pointsShape: [...shapePaths(summary?.pointsSummary)],
    lineupShape: [...shapePaths(summary?.lineUp)],
    commentaryShape: [...shapePaths(md?.allMatchCommentary)],
    allSeasonStatShape: [...shapePaths(md?.allSeasonStat)],
    refereesShape: [...shapePaths(summary?.referees)],
    fixtureMetaShape: [...shapePaths(f?.fixtureMeta)],
    fixtureShape: [...shapePaths(f)],
    dataUrl,
  };
}

function createAggregate(sourceSeason, gender) {
  return {
    sourceSeason,
    canonicalSeason: canonicalSeason(sourceSeason),
    gender,
    fixtureCount: 0,
    detailSuccessCount: 0,
    detailFailureCount: 0,
    richStatsCount: 0,
    sparseStatsCount: 0,
    scoreOnlyOrZeroStatsCount: 0,
    noStatsCount: 0,
    pointsSummaryCount: 0,
    lineupCount: 0,
    commentaryCount: 0,
    allSeasonStatCount: 0,
    refereesCount: 0,
    fixtureMetaCount: 0,
    eventKeys: new Set(),
    statTitles: new Set(),
    matchDataKeys: new Set(),
    statsSummaryKeys: new Set(),
    fixtureKeys: new Set(),
    pointsShape: new Set(),
    lineupShape: new Set(),
    commentaryShape: new Set(),
    allSeasonStatShape: new Set(),
    refereesShape: new Set(),
    fixtureMetaShape: new Set(),
    fixtureShape: new Set(),
  };
}
function coverage(set, baseline) {
  if (!baseline || baseline.size === 0) return { baselineCount: 0, observedCount: set.size, intersectionCount: 0, baselineCoverageRatio: null, extraCount: set.size };
  const intersection = [...baseline].filter(x => set.has(x)).length;
  return {
    baselineCount: baseline.size,
    observedCount: set.size,
    intersectionCount: intersection,
    baselineCoverageRatio: intersection / baseline.size,
    extraCount: [...set].filter(x => !baseline.has(x)).length,
  };
}

const surface = await discoverSurface();
const menGraph = await discoverByTeamGraph(surface, 'Men');
const womenGraph = await discoverByTeamGraph(surface, 'Women');
const discoveryFailures = [...menGraph.failures, ...womenGraph.failures];

const fixtureMap = new Map();
for (const graph of [menGraph, womenGraph]) {
  for (const x of graph.fixtures) {
    const key = `${x.fixtureId}|${x.season}|${x.dateTime}`;
    if (!fixtureMap.has(key)) fixtureMap.set(key, x);
  }
}
const fixtures = [...fixtureMap.values()].sort((a, b) => Number(a.season) - Number(b.season) || a.gender.localeCompare(b.gender) || norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId) - Number(b.fixtureId));

const seasonMap = new Map();
const eventMap = new Map();
for (const f of fixtures) {
  const skey = `${f.season}|${f.gender}`;
  if (!seasonMap.has(skey)) seasonMap.set(skey, createAggregate(f.season, f.gender));
  seasonMap.get(skey).fixtureCount++;
  const eventKey = `${f.season}|${f.gender}|${f.competitionId}|${f.competitionName}`;
  seasonMap.get(skey).eventKeys.add(eventKey);
  if (!eventMap.has(eventKey)) eventMap.set(eventKey, {
    eventKey,
    sourceSeason: f.season,
    canonicalSeason: canonicalSeason(f.season),
    gender: f.gender,
    competitionId: f.competitionId,
    competitionName: f.competitionName,
    fixtureCount: 0,
    detailSuccessCount: 0,
    richStatsCount: 0,
    sparseStatsCount: 0,
    scoreOnlyOrZeroStatsCount: 0,
    noStatsCount: 0,
    pointsSummaryCount: 0,
    lineupCount: 0,
    commentaryCount: 0,
    allSeasonStatCount: 0,
    refereesCount: 0,
    fixtureMetaCount: 0,
    firstDateTime: f.dateTime,
    lastDateTime: f.dateTime,
  });
  const e = eventMap.get(eventKey);
  e.fixtureCount++;
  if (f.dateTime && (!e.firstDateTime || f.dateTime < e.firstDateTime)) e.firstDateTime = f.dateTime;
  if (f.dateTime && (!e.lastDateTime || f.dateTime > e.lastDateTime)) e.lastDateTime = f.dateTime;
}

const details = new Array(fixtures.length);
const detailFailures = [];
let cursor = 0;
async function detailWorker() {
  while (true) {
    const i = cursor++;
    if (i >= fixtures.length) return;
    try {
      details[i] = await inspectFixture(surface, fixtures[i]);
    } catch (error) {
      detailFailures.push({ fixture: fixtures[i], error: String(error) });
      details[i] = null;
    }
    await sleep(70);
  }
}
await Promise.all(Array.from({ length: DETAIL_CONCURRENCY }, () => detailWorker()));

const successful = details.filter(Boolean);
for (const d of successful) {
  const skey = `${d.sourceSeason}|${d.gender}`;
  if (!seasonMap.has(skey)) seasonMap.set(skey, createAggregate(d.sourceSeason, d.gender));
  const a = seasonMap.get(skey);
  a.detailSuccessCount++;
  if (d.quality === 'rich') a.richStatsCount++;
  else if (d.quality === 'sparse') a.sparseStatsCount++;
  else if (d.quality === 'score_only_or_zero') a.scoreOnlyOrZeroStatsCount++;
  else if (d.quality === 'no_stats') a.noStatsCount++;
  if (d.pointsPresent) a.pointsSummaryCount++;
  if (d.lineupPresent) a.lineupCount++;
  if (d.commentaryPresent) a.commentaryCount++;
  if (d.allSeasonStatPresent) a.allSeasonStatCount++;
  if (d.refereesPresent) a.refereesCount++;
  if (d.fixtureMetaPresent) a.fixtureMetaCount++;
  unionInto(a.statTitles, d.statTitles);
  unionInto(a.matchDataKeys, d.matchDataKeys);
  unionInto(a.statsSummaryKeys, d.statsSummaryKeys);
  unionInto(a.fixtureKeys, d.fixtureKeys);
  unionInto(a.pointsShape, d.pointsShape);
  unionInto(a.lineupShape, d.lineupShape);
  unionInto(a.commentaryShape, d.commentaryShape);
  unionInto(a.allSeasonStatShape, d.allSeasonStatShape);
  unionInto(a.refereesShape, d.refereesShape);
  unionInto(a.fixtureMetaShape, d.fixtureMetaShape);
  unionInto(a.fixtureShape, d.fixtureShape);

  const eventKey = `${d.sourceSeason}|${d.gender}|${d.competitionId}|${d.competitionName}`;
  const e = eventMap.get(eventKey);
  if (e) {
    e.detailSuccessCount++;
    if (d.quality === 'rich') e.richStatsCount++;
    else if (d.quality === 'sparse') e.sparseStatsCount++;
    else if (d.quality === 'score_only_or_zero') e.scoreOnlyOrZeroStatsCount++;
    else if (d.quality === 'no_stats') e.noStatsCount++;
    if (d.pointsPresent) e.pointsSummaryCount++;
    if (d.lineupPresent) e.lineupCount++;
    if (d.commentaryPresent) e.commentaryCount++;
    if (d.allSeasonStatPresent) e.allSeasonStatCount++;
    if (d.refereesPresent) e.refereesCount++;
    if (d.fixtureMetaPresent) e.fixtureMetaCount++;
  }
}
for (const a of seasonMap.values()) a.detailFailureCount = Math.max(0, a.fixtureCount - a.detailSuccessCount);

const baselines = {
  Men: seasonMap.get(`${BASELINE_SOURCE_SEASON}|Men`) || null,
  Women: seasonMap.get(`${BASELINE_SOURCE_SEASON}|Women`) || null,
};

const seasonRows = [];
for (const a of [...seasonMap.values()].sort((x, y) => Number(x.sourceSeason) - Number(y.sourceSeason) || x.gender.localeCompare(y.gender))) {
  const b = baselines[a.gender];
  const baselineComparison = {
    statTitles: coverage(a.statTitles, b?.statTitles),
    fixtureSchema: coverage(a.fixtureShape, b?.fixtureShape),
    pointsSchema: coverage(a.pointsShape, b?.pointsShape),
    lineupSchema: coverage(a.lineupShape, b?.lineupShape),
    commentarySchema: coverage(a.commentaryShape, b?.commentaryShape),
    allSeasonStatSchema: coverage(a.allSeasonStatShape, b?.allSeasonStatShape),
    refereesSchema: coverage(a.refereesShape, b?.refereesShape),
    fixtureMetaSchema: coverage(a.fixtureMetaShape, b?.fixtureMetaShape),
  };
  seasonRows.push({
    sourceSeason: a.sourceSeason,
    canonicalSeason: a.canonicalSeason,
    gender: a.gender,
    discoveredEventCount: a.eventKeys.size,
    fixtureCount: a.fixtureCount,
    detailSuccessCount: a.detailSuccessCount,
    detailFailureCount: a.detailFailureCount,
    richStatsCount: a.richStatsCount,
    sparseStatsCount: a.sparseStatsCount,
    scoreOnlyOrZeroStatsCount: a.scoreOnlyOrZeroStatsCount,
    noStatsCount: a.noStatsCount,
    analysisReadyStatsRatio: a.detailSuccessCount ? (a.richStatsCount + a.sparseStatsCount) / a.detailSuccessCount : null,
    pointsSummaryCount: a.pointsSummaryCount,
    pointsSummaryRatio: a.detailSuccessCount ? a.pointsSummaryCount / a.detailSuccessCount : null,
    lineupCount: a.lineupCount,
    lineupRatio: a.detailSuccessCount ? a.lineupCount / a.detailSuccessCount : null,
    commentaryCount: a.commentaryCount,
    commentaryRatio: a.detailSuccessCount ? a.commentaryCount / a.detailSuccessCount : null,
    allSeasonStatCount: a.allSeasonStatCount,
    allSeasonStatRatio: a.detailSuccessCount ? a.allSeasonStatCount / a.detailSuccessCount : null,
    refereesCount: a.refereesCount,
    refereesRatio: a.detailSuccessCount ? a.refereesCount / a.detailSuccessCount : null,
    fixtureMetaCount: a.fixtureMetaCount,
    fixtureMetaRatio: a.detailSuccessCount ? a.fixtureMetaCount / a.detailSuccessCount : null,
    statTitleCount: a.statTitles.size,
    baselineComparison,
    statTitles: [...a.statTitles].sort(),
    matchDataKeys: [...a.matchDataKeys].sort(),
    statsSummaryKeys: [...a.statsSummaryKeys].sort(),
    fixtureKeys: [...a.fixtureKeys].sort(),
    allSeasonStatShape: [...a.allSeasonStatShape].sort(),
    refereesShape: [...a.refereesShape].sort(),
    fixtureMetaShape: [...a.fixtureMetaShape].sort(),
  });
}

const eventRows = [...eventMap.values()].sort((a, b) => Number(a.sourceSeason) - Number(b.sourceSeason) || a.gender.localeCompare(b.gender) || norm(a.firstDateTime).localeCompare(norm(b.firstDateTime)));
const knownMatchDataKeys = new Set(['getFixtureItem', 'allMatchStatsSummary', 'allMatchCommentary', 'allSeasonStat']);
const otherKeyFrequency = {};
const summaryKeyFrequency = {};
const fixtureKeyFrequency = {};
for (const d of successful) {
  for (const k of d.matchDataKeys) if (!knownMatchDataKeys.has(k)) increment(otherKeyFrequency, k);
  for (const k of d.statsSummaryKeys) increment(summaryKeyFrequency, k);
  for (const k of d.fixtureKeys) increment(fixtureKeyFrequency, k);
}

const coverageCsv = [[
  'source_season','canonical_season','gender','discovered_event_count','fixture_count','detail_success','detail_failure',
  'rich_stats','sparse_stats','score_only_or_zero','no_stats','analysis_ready_stats_ratio',
  'points_summary_count','points_summary_ratio','lineup_count','lineup_ratio','commentary_count','commentary_ratio',
  'all_season_stat_count','all_season_stat_ratio','referees_count','referees_ratio','fixture_meta_count','fixture_meta_ratio','stat_title_count',
  'stat_schema_vs_2025_26','fixture_schema_vs_2025_26','points_schema_vs_2025_26','lineup_schema_vs_2025_26','commentary_schema_vs_2025_26',
  'all_season_stat_schema_vs_2025_26','referees_schema_vs_2025_26','fixture_meta_schema_vs_2025_26'
]];
for (const x of seasonRows) coverageCsv.push([
  x.sourceSeason,x.canonicalSeason,x.gender,x.discoveredEventCount,x.fixtureCount,x.detailSuccessCount,x.detailFailureCount,
  x.richStatsCount,x.sparseStatsCount,x.scoreOnlyOrZeroStatsCount,x.noStatsCount,x.analysisReadyStatsRatio,
  x.pointsSummaryCount,x.pointsSummaryRatio,x.lineupCount,x.lineupRatio,x.commentaryCount,x.commentaryRatio,
  x.allSeasonStatCount,x.allSeasonStatRatio,x.refereesCount,x.refereesRatio,x.fixtureMetaCount,x.fixtureMetaRatio,x.statTitleCount,
  x.baselineComparison.statTitles.baselineCoverageRatio,
  x.baselineComparison.fixtureSchema.baselineCoverageRatio,
  x.baselineComparison.pointsSchema.baselineCoverageRatio,
  x.baselineComparison.lineupSchema.baselineCoverageRatio,
  x.baselineComparison.commentarySchema.baselineCoverageRatio,
  x.baselineComparison.allSeasonStatSchema.baselineCoverageRatio,
  x.baselineComparison.refereesSchema.baselineCoverageRatio,
  x.baselineComparison.fixtureMetaSchema.baselineCoverageRatio,
]);

const eventCsv = [[
  'source_season','canonical_season','gender','competition_id','competition_name','fixture_count','detail_success','rich_stats','sparse_stats',
  'score_only_or_zero','no_stats','points_summary','lineup','commentary','all_season_stat','referees','fixture_meta','first_datetime','last_datetime'
]];
for (const e of eventRows) eventCsv.push([
  e.sourceSeason,e.canonicalSeason,e.gender,e.competitionId,e.competitionName,e.fixtureCount,e.detailSuccessCount,e.richStatsCount,e.sparseStatsCount,
  e.scoreOnlyOrZeroStatsCount,e.noStatsCount,e.pointsSummaryCount,e.lineupCount,e.commentaryCount,e.allSeasonStatCount,e.refereesCount,e.fixtureMetaCount,e.firstDateTime,e.lastDateTime,
]);

const summary = {
  audit: 'SVNS / World Rugby Sevens Series historical data coverage matrix via team-graph discovery',
  hardBoundary: {
    earliestCanonicalSeason: '2016-17',
    earliestSourceSeason: MIN_SOURCE_SEASON,
    rule: 'No fixture-detail request is permitted for sourceSeason < 2017. Team GraphQL discovery discards pre-boundary records and stops when it reaches the boundary.',
  },
  latestCanonicalSeason: '2025-26',
  latestSourceSeason: MAX_SOURCE_SEASON,
  baselineCanonicalSeason: '2025-26',
  baselineSourceSeason: BASELINE_SOURCE_SEASON,
  discoveryMethod: 'BFS over Series team IDs starting from one verified 2016-17 men seed and one verified 2016-17 women seed; every discovered Series opponent team is queried once.',
  currentCompetitionFilterCount: surface.filters.length,
  currentSeriesTargetFilterCount: surface.targets.length,
  menProcessedTeamCount: menGraph.processedTeamCount,
  womenProcessedTeamCount: womenGraph.processedTeamCount,
  menTeamLimitReached: menGraph.maxTeamLimitReached,
  womenTeamLimitReached: womenGraph.maxTeamLimitReached,
  discoveredFixtureCountWithinBoundary: fixtures.length,
  detailSuccessCount: successful.length,
  detailFailureCount: detailFailures.length,
  discoveryFailureCount: discoveryFailures.length,
  seasonGenderRows: seasonRows,
  legacyCrossChecks: {
    men2016_17ExpectedFixtureCount: 450,
    men2016_17DiscoveredFixtureCount: seasonMap.get('2017|Men')?.fixtureCount || 0,
    men2016_17DiscoveryMatchesKnownFullSeason: (seasonMap.get('2017|Men')?.fixtureCount || 0) === 450,
  },
  otherMatchDataKeys: Object.entries(otherKeyFrequency).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0])).map(([key,count]) => ({ key, count })),
  allMatchStatsSummaryKeyFrequency: Object.entries(summaryKeyFrequency).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0])).map(([key,count]) => ({ key, count })),
  fixtureItemKeyFrequency: Object.entries(fixtureKeyFrequency).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0])).map(([key,count]) => ({ key, count })),
  capturedAt: new Date().toISOString(),
};

await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'coverage-matrix.csv'), toCsv(coverageCsv));
await fs.writeFile(path.join(OUT_DIR, 'event-coverage.csv'), toCsv(eventCsv));
await fs.writeFile(path.join(OUT_DIR, 'team-discovery.json'), JSON.stringify({
  Men: { seedInfo: menGraph.seedInfo, processedTeamCount: menGraph.processedTeamCount, maxTeamLimitReached: menGraph.maxTeamLimitReached, teamReports: menGraph.teamReports },
  Women: { seedInfo: womenGraph.seedInfo, processedTeamCount: womenGraph.processedTeamCount, maxTeamLimitReached: womenGraph.maxTeamLimitReached, teamReports: womenGraph.teamReports },
}, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'schema-diff.json'), JSON.stringify(seasonRows.map(x => ({
  sourceSeason:x.sourceSeason, canonicalSeason:x.canonicalSeason, gender:x.gender,
  baselineComparison:x.baselineComparison, statTitles:x.statTitles, matchDataKeys:x.matchDataKeys,
  statsSummaryKeys:x.statsSummaryKeys, fixtureKeys:x.fixtureKeys,
})), null, 2));
await fs.writeFile(path.join(OUT_DIR, 'other-match-data-keys.json'), JSON.stringify({
  otherMatchDataKeys: summary.otherMatchDataKeys,
  allMatchStatsSummaryKeyFrequency: summary.allMatchStatsSummaryKeyFrequency,
  fixtureItemKeyFrequency: summary.fixtureItemKeyFrequency,
  seasonGenderExtraShapes: seasonRows.map(x => ({
    sourceSeason:x.sourceSeason, canonicalSeason:x.canonicalSeason, gender:x.gender,
    allSeasonStatShape:x.allSeasonStatShape,
    refereesShape:x.refereesShape,
    fixtureMetaShape:x.fixtureMetaShape,
  })),
}, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'detail-failures.json'), JSON.stringify(detailFailures, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'discovery-failures.json'), JSON.stringify(discoveryFailures, null, 2));

console.log(JSON.stringify({
  audit: summary.audit,
  hardBoundary: summary.hardBoundary,
  discoveryMethod: summary.discoveryMethod,
  menProcessedTeamCount: summary.menProcessedTeamCount,
  womenProcessedTeamCount: summary.womenProcessedTeamCount,
  discoveredFixtureCountWithinBoundary: summary.discoveredFixtureCountWithinBoundary,
  detailSuccessCount: summary.detailSuccessCount,
  detailFailureCount: summary.detailFailureCount,
  discoveryFailureCount: summary.discoveryFailureCount,
  legacyCrossChecks: summary.legacyCrossChecks,
  seasonGenderRows: seasonRows.map(x => ({
    season:x.canonicalSeason, sourceSeason:x.sourceSeason, gender:x.gender, events:x.discoveredEventCount, fixtures:x.fixtureCount,
    detailSuccess:x.detailSuccessCount, rich:x.richStatsCount, sparse:x.sparseStatsCount, zero:x.scoreOnlyOrZeroStatsCount, noStats:x.noStatsCount,
    points:`${x.pointsSummaryCount}/${x.detailSuccessCount}`,
    lineup:`${x.lineupCount}/${x.detailSuccessCount}`,
    commentary:`${x.commentaryCount}/${x.detailSuccessCount}`,
    allSeasonStat:`${x.allSeasonStatCount}/${x.detailSuccessCount}`,
    referees:`${x.refereesCount}/${x.detailSuccessCount}`,
    fixtureMeta:`${x.fixtureMetaCount}/${x.detailSuccessCount}`,
    statSchemaVs2026:x.baselineComparison.statTitles.baselineCoverageRatio,
    fixtureSchemaVs2026:x.baselineComparison.fixtureSchema.baselineCoverageRatio,
    pointsSchemaVs2026:x.baselineComparison.pointsSchema.baselineCoverageRatio,
    lineupSchemaVs2026:x.baselineComparison.lineupSchema.baselineCoverageRatio,
    commentarySchemaVs2026:x.baselineComparison.commentarySchema.baselineCoverageRatio,
  })),
  allMatchStatsSummaryKeyFrequency: summary.allMatchStatsSummaryKeyFrequency,
  fixtureItemKeyFrequency: summary.fixtureItemKeyFrequency,
}, null, 2));
