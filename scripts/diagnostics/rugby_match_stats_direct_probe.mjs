import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-match-stats-direct-probe';

const samples = [
  {
    comp: '112', season: '2026', fixture: '951419',
    expected: { homeTeam: 'Spain Women 7s', awayTeam: 'Japan Women 7s', homeScore: '7', awayScore: '19', tries: ['1', '3'], metres: ['142', '232'], possession: ['51%', '49%'] },
  },
  {
    comp: '112', season: '2026', fixture: '951393',
    expected: { homeTeam: 'Japan Women 7s', awayTeam: 'Fiji Women 7s', homeScore: '12', awayScore: '24', tries: ['2', '4'], metres: ['170', '182'] },
  },
  {
    comp: '116', season: '2026', fixture: '950722',
    expected: { homeTeam: 'Australia Women 7s', awayTeam: 'Japan Women 7s', homeScore: '47', awayScore: '7', tries: ['7', '1'], metres: ['404', '196'], possession: ['55%', '45%'] },
  },
];

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
};

function norm(value) {
  return value == null ? '' : String(value).trim();
}

function csvEscape(value) {
  const s = norm(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

async function fetchText(url) {
  const response = await fetch(url, { headers, redirect: 'follow' });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}: ${text.slice(0, 500)}`);
  return { response, text };
}

function extractNextData(html) {
  const match = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) throw new Error('__NEXT_DATA__ script not found in match-centre HTML');
  return JSON.parse(match[1]);
}

function getStat(playSummary, title) {
  for (const [category, entries] of Object.entries(playSummary || {})) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (norm(entry?.title) === title) {
        return { category, title, homeValue: norm(entry.homeValue), awayValue: norm(entry.awayValue), id: norm(entry.id) };
      }
    }
  }
  return null;
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

function compare(label, actual, expected, failures) {
  if (expected == null) return;
  if (Array.isArray(expected)) {
    const a = Array.isArray(actual) ? actual.map(norm) : [];
    const e = expected.map(norm);
    if (JSON.stringify(a) !== JSON.stringify(e)) failures.push(`${label}: expected ${JSON.stringify(e)}, got ${JSON.stringify(a)}`);
  } else if (norm(actual) !== norm(expected)) {
    failures.push(`${label}: expected ${norm(expected)}, got ${norm(actual)}`);
  }
}

async function probe(sample) {
  const pageUrl = `${BASE}/match-centre/${sample.comp}/${sample.season}/${sample.fixture}?tab=Match-Stats`;
  const { text: html } = await fetchText(pageUrl);
  const nextData = extractNextData(html);
  const buildId = norm(nextData.buildId);
  if (!buildId) throw new Error(`buildId missing for fixture ${sample.fixture}`);

  const dataUrl = new URL(`${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${sample.comp}/${sample.season}/${sample.fixture}.json`);
  dataUrl.searchParams.set('tab', 'Match-Stats');
  dataUrl.searchParams.set('comp', sample.comp);
  dataUrl.searchParams.set('season', sample.season);
  dataUrl.searchParams.set('fixture', sample.fixture);

  const { response: dataResponse, text: dataText } = await fetchText(dataUrl.toString());
  const payload = JSON.parse(dataText);
  const matchData = payload?.pageProps?.matchData;
  if (!matchData) throw new Error(`pageProps.matchData missing for fixture ${sample.fixture}`);

  const fixtureItem = matchData.getFixtureItem;
  const summary = matchData.allMatchStatsSummary;
  const playSummary = summary?.playSummary;
  if (!fixtureItem) throw new Error(`getFixtureItem missing for fixture ${sample.fixture}`);
  if (!playSummary) throw new Error(`allMatchStatsSummary.playSummary missing for fixture ${sample.fixture}`);

  const homeTeam = norm(fixtureItem?.homeTeam?.name);
  const awayTeam = norm(fixtureItem?.awayTeam?.name);
  const homeScore = norm(fixtureItem?.homeTeam?.score);
  const awayScore = norm(fixtureItem?.awayTeam?.score);
  const japanSide = /Japan Women 7s/i.test(homeTeam) ? 'home' : /Japan Women 7s/i.test(awayTeam) ? 'away' : null;

  const rows = flattenStats(playSummary);
  const failures = [];
  if (!japanSide) failures.push('Japan Women 7s not found in home/away teams');
  if (!rows.length) failures.push('No MatchPlayStat rows found');

  const required = ['Tries', 'Metres', 'Carries', 'Defenders Beaten', 'Clean Breaks', 'Passes', 'Offloads', 'Tackles', 'Missed Tackles', 'Rucks Won', 'Possession', 'Penalties Conceded'];
  const missingRequiredStats = required.filter((title) => !getStat(playSummary, title));
  if (missingRequiredStats.length) failures.push(`Missing required stats: ${missingRequiredStats.join(', ')}`);

  compare('homeTeam', homeTeam, sample.expected.homeTeam, failures);
  compare('awayTeam', awayTeam, sample.expected.awayTeam, failures);
  compare('homeScore', homeScore, sample.expected.homeScore, failures);
  compare('awayScore', awayScore, sample.expected.awayScore, failures);

  for (const [title, expected] of [['Tries', sample.expected.tries], ['Metres', sample.expected.metres], ['Possession', sample.expected.possession]]) {
    if (!expected) continue;
    const stat = getStat(playSummary, title);
    compare(title, stat ? [stat.homeValue, stat.awayValue] : [], expected, failures);
  }

  const normalized = {
    source: 'rugby.com.au',
    sourcePageUrl: pageUrl,
    sourceNextDataUrl: dataUrl.toString(),
    nextBuildId: buildId,
    nextDataContentType: dataResponse.headers.get('content-type') || '',
    fixture: {
      fixtureId: norm(fixtureItem.id || sample.fixture),
      compId: norm(fixtureItem.compId || sample.comp),
      compName: norm(fixtureItem.compName),
      season: norm(fixtureItem.season || sample.season),
      dateTime: norm(fixtureItem.dateTime),
      round: norm(fixtureItem.round),
      roundType: norm(fixtureItem.roundType),
      status: norm(fixtureItem.status),
      venue: norm(fixtureItem.venue),
      homeTeam,
      homeTeamId: norm(fixtureItem?.homeTeam?.teamId),
      homeScore,
      awayTeam,
      awayTeamId: norm(fixtureItem?.awayTeam?.teamId),
      awayScore,
      japanSide,
    },
    stats: rows,
    japanStats: rows.map((row) => ({
      category: row.category,
      id: row.id,
      title: row.title,
      value: japanSide === 'home' ? row.homeValue : japanSide === 'away' ? row.awayValue : '',
      opponentValue: japanSide === 'home' ? row.awayValue : japanSide === 'away' ? row.homeValue : '',
    })),
    qa: {
      ok: failures.length === 0,
      failures,
      missingRequiredStats,
      statCount: rows.length,
      allSeasonStatPresentButExcluded: Array.isArray(matchData.allSeasonStat),
      sourcePathUsed: '$.pageProps.matchData.allMatchStatsSummary.playSummary',
    },
  };

  return { normalized, raw: payload };
}

await fs.mkdir(OUT_DIR, { recursive: true });
const results = [];
const csvRows = [['fixtureId', 'compId', 'competition', 'dateTime', 'homeTeam', 'homeScore', 'awayTeam', 'awayScore', 'japanSide', 'category', 'stat', 'japanValue', 'opponentValue']];

for (const sample of samples) {
  try {
    const { normalized, raw } = await probe(sample);
    results.push(normalized);
    await fs.writeFile(path.join(OUT_DIR, `${sample.fixture}.normalized.json`), JSON.stringify(normalized, null, 2));
    await fs.writeFile(path.join(OUT_DIR, `${sample.fixture}.raw-next-data.json`), JSON.stringify(raw, null, 2));
    for (const stat of normalized.japanStats) {
      csvRows.push([
        normalized.fixture.fixtureId, normalized.fixture.compId, normalized.fixture.compName, normalized.fixture.dateTime,
        normalized.fixture.homeTeam, normalized.fixture.homeScore, normalized.fixture.awayTeam, normalized.fixture.awayScore,
        normalized.fixture.japanSide, stat.category, stat.title, stat.value, stat.opponentValue,
      ]);
    }
  } catch (error) {
    results.push({ fixture: { fixtureId: sample.fixture, compId: sample.comp, season: sample.season }, qa: { ok: false, failures: [String(error)] } });
  }
}

const summary = {
  capturedAt: new Date().toISOString(),
  probeType: 'direct-next-data-no-browser',
  total: results.length,
  passed: results.filter((x) => x.qa?.ok).length,
  failed: results.filter((x) => !x.qa?.ok).length,
  results: results.map((x) => ({
    fixtureId: x.fixture?.fixtureId,
    competition: x.fixture?.compName,
    homeTeam: x.fixture?.homeTeam,
    homeScore: x.fixture?.homeScore,
    awayTeam: x.fixture?.awayTeam,
    awayScore: x.fixture?.awayScore,
    japanSide: x.fixture?.japanSide,
    buildId: x.nextBuildId,
    statCount: x.qa?.statCount,
    ok: x.qa?.ok,
    failures: x.qa?.failures || [],
    metres: x.japanStats?.find((s) => s.title === 'Metres')?.value,
    tries: x.japanStats?.find((s) => s.title === 'Tries')?.value,
    possession: x.japanStats?.find((s) => s.title === 'Possession')?.value,
  })),
};

await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'japan-women-7s-sample-stats.csv'), csvRows.map((row) => row.map(csvEscape).join(',')).join('\n') + '\n');

console.log(JSON.stringify(summary, null, 2));
if (summary.failed > 0) process.exitCode = 1;
