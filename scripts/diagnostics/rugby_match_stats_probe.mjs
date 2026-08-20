import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const targetUrl = process.env.TARGET_URL || 'https://www.rugby.com.au/match-centre/112/2026/951419?tab=Match-Stats';
const outDir = process.env.OUT_DIR || 'artifacts/rugby-match-stats-probe';
const fixtureId = '951419';

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1200 },
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36'
});

const page = await context.newPage();
const network = [];
const responseTasks = [];
const nextDataResponses = [];

const statNames = [
  'Tries', 'Metres', 'Carries', 'Defenders Beaten', 'Clean Breaks', 'Passes',
  'Offloads', 'Turnovers Conceded', 'Tackles', 'Missed Tackles', 'Turnovers Won',
  'Kicks in Play', 'Rucks Won', 'Rucks Lost', 'Ruck Success', 'Rucks Success Rate',
  'Lineouts Won', 'Lineouts Lost', 'Lineouts Success Rate', 'Scrums Won', 'Scrums Lost',
  'Scrums Success Rate', 'Possession', 'First Half', 'Second Half',
  'Ball Possession Last 10 Mins', 'Penalties Conceded', 'Red Cards', 'Yellow Cards'
];

page.on('response', (response) => {
  const task = (async () => {
    const request = response.request();
    const type = request.resourceType();
    if (!['xhr', 'fetch', 'document'].includes(type)) return;

    const record = {
      url: response.url(),
      status: response.status(),
      resourceType: type,
      method: request.method(),
      contentType: response.headers()['content-type'] || '',
    };

    let body = null;
    try {
      const ct = record.contentType.toLowerCase();
      if (ct.includes('json') || type === 'xhr' || type === 'fetch') {
        body = await response.text();
        record.bodyPreview = body.slice(0, 20000);
      }
    } catch (error) {
      record.bodyError = String(error);
    }

    const isNextMatchData =
      record.url.includes('/_next/data/') &&
      record.url.includes('/match-centre/') &&
      record.url.includes(`/${fixtureId}.json`);

    if (isNextMatchData) {
      if (body === null) {
        try {
          body = await response.text();
        } catch (error) {
          record.nextDataBodyError = String(error);
        }
      }
      nextDataResponses.push({
        url: record.url,
        status: record.status,
        contentType: record.contentType,
        body,
      });
    }

    network.push(record);
  })();
  responseTasks.push(task);
});

let navigationError = null;
try {
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(12000);
} catch (error) {
  navigationError = String(error);
}

await Promise.allSettled(responseTasks);

const bodyText = await page.locator('body').innerText().catch(() => '');
const html = await page.content().catch(() => '');
const title = await page.title().catch(() => '');

const foundStats = Object.fromEntries(statNames.map((name) => [name, bodyText.includes(name)]));

const candidateNetwork = network.filter((item) => {
  const haystack = `${item.url}\n${item.bodyPreview || ''}`.toLowerCase();
  return ['stat', 'match', fixtureId, 'rugby', 'fixture'].some((term) => haystack.includes(term));
});

function inspectJson(root) {
  const statKeyPaths = [];
  const statValueHits = [];
  const likelyContainers = [];
  const seen = new Set();

  function walk(value, currentPath = '$') {
    if (value === null || typeof value !== 'object') return;
    if (seen.has(value)) return;
    seen.add(value);

    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${currentPath}[${index}]`));
      return;
    }

    const keys = Object.keys(value);
    const matchingKeys = keys.filter((key) => /stat|metre|carry|ruck|tackle|possession|penalt|turnover|break/i.test(key));
    if (matchingKeys.length && likelyContainers.length < 100) {
      likelyContainers.push({
        path: currentPath,
        matchingKeys,
        preview: JSON.stringify(value).slice(0, 5000),
      });
    }

    for (const [key, child] of Object.entries(value)) {
      const childPath = `${currentPath}.${key}`;
      if (/stat/i.test(key) && statKeyPaths.length < 200) {
        statKeyPaths.push(childPath);
      }
      if (typeof child === 'string' && statNames.includes(child) && statValueHits.length < 200) {
        statValueHits.push({
          path: childPath,
          value: child,
          parentPreview: JSON.stringify(value).slice(0, 5000),
        });
      }
      walk(child, childPath);
    }
  }

  walk(root);
  return { statKeyPaths, statValueHits, likelyContainers };
}

const nextDataSummary = [];
for (let index = 0; index < nextDataResponses.length; index += 1) {
  const item = nextDataResponses[index];
  const entry = {
    url: item.url,
    status: item.status,
    contentType: item.contentType,
    bodyLength: item.body?.length ?? 0,
    parsed: false,
  };

  if (item.body) {
    await fs.writeFile(path.join(outDir, `next-data-${fixtureId}-${index}.json`), item.body);
    try {
      const parsed = JSON.parse(item.body);
      entry.parsed = true;
      entry.topLevelKeys = Object.keys(parsed);
      entry.pagePropsKeys = parsed?.pageProps && typeof parsed.pageProps === 'object'
        ? Object.keys(parsed.pageProps)
        : [];
      entry.inspection = inspectJson(parsed);
      await fs.writeFile(
        path.join(outDir, `next-data-${fixtureId}-${index}-inspection.json`),
        JSON.stringify(entry.inspection, null, 2)
      );
    } catch (error) {
      entry.parseError = String(error);
    }
  }
  nextDataSummary.push(entry);
}

await fs.writeFile(path.join(outDir, 'network.json'), JSON.stringify(network, null, 2));
await fs.writeFile(path.join(outDir, 'network-candidates.json'), JSON.stringify(candidateNetwork, null, 2));
await fs.writeFile(path.join(outDir, 'next-data-summary.json'), JSON.stringify(nextDataSummary, null, 2));
await fs.writeFile(path.join(outDir, 'page.html'), html);
await fs.writeFile(path.join(outDir, 'stats-text.txt'), bodyText);
await fs.writeFile(path.join(outDir, 'summary.json'), JSON.stringify({
  targetUrl,
  finalUrl: page.url(),
  title,
  navigationError,
  foundStats,
  networkCount: network.length,
  candidateNetworkCount: candidateNetwork.length,
  nextDataResponseCount: nextDataResponses.length,
  nextDataUrls: nextDataResponses.map((item) => item.url),
  capturedAt: new Date().toISOString(),
}, null, 2));

await page.screenshot({ path: path.join(outDir, 'page.png'), fullPage: true }).catch(() => {});

console.log(JSON.stringify({
  targetUrl,
  finalUrl: page.url(),
  title,
  navigationError,
  foundStats,
  networkCount: network.length,
  candidateNetworkCount: candidateNetwork.length,
  nextDataResponseCount: nextDataResponses.length,
  nextDataUrls: nextDataResponses.map((item) => item.url),
}, null, 2));

await browser.close();
