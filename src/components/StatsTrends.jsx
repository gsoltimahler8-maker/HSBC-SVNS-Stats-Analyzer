import { useMemo, useState } from 'react';
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
    metric: isJapanese ? '指標' : 'Metric',
    women: isJapanese ? '女子' : 'Women',
    men: isJapanese ? '男子' : 'Men',
    dataAvailability: isJapanese ? 'データ利用可能範囲' : 'Data Availability',
    dataAvailabilityText: isJapanese
      ? '詳細チームスタッツの標準対象は2022-23シーズン以降です。'
      : 'Full team match stats are treated as standard from the 2022-23 season onward.',
    dataCoverageNote: isJapanese
      ? 'Rugby.com.au Match Stats / dataCoverageLevel を前提に、今後シーズン比較時のデータ粒度警告を追加します。'
      : 'Future updates will use Rugby.com.au Match Stats and dataCoverageLevel to warn users when season comparisons include different data coverage levels.',
    tournamentCards: isJapanese ? '大会別平均値' : 'Tournament averages',
    next: isJapanese ? '今後の追加予定' : 'Next implementation',
    matches: isJapanese ? '試合' : 'matches',
    noData: isJapanese ? 'この条件のサンプルデータはありません。' : 'No sample data is available for this condition.',
  };

  const seasons = [...new Set(sampleMatches.map((match) => match.season))];

  const [season, setSeason] = useState('2025-26');
  const [gender, setGender] = useState('Women');
  const [team, setTeam] = useState('Japan');
  const [metric, setMetric] = useState('cleanBreaks');

  const filtered = useMemo(
    () =>
      sampleMatches.filter(
        (match) => match.season === season && match.gender === gender && match.team === team
      ),
    [season, gender, team]
  );

  const selectedMetric = metricOptions.find((item) => item.key === metric) || metricOptions[0];
  const metricLabel = isJapanese ? selectedMetric.labelJa : selectedMetric.labelEn;

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
            <p className="empty">{labels.noData}</p>
          )}
        </section>

        <section className="panel wide">
          <h2>{labels.tournamentCards}</h2>

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
        </section>

        <section className="panel wide">
          <h2>
            <Info size={18} /> {labels.next}
          </h2>
          <ol>
            <li>
              {isJapanese
                ? '対戦相手別の平均値比較を追加する。'
                : 'Add opponent-level average comparisons.'}
            </li>
            <li>
              {isJapanese
                ? 'データ粒度が異なるシーズンを比較する場合の警告を追加する。'
                : 'Add warnings when comparing seasons with different data coverage levels.'}
            </li>
            <li>
              {isJapanese
                ? '複数指標を同時に比較できる表示を検討する。'
                : 'Consider a view for comparing multiple metrics at once.'}
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
