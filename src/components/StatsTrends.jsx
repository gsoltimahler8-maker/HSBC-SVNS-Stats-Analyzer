import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Filter, Info, LineChart as TrendIcon } from 'lucide-react';
import { matchData as matches } from '../data/loadMatches.js';
import ja from '../i18n/ja.js';
import {
  TREND_METRIC_KEYS,
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

const TEAM_ABBREVIATIONS = {
  Argentina: 'ARG',
  Australia: 'AUS',
  Belgium: 'BEL',
  Brazil: 'BRA',
  Canada: 'CAN',
  Chile: 'CHI',
  China: 'CHN',
  Fiji: 'FIJ',
  France: 'FRA',
  Georgia: 'GEO',
  Germany: 'GER',
  'Great Britain': 'GBR',
  'Hong Kong': 'HKG',
  'Hong Kong China': 'HKG',
  Ireland: 'IRL',
  Japan: 'JPN',
  Kenya: 'KEN',
  'New Zealand': 'NZL',
  Portugal: 'POR',
  Samoa: 'SAM',
  'South Africa': 'RSA',
  Spain: 'ESP',
  Tonga: 'TGA',
  Uruguay: 'URU',
  USA: 'USA',
  'United States': 'USA',
};

const getTeamAbbreviation = (teamName) =>
  TEAM_ABBREVIATIONS[teamName] || String(teamName || '').slice(0, 3).toUpperCase();

const useCompactChartLabels = () => {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 640px)').matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const update = (event) => setIsCompact(event.matches);

    setIsCompact(mediaQuery.matches);
    mediaQuery.addEventListener?.('change', update);

    return () => mediaQuery.removeEventListener?.('change', update);
  }, []);

  return isCompact;
};

const CompactMatchTick = ({ x, y, payload }) => {
  const [dateLabel, opponentLabel] = String(payload?.value || '').split('|');

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#64748b" fontSize="11">
        <tspan x="0" dy="12">
          {dateLabel}
        </tspan>
        <tspan x="0" dy="14" fontWeight="700">
          {opponentLabel}
        </tspan>
      </text>
    </g>
  );
};

const compactDate = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue || '';
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export default function StatsTrends({ onBackHome, t = ja }) {
  const isJapanese = t.navigation?.backHome?.includes('ホーム');
  const screenBgImage = `${import.meta.env.BASE_URL}assets/bg-stats-trends.png`;
  const mobileScreenBgImage = `${import.meta.env.BASE_URL}assets/bg-stats-trends-mobile.png`;

  const copy = {
    title: isJapanese ? 'スタッツ推移' : 'Stats Trends',
    subtitle: isJapanese
      ? '13の中核指標を、試合・大会・シーズンの時間軸で追跡します。'
      : 'Track the 13 core indicators across matches, tournaments and seasons.',
    badge: isJapanese ? '長期パフォーマンス推移' : 'Long-term Performance Trends',
    scope: isJapanese ? '表示条件' : 'Trend Scope',
    season: isJapanese ? 'シーズン' : 'Season',
    gender: isJapanese ? '男女区分' : 'Gender',
    team: isJapanese ? 'チーム' : 'Team',
    opponent: isJapanese ? '対戦相手' : 'Opponent',
    aggregation: isJapanese ? '表示粒度' : 'Aggregation',
    metric: isJapanese ? '指標' : 'Metric',
    all: isJapanese ? 'すべて' : 'All',
    women: isJapanese ? '女子' : 'Women',
    men: isJapanese ? '男子' : 'Men',
    match: isJapanese ? '試合' : 'Match',
    tournament: isJapanese ? '大会' : 'Tournament',
    seasonAggregation: isJapanese ? 'シーズン' : 'Season',
    matches: isJapanese ? '対象試合' : 'Matches',
    available: isJapanese ? '利用可能' : 'Available',
    dataCoverage: isJapanese ? 'データ利用可能数' : 'Data Coverage',
    metricDefinition: isJapanese ? '指標定義' : 'Metric Definition',
    calculatedMetric: isJapanese ? '計算指標' : 'Calculated metric',
    rawMetric: isJapanese ? '取得値' : 'Raw metric',
    noData: isJapanese
      ? '現在の条件で表示できるデータがありません。'
      : 'No data is available for the current filters.',
    oneSeasonNote: isJapanese
      ? '現在は比較可能なシーズンが少数です。複数シーズンの実データが追加されると、長期比較としての意味が強くなります。'
      : 'Only a small number of comparable seasons is currently available. This becomes more meaningful as multi-season real data is added.',
    missingData: isJapanese
      ? '必要な値が欠けている試合は平均・グラフから除外し、0として扱いません。'
      : 'Matches with missing inputs are excluded from averages and charts rather than treated as zero.',
    sampleWarning: isJapanese
      ? 'この表示範囲にはサンプルデータが含まれています。実データと混同せずに解釈してください。'
      : 'This view includes sample data. Do not mix it with real-data conclusions.',
    trendQuestion: isJapanese
      ? 'この指標が時間の経過に沿ってどのように変化したかを表示します。'
      : 'Shows how this indicator changed over time.',
    score: isJapanese ? 'スコア' : 'Score',
    result: isJapanese ? '結果' : 'Result',
    win: isJapanese ? '勝利' : 'Win',
    loss: isJapanese ? '敗戦' : 'Loss',
    sources: isJapanese ? '主なデータソース' : 'Primary data sources',
    winRateMatchNote: isJapanese
      ? '試合表示の勝率は、勝利を100%、敗戦を0%として試合結果を可視化します。大会・シーズン表示では通常の勝率です。'
      : 'At match level, Win Rate encodes a win as 100% and a loss as 0%. Tournament and season views show the usual aggregate win rate.',
    xAxis: isJapanese ? 'X軸' : 'X axis',
    yAxis: isJapanese ? 'Y軸' : 'Y axis',
    chronologicalMatches: isJapanese ? '試合（時系列）' : 'Matches (chronological)',
    chronologicalTournaments: isJapanese ? '大会（時系列）' : 'Tournaments (chronological)',
  };

  const seasons = getUniqueValues(matches, 'season').sort((a, b) =>
    b.localeCompare(a)
  );
  const genders = getUniqueValues(matches, 'gender');
  const teams = getUniqueValues(matches, 'team');

  const [season, setSeason] = useState(ALL);
  const [gender, setGender] = useState(
    genders.includes('Women') ? 'Women' : genders[0] || ''
  );
  const [team, setTeam] = useState(
    teams.includes('Japan') ? 'Japan' : teams[0] || ''
  );
  const [opponent, setOpponent] = useState(ALL);
  const [aggregation, setAggregation] = useState('match');
  const [metric, setMetric] = useState('pointDiff');
  const compactChartLabels = useCompactChartLabels();

  useEffect(() => {
    setOpponent(ALL);
  }, [season, gender, team]);

  const baseScope = useMemo(
    () =>
      matches
        .filter(
          (match) =>
            (season === ALL || match.season === season) &&
            match.gender === gender &&
            match.team === team
        )
        .slice()
        .sort(compareMatchesChronologically),
    [season, gender, team]
  );

  const opponents = getUniqueValues(baseScope, 'opponent');

  const filtered = useMemo(
    () =>
      baseScope.filter(
        (match) => opponent === ALL || match.opponent === opponent
      ),
    [baseScope, opponent]
  );

  const includesSampleData = filtered.some(
    (match) =>
      match.dataType === 'sample' ||
      String(match.sourceProvider || '').toLowerCase().includes('sample')
  );

  const sourceProviders = [
    ...new Set(filtered.map((match) => match.sourceProvider).filter(Boolean)),
  ];

  const trendXAxisLabel =
    aggregation === 'match'
      ? copy.chronologicalMatches
      : aggregation === 'tournament'
        ? copy.chronologicalTournaments
        : copy.seasonAggregation;

  const trendYAxisLabel = getMetricLabel(metric, isJapanese);

  const aggregateRows = useMemo(() => {
    if (aggregation === 'match') {
      return filtered
        .map((match, index) => {
          const value = getMetricValue(match, metric);

          if (value === null) {
            return null;
          }

          return {
            id: match.id,
            label: `${compactDate(match.date)} ${match.opponent}`,
            compactAxisLabel: `${compactDate(match.date)}|${getTeamAbbreviation(
              match.opponent
            )}`,
            value,
            matches: 1,
            coverage: 1,
            date: match.date,
            tournament: match.tournament,
            season: match.season,
            opponent: match.opponent,
            team: match.team,
            pointsFor: match.pointsFor,
            pointsAgainst: match.pointsAgainst,
            result: getTeamResult(match),
            order: index,
          };
        })
        .filter(Boolean);
    }

    if (aggregation === 'tournament') {
      const groups = groupMatches(
        filtered,
        (match) => `${match.season}::${match.tournament}`
      );

      return [...groups.entries()]
        .map(([key, group]) => {
          const value = averageMetric(group, metric);
          const coverage = getMetricCoverage(group, metric);
          const firstMatch = group.slice().sort(compareMatchesChronologically)[0];
          const [groupSeason, tournamentName] = key.split('::');

          if (value === null) {
            return null;
          }

          return {
            id: key,
            label: `${groupSeason} ${tournamentName.replace(' SVNS', '')}`,
            value,
            matches: group.length,
            coverage: coverage.available,
            date: firstMatch?.date || '',
            tournament: tournamentName,
            season: groupSeason,
            opponent: '',
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    const groups = groupMatches(filtered, (match) => match.season);

    return [...groups.entries()]
      .map(([groupSeason, group]) => {
        const value = averageMetric(group, metric);
        const coverage = getMetricCoverage(group, metric);

        if (value === null) {
          return null;
        }

        return {
          id: groupSeason,
          label: groupSeason,
          value,
          matches: group.length,
          coverage: coverage.available,
          date: group.slice().sort(compareMatchesChronologically)[0]?.date || '',
          tournament: '',
          season: groupSeason,
          opponent: '',
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.season.localeCompare(b.season));
  }, [filtered, aggregation, metric]);

  const overallCoverage = getMetricCoverage(filtered, metric);
  const definition = getMetricDefinition(metric);
  const compactMatchTicks =
    compactChartLabels && aggregation === 'match';
  const angledTrendTicks =
    !compactMatchTicks && aggregateRows.length > 5;

  const tooltip = ({ active, payload }) => {
    if (!active || !payload?.length) {
      return null;
    }

    const row = payload[0].payload;

    return (
      <div className="analyticsTooltip">
        <strong>{row.label}</strong>

        {aggregation === 'match' ? (
          <>
            <span>
              {copy.score}: {row.team} {row.pointsFor}-{row.pointsAgainst}{' '}
              {row.opponent}
            </span>
            <span>
              {copy.result}:{' '}
              {row.result === 'W'
                ? copy.win
                : row.result === 'L'
                  ? copy.loss
                  : row.result || '—'}
            </span>
            <span>
              {row.date} / {row.tournament}
            </span>
          </>
        ) : (
          <>
            <span>
              {copy.matches}: {row.matches}
            </span>
            <span>
              {copy.dataCoverage}: {row.coverage}/{row.matches}
            </span>
          </>
        )}

        <span>
          {getMetricLabel(metric, isJapanese)}:{' '}
          {formatMetricValue(metric, row.value)}
        </span>
      </div>
    );
  };

  return (
    <div
      className="app screenBackground statsTrendsScreen analyticsScreen"
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
          <TrendIcon size={22} /> {copy.badge}
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
              <option value={ALL}>{copy.all}</option>
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
            {copy.aggregation}
            <select
              value={aggregation}
              onChange={(event) => setAggregation(event.target.value)}
            >
              <option value="match">{copy.match}</option>
              <option value="tournament">{copy.tournament}</option>
              <option value="season">{copy.seasonAggregation}</option>
            </select>
          </label>

          <label>
            {copy.metric}
            <select value={metric} onChange={(event) => setMetric(event.target.value)}>
              {TREND_METRIC_KEYS.map((metricKey) => (
                <option key={metricKey} value={metricKey}>
                  {getMetricLabel(metricKey, isJapanese)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="analyticsScopeSummary">
          <span>
            {copy.matches}: <strong>{filtered.length}</strong>
          </span>
          <span>
            {copy.dataCoverage}:{' '}
            <strong>
              {overallCoverage.available}/{overallCoverage.total}
            </strong>
          </span>
          <span>
            {copy.sources}: <strong>{sourceProviders.join(' / ') || '—'}</strong>
          </span>
        </div>
      </section>

      <section className="panel analyticsPanel">
        <div className="analyticsPanelHeader">
          <div>
            <h2>{getMetricLabel(metric, isJapanese)}</h2>
            <p>{copy.trendQuestion}</p>
          </div>

          <span className="analyticsSampleCount">
            {copy.available}: {aggregateRows.length}
          </span>
        </div>

        {metric === 'winRate' && aggregation === 'match' && (
          <div className="analyticsCaution analyticsCautionCompact">
            <Info size={18} />
            <div>
              <strong>{copy.winRateMatchNote}</strong>
            </div>
          </div>
        )}

        {aggregateRows.length > 0 ? (
          <>
            <div className="analyticsAxisGuide" aria-label={`${copy.xAxis}: ${trendXAxisLabel}; ${copy.yAxis}: ${trendYAxisLabel}`}>
              <span>
                <b>{copy.xAxis}</b>
                {trendXAxisLabel}
              </span>
              <span>
                <b>{copy.yAxis}</b>
                {trendYAxisLabel}
              </span>
            </div>

            <div className="analyticsChart analyticsTrendChart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={aggregateRows}
                margin={{
                  top: 16,
                  right: 16,
                  left: 2,
                  bottom: angledTrendTicks ? 44 : 8,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={compactMatchTicks ? 'compactAxisLabel' : 'label'}
                  interval={0}
                  angle={angledTrendTicks ? -22 : 0}
                  textAnchor={angledTrendTicks ? 'end' : 'middle'}
                  height={compactMatchTicks ? 52 : angledTrendTicks ? 74 : 38}
                  tick={compactMatchTicks ? <CompactMatchTick /> : undefined}
                />
                <YAxis
                  width={compactChartLabels ? 48 : 58}
                  tickFormatter={(value) => formatMetricValue(metric, value)}
                />
                <Tooltip content={tooltip} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={getMetricLabel(metric, isJapanese)}
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="analyticsEmpty">
            <Info size={22} />
            <p>{copy.noData}</p>
          </div>
        )}

        {aggregation === 'season' && aggregateRows.length <= 1 && (
          <div className="analyticsCaution">
            <Info size={18} />
            <div>
              <strong>{copy.oneSeasonNote}</strong>
            </div>
          </div>
        )}

        <div className="analyticsDefinition">
          <div>
            <strong>{copy.metricDefinition}</strong>
            <span>{getMetricLabel(metric, isJapanese)}</span>
          </div>
          <p>{getMetricFormula(metric, isJapanese)}</p>
          <small>
            {definition.type === 'calculated' ? copy.calculatedMetric : copy.rawMetric}
            {' · '}
            {copy.dataCoverage}: {overallCoverage.available}/{overallCoverage.total}
          </small>
        </div>

        <p className="analyticsFootnote">{copy.missingData}</p>
      </section>
    </div>
  );
}
