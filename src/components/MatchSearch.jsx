import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Database,
  ExternalLink,
  Film,
  RotateCcw,
  Search,
  Trophy,
} from 'lucide-react';
import { matchData } from '../data/loadMatches.js';

const ALL = 'all';

function compareMatchesNewestFirst(a, b) {
  const dateCompare = String(b.date || '').localeCompare(String(a.date || ''));

  if (dateCompare !== 0) {
    return dateCompare;
  }

  const aRugbyComAu = Number(a.external?.rugbyComAu);
  const bRugbyComAu = Number(b.external?.rugbyComAu);

  if (Number.isFinite(aRugbyComAu) && Number.isFinite(bRugbyComAu)) {
    const matchIdCompare = bRugbyComAu - aRugbyComAu;

    if (matchIdCompare !== 0) {
      return matchIdCompare;
    }
  } else {
    const matchIdCompare = String(b.external?.rugbyComAu || '').localeCompare(
      String(a.external?.rugbyComAu || '')
    );

    if (matchIdCompare !== 0) {
      return matchIdCompare;
    }
  }

  return String(b.id || '').localeCompare(String(a.id || ''));
}

function getUniqueOptions(matches, key) {
  return [...new Set(matches.map((match) => match[key]).filter(Boolean))].sort(
    (a, b) => String(a).localeCompare(String(b))
  );
}

function getDataType(match) {
  return match.dataType === 'real' ? 'real' : 'sample';
}

function getTeamResult(match) {
  return match.teamResult || match.result || '';
}

function getWinner(match) {
  if (match.winner) {
    return match.winner;
  }

  if (
    typeof match.pointsFor === 'number' &&
    typeof match.pointsAgainst === 'number'
  ) {
    if (match.pointsFor > match.pointsAgainst) {
      return match.team;
    }

    if (match.pointsAgainst > match.pointsFor) {
      return match.opponent;
    }
  }

  return null;
}

function getLoser(match) {
  if (match.loser) {
    return match.loser;
  }

  const winner = getWinner(match);

  if (winner === match.team) {
    return match.opponent;
  }

  if (winner === match.opponent) {
    return match.team;
  }

  return null;
}

function getLocalizedMatchResult(match, isJapanese) {
  const result = getTeamResult(match);

  if (result === 'D') {
    return isJapanese ? '引き分け' : 'Draw';
  }

  if (result === 'NC') {
    return isJapanese ? 'ノーコンテスト' : 'No Contest';
  }

  const winner = getWinner(match);

  if (winner) {
    return isJapanese ? `${winner} 勝利` : `${winner} Win`;
  }

  if (match.matchResult) {
    return match.matchResult;
  }

  return '—';
}

function displayValue(value, suffix = '') {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return `${value}${suffix}`;
}

function normalizeSearchValue(value) {
  return String(value ?? '').trim().toLowerCase();
}

function matchesIdQuery(match, query) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return true;
  }

  const idCandidates = [
    match.id,
    match.external?.rugbyComAu,
    match.external?.svns,
    match.external?.rugbyPass,
  ];

  return idCandidates.some((candidate) =>
    normalizeSearchValue(candidate).includes(normalizedQuery)
  );
}

function getDefaultLabels(t) {
  const isJapanese = t?.navigation?.backHome?.includes('ホーム');

  const ja = {
    title: '試合検索',
    subtitle:
      'シーズン、大会、対戦相手、試合結果、データ種別、Match IDから登録試合を検索します。',
    filtersTitle: '検索条件',
    resultsTitle: '検索結果',
    detailTitle: '試合詳細',
    all: 'すべて',
    reset: '条件をリセット',
    resultCount: '検索結果',
    totalCount: '登録試合',
    matches: '試合',
    filters: {
      season: 'シーズン',
      gender: '男女区分',
      team: 'チーム',
      opponent: '対戦相手',
      tournament: '大会',
      stage: 'ステージ',
      result: '結果',
      dataType: 'データ種別',
      matchId: 'Match ID',
    },
    results: {
      W: '勝利',
      L: '敗戦',
      D: '引き分け',
      NC: 'ノーコンテスト',
    },
    dataTypes: {
      real: 'REAL DATA',
      sample: 'SAMPLE DATA',
    },
    sampleNotice: '画面確認用の仮データ',
    noResultsTitle: 'この条件に一致する試合はありません。',
    noResultsBody: '検索条件を変更してください。',
    noSelection: '試合を選択すると詳細が表示されます。',
    winner: '勝者',
    loser: '敗者',
    teamResult: '分析対象側の結果',
    gender: '男女区分',
    season: 'シーズン',
    tournament: '大会',
    stage: 'ステージ',
    attack: 'アタック',
    defence: 'ディフェンス',
    possessionBreakdown: 'ポゼッション／ブレイクダウン',
    discipline: '規律',
    traceability: '出典追跡',
    internalMatchId: '内部Match ID',
    rugbyComAuId: 'Rugby.com.au ID',
    svnsId: 'SVNS ID',
    rugbyPassId: 'RugbyPass ID',
    sourceProvider: '主ソース',
    sourceUrl: 'ソースURL',
    lastFetched: '最終取得日時',
    coverage: 'データ粒度',
    coverageSource: 'データ粒度ソース',
    statDefinition: 'スタッツ定義',
    dataType: 'データ種別',
    openSource: 'ソースを開く',
    videoStatus: '動画',
    videoNotChecked: '未確認',
    openInVideoLibrary: '動画ライブラリでこの試合を見る',
    metrics: {
      pointsFor: '得点',
      pointsAgainst: '失点',
      tries: 'トライ',
      metres: '獲得メートル',
      carries: 'キャリー',
      passes: 'パス',
      offloads: 'オフロード',
      cleanBreaks: 'クリーンブレイク',
      defendersBeaten: 'ディフェンダー突破',
      turnoversWon: 'ターンオーバー獲得',
      turnoversConceded: 'ターンオーバー喪失',
      tackles: 'タックル',
      missedTackles: 'ミスタックル',
      possession: 'ポゼッション',
      territory: 'テリトリー',
      rucksWon: 'ラック獲得',
      rucksLost: 'ラック喪失',
      penaltiesConceded: '反則',
      yellowCards: 'イエローカード',
      redCards: 'レッドカード',
    },
  };

  const en = {
    title: 'Match Search',
    subtitle:
      'Search registered matches by season, tournament, opponent, result, data type, or Match ID.',
    filtersTitle: 'Search Filters',
    resultsTitle: 'Search Results',
    detailTitle: 'Match Detail',
    all: 'All',
    reset: 'Reset Filters',
    resultCount: 'Results',
    totalCount: 'Registered',
    matches: 'matches',
    filters: {
      season: 'Season',
      gender: 'Gender',
      team: 'Team',
      opponent: 'Opponent',
      tournament: 'Tournament',
      stage: 'Stage',
      result: 'Result',
      dataType: 'Data Type',
      matchId: 'Match ID',
    },
    results: {
      W: 'Win',
      L: 'Loss',
      D: 'Draw',
      NC: 'No Contest',
    },
    dataTypes: {
      real: 'REAL DATA',
      sample: 'SAMPLE DATA',
    },
    sampleNotice: 'Temporary data for screen testing',
    noResultsTitle: 'No matches were found for these filters.',
    noResultsBody: 'Try changing the search conditions.',
    noSelection: 'Select a match to view its details.',
    winner: 'Winner',
    loser: 'Loser',
    teamResult: 'Team result',
    gender: 'Gender',
    season: 'Season',
    tournament: 'Tournament',
    stage: 'Stage',
    attack: 'Attack',
    defence: 'Defence',
    possessionBreakdown: 'Possession / Breakdown',
    discipline: 'Discipline',
    traceability: 'Traceability',
    internalMatchId: 'Internal Match ID',
    rugbyComAuId: 'Rugby.com.au ID',
    svnsId: 'SVNS ID',
    rugbyPassId: 'RugbyPass ID',
    sourceProvider: 'Primary source',
    sourceUrl: 'Source URL',
    lastFetched: 'Last fetched',
    coverage: 'Data coverage',
    coverageSource: 'Coverage source',
    statDefinition: 'Stats definition',
    dataType: 'Data type',
    openSource: 'Open source',
    videoStatus: 'Video',
    videoNotChecked: 'Not checked',
    openInVideoLibrary: 'View this match in Video Library',
    metrics: {
      pointsFor: 'Points For',
      pointsAgainst: 'Points Against',
      tries: 'Tries',
      metres: 'Metres',
      carries: 'Carries',
      passes: 'Passes',
      offloads: 'Offloads',
      cleanBreaks: 'Clean Breaks',
      defendersBeaten: 'Defenders Beaten',
      turnoversWon: 'Turnovers Won',
      turnoversConceded: 'Turnovers Conceded',
      tackles: 'Tackles',
      missedTackles: 'Missed Tackles',
      possession: 'Possession',
      territory: 'Territory',
      rucksWon: 'Rucks Won',
      rucksLost: 'Rucks Lost',
      penaltiesConceded: 'Penalties Conceded',
      yellowCards: 'Yellow Cards',
      redCards: 'Red Cards',
    },
  };

  return {
    labels: t?.matchSearch || (isJapanese ? ja : en),
    isJapanese,
  };
}

export default function MatchSearch({
  onBackHome,
  onOpenVideoLibrary,
  initialSelectedMatchId = '',
  t,
  backgroundImage,
  mobileBackgroundImage,
}) {
  const { labels, isJapanese } = getDefaultLabels(t);

  const [season, setSeason] = useState(ALL);
  const [gender, setGender] = useState(ALL);
  const [team, setTeam] = useState(ALL);
  const [opponent, setOpponent] = useState(ALL);
  const [tournament, setTournament] = useState(ALL);
  const [stage, setStage] = useState(ALL);
  const [result, setResult] = useState(ALL);
  const [dataType, setDataType] = useState(ALL);
  const [matchIdQuery, setMatchIdQuery] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState(initialSelectedMatchId);

  const seasons = useMemo(
    () =>
      getUniqueOptions(matchData, 'season').sort((a, b) =>
        String(b).localeCompare(String(a))
      ),
    []
  );
  const genders = useMemo(() => getUniqueOptions(matchData, 'gender'), []);
  const teams = useMemo(() => getUniqueOptions(matchData, 'team'), []);
  const opponents = useMemo(() => getUniqueOptions(matchData, 'opponent'), []);
  const tournaments = useMemo(
    () => getUniqueOptions(matchData, 'tournament'),
    []
  );
  const stages = useMemo(() => getUniqueOptions(matchData, 'stage'), []);

  const filteredMatches = useMemo(() => {
    return matchData
      .filter((match) => season === ALL || match.season === season)
      .filter((match) => gender === ALL || match.gender === gender)
      .filter((match) => team === ALL || match.team === team)
      .filter((match) => opponent === ALL || match.opponent === opponent)
      .filter(
        (match) => tournament === ALL || match.tournament === tournament
      )
      .filter((match) => stage === ALL || match.stage === stage)
      .filter(
        (match) => result === ALL || getTeamResult(match) === result
      )
      .filter(
        (match) => dataType === ALL || getDataType(match) === dataType
      )
      .filter((match) => matchesIdQuery(match, matchIdQuery))
      .sort(compareMatchesNewestFirst);
  }, [
    season,
    gender,
    team,
    opponent,
    tournament,
    stage,
    result,
    dataType,
    matchIdQuery,
  ]);

  useEffect(() => {
    if (filteredMatches.length === 0) {
      setSelectedMatchId('');
      return;
    }

    const selectedStillVisible = filteredMatches.some(
      (match) => match.id === selectedMatchId
    );

    if (!selectedStillVisible) {
      setSelectedMatchId(filteredMatches[0].id);
    }
  }, [filteredMatches, selectedMatchId]);

  const selectedMatch =
    filteredMatches.find((match) => match.id === selectedMatchId) || null;

  const coverageLevels = t?.statsAnalysis?.dataCoverage?.levels || {};

  const getCoverageLabel = (level) => {
    return coverageLevels[level] || level || '—';
  };

  const resetFilters = () => {
    setSeason(ALL);
    setGender(ALL);
    setTeam(ALL);
    setOpponent(ALL);
    setTournament(ALL);
    setStage(ALL);
    setResult(ALL);
    setDataType(ALL);
    setMatchIdQuery('');
  };

  const backgroundStyle =
    backgroundImage && mobileBackgroundImage
      ? {
          '--screen-bg-image': `url(${backgroundImage})`,
          '--screen-bg-mobile-image': `url(${mobileBackgroundImage})`,
        }
      : undefined;

  const metricGroups = selectedMatch
    ? [
        {
          title: labels.attack,
          metrics: [
            ['pointsFor', selectedMatch.pointsFor],
            ['tries', selectedMatch.tries],
            ['metres', selectedMatch.metres],
            ['carries', selectedMatch.carries],
            ['passes', selectedMatch.passes],
            ['offloads', selectedMatch.offloads],
            ['cleanBreaks', selectedMatch.cleanBreaks],
            ['defendersBeaten', selectedMatch.defendersBeaten],
            ['turnoversConceded', selectedMatch.turnoversConceded],
          ],
        },
        {
          title: labels.defence,
          metrics: [
            ['pointsAgainst', selectedMatch.pointsAgainst],
            ['tackles', selectedMatch.tackles],
            ['missedTackles', selectedMatch.missedTackles],
            ['turnoversWon', selectedMatch.turnoversWon],
          ],
        },
        {
          title: labels.possessionBreakdown,
          metrics: [
            ['possession', selectedMatch.possession, '%'],
            ['territory', selectedMatch.territory, '%'],
            ['rucksWon', selectedMatch.rucksWon],
            ['rucksLost', selectedMatch.rucksLost],
          ],
        },
        {
          title: labels.discipline,
          metrics: [
            ['penaltiesConceded', selectedMatch.penaltiesConceded],
            ['yellowCards', selectedMatch.yellowCards],
            ['redCards', selectedMatch.redCards],
          ],
        },
      ]
    : [];

  return (
    <div
      className="app screenBackground matchSearchScreen"
      style={backgroundStyle}
    >
      <button type="button" className="backHomeButton" onClick={onBackHome}>
        {t?.navigation?.backHome || '← Back to Home'}
      </button>

      <section className="hero matchSearchHero">
        <div>
          <p className="eyebrow">SVNS Analytics</p>
          <h1>{labels.title}</h1>
          <p>{labels.subtitle}</p>
        </div>
        <div className="badge">
          <Search size={18} />
          <span>
            {filteredMatches.length} / {matchData.length} {labels.matches}
          </span>
        </div>
      </section>

      <section className="panel scope matchSearchFilters">
        <h2>
          <Search size={18} />
          {labels.filtersTitle}
        </h2>

        <div className="filters">
          <label>
            {labels.filters.season}
            <select value={season} onChange={(event) => setSeason(event.target.value)}>
              <option value={ALL}>{labels.all}</option>
              {seasons.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.gender}
            <select value={gender} onChange={(event) => setGender(event.target.value)}>
              <option value={ALL}>{labels.all}</option>
              {genders.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.team}
            <select value={team} onChange={(event) => setTeam(event.target.value)}>
              <option value={ALL}>{labels.all}</option>
              {teams.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.opponent}
            <select
              value={opponent}
              onChange={(event) => setOpponent(event.target.value)}
            >
              <option value={ALL}>{labels.all}</option>
              {opponents.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.tournament}
            <select
              value={tournament}
              onChange={(event) => setTournament(event.target.value)}
            >
              <option value={ALL}>{labels.all}</option>
              {tournaments.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.stage}
            <select value={stage} onChange={(event) => setStage(event.target.value)}>
              <option value={ALL}>{labels.all}</option>
              {stages.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.result}
            <select value={result} onChange={(event) => setResult(event.target.value)}>
              <option value={ALL}>{labels.all}</option>
              <option value="W">{labels.results.W}</option>
              <option value="L">{labels.results.L}</option>
              <option value="D">{labels.results.D}</option>
              <option value="NC">{labels.results.NC}</option>
            </select>
          </label>

          <label>
            {labels.filters.dataType}
            <select
              value={dataType}
              onChange={(event) => setDataType(event.target.value)}
            >
              <option value={ALL}>{labels.all}</option>
              <option value="real">{labels.dataTypes.real}</option>
              <option value="sample">{labels.dataTypes.sample}</option>
            </select>
          </label>

          <label>
            {labels.filters.matchId}
            <input
              className="matchSearchTextInput"
              type="search"
              value={matchIdQuery}
              onChange={(event) => setMatchIdQuery(event.target.value)}
              placeholder="949550 / R-202526..."
            />
          </label>
        </div>

        <div className="matchSearchToolbar">
          <p className="note">
            {labels.resultCount}: {filteredMatches.length} {labels.matches} /{' '}
            {labels.totalCount}: {matchData.length} {labels.matches}
          </p>

          <button
            type="button"
            className="backHomeButton matchSearchResetButton"
            onClick={resetFilters}
          >
            <RotateCcw size={16} />
            {labels.reset}
          </button>
        </div>
      </section>

      <div className="grid matchSearchLayout">
        <section className="panel matchSearchResults">
          <h2>
            <Database size={18} />
            {labels.resultsTitle}
          </h2>

          {filteredMatches.length === 0 ? (
            <div className="emptyState">
              <b>{labels.noResultsTitle}</b>
              <p>{labels.noResultsBody}</p>
            </div>
          ) : (
            <div className="matches">
              {filteredMatches.map((match) => {
                const currentDataType = getDataType(match);
                const isActive = match.id === selectedMatchId;

                return (
                  <button
                    key={match.id}
                    type="button"
                    className={`match matchSearchResultCard${
                      isActive ? ' active' : ''
                    }`}
                    onClick={() => setSelectedMatchId(match.id)}
                  >
                    <strong>
                      {match.team} {displayValue(match.pointsFor)}-
                      {displayValue(match.pointsAgainst)} {match.opponent}
                    </strong>

                    <span>
                      {match.date} / {match.tournament} / {match.stage}
                    </span>

                    <em>{getLocalizedMatchResult(match, isJapanese)}</em>

                    <span className="matchSearchBadgeRow">
                      <b
                        className={`matchSearchBadge matchSearchBadge-${currentDataType}`}
                      >
                        {labels.dataTypes[currentDataType]}
                      </b>
                      <b className="matchSearchBadge matchSearchBadge-coverage">
                        {getCoverageLabel(match.dataCoverageLevel)}
                      </b>
                    </span>

                    {currentDataType === 'sample' && (
                      <span className="matchSearchSampleNotice">
                        {labels.sampleNotice}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="panel matchSearchDetail">
          <h2>
            <Trophy size={18} />
            {labels.detailTitle}
          </h2>

          {!selectedMatch ? (
            <div className="emptyState compact">
              <p>{labels.noSelection}</p>
            </div>
          ) : (
            <div className="detail">
              <h3>
                {selectedMatch.team} vs {selectedMatch.opponent}
              </h3>

              <div className="scoreLine">
                <b>
                  {selectedMatch.team} {displayValue(selectedMatch.pointsFor)}-
                  {displayValue(selectedMatch.pointsAgainst)}{' '}
                  {selectedMatch.opponent}
                </b>
                <span>
                  {getLocalizedMatchResult(selectedMatch, isJapanese)}
                </span>
              </div>

              <div className="matchSearchMeta">
                <span>
                  <CalendarDays size={15} />
                  {selectedMatch.date}
                </span>
                <span>
                  {labels.season}: {selectedMatch.season}
                </span>
                <span>
                  {labels.tournament}: {selectedMatch.tournament}
                </span>
                <span>
                  {labels.stage}: {selectedMatch.stage}
                </span>
                <span>
                  {labels.gender}: {selectedMatch.gender}
                </span>
                <span>
                  {labels.winner}: {getWinner(selectedMatch) || '—'}
                </span>
                <span>
                  {labels.loser}: {getLoser(selectedMatch) || '—'}
                </span>
                <span>
                  {labels.teamResult}:{' '}
                  {labels.results[getTeamResult(selectedMatch)] ||
                    getTeamResult(selectedMatch) ||
                    '—'}
                </span>
              </div>

              {metricGroups.map((group) => (
                <div key={group.title} className="matchSearchMetricGroup">
                  <h3>{group.title}</h3>
                  <div className="metricGrid">
                    {group.metrics.map(([key, value, suffix = '']) => (
                      <span key={key}>
                        {labels.metrics[key] || key}
                        <b>{displayValue(value, suffix)}</b>
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              <div className="matchSearchVideoStatus">
                <div className="matchSearchVideoStatusText">
                  <Film size={18} />
                  <b>{labels.videoStatus}:</b>
                  <span>{labels.videoNotChecked}</span>
                </div>

                {onOpenVideoLibrary && (
                  <button
                    type="button"
                    className="crossScreenLinkButton"
                    onClick={() => onOpenVideoLibrary(selectedMatch.id)}
                  >
                    <Film size={16} />
                    {labels.openInVideoLibrary}
                  </button>
                )}
              </div>

              <div className="sourceBox">
                <b>{labels.traceability}</b>
                <br />
                {labels.internalMatchId}: {selectedMatch.id || '—'}
                <br />
                {labels.rugbyComAuId}:{' '}
                {selectedMatch.external?.rugbyComAu || '—'}
                <br />
                {labels.svnsId}: {selectedMatch.external?.svns || '—'}
                <br />
                {labels.rugbyPassId}:{' '}
                {selectedMatch.external?.rugbyPass || '—'}
                <br />
                {labels.sourceProvider}:{' '}
                {selectedMatch.sourceProvider || '—'}
                <br />
                {labels.lastFetched}: {selectedMatch.fetchedAt || '—'}
                <br />
                {labels.coverage}:{' '}
                {getCoverageLabel(selectedMatch.dataCoverageLevel)}
                <br />
                {labels.coverageSource}:{' '}
                {selectedMatch.dataCoverageSource || '—'}
                <br />
                {labels.statDefinition}:{' '}
                {selectedMatch.statDefinitionVersion || '—'}
                <br />
                {labels.dataType}:{' '}
                {labels.dataTypes[getDataType(selectedMatch)]}
                <br />
                {labels.sourceUrl}: {selectedMatch.sourceUrl || '—'}
                {selectedMatch.sourceUrl && (
                  <>
                    <br />
                    <a
                      href={selectedMatch.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="matchSearchSourceLink"
                    >
                      <ExternalLink size={15} />
                      {labels.openSource}
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
