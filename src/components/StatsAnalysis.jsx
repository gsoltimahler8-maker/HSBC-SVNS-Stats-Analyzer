import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Legend,
} from 'recharts';
import { ShieldAlert, Database, Trophy, Filter, Info, RefreshCcw } from 'lucide-react';
import { matchData as sampleMatches } from '../data/loadMatches.js';
import { pct, avg, corr } from '../utils/statistics.js';
import ja from '../i18n/ja.js';

export default function StatsAnalysis({ onBackHome, t = ja }) {
  const labels = t.statsAnalysis;
  const screenBgImage = `${import.meta.env.BASE_URL}assets/bg-stats-analysis.png`;
  const mobileScreenBgImage = `${import.meta.env.BASE_URL}assets/bg-stats-analysis-mobile.png`;
  const isJapanese = t.navigation?.backHome?.includes('ホーム');
  const seasons = [...new Set(sampleMatches.map((m) => m.season))];

  const [season, setSeason] = useState('2025-26');
  const [gender, setGender] = useState('Women');
  const [team, setTeam] = useState('Japan');
  const [tournament, setTournament] = useState('All');
  const [selected, setSelected] = useState(sampleMatches[0]?.id || '');

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

  const selectedMatch = filtered.find((m) => m.id === selected) || filtered[0];

  const wins = filtered.filter((m) => m.result === 'W');
  const losses = filtered.filter((m) => m.result === 'L');

  const metricLabels = labels.metrics;

  const fallbackMetricLabels = {
    pointsFor: isJapanese ? '得点' : 'Points For',
    pointsAgainst: isJapanese ? '失点' : 'Points Against',
    tries: isJapanese ? 'トライ' : 'Tries',
    cleanBreaks: isJapanese ? 'クリーンブレイク' : 'Clean Breaks',
    defendersBeaten: isJapanese ? 'ディフェンダー突破' : 'Defenders Beaten',
    turnoversWon: isJapanese ? 'ターンオーバー獲得' : 'Turnovers Won',
    turnoversConceded: isJapanese ? 'ターンオーバー喪失' : 'Turnovers Conceded',
    tackles: isJapanese ? 'タックル' : 'Tackles',
    missedTackles: isJapanese ? 'ミスタックル' : 'Missed Tackles',
    possession: isJapanese ? 'ポゼッション' : 'Possession',
    pointDiff: isJapanese ? '得失点差' : 'Point Differential',
    tackleSuccess: isJapanese ? 'タックル成功率' : 'Tackle Success',
  };

  const getMetricLabel = (key) => metricLabels[key] || fallbackMetricLabels[key] || key;

  const chartMetricLabels = {
    pointsFor: 'PF',
    pointsAgainst: 'PA',
    cleanBreaks: 'Clean breaks',
    defendersBeaten: 'Def. beaten',
    turnoversWon: 'TO won',
    turnoversConceded: 'TO conceded',
    possession: 'Possession',
  };

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
    metricLabel: getMetricLabel(k),
    chartMetricLabel: chartMetricLabels[k] || getMetricLabel(k),
    wins: +avg(wins, k).toFixed(1),
    losses: +avg(losses, k).toFixed(1),
  }));

  const corrData = filtered.map((m) => {
    const tackles = Number(m.tackles || 0);
    const missedTackles = Number(m.missedTackles || 0);
    const tackleTotal = tackles + missedTackles;

    return {
      ...m,
      pointDiff: m.pointsFor - m.pointsAgainst,
      tackleSuccess: tackleTotal > 0 ? (100 * tackles) / tackleTotal : 0,
    };
  });

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
      metricLabel: getMetricLabel(k),
      correlation: corr(corrData, k, 'pointDiff'),
    }))
    .filter((x) => x.correlation !== null)
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  const mixedSeasonWarning = false;

  const tournamentLabel = (name) => (name === 'All' ? labels.filters.all : name);

  const resultLabel = (result) => (result === 'W' ? labels.results.win : labels.results.loss);

  const coverageLevelLabel = (level) =>
    labels.dataCoverage?.levels?.[level] ||
    labels.dataCoverage?.levels?.unknown ||
    level ||
    labels.dataCoverage?.unknownSource;

  const chartTooltipStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(148, 163, 184, 0.45)',
    borderRadius: '10px',
    color: '#e5e7eb',
    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.28)',
  };

  const chartTooltipLabelStyle = {
    color: '#f8fafc',
    fontWeight: 800,
  };

  const chartTooltipItemStyle = {
    color: '#e5e7eb',
  };

  return (
    <div
      className="app screenBackground statsAnalysisScreen"
      style={{
        '--screen-bg-image': `url(${screenBgImage})`,
        '--screen-bg-mobile-image': `url(${mobileScreenBgImage})`,
      }}
    >
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
            {labels.filters.season}
            <select value={season} onChange={(e) => setSeason(e.target.value)}>
              {seasons.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.gender}
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="Women">{labels.filters.women}</option>
              <option value="Men">{labels.filters.men}</option>
            </select>
          </label>

          <label>
            {labels.filters.team}
            <select value={team} onChange={(e) => setTeam(e.target.value)}>
              <option>Japan</option>
            </select>
          </label>

          <label>
            {labels.filters.tournament}
            <select value={tournament} onChange={(e) => setTournament(e.target.value)}>
              {tournaments.map((tournamentName) => (
                <option key={tournamentName} value={tournamentName}>
                  {tournamentLabel(tournamentName)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="scopeGrid">
          <span>
            {labels.scopeLabels.season}: <b>{season}</b>
          </span>
          <span>
            {labels.scopeLabels.gender}:{' '}
            <b>{gender === 'Women' ? labels.filters.women : labels.filters.men}</b>
          </span>
          <span>
            {labels.scopeLabels.tournament}: <b>{tournamentLabel(tournament)}</b>
          </span>
          <span>
            {labels.scopeLabels.matches}: <b>{filtered.length}</b>
          </span>
        </div>

        <div className="dataAvailabilityNotice">
          <b>{labels.dataAvailability.title}</b>
          <span>{labels.dataAvailability.fullStatsEra}</span>
          <small>{labels.dataAvailability.note}</small>
        </div>

        {mixedSeasonWarning && (
          <div className="warn">
            <ShieldAlert /> {labels.mixedSeasonWarning}
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
                  {resultLabel(m.result)} · {m.id}
                </em>
              </button>
            ))}

            {filtered.length === 0 && <p className="empty">{labels.noSampleData}</p>}
          </div>
        </section>

        <section className="panel">
          <h2>
            <Info size={18} /> {labels.matchDetail}
          </h2>

          {selectedMatch ? (
            <div className="detail">
              <h3>
                {selectedMatch.team} vs {selectedMatch.opponent}
              </h3>

              <div className="scoreLine">
                <b>
                  {selectedMatch.pointsFor} - {selectedMatch.pointsAgainst}
                </b>
                <span>
                  {selectedMatch.tournament} / {selectedMatch.stage} / {selectedMatch.date}
                </span>
              </div>

              <div className="metricGrid">
                <span>
                  {getMetricLabel('tries')}
                  <b>{selectedMatch.tries}</b>
                </span>
                <span>
                  {getMetricLabel('cleanBreaks')}
                  <b>{selectedMatch.cleanBreaks}</b>
                </span>
                <span>
                  {getMetricLabel('defendersBeaten')}
                  <b>{selectedMatch.defendersBeaten}</b>
                </span>
                <span>
                  {getMetricLabel('turnoversWon')}
                  <b>{selectedMatch.turnoversWon}</b>
                </span>
                <span>
                  {getMetricLabel('turnoversConceded')}
                  <b>{selectedMatch.turnoversConceded}</b>
                </span>
                <span>
                  {getMetricLabel('tackles')}
                  <b>{selectedMatch.tackles}</b>
                </span>
                <span>
                  {getMetricLabel('missedTackles')}
                  <b>{selectedMatch.missedTackles}</b>
                </span>
                <span>
                  {getMetricLabel('possession')}
                  <b>{pct(selectedMatch.possession)}</b>
                </span>
                <span>
                  {getMetricLabel('pointDiff')}
                  <b>{selectedMatch.pointsFor - selectedMatch.pointsAgainst}</b>
                </span>
              </div>

              <div className="sourceBox">
                <b>{labels.traceability}</b>
                <br />
                {labels.internalMatchId}: {selectedMatch.id}
                <br />
                {labels.rugbyComAuId}: {selectedMatch.external?.rugbyComAu || 'Unknown'}
                <br />
                {labels.svnsId}: {selectedMatch.external?.svns || 'Unknown'}
                <br />
                {labels.lastFetched}:{' '}
                {selectedMatch.fetchedAt || 'Unknown'}
                <br />
                {labels.sourceProvider}: {selectedMatch.sourceProvider || 'Unknown'}
                <br />
                {labels.statDefinitionVersion}: {selectedMatch.statDefinitionVersion || 'Unknown'}
                <br />
                {labels.dataCoverage.label}: {coverageLevelLabel(selectedMatch.dataCoverageLevel)}
                <br />
                {labels.dataCoverage.sourceLabel}:{' '}
                {selectedMatch.dataCoverageSource || labels.dataCoverage.unknownSource}
              </div>
            </div>
          ) : (
            <p className="empty">{labels.noSampleData}</p>
          )}
        </section>

        <section className="panel wide">
          <h2>{labels.winLossComparison}</h2>
          <p className="note">{labels.winLossNote}</p>

          <div className="chart">
            <ResponsiveContainer width="100%" height={390}>
              <BarChart
                data={analysisRows}
                layout="vertical"
                margin={{ top: 8, right: 20, bottom: 8, left: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="chartMetricLabel"
                  width={92}
                  interval={0}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={false}
                  labelFormatter={(value, payload) =>
                    payload?.[0]?.payload?.metricLabel || value
                  }
                  contentStyle={chartTooltipStyle}
                  labelStyle={chartTooltipLabelStyle}
                  itemStyle={chartTooltipItemStyle}
                />
                <Legend />
                <Bar dataKey="wins" name={labels.results.winsAvg} fill="#22c55e" />
                <Bar dataKey="losses" name={labels.results.lossesAvg} fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel wide">
          <h2>{labels.candidateDrivers}</h2>
          <p className="note">{labels.candidateDriversNote}</p>
          <p className="note sampleSizeNote">
            {labels.candidateDriversSampleSize}: n={corrData.length}
          </p>

          {corrData.length > 0 && corrData.length < 6 && (
            <div className="smallSampleWarning">
              <ShieldAlert size={16} />
              <span>{labels.candidateDriversSmallSampleWarning}</span>
            </div>
          )}

          <div className="cards">
            {correlations.map((c) => (
              <div className="corr" key={c.metric}>
                <span>{c.metricLabel}</span>
                <b>{c.correlation.toFixed(2)}</b>
                <small>
                  {labels.candidateDriversSampleSize}: n={corrData.length}
                </small>
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
                <XAxis type="number" dataKey="cleanBreaks" name={labels.scatter.xAxis} />
                <YAxis type="number" dataKey="pointDiff" name={labels.scatter.yAxis} />
                <Tooltip
                  cursor={false}
                  contentStyle={chartTooltipStyle}
                  labelStyle={chartTooltipLabelStyle}
                  itemStyle={chartTooltipItemStyle}
                />
                <Scatter data={corrData} name={labels.scatter.matches} fill="#38bdf8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel wide">
          <h2>
            <RefreshCcw size={18} /> {labels.nextImplementation}
          </h2>

          <ol>
            {labels.nextImplementationItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
