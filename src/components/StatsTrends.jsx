import { useMemo, useState } from 'react';
import { ArrowLeft, LineChart, Filter, Info } from 'lucide-react';
import { sampleMatches } from '../data/sampleMatches.js';
import ja from '../i18n/ja.js';

const metricOptions = [
  { key: 'pointsFor', labelJa: '得点', labelEn: 'Points For' },
  { key: 'pointsAgainst', labelJa: '失点', labelEn: 'Points Against' },
  { key: 'cleanBreaks', labelJa: 'クリーンブレイク', labelEn: 'Clean Breaks' },
  { key: 'defendersBeaten', labelJa: 'ディフェンダー突破', labelEn: 'Defenders Beaten' },
  { key: 'turnoversWon', labelJa: 'ターンオーバー獲得', labelEn: 'Turnovers Won' },
  { key: 'turnoversConceded', labelJa: 'ターンオーバー喪失', labelEn: 'Turnovers Conceded' },
  { key: 'possession', labelJa: 'ポゼッション', labelEn: 'Possession' },
];

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
    chartPlaceholder: isJapanese
      ? '次の差分で、ここに選択指標の試合ごとの推移グラフを表示します。'
      : 'In the next step, this area will show the match-by-match trend chart for the selected metric.',
    tournamentCards: isJapanese ? '大会別平均値' : 'Tournament averages',
    next: isJapanese ? '今後の追加予定' : 'Next implementation',
  };

  const seasons = [...new Set(sampleMatches.map((m) => m.season))];

  const [season, setSeason] = useState('2025-26');
  const [gender, setGender] = useState('Women');
  const [team, setTeam] = useState('Japan');
  const [metric, setMetric] = useState('cleanBreaks');

  const filtered = useMemo(
    () =>
      sampleMatches.filter(
        (m) => m.season === season && m.gender === gender && m.team === team
      ),
    [season, gender, team]
  );

  const selectedMetric = metricOptions.find((item) => item.key === metric) || metricOptions[0];

  const tournamentAverages = useMemo(() => {
    const groups = new Map();

    filtered.forEach((match) => {
      if (!groups.has(match.tournament)) {
        groups.set(match.tournament, []);
      }
      groups.get(match.tournament).push(match);
    });

    return [...groups.entries()].map(([tournament, matches]) => {
      const total = matches.reduce((sum, match) => sum + Number(match[metric] || 0), 0);
      const average = matches.length > 0 ? total / matches.length : 0;

      return {
        tournament,
        matches: matches.length,
        average,
      };
    });
  }, [filtered, metric]);

  const metricLabel = isJapanese ? selectedMetric.labelJa : selectedMetric.labelEn;

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
          <LineChart size={22} /> v0.3
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
          <small>
            Rugby.com.au Match Stats / dataCoverageLevel を前提に、今後シーズン比較時のデータ粒度警告を追加します。
          </small>
        </div>
      </section>

      <main className="grid">
        <section className="panel wide">
          <h2>
            {labels.title}: {metricLabel}
          </h2>
          <p className="note">
            {labels.chartPlaceholder}
          </p>

          <div className="trendPlaceholder">
            <LineChart size={42} />
            <strong>{metricLabel}</strong>
            <span>
              {filtered.length} {isJapanese ? '試合' : 'matches'}
            </span>
          </div>
        </section>

        <section className="panel wide">
          <h2>{labels.tournamentCards}</h2>

          <div className="cards">
            {tournamentAverages.map((item) => (
              <div className="corr" key={item.tournament}>
                <span>{item.tournament}</span>
                <b>{item.average.toFixed(1)}</b>
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
                ? '選択指標の試合ごとの推移グラフを追加する。'
                : 'Add a match-by-match trend chart for the selected metric.'}
            </li>
            <li>
              {isJapanese
                ? '大会別・対戦相手別の平均値比較を追加する。'
                : 'Add tournament and opponent-level average comparisons.'}
            </li>
            <li>
              {isJapanese
                ? 'データ粒度が異なるシーズンを比較する場合の警告を追加する。'
                : 'Add warnings when comparing seasons with different data coverage levels.'}
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
