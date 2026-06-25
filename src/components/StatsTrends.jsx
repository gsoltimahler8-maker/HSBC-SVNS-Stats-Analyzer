import { useEffect, useMemo, useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, LineChart as TrendIcon, Filter, Info } from 'lucide-react';
import { sampleMatches } from '../data/sampleMatches.js';
import ja from '../i18n/ja.js';

const metricOptions = [
  { key: 'pointsFor', labelJa: '得点', labelEn: 'Points For', suffix: '' },
  { key: 'pointsAgainst', labelJa: '失点', labelEn: 'Points Against', suffix: '' },
  { key: 'cleanBreaks', labelJa: 'クリーンブレイク', labelEn: 'Clean Breaks', suffix: '' },
  { key: 'defendersBeaten', labelJa: 'ディフェンダー突破', labelEn: 'Defenders Beaten', suffix: '' },
  { key: 'turnoversWon', labelJa: 'ターンオーバー獲得', labelEn: 'Turnovers Won', suffix: '' },
  { key: 'turnoversConceded', labelJa: 'ターンオーバー喪失', labelEn: 'Turnovers Conceded', suffix: '' },
  { key: 'possession', labelJa: 'ポゼッション', labelEn: 'Possession', suffix: '%' },
  { key: 'tackleSuccess', labelJa: 'タックル成功率', labelEn: 'Tackle Success', suffix: '%' },
];

function getMetricValue(match, metric) {
  if (metric === 'tackleSuccess') {
    const tackles = Number(match.tackles || 0);
    const missedTackles = Number(match.missedTackles || 0);
    const total = tackles + missedTackles;

    return total > 0 ? (100 * tackles) / total : 0;
  }

  return Number(match[metric] || 0);
}

export default function StatsTrends({ onBackHome, t = ja }) {
  const isJapanese = t.navigation?.backHome?.includes('ホーム');

  const labels = {
    title: isJapanese ? 'スタッツ推移' : 'Stats Trends',
    subtitle: isJapanese
      ? 'シーズン内の試合ごとのスタッツ変化を確認するための画面です。'
      : 'A screen for reviewing match-by-match statistical trends within a season.',
    filters: isJapanese ? '分析条件' : 'Analysis Scope',
    season: isJapanese ? 'シーズン' : 'Season',
    gender: isJapanese ? '男女区分' : 'Gender',
        team: isJapanese ? 'チーム' : 'Team',
    tournament: isJapanese ? '大会' : 'Tournament',
    opponent: isJapanese ? '対戦相手' : 'Opponent',
    metric: isJapanese ? '指標' : 'Metric',
    allTournaments: isJapanese ? 'すべて' : 'All',
    allOpponents: isJapanese ? 'すべて' : 'All',
    currentScope: isJapanese ? '現在の表示条件' : 'Current View',
    matchCount: isJapanese ? '対象試合数' : 'Match Count',
    women: isJapanese ? '女子' : 'Women',
    men: isJapanese ? '男子' : 'Men',
    dataAvailability: isJapanese ? 'データ利用可能範囲' : 'Data Availability',
    dataAvailabilityText: isJapanese
      ? '詳細チームスタッツの標準対象は2022-23シーズン以降です。'
      : 'Full team match stats are treated as standard from the 2022-23 season onward.',
            dataCoverageNote: isJapanese
      ? '表示中の試合データの粒度を確認し、比較条件に注意が必要な場合は警告します。'
      : 'This screen checks the data coverage of the displayed matches and warns when comparisons need caution.',
    sourceProvider: isJapanese ? '主ソース' : 'Primary source',
    fetchedAt: isJapanese ? '取得日時' : 'Fetched at',
    statDefinitionVersion: isJapanese ? 'スタッツ定義' : 'Stats definition',
    dataCoverageSummary: isJapanese ? '現在の表示範囲のデータ粒度' : 'Data coverage in current view',
    coverageAllFull: isJapanese
      ? '現在の表示範囲は詳細試合スタッツのみです。'
      : 'The current view contains full match stats only.',
    coverageMixedWarning: isJapanese
      ? 'データ粒度の異なる試合が含まれています。比較結果の解釈に注意してください。'
      : 'This view includes matches with different data coverage levels. Interpret comparisons carefully.',
    coverageLevels: {
      full_match_stats: isJapanese ? '詳細試合スタッツ' : 'Full match stats',
      limited_data: isJapanese ? '限定データ' : 'Limited data',
      results_only: isJapanese ? '結果のみ' : 'Results only',
      unknown: isJapanese ? '未確認' : 'Unknown',
    },
    tournamentCards: isJapanese ? '大会別平均値' : 'Tournament averages',
    opponentCards: isJapanese ? '対戦相手別平均値' : 'Opponent averages',
    next: isJapanese ? '今後の追加予定' : 'Next implementation',
        matches: isJapanese ? '試合' : 'matches',
    noData: isJapanese ? 'この条件に一致する試合はありません。' : 'No matches are available for this condition.',
    noDataTitle: isJapanese ? '該当する試合データがありません' : 'No matching match data',
    noDataBody: isJapanese
      ? '現在の Season / Gender / Team / Tournament / Opponent の組み合わせでは、表示できる試合がありません。'
      : 'There are no matches available for the current Season / Gender / Team / Tournament / Opponent combination.',
    noDataHint: isJapanese
      ? '条件を変更するか、今後のデータ追加後に再確認してください。'
      : 'Change the filters or check again after more data has been added.',
    noDataCoverageStatus: isJapanese
      ? '表示対象の試合がないため、データ粒度は判定できません。'
      : 'Data coverage cannot be evaluated because no matches are currently displayed.',
  };

  const seasons = [...new Set(sampleMatches.map((match) => match.season))];

  const [season, setSeason] = useState('2025-26');
  const [gender, setGender] = useState('Women');
  const [team, setTeam] = useState('Japan');
  const [tournament, setTournament] = useState('All');
  const [opponent, setOpponent] = useState('All');
  const [metric, setMetric] = useState('cleanBreaks');

      const baseFiltered = useMemo(
    () =>
      sampleMatches.filter(
        (match) => match.season === season && match.gender === gender && match.team === team
      ),
    [season, gender, team]
  );

  const tournaments = [
    'All',
    ...new Set(baseFiltered.map((match) => match.tournament)),
  ];

  useEffect(() => {
    setTournament('All');
    setOpponent('All');
  }, [season, gender, team]);

  const tournamentFiltered = useMemo(
    () =>
      baseFiltered.filter(
        (match) => tournament === 'All' || match.tournament === tournament
      ),
    [baseFiltered, tournament]
  );

  const opponents = [
    'All',
    ...new Set(tournamentFiltered.map((match) => match.opponent)),
  ];

  useEffect(() => {
    setOpponent('All');
  }, [tournament]);

  const filtered = useMemo(
    () =>
      tournamentFiltered.filter(
        (match) => opponent === 'All' || match.opponent === opponent
      ),
    [tournamentFiltered, opponent]
  );

  const selectedMetric = metricOptions.find((item) => item.key === metric) || metricOptions[0];
  const metricLabel = isJapanese ? selectedMetric.labelJa : selectedMetric.labelEn;
    const hasNoMatches = filtered.length === 0;
    const coverageLevels = [
    ...new Set(filtered.map((match) => match.dataCoverageLevel || 'unknown')),
  ];

  const hasMixedCoverage = coverageLevels.length > 1;
  const hasNonFullCoverage = coverageLevels.some((level) => level !== 'full_match_stats');

  const coverageLevelText =
    coverageLevels.length > 0
      ? coverageLevels
          .map((level) => labels.coverageLevels[level] || level)
          .join(' / ')
      : labels.coverageLevels.unknown;

  const coverageStatusText = hasNoMatches
    ? labels.noDataCoverageStatus
    : hasMixedCoverage || hasNonFullCoverage
      ? labels.coverageMixedWarning
      : labels.coverageAllFull;
    const sourceProviderText =
    filtered.length > 0
      ? [...new Set(filtered.map((match) => match.sourceProvider || 'Unknown'))].join(' / ')
      : 'Unknown';

  const statDefinitionVersionText =
    filtered.length > 0
      ? [...new Set(filtered.map((match) => match.statDefinitionVersion || 'Unknown'))].join(' / ')
      : 'Unknown';

  const fetchedAtValues = filtered
    .map((match) => match.fetchedAt)
    .filter(Boolean)
    .sort();

  const latestFetchedAt =
    fetchedAtValues.length > 0
      ? fetchedAtValues[fetchedAtValues.length - 1]
      : 'Unknown';
  const selectedTournamentText =
    tournament === 'All' ? labels.allTournaments : tournament;

  const selectedOpponentText =
    opponent === 'All' ? labels.allOpponents : opponent;

  const selectedGenderText =
    gender === 'Women' ? labels.women : labels.men;

  const currentScopeItems = [
    { label: labels.season, value: season },
    { label: labels.gender, value: selectedGenderText },
    { label: labels.team, value: team },
    { label: labels.tournament, value: selectedTournamentText },
    { label: labels.opponent, value: selectedOpponentText },
    { label: labels.metric, value: metricLabel },
    { label: labels.matchCount, value: filtered.length },
  ];
  const trendRows = useMemo(
    () =>
      filtered
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((match, index) => ({
          matchIndex: index + 1,
          matchLabel: `M${index + 1}`,
          matchDescription: `${match.date} / ${match.tournament} / ${match.team} ${match.pointsFor}-${match.pointsAgainst} ${match.opponent}`,
          value: Number(getMetricValue(match, metric).toFixed(1)),
        })),
    [filtered, metric]
  );

  const tournamentAverages = useMemo(() => {
    const groups = new Map();

    filtered.forEach((match) => {
      if (!groups.has(match.tournament)) {
        groups.set(match.tournament, []);
      }
      groups.get(match.tournament).push(match);
    });

    return [...groups.entries()].map(([tournament, matches]) => {
      const total = matches.reduce((sum, match) => sum + getMetricValue(match, metric), 0);
      const average = matches.length > 0 ? total / matches.length : 0;

      return {
        tournament,
        matches: matches.length,
        average,
      };
    });
  }, [filtered, metric]);
    const opponentAverages = useMemo(() => {
    const groups = new Map();

    filtered.forEach((match) => {
      if (!groups.has(match.opponent)) {
        groups.set(match.opponent, []);
      }
      groups.get(match.opponent).push(match);
    });

    return [...groups.entries()]
      .map(([opponent, matches]) => {
        const total = matches.reduce((sum, match) => sum + getMetricValue(match, metric), 0);
        const average = matches.length > 0 ? total / matches.length : 0;

        return {
          opponent,
          matches: matches.length,
          average,
        };
      })
      .sort((a, b) => b.average - a.average);
  }, [filtered, metric]);

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
    <div className="app">
      {onBackHome && (
        <button type="button" className="backHomeButton" onClick={onBackHome}>
          <ArrowLeft size={16} /> {t.navigation.backHome.replace('← ', '')}
        </button>
      )}

      <header className="hero">
        <div>
          <h1>{labels.title}</h1>
          <p>{labels.subtitle}</p>
        </div>
        <div className="badge">
          <TrendIcon size={22} /> v0.3
        </div>
      </header>

      <section className="panel scope">
        <h2>
          <Filter size={18} /> {labels.filters}
        </h2>

        <div className="filters">
          <label>
            {labels.season}
            <select value={season} onChange={(event) => setSeason(event.target.value)}>
              {seasons.map((seasonName) => (
                <option key={seasonName} value={seasonName}>
                  {seasonName}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.gender}
            <select value={gender} onChange={(event) => setGender(event.target.value)}>
              <option value="Women">{labels.women}</option>
              <option value="Men">{labels.men}</option>
            </select>
          </label>

          <label>
            {labels.team}
            <select value={team} onChange={(event) => setTeam(event.target.value)}>
              <option value="Japan">Japan</option>
            </select>
          </label>
                    <label>
            {labels.tournament}
            <select value={tournament} onChange={(event) => setTournament(event.target.value)}>
              {tournaments.map((tournamentName) => (
                <option key={tournamentName} value={tournamentName}>
                  {tournamentName === 'All' ? labels.allTournaments : tournamentName}
                </option>
              ))}
            </select>
          </label>
          <label>
            {labels.opponent}
            <select value={opponent} onChange={(event) => setOpponent(event.target.value)}>
              {opponents.map((opponentName) => (
                <option key={opponentName} value={opponentName}>
                  {opponentName === 'All' ? labels.allOpponents : opponentName}
                </option>
              ))}
            </select>
          </label>
          <label>
            {labels.metric}
            <select value={metric} onChange={(event) => setMetric(event.target.value)}>
              {metricOptions.map((item) => (
                <option key={item.key} value={item.key}>
                  {isJapanese ? item.labelJa : item.labelEn}
                </option>
              ))}
            </select>
          </label>
        </div>

                <div className="dataAvailabilityNotice">
          <b>{labels.dataAvailability}</b>
          <span>{labels.dataAvailabilityText}</span>
          <small>{labels.dataCoverageNote}</small>
                    <small>
            <strong>{labels.sourceProvider}: </strong>
            {sourceProviderText}
          </small>
          <small>
            <strong>{labels.fetchedAt}: </strong>
            {latestFetchedAt}
          </small>
          <small>
            <strong>{labels.statDefinitionVersion}: </strong>
            {statDefinitionVersionText}
          </small>
          <small>
            <strong>{labels.dataCoverageSummary}: </strong>
            {coverageLevelText}
          </small>
          <small
            className={
              hasNoMatches || hasMixedCoverage || hasNonFullCoverage
                ? 'coverageWarningText'
                : 'coverageOkText'
            }
          >
            {coverageStatusText}
          </small>
        </div>
        <div className="scopeSummary">
          <b>{labels.currentScope}</b>

          <div className="scopeSummaryGrid">
            {currentScopeItems.map((item) => (
              <div className="scopeSummaryItem" key={item.label}>
                <span>{item.label}:</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="grid">
        <section className="panel wide">
          <h2>
            {labels.title}: {metricLabel}
          </h2>

          <p className="note">
            {metricLabel} / n={trendRows.length}
          </p>

          {trendRows.length > 0 ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height={320}>
                <RechartsLineChart
                  data={trendRows}
                  margin={{ top: 16, right: 20, bottom: 8, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="matchLabel" interval={0} />
                  <YAxis
                    width={48}
                    tickFormatter={(value) => `${value}${selectedMetric.suffix}`}
                  />
                  <Tooltip
                    cursor={false}
                    labelFormatter={(value, payload) =>
                      payload?.[0]?.payload?.matchDescription || value
                    }
                    formatter={(value) => [
                      `${value}${selectedMetric.suffix}`,
                      metricLabel,
                    ]}
                    contentStyle={chartTooltipStyle}
                    labelStyle={chartTooltipLabelStyle}
                    itemStyle={chartTooltipItemStyle}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={metricLabel}
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="emptyState">
              <b>{labels.noDataTitle}</b>
              <p>{labels.noDataBody}</p>
              <small>{labels.noDataHint}</small>
            </div>
          )}
        </section>

        <section className="panel wide">
          <h2>{labels.tournamentCards}</h2>

          {tournamentAverages.length > 0 ? (
            <div className="cards">
              {tournamentAverages.map((item) => (
                <div className="corr" key={item.tournament}>
                  <span>{item.tournament}</span>
                  <b>
                    {item.average.toFixed(1)}
                    {selectedMetric.suffix}
                  </b>
                  <small>
                    n={item.matches} / {metricLabel}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <div className="emptyState compact">
              <b>{labels.noDataTitle}</b>
              <p>{labels.noData}</p>
            </div>
          )}
        </section>
                <section className="panel wide">
          <h2>{labels.opponentCards}</h2>

          {opponentAverages.length > 0 ? (
            <div className="cards">
              {opponentAverages.map((item) => (
                <div className="corr" key={item.opponent}>
                  <span>{item.opponent}</span>
                  <b>
                    {item.average.toFixed(1)}
                    {selectedMetric.suffix}
                  </b>
                  <small>
                    n={item.matches} / {metricLabel}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <div className="emptyState compact">
              <b>{labels.noDataTitle}</b>
              <p>{labels.noData}</p>
            </div>
          )}
        </section>

        <section className="panel wide">
          <h2>
            <Info size={18} /> {labels.next}
          </h2>
          <ol>
            <li>
              {isJapanese
                ? '複数指標を同時に比較できる表示を検討する。'
                : 'Consider a view for comparing multiple metrics at once.'}
            </li>
            <li>
              {isJapanese
                ? 'Rugby.com.au Match Stats 形式の実データ取り込みに対応する。'
                : 'Add support for importing real data in the Rugby.com.au Match Stats format.'}
            </li>
            <li>
              {isJapanese
                ? 'データ管理画面と接続し、管理者が試合データを追加・更新できる構造を検討する。'
                : 'Connect this screen with the data management area so administrators can add and update match data.'}
            </li>
            <li>
              {isJapanese
                ? '試合検索・動画ライブラリと連動し、スタッツ推移から対象試合を確認できる導線を検討する。'
                : 'Consider linking stats trends with match search and the video library so users can review the relevant matches.'}
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
