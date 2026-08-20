import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const targetUrl = 'https://www.rugby.com.au/fixtures-results';
const outDir = process.env.OUT_DIR || 'artifacts/rugby-results-network-probe';
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1200 },
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
});
const page = await context.newPage();

const network = [];
let responseSeq = 0;

page.on('response', async (response) => {
  const request = response.request();
  const type = request.resourceType();
  if (!['xhr', 'fetch', 'document'].includes(type)) return;

  const item = {
    seq: ++responseSeq,
    url: response.url(),
    status: response.status(),
    method: request.method(),
    resourceType: type,
    contentType: response.headers()['content-type'] || '',
  };

  try {
    if (type === 'xhr' || type === 'fetch' || item.contentType.toLowerCase().includes('json')) {
      const body = await response.text();
      item.bodyLength = body.length;
      item.bodyPreview = body.slice(0, 50000);

      const haystack = `${item.url}\n${body}`.toLowerCase();
      const terms = ['fixture', 'result', 'match', 'competition', 'japan women 7s', '"420"', '951419', '950722'];
      item.matchedTerms = terms.filter((term) => haystack.includes(term));

      if (item.matchedTerms.length) {
        const safeName = `candidate-${String(item.seq).padStart(3, '0')}.txt`;
        await fs.writeFile(path.join(outDir, safeName), `URL: ${item.url}\nSTATUS: ${item.status}\nTYPE: ${item.resourceType}\nMATCHED: ${item.matchedTerms.join(', ')}\n\n${body}`);
        item.savedBody = safeName;
      }
    }
  } catch (error) {
    item.bodyError = String(error);
  }

  network.push(item);
});

let navigationError = null;
let clickedResults = false;
let clickError = null;

try {
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);

  // Prefer an accessible Results tab/button/link if one exists.
  const candidates = [
    page.getByRole('tab', { name: /^Results$/i }),
    page.getByRole('button', { name: /^Results$/i }),
    page.getByRole('link', { name: /^Results$/i }),
    page.getByText(/^Results$/i).first(),
  ];
  for (const locator of candidates) {
    try {
      if (await locator.count()) {
        await locator.first().click({ timeout: 5000 });
        clickedResults = true;
        break;
      }
    } catch (error) {
      clickError = String(error);
    }
  }

  await page.waitForTimeout(12000);
} catch (error) {
  navigationError = String(error);
}

const bodyText = await page.locator('body').innerText().catch(() => '');
const html = await page.content().catch(() => '');
const title = await page.title().catch(() => '');

const candidates = network.filter((x) => (x.matchedTerms || []).length > 0);
const likelyApi = candidates.filter((x) => {
  const u = x.url.toLowerCase();
  return x.resourceType !== 'document' && !u.includes('google') && !u.includes('doubleclick') && !u.includes('analytics');
});

const knownFixtureMentions = ['951419', '950722', 'Japan Women 7s'].filter((x) => bodyText.includes(x));

const summary = {
  targetUrl,
  finalUrl: page.url(),
  title,
  navigationError,
  clickedResults,
  clickError,
  bodyHasResultsText: bodyText.includes('Results'),
  bodyHasJapanWomen7s: bodyText.includes('Japan Women 7s'),
  knownFixtureMentions,
  networkCount: network.length,
  candidateCount: candidates.length,
  likelyApiCount: likelyApi.length,
  likelyApi: likelyApi.slice(0, 30).map((x) => ({
    seq: x.seq,
    status: x.status,
    resourceType: x.resourceType,
    url: x.url,
    contentType: x.contentType,
    bodyLength: x.bodyLength,
    matchedTerms: x.matchedTerms,
    savedBody: x.savedBody,
  })),
  capturedAt: new Date().toISOString(),
};

await fs.writeFile(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(outDir, 'network.json'), JSON.stringify(network, null, 2));
await fs.writeFile(path.join(outDir, 'page.html'), html);
await fs.writeFile(path.join(outDir, 'page-text.txt'), bodyText);
await page.screenshot({ path: path.join(outDir, 'page.png'), fullPage: true }).catch(() => {});

console.log(JSON.stringify(summary, null, 2));
await browser.close();
