import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = process.env.OUT_DIR || 'artifacts/rugby-entity-season-min';
await fs.mkdir(OUT_DIR, { recursive: true });

const query = `query EntityFixturesAndResults($season:String,$type:String,$skip:Int,$limit:Int){getEntityFixturesAndResults(season:$season,type:$type,skip:$skip,limit:$limit){id compId compName dateTime season sourceType status homeTeam{teamId name score} awayTeam{teamId name score}}}`;

async function run(season, skip = 0, limit = 100) {
  const r = await fetch('https://rugby-au-cms.graphcdn.app/', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ operationName: 'EntityFixturesAndResults', query, variables: { season, type: 'results', skip, limit } }),
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  const items = json?.data?.getEntityFixturesAndResults || [];
  return { status: r.status, errors: json?.errors || [], items };
}

const first = await run('2017');
const summary = {
  audit: 'Minimal EntityFixturesAndResults season-only probe',
  status: first.status,
  errors: first.errors,
  fixtureCount: first.items.length,
  knownFixture37719: first.items.some(x => String(x?.id) === '37719'),
  seasons: [...new Set(first.items.map(x => String(x?.season || '')).filter(Boolean))].sort(),
  sample: first.items.slice(0, 20),
  capturedAt: new Date().toISOString(),
};
await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
