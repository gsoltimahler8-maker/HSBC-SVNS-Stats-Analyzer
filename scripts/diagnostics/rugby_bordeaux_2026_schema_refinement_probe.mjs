import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const COMP_ID = '112';
const SEASON = '2026';
const RESULTS_URL = `${BASE}/fixtures-results?team=All&comp=${COMP_ID}&tab=Results`;
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-bordeaux-2026-schema-refinement';

await fs.mkdir(OUT_DIR, { recursive: true });

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const norm = (v) => v == null ? '' : String(v).trim();
const keyNorm = (v) => String(v).toLowerCase().replace(/[^a-z0-9]/g, '');

async function fetchText(url) {
  const r = await fetch(url, { headers, redirect: 'follow' });
  const text = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}: ${text.slice(0, 300)}`);
  return text;
}

function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}

function normalizePath(p) {
  return p.replace(/\[\d+\]/g, '[]');
}

function scalarKeys(obj) {
  return Object.entries(obj || {})
    .filter(([, v]) => v == null || ['string', 'number', 'boolean'].includes(typeof v))
    .map(([k]) => k)
    .sort();
}

function objectSignature(obj) {
  return Object.keys(obj || {}).sort().join('|');
}

function compactSample(obj, limit = 2500) {
  const text = JSON.stringify(obj);
  return text.length <= limit ? obj : { _truncated: text.slice(0, limit) };
}

function walkArrays(value, currentPath = '$', out = []) {
  if (value == null) return out;
  if (Array.isArray(value)) {
    out.push({ path: normalizePath(currentPath), array: value });
    value.forEach((v, i) => {
      if (v && typeof v === 'object') walkArrays(v, `${currentPath}[${i}]`, out);
    });
    return out;
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (v && typeof v === 'object') walkArrays(v, `${currentPath}.${k}`, out);
    }
  }
  return out;
}

function scoreCandidate(kind, scalarKeyList) {
  const ks = scalarKeyList.map(keyNorm);
  const has = (...terms) => ks.some(k => terms.some(t => k.includes(t)));
  let score = 0;
  if (kind === 'commentary') {
    if (has('commentary', 'comment', 'text', 'description', 'message')) score += 5;
    if (has('matchclock', 'clock', 'minute', 'time', 'timestamp')) score += 4;
    if (has('eventtype', 'type', 'action', 'title')) score += 2;
    if (has('team')) score += 1;
    if (has('player')) score += 1;
  } else if (kind === 'pointsSummary') {
    if (has('matchclock', 'clock', 'minute', 'time', 'timestamp')) score += 4;
    if (has('score', 'homescore', 'awayscore')) score += 4;
    if (has('player')) score += 2;
    if (has('team')) score += 2;
    if (has('eventtype', 'type', 'action', 'title', 'name')) score += 1;
  } else if (kind === 'lineup') {
    if (has('player', 'person', 'fullname', 'firstname', 'lastname')) score += 5;
    if (has('team')) score += 2;
    if (has('jersey', 'shirt', 'position', 'role')) score += 3;
    if (has('captain')) score += 1;
  }
  return score;
}

function summarizeDataset(kind, fixtures) {
  const byPath = new Map();
  for (const fixture of fixtures) {
    const arrays = walkArrays(fixture.value);
    for (const { path: arrayPath, array } of arrays) {
      if (!byPath.has(arrayPath)) {
        byPath.set(arrayPath, {
          path: arrayPath,
          fixtureIds: new Set(),
          arrayOccurrences: 0,
          totalElements: 0,
          objectElements: 0,
          signatureCounts: new Map(),
          scalarKeyCounts: new Map(),
          samples: [],
        });
      }
      const s = byPath.get(arrayPath);
      s.fixtureIds.add(fixture.fixtureId);
      s.arrayOccurrences++;
      s.totalElements += array.length;
      for (const item of array) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
        s.objectElements++;
        const sig = objectSignature(item);
        s.signatureCounts.set(sig, (s.signatureCounts.get(sig) || 0) + 1);
        for (const k of scalarKeys(item)) s.scalarKeyCounts.set(k, (s.scalarKeyCounts.get(k) || 0) + 1);
        if (s.samples.length < 3) s.samples.push({ fixtureId: fixture.fixtureId, object: compactSample(item) });
      }
    }
  }

  const paths = [...byPath.values()].map(s => {
    const scalarKeysSorted = [...s.scalarKeyCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return {
      path: s.path,
      fixtureCount: s.fixtureIds.size,
      arrayOccurrences: s.arrayOccurrences,
      totalElements: s.totalElements,
      objectElements: s.objectElements,
      candidateScore: scoreCandidate(kind, scalarKeysSorted.map(([k]) => k)),
      topSignatures: [...s.signatureCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([signature, count]) => ({ signature, count })),
      scalarKeyFrequency: scalarKeysSorted.slice(0, 40).map(([key, count]) => ({ key, count })),
      samples: s.samples,
    };
  }).sort((a, b) => b.candidateScore - a.candidateScore || b.objectElements - a.objectElements || a.path.localeCompare(b.path));

  return {
    kind,
    fixtureCount: fixtures.length,
    rootTypes: fixtures.reduce((acc, f) => {
      const type = Array.isArray(f.value) ? 'array' : f.value === null ? 'null' : typeof f.value;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}),
    topCandidates: paths.slice(0, 12),
    allPaths: paths,
  };
}

async function discoverLinks() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  await page.goto(RESULTS_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(7000);

  async function linksNow() {
    const hrefs = await page.locator('a[href*="/match-centre/"]').evaluateAll(els =>
      [...new Set(els.map(a => a.getAttribute('href')).filter(Boolean))]
    );
    return hrefs.filter(x => /^\/match-centre\/\d+\/\d+\/\d+/.test(x));
  }

  let links = await linksNow();
  for (let i = 0; i < 8; i++) {
    let clicked = false;
    const more = page.getByRole('button', { name: /load more/i }).or(page.getByRole('link', { name: /load more/i })).first();
    try {
      if (await more.count() && await more.isVisible()) {
        await more.click({ timeout: 4000 });
        clicked = true;
        await page.waitForTimeout(3000);
      }
    } catch {}
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    const next = await linksNow();
    if (next.length === links.length && !clicked) { links = next; break; }
    links = next;
  }
  await browser.close();

  return [...new Set(links)]
    .map(href => {
      const m = href.match(/^\/match-centre\/(\d+)\/(\d+)\/(\d+)/);
      return m ? { href, comp: m[1], season: m[2], fixture: m[3] } : null;
    })
    .filter(Boolean)
    .filter(x => x.comp === COMP_ID && x.season === SEASON);
}

const links = await discoverLinks();
const commentaryFixtures = [];
const pointsFixtures = [];
const lineupFixtures = [];
const failures = [];

for (let i = 0; i < links.length; i++) {
  const link = links[i];
  try {
    const matchUrl = `${BASE}${link.href}?tab=Match-Stats`;
    const html = await fetchText(matchUrl);
    const next = extractNextData(html);
    const buildId = next.buildId;
    const dataUrl = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${link.comp}/${link.season}/${link.fixture}.json?tab=Match-Stats&comp=${link.comp}&season=${link.season}&fixture=${link.fixture}`;
    const raw = JSON.parse(await fetchText(dataUrl));
    const md = raw?.pageProps?.matchData || {};
    commentaryFixtures.push({ fixtureId: link.fixture, value: md?.allMatchCommentary ?? null });
    pointsFixtures.push({ fixtureId: link.fixture, value: md?.allMatchStatsSummary?.pointsSummary ?? null });
    lineupFixtures.push({ fixtureId: link.fixture, value: md?.allMatchStatsSummary?.lineUp ?? null });
  } catch (error) {
    failures.push({ ...link, error: String(error) });
  }
  if (i < links.length - 1) await sleep(80);
}

const commentary = summarizeDataset('commentary', commentaryFixtures);
const pointsSummary = summarizeDataset('pointsSummary', pointsFixtures);
const lineup = summarizeDataset('lineup', lineupFixtures);

await fs.writeFile(path.join(OUT_DIR, 'commentary-shapes.json'), JSON.stringify(commentary, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'points-summary-shapes.json'), JSON.stringify(pointsSummary, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'lineup-shapes.json'), JSON.stringify(lineup, null, 2));

function concise(ds) {
  return {
    rootTypes: ds.rootTypes,
    bestCandidates: ds.topCandidates.slice(0, 5).map(x => ({
      path: x.path,
      fixtureCount: x.fixtureCount,
      totalElements: x.totalElements,
      objectElements: x.objectElements,
      candidateScore: x.candidateScore,
      topSignatures: x.topSignatures.slice(0, 3),
      scalarKeyFrequency: x.scalarKeyFrequency.slice(0, 20),
      samples: x.samples.slice(0, 2),
    })),
  };
}

const summary = {
  audit: 'Bordeaux 2026 Women schema refinement for commentary / points summary / lineup',
  competitionId: COMP_ID,
  season: SEASON,
  discoveredLinkCount: links.length,
  collectedCount: commentaryFixtures.length,
  failureCount: failures.length,
  commentary: concise(commentary),
  pointsSummary: concise(pointsSummary),
  lineup: concise(lineup),
  failures,
  capturedAt: new Date().toISOString(),
};

await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
