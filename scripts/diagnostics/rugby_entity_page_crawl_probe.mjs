import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const GQL = 'https://rugby-au-cms.graphcdn.app/';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-entity-page-crawl';
const TARGET_SEASON = '2017';
const KNOWN_FIXTURE = '37719';
const MAX_PAGES = 70;
await fs.mkdir(OUT_DIR, { recursive: true });

const directQuery = `query EntityFixturesAndResults($entityId:Int,$entityType:String,$season:String,$type:String,$skip:Int,$limit:Int){getEntityFixturesAndResults(season:$season,entityId:$entityId,entityType:$entityType,type:$type,skip:$skip,limit:$limit){id compId compName dateTime season sourceType status homeTeam{teamId name score} awayTeam{teamId name score}}}`;

function normalizeUrl(href) {
  try {
    const u = new URL(href, BASE);
    if (u.origin !== BASE) return null;
    u.hash = '';
    u.search = '';
    const p = u.pathname.replace(/\/+$/, '') || '/';
    if (/^\/(match-centre|news|video|videos|email-preferences)(\/|$)/i.test(p)) return null;
    if (p.split('/').filter(Boolean).length > 4) return null;
    return `${BASE}${p}`;
  } catch { return null; }
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

const captures = [];
let currentPageUrl = '';
page.on('request', req => {
  if (!req.url().includes('rugby-au-cms.graphcdn.app')) return;
  const raw = req.postData() || '';
  try {
    const body = JSON.parse(raw);
    const query = String(body?.query || '');
    if (!query.includes('getEntityFixturesAndResults')) return;
    captures.push({
      pageUrl: currentPageUrl,
      operationName: body?.operationName || '',
      variables: body?.variables || {},
      queryHead: query.replace(/\s+/g, ' ').slice(0, 500),
    });
  } catch {}
});

const queue = [`${BASE}/`, `${BASE}/fixtures-results`];
const seen = new Set();
const pageReports = [];

while (queue.length && seen.size < MAX_PAGES) {
  const url = queue.shift();
  if (!url || seen.has(url)) continue;
  seen.add(url);
  currentPageUrl = url;
  const before = captures.length;
  let status = null;
  let finalUrl = url;
  let title = '';
  let links = [];
  let error = null;
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    status = resp?.status() ?? null;
    await page.waitForTimeout(1800);
    finalUrl = page.url();
    title = await page.title().catch(() => '');
    links = await page.locator('a[href]').evaluateAll(els => [...new Set(els.map(a => a.href).filter(Boolean))]).catch(() => []);
    for (const href of links) {
      const n = normalizeUrl(href);
      if (n && !seen.has(n) && !queue.includes(n)) queue.push(n);
    }
  } catch (e) {
    error = String(e);
  }
  const pageCaptures = captures.slice(before);
  pageReports.push({ url, finalUrl, status, title, linkCount: links.length, entityQueryCount: pageCaptures.length, entityQueries: pageCaptures });
}
await browser.close();

const candidateMap = new Map();
for (const c of captures) {
  const v = c.variables || {};
  const entityId = Number(v.entityId);
  const entityType = v.entityType == null ? '' : String(v.entityType).trim();
  if (!Number.isFinite(entityId) || !entityType) continue;
  const key = `${entityId}|${entityType}`;
  if (!candidateMap.has(key)) candidateMap.set(key, { entityId, entityType, sourcePages: new Set(), observedSeasons: new Set(), operations: new Set() });
  const x = candidateMap.get(key);
  if (c.pageUrl) x.sourcePages.add(c.pageUrl);
  if (v.season != null && String(v.season).trim()) x.observedSeasons.add(String(v.season).trim());
  if (c.operationName) x.operations.add(c.operationName);
}
const candidates = [...candidateMap.values()].map(x => ({
  entityId: x.entityId,
  entityType: x.entityType,
  sourcePages: [...x.sourcePages],
  observedSeasons: [...x.observedSeasons],
  operations: [...x.operations],
}));

async function queryCandidate(candidate, type) {
  const r = await fetch(GQL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      operationName: 'EntityFixturesAndResults',
      query: directQuery,
      variables: { entityId: candidate.entityId, entityType: candidate.entityType, season: TARGET_SEASON, type, skip: 0, limit: 200 },
    }),
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  const items = json?.data?.getEntityFixturesAndResults || [];
  return {
    entityId: candidate.entityId,
    entityType: candidate.entityType,
    sourcePages: candidate.sourcePages,
    type,
    status: r.status,
    errors: json?.errors || [],
    fixtureCount: items.length,
    knownFixture: items.some(x => String(x?.id) === KNOWN_FIXTURE),
    seasons: [...new Set(items.map(x => String(x?.season || '')).filter(Boolean))].sort(),
    competitionIds: [...new Set(items.map(x => String(x?.compId || '')).filter(Boolean))].sort(),
    sample: items.slice(0, 12),
  };
}

const queryResults = [];
for (const candidate of candidates) {
  for (const type of ['results', 'fixtures']) {
    queryResults.push(await queryCandidate(candidate, type));
  }
}

const summary = {
  audit: 'Bounded same-origin crawl to capture real entityId/entityType variables, then test EntityFixturesAndResults season=2017',
  targetSeason: TARGET_SEASON,
  knownFixture: KNOWN_FIXTURE,
  visitedPageCount: seen.size,
  capturedEntityQueryCount: captures.length,
  candidateCount: candidates.length,
  candidates,
  nonEmptyResultCount: queryResults.filter(x => x.fixtureCount > 0).length,
  knownFixtureMatchCount: queryResults.filter(x => x.knownFixture).length,
  knownFixtureMatches: queryResults.filter(x => x.knownFixture),
  queryResults,
  pagesWithEntityQueries: pageReports.filter(x => x.entityQueryCount > 0),
  visitedPages: pageReports.map(x => ({ url: x.url, finalUrl: x.finalUrl, status: x.status, title: x.title, entityQueryCount: x.entityQueryCount })),
  capturedAt: new Date().toISOString(),
};

await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'captures.json'), JSON.stringify(captures, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'page-reports.json'), JSON.stringify(pageReports, null, 2));
console.log(JSON.stringify(summary, null, 2));
