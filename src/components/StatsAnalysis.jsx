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
  ANALYSIS_METRIC_KEYS,
  COMPARISON_METRIC_KEYS,
  METRIC_CATEGORIES,
  RELATIONSHIP_PRESETS,
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
      ? '結果、得点効率、攻撃効率、規律、守備を13指標で分解し、条件別に比較します。'
      : 'Break performance into 13 indicators covering results, scoring efficiency, attack, discipline and defence.',
    badge: isJapanese ? 'チーム・パフォーマンス分析' : 'Team Performance Analysis',
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
    fullStatsCoverage: isJapanese ? '詳細データ試合' : 'Full-stat matches',
    overview: isJapanese ? '指標一覧' : 'Performance Profile',
    comparison: isJapanese ? '条件別比較' : 'Comparison',
    relationships: isJapanese ? '関連分析' : 'Relationships',
    overviewIntro: isJapanese
      ? '選択範囲の13指標を、競技上の役割ごとに整理して表示します。'
      : 'Shows all 13 indicators, organised by their performance role.',
    comparisonIntro: isJapanese
      ? '13指標から一つを選び、大会、勝敗、対戦相手ごとに平均値を比較します。'
      : 'Select one of the 13 indicators and compare its average by tournament, result or opponent.',
    relationshipsIntro: isJapanese
      ? '競技上の問いが明確な組み合わせだけを、1試合1点の散布図で確認します。'
      : 'Uses only predefined pairings with a clear rugby question, plotting one point per match.',
    compareBy: isJapanese ? '比較単位' : 'Compare by',
    metric: isJapanese ? '指標' : 'Metric',
    tournamentComparison: isJapanese ? '大会' : 'Tournament',
    resultComparison: isJapanese ? '勝敗' : 'Result',
    opponentComparison: isJapanese ? '対戦相手' : 'Opponent',
    average: isJapanese ? '平均' : 'Average',
    available: isJapanese ? '利用可能' : 'Available',
    metricDefinition: isJapanese ? '指標定義' : 'Metric Definition',
    calculatedMetric: isJapanese ? '計算指標' : 'Calculated metric',
    rawMetric: isJapanese ? '取得値' : 'Raw metric',
    metricCount: isJapanese ? '13指標' : '13 metrics',
    relationshipPreset: isJapanese ? '分析テーマ' : 'Analysis question',
    plottedMatches: isJapanese ? 'プロット可能試合' : 'Plotted matches',
    noData: isJapanese
      ? '現在の条件に一致する試合がありません。'
      : 'No matches are available for the current filters.',
    sampleWarning: isJapanese
      ? 'この表示範囲にはサンプルデータが含まれています。実データと混同せず、画面検証用として解釈してください。'
      : 'This view includes sample data. Treat it as interface-validation data and do not mix it with real-data conclusions.',
    missingData: isJapanese
      ? '必要な値が欠けている試合は計算・グラフから除外し、0として扱いません。'
      : 'Matches with missing inputs are excluded from calculations and charts rather than treated as zero.',
    smallSample: isJapanese
      ? '表示結果は選択範囲内の記述的な関連です。試合数が少ないため、因果関係や確定的な相関は示しません。'
      : 'This is a descriptive association within the selected scope. The sample is too small for causal or firm correlation claims.',
    winRateResultWarning: isJapanese
      ? '勝敗別比較では勝率が100%と0%に固定されるため、勝率は選択肢から除外しています。'
      : 'Win Rate is excluded from result comparison because the groups would be fixed at 100% and 0%.',
    xAxis: isJapanese ? 'X軸' : 'X axis',
    yAxis: isJapanese ? 'Y軸' : 'Y axis',
    averageValue: isJapanese ? '平均値' : 'Average value',
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
  const [comparisonMetric, setComparisonMetric] = useState('pointDiff');
  const [relationshipId, setRelationshipId] = useState(
    RELATIONSHIP_PRESETS[0].id
  );

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
        (match) => tournament === ALL || match.tournament === tournament
      ),
    [baseScope, tournament]
  );

  const opponents = getUniqueValues(tournamentScope, 'opponent');

  const filtered = useMemo(
    () =>
      tournamentScope
        .filter((match) => opponent === ALL || match.opponent === opponent)
        .filter(
          (match) => result === ALL || getTeamResult(match) === result
        )
        .slice()
        .sort(compareMatchesChronologically),
    [tournamentScope, opponent, result]
  );

  const fullStatsCount = filtered.filter(
    (match) => match.dataCoverageLevel === 'full_match_stats'
  ).length;

  const includesSampleData = filtered.some(
    (match) =>
      match.dataType === 'sample' ||
      String(match.sourceProvider || '').toLowerCase().includes('sample')
  );

  const availableComparisonMetrics = useMemo(
    () =>
      compareBy === 'result'
        ? COMPARISON_METRIC_KEYS.filter((metricKey) => metricKey !== 'winRate')
        : COMPARISON_METRIC_KEYS,
    [compareBy]
  );

  useEffect(() => {
    if (!availableComparisonMetrics.includes(comparisonMetric)) {
      setComparisonMetric('pointDiff');
    }
  }, [availableComparisonMetrics, comparisonMetric]);

  const comparisonGroups = useMemo(() => {
    const keyGetter =
      compareBy === 'tournament'
        ? (match) => match.tournament
        : compareBy === 'opponent'
          ? (match) => match.opponent
          : (match) => getTeamResult(match);

    const groups = groupMatches(filtered, keyGetter);

    return [...groups.entries()]
      .map(([key, group]) => {
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
      })
      .filter((row) => row.value !== null)
      .sort((a, b) => {
        if (compareBy === 'result') {
          return ['W', 'L'].indexOf(a.key) - ['W', 'L'].indexOf(b.key);
        }
        if (compareBy === 'tournament') {
          return a.earliestDate.localeCompare(b.earliestDate);
        }
        return a.label.localeCompare(b.label);
      });
  }, [filtered, compareBy, comparisonMetric, copy.win, copy.loss]);

  const selectedRelationship =
    RELATIONSHIP_PRESETS.find((preset) => preset.id === relationshipId) ||
    RELATIONSHIP_PRESETS[0];

  const comparisonXAxisLabel =
    compareBy === 'tournament'
      ? copy.tournamentComparison
      : compareBy === 'opponent'
        ? copy.opponentComparison
        : copy.resultComparison;

  const comparisonYAxisLabel = getMetricLabel(
    comparisonMetric,
    isJapanese
  );

  const relationshipXAxisLabel = getMetricLabel(
    selectedRelationship.xMetric,
    isJapanese
  );

  const relationshipYAxisLabel = getMetricLabel(
    selectedRelationship.yMetric,
    isJapanese
  );

  const scatterRows = useMemo(
    () =>
      filtered
        .map((match) => ({
          ...match,
          xValue: getMetricValue(match, selectedRelationship.xMetric),
          yValue: getMetricValue(match, selectedRelationship.yMetric),
          teamResult: getTeamResult(match),
        }))
        .filter(
          (match) => match.xValue !== null && match.yValue !== null
        ),
    [filtered, selectedRelationship]
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

  const comparisonTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) {
      return null;
    }

    const row = payload[0].payload;

    return (
      <div className="analyticsTooltip">
        <strong>{row.label}</strong>
        <span>
          {copy.average}: {formatMetricValue(comparisonMetric, row.value)}
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
          {row.team} {row.pointsFor}-{row.pointsAgainst} {row.opponent}
        </strong>
        <span>
          {row.date} / {row.tournament} / {row.stage}
        </span>
        <span>
          {getMetricLabel(selectedRelationship.xMetric, isJapanese)}:{' '}
          {formatMetricValue(selectedRelationship.xMetric, row.xValue)}
        </span>
        <span>
          {getMetricLabel(selectedRelationship.yMetric, isJapanese)}:{' '}
          {formatMetricValue(selectedRelationship.yMetric, row.yValue)}
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
          {definition.type === 'calculated' ? copy.calculatedMetric : copy.rawMetric}
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
        <button type="button" className="backHomeButton" onClick={onBackHome}>
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
            <select value={season} onChange={(event) => setSeason(event.target.value)}>
              {seasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            {copy.gender}
            <select value={gender} onChange={(event) => setGender(event.target.value)}>
              {genders.map((item) => (
                <option key={item} value={item}>
                  {item === 'Women' ? copy.women : item === 'Men' ? copy.men : item}
                </option>
              ))}
            </select>
          </label>

          <label>
            {copy.team}
            <select value={team} onChange={(event) => setTeam(event.target.value)}>
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
            <select value={opponent} onChange={(event) => setOpponent(event.target.value)}>
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
            <select value={result} onChange={(event) => setResult(event.target.value)}>
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
            {copy.dataCoverage}:{' '}
            <strong>{copy.metricCount}</strong>
          </span>
        </div>
      </section>

      <nav className="analyticsModeTabs" aria-label={copy.title}>
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

              <div className="analyticsCategoryStack">
                {METRIC_CATEGORIES.map((category) => (
                  <section className="analyticsMetricCategory" key={category.id}>
                    <header>
                      <h3>{isJapanese ? category.labelJa : category.labelEn}</h3>
                      <p>
                        {isJapanese
                          ? category.descriptionJa
                          : category.descriptionEn}
                      </p>
                    </header>

                    <div className="analyticsMetricGrid">
                      {category.metricKeys.map((metricKey) => {
                        const coverage = getMetricCoverage(filtered, metricKey);
                        const value = averageMetric(filtered, metricKey);

                        return (
                          <article className="analyticsMetricCard" key={metricKey}>
                            <span>{getMetricLabel(metricKey, isJapanese)}</span>
                            <strong>{formatMetricValue(metricKey, value)}</strong>
                            <small>{getMetricFormula(metricKey, isJapanese)}</small>
                            <div className="analyticsCoverageRow">
                              <span>{copy.dataCoverage}</span>
                              <b>
                                {coverage.available}/{coverage.total}
                              </b>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <p className="analyticsFootnote">{copy.missingData}</p>
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
                  <select value={compareBy} onChange={(event) => setCompareBy(event.target.value)}>
                    <option value="tournament">{copy.tournamentComparison}</option>
                    <option value="result">{copy.resultComparison}</option>
                    <option value="opponent">{copy.opponentComparison}</option>
                  </select>
                </label>

                <label>
                  {copy.metric}
                  <select
                    value={comparisonMetric}
                    onChange={(event) => setComparisonMetric(event.target.value)}
                  >
                    {availableComparisonMetrics.map((metricKey) => (
                      <option key={metricKey} value={metricKey}>
                        {getMetricLabel(metricKey, isJapanese)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {compareBy === 'result' && (
                <p className="analyticsInlineNote">{copy.winRateResultWarning}</p>
              )}

              <div className="analyticsAxisGuide" aria-label={`${copy.xAxis}: ${comparisonXAxisLabel}; ${copy.yAxis}: ${comparisonYAxisLabel}`}>
                <span>
                  <b>{copy.xAxis}</b>
                  {comparisonXAxisLabel}
                </span>
                <span>
                  <b>{copy.yAxis}</b>
                  {comparisonYAxisLabel} ({copy.averageValue})
                </span>
              </div>

              <div className="analyticsChart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonGroups}
                    margin={{ top: 16, right: 20, left: 34, bottom: 62 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      interval={0}
                      angle={comparisonGroups.length > 4 ? -20 : 0}
                      textAnchor={comparisonGroups.length > 4 ? 'end' : 'middle'}
                      height={comparisonGroups.length > 4 ? 92 : 64}
                      label={{
                        value: comparisonXAxisLabel,
                        position: 'insideBottom',
                        offset: -18,
                        style: {
                          fill: '#334155',
                          fontSize: 12,
                          fontWeight: 700,
                        },
                      }}
                    />
                    <YAxis
                      width={72}
                      label={{
                        value: comparisonYAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                        style: {
                          fill: '#334155',
                          fontSize: 12,
                          fontWeight: 700,
                          textAnchor: 'middle',
                        },
                      }}
                    />
                    <Tooltip content={comparisonTooltip} />
                    <Bar
                      dataKey="value"
                      name={getMetricLabel(comparisonMetric, isJapanese)}
                      fill="#22c55e"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {renderMetricDefinition(comparisonMetric)}
              <p className="analyticsFootnote">{copy.missingData}</p>
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
                  {copy.plottedMatches}: {scatterRows.length}/{filtered.length}
                </span>
              </div>

              <div className="analyticsSingleControl">
                <label>
                  {copy.relationshipPreset}
                  <select
                    value={relationshipId}
                    onChange={(event) => setRelationshipId(event.target.value)}
                  >
                    {RELATIONSHIP_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {isJapanese ? preset.labelJa : preset.labelEn}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="analyticsQuestion">
                <strong>
                  {isJapanese
                    ? selectedRelationship.labelJa
                    : selectedRelationship.labelEn}
                </strong>
                <p>
                  {isJapanese
                    ? selectedRelationship.questionJa
                    : selectedRelationship.questionEn}
                </p>
              </div>

              <div className="analyticsAxisGuide" aria-label={`${copy.xAxis}: ${relationshipXAxisLabel}; ${copy.yAxis}: ${relationshipYAxisLabel}`}>
                <span>
                  <b>{copy.xAxis}</b>
                  {relationshipXAxisLabel}
                </span>
                <span>
                  <b>{copy.yAxis}</b>
                  {relationshipYAxisLabel}
                </span>
              </div>

              <div className="analyticsChart analyticsScatterChart">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 16, right: 24, left: 38, bottom: 58 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="xValue"
                      name={getMetricLabel(selectedRelationship.xMetric, isJapanese)}
                      tickFormatter={(value) =>
                        formatMetricValue(selectedRelationship.xMetric, value)
                      }
                      label={{
                        value: relationshipXAxisLabel,
                        position: 'insideBottom',
                        offset: -18,
                        style: {
                          fill: '#334155',
                          fontSize: 12,
                          fontWeight: 700,
                        },
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="yValue"
                      name={getMetricLabel(selectedRelationship.yMetric, isJapanese)}
                      tickFormatter={(value) =>
                        formatMetricValue(selectedRelationship.yMetric, value)
                      }
                      width={72}
                      label={{
                        value: relationshipYAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                        style: {
                          fill: '#334155',
                          fontSize: 12,
                          fontWeight: 700,
                          textAnchor: 'middle',
                        },
                      }}
                    />
                    <Tooltip content={scatterTooltip} />
                    <Legend />
                    <Scatter name={copy.win} data={winScatterRows} fill="#22c55e" />
                    <Scatter name={copy.loss} data={lossScatterRows} fill="#ef4444" />
                    {otherScatterRows.length > 0 && (
                      <Scatter name={copy.all} data={otherScatterRows} fill="#64748b" />
                    )}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="analyticsDefinitionGrid">
                {renderMetricDefinition(selectedRelationship.xMetric)}
                {renderMetricDefinition(selectedRelationship.yMetric)}
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
