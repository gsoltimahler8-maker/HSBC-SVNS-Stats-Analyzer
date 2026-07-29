import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Database, Filter, Info } from 'lucide-react';
import { matchData as matches } from '../data/loadMatches.js';
import ja from '../i18n/ja.js';
import {
  COMPARISON_METRIC_KEYS,
  RELATIONSHIP_METRIC_KEYS,
  averageMetric,
  compareMatchesChronologically,
  formatMetricValue,
  getMetricCoverage,
  getMetricDefinition,
  getMetricFormula,
  getMetricLabel,
  getMetricValue,
  getTeamResult,
  getUniqueValues,
  groupMatches,
} from '../utils/analyticsMetrics.js';
import '../analytics.css';

const ALL = 'All';

const selectLatestSeason = (seasons) =>
  seasons.slice().sort((a, b) => b.localeCompare(a))[0] || '';

export default function StatsAnalysis({ onBackHome, t = ja }) {
  const isJapanese = t.navigation?.backHome?.includes('ホーム');
  const screenBgImage = `${import.meta.env.BASE_URL}assets/bg-stats-analysis.png`;
  const mobileScreenBgImage = `${import.meta.env.BASE_URL}assets/bg-stats-analysis-mobile.png`;

  const copy = {
    title: isJapanese ? 'スタッツ分析' : 'Stats Analysis',
    subtitle: isJapanese
      ? '選択したシーズンの概要、比較、指標間の関係を分析します。'
      : 'Analyse the selected season through overview, comparison and metric relationships.',
    badge: isJapanese ? 'シーズン・大会分析' : 'Season & Tournament Analysis',
    scope: isJapanese ? '分析条件' : 'Analysis Scope',
    season: isJapanese ? 'シーズン' : 'Season',
    gender: isJapanese ? '男女区分' : 'Gender',
    team: isJapanese ? 'チーム' : 'Team',
    tournament: isJapanese ? '大会' : 'Tournament',
    opponent: isJapanese ? '対戦相手' : 'Opponent',
    result: isJapanese ? '試合結果' : 'Result',
    all: isJapanese ? 'すべて' : 'All',
    women: isJapanese ? '女子' : 'Women',
    men: isJapanese ? '男子' : 'Men',
    win: isJapanese ? '勝利' : 'Win',
    loss: isJapanese ? '敗戦' : 'Loss',
    matches: isJapanese ? '対象試合' : 'Matches',
    dataCoverage: isJapanese ? 'データ利用可能数' : 'Data Coverage',
    realData: isJapanese ? '実データ' : 'Real Data',
    sampleData: isJapanese ? 'サンプルデータ' : 'Sample Data',
    sampleWarning: isJapanese
      ? 'この表示範囲にはサンプルデータが含まれています。実データと混同せず、画面検証用として解釈してください。'
      : 'This view includes sample data. Treat it as interface-validation data and do not mix it with real-data conclusions.',
    noData: isJapanese
      ? '現在の条件に一致する試合がありません。'
      : 'No matches are available for the current filters.',
    overview: isJapanese ? '概要' : 'Overview',
    comparison: isJapanese ? '比較' : 'Comparison',
    relationships: isJapanese ? '指標間分析' : 'Relationships',
    overviewIntro: isJapanese
      ? '選択範囲を、試合数・勝率・平均効率・規律の観点から要約します。'
      : 'Summarises the selected scope through match count, win rate, efficiency and discipline.',
    comparisonIntro: isJapanese
      ? '同じ指標を大会、勝敗、対戦相手ごとに比較します。'
      : 'Compares one metric by tournament, result or opponent.',
    relationshipsIntro: isJapanese
      ? '1試合を1点として、二つの指標の関係を確認します。'
      : 'Plots one point per match to review the relationship between two metrics.',
    compareBy: isJapanese ? '比較単位' : 'Compare by',
    metric: isJapanese ? '指標' : 'Metric',
    tournamentComparison: isJapanese ? '大会' : 'Tournament',
    resultComparison: isJapanese ? '勝敗' : 'Result',
    opponentComparison: isJapanese ? '対戦相手' : 'Opponent',
    average: isJapanese ? '平均' : 'Average',
    available: isJapanese ? '利用可能' : 'Available',
    metricDefinition: isJapanese ? '指標定義' : 'Metric Definition',
    rawMetric: isJapanese ? '取得値' : 'Raw metric',
    calculatedMetric: isJapanese ? '計算指標' : 'Calculated metric',
    xAxis: isJapanese ? 'X軸' : 'X axis',
    yAxis: isJapanese ? 'Y軸' : 'Y axis',
    plottedMatches: isJapanese ? 'プロット可能試合' : 'Plotted matches',
    smallSample: isJapanese
      ? '表示結果は選択範囲内の記述的な関連です。試合数が少ないため、相関や因果関係は断定しません。'
      : 'This is a descriptive association within the selected scope. The sample is too small for causal or firm correlation claims.',
    missingData: isJapanese
      ? '必要な値が欠けている試合は計算・グラフから除外し、0として扱いません。'
      : 'Matches with missing inputs are excluded from calculations and charts rather than treated as zero.',
    fullStatsCoverage: isJapanese ? '詳細データ試合' : 'Full-stat matches',
    pointDifferential: isJapanese ? '平均得失点差' : 'Average point differential',
    averagePenalties: isJapanese ? '平均反則数' : 'Average penalties',
    averageTurnovers: isJapanese ? '平均ターンオーバー差' : 'Average turnover differential',
    averageMetresPerCarry: isJapanese
      ? '平均1キャリー当たりメートル'
      : 'Average metres per carry',
    averageTackleSuccess: isJapanese
      ? '平均タックル成功率'
      : 'Average tackle success',
    winRate: isJapanese ? '勝率' : 'Win rate',
    dataSources: isJapanese ? '主なデータソース' : 'Primary data sources',
  };

  const seasons = getUniqueValues(matches, 'season');
  const genders = getUniqueValues(matches, 'gender');
  const teams = getUniqueValues(matches, 'team');

  const [season, setSeason] = useState(selectLatestSeason(seasons));
  const [gender, setGender] = useState(
    genders.includes('Women') ? 'Women' : genders[0] || ''
  );
  const [team, setTeam] = useState(
    teams.includes('Japan') ? 'Japan' : teams[0] || ''
  );
  const [tournament, setTournament] = useState(ALL);
  const [opponent, setOpponent] = useState(ALL);
  const [result, setResult] = useState(ALL);
  const [mode, setMode] = useState('overview');
  const [compareBy, setCompareBy] = useState('result');
  const [comparisonMetric, setComparisonMetric] = useState(
    'penaltiesConceded'
  );
  const [scatterX, setScatterX] = useState('penaltiesConceded');
  const [scatterY, setScatterY] = useState('pointDiff');

  useEffect(() => {
    setTournament(ALL);
    setOpponent(ALL);
    setResult(ALL);
  }, [season, gender, team]);

  useEffect(() => {
    setOpponent(ALL);
  }, [tournament]);

  const baseScope = useMemo(
    () =>
      matches.filter(
        (match) =>
          match.season === season &&
          match.gender === gender &&
          match.team === team
      ),
    [season, gender, team]
  );

  const tournaments = getUniqueValues(baseScope, 'tournament');

  const tournamentScope = useMemo(
    () =>
      baseScope.filter(
        (match) =>
          tournament === ALL || match.tournament === tournament
      ),
    [baseScope, tournament]
  );

  const opponents = getUniqueValues(tournamentScope, 'opponent');

  const filtered = useMemo(
    () =>
      tournamentScope
        .filter(
          (match) => opponent === ALL || match.opponent === opponent
        )
        .filter(
          (match) =>
            result === ALL || getTeamResult(match) === result
        )
        .slice()
        .sort(compareMatchesChronologically),
    [tournamentScope, opponent, result]
  );

  const wins = filtered.filter((match) => getTeamResult(match) === 'W');
  const knownResults = filtered.filter((match) =>
    ['W', 'L'].includes(getTeamResult(match))
  );
  const winRate = knownResults.length
    ? (wins.length / knownResults.length) * 100
    : null;

  const fullStatsCount = filtered.filter(
    (match) => match.dataCoverageLevel === 'full_match_stats'
  ).length;

  const sourceProviders = [
    ...new Set(
      filtered
        .map((match) => match.sourceProvider)
        .filter(Boolean)
    ),
  ];

  const includesSampleData = filtered.some(
    (match) =>
      match.dataType === 'sample' ||
      String(match.sourceProvider || '')
        .toLowerCase()
        .includes('sample')
  );

  const overviewCards = [
    {
      label: copy.matches,
      value: String(filtered.length),
      sub: `${copy.fullStatsCoverage}: ${fullStatsCount}/${filtered.length}`,
    },
    {
      label: copy.winRate,
      value: winRate === null ? '—' : `${winRate.toFixed(1)}%`,
      sub: `${wins.length}/${knownResults.length}`,
    },
    {
      label: copy.pointDifferential,
      value: formatMetricValue(
        'pointDiff',
        averageMetric(filtered, 'pointDiff')
      ),
      sub: getMetricFormula('pointDiff', isJapanese),
    },
    {
      label: copy.averagePenalties,
      value: formatMetricValue(
        'penaltiesConceded',
        averageMetric(filtered, 'penaltiesConceded')
      ),
      sub: `${getMetricCoverage(filtered, 'penaltiesConceded').available}/${filtered.length}`,
    },
    {
      label: copy.averageTurnovers,
      value: formatMetricValue(
        'turnoverDifferential',
        averageMetric(filtered, 'turnoverDifferential')
      ),
      sub: getMetricFormula('turnoverDifferential', isJapanese),
    },
    {
      label: copy.averageMetresPerCarry,
      value: formatMetricValue(
        'metresPerCarry',
        averageMetric(filtered, 'metresPerCarry')
      ),
      sub: `${getMetricCoverage(filtered, 'metresPerCarry').available}/${filtered.length}`,
    },
    {
      label: copy.averageTackleSuccess,
      value: formatMetricValue(
        'tackleSuccess',
        averageMetric(filtered, 'tackleSuccess')
      ),
      sub: `${getMetricCoverage(filtered, 'tackleSuccess').available}/${filtered.length}`,
    },
    {
      label: copy.dataSources,
      value: sourceProviders.length ? String(sourceProviders.length) : '—',
      sub: sourceProviders.join(' / ') || '—',
    },
  ];

  const comparisonGroups = useMemo(() => {
    const keyGetter =
      compareBy === 'tournament'
        ? (match) => match.tournament
        : compareBy === 'opponent'
          ? (match) => match.opponent
          : (match) => getTeamResult(match);

    const groups = groupMatches(filtered, keyGetter);
    const rows = [...groups.entries()].map(([key, group]) => {
      const coverage = getMetricCoverage(group, comparisonMetric);
      const label =
        compareBy === 'result'
          ? key === 'W'
            ? copy.win
            : key === 'L'
              ? copy.loss
              : key
          : key;

      return {
        key,
        label,
        value: averageMetric(group, comparisonMetric),
        matches: group.length,
        coverage: coverage.available,
        earliestDate:
          group.slice().sort(compareMatchesChronologically)[0]?.date || '',
      };
    });

    return rows.sort((a, b) => {
      if (compareBy === 'result') {
        return ['W', 'L'].indexOf(a.key) - ['W', 'L'].indexOf(b.key);
      }

      if (compareBy === 'tournament') {
        return a.earliestDate.localeCompare(b.earliestDate);
      }

      return a.label.localeCompare(b.label);
    });
  }, [filtered, compareBy, comparisonMetric, copy.win, copy.loss]);

  const scatterRows = useMemo(
    () =>
      filtered
        .map((match) => ({
          ...match,
          xValue: getMetricValue(match, scatterX),
          yValue: getMetricValue(match, scatterY),
          teamResult: getTeamResult(match),
        }))
        .filter(
          (match) =>
            match.xValue !== null && match.yValue !== null
        ),
    [filtered, scatterX, scatterY]
  );

  const winScatterRows = scatterRows.filter(
    (match) => match.teamResult === 'W'
  );
  const lossScatterRows = scatterRows.filter(
    (match) => match.teamResult === 'L'
  );
  const otherScatterRows = scatterRows.filter(
    (match) => !['W', 'L'].includes(match.teamResult)
  );

  const chartTooltipStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(148, 163, 184, 0.45)',
    borderRadius: '10px',
    color: '#e5e7eb',
    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.28)',
  };

  const comparisonTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) {
      return null;
    }

    const row = payload[0].payload;

    return (
      <div className="analyticsTooltip">
        <strong>{row.label}</strong>
        <span>
          {copy.average}:{' '}
          {formatMetricValue(comparisonMetric, row.value)}
        </span>
        <span>
          {copy.matches}: {row.matches}
        </span>
        <span>
          {copy.dataCoverage}: {row.coverage}/{row.matches}
        </span>
      </div>
    );
  };

  const scatterTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) {
      return null;
    }

    const row = payload[0].payload;

    return (
      <div className="analyticsTooltip">
        <strong>
          {row.team} {row.pointsFor}-{row.pointsAgainst}{' '}
          {row.opponent}
        </strong>
        <span>
          {row.date} / {row.tournament} / {row.stage}
        </span>
        <span>
          {getMetricLabel(scatterX, isJapanese)}:{' '}
          {formatMetricValue(scatterX, row.xValue)}
        </span>
        <span>
          {getMetricLabel(scatterY, isJapanese)}:{' '}
          {formatMetricValue(scatterY, row.yValue)}
        </span>
      </div>
    );
  };

  const renderMetricDefinition = (metricKey) => {
    const definition = getMetricDefinition(metricKey);
    const coverage = getMetricCoverage(filtered, metricKey);

    return (
      <div className="analyticsDefinition">
        <div>
          <strong>{copy.metricDefinition}</strong>
          <span>{getMetricLabel(metricKey, isJapanese)}</span>
        </div>
        <p>{getMetricFormula(metricKey, isJapanese)}</p>
        <small>
          {definition.type === 'calculated'
            ? copy.calculatedMetric
            : copy.rawMetric}
          {' · '}
          {copy.dataCoverage}: {coverage.available}/{coverage.total}
        </small>
      </div>
    );
  };

  return (
    <div
      className="app screenBackground statsAnalysisScreen analyticsScreen"
      style={{
        '--screen-bg-image': `url(${screenBgImage})`,
        '--screen-bg-mobile-image': `url(${mobileScreenBgImage})`,
      }}
    >
      {onBackHome && (
        <button
          type="button"
          className="backHomeButton"
          onClick={onBackHome}
        >
          {t.navigation.backHome}
        </button>
      )}

      {includesSampleData && (
        <div className="analyticsWarning">{copy.sampleWarning}</div>
      )}

      <header className="hero">
        <div>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <div className="badge">
          <Database size={22} /> {copy.badge}
        </div>
      </header>

      <section className="panel scope">
        <h2>
          <Filter size={18} /> {copy.scope}
        </h2>

        <div className="filters analyticsFilters">
          <label>
            {copy.season}
            <select
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            >
              {seasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            {copy.gender}
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              {genders.map((item) => (
                <option key={item} value={item}>
                  {item === 'Women'
                    ? copy.women
                    : item === 'Men'
                      ? copy.men
                      : item}
                </option>
              ))}
            </select>
          </label>

          <label>
            {copy.team}
            <select
              value={team}
              onChange={(event) => setTeam(event.target.value)}
            >
              {teams.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            {copy.tournament}
            <select
              value={tournament}
              onChange={(event) => setTournament(event.target.value)}
            >
              <option value={ALL}>{copy.all}</option>
              {tournaments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            {copy.opponent}
            <select
              value={opponent}
              onChange={(event) => setOpponent(event.target.value)}
            >
              <option value={ALL}>{copy.all}</option>
              {opponents.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            {copy.result}
            <select
              value={result}
              onChange={(event) => setResult(event.target.value)}
            >
              <option value={ALL}>{copy.all}</option>
              <option value="W">{copy.win}</option>
              <option value="L">{copy.loss}</option>
            </select>
          </label>
        </div>

        <div className="analyticsScopeSummary">
          <span>
            {copy.matches}: <strong>{filtered.length}</strong>
          </span>
          <span>
            {copy.fullStatsCoverage}:{' '}
            <strong>
              {fullStatsCount}/{filtered.length}
            </strong>
          </span>
          <span>
            {copy.realData}:{' '}
            <strong>
              {
                filtered.filter(
                  (match) =>
                    match.dataType === 'real' ||
                    !String(match.sourceProvider || '')
                      .toLowerCase()
                      .includes('sample')
                ).length
              }
            </strong>
          </span>
        </div>
      </section>

      <nav
        className="analyticsModeTabs"
        aria-label={copy.title}
      >
        {[
          ['overview', copy.overview],
          ['comparison', copy.comparison],
          ['relationships', copy.relationships],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={mode === key ? 'active' : ''}
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <section className="panel analyticsEmpty">
          <Info size={22} />
          <p>{copy.noData}</p>
        </section>
      ) : (
        <>
          {mode === 'overview' && (
            <section className="panel analyticsPanel">
              <div className="analyticsPanelHeader">
                <div>
                  <h2>{copy.overview}</h2>
                  <p>{copy.overviewIntro}</p>
                </div>
              </div>

              <div className="analyticsKpiGrid">
                {overviewCards.map((card) => (
                  <article
                    className="analyticsKpiCard"
                    key={card.label}
                  >
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    <small>{card.sub}</small>
                  </article>
                ))}
              </div>

              <p className="analyticsFootnote">
                {copy.missingData}
              </p>
            </section>
          )}

          {mode === 'comparison' && (
            <section className="panel analyticsPanel">
              <div className="analyticsPanelHeader">
                <div>
                  <h2>{copy.comparison}</h2>
                  <p>{copy.comparisonIntro}</p>
                </div>
              </div>

              <div className="analyticsControlRow">
                <label>
                  {copy.compareBy}
                  <select
                    value={compareBy}
                    onChange={(event) =>
                      setCompareBy(event.target.value)
                    }
                  >
                    <option value="tournament">
                      {copy.tournamentComparison}
                    </option>
                    <option value="result">
                      {copy.resultComparison}
                    </option>
                    <option value="opponent">
                      {copy.opponentComparison}
                    </option>
                  </select>
                </label>

                <label>
                  {copy.metric}
                  <select
                    value={comparisonMetric}
                    onChange={(event) =>
                      setComparisonMetric(event.target.value)
                    }
                  >
                    {COMPARISON_METRIC_KEYS.map((metricKey) => (
                      <option key={metricKey} value={metricKey}>
                        {getMetricLabel(metricKey, isJapanese)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="analyticsChart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonGroups}
                    margin={{ top: 16, right: 16, left: 8, bottom: 32 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      interval={0}
                      angle={comparisonGroups.length > 4 ? -20 : 0}
                      textAnchor={
                        comparisonGroups.length > 4 ? 'end' : 'middle'
                      }
                      height={comparisonGroups.length > 4 ? 72 : 44}
                    />
                    <YAxis />
                    <Tooltip
                      content={comparisonTooltip}
                      contentStyle={chartTooltipStyle}
                    />
                    <Bar
                      dataKey="value"
                      name={getMetricLabel(
                        comparisonMetric,
                        isJapanese
                      )}
                      fill="#22c55e"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {renderMetricDefinition(comparisonMetric)}
              <p className="analyticsFootnote">
                {copy.missingData}
              </p>
            </section>
          )}

          {mode === 'relationships' && (
            <section className="panel analyticsPanel">
              <div className="analyticsPanelHeader">
                <div>
                  <h2>{copy.relationships}</h2>
                  <p>{copy.relationshipsIntro}</p>
                </div>
                <span className="analyticsSampleCount">
                  {copy.plottedMatches}: {scatterRows.length}/
                  {filtered.length}
                </span>
              </div>

              <div className="analyticsControlRow">
                <label>
                  {copy.xAxis}
                  <select
                    value={scatterX}
                    onChange={(event) =>
                      setScatterX(event.target.value)
                    }
                  >
                    {RELATIONSHIP_METRIC_KEYS.map((metricKey) => (
                      <option key={metricKey} value={metricKey}>
                        {getMetricLabel(metricKey, isJapanese)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  {copy.yAxis}
                  <select
                    value={scatterY}
                    onChange={(event) =>
                      setScatterY(event.target.value)
                    }
                  >
                    {RELATIONSHIP_METRIC_KEYS.map((metricKey) => (
                      <option key={metricKey} value={metricKey}>
                        {getMetricLabel(metricKey, isJapanese)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="analyticsChart analyticsScatterChart">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 16, right: 20, left: 8, bottom: 24 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="xValue"
                      name={getMetricLabel(scatterX, isJapanese)}
                      tickFormatter={(value) =>
                        formatMetricValue(scatterX, value)
                      }
                    />
                    <YAxis
                      type="number"
                      dataKey="yValue"
                      name={getMetricLabel(scatterY, isJapanese)}
                      tickFormatter={(value) =>
                        formatMetricValue(scatterY, value)
                      }
                    />
                    <Tooltip content={scatterTooltip} />
                    <Legend />
                    <Scatter
                      name={copy.win}
                      data={winScatterRows}
                      fill="#22c55e"
                    />
                    <Scatter
                      name={copy.loss}
                      data={lossScatterRows}
                      fill="#ef4444"
                    />
                    {otherScatterRows.length > 0 && (
                      <Scatter
                        name={copy.all}
                        data={otherScatterRows}
                        fill="#64748b"
                      />
                    )}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="analyticsDefinitionGrid">
                {renderMetricDefinition(scatterX)}
                {renderMetricDefinition(scatterY)}
              </div>

              <div className="analyticsCaution">
                <Info size={18} />
                <div>
                  <strong>{copy.smallSample}</strong>
                  <p>{copy.missingData}</p>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
