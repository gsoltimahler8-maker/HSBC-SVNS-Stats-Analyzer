import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const RESULTS_URL = `${BASE}/fixtures-results?team=All&comp=All&tab=Results`;
const GQL_URL = 'https://rugby-au-cms.graphcdn.app/';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-legacy-graphql-pagination';
const REQUEST_LIMIT = 100;
const MAX_PAGES_PER_COMP = 100;

await fs.mkdir(OUT_DIR, { recursive: true });

const norm = (v) => v == null ? '' : String(v).trim();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function csvEscape(v) {
  const s = norm(v);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
function toCsv(rows) { return rows.map(r => r.map(csvEscape).join(',')).join('\n'); }

function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
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

function classifyCompetition(label) {
  const s = label.toLowerCase();
  const excludedReason =
    /challenger/.test(s) ? 'challenger' :
    /olympic/.test(s) ? 'olympic' :
    /world cup/.test(s) ? 'world_cup' :
    /commonwealth/.test(s) ? 'commonwealth' :
    /asia|asian games/.test(s) ? 'regional' :
    /qualif/.test(s) ? 'qualifier' :
    '';
  const seriesLike = /svns|world rugby sevens series|sevens world series|world sevens series|hsbc sevens series|irb sevens world series/i.test(label);
  const scope = seriesLike && !excludedReason ? 'series_target' : 'other_sevens';
  const gender = /women|womens|women's/i.test(label) ? 'Women' : /men|mens|men's/i.test(label) ? 'Men' : '';
  return { scope, excludedReason, gender };
}

function scalar(v) { return ['string','number','boolean'].includes(typeof v) ? v : null; }
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

function collectFixtureCandidates(value, out = [], currentPath = '$', depth = 0) {
  if (value == null || depth > 20) return out;
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectFixtureCandidates(v, out, `${currentPath}[${i}]`, depth + 1));
    return out;
  }
  if (typeof value !== 'object') return out;

  const season = firstScalar(value, ['season','seasonId','seasonID']);
  const dateTime = firstScalar(value, ['dateTime','datetime','startDateTime','startTime','date']);
  const id = firstScalar(value, ['fixtureId','fixtureID','matchId','matchID','id']);
  const hasTeams = Boolean(value.homeTeam || value.awayTeam || value.teamA || value.teamB);

  if (season && dateTime && id && (hasTeams || /fixture|match/i.test(norm(value.__typename)))) {
    const compId = firstScalar(value, ['compId','competitionId','competitionID']) || firstScalar(value.competition || {}, ['id','compId','competitionId']);
    const compName = firstScalar(value, ['compName','competitionName']) || nestedName(value.competition);
    const home = nestedName(value.homeTeam || value.teamA);
    const away = nestedName(value.awayTeam || value.teamB);
    out.push({
      path: currentPath,
      fixtureId: id,
      season,
      dateTime,
      competitionId: compId,
      competitionName: compName,
      homeTeam: home,
      awayTeam: away,
      typename: norm(value.__typename),
      keys: Object.keys(value).sort(),
    });
  }

  for (const [k, v] of Object.entries(value)) {
    if (v && typeof v === 'object') collectFixtureCandidates(v, out, `${currentPath}.${k}`, depth + 1);
  }
  return out;
}

async function discoverFiltersAndGraphQLTemplate() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  let gqlTemplate = null;
  page.on('request', req => {
    if (gqlTemplate || !req.url().includes('rugby-au-cms.graphcdn.app')) return;
    const raw = req.postData() || '';
    try {
      const body = JSON.parse(raw);
      if (body?.operationName === 'FixturesAndResults' && body?.query) gqlTemplate = body;
    } catch {}
  });

  await page.goto(RESULTS_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);

  const html = await page.content();
  const next = extractNextData(html);
  const found = collectCompetitionLikeObjects(next);
  const byId = new Map();
  for (const x of found) {
    if (!byId.has(x.id)) byId.set(x.id, { id: x.id, label: x.label, paths: [x.path] });
    else {
      const e = byId.get(x.id);
      if (!e.paths.includes(x.path)) e.paths.push(x.path);
      if (x.label.length > e.label.length) e.label = x.label;
    }
  }
  const filters = [...byId.values()].map(x => ({ ...x, ...classifyCompetition(x.label) }));

  // Force one concrete competition request if the initial All request did not capture the operation.
  if (!gqlTemplate) {
    await page.goto(`${BASE}/fixtures-results?team=All&comp=257&tab=Results`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(6000);
  }

  await browser.close();
  if (!gqlTemplate) throw new Error('FixturesAndResults GraphQL template not captured');
  return { filters, gqlTemplate };
}

async function postGraphQL(body) {
  const r = await fetch(GQL_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`GraphQL HTTP ${r.status}: ${text.slice(0, 500)}`);
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`GraphQL non-JSON response: ${text.slice(0, 500)}`); }
  return { data, textLength: text.length };
}

const discovery = await discoverFiltersAndGraphQLTemplate();
const targets = discovery.filters.filter(x => x.scope === 'series_target').sort((a,b) => Number(a.id) - Number(b.id));

const baseTemplate = discovery.gqlTemplate;
const allFixtures = new Map();
const compSummaries = [];
const failures = [];
const responseShapes = [];

for (let ci = 0; ci < targets.length; ci++) {
  const comp = targets[ci];
  const seen = new Map();
  const pages = [];
  let skip = 0;
  let consecutiveNoNew = 0;

  for (let pageIndex = 0; pageIndex < MAX_PAGES_PER_COMP; pageIndex++) {
    try {
      const body = structuredClone(baseTemplate);
      body.variables = {
        ...(body.variables || {}),
        comps: [{ id: String(comp.id), sourceType: '1' }],
        teams: [],
        type: 'results',
        skip,
        limit: REQUEST_LIMIT,
      };
      const result = await postGraphQL(body);
      const candidatesRaw = collectFixtureCandidates(result.data);
      const candidates = [];
      const pageKeys = new Set();
      for (const x of candidatesRaw) {
        const key = `${x.fixtureId}|${x.season}|${x.dateTime}`;
        if (pageKeys.has(key)) continue;
        pageKeys.add(key);
        candidates.push(x);
      }

      let newCount = 0;
      for (const x of candidates) {
        const key = `${x.fixtureId}|${x.season}|${x.dateTime}`;
        if (!seen.has(key)) {
          seen.set(key, { ...x, filterCompetitionId: comp.id, filterLabel: comp.label, filterGender: comp.gender });
          newCount++;
        }
      }

      pages.push({ pageIndex, skip, requestedLimit: REQUEST_LIMIT, responseLength: result.textLength, candidateCount: candidates.length, newCount });
      if (responseShapes.length < 8 && candidates[0]) responseShapes.push({ compId: comp.id, skip, sample: candidates[0] });

      if (candidates.length === 0) break;
      if (newCount === 0) consecutiveNoNew++;
      else consecutiveNoNew = 0;
      if (consecutiveNoNew >= 2) break;

      // Advance by actual distinct records returned. This remains safe if the backend caps the requested limit.
      skip += Math.max(1, candidates.length);
      if (pageIndex < MAX_PAGES_PER_COMP - 1) await sleep(80);
    } catch (error) {
      failures.push({ competitionId: comp.id, label: comp.label, skip, error: String(error) });
      break;
    }
  }

  const fixtures = [...seen.values()].sort((a,b) => norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId) - Number(b.fixtureId));
  for (const x of fixtures) allFixtures.set(`${x.fixtureId}|${x.season}|${x.dateTime}`, x);
  const seasons = [...new Set(fixtures.map(x => x.season).filter(Boolean))].sort();
  const dates = fixtures.map(x => x.dateTime).filter(Boolean).sort();
  compSummaries.push({
    competitionId: comp.id,
    filterLabel: comp.label,
    filterGender: comp.gender,
    fixtureCount: fixtures.length,
    seasons,
    oldestSeason: seasons[0] || null,
    newestSeason: seasons.at(-1) || null,
    oldestDateTime: dates[0] || null,
    newestDateTime: dates.at(-1) || null,
    pageCount: pages.length,
    pages,
    oldestFixtures: fixtures.slice(0, 5),
  });
}

const fixtures = [...allFixtures.values()].sort((a,b) => norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId) - Number(b.fixtureId));
const seasons = [...new Set(fixtures.map(x => x.season).filter(Boolean))].sort();
const legacyFixtures = fixtures.filter(x => /^\d{4}$/.test(x.season) && Number(x.season) < 2023);
const legacyComps = compSummaries.filter(x => x.seasons.some(s => /^\d{4}$/.test(s) && Number(s) < 2023));

const fixtureRows = [[
  'filter_competition_id','filter_label','filter_gender','fixture_id','source_season','date_time','competition_id','competition_name','home_team','away_team','typename','path'
]];
for (const x of fixtures) fixtureRows.push([
  x.filterCompetitionId,x.filterLabel,x.filterGender,x.fixtureId,x.season,x.dateTime,x.competitionId,x.competitionName,x.homeTeam,x.awayTeam,x.typename,x.path
]);
await fs.writeFile(path.join(OUT_DIR, 'legacy-graphql-fixtures.csv'), toCsv(fixtureRows));
await fs.writeFile(path.join(OUT_DIR, 'competition-summaries.json'), JSON.stringify(compSummaries, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'fixtures.json'), JSON.stringify(fixtures, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'graphql-template.json'), JSON.stringify(baseTemplate, null, 2));

const summary = {
  audit: 'Direct FixturesAndResults GraphQL pagination across discoverable Sevens Series competition IDs',
  targetCompetitionCount: targets.length,
  targetCompetitions: targets.map(x => ({ id:x.id, label:x.label, gender:x.gender })),
  totalUniqueFixtureCount: fixtures.length,
  sourceSeasons: seasons,
  oldestSourceSeason: seasons[0] || null,
  newestSourceSeason: seasons.at(-1) || null,
  legacyFixtureCountBefore2023: legacyFixtures.length,
  legacyCompetitionCountBefore2023: legacyComps.length,
  legacyCompetitionSummaries: legacyComps.map(x => ({
    competitionId:x.competitionId, filterLabel:x.filterLabel, filterGender:x.filterGender,
    fixtureCount:x.fixtureCount, seasons:x.seasons, oldestSeason:x.oldestSeason, oldestDateTime:x.oldestDateTime,
    pageCount:x.pageCount, oldestFixtures:x.oldestFixtures,
  })),
  oldestFixturesOverall: fixtures.slice(0, 20),
  responseShapes,
  failureCount: failures.length,
  failures,
  capturedAt: new Date().toISOString(),
};
await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
