import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const BASE='https://www.rugby.com.au';
const SOURCE_SEASON='2017';
const CANONICAL_SEASON='2016-17';
const GENDER='Men';
const OUT=process.env.OUT_DIR||'artifacts/raw-2016-17-men';
const RAW=path.join(OUT,'raw',CANONICAL_SEASON,GENDER);
const CONCURRENCY=8;
const headers={'user-agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'application/json,text/html;q=0.9,*/*;q=0.8','accept-language':'en-US,en;q=0.9'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const norm=v=>v==null?'':String(v).trim();

const EVENTS=[
 {key:'DXB',event:'Dubai 7s',comp:'251',seed:'31218'},
 {key:'CPT',event:'Cape Town 7s',comp:'252',seed:'37392'},
 {key:'WLG',event:'Wellington 7s',comp:'253',seed:'37459'},
 {key:'SYD',event:'Sydney 7s',comp:'254',seed:'37549'},
 {key:'LAS',event:'Las Vegas 7s',comp:'255',discover:[37550,37720]},
 {key:'VAN',event:'Vancouver 7s',comp:'256',discover:[37550,37720]},
 {key:'HKG',event:'Hong Kong 7s',comp:'257',seed:'37719'},
 {key:'SIN',event:'Singapore 7s',comp:'258',seed:'37769'},
 {key:'PAR',event:'Paris 7s',comp:'259',discover:[37780,38020]},
 {key:'LON',event:'London 7s',comp:'260',discover:[37780,38020]},
];

await fs.mkdir(RAW,{recursive:true});
async function getBytes(url){const r=await fetch(url,{headers,redirect:'follow'});return {ok:r.ok,status:r.status,bytes:Buffer.from(await r.arrayBuffer()),url:r.url,contentType:r.headers.get('content-type')||''};}
function extractNextData(buf){const html=buf.toString('utf8');const m=html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);if(!m)throw new Error('__NEXT_DATA__ not found');return JSON.parse(m[1]);}
const buildSeed=EVENTS.find(x=>x.key==='HKG');
const page=await getBytes(`${BASE}/match-centre/${buildSeed.comp}/${SOURCE_SEASON}/${buildSeed.seed}?tab=Match-Stats`);
if(!page.ok)throw new Error(`build seed HTTP ${page.status}`);
const buildId=extractNextData(page.bytes).buildId;if(!buildId)throw new Error('buildId missing');
function dataUrl(comp,id){return `${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${comp}/${SOURCE_SEASON}/${id}.json?tab=Match-Stats&comp=${comp}&season=${SOURCE_SEASON}&fixture=${id}`;}
async function inspect(comp,id,writeDir=null,event=null){
 const url=dataUrl(comp,id);let r;try{r=await getBytes(url);}catch(e){return {kind:'error',id,error:String(e)}}
 if(!r.ok)return {kind:'http_non_ok',id,status:r.status};
 let data;try{data=JSON.parse(r.bytes.toString('utf8'));}catch{return {kind:'non_json',id,status:r.status};}
 const md=data?.pageProps?.matchData;const f=md?.getFixtureItem;if(!f)return {kind:'no_fixture',id,status:r.status};
 const actualId=norm(f.fixtureId||f.id||id), actualComp=norm(f.compId||f.competitionId||comp), season=norm(f.season||SOURCE_SEASON);
 if(actualId!==String(id)||actualComp!==String(comp)||season!==SOURCE_SEASON)return {kind:'other',id,status:r.status,actualId,actualComp,season};
 if(writeDir){
   await fs.mkdir(writeDir,{recursive:true});
   const file=path.join(writeDir,`${actualId}.json`);await fs.writeFile(file,r.bytes);
   const sha=crypto.createHash('sha256').update(r.bytes).digest('hex');
   return {kind:'match',fixtureId:actualId,competitionId:actualComp,sourceSeason:season,eventKey:event.key,event:event.event,dateTime:norm(f.dateTime),homeTeam:norm(f.homeTeam?.name),awayTeam:norm(f.awayTeam?.name),status:r.status,contentType:r.contentType,url,relativePath:path.relative(OUT,file),bytes:r.bytes.length,sha256:sha};
 }
 return {kind:'match',fixtureId:actualId};
}
async function resolveSeed(e){if(e.seed)return e.seed;const [lo,hi]=e.discover;const ids=[];for(let i=lo;i<=hi;i+=5)ids.push(i);let cursor=0,hit=null;async function worker(){while(!hit){const k=cursor++;if(k>=ids.length)return;const x=await inspect(e.comp,ids[k]);if(x.kind==='match'){hit=String(x.fixtureId);return;}if(k%12===0)await sleep(20);}}await Promise.all(Array.from({length:CONCURRENCY},worker));return hit;}
const manifest=[];const eventSummary=[];
for(const e of EVENTS){
 const seed=await resolveSeed(e);if(!seed){eventSummary.push({...e,resolvedSeed:null,count:0,error:'seed_not_found'});continue;}
 const centre=Number(seed),ids=Array.from({length:181},(_,i)=>centre-90+i),dir=path.join(RAW,`${e.key}-${e.event.replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'')}`);let cursor=0;const rows=new Array(ids.length);
 async function worker(){while(true){const k=cursor++;if(k>=ids.length)return;rows[k]=await inspect(e.comp,ids[k],dir,e);if(k%15===0)await sleep(20);}}
 await Promise.all(Array.from({length:CONCURRENCY},worker));
 const hits=rows.filter(x=>x?.kind==='match').sort((a,b)=>String(a.dateTime).localeCompare(String(b.dateTime))||Number(a.fixtureId)-Number(b.fixtureId));manifest.push(...hits);
 eventSummary.push({key:e.key,event:e.event,competitionId:e.comp,resolvedSeed:String(seed),fixtureCount:hits.length,minFixtureId:hits.length?Math.min(...hits.map(x=>Number(x.fixtureId))):null,maxFixtureId:hits.length?Math.max(...hits.map(x=>Number(x.fixtureId))):null,firstDateTime:hits[0]?.dateTime||null,lastDateTime:hits.at(-1)?.dateTime||null});
 await sleep(80);
}
manifest.sort((a,b)=>String(a.dateTime).localeCompare(String(b.dateTime))||Number(a.fixtureId)-Number(b.fixtureId));
await fs.writeFile(path.join(OUT,'manifest.jsonl'),manifest.map(x=>JSON.stringify(x)).join('\n')+'\n');
await fs.writeFile(path.join(OUT,'SHA256SUMS.txt'),manifest.map(x=>`${x.sha256}  ${x.relativePath}`).join('\n')+'\n');
const summary={canonicalSeason:CANONICAL_SEASON,sourceSeason:SOURCE_SEASON,gender:GENDER,eventCount:EVENTS.length,resolvedEventCount:eventSummary.filter(x=>x.fixtureCount>0).length,rawFixtureCount:manifest.length,totalBytes:manifest.reduce((s,x)=>s+x.bytes,0),buildId,eventSummary,capturedAt:new Date().toISOString()};
await fs.writeFile(path.join(OUT,'acquisition_summary.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
