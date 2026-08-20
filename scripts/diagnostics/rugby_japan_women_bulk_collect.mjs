import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const TEAM_ID = '420';
const TEAM_NAME = 'Japan Women 7s';
const RESULTS_URL = `${BASE}/fixtures-results?team=${TEAM_ID}&comp=All&tab=Results`;
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-japan-women-bulk-collect';

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.mkdir(path.join(OUT_DIR, 'raw'), { recursive: true });

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
};

function norm(v) { return v == null ? '' : String(v).trim(); }
function csvEscape(v) {
  const s = norm(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

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

function flattenStats(playSummary) {
  const rows = [];
  for (const [category, entries] of Object.entries(playSummary || {})) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;
      rows.push({
        category,
        id: norm(entry.id),
        title: norm(entry.title),
        homeValue: norm(entry.homeValue),
        awayValue: norm(entry.awayValue),
      });
    }
  }
  return rows;
}

function findStat(stats, title) {
  return stats.find(s => s.title === title) || null;
}

function numericValue(value) {
  const s = norm(value).replace(/%/g, '').replace(/,/g, '');
  if (!s || /^N\/?A$/i.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function assessQuality(stats, japanSide) {
  if (!japanSide) return { status: 'japan_not_matched', corePresent: 0, zeroAnomaly: false };
  if (!stats.length) return { status: 'no_stats', corePresent: 0, zeroAnomaly: false };

  const coreNames = ['Tries', 'Metres', 'Carries', 'Passes', 'Tackles'];
  const core = coreNames.map(name => findStat(stats, name)).filter(Boolean);
  const corePresent = core.length;
  const japanCoreValues = core
    .map(s => numericValue(japanSide === 'home' ? s.homeValue : s.awayValue))
    .filter(v => v !== null);

  // A match with several normally non-zero volume metrics all reported as zero is suspicious.
  const volumeNames = ['Metres', 'Carries', 'Passes', 'Tackles'];
  const volumeValues = volumeNames
    .map(name => findStat(stats, name))
    .filter(Boolean)
    .map(s => numericValue(japanSide === 'home' ? s.homeValue : s.awayValue))
    .filter(v => v !== null);
  const zeroAnomaly = volumeValues.length >= 3 && volumeValues.every(v => v === 0);

  if (zeroAnomaly) return { status: 'zero_anomaly', corePresent, zeroAnomaly: true };
  if (corePresent < 3 || japanCoreValues.length < 3) return { status: 'partial', corePresent, zeroAnomaly: false };
  return { status: 'ok', corePresent, zeroAnomaly: false };
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
const page = await context.newPage();
await page.goto(RESULTS_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(8000);

async function matchLinks() {
  const hrefs = await page.locator('a[href*="/match-centre/"]').evaluateAll((els) =>
    [...new Set(els.map(a => a.getAttribute('href')).filter(Boolean))]
  );
  return hrefs.filter(x => /^\/match-centre\/\d+\/\d+\/\d+/.test(x));
}

// Expand Results until Rugby.com.au has no more older matches to reveal.
const discoverySnapshots = [];
let hrefs = await matchLinks();
discoverySnapshots.push({ step: 0, clicked: false, count: hrefs.length });

for (let i = 1; i <= 12; i++) {
  let clicked = false;
  const loadMore = page.getByRole('button', { name: /load more/i }).or(page.getByRole('link', { name: /load more/i })).first();
  try {
    if (await loadMore.count() && await loadMore.isVisible()) {
      await loadMore.click({ timeout: 5000 });
      clicked = true;
      await page.waitForTimeout(4000);
    }
  } catch {}

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2500);
  const nextHrefs = await matchLinks();
  discoverySnapshots.push({ step: i, clicked, count: nextHrefs.length });

  if (nextHrefs.length === hrefs.length && !clicked) {
    hrefs = nextHrefs;
    break;
  }
  hrefs = nextHrefs;
}
await browser.close();

const links = [...new Set(hrefs)]
  .filter((x) => /^\/match-centre\/\d+\/\d+\/\d+/.test(x))
  .map((href) => {
    const m = href.match(/^\/match-centre\/(\d+)\/(\d+)\/(\d+)/);
    return { href, comp: m[1], season: m[2], fixture: m[3] };
  });

const matches = [];
const failures = [];

for (let index = 0; index < links.length; index++) {
  const link = links[index];
  try {
    const matchUrl = `${BASE}${link.href}?tab=Match-Stats`;
    const html = await fetchText(matchUrl);
    const next = extractNextData(html);
    const buildId = next.buildId;
    const dataUrl = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${link.comp}/${link.season}/${link.fixture}.json?tab=Match-Stats&comp=${link.comp}&season=${link.season}&fixture=${link.fixture}`;
    const rawText = await fetchText(dataUrl);
    await fs.writeFile(path.join(OUT_DIR, 'raw', `${link.fixture}.json`), rawText);
    const data = JSON.parse(rawText);
    const md = data?.pageProps?.matchData;
    const fixtureItem = md?.getFixtureItem;
    const statSummary = md?.allMatchStatsSummary;
    const stats = flattenStats(statSummary?.playSummary);

    const homeTeam = norm(fixtureItem?.homeTeam?.name);
    const awayTeam = norm(fixtureItem?.awayTeam?.name);
    const homeTeamId = norm(fixtureItem?.homeTeam?.teamId);
    const awayTeamId = norm(fixtureItem?.awayTeam?.teamId);
    const japanSide = homeTeamId === TEAM_ID || homeTeam === TEAM_NAME ? 'home' : (awayTeamId === TEAM_ID || awayTeam === TEAM_NAME ? 'away' : '');

    const normalizedStats = stats.map((s) => ({
      ...s,
      japanValue: japanSide === 'home' ? s.homeValue : japanSide === 'away' ? s.awayValue : '',
      opponentValue: japanSide === 'home' ? s.awayValue : japanSide === 'away' ? s.homeValue : '',
    }));
    const quality = assessQuality(stats, japanSide);

    matches.push({
      fixtureId: link.fixture,
      competitionId: link.comp,
      season: link.season,
      competition: norm(fixtureItem?.compName),
      dateTime: norm(fixtureItem?.dateTime),
      round: norm(fixtureItem?.round),
      roundLabel: norm(fixtureItem?.roundLabel),
      status: norm(fixtureItem?.status),
      venue: norm(fixtureItem?.venue),
      homeTeam,
      homeTeamId,
      homeScore: norm(fixtureItem?.homeTeam?.score),
      awayTeam,
      awayTeamId,
      awayScore: norm(fixtureItem?.awayTeam?.score),
      japanSide,
      japanMatched: Boolean(japanSide),
      statsPresent: normalizedStats.length > 0,
      statCount: normalizedStats.length,
      dataQuality: quality.status,
      coreStatsPresent: quality.corePresent,
      zeroAnomaly: quality.zeroAnomaly,
      matchUrl,
      dataUrl,
      stats: normalizedStats,
    });
  } catch (error) {
    failures.push({ ...link, error: String(error) });
  }

  // Be polite to the public source while keeping the Action reasonably fast.
  if (index < links.length - 1) await sleep(100);
}

matches.sort((a, b) => norm(a.dateTime).localeCompare(norm(b.dateTime)) || Number(a.fixtureId) - Number(b.fixtureId));

const longRows = [['fixtureId','competitionId','season','competition','dateTime','homeTeam','homeScore','awayTeam','awayScore','japanSide','dataQuality','category','stat','homeValue','awayValue','japanValue','opponentValue']];
for (const m of matches) {
  for (const s of m.stats) {
    longRows.push([m.fixtureId,m.competitionId,m.season,m.competition,m.dateTime,m.homeTeam,m.homeScore,m.awayTeam,m.awayScore,m.japanSide,m.dataQuality,s.category,s.title,s.homeValue,s.awayValue,s.japanValue,s.opponentValue]);
  }
}

const matchRows = [['fixtureId','competitionId','season','competition','dateTime','round','venue','homeTeam','homeScore','awayTeam','awayScore','japanSide','statsPresent','statCount','dataQuality','coreStatsPresent','zeroAnomaly','matchUrl']];
for (const m of matches) {
  matchRows.push([m.fixtureId,m.competitionId,m.season,m.competition,m.dateTime,m.round || m.roundLabel,m.venue,m.homeTeam,m.homeScore,m.awayTeam,m.awayScore,m.japanSide,m.statsPresent,m.statCount,m.dataQuality,m.coreStatsPresent,m.zeroAnomaly,m.matchUrl]);
}

await fs.writeFile(path.join(OUT_DIR, 'matches.json'), JSON.stringify(matches, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'matches.csv'), matchRows.map(r => r.map(csvEscape).join(',')).join('\n'));
await fs.writeFile(path.join(OUT_DIR, 'stats-long.csv'), longRows.map(r => r.map(csvEscape).join(',')).join('\n'));

const qualityCounts = {};
for (const m of matches) qualityCounts[m.dataQuality] = (qualityCounts[m.dataQuality] || 0) + 1;
const validDates = matches.map(m => m.dateTime).filter(Boolean).sort();
const competitions = [...new Set(matches.map((m) => `${m.competitionId}:${m.competition}`))].sort();
const seasons = [...new Set(matches.map(m => m.season))].sort();

const summary = {
  capturedAt: new Date().toISOString(),
  resultsUrl: RESULTS_URL,
  discoverySnapshots,
  discoveredLinkCount: links.length,
  collectedCount: matches.length,
  statsPresentCount: matches.filter((m) => m.statsPresent).length,
  statsAbsentCount: matches.filter((m) => !m.statsPresent).length,
  japanMatchedCount: matches.filter((m) => m.japanMatched).length,
  failureCount: failures.length,
  qualityCounts,
  oldestDateTime: validDates[0] || null,
  newestDateTime: validDates.at(-1) || null,
  seasonCount: seasons.length,
  seasons,
  competitionCount: competitions.length,
  competitions,
  zeroAnomalyFixtures: matches.filter(m => m.zeroAnomaly).map(m => m.fixtureId),
  noStatsFixtures: matches.filter(m => m.dataQuality === 'no_stats').map(m => m.fixtureId),
  partialFixtures: matches.filter(m => m.dataQuality === 'partial').map(m => m.fixtureId),
  failures,
};
await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
