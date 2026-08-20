import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-results-discovery-probe';
const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
};

await fs.mkdir(OUT_DIR, { recursive: true });

async function getText(url) {
  const r = await fetch(url, { headers, redirect: 'follow' });
  const text = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}: ${text.slice(0, 500)}`);
  return text;
}

function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}

function preview(value, max = 2500) {
  let s;
  try { s = JSON.stringify(value); } catch { s = String(value); }
  return s.length > max ? s.slice(0, max) + '…' : s;
}

const hits = [];
const keyPaths = [];
const arrayPaths = [];

function walk(value, p = '$', depth = 0) {
  if (depth > 16 || value == null) return;
  if (Array.isArray(value)) {
    arrayPaths.push({ path: p, length: value.length, sample: preview(value.slice(0, 2), 1400) });
    for (let i = 0; i < value.length; i++) walk(value[i], `${p}[${i}]`, depth + 1);
    return;
  }
  if (typeof value !== 'object') return;

  const keys = Object.keys(value);
  for (const k of keys) {
    if (/fixture|result|competition|team|match|season|round/i.test(k)) keyPaths.push(`${p}.${k}`);
  }

  const text = preview(value, 6000);
  if (/Japan Women 7s|Japan Women/i.test(text)) {
    hits.push({ path: p, keys, preview: text });
  }

  for (const [k, v] of Object.entries(value)) walk(v, `${p}.${k}`, depth + 1);
}

const html = await getText(`${BASE}/fixtures-results`);
const next = extractNextData(html);
const buildId = next.buildId;
if (!buildId) throw new Error('buildId missing');

const candidates = [
  `${BASE}/_next/data/${buildId}/fixtures-results.json?page=fixtures-results`,
  `${BASE}/_next/data/${buildId}/fixtures-results.json`,
];

let data = null;
let dataUrl = null;
let lastError = null;
for (const url of candidates) {
  try {
    const text = await getText(url);
    data = JSON.parse(text);
    dataUrl = url;
    break;
  } catch (e) {
    lastError = String(e);
  }
}
if (!data) throw new Error(`Could not fetch fixtures-results Next data: ${lastError}`);

walk(data);

const uniq = (xs) => [...new Set(xs)];
const summary = {
  capturedAt: new Date().toISOString(),
  buildId,
  dataUrl,
  topLevelKeys: Object.keys(data || {}),
  pagePropsKeys: Object.keys(data?.pageProps || {}),
  japanHitCount: hits.length,
  japanHits: hits.slice(0, 30),
  interestingKeyPaths: uniq(keyPaths).slice(0, 250),
  arrayPaths: arrayPaths.sort((a,b) => b.length - a.length).slice(0, 80),
};

await fs.writeFile(path.join(OUT_DIR, 'fixtures-results-next-data.json'), JSON.stringify(data, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

console.log(JSON.stringify({
  buildId,
  dataUrl,
  topLevelKeys: summary.topLevelKeys,
  pagePropsKeys: summary.pagePropsKeys,
  japanHitCount: summary.japanHitCount,
  japanHits: summary.japanHits.slice(0, 10),
  largestArrays: summary.arrayPaths.slice(0, 20),
}, null, 2));
