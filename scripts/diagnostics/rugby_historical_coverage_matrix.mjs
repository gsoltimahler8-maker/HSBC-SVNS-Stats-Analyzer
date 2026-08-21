import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const RESULTS_URL = `${BASE}/fixtures-results?team=All&comp=All&tab=Results`;
const GQL_URL = 'https://rugby-au-cms.graphcdn.app/';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-historical-coverage-matrix';
const MIN_SOURCE_SEASON = 2017; // 2016-17. Never inspect fixture detail before this boundary.
const MAX_SOURCE_SEASON = 2026; // 2025-26.
const BASELINE_SOURCE_SEASON = 2026;
const REQUEST_LIMIT = 100;
const MAX_PAGES_PER_COMP = 100;
const DETAIL_CONCURRENCY = 10;

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
    /asia|asian games/.test(s) ? 'regional' :
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

function inferGender(x) {
  if (x.filterGender) return x.filterGender;
  const s = `${x.competitionName} ${x.homeTeam} ${x.awayTeam}`;
  return /women|womens|women's/i.test(s) ? 'Women' : 'Men';
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
    else {
      const prev = byId.get(x.id);
      if (c.scope === 'series_target' && prev.scope !== 'series_target') byId.set(x.id, c);
      else if (c.label.length > prev.label.length) byId.set(x.id, { ...c, scope: prev.scope === 'series_target' ? 'series_target' : c.scope });
    }
  }
  const filters = [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id));
  return { buildId, gqlTemplate, filters, targets: filters.filter(x => x.scope === 'series_target') };
}

async function postGraphQL(body) {
  const r = await fetch(GQL_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`GraphQL HTTP ${r.status}: ${text.slice(0, 500)}`);
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`GraphQL non-JSON: ${text.slice(0, 500)}`); }
  return { data, textLength: text.length };
}

async function paginateCompetition(template, comp, sourceType) {
  const seen = new Map();
  const pages = [];
  const failures = [];
  let skip = 0;
  let noNew = 0;
  for (let pageIndex = 0; pageIndex < MAX_PAGES_PER_COMP; pageIndex++) {
    try {
      const body = structuredClone(template);
      const compVar = sourceType == null ? { id: String(comp.id) } : { id: String(comp.id), sourceType: String(sourceType) };
      body.variables = {
        ...(body.variables || {}),
        comps: [compVar],
        teams: [],
        type: 'results',
        skip,
        limit: REQUEST_LIMIT,
      };
      const result = await postGraphQL(body);
      const candidates = dedupeFixtures(collectFixtureCandidates(result.data));
      let newCount = 0;
      let eligibleOnPage = 0;
      let olderOnPage = 0;
      for (const x of candidates) {
        const y = numericSeason(x.season);
        if (y != null && y < MIN_SOURCE_SEASON) { olderOnPage++; continue; }
        if (y != null && y > MAX_SOURCE_SEASON) continue;
        if (y == null) continue;
        eligibleOnPage++;
        const key = `${x.fixtureId}|${x.season}|${x.dateTime}`;
        if (!seen.has(key)) {
          seen.set(key, { ...x, filterCompetitionId: comp.id, filterLabel: comp.label, filterGender: comp.gender, sourceType: sourceType == null ? 'omitted' : String(sourceType) });
          newCount++;
        }
      }
      pages.push({ pageIndex, skip, candidateCount: candidates.length, eligibleOnPage, olderOnPage, newCount, responseLength: result.textLength });
      if (!candidates.length) break;
      noNew = newCount ? 0 : noNew + 1;
      if (noNew >= 2 && eligibleOnPage === 0) break;
      if (olderOnPage > 0 && eligibleOnPage === 0) break;
      skip += Math.max(1, candidates.length);
      await sleep(40);
    } catch (error) {
      failures.push({ competitionId: comp.id, label: comp.label, sourceType: sourceType == null ? 'omitted' : String(sourceType), skip, error: String(error) });
      break;
    }
  }
  return { fixtures: [...seen.values()], pages, failures };
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
  if (!items.length) return { quality: 'no_stats', statCount: 0, informativeStatCount: 0, coreStatCount: 0, coreNonZeroCount: 0, items };
  const core = items.filter(x => CORE_STATS.has(x.title));
  const coreNonZero = core.filter(x => !zeroLike(x.homeValue) || !zeroLike(x.awayValue));
  const informative = items.filter(x => !zeroLike(x.homeValue) || !zeroLike(x.awayValue));
  let quality = 'score_only_or_zero';
  if (coreNonZero.length >= 8) quality = 'rich';
  else if (coreNonZero.length >= 3) quality = 'sparse';
  return { quality, statCount: items.length, informativeStatCount: informative.length, coreStatCount: core.length, coreNonZeroCount: coreNonZero.length, items };
}

function normalizedPath(pathStr) { return pathStr.replace(/\[\d+\]/g, '[]'); }
function shapePaths(value, currentPath = '$', out = new Set(), depth = 0) {
  if (value == null || depth > 6 || out.size >= 800) return out;
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

function increment(map, key, n = 1) { if (key) map[key] = (map[key] || 0) + n; }
function unionInto(set, values) { for (const v of values) set.add(v); }

async function fetchText(url) {
  const r = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
      accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}: ${text.slice(0, 300)}`);
  return text;
}

async function inspectFixture(buildId, fixture) {
  const y = numericSeason(fixture.season);
  if (y == null || y < MIN_SOURCE_SEASON) throw new Error(`PROHIBITED_PRE_BOUNDARY_FIXTURE:${fixture.season}/${fixture.fixtureId}`);
  if (y > MAX_SOURCE_SEASON) throw new Error(`OUT_OF_RANGE_FIXTURE:${fixture.season}/${fixture.fixtureId}`);
  const compCandidates = [...new Set([fixture.competitionId, fixture.filterCompetitionId].filter(x => /^\d+$/.test(norm(x))))];
  let lastError = null;
  for (const compId of compCandidates) {
    const dataUrl = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${compId}/${fixture.season}/${fixture.fixtureId}.json?tab=Match-Stats&comp=${compId}&season=${fixture.season}&fixture=${fixture.fixtureId}`;
    try {
      const raw = JSON.parse(await fetchText(dataUrl));
      const md = raw?.pageProps?.matchData;
      const f = md?.getFixtureItem;
      if (!md || !f) throw new Error('pageProps.matchData/getFixtureItem missing');
      const actualSeason = norm(f.season || fixture.season);
      if (numericSeason(actualSeason) < MIN_SOURCE_SEASON) throw new Error(`PROHIBITED_RESPONSE_SEASON:${actualSeason}`);
      const summary = md?.allMatchStatsSummary || {};
      const audit = statsAudit(summary?.playSummary);
      const gender = inferGender({ ...fixture, competitionName: norm(f.compName) || fixture.competitionName, homeTeam: norm(f?.homeTeam?.name) || fixture.homeTeam, awayTeam: norm(f?.awayTeam?.name) || fixture.awayTeam });
      return {
        fixtureId: norm(f.fixtureId || f.id || fixture.fixtureId),
        competitionId: norm(f.compId || f.competitionId || compId),
        competitionName: norm(f.compName) || fixture.competitionName,
        sourceSeason: actualSeason,
        canonicalSeason: canonicalSeason(actualSeason),
        gender,
        dateTime: norm(f.dateTime) || fixture.dateTime,
        homeTeam: norm(f?.homeTeam?.name) || fixture.homeTeam,
        awayTeam: norm(f?.awayTeam?.name) || fixture.awayTeam,
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
        matchDataKeys: Object.keys(md).sort(),
        statsSummaryKeys: Object.keys(summary).sort(),
        fixtureKeys: Object.keys(f).sort(),
        pointsShape: [...shapePaths(summary?.pointsSummary)],
        lineupShape: [...shapePaths(summary?.lineUp)],
        commentaryShape: [...shapePaths(md?.allMatchCommentary)],
        allSeasonStatShape: [...shapePaths(md?.allSeasonStat)],
        fixtureShape: [...shapePaths(f)],
        dataUrl,
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`No competition ID available for fixture ${fixture.fixtureId}`);
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
    eventKeys: new Set(),
    competitionIds: new Set(),
    statTitles: new Set(),
    statCategories: new Set(),
    matchDataKeys: new Set(),
    statsSummaryKeys: new Set(),
    fixtureKeys: new Set(),
    pointsShape: new Set(),
    lineupShape: new Set(),
    commentaryShape: new Set(),
    allSeasonStatShape: new Set(),
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
const discoveryFailures = [];
const fixtureMap = new Map();
const competitionDiscovery = [];

for (const comp of surface.targets) {
  const variants = [];
  for (const sourceType of ['1', null]) {
    const result = await paginateCompetition(surface.gqlTemplate, comp, sourceType);
    variants.push({ sourceType: sourceType == null ? 'omitted' : sourceType, pages: result.pages, fixtureCount: result.fixtures.length });
    discoveryFailures.push(...result.failures);
    for (const x of result.fixtures) {
      const y = numericSeason(x.season);
      if (y == null || y < MIN_SOURCE_SEASON || y > MAX_SOURCE_SEASON) continue;
      const withGender = { ...x, gender: inferGender(x) };
      const key = `${x.fixtureId}|${x.season}|${x.dateTime}`;
      if (!fixtureMap.has(key)) fixtureMap.set(key, withGender);
    }
  }
  competitionDiscovery.push({ competitionId: comp.id, label: comp.label, gender: comp.gender, variants });
}

const fixtures = [...fixtureMap.values()].sort((a, b) => Number(a.season) - Number(b.season) || norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId) - Number(b.fixtureId));
const details = new Array(fixtures.length);
const detailFailures = [];
let cursor = 0;
async function detailWorker() {
  while (true) {
    const i = cursor++;
    if (i >= fixtures.length) return;
    try {
      details[i] = await inspectFixture(surface.buildId, fixtures[i]);
    } catch (error) {
      detailFailures.push({ fixture: fixtures[i], error: String(error) });
      details[i] = null;
    }
    if (i % 25 === 0) await sleep(25);
  }
}
await Promise.all(Array.from({ length: DETAIL_CONCURRENCY }, () => detailWorker()));

const successful = details.filter(Boolean);
const seasonMap = new Map();
const eventMap = new Map();

for (const fixture of fixtures) {
  const gender = fixture.gender || inferGender(fixture);
  const key = `${fixture.season}|${gender}`;
  if (!seasonMap.has(key)) seasonMap.set(key, createAggregate(fixture.season, gender));
  seasonMap.get(key).fixtureCount++;
}
for (const d of successful) {
  const key = `${d.sourceSeason}|${d.gender}`;
  if (!seasonMap.has(key)) seasonMap.set(key, createAggregate(d.sourceSeason, d.gender));
  const a = seasonMap.get(key);
  a.detailSuccessCount++;
  if (d.quality === 'rich') a.richStatsCount++;
  else if (d.quality === 'sparse') a.sparseStatsCount++;
  else if (d.quality === 'score_only_or_zero') a.scoreOnlyOrZeroStatsCount++;
  else if (d.quality === 'no_stats') a.noStatsCount++;
  if (d.pointsPresent) a.pointsSummaryCount++;
  if (d.lineupPresent) a.lineupCount++;
  if (d.commentaryPresent) a.commentaryCount++;
  if (d.allSeasonStatPresent) a.allSeasonStatCount++;
  const eventKey = `${d.sourceSeason}|${d.gender}|${d.competitionId}|${d.competitionName}`;
  a.eventKeys.add(eventKey);
  a.competitionIds.add(d.competitionId);
  unionInto(a.statTitles, d.statTitles);
  unionInto(a.statCategories, d.statCategories);
  unionInto(a.matchDataKeys, d.matchDataKeys);
  unionInto(a.statsSummaryKeys, d.statsSummaryKeys);
  unionInto(a.fixtureKeys, d.fixtureKeys);
  unionInto(a.pointsShape, d.pointsShape);
  unionInto(a.lineupShape, d.lineupShape);
  unionInto(a.commentaryShape, d.commentaryShape);
  unionInto(a.allSeasonStatShape, d.allSeasonStatShape);
  unionInto(a.fixtureShape, d.fixtureShape);

  if (!eventMap.has(eventKey)) eventMap.set(eventKey, {
    eventKey,
    sourceSeason: d.sourceSeason,
    canonicalSeason: d.canonicalSeason,
    gender: d.gender,
    competitionId: d.competitionId,
    competitionName: d.competitionName,
    fixtureCount: 0,
    richStatsCount: 0,
    sparseStatsCount: 0,
    scoreOnlyOrZeroStatsCount: 0,
    noStatsCount: 0,
    pointsSummaryCount: 0,
    lineupCount: 0,
    commentaryCount: 0,
    allSeasonStatCount: 0,
    firstDateTime: d.dateTime,
    lastDateTime: d.dateTime,
  });
  const e = eventMap.get(eventKey);
  e.fixtureCount++;
  if (d.quality === 'rich') e.richStatsCount++;
  else if (d.quality === 'sparse') e.sparseStatsCount++;
  else if (d.quality === 'score_only_or_zero') e.scoreOnlyOrZeroStatsCount++;
  else if (d.quality === 'no_stats') e.noStatsCount++;
  if (d.pointsPresent) e.pointsSummaryCount++;
  if (d.lineupPresent) e.lineupCount++;
  if (d.commentaryPresent) e.commentaryCount++;
  if (d.allSeasonStatPresent) e.allSeasonStatCount++;
  if (d.dateTime && (!e.firstDateTime || d.dateTime < e.firstDateTime)) e.firstDateTime = d.dateTime;
  if (d.dateTime && (!e.lastDateTime || d.dateTime > e.lastDateTime)) e.lastDateTime = d.dateTime;
}

for (const a of seasonMap.values()) a.detailFailureCount = Math.max(0, a.fixtureCount - a.detailSuccessCount);

const baselines = {};
for (const gender of ['Men', 'Women']) {
  baselines[gender] = seasonMap.get(`${BASELINE_SOURCE_SEASON}|${gender}`) || null;
}

const seasonRows = [];
for (const a of [...seasonMap.values()].sort((x, y) => Number(x.sourceSeason) - Number(y.sourceSeason) || x.gender.localeCompare(y.gender))) {
  const b = baselines[a.gender];
  const comparisons = {
    statTitles: coverage(a.statTitles, b?.statTitles),
    fixtureSchema: coverage(a.fixtureShape, b?.fixtureShape),
    pointsSchema: coverage(a.pointsShape, b?.pointsShape),
    lineupSchema: coverage(a.lineupShape, b?.lineupShape),
    commentarySchema: coverage(a.commentaryShape, b?.commentaryShape),
    matchDataTopLevel: coverage(a.matchDataKeys, b?.matchDataKeys),
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
    analysisReadyStatsCount: a.richStatsCount + a.sparseStatsCount,
    analysisReadyStatsRatio: a.detailSuccessCount ? (a.richStatsCount + a.sparseStatsCount) / a.detailSuccessCount : null,
    pointsSummaryCount: a.pointsSummaryCount,
    pointsSummaryRatio: a.detailSuccessCount ? a.pointsSummaryCount / a.detailSuccessCount : null,
    lineupCount: a.lineupCount,
    lineupRatio: a.detailSuccessCount ? a.lineupCount / a.detailSuccessCount : null,
    commentaryCount: a.commentaryCount,
    commentaryRatio: a.detailSuccessCount ? a.commentaryCount / a.detailSuccessCount : null,
    allSeasonStatCount: a.allSeasonStatCount,
    allSeasonStatRatio: a.detailSuccessCount ? a.allSeasonStatCount / a.detailSuccessCount : null,
    statTitleCount: a.statTitles.size,
    matchDataKeyCount: a.matchDataKeys.size,
    statsSummaryKeyCount: a.statsSummaryKeys.size,
    fixtureKeyCount: a.fixtureKeys.size,
    baselineComparison: comparisons,
    statTitles: [...a.statTitles].sort(),
    matchDataKeys: [...a.matchDataKeys].sort(),
    statsSummaryKeys: [...a.statsSummaryKeys].sort(),
    fixtureKeys: [...a.fixtureKeys].sort(),
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
  'all_season_stat_count','all_season_stat_ratio','stat_title_count',
  'stat_schema_vs_2025_26','fixture_schema_vs_2025_26','points_schema_vs_2025_26','lineup_schema_vs_2025_26','commentary_schema_vs_2025_26'
]];
for (const x of seasonRows) coverageCsv.push([
  x.sourceSeason,x.canonicalSeason,x.gender,x.discoveredEventCount,x.fixtureCount,x.detailSuccessCount,x.detailFailureCount,
  x.richStatsCount,x.sparseStatsCount,x.scoreOnlyOrZeroStatsCount,x.noStatsCount,x.analysisReadyStatsRatio,
  x.pointsSummaryCount,x.pointsSummaryRatio,x.lineupCount,x.lineupRatio,x.commentaryCount,x.commentaryRatio,
  x.allSeasonStatCount,x.allSeasonStatRatio,x.statTitleCount,
  x.baselineComparison.statTitles.baselineCoverageRatio,
  x.baselineComparison.fixtureSchema.baselineCoverageRatio,
  x.baselineComparison.pointsSchema.baselineCoverageRatio,
  x.baselineComparison.lineupSchema.baselineCoverageRatio,
  x.baselineComparison.commentarySchema.baselineCoverageRatio,
]);

const eventCsv = [[
  'source_season','canonical_season','gender','competition_id','competition_name','fixture_count','rich_stats','sparse_stats',
  'score_only_or_zero','no_stats','points_summary','lineup','commentary','all_season_stat','first_datetime','last_datetime'
]];
for (const e of eventRows) eventCsv.push([
  e.sourceSeason,e.canonicalSeason,e.gender,e.competitionId,e.competitionName,e.fixtureCount,e.richStatsCount,e.sparseStatsCount,
  e.scoreOnlyOrZeroStatsCount,e.noStatsCount,e.pointsSummaryCount,e.lineupCount,e.commentaryCount,e.allSeasonStatCount,e.firstDateTime,e.lastDateTime,
]);

const summary = {
  audit: 'SVNS / World Rugby Sevens Series historical data coverage matrix',
  hardBoundary: {
    earliestCanonicalSeason: '2016-17',
    earliestSourceSeason: MIN_SOURCE_SEASON,
    rule: 'No fixture-detail request is permitted for sourceSeason < 2017. GraphQL discovery stops at the boundary and pre-boundary records are never inspected.',
  },
  latestCanonicalSeason: '2025-26',
  latestSourceSeason: MAX_SOURCE_SEASON,
  baselineCanonicalSeason: '2025-26',
  baselineSourceSeason: BASELINE_SOURCE_SEASON,
  competitionFilterCount: surface.filters.length,
  targetCompetitionFilterCount: surface.targets.length,
  discoveredFixtureCountWithinBoundary: fixtures.length,
  detailSuccessCount: successful.length,
  detailFailureCount: detailFailures.length,
  discoveryFailureCount: discoveryFailures.length,
  seasonGenderRows: seasonRows,
  otherMatchDataKeys: Object.entries(otherKeyFrequency).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0])).map(([key,count]) => ({ key, count })),
  allMatchStatsSummaryKeyFrequency: Object.entries(summaryKeyFrequency).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0])).map(([key,count]) => ({ key, count })),
  fixtureItemKeyFrequency: Object.entries(fixtureKeyFrequency).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0])).map(([key,count]) => ({ key, count })),
  capturedAt: new Date().toISOString(),
};

await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'coverage-matrix.csv'), toCsv(coverageCsv));
await fs.writeFile(path.join(OUT_DIR, 'event-coverage.csv'), toCsv(eventCsv));
await fs.writeFile(path.join(OUT_DIR, 'schema-diff.json'), JSON.stringify(seasonRows.map(x => ({
  sourceSeason:x.sourceSeason, canonicalSeason:x.canonicalSeason, gender:x.gender,
  baselineComparison:x.baselineComparison, statTitles:x.statTitles, matchDataKeys:x.matchDataKeys,
  statsSummaryKeys:x.statsSummaryKeys, fixtureKeys:x.fixtureKeys,
})), null, 2));
await fs.writeFile(path.join(OUT_DIR, 'other-match-data-keys.json'), JSON.stringify({
  otherMatchDataKeys: summary.otherMatchDataKeys,
  allMatchStatsSummaryKeyFrequency: summary.allMatchStatsSummaryKeyFrequency,
  fixtureItemKeyFrequency: summary.fixtureItemKeyFrequency,
}, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'competition-discovery.json'), JSON.stringify({
  filters: surface.filters,
  targets: surface.targets,
  competitionDiscovery,
}, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'detail-failures.json'), JSON.stringify(detailFailures, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'discovery-failures.json'), JSON.stringify(discoveryFailures, null, 2));

console.log(JSON.stringify({
  audit: summary.audit,
  hardBoundary: summary.hardBoundary,
  discoveredFixtureCountWithinBoundary: summary.discoveredFixtureCountWithinBoundary,
  detailSuccessCount: summary.detailSuccessCount,
  detailFailureCount: summary.detailFailureCount,
  discoveryFailureCount: summary.discoveryFailureCount,
  seasonGenderRows: seasonRows.map(x => ({
    season:x.canonicalSeason, sourceSeason:x.sourceSeason, gender:x.gender, events:x.discoveredEventCount, fixtures:x.fixtureCount,
    rich:x.richStatsCount, sparse:x.sparseStatsCount, zero:x.scoreOnlyOrZeroStatsCount, noStats:x.noStatsCount,
    points:`${x.pointsSummaryCount}/${x.detailSuccessCount}`,
    lineup:`${x.lineupCount}/${x.detailSuccessCount}`,
    commentary:`${x.commentaryCount}/${x.detailSuccessCount}`,
    allSeasonStat:`${x.allSeasonStatCount}/${x.detailSuccessCount}`,
    statSchemaVs2026:x.baselineComparison.statTitles.baselineCoverageRatio,
    fixtureSchemaVs2026:x.baselineComparison.fixtureSchema.baselineCoverageRatio,
    pointsSchemaVs2026:x.baselineComparison.pointsSchema.baselineCoverageRatio,
    lineupSchemaVs2026:x.baselineComparison.lineupSchema.baselineCoverageRatio,
    commentarySchemaVs2026:x.baselineComparison.commentarySchema.baselineCoverageRatio,
  })),
  otherMatchDataKeys: summary.otherMatchDataKeys,
}, null, 2));
