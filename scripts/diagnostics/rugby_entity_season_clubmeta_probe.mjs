import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const GQL = 'https://rugby-au-cms.graphcdn.app/';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-entity-season-clubmeta';
const TARGET_SEASON = '2017';
const KNOWN_FIXTURE = '37719';

await fs.mkdir(OUT_DIR, { recursive: true });

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
};
const norm = v => v == null ? '' : String(v).trim();

async function fetchText(url, init = {}) {
  const r = await fetch(url, { ...init, headers: { ...headers, ...(init.headers || {}) }, redirect: 'follow' });
  return { ok: r.ok, status: r.status, text: await r.text(), url: r.url, contentType: r.headers.get('content-type') || '' };
}

function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

function summarizeObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  const pick = {};
  for (const key of ['externalEntityId','entityId','entityType','type','id','name','label','title','slug','site','siteName']) {
    if (obj[key] !== undefined && obj[key] !== null && typeof obj[key] !== 'object') pick[key] = obj[key];
  }
  return pick;
}

function walk(value, pathStr = '$', out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${pathStr}[${i}]`, out));
    return out;
  }

  const keys = Object.keys(value);
  const interesting = keys.some(k => /externalEntityId|entityId|entityType|clubSiteMeta/i.test(k));
  if (interesting) out.push({ path: pathStr, keys, summary: summarizeObject(value) });

  for (const [k, v] of Object.entries(value)) walk(v, `${pathStr}.${k}`, out);
  return out;
}

function regexSnippets(text, term, radius = 260) {
  const out = [];
  let start = 0;
  while (out.length < 12) {
    const i = text.indexOf(term, start);
    if (i < 0) break;
    out.push(text.slice(Math.max(0, i-radius), Math.min(text.length, i+term.length+radius)).replace(/\s+/g, ' '));
    start = i + term.length;
  }
  return out;
}

const pageUrls = [
  `${BASE}/`,
  `${BASE}/fixtures-results`,
  `${BASE}/competitions/fixtures-results`,
];

const pageReports = [];
const candidateMap = new Map();

for (const url of pageUrls) {
  try {
    const r = await fetchText(url);
    const nd = r.ok ? extractNextData(r.text) : null;
    const hits = nd ? walk(nd) : [];
    const snippets = regexSnippets(r.text, 'externalEntityId');

    for (const hit of hits) {
      const s = hit.summary || {};
      const id = Number(s.externalEntityId ?? s.entityId);
      const type = norm(s.type || s.entityType);
      if (Number.isFinite(id) && type) {
        candidateMap.set(`${id}|${type}`, { entityId: id, entityType: type, sourceUrl: url, sourcePath: hit.path, sourceSummary: s });
      }
    }

    pageReports.push({
      url,
      ok: r.ok,
      status: r.status,
      finalUrl: r.url,
      nextDataPresent: Boolean(nd),
      interestingObjectCount: hits.length,
      interestingObjects: hits.slice(0, 50),
      externalEntityIdHtmlSnippetCount: snippets.length,
      externalEntityIdHtmlSnippets: snippets,
    });
  } catch (error) {
    pageReports.push({ url, ok: false, error: String(error) });
  }
}

const query = `query EntityFixturesAndResults($entityId: Int, $entityType: String, $season: String, $comps: [CompInput], $teams: [String], $type: String, $skip: Int, $limit: Int) {
  getEntityFixturesAndResults(
    season: $season
    comps: $comps
    teams: $teams
    entityId: $entityId
    entityType: $entityType
    type: $type
    limit: $limit
    skip: $skip
  ) {
    id
    compId
    compName
    dateTime
    season
    sourceType
    status
  }
}`;

async function runEntityQuery(candidate) {
  const variables = {
    entityId: candidate.entityId,
    entityType: candidate.entityType,
    season: TARGET_SEASON,
    comps: [],
    teams: [],
    type: 'results',
    skip: 0,
    limit: 200,
  };
  try {
    const r = await fetchText(GQL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ operationName: 'EntityFixturesAndResults', query, variables }),
    });
    let parsed = null;
    try { parsed = JSON.parse(r.text); } catch {}
    const fixtures = parsed?.data?.getEntityFixturesAndResults || [];
    return {
      ...candidate,
      status: r.status,
      errors: parsed?.errors || [],
      fixtureCount: Array.isArray(fixtures) ? fixtures.length : 0,
      seasons: [...new Set((Array.isArray(fixtures) ? fixtures : []).map(x => norm(x?.season)).filter(Boolean))],
      knownFixture37719: (Array.isArray(fixtures) ? fixtures : []).some(x => norm(x?.id) === KNOWN_FIXTURE),
      sample: (Array.isArray(fixtures) ? fixtures : []).slice(0, 12),
    };
  } catch (error) {
    return { ...candidate, status: 0, errors: [{ message: String(error) }], fixtureCount: 0, seasons: [], knownFixture37719: false, sample: [] };
  }
}

const candidates = [...candidateMap.values()];
const queryResults = [];
for (const c of candidates) queryResults.push(await runEntityQuery(c));

await fs.writeFile(path.join(OUT_DIR, 'page-reports.json'), JSON.stringify(pageReports, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'query-results.json'), JSON.stringify(queryResults, null, 2));

const summary = {
  audit: 'Extract clubSiteMeta externalEntityId/type candidates and test EntityFixturesAndResults season=2017',
  targetSeason: TARGET_SEASON,
  knownFixture: KNOWN_FIXTURE,
  pageCount: pageReports.length,
  candidateCount: candidates.length,
  candidates,
  queryResultCount: queryResults.length,
  nonEmptyResultCount: queryResults.filter(x => x.fixtureCount > 0).length,
  knownFixtureMatchCount: queryResults.filter(x => x.knownFixture37719).length,
  queryResults,
  pageReports: pageReports.map(p => ({
    url: p.url,
    ok: p.ok,
    status: p.status,
    finalUrl: p.finalUrl,
    nextDataPresent: p.nextDataPresent,
    interestingObjectCount: p.interestingObjectCount,
    interestingObjects: p.interestingObjects,
    externalEntityIdHtmlSnippetCount: p.externalEntityIdHtmlSnippetCount,
  })),
  capturedAt: new Date().toISOString(),
};

await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
