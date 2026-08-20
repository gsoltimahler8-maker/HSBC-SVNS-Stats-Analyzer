import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const TARGET_URL = 'https://www.rugby.com.au/fixtures-results?team=420&comp=All&tab=Results';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-results-pagination-probe';
await fs.mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
const page = await context.newPage();

const gql = [];
page.on('response', async (response) => {
  const req = response.request();
  if (!response.url().includes('rugby-au-cms.graphcdn.app')) return;
  const postData = req.postData() || '';
  let parsed = null;
  try { parsed = JSON.parse(postData); } catch {}
  if (parsed?.operationName !== 'FixturesAndResults') return;
  let body = '';
  try { body = await response.text(); } catch {}
  gql.push({
    status: response.status(),
    method: req.method(),
    operationName: parsed?.operationName || null,
    variables: parsed?.variables || null,
    query: parsed?.query || null,
    responseLength: body.length,
    responsePreview: body.slice(0, 10000),
  });
});

await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(8000);

async function matchLinks() {
  const hrefs = await page.locator('a[href*="/match-centre/"]').evaluateAll((els) =>
    [...new Set(els.map(a => a.getAttribute('href')).filter(Boolean))]
  );
  return hrefs.filter(x => /^\/match-centre\/\d+\/\d+\/\d+/.test(x));
}

const snapshots = [];
const buttonText = await page.locator('button').allInnerTexts().catch(() => []);
const linkText = await page.locator('a').allInnerTexts().catch(() => []);
const moreLabels = [...new Set([...buttonText, ...linkText].filter(x => /load more|show more|more results|older|previous/i.test(x)))];

let links = await matchLinks();
snapshots.push({ step: 0, count: links.length, links });

for (let i = 1; i <= 8; i++) {
  let clicked = false;
  for (const re of [/load more/i, /show more/i, /more results/i, /older/i, /previous/i]) {
    const loc = page.getByRole('button', { name: re }).or(page.getByRole('link', { name: re })).first();
    try {
      if (await loc.count() && await loc.isVisible()) {
        await loc.click({ timeout: 4000 });
        clicked = true;
        await page.waitForTimeout(4000);
        break;
      }
    } catch {}
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(3500);
  const nextLinks = await matchLinks();
  snapshots.push({ step: i, clicked, count: nextLinks.length, links: nextLinks });
  if (nextLinks.length === links.length && !clicked && i >= 3) break;
  links = nextLinks;
}

const fixtureIds = [...new Set(links.map(x => (x.match(/\/match-centre\/\d+\/\d+\/(\d+)/) || [])[1]).filter(Boolean))];
const competitionIds = [...new Set(links.map(x => (x.match(/\/match-centre\/(\d+)\//) || [])[1]).filter(Boolean))];
const seasons = [...new Set(links.map(x => (x.match(/\/match-centre\/\d+\/(\d+)\//) || [])[1]).filter(Boolean))];

const gqlSummary = gql.map((x, i) => ({
  index: i,
  status: x.status,
  operationName: x.operationName,
  variableKeys: Object.keys(x.variables || {}),
  variables: x.variables,
  queryHasPaginationTerms: /page|offset|skip|first|after|cursor|limit|take/i.test(x.query || ''),
  queryPaginationLines: (x.query || '').split('\n').filter(line => /page|offset|skip|first|after|cursor|limit|take/i.test(line)).slice(0, 30),
  responseLength: x.responseLength,
}));

const summary = {
  targetUrl: TARGET_URL,
  initialCount: snapshots[0]?.count || 0,
  finalCount: links.length,
  moreLabels,
  snapshots: snapshots.map(s => ({ step: s.step, clicked: s.clicked || false, count: s.count })),
  fixtureCount: fixtureIds.length,
  fixtureIds,
  competitionIds,
  seasons,
  graphqlRequestCount: gql.length,
  graphql: gqlSummary,
  capturedAt: new Date().toISOString(),
};

await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'graphql-full.json'), JSON.stringify(gql, null, 2));
await page.screenshot({ path: path.join(OUT_DIR, 'page.png'), fullPage: true }).catch(() => {});
console.log(JSON.stringify(summary, null, 2));
await browser.close();
