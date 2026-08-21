import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://www.rugby.com.au';
const RESULTS_ROOT = `${BASE}/fixtures-results`;
const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-svns-coverage-inventory';
await fs.mkdir(OUT_DIR, { recursive: true });

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const norm = (v) => v == null ? '' : String(v).trim();
function csvEscape(v) {
  const s = norm(v);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
function toCsv(rows) { return rows.map(r => r.map(csvEscape).join(',')).join('\n'); }

async function fetchText(url) {
  const r = await fetch(url, { headers, redirect: 'follow' });
  const text = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}: ${text.slice(0, 250)}`);
  return text;
}

function extractNextData(html) {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}

function collectCompetitionLikeObjects(value, currentPath = '$', out = [], depth = 0) {
  if (value == null || depth > 18) return out;
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectCompetitionLikeObjects(v, `${currentPath}[${i}]`, out, depth + 1));
    return out;
  }
  if (typeof value !== 'object') return out;

  const label = norm(value.label || value.name || value.title || value.compName || value.competitionName);
  const rawId = value.value ?? value.id ?? value.compId ?? value.competitionId;
  const id = rawId == null ? '' : norm(rawId);
  if (label && /^\d+$/.test(id) && /(?:svns|sevens|7s)/i.test(label)) {
    out.push({ path: currentPath, id, label });
  }

  for (const [k, v] of Object.entries(value)) {
    if (v && typeof v === 'object') collectCompetitionLikeObjects(v, `${currentPath}.${k}`, out, depth + 1);
  }
  return out;
}

function classifyCompetition(label) {
  const s = label.toLowerCase();
  const excludedReason =
    /challenger/.test(s) ? 'challenger' :
    /olympic/.test(s) ? 'olympic' :
    /world cup/.test(s) ? 'world_cup' :
    /commonwealth/.test(s) ? 'commonwealth' :
    /asia|asian games/.test(s) ? 'regional' :
    /qualif/.test(s) ? 'qualifier' :
    '';

  const seriesLike = /svns|world rugby sevens series|sevens world series|world sevens series|hsbc sevens series|irb sevens world series/i.test(label);
  const scope = seriesLike && !excludedReason ? 'series_target' : 'other_sevens';
  const gender = /women|womens|women's/i.test(label) ? 'Women' : /men|mens|men's/i.test(label) ? 'Men' : '';
  return { scope, excludedReason, gender };
}

async function discoverCompetitionFilters(page) {
  await page.goto(`${RESULTS_ROOT}?team=All&comp=All&tab=Results`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(7000);
  const html = await page.content();
  let next = null;
  try { next = extractNextData(html); } catch {}
  const found = next ? collectCompetitionLikeObjects(next) : [];

  // DOM fallback: inspect option-like elements and href/query references.
  const domTexts = await page.locator('option, [role="option"]').evaluateAll(els => els.map(e => ({
    text: (e.textContent || '').trim(),
    value: e.getAttribute('value') || e.getAttribute('data-value') || ''
  }))).catch(() => []);
  for (const x of domTexts) {
    if (/(?:svns|sevens|7s)/i.test(x.text) && /^\d+$/.test(x.value)) found.push({ path: '$.dom', id: x.value, label: x.text });
  }

  const byId = new Map();
  for (const x of found) {
    if (!byId.has(x.id)) byId.set(x.id, { id: x.id, label: x.label, paths: [x.path] });
    else {
      const e = byId.get(x.id);
      if (!e.paths.includes(x.path)) e.paths.push(x.path);
      if (x.label.length > e.label.length) e.label = x.label;
    }
  }
  return [...byId.values()].sort((a,b) => Number(a.id) - Number(b.id));
}

async function collectMatchLinksForCompetition(page, compId) {
  const url = `${RESULTS_ROOT}?team=All&comp=${encodeURIComponent(compId)}&tab=Results`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5500);

  async function linksNow() {
    const hrefs = await page.locator('a[href*="/match-centre/"]').evaluateAll(els =>
      [...new Set(els.map(a => a.getAttribute('href')).filter(Boolean))]
    );
    return hrefs.filter(x => /^\/match-centre\/\d+\/\d+\/\d+/.test(x));
  }

  let links = await linksNow();
  const snapshots = [{ step: 0, count: links.length, clicked: false }];
  for (let i = 1; i <= 12; i++) {
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
    await page.waitForTimeout(900);
    const next = await linksNow();
    snapshots.push({ step: i, count: next.length, clicked });
    if (next.length === links.length && !clicked) { links = next; break; }
    links = next;
  }
  return { url, links: [...new Set(links)], snapshots };
}

function parseMatchLink(href) {
  const m = href.match(/^\/match-centre\/(\d+)\/(\d+)\/(\d+)/);
  if (!m) return null;
  return { href, comp: m[1], season: m[2], fixture: m[3] };
}

async function inspectFixture(link) {
  const matchUrl = `${BASE}${link.href}?tab=Match-Stats`;
  const html = await fetchText(matchUrl);
  const next = extractNextData(html);
  const buildId = next.buildId;
  const dataUrl = `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${link.comp}/${link.season}/${link.fixture}.json?tab=Match-Stats&comp=${link.comp}&season=${link.season}&fixture=${link.fixture}`;
  const rawText = await fetchText(dataUrl);
  const data = JSON.parse(rawText);
  const md = data?.pageProps?.matchData || {};
  const fixture = md?.getFixtureItem || {};
  const summary = md?.allMatchStatsSummary || {};
  const playSummary = summary?.playSummary || {};
  const statCount = Object.values(playSummary).reduce((n, xs) => n + (Array.isArray(xs) ? xs.length : 0), 0);
  const commentary = md?.allMatchCommentary;
  const lineup = summary?.lineUp;
  const points = summary?.pointsSummary;
  return {
    fixtureId: link.fixture,
    season: link.season,
    competitionName: norm(fixture?.compName),
    dateTime: norm(fixture?.dateTime),
    homeTeam: norm(fixture?.homeTeam?.name),
    awayTeam: norm(fixture?.awayTeam?.name),
    statsPresent: statCount > 0,
    statCount,
    commentaryPresent: Array.isArray(commentary) ? commentary.length > 0 : Boolean(commentary),
    commentaryCount: Array.isArray(commentary) ? commentary.length : (commentary ? 1 : 0),
    pointsSummaryPresent: Boolean(points),
    lineupPresent: Boolean(lineup),
    matchUrl,
    dataUrl,
  };
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
const page = await context.newPage();

const filters = await discoverCompetitionFilters(page);
const classified = filters.map(x => ({ ...x, ...classifyCompetition(x.label) }));
const targets = classified.filter(x => x.scope === 'series_target');

const inventory = [];
const failures = [];

for (let i = 0; i < targets.length; i++) {
  const c = targets[i];
  try {
    const discovered = await collectMatchLinksForCompetition(page, c.id);
    const parsed = discovered.links.map(parseMatchLink).filter(Boolean).filter(x => x.comp === c.id);
    const bySeason = new Map();
    for (const x of parsed) {
      if (!bySeason.has(x.season)) bySeason.set(x.season, []);
      bySeason.get(x.season).push(x);
    }

    if (!bySeason.size) {
      inventory.push({
        competitionId: c.id, filterLabel: c.label, filterGender: c.gender, sourceSeason: '', fixtureCount: 0,
        sampleFixtureId: '', competitionName: '', firstDateTime: '', lastDateTime: '',
        statsPresent: false, commentaryPresent: false, pointsSummaryPresent: false, lineupPresent: false,
        resultsUrl: discovered.url, status: 'no_results_links'
      });
    }

    for (const [season, links] of [...bySeason.entries()].sort()) {
      let sample = null;
      try { sample = await inspectFixture(links[0]); }
      catch (error) { failures.push({ competitionId: c.id, season, fixture: links[0]?.fixture, stage: 'inspect_sample', error: String(error) }); }

      const fixtureDates = [];
      // Inspect up to first and last fixture to estimate the edition date span without downloading everything.
      let lastSample = sample;
      if (links.length > 1) {
        try { lastSample = await inspectFixture(links.at(-1)); }
        catch (error) { failures.push({ competitionId: c.id, season, fixture: links.at(-1)?.fixture, stage: 'inspect_last_sample', error: String(error) }); }
      }
      if (sample?.dateTime) fixtureDates.push(sample.dateTime);
      if (lastSample?.dateTime) fixtureDates.push(lastSample.dateTime);
      fixtureDates.sort();

      inventory.push({
        competitionId: c.id,
        filterLabel: c.label,
        filterGender: c.gender,
        sourceSeason: season,
        fixtureCount: links.length,
        sampleFixtureId: sample?.fixtureId || links[0]?.fixture || '',
        competitionName: sample?.competitionName || lastSample?.competitionName || '',
        firstDateTime: fixtureDates[0] || '',
        lastDateTime: fixtureDates.at(-1) || '',
        statsPresent: Boolean(sample?.statsPresent),
        statCount: sample?.statCount ?? '',
        commentaryPresent: Boolean(sample?.commentaryPresent),
        commentaryCount: sample?.commentaryCount ?? '',
        pointsSummaryPresent: Boolean(sample?.pointsSummaryPresent),
        lineupPresent: Boolean(sample?.lineupPresent),
        resultsUrl: discovered.url,
        status: sample ? 'sample_checked' : 'sample_failed'
      });
    }
  } catch (error) {
    failures.push({ competitionId: c.id, filterLabel: c.label, stage: 'competition_discovery', error: String(error) });
    inventory.push({
      competitionId: c.id, filterLabel: c.label, filterGender: c.gender, sourceSeason: '', fixtureCount: 0,
      sampleFixtureId: '', competitionName: '', firstDateTime: '', lastDateTime: '', statsPresent: false,
      commentaryPresent: false, pointsSummaryPresent: false, lineupPresent: false,
      resultsUrl: `${RESULTS_ROOT}?team=All&comp=${c.id}&tab=Results`, status: 'error'
    });
  }
  if (i < targets.length - 1) await sleep(200);
}

await browser.close();

inventory.sort((a,b) => (a.sourceSeason || '9999').localeCompare(b.sourceSeason || '9999') || Number(a.competitionId) - Number(b.competitionId));

const rows = [[
  'competition_id','filter_label','filter_gender','source_season','fixture_count','sample_fixture_id','competition_name',
  'first_datetime','last_datetime','stats_present','stat_count','commentary_present','commentary_count',
  'points_summary_present','lineup_present','status','results_url'
]];
for (const x of inventory) rows.push([
  x.competitionId,x.filterLabel,x.filterGender,x.sourceSeason,x.fixtureCount,x.sampleFixtureId,x.competitionName,
  x.firstDateTime,x.lastDateTime,x.statsPresent,x.statCount ?? '',x.commentaryPresent,x.commentaryCount ?? '',
  x.pointsSummaryPresent,x.lineupPresent,x.status,x.resultsUrl
]);
await fs.writeFile(path.join(OUT_DIR, 'svns-coverage-inventory.csv'), toCsv(rows));
await fs.writeFile(path.join(OUT_DIR, 'competition-filter-candidates.json'), JSON.stringify(classified, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'inventory.json'), JSON.stringify(inventory, null, 2));

const checked = inventory.filter(x => x.status === 'sample_checked');
const seasons = [...new Set(checked.map(x => x.sourceSeason).filter(Boolean))].sort();
const summary = {
  audit: 'Rugby.com.au World Rugby Sevens Series / HSBC SVNS coverage inventory',
  competitionFilterCandidateCount: classified.length,
  seriesTargetCompetitionCount: targets.length,
  inventoryRowCount: inventory.length,
  checkedEditionCount: checked.length,
  withMatchStatsCount: checked.filter(x => x.statsPresent).length,
  withCommentaryCount: checked.filter(x => x.commentaryPresent).length,
  withPointsSummaryCount: checked.filter(x => x.pointsSummaryPresent).length,
  withLineupCount: checked.filter(x => x.lineupPresent).length,
  oldestSourceSeason: seasons[0] || null,
  newestSourceSeason: seasons.at(-1) || null,
  sourceSeasons: seasons,
  oldestCheckedEditions: checked.slice(0, 20),
  noStatsEditions: checked.filter(x => !x.statsPresent),
  noResultsLinkCompetitions: inventory.filter(x => x.status === 'no_results_links').map(x => ({ competitionId:x.competitionId, label:x.filterLabel })),
  failureCount: failures.length,
  failures,
  capturedAt: new Date().toISOString(),
};
await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
