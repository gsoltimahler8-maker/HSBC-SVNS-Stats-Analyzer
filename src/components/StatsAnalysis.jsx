import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend } from 'recharts';
import { ShieldAlert, Database, Trophy, Filter, Info, RefreshCcw } from 'lucide-react';
import { sampleMatches } from '../data/sampleMatches.js';
import { pct, avg, corr } from '../utils/statistics.js';
import ja from '../i18n/ja.js';

export default function StatsAnalysis({ onBackHome, t = ja }) {
  const labels = t.statsAnalysis;
  const seasons = [...new Set(sampleMatches.map((m) => m.season))];

  const [season, setSeason] = useState('2025-26');
  const [gender, setGender] = useState('Women');
  const [team, setTeam] = useState('Japan');
  const [tournament, setTournament] = useState('All');
  const [selected, setSelected] = useState(sampleMatches[0].id);

  const filtered = useMemo(
    () =>
      sampleMatches.filter(
        (m) =>
          m.season === season &&
          m.gender === gender &&
          m.team === team &&
          (tournament === 'All' || m.tournament === tournament)
      ),
    [season, gender, team, tournament]
  );

  const tournaments = [
    'All',
    ...new Set(
      sampleMatches
        .filter((m) => m.season === season && m.gender === gender)
        .map((m) => m.tournament)
    ),
  ];

  const selectedMatch = sampleMatches.find((m) => m.id === selected) || filtered[0];

  const wins = filtered.filter((m) => m.result === 'W');
  const losses = filtered.filter((m) => m.result === 'L');

  const analysisRows = [
    'pointsFor',
    'pointsAgainst',
    'cleanBreaks',
    'defendersBeaten',
    'turnoversWon',
    'turnoversConceded',
    'possession',
  ].map((k) => ({
    metric: k,
    wins: +avg(wins, k).toFixed(1),
    losses: +avg(losses, k).toFixed(1),
  }));

  const corrData = filtered.map((m) => ({
    ...m,
    pointDiff: m.pointsFor - m.pointsAgainst,
    tackleSuccess: (100 * m.tackles) / (m.tackles + m.missedTackles),
  }));

  const correlations = [
    'cleanBreaks',
    'defendersBeaten',
    'turnoversWon',
    'turnoversConceded',
    'possession',
    'tackleSuccess',
  ]
    .map((k) => ({
      metric: k,
      correlation: corr(corrData, k, 'pointDiff'),
    }))
    .filter((x) => x.correlation !== null)
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  const mixedSeasonWarning = false;

  return (
    <div className="app">
      {onBackHome && (
        <button type="button" className="backHomeButton" onClick={onBackHome}>
          {t.navigation.backHome}
        </button>
      )}

      <div
        style={{
          background: '#fff3cd',
          color: '#3b2f00',
          padding: '12px 16px',
          border: '1px solid #ffda6a',
          borderRadius: '12px',
          margin: '12px',
        }}
      >
        {labels.sampleWarning}
      </div>

      <header className="hero">
        <div>
          <img
            className="appIconPreview"
            src={`${import.meta.env.BASE_URL}icon-192.png`}
            alt="SVNS Stats icon"
          />
          <h1>{t.appTitle}</h1>
          <p>{labels.subtitle}</p>
        </div>
        <div className="badge">
          <Database size={22} /> {labels.badge}
        </div>
      </header>

      <section className="panel scope">
        <h2>
          <Filter size={18} /> {labels.dataScope}
        </h2>

        <div className="filters">
          <label>
            Season
            <select value={season} onChange={(e) => setSeason(e.target.value)}>
              {seasons.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            Gender
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option>Women</option>
              <option>Men</option>
            </select>
          </label>

          <label>
            Team
            <select value={team} onChange={(e) => setTeam(e.target.value)}>
              <option>Japan</option>
            </select>
          </label>

          <label>
            Tournament
            <select value={tournament} onChange={(e) => setTournament(e.target.value)}>
              {tournaments.map((tournamentName) => (
                <option key={tournamentName}>{tournamentName}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="scopeGrid">
          <span>
            Season: <b>{season}</b>
          </span>
          <span>
            Gender: <b>{gender}</b>
          </span>
          <span>
            Tournament: <b>{tournament}</b>
          </span>
          <span>
            Matches: <b>{filtered.length}</b>
          </span>
        </div>

        {mixedSeasonWarning && (
          <div className="warn">
            <ShieldAlert /> 複数シーズンの統合分析です。選手構成・大会形式の差に注意。
          </div>
        )}
      </section>

      <main className="grid">
        <section className="panel">
          <h2>
            <Trophy size={18} /> {labels.matchList}
          </h2>

          <div className="matches">
            {filtered.map((m) => (
              <button
                className={m.id === selected ? 'match active' : 'match'}
                key={m.id}
                onClick={() => setSelected(m.id)}
              >
                <b>
                  {m.team} {m.pointsFor}-{m.pointsAgainst} {m.opponent}
                </b>
                <span>
                  {m.date} / {m.tournament} / {m.stage}
                </span>
                <em>
                  {m.result === 'W' ? 'Win' : 'Loss'} · {m.id}
                </em>
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="empty">{labels.noSampleData}</p>
            )}
          </div>
        </section>

        <section className="panel">
          <h2>
            <Info size={18} /> {labels.matchDetail}
          </h2>

          {selectedMatch && (
            <div className="detail">
              <h3>
                {selectedMatch.team} {selectedMatch.pointsFor}-{selectedMatch.pointsAgainst}{' '}
                {selectedMatch.opponent}
              </h3>
              <p>
                {selectedMatch.season} / {selectedMatch.gender} /{' '}
                {selectedMatch.tournament} / {selectedMatch.date}
              </p>

              <div className="statGrid">
                <span>
                  Clean breaks<b>{selectedMatch.cleanBreaks}</b>
                </span>
                <span>
                  Defenders beaten<b>{selectedMatch.defendersBeaten}</b>
                </span>
                <span>
                  Turnovers won<b>{selectedMatch.turnoversWon}</b>
                </span>
                <span>
                  Tackle success
                  <b>
                    {pct(
                      (100 * selectedMatch.tackles) /
                        (selectedMatch.tackles + selectedMatch.missedTackles)
                    )}
                  </b>
                </span>
                <span>
                  Possession<b>{pct(selectedMatch.possession)}</b>
                </span>
                <span>
                  Point diff
                  <b>{selectedMatch.pointsFor - selectedMatch.pointsAgainst}</b>
                </span>
              </div>

              <div className="sourceBox">
                <b>{labels.traceability}</b>
                <br />
                {labels.internalMatchId}: {selectedMatch.id}
                <br />
                {labels.rugbyComAuId}: {selectedMatch.external.rugbyComAu}
                <br />
                {labels.svnsId}: {selectedMatch.external.svns}
                <br />
                {labels.lastFetched}: {selectedMatch.lastFetched}
              </div>
            </div>
          )}
        </section>

        <section className="panel wide">
          <h2>{labels.winLossComparison}</h2>
          <p className="note">{labels.winLossNote}</p>

          <div className="chart">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={analysisRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="wins" name="Wins avg" fill="#22c55e" />
                <Bar dataKey="losses" name="Losses avg" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel wide">
          <h2>{labels.candidateDrivers}</h2>
          <p className="note">{labels.candidateDriversNote}</p>

          <div className="cards">
            {correlations.map((c) => (
              <div className="corr" key={c.metric}>
                <span>{c.metric}</span>
                <b>{c.correlation.toFixed(2)}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="panel wide">
          <h2>{labels.scatterTitle}</h2>

          <div className="chart">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis type="number" dataKey="cleanBreaks" name="Clean breaks" />
                <YAxis type="number" dataKey="pointDiff" name="Point diff" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={corrData} name="Matches" fill="#38bdf8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel wide">
          <h2>
            <RefreshCcw size={18} /> {labels.nextImplementation}
          </h2>

          <ol>
            <li>Supabaseに seasons / tournaments / matches / match_team_stats / sources を作る。</li>
            <li>CSV取込を追加して手動データで検証する。</li>
            <li>
              Rugby.com.au/SVNSの取得処理をScheduled Import Service / Serverless
              Functionsに追加する。
            </li>
            <li>
              取得元HTML/JSONを raw_data として保存し、分析値と元データを照合可能にする。
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
