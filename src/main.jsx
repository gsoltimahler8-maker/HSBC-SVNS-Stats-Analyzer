import './registerSW.js';
import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, Legend } from 'recharts';
import { ShieldAlert, Database, Trophy, Filter, Search, Info, Download, RefreshCcw } from 'lucide-react';
import './styles.css';

const sampleMatches = [
  { id:'M-202526-W-DUB-001', external:{ rugbyComAu:'950101', svns:'dubai-w-001'}, season:'2025-26', tournament:'Dubai SVNS', date:'2025-11-29', gender:'Women', stage:'Pool', team:'Japan', opponent:'New Zealand', result:'L', pointsFor:5, pointsAgainst:31, tries:1, cleanBreaks:1, defendersBeaten:5, turnoversWon:2, turnoversConceded:6, tackles:42, missedTackles:12, possession:41, sourceUrl:'https://example.com/rugby-match-950101', lastFetched:'2026-06-10T09:00:00+09:00' },
  { id:'M-202526-W-DUB-002', external:{ rugbyComAu:'950102', svns:'dubai-w-002'}, season:'2025-26', tournament:'Dubai SVNS', date:'2025-11-30', gender:'Women', stage:'Bronze Final', team:'Japan', opponent:'Fiji', result:'W', pointsFor:22, pointsAgainst:12, tries:4, cleanBreaks:5, defendersBeaten:18, turnoversWon:4, turnoversConceded:3, tackles:31, missedTackles:5, possession:52, sourceUrl:'https://example.com/rugby-match-950102', lastFetched:'2026-06-10T09:00:00+09:00' },
  { id:'M-202526-W-CPT-001', external:{ rugbyComAu:'950201', svns:'capetown-w-001'}, season:'2025-26', tournament:'Cape Town SVNS', date:'2025-12-06', gender:'Women', stage:'Pool', team:'Japan', opponent:'Canada', result:'L', pointsFor:12, pointsAgainst:17, tries:2, cleanBreaks:3, defendersBeaten:12, turnoversWon:3, turnoversConceded:5, tackles:36, missedTackles:8, possession:48, sourceUrl:'https://example.com/rugby-match-950201', lastFetched:'2026-06-10T09:00:00+09:00' },
  { id:'M-202526-W-CPT-002', external:{ rugbyComAu:'950202', svns:'capetown-w-002'}, season:'2025-26', tournament:'Cape Town SVNS', date:'2025-12-06', gender:'Women', stage:'Pool', team:'Japan', opponent:'France', result:'W', pointsFor:19, pointsAgainst:14, tries:3, cleanBreaks:4, defendersBeaten:16, turnoversWon:5, turnoversConceded:4, tackles:34, missedTackles:6, possession:50, sourceUrl:'https://example.com/rugby-match-950202', lastFetched:'2026-06-10T09:00:00+09:00' },
  { id:'M-202526-M-DUB-001', external:{ rugbyComAu:'960101', svns:'dubai-m-001'}, season:'2025-26', tournament:'Dubai SVNS', date:'2025-11-29', gender:'Men', stage:'Pool', team:'Japan', opponent:'South Africa', result:'L', pointsFor:7, pointsAgainst:35, tries:1, cleanBreaks:2, defendersBeaten:9, turnoversWon:2, turnoversConceded:8, tackles:44, missedTackles:15, possession:38, sourceUrl:'https://example.com/rugby-match-960101', lastFetched:'2026-06-10T09:00:00+09:00' },
  { id:'M-202425-W-HKG-001', external:{ rugbyComAu:'840901', svns:'hongkong-w-001'}, season:'2024-25', tournament:'Hong Kong SVNS', date:'2025-03-28', gender:'Women', stage:'Pool', team:'Japan', opponent:'Australia', result:'L', pointsFor:10, pointsAgainst:26, tries:2, cleanBreaks:2, defendersBeaten:10, turnoversWon:3, turnoversConceded:6, tackles:39, missedTackles:11, possession:44, sourceUrl:'https://example.com/rugby-match-840901', lastFetched:'2026-06-10T09:00:00+09:00' }
];

function pct(n){ return `${Math.round(n)}%`; }
function avg(arr, key){ return arr.length ? arr.reduce((s,m)=>s+(m[key]||0),0)/arr.length : 0; }
function corr(data, xKey, yKey){
  if(data.length < 2) return null;
  const xs=data.map(d=>d[xKey]); const ys=data.map(d=>d[yKey]);
  const mx=xs.reduce((a,b)=>a+b,0)/xs.length; const my=ys.reduce((a,b)=>a+b,0)/ys.length;
  const num=xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0);
  const den=Math.sqrt(xs.reduce((s,x)=>s+(x-mx)**2,0)*ys.reduce((s,y)=>s+(y-my)**2,0));
  return den ? num/den : null;
}

function App(){
  const seasons=[...new Set(sampleMatches.map(m=>m.season))];
  const [season,setSeason]=useState('2025-26');
  const [gender,setGender]=useState('Women');
  const [team,setTeam]=useState('Japan');
  const [tournament,setTournament]=useState('All');
  const [selected,setSelected]=useState(sampleMatches[0].id);
  const filtered=useMemo(()=>sampleMatches.filter(m=>m.season===season && m.gender===gender && m.team===team && (tournament==='All'||m.tournament===tournament)),[season,gender,team,tournament]);
  const tournaments=['All',...new Set(sampleMatches.filter(m=>m.season===season && m.gender===gender).map(m=>m.tournament))];
  const selectedMatch=sampleMatches.find(m=>m.id===selected) || filtered[0];
  const wins=filtered.filter(m=>m.result==='W'); const losses=filtered.filter(m=>m.result==='L');
  const analysisRows=['pointsFor','pointsAgainst','cleanBreaks','defendersBeaten','turnoversWon','turnoversConceded','possession'].map(k=>({metric:k, wins:+avg(wins,k).toFixed(1), losses:+avg(losses,k).toFixed(1)}));
  const corrData=filtered.map(m=>({...m, pointDiff:m.pointsFor-m.pointsAgainst, tackleSuccess: 100*m.tackles/(m.tackles+m.missedTackles)}));
  const correlations=['cleanBreaks','defendersBeaten','turnoversWon','turnoversConceded','possession','tackleSuccess'].map(k=>({metric:k, correlation:corr(corrData,k,'pointDiff')})).filter(x=>x.correlation!==null).sort((a,b)=>Math.abs(b.correlation)-Math.abs(a.correlation));
  const mixedSeasonWarning=false;
  return <div className="app">
    <div style={{background:'#fff3cd', color:'#3b2f00', padding:'12px 16px', border:'1px solid #ffda6a', borderRadius:'12px', margin:'12px'}}>
      ⚠ SAMPLE DATA / DEMO MODE：現在表示されている試合結果・スタッツは画面確認用の仮データです。実際のHSBC SVNS公式結果ではありません。
    </div>
    <header className="hero"><div><img
  className="appIconPreview"
  src={`${import.meta.env.BASE_URL}icon-192.png`}
  alt="SVNS Stats icon"
/><h1>SVNS Stats Analyzer</h1><p>シーズン・大会・男女区分を明示し、試合単位の元データまで遡るためのHSBC SVNS分析PWA試作。</p></div><div className="badge"><Database size={22}/> HSBC SVNS Analytics</div></header>
    <section className="panel scope"><h2><Filter size={18}/> Data Scope</h2><div className="filters">
      <label>Season<select value={season} onChange={e=>setSeason(e.target.value)}>{seasons.map(s=><option key={s}>{s}</option>)}</select></label>
      <label>Gender<select value={gender} onChange={e=>setGender(e.target.value)}><option>Women</option><option>Men</option></select></label>
      <label>Team<select value={team} onChange={e=>setTeam(e.target.value)}><option>Japan</option></select></label>
      <label>Tournament<select value={tournament} onChange={e=>setTournament(e.target.value)}>{tournaments.map(t=><option key={t}>{t}</option>)}</select></label>
    </div><div className="scopeGrid"><span>Season: <b>{season}</b></span><span>Gender: <b>{gender}</b></span><span>Tournament: <b>{tournament}</b></span><span>Matches: <b>{filtered.length}</b></span></div>
    {mixedSeasonWarning && <div className="warn"><ShieldAlert/> 複数シーズンの統合分析です。選手構成・大会形式の差に注意。</div>}
    </section>
    <main className="grid">
      <section className="panel"><h2><Trophy size={18}/> Match list</h2><div className="matches">{filtered.map(m=><button className={m.id===selected?'match active':'match'} key={m.id} onClick={()=>setSelected(m.id)}><b>{m.team} {m.pointsFor}-{m.pointsAgainst} {m.opponent}</b><span>{m.date} / {m.tournament} / {m.stage}</span><em>{m.result==='W'?'Win':'Loss'} · {m.id}</em></button>)}{filtered.length===0 && <p className="empty">この条件のサンプルデータはありません。</p>}</div></section>
      <section className="panel"><h2><Info size={18}/> Match detail</h2>{selectedMatch && <div className="detail"><h3>{selectedMatch.team} {selectedMatch.pointsFor}-{selectedMatch.pointsAgainst} {selectedMatch.opponent}</h3><p>{selectedMatch.season} / {selectedMatch.gender} / {selectedMatch.tournament} / {selectedMatch.date}</p><div className="statGrid"><span>Clean breaks<b>{selectedMatch.cleanBreaks}</b></span><span>Defenders beaten<b>{selectedMatch.defendersBeaten}</b></span><span>Turnovers won<b>{selectedMatch.turnoversWon}</b></span><span>Tackle success<b>{pct(100*selectedMatch.tackles/(selectedMatch.tackles+selectedMatch.missedTackles))}</b></span><span>Possession<b>{pct(selectedMatch.possession)}</b></span><span>Point diff<b>{selectedMatch.pointsFor-selectedMatch.pointsAgainst}</b></span></div><div className="sourceBox"><b>Traceability</b><br/>Internal Match ID: {selectedMatch.id}<br/>Rugby.com.au ID: {selectedMatch.external.rugbyComAu}<br/>SVNS ID: {selectedMatch.external.svns}<br/>Last fetched: {selectedMatch.lastFetched}</div></div>}</section>
      <section className="panel wide"><h2>Win/Loss comparison</h2><p className="note">分析条件を固定した上で、勝利試合と敗戦試合の平均値を比較します。</p><div className="chart"><ResponsiveContainer width="100%" height={320}><BarChart data={analysisRows}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="metric"/><YAxis/><Tooltip/><Legend/><Bar
  dataKey="wins"
  name="Wins avg"
  fill="#22c55e"
/>

<Bar
  dataKey="losses"
  name="Losses avg"
  fill="#ef4444"
/></BarChart></ResponsiveContainer></div></section>
      <section className="panel wide"><h2>Candidate drivers</h2><p className="note">点差との相関係数です。因果ではなく、候補の順位付けとして扱います。</p><div className="cards">{correlations.map(c=><div className="corr" key={c.metric}><span>{c.metric}</span><b>{c.correlation.toFixed(2)}</b></div>)}</div></section>
      <section className="panel wide"><h2>Clean breaks vs point difference</h2><div className="chart"><ResponsiveContainer width="100%" height={300}><ScatterChart><CartesianGrid/><XAxis type="number" dataKey="cleanBreaks" name="Clean breaks"/><YAxis type="number" dataKey="pointDiff" name="Point diff"/><Tooltip cursor={{strokeDasharray:'3 3'}}/><Scatter
  data={corrData}
  name="Matches"
  fill="#38bdf8"
/></ScatterChart></ResponsiveContainer></div></section>
      <section className="panel wide"><h2><RefreshCcw size={18}/> Next implementation</h2><ol><li>Supabaseに seasons / tournaments / matches / match_team_stats / sources を作る。</li><li>CSV取込を追加して手動データで検証する。</li><li>Rugby.com.au/SVNSの取得処理をScheduled Import Service / Serverless Functionsに追加する。</li><li>取得元HTML/JSONを raw_data として保存し、分析値と元データを照合可能にする。</li></ol></section>
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
