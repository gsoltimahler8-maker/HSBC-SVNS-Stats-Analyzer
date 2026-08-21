import fs from 'node:fs/promises';
const BASE='https://www.rugby.com.au';
const OUT='docs/diagnostics/raw-sevens-competition-index.json';
const headers={'user-agent':'Mozilla/5.0','accept-language':'en-US,en;q=0.9'};
const r=await fetch(`${BASE}/fixtures-results?team=All&comp=All&tab=Results`,{headers});
const html=await r.text();
const m=html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);if(!m)throw new Error('__NEXT_DATA__ missing');
const next=JSON.parse(m[1]);
const norm=v=>v==null?'':String(v).trim();
const out=[];
function walk(v,p='$',d=0){if(v==null||d>20)return;if(Array.isArray(v)){v.forEach((x,i)=>walk(x,`${p}[${i}]`,d+1));return;}if(typeof v!=='object')return;const label=norm(v.label||v.name||v.title||v.compName||v.competitionName);const raw=v.value??v.id??v.compId??v.competitionId;const id=raw==null?'':norm(raw);if(label&&/^\d+$/.test(id)&&/(svns|sevens|7s)/i.test(label))out.push({id,label,path:p});for(const [k,x] of Object.entries(v))if(x&&typeof x==='object')walk(x,`${p}.${k}`,d+1);}
walk(next);
const by=new Map();for(const x of out){if(!by.has(x.id))by.set(x.id,{id:x.id,labels:new Set(),paths:new Set()});by.get(x.id).labels.add(x.label);by.get(x.id).paths.add(x.path);}
const rows=[...by.values()].map(x=>({id:x.id,labels:[...x.labels],paths:[...x.paths]})).sort((a,b)=>Number(a.id)-Number(b.id));
const rootProps=next?.props?.pageProps?.pageData?.content?.document?.[0]?.props||{};
const parentCompetitions=(Array.isArray(rootProps.competitions)?rootProps.competitions:[]).map((c,index)=>{
 const scalars={};for(const [k,v] of Object.entries(c||{}))if(['string','number','boolean'].includes(typeof v))scalars[k]=v;
 const nested={};for(const [k,v] of Object.entries(c||{}))if(v&&typeof v==='object')nested[k]=Array.isArray(v)?{kind:'array',length:v.length,sampleScalars:v.slice(0,3).map(x=>{const s={};if(x&&typeof x==='object')for(const [kk,vv] of Object.entries(x))if(['string','number','boolean'].includes(typeof vv))s[kk]=vv;return s;})}:{kind:'object',keys:Object.keys(v)};
 return {index,scalars,keys:Object.keys(c||{}),nested};
});

const seedPage=await fetch(`${BASE}/match-centre/257/2017/37719?tab=Match-Stats`,{headers});
const seedHtml=await seedPage.text();
const sm=seedHtml.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
let routeStrictness=null;
if(sm){
 const buildId=JSON.parse(sm[1]).buildId;
 const tests=[];
 for(const comp of ['257','251','999']){
  const u=`${BASE}/_next/data/${encodeURIComponent(buildId)}/match-centre/${comp}/2017/37719.json?tab=Match-Stats&comp=${comp}&season=2017&fixture=37719`;
  const rr=await fetch(u,{headers});const text=await rr.text();let parsed=null;try{parsed=JSON.parse(text);}catch{}
  const f=parsed?.pageProps?.matchData?.getFixtureItem||null;
  tests.push({requestedComp:comp,status:rr.status,hasFixture:Boolean(f),actualComp:norm(f?.compId||f?.competitionId),actualFixture:norm(f?.fixtureId||f?.id)});
 }
 routeStrictness={buildId,fixture:'37719',tests};
}
await fs.mkdir('docs/diagnostics',{recursive:true});await fs.writeFile(OUT,JSON.stringify({count:rows.length,competitions:rows,parentCompetitions,routeStrictness,capturedAt:new Date().toISOString()},null,2));console.log(JSON.stringify({count:rows.length,parentCompetitionCount:parentCompetitions.length,routeStrictness},null,2));
