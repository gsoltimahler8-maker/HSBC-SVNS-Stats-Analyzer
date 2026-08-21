import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const RESULTS_URL = `${BASE}/fixtures-results?team=All&comp=All&tab=Results`;
const GQL_URL = 'https://rugby-au-cms.graphcdn.app/';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-legacy-team-pivot';
const SEED = { comp: '257', season: '2017', fixture: '37719' };
const REQUEST_LIMIT = 100;
const MAX_TEAM_PAGES = 80;
const MAX_SOURCE_TYPE_PAGES = 12;

await fs.mkdir(OUT_DIR, { recursive: true });

const norm = (v) => v == null ? '' : String(v).trim();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function csvEscape(v) {
  const s = norm(v);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
function toCsv(rows) { return rows.map(r => r.map(csvEscape).join(',')).join('\n'); }

async function fetchText(url) {
  const r = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}: ${text.slice(0, 400)}`);
  return text;
}

function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
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
function nestedId(v) {
  if (!v || typeof v !== 'object') return '';
  return firstScalar(v, ['teamId','teamID','id','team_id']);
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

function isLegacy(x) {
  return /^\d{4}$/.test(x.season) && Number(x.season) < 2023;
}
function isSevensLike(x) {
  const s = `${x.competitionName} ${x.homeTeam} ${x.awayTeam}`;
  return /(?:sevens|7s|svns)/i.test(s);
}

async function inspectSeed() {
  const matchUrl = `${BASE}/match-centre/${SEED.comp}/${SEED.season}/${SEED.fixture}?tab=Match-Stats`;
  const html = await fetchText(matchUrl);
  const next = extractNextData(html);
  const buildId = next.buildId;
  const dataUrl = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${SEED.comp}/${SEED.season}/${SEED.fixture}.json?tab=Match-Stats&comp=${SEED.comp}&season=${SEED.season}&fixture=${SEED.fixture}`;
  const raw = JSON.parse(await fetchText(dataUrl));
  const md = raw?.pageProps?.matchData || {};
  const f = md?.getFixtureItem || {};
  const home = f.homeTeam || {};
  const away = f.awayTeam || {};
  return {
    matchUrl,
    dataUrl,
    competitionId: norm(f.compId || f.competitionId || SEED.comp),
    competitionName: norm(f.compName),
    dateTime: norm(f.dateTime),
    homeTeamId: nestedId(home),
    homeTeam: nestedName(home) || norm(home.teamName),
    awayTeamId: nestedId(away),
    awayTeam: nestedName(away) || norm(away.teamName),
    fixtureKeys: Object.keys(f).sort(),
    homeTeamKeys: Object.keys(home).sort(),
    awayTeamKeys: Object.keys(away).sort(),
  };
}

async function captureGraphQLTemplate() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  let template = null;
  page.on('request', req => {
    if (template || !req.url().includes('rugby-au-cms.graphcdn.app')) return;
    try {
      const body = JSON.parse(req.postData() || '');
      if (body?.operationName === 'FixturesAndResults' && body?.query) template = body;
    } catch {}
  });
  await page.goto(`${BASE}/fixtures-results?team=All&comp=257&tab=Results`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  await browser.close();
  if (!template) throw new Error('FixturesAndResults GraphQL template not captured');
  return template;
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

async function paginate(template, variablesFactory, maxPages, label) {
  const seen = new Map();
  const pages = [];
  const failures = [];
  let skip = 0;
  let noNew = 0;

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
    try {
      const body = structuredClone(template);
      body.variables = {
        ...(body.variables || {}),
        ...variablesFactory(skip),
        skip,
        limit: REQUEST_LIMIT,
      };
      const result = await postGraphQL(body);
      const candidates = dedupeFixtures(collectFixtureCandidates(result.data));
      let newCount = 0;
      for (const x of candidates) {
        const key = `${x.fixtureId}|${x.season}|${x.dateTime}`;
        if (!seen.has(key)) {
          seen.set(key, x);
          newCount++;
        }
      }
      pages.push({ pageIndex, skip, candidateCount: candidates.length, newCount, responseLength: result.textLength });
      if (!candidates.length) break;
      noNew = newCount ? 0 : noNew + 1;
      if (noNew >= 2) break;
      skip += Math.max(1, candidates.length);
      await sleep(70);
    } catch (error) {
      failures.push({ label, skip, error: String(error) });
      break;
    }
  }

  const fixtures = [...seen.values()].sort((a,b) => norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId) - Number(b.fixtureId));
  return { fixtures, pages, failures };
}

const failures = [];
let seed;
let template;
try { seed = await inspectSeed(); }
catch (error) { throw new Error(`Seed inspection failed: ${error}`); }
try { template = await captureGraphQLTemplate(); }
catch (error) { throw new Error(`Template capture failed: ${error}`); }

const seedTeams = [
  { side: 'home', id: seed.homeTeamId, name: seed.homeTeam },
  { side: 'away', id: seed.awayTeamId, name: seed.awayTeam },
].filter(x => x.id);

const teamPivots = [];
const allTeamFixtures = new Map();
for (const team of seedTeams) {
  const result = await paginate(
    template,
    () => ({ comps: [], teams: [String(team.id)], type: 'results' }),
    MAX_TEAM_PAGES,
    `team:${team.id}`
  );
  failures.push(...result.failures);
  const fixtures = result.fixtures;
  for (const x of fixtures) allTeamFixtures.set(`${x.fixtureId}|${x.season}|${x.dateTime}`, { ...x, pivotTeamId: team.id, pivotTeamName: team.name });
  const legacy = fixtures.filter(isLegacy);
  const legacySevens = legacy.filter(isSevensLike);
  const seasons = [...new Set(fixtures.map(x => x.season).filter(Boolean))].sort();
  teamPivots.push({
    team,
    totalFixtureCount: fixtures.length,
    sevensLikeFixtureCount: fixtures.filter(isSevensLike).length,
    sourceSeasons: seasons,
    oldestSourceSeason: seasons[0] || null,
    legacyFixtureCountBefore2023: legacy.length,
    legacySevensFixtureCountBefore2023: legacySevens.length,
    legacyCompetitionIds: [...new Set(legacySevens.map(x => x.competitionId).filter(Boolean))].sort((a,b) => Number(a)-Number(b)),
    pages: result.pages,
    oldestLegacySevensFixtures: legacySevens.slice(0, 15),
  });
}

const sourceTypeVariants = [];
const variantValues = [null, '0', '1', '2', '3', '4', '5'];
for (const sourceType of variantValues) {
  const label = sourceType === null ? 'omitted' : sourceType;
  const result = await paginate(
    template,
    () => ({
      comps: [sourceType === null ? { id: SEED.comp } : { id: SEED.comp, sourceType }],
      teams: [],
      type: 'results',
    }),
    MAX_SOURCE_TYPE_PAGES,
    `sourceType:${label}`
  );
  failures.push(...result.failures);
  const fixtures = result.fixtures;
  const legacy = fixtures.filter(isLegacy);
  const seasons = [...new Set(fixtures.map(x => x.season).filter(Boolean))].sort();
  sourceTypeVariants.push({
    sourceType: label,
    fixtureCount: fixtures.length,
    sourceSeasons: seasons,
    legacyFixtureCountBefore2023: legacy.length,
    oldestLegacyFixtures: legacy.slice(0, 10),
    pages: result.pages,
  });
}

const teamFixtures = [...allTeamFixtures.values()].sort((a,b) => norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId)-Number(b.fixtureId));
const legacySevensFixtures = teamFixtures.filter(x => isLegacy(x) && isSevensLike(x));
const discoveredLegacyTeamIds = [...new Set(legacySevensFixtures.flatMap(x => [x.homeTeamId, x.awayTeamId]).filter(Boolean))].sort((a,b) => Number(a)-Number(b));
const legacyCompetitionIds = [...new Set(legacySevensFixtures.map(x => x.competitionId).filter(Boolean))].sort((a,b) => Number(a)-Number(b));
const legacySeasons = [...new Set(legacySevensFixtures.map(x => x.season).filter(Boolean))].sort();

const rows = [[
  'pivot_team_id','pivot_team_name','fixture_id','source_season','date_time','competition_id','competition_name','home_team_id','home_team','away_team_id','away_team','path'
]];
for (const x of teamFixtures) rows.push([
  x.pivotTeamId,x.pivotTeamName,x.fixtureId,x.season,x.dateTime,x.competitionId,x.competitionName,x.homeTeamId,x.homeTeam,x.awayTeamId,x.awayTeam,x.path
]);
await fs.writeFile(path.join(OUT_DIR, 'team-pivot-fixtures.csv'), toCsv(rows));
await fs.writeFile(path.join(OUT_DIR, 'team-pivots.json'), JSON.stringify(teamPivots, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'source-type-variants.json'), JSON.stringify(sourceTypeVariants, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'graphql-template.json'), JSON.stringify(template, null, 2));

const summary = {
  audit: 'Legacy Sevens discovery via 2017 team IDs and sourceType variants',
  seed,
  seedTeams,
  teamPivots,
  sourceTypeVariants,
  uniqueTeamPivotFixtureCount: teamFixtures.length,
  legacySevensFixtureCountBefore2023: legacySevensFixtures.length,
  legacySeasons,
  legacyCompetitionIds,
  discoveredLegacyTeamIdCount: discoveredLegacyTeamIds.length,
  discoveredLegacyTeamIds,
  oldestLegacySevensFixtures: legacySevensFixtures.slice(0, 25),
  failureCount: failures.length,
  failures,
  capturedAt: new Date().toISOString(),
};
await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
