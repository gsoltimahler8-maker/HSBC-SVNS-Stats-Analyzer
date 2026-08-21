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
await fs.mkdir('docs/diagnostics',{recursive:true});await fs.writeFile(OUT,JSON.stringify({count:rows.length,competitions:rows,capturedAt:new Date().toISOString()},null,2));console.log(JSON.stringify({count:rows.length,competitions:rows.map(x=>({id:x.id,labels:x.labels}))},null,2));
