import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-legacy-sevens-discovery';
await fs.mkdir(OUT_DIR, { recursive: true });

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const norm = (v) => v == null ? '' : String(v).trim();

async function fetchText(url, options = {}) {
  const r = await fetch(url, { headers: { ...headers, ...(options.headers || {}) }, redirect: 'follow', ...options });
  const text = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}: ${text.slice(0, 250)}`);
  return { text, status: r.status, contentType: r.headers.get('content-type') || '', finalUrl: r.url };
}

function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}

function parseMatchLink(href) {
  const m = href.match(/\/match-centre\/(\d+)\/(\d+)\/(\d+)/);
  return m ? { href: m[0], comp: m[1], season: m[2], fixture: m[3] } : null;
}

function extractMatchLinks(text) {
  const found = text.match(/\/match-centre\/\d+\/\d+\/\d+/g) || [];
  return [...new Set(found)].map(parseMatchLink).filter(Boolean);
}

function statCount(playSummary) {
  return Object.values(playSummary || {}).reduce((n, xs) => n + (Array.isArray(xs) ? xs.length : 0), 0);
}

async function inspectSeed(seed) {
  const matchUrl = `${BASE}/match-centre/${seed.comp}/${seed.season}/${seed.fixture}?tab=Match-Stats`;
  const out = { ...seed, matchUrl, ok: false };
  try {
    const pageRes = await fetchText(matchUrl);
    const next = extractNextData(pageRes.text);
    const buildId = next.buildId;
    const dataUrl = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${seed.comp}/${seed.season}/${seed.fixture}.json?tab=Match-Stats&comp=${seed.comp}&season=${seed.season}&fixture=${seed.fixture}`;
    const dataRes = await fetchText(dataUrl);
    const data = JSON.parse(dataRes.text);
    const md = data?.pageProps?.matchData || {};
    const f = md?.getFixtureItem || {};
    const s = md?.allMatchStatsSummary || {};
    out.ok = true;
    out.dataUrl = dataUrl;
    out.competitionName = norm(f.compName);
    out.dateTime = norm(f.dateTime);
    out.homeTeam = norm(f.homeTeam?.name);
    out.awayTeam = norm(f.awayTeam?.name);
    out.statsPresent = statCount(s.playSummary) > 0;
    out.statCount = statCount(s.playSummary);
    out.commentaryPresent = Array.isArray(md.allMatchCommentary) ? md.allMatchCommentary.length > 0 : Boolean(md.allMatchCommentary);
    out.commentaryCount = Array.isArray(md.allMatchCommentary) ? md.allMatchCommentary.length : (md.allMatchCommentary ? 1 : 0);
    out.pointsSummaryPresent = Boolean(s.pointsSummary);
    out.lineupPresent = Boolean(s.lineUp);
    out.matchDataKeys = Object.keys(md).sort();
    await fs.writeFile(path.join(OUT_DIR, `seed-${seed.comp}-${seed.season}-${seed.fixture}.json`), dataRes.text);
  } catch (error) {
    out.error = String(error);
  }
  return out;
}

async function probeSitemaps() {
  const common = ['/robots.txt','/sitemap.xml','/sitemap_index.xml','/sitemap-index.xml'];
  const queue = common.map(x => `${BASE}${x}`);
  const seen = new Set();
  const reports = [];
  const legacyLinks = new Map();

  while (queue.length && seen.size < 30) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    const report = { url, ok: false };
    try {
      const r = await fetchText(url);
      report.ok = true;
      report.status = r.status;
      report.contentType = r.contentType;
      report.bodyLength = r.text.length;
      const links = extractMatchLinks(r.text);
      report.matchLinkCount = links.length;
      report.legacyMatchLinkCount = links.filter(x => Number(x.season) < 2023).length;
      for (const x of links.filter(x => Number(x.season) < 2023)) legacyLinks.set(`${x.comp}/${x.season}/${x.fixture}`, x);

      const locs = [...r.text.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(m => m[1].trim());
      report.childSitemapCount = locs.filter(x => /sitemap/i.test(x)).length;
      for (const loc of locs.filter(x => /sitemap/i.test(x)).slice(0, 25)) {
        if (!seen.has(loc) && loc.startsWith(BASE)) queue.push(loc);
      }

      if (/robots\.txt/i.test(url)) {
        const sitemapLines = r.text.split(/\r?\n/).filter(line => /^sitemap\s*:/i.test(line));
        report.robotsSitemaps = sitemapLines;
        for (const line of sitemapLines) {
          const candidate = line.replace(/^sitemap\s*:\s*/i, '').trim();
          if (candidate.startsWith(BASE) && !seen.has(candidate)) queue.push(candidate);
        }
      }
    } catch (error) {
      report.error = String(error);
    }
    reports.push(report);
  }
  return { reports, legacyLinks: [...legacyLinks.values()] };
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
const page = await context.newPage();

let activeVariant = '';
const graphql = [];
page.on('request', (req) => {
  if (!req.url().includes('rugby-au-cms.graphcdn.app')) return;
  const postData = req.postData() || '';
  let parsed = null;
  try { parsed = JSON.parse(postData); } catch {}
  if (parsed?.operationName !== 'FixturesAndResults') return;
  graphql.push({
    variant: activeVariant,
    url: req.url(),
    method: req.method(),
    operationName: parsed.operationName,
    variables: parsed.variables || null,
    query: parsed.query || null,
  });
});

async function collectLinksCurrentPage() {
  const hrefs = await page.locator('a[href*="/match-centre/"]').evaluateAll(els =>
    [...new Set(els.map(a => a.getAttribute('href')).filter(Boolean))]
  ).catch(() => []);
  return hrefs.map(parseMatchLink).filter(Boolean);
}

async function probeVariant(name, url) {
  activeVariant = name;
  const report = { name, url, ok: false, snapshots: [] };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(6000);
    let links = await collectLinksCurrentPage();
    report.snapshots.push({ step: 0, count: links.length });

    for (let i = 1; i <= 4; i++) {
      let clicked = false;
      const more = page.getByRole('button', { name: /load more/i }).or(page.getByRole('link', { name: /load more/i })).first();
      try {
        if (await more.count() && await more.isVisible()) {
          await more.click({ timeout: 4000 });
          clicked = true;
          await page.waitForTimeout(2500);
        }
      } catch {}
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      const next = await collectLinksCurrentPage();
      report.snapshots.push({ step: i, count: next.length, clicked });
      if (next.length === links.length && !clicked) { links = next; break; }
      links = next;
    }

    report.ok = true;
    report.finalUrl = page.url();
    report.linkCount = links.length;
    report.seasons = [...new Set(links.map(x => x.season))].sort();
    report.legacyLinkCount = links.filter(x => Number(x.season) < 2023).length;
    report.legacyLinks = links.filter(x => Number(x.season) < 2023).slice(0, 100);
    report.sampleLinks = links.slice(0, 20);
  } catch (error) {
    report.error = String(error);
  }
  return report;
}

const seed = await inspectSeed({ comp:'257', season:'2017', fixture:'37719' });
const sitemapProbe = await probeSitemaps();

const variants = [
  ['current_comp_257', `${BASE}/fixtures-results?team=All&comp=257&tab=Results`],
  ['season_2017', `${BASE}/fixtures-results?team=All&comp=257&season=2017&tab=Results`],
  ['year_2017', `${BASE}/fixtures-results?team=All&comp=257&year=2017&tab=Results`],
  ['season_2017_first', `${BASE}/fixtures-results?season=2017&team=All&comp=257&tab=Results`],
  ['date_from_to_2017', `${BASE}/fixtures-results?team=All&comp=257&from=2017-01-01&to=2017-12-31&tab=Results`],
  ['date_start_end_2017', `${BASE}/fixtures-results?team=All&comp=257&startDate=2017-01-01&endDate=2017-12-31&tab=Results`],
];

const variantReports = [];
for (const [name, url] of variants) {
  variantReports.push(await probeVariant(name, url));
  await sleep(300);
}

await browser.close();

function queryPaginationLines(q) {
  return norm(q).split('\n').filter(line => /season|year|date|from|to|start|end|page|offset|skip|first|after|cursor|limit|take/i.test(line)).slice(0, 50);
}

const graphqlSummary = graphql.map((x, i) => ({
  index: i,
  variant: x.variant,
  variableKeys: Object.keys(x.variables || {}),
  variables: x.variables,
  queryRelevantLines: queryPaginationLines(x.query),
}));

const allLegacyLinks = new Map();
for (const x of sitemapProbe.legacyLinks) allLegacyLinks.set(`${x.comp}/${x.season}/${x.fixture}`, x);
for (const r of variantReports) for (const x of (r.legacyLinks || [])) allLegacyLinks.set(`${x.comp}/${x.season}/${x.fixture}`, x);
if (seed.ok) allLegacyLinks.set(`${seed.comp}/${seed.season}/${seed.fixture}`, { href:`/match-centre/${seed.comp}/${seed.season}/${seed.fixture}`, comp:seed.comp, season:seed.season, fixture:seed.fixture });

const legacyLinks = [...allLegacyLinks.values()].sort((a,b) => a.season.localeCompare(b.season) || Number(a.comp)-Number(b.comp) || Number(a.fixture)-Number(b.fixture));
const legacySeasons = [...new Set(legacyLinks.map(x => x.season))].sort();
const legacyCompetitions = [...new Set(legacyLinks.map(x => x.comp))].sort((a,b) => Number(a)-Number(b));

const summary = {
  audit: 'Legacy World Rugby Sevens Series discovery probe',
  seed,
  sitemapProbe: {
    checkedUrlCount: sitemapProbe.reports.length,
    reports: sitemapProbe.reports,
    legacyLinkCount: sitemapProbe.legacyLinks.length,
  },
  variants: variantReports,
  graphqlRequestCount: graphql.length,
  graphql: graphqlSummary,
  discoveredLegacyLinkCount: legacyLinks.length,
  legacySeasons,
  legacyCompetitions,
  oldestLegacyLinks: legacyLinks.slice(0, 50),
  capturedAt: new Date().toISOString(),
};

await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'graphql-full.json'), JSON.stringify(graphql, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'legacy-links.json'), JSON.stringify(legacyLinks, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'sitemap-reports.json'), JSON.stringify(sitemapProbe.reports, null, 2));
console.log(JSON.stringify(summary, null, 2));
