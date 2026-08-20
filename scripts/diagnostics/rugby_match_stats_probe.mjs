import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const targetUrl = process.env.TARGET_URL || 'https://www.rugby.com.au/match-centre/112/2026/951419?tab=Match-Stats';
const outDir = process.env.OUT_DIR || 'artifacts/rugby-match-stats-probe';

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1200 },
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36'
});

const page = await context.newPage();
const network = [];

page.on('response', async (response) => {
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

  try {
    const ct = record.contentType.toLowerCase();
    if (ct.includes('json') || type === 'xhr' || type === 'fetch') {
      const body = await response.text();
      record.bodyPreview = body.slice(0, 20000);
    }
  } catch (error) {
    record.bodyError = String(error);
  }

  network.push(record);
});

let navigationError = null;
try {
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(12000);
} catch (error) {
  navigationError = String(error);
}

const bodyText = await page.locator('body').innerText().catch(() => '');
const html = await page.content().catch(() => '');
const title = await page.title().catch(() => '');

const statNames = [
  'Tries', 'Metres', 'Carries', 'Defenders Beaten', 'Clean Breaks', 'Passes',
  'Offloads', 'Turnovers Conceded', 'Tackles', 'Missed Tackles', 'Turnovers Won',
  'Kicks in Play', 'Rucks Won', 'Rucks Lost', 'Ruck Success', 'Lineouts Won',
  'Lineouts Lost', 'Scrums Won', 'Scrums Lost', 'Possession', 'Penalties Conceded',
  'Yellow Cards'
];

const foundStats = Object.fromEntries(statNames.map((name) => [name, bodyText.includes(name)]));

const candidateNetwork = network.filter((item) => {
  const haystack = `${item.url}\n${item.bodyPreview || ''}`.toLowerCase();
  return ['stat', 'match', '951419', 'rugby', 'fixture'].some((term) => haystack.includes(term));
});

await fs.writeFile(path.join(outDir, 'network.json'), JSON.stringify(network, null, 2));
await fs.writeFile(path.join(outDir, 'network-candidates.json'), JSON.stringify(candidateNetwork, null, 2));
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
}, null, 2));

await browser.close();

// Probe trigger marker: workflow already exists on this branch before this push.
