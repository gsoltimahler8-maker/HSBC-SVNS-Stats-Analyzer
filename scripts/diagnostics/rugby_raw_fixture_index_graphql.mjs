import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const BASE='https://www.rugby.com.au';
const GQL='https://rugby-au-cms.graphcdn.app/';
const OUT='docs/diagnostics/raw-fixture-index-2017-2026.json';
const LIMIT=100;
const SOURCE_TYPES=[null,'0','1','2','3','4','5'];
const candidateIds=[
  ...Array.from({length:150},(_,i)=>String(251+i)),
  ...Array.from({length:21},(_,i)=>String(500+i)),
  ...Array.from({length:21},(_,i)=>String(740+i)),
  ...Array.from({length:21},(_,i)=>String(100+i)),
];
const uniqCandidates=[...new Set(candidateIds)];
const norm=v=>v==null?'':String(v).trim();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function scalar(v){return ['string','number','boolean'].includes(typeof v)?v:null}
function firstScalar(o,keys){for(const k of keys){const v=o?.[k];if(scalar(v)!==null)return norm(v)}return ''}
function nestedName(v){if(!v||typeof v!=='object')return '';return norm(v.name||v.displayName||v.teamName||v.title||v.label)}
function collect(value,out=[],depth=0){if(value==null||depth>20)return out;if(Array.isArray(value)){for(const v of value)collect(v,out,depth+1);return out}if(typeof value!=='object')return out;const season=firstScalar(value,['season','seasonId','seasonID']);const dateTime=firstScalar(value,['dateTime','datetime','startDateTime','startTime','date']);const id=firstScalar(value,['fixtureId','fixtureID','matchId','matchID','id']);const hasTeams=Boolean(value.homeTeam||value.awayTeam||value.teamA||value.teamB);if(season&&dateTime&&id&&(hasTeams||/fixture|match/i.test(norm(value.__typename)))){out.push({fixtureId:id,season,dateTime,competitionId:firstScalar(value,['compId','competitionId','competitionID'])||firstScalar(value.competition||{},['id','compId','competitionId']),competitionName:firstScalar(value,['compName','competitionName'])||nestedName(value.competition),homeTeam:nestedName(value.homeTeam||value.teamA),awayTeam:nestedName(value.awayTeam||value.teamB)});}for(const v of Object.values(value))if(v&&typeof v==='object')collect(v,out,depth+1);return out}
function dedupe(xs){const m=new Map();for(const x of xs){const k=`${x.fixtureId}|${x.season}|${x.dateTime}`;if(!m.has(k))m.set(k,x)}return [...m.values()]}

async function captureTemplate(){const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();let template=null;page.on('request',req=>{if(template||!req.url().includes('rugby-au-cms.graphcdn.app'))return;try{const b=JSON.parse(req.postData()||'');if(b?.operationName==='FixturesAndResults'&&b?.query)template=b}catch{}});await page.goto(`${BASE}/fixtures-results?team=All&comp=257&tab=Results`,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForTimeout(7000);await browser.close();if(!template)throw new Error('FixturesAndResults template not captured');return template}
async function post(body){const r=await fetch(GQL,{method:'POST',headers:{'content-type':'application/json',accept:'application/json','user-agent':'Mozilla/5.0'},body:JSON.stringify(body)});const text=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status}: ${text.slice(0,300)}`);let j;try{j=JSON.parse(text)}catch{throw new Error(`non-json: ${text.slice(0,300)}`)}return j}
const template=await captureTemplate();
const all=new Map(), hits=[], failures=[];
for(let ci=0;ci<uniqCandidates.length;ci++){
 const compId=uniqCandidates[ci];
 for(const st of SOURCE_TYPES){
   let skip=0,pages=0,seenLocal=new Map(),empty=false;
   while(pages<30&&!empty){
     try{
       const body=structuredClone(template);
       const compObj=st===null?{id:compId}:{id:compId,sourceType:st};
       body.variables={...(body.variables||{}),comps:[compObj],teams:[],type:'results',skip,limit:LIMIT};
       const j=await post(body);const rows=dedupe(collect(j?.data||j)).filter(x=>/^\d{4}$/.test(x.season)&&Number(x.season)>=2017&&Number(x.season)<=2026);
       if(!rows.length){empty=true;break}
       let added=0;for(const x of rows){const k=`${x.fixtureId}|${x.season}|${x.dateTime}`;if(!seenLocal.has(k)){seenLocal.set(k,x);added++}all.set(k,{...x,requestedCompId:compId,sourceTypeVariant:st??'omitted'});}
       pages++;if(rows.length<LIMIT||added===0){empty=true;break}skip+=rows.length;await sleep(35);
     }catch(e){failures.push({compId,sourceType:st??'omitted',skip,error:String(e)});empty=true}
   }
   if(seenLocal.size){const vals=[...seenLocal.values()].sort((a,b)=>a.dateTime.localeCompare(b.dateTime)||Number(a.fixtureId)-Number(b.fixtureId));hits.push({requestedCompId:compId,sourceType:st??'omitted',fixtureCount:vals.length,seasons:[...new Set(vals.map(x=>x.season))].sort(),actualCompetitionIds:[...new Set(vals.map(x=>x.competitionId).filter(Boolean))].sort((a,b)=>Number(a)-Number(b)),competitionNames:[...new Set(vals.map(x=>x.competitionName).filter(Boolean))].sort(),firstDateTime:vals[0]?.dateTime,lastDateTime:vals.at(-1)?.dateTime,firstFixtureId:vals[0]?.fixtureId,lastFixtureId:vals.at(-1)?.fixtureId});}
 }
 if(ci%10===0)await sleep(80);
}
const fixtures=[...all.values()].sort((a,b)=>a.season.localeCompare(b.season)||a.dateTime.localeCompare(b.dateTime)||Number(a.fixtureId)-Number(b.fixtureId));
const seasonCounts={};for(const x of fixtures)seasonCounts[x.season]=(seasonCounts[x.season]||0)+1;
await fs.mkdir('docs/diagnostics',{recursive:true});
await fs.writeFile(OUT,JSON.stringify({candidateCount:uniqCandidates.length,sourceTypes:SOURCE_TYPES.map(x=>x??'omitted'),uniqueFixtureCount:fixtures.length,seasonCounts,hits,fixtures,failures,capturedAt:new Date().toISOString()},null,2));
console.log(JSON.stringify({candidateCount:uniqCandidates.length,uniqueFixtureCount:fixtures.length,seasonCounts,hitVariantCount:hits.length,failureCount:failures.length},null,2));
