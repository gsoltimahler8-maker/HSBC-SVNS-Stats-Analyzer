import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const targetUrl = process.env.TARGET_URL || 'https://www.rugby.com.au/fixtures-results?team=420&comp=All&tab=Results';
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

function safeJsonParse(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function collectJapanObjects(value, currentPath = '$', out = [], depth = 0) {
  if (depth > 12 || out.length >= 100) return out;
  if (value == null) return out;

  if (Array.isArray(value)) {
    value.forEach((v, i) => collectJapanObjects(v, `${currentPath}[${i}]`, out, depth + 1));
    return out;
  }

  if (typeof value === 'object') {
    const preview = JSON.stringify(value);
    if (/Japan Women 7s|\"420\"|teamId[^0-9]*420/i.test(preview)) {
      out.push({ path: currentPath, keys: Object.keys(value), preview: preview.slice(0, 2500) });
    }
    for (const [k, v] of Object.entries(value)) {
      collectJapanObjects(v, `${currentPath}.${k}`, out, depth + 1);
    }
  }
  return out;
}

page.on('response', async (response) => {
  const request = response.request();
  const type = request.resourceType();
  if (!['xhr', 'fetch', 'document'].includes(type)) return;

  const reqHeaders = request.headers();
  const postData = request.postData() || '';
  const parsedPostData = safeJsonParse(postData);

  const item = {
    seq: ++responseSeq,
    url: response.url(),
    status: response.status(),
    method: request.method(),
    resourceType: type,
    contentType: response.headers()['content-type'] || '',
    requestContentType: reqHeaders['content-type'] || '',
    postDataLength: postData.length,
  };

  if (parsedPostData && typeof parsedPostData === 'object') {
    item.graphqlOperationName = parsedPostData.operationName || null;
    item.graphqlVariables = parsedPostData.variables || null;
    item.graphqlQueryPreview = typeof parsedPostData.query === 'string' ? parsedPostData.query.slice(0, 3000) : null;
  }

  try {
    if (type === 'xhr' || type === 'fetch' || item.contentType.toLowerCase().includes('json')) {
      const body = await response.text();
      item.bodyLength = body.length;
      item.bodyPreview = body.slice(0, 30000);

      const haystack = `${item.url}\n${postData}\n${body}`.toLowerCase();
      const terms = ['fixture', 'result', 'match', 'competition', 'japan women 7s', '"420"', '951419', '950722'];
      item.matchedTerms = terms.filter((term) => haystack.includes(term));

      if (item.matchedTerms.length) {
        const safeName = `candidate-${String(item.seq).padStart(3, '0')}.txt`;
        const requestSection = [
          `URL: ${item.url}`,
          `STATUS: ${item.status}`,
          `METHOD: ${item.method}`,
          `TYPE: ${item.resourceType}`,
          `MATCHED: ${item.matchedTerms.join(', ')}`,
          `REQUEST CONTENT-TYPE: ${item.requestContentType}`,
          '',
          '=== REQUEST POST DATA ===',
          postData || '(none)',
          '',
          '=== RESPONSE BODY ===',
          body,
        ].join('\n');
        await fs.writeFile(path.join(outDir, safeName), requestSection);
        item.savedBody = safeName;

        const parsedBody = safeJsonParse(body);
        if (parsedBody) {
          const japanObjects = collectJapanObjects(parsedBody);
          if (japanObjects.length) {
            const jsonName = `candidate-${String(item.seq).padStart(3, '0')}-japan-objects.json`;
            await fs.writeFile(path.join(outDir, jsonName), JSON.stringify(japanObjects, null, 2));
            item.japanObjectsFile = jsonName;
            item.japanObjectCount = japanObjects.length;
          }
        }
      }
    }
  } catch (error) {
    item.bodyError = String(error);
  }

  network.push(item);
});

let navigationError = null;
try {
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(15000);
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
const graphqlCandidates = likelyApi.filter((x) => x.url.includes('graphcdn.app'));
const nextResultsCandidates = likelyApi.filter((x) => x.url.includes('/_next/data/') && x.url.includes('fixtures-results.json'));

const matchCentreLinks = [...new Set((html.match(/\/match-centre\/\d+\/\d+\/\d+/g) || []))].sort();

const summary = {
  targetUrl,
  finalUrl: page.url(),
  title,
  navigationError,
  bodyHasResultsText: bodyText.includes('Results'),
  bodyHasJapanWomen7s: bodyText.includes('Japan Women 7s'),
  networkCount: network.length,
  candidateCount: candidates.length,
  likelyApiCount: likelyApi.length,
  graphqlCandidateCount: graphqlCandidates.length,
  nextResultsCandidateCount: nextResultsCandidates.length,
  matchCentreLinkCount: matchCentreLinks.length,
  matchCentreLinks: matchCentreLinks.slice(0, 100),
  graphqlCandidates: graphqlCandidates.slice(0, 20).map((x) => ({
    seq: x.seq,
    status: x.status,
    method: x.method,
    url: x.url,
    requestContentType: x.requestContentType,
    postDataLength: x.postDataLength,
    operationName: x.graphqlOperationName,
    variables: x.graphqlVariables,
    queryPreview: x.graphqlQueryPreview,
    bodyLength: x.bodyLength,
    matchedTerms: x.matchedTerms,
    savedBody: x.savedBody,
    japanObjectCount: x.japanObjectCount || 0,
    japanObjectsFile: x.japanObjectsFile || null,
  })),
  nextResultsCandidates: nextResultsCandidates.slice(0, 20).map((x) => ({
    seq: x.seq,
    status: x.status,
    method: x.method,
    url: x.url,
    bodyLength: x.bodyLength,
    matchedTerms: x.matchedTerms,
    savedBody: x.savedBody,
    japanObjectCount: x.japanObjectCount || 0,
    japanObjectsFile: x.japanObjectsFile || null,
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
