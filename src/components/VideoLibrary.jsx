import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ExternalLink,
  Film,
  PlayCircle,
  RotateCcw,
  Search,
  Video,
} from 'lucide-react';
import { matchData } from '../data/loadMatches.js';
import { videoData } from '../data/loadVideos.js';
import {
  getVideoAvailability,
  getYouTubeEmbedUrl,
  sortVideos,
} from '../utils/videoUtils.js';

const ALL = 'all';


function compareMatchesNewestFirst(a, b) {
  const dateCompare = String(b.date || '').localeCompare(String(a.date || ''));

  if (dateCompare !== 0) {
    return dateCompare;
  }

  const aId = Number(a.external?.rugbyComAu);
  const bId = Number(b.external?.rugbyComAu);

  if (Number.isFinite(aId) && Number.isFinite(bId) && aId !== bId) {
    return bId - aId;
  }

  return String(b.id || '').localeCompare(String(a.id || ''));
}

function getUniqueOptions(items, selector) {
  return [...new Set(items.map(selector).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b))
  );
}

function getMatchDataType(match) {
  return match.dataType === 'real' ? 'real' : 'sample';
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

function getMatchResultLabel(match, isJapanese) {
  const result = match.teamResult || match.result;

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

  return match.matchResult || '—';
}

function getDefaultLabels(t) {
  const isJapanese = t?.navigation?.backHome?.includes('ホーム');

  const ja = {
    title: '動画ライブラリ',
    subtitle:
      '登録試合と動画情報を対応付け、フルマッチ、ハイライト、関連映像の公開状況を確認します。',
    filtersTitle: '検索条件',
    resultsTitle: '試合一覧',
    detailTitle: '動画詳細',
    all: 'すべて',
    reset: '条件をリセット',
    resultCount: '表示件数',
    matches: '試合',
    videos: '動画',
    filters: {
      season: 'シーズン',
      gender: '男女区分',
      team: 'チーム',
      opponent: '対戦相手',
      tournament: '大会',
      availability: '動画状態',
      matchDataType: '試合データ種別',
      matchId: 'Match ID',
    },
    dataTypes: {
      real: 'REAL DATA',
      sample: 'SAMPLE DATA',
    },
    availability: {
      available: '視聴可能',
      not_available: '動画なし',
      not_checked: '未確認',
      geo_restricted: '地域制限あり',
      login_required: 'ログインが必要',
      removed: '削除済み',
      broken_link: 'リンク切れ',
      unknown: '状態不明',
    },
    videoTypes: {
      full_match: 'フルマッチ',
      extended_highlights: 'ロングハイライト',
      highlights: 'ハイライト',
      short_clip: 'ショートクリップ',
      analysis: '分析動画',
      external_page: '外部ページ',
      unknown: '種別不明',
    },
    noResultsTitle: 'この条件に一致する試合はありません。',
    noResultsBody: '検索条件を変更してください。',
    noSelection: '試合を選択すると動画情報が表示されます。',
    noVideosTitle: '動画情報はまだ登録されていません。',
    noVideosBody: 'この試合の動画状態は未確認です。',
    matchInformation: '試合情報',
    videoInformation: '動画情報',
    provider: '提供元',
    videoType: '動画種別',
    availabilityLabel: '公開状態',
    checkedAt: '最終確認日時',
    publishedAt: '公開日時',
    duration: '再生時間',
    language: '言語',
    embedAllowed: '埋め込み',
    geoRestriction: '地域制限',
    notes: '備考',
    sourcePage: '掲載元ページ',
    openVideo: '動画を開く',
    openSourcePage: '掲載元ページを開く',
    yes: '可',
    no: '不可',
    unknown: '未確認',
    sampleNotice: '画面確認用の仮データ',
    openInMatchSearch: '試合検索でスタッツ詳細を見る',
    playerTitle: 'YouTubeプレーヤー',
    chooseVideo: '再生する動画',
    nowPlaying: '再生中',
    playHere: 'この画面で再生',
    embedFallback:
      '埋め込み再生できない場合は「動画を開く」からYouTubeで視聴してください。',
    embedUnavailableTitle: 'この動画はアプリ内再生に対応していません。',
    embedUnavailableBody:
      '外部リンクから動画提供元のページを開いてください。',
  };

  const en = {
    title: 'Video Library',
    subtitle:
      'Connect registered matches with full-match video, highlights, clips, and availability information.',
    filtersTitle: 'Search Filters',
    resultsTitle: 'Match List',
    detailTitle: 'Video Detail',
    all: 'All',
    reset: 'Reset Filters',
    resultCount: 'Showing',
    matches: 'matches',
    videos: 'videos',
    filters: {
      season: 'Season',
      gender: 'Gender',
      team: 'Team',
      opponent: 'Opponent',
      tournament: 'Tournament',
      availability: 'Video Status',
      matchDataType: 'Match Data Type',
      matchId: 'Match ID',
    },
    dataTypes: {
      real: 'REAL DATA',
      sample: 'SAMPLE DATA',
    },
    availability: {
      available: 'Available',
      not_available: 'Not available',
      not_checked: 'Not checked',
      geo_restricted: 'Geo restricted',
      login_required: 'Login required',
      removed: 'Removed',
      broken_link: 'Broken link',
      unknown: 'Unknown',
    },
    videoTypes: {
      full_match: 'Full match',
      extended_highlights: 'Extended highlights',
      highlights: 'Highlights',
      short_clip: 'Short clip',
      analysis: 'Analysis',
      external_page: 'External page',
      unknown: 'Unknown',
    },
    noResultsTitle: 'No matches were found for these filters.',
    noResultsBody: 'Try changing the search conditions.',
    noSelection: 'Select a match to view its video information.',
    noVideosTitle: 'No video records have been added.',
    noVideosBody: 'The video status for this match has not been checked.',
    matchInformation: 'Match Information',
    videoInformation: 'Video Information',
    provider: 'Provider',
    videoType: 'Video type',
    availabilityLabel: 'Availability',
    checkedAt: 'Last checked',
    publishedAt: 'Published',
    duration: 'Duration',
    language: 'Language',
    embedAllowed: 'Embedding',
    geoRestriction: 'Geo restriction',
    notes: 'Notes',
    sourcePage: 'Source page',
    openVideo: 'Open video',
    openSourcePage: 'Open source page',
    yes: 'Allowed',
    no: 'Not allowed',
    unknown: 'Unknown',
    sampleNotice: 'Temporary data for screen testing',
    openInMatchSearch: 'View stats detail in Match Search',
    playerTitle: 'YouTube Player',
    chooseVideo: 'Choose video',
    nowPlaying: 'Now playing',
    playHere: 'Play here',
    embedFallback:
      'If embedded playback is unavailable, use “Open video” to watch on YouTube.',
    embedUnavailableTitle: 'This video cannot be played inside the app.',
    embedUnavailableBody:
      'Open the external video page using the link below.',
  };

  return {
    labels: t?.videoLibrary || (isJapanese ? ja : en),
    isJapanese,
  };
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '—';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function matchesIdQuery(match, query) {
  const normalizedQuery = String(query || '').trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    match.id,
    match.external?.rugbyComAu,
    match.external?.svns,
    match.external?.rugbyPass,
  ].some((value) =>
    String(value || '').toLowerCase().includes(normalizedQuery)
  );
}

export default function VideoLibrary({
  onBackHome,
  onOpenMatchSearch,
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
  const [availability, setAvailability] = useState(ALL);
  const [matchDataType, setMatchDataType] = useState(ALL);
  const [matchIdQuery, setMatchIdQuery] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState(initialSelectedMatchId);
  const [selectedVideoId, setSelectedVideoId] = useState('');

  const videosByMatch = useMemo(() => {
    const map = new Map();

    videoData.forEach((video) => {
      if (!video.matchId) {
        return;
      }

      const existing = map.get(video.matchId) || [];
      existing.push(video);
      map.set(video.matchId, existing);
    });

    map.forEach((videos, matchId) => {
      map.set(matchId, sortVideos(videos));
    });

    return map;
  }, []);

  const seasons = useMemo(
    () =>
      getUniqueOptions(matchData, (match) => match.season).sort((a, b) =>
        String(b).localeCompare(String(a))
      ),
    []
  );
  const genders = useMemo(
    () => getUniqueOptions(matchData, (match) => match.gender),
    []
  );
  const teams = useMemo(
    () => getUniqueOptions(matchData, (match) => match.team),
    []
  );
  const opponents = useMemo(
    () => getUniqueOptions(matchData, (match) => match.opponent),
    []
  );
  const tournaments = useMemo(
    () => getUniqueOptions(matchData, (match) => match.tournament),
    []
  );

  const filteredMatches = useMemo(() => {
    return matchData
      .filter((match) => season === ALL || match.season === season)
      .filter((match) => gender === ALL || match.gender === gender)
      .filter((match) => team === ALL || match.team === team)
      .filter((match) => opponent === ALL || match.opponent === opponent)
      .filter(
        (match) => tournament === ALL || match.tournament === tournament
      )
      .filter(
        (match) =>
          matchDataType === ALL ||
          getMatchDataType(match) === matchDataType
      )
      .filter((match) => {
        if (availability === ALL) {
          return true;
        }

        const matchVideos = videosByMatch.get(match.id) || [];
        return getVideoAvailability(matchVideos) === availability;
      })
      .filter((match) => matchesIdQuery(match, matchIdQuery))
      .sort(compareMatchesNewestFirst);
  }, [
    season,
    gender,
    team,
    opponent,
    tournament,
    availability,
    matchDataType,
    matchIdQuery,
    videosByMatch,
  ]);

  useEffect(() => {
    if (!filteredMatches.length) {
      setSelectedMatchId('');
      return;
    }

    if (!filteredMatches.some((match) => match.id === selectedMatchId)) {
      setSelectedMatchId(filteredMatches[0].id);
    }
  }, [filteredMatches, selectedMatchId]);

  const selectedMatch =
    filteredMatches.find((match) => match.id === selectedMatchId) || null;
  const selectedVideos = selectedMatch
    ? videosByMatch.get(selectedMatch.id) || []
    : [];

  const playableVideos = selectedVideos.filter((video) =>
    Boolean(getYouTubeEmbedUrl(video))
  );

  useEffect(() => {
    if (!playableVideos.length) {
      setSelectedVideoId('');
      return;
    }

    if (!playableVideos.some((video) => video.id === selectedVideoId)) {
      setSelectedVideoId(playableVideos[0].id);
    }
  }, [playableVideos, selectedVideoId]);

  const selectedVideo =
    playableVideos.find((video) => video.id === selectedVideoId) ||
    playableVideos[0] ||
    null;
  const selectedVideoEmbedUrl = getYouTubeEmbedUrl(selectedVideo);

  const resetFilters = () => {
    setSeason(ALL);
    setGender(ALL);
    setTeam(ALL);
    setOpponent(ALL);
    setTournament(ALL);
    setAvailability(ALL);
    setMatchDataType(ALL);
    setMatchIdQuery('');
  };

  const backgroundStyle =
    backgroundImage && mobileBackgroundImage
      ? {
          '--screen-bg-image': `url(${backgroundImage})`,
          '--screen-bg-mobile-image': `url(${mobileBackgroundImage})`,
        }
      : undefined;

  return (
    <div
      className="app screenBackground videoLibraryScreen"
      style={backgroundStyle}
    >
      <button type="button" className="backHomeButton" onClick={onBackHome}>
        {t?.navigation?.backHome || '← Back to Home'}
      </button>

      <section className="hero videoLibraryHero">
        <div>
          <p className="eyebrow">SVNS Analytics</p>
          <h1>{labels.title}</h1>
          <p>{labels.subtitle}</p>
        </div>

        <div className="badge">
          <Video size={18} />
          <span>
            {filteredMatches.length} {labels.matches} / {videoData.length}{' '}
            {labels.videos}
          </span>
        </div>
      </section>

      <section className="panel scope videoLibraryFilters">
        <h2>
          <Search size={18} />
          {labels.filtersTitle}
        </h2>

        <div className="filters">
          <label>
            {labels.filters.season}
            <select
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            >
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
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
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
            <select
              value={team}
              onChange={(event) => setTeam(event.target.value)}
            >
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
            {labels.filters.availability}
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
            >
              <option value={ALL}>{labels.all}</option>
              {Object.entries(labels.availability).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.matchDataType}
            <select
              value={matchDataType}
              onChange={(event) => setMatchDataType(event.target.value)}
            >
              <option value={ALL}>{labels.all}</option>
              <option value="real">{labels.dataTypes.real}</option>
              <option value="sample">{labels.dataTypes.sample}</option>
            </select>
          </label>

          <label>
            {labels.filters.matchId}
            <input
              className="videoLibraryTextInput"
              type="search"
              value={matchIdQuery}
              onChange={(event) => setMatchIdQuery(event.target.value)}
              placeholder="949550 / R-202526..."
            />
          </label>
        </div>

        <div className="videoLibraryToolbar">
          <p className="note">
            {labels.resultCount}: {filteredMatches.length} {labels.matches}
          </p>

          <button
            type="button"
            className="backHomeButton videoLibraryResetButton"
            onClick={resetFilters}
          >
            <RotateCcw size={16} />
            {labels.reset}
          </button>
        </div>
      </section>

      <div className="grid videoLibraryLayout">
        <section className="panel videoLibraryResults">
          <h2>
            <Film size={18} />
            {labels.resultsTitle}
          </h2>

          {!filteredMatches.length ? (
            <div className="emptyState">
              <b>{labels.noResultsTitle}</b>
              <p>{labels.noResultsBody}</p>
            </div>
          ) : (
            <div className="matches">
              {filteredMatches.map((match) => {
                const matchVideos = videosByMatch.get(match.id) || [];
                const currentAvailability = getVideoAvailability(matchVideos);
                const currentDataType = getMatchDataType(match);
                const isActive = match.id === selectedMatchId;

                return (
                  <button
                    key={match.id}
                    type="button"
                    className={`match videoLibraryResultCard${
                      isActive ? ' active' : ''
                    }`}
                    onClick={() => setSelectedMatchId(match.id)}
                  >
                    <strong>
                      {match.team} {match.pointsFor}-{match.pointsAgainst}{' '}
                      {match.opponent}
                    </strong>

                    <span>
                      {match.date} / {match.tournament} / {match.stage}
                    </span>

                    <em>{getMatchResultLabel(match, isJapanese)}</em>

                    <span className="videoLibraryBadgeRow">
                      <b
                        className={`videoLibraryBadge videoLibraryAvailability-${currentAvailability}`}
                      >
                        {labels.availability[currentAvailability] ||
                          currentAvailability}
                      </b>

                      <b
                        className={`videoLibraryBadge videoLibraryDataType-${currentDataType}`}
                      >
                        {labels.dataTypes[currentDataType]}
                      </b>

                      {matchVideos.length > 0 && (
                        <b className="videoLibraryBadge">
                          {matchVideos.length} {labels.videos}
                        </b>
                      )}
                    </span>

                    {currentDataType === 'sample' && (
                      <span className="videoLibrarySampleNotice">
                        {labels.sampleNotice}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="panel videoLibraryDetail">
          <h2>
            <PlayCircle size={18} />
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
                  {selectedMatch.team} {selectedMatch.pointsFor}-
                  {selectedMatch.pointsAgainst} {selectedMatch.opponent}
                </b>
                <span>
                  {getMatchResultLabel(selectedMatch, isJapanese)}
                </span>
              </div>

              <div className="videoLibraryMatchMeta">
                <span>
                  <CalendarDays size={15} />
                  {selectedMatch.date}
                </span>
                <span>{selectedMatch.tournament}</span>
                <span>{selectedMatch.stage}</span>
                <span>{selectedMatch.gender}</span>
                <span>{selectedMatch.id}</span>
              </div>

              {onOpenMatchSearch && (
                <div className="videoLibraryCrossLink">
                  <button
                    type="button"
                    className="crossScreenLinkButton"
                    onClick={() => onOpenMatchSearch(selectedMatch.id)}
                  >
                    <Search size={16} />
                    {labels.openInMatchSearch}
                  </button>
                </div>
              )}

              <div className="videoLibrarySection">
                <h3>{labels.videoInformation}</h3>

                {selectedVideo && selectedVideoEmbedUrl && (
                  <section className="videoLibraryPlayer">
                    <div className="videoLibraryPlayerHeader">
                      <div>
                        <span>{labels.playerTitle}</span>
                        <strong>
                          {selectedVideo.title ||
                            labels.videoTypes[selectedVideo.videoType] ||
                            selectedVideo.videoType ||
                            labels.unknown}
                        </strong>
                      </div>

                      <b className="videoLibraryBadge videoLibraryAvailability-available">
                        {labels.availability.available}
                      </b>
                    </div>

                    {playableVideos.length > 1 && (
                      <div className="videoLibraryPlayerChoices">
                        <span>{labels.chooseVideo}</span>

                        <div
                          className="videoLibraryPlayerChoiceButtons"
                          role="tablist"
                          aria-label={labels.chooseVideo}
                        >
                          {playableVideos.map((video) => {
                            const isSelected = video.id === selectedVideo.id;

                            return (
                              <button
                                key={video.id}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                className={`videoLibraryPlayerChoice${
                                  isSelected ? ' active' : ''
                                }`}
                                onClick={() => setSelectedVideoId(video.id)}
                              >
                                {labels.videoTypes[video.videoType] ||
                                  video.videoType ||
                                  labels.playHere}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="videoLibraryPlayerFrame">
                      <iframe
                        key={selectedVideo.id}
                        src={selectedVideoEmbedUrl}
                        title={
                          selectedVideo.title ||
                          `${selectedMatch.team} vs ${selectedMatch.opponent}`
                        }
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>

                    <div className="videoLibraryNowPlaying">
                      <div>
                        <span>{labels.nowPlaying}</span>
                        <strong>
                          {labels.videoTypes[selectedVideo.videoType] ||
                            selectedVideo.videoType ||
                            labels.unknown}
                        </strong>
                      </div>

                      {selectedVideo.videoUrl && (
                        <a
                          href={selectedVideo.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={15} />
                          {labels.openVideo}
                        </a>
                      )}
                    </div>

                    <p className="videoLibraryEmbedFallback">
                      {labels.embedFallback}
                    </p>
                  </section>
                )}

                {selectedVideos.length > 0 && !playableVideos.length && (
                  <div className="emptyState compact videoLibraryEmbedUnavailable">
                    <b>{labels.embedUnavailableTitle}</b>
                    <p>{labels.embedUnavailableBody}</p>
                  </div>
                )}

                {!selectedVideos.length ? (
                  <div className="emptyState compact">
                    <b>{labels.noVideosTitle}</b>
                    <p>{labels.noVideosBody}</p>
                  </div>
                ) : (
                  <div className="videoLibraryVideoList">
                    {selectedVideos.map((video) => (
                      <article
                        key={video.id}
                        className="videoLibraryVideoCard"
                      >
                        <div className="videoLibraryVideoCardHeader">
                          <div>
                            <strong>
                              {video.title ||
                                labels.videoTypes[video.videoType] ||
                                video.videoType ||
                                labels.unknown}
                            </strong>
                            <span>
                              {labels.provider}:{' '}
                              {video.videoProvider || labels.unknown}
                            </span>
                          </div>

                          <b
                            className={`videoLibraryBadge videoLibraryAvailability-${
                              video.availability || 'unknown'
                            }`}
                          >
                            {labels.availability[video.availability] ||
                              video.availability ||
                              labels.availability.unknown}
                          </b>
                        </div>

                        <dl className="videoLibraryVideoMeta">
                          <div>
                            <dt>{labels.videoType}</dt>
                            <dd>
                              {labels.videoTypes[video.videoType] ||
                                video.videoType ||
                                '—'}
                            </dd>
                          </div>
                          <div>
                            <dt>{labels.checkedAt}</dt>
                            <dd>{video.checkedAt || '—'}</dd>
                          </div>
                          <div>
                            <dt>{labels.publishedAt}</dt>
                            <dd>{video.publishedAt || '—'}</dd>
                          </div>
                          <div>
                            <dt>{labels.duration}</dt>
                            <dd>{formatDuration(video.durationSeconds)}</dd>
                          </div>
                          <div>
                            <dt>{labels.language}</dt>
                            <dd>{video.language || '—'}</dd>
                          </div>
                          <div>
                            <dt>{labels.embedAllowed}</dt>
                            <dd>
                              {video.embedAllowed === true
                                ? labels.yes
                                : video.embedAllowed === false
                                  ? labels.no
                                  : labels.unknown}
                            </dd>
                          </div>
                          <div>
                            <dt>{labels.geoRestriction}</dt>
                            <dd>
                              {Array.isArray(video.geoRestriction) &&
                              video.geoRestriction.length
                                ? video.geoRestriction.join(', ')
                                : '—'}
                            </dd>
                          </div>
                          <div>
                            <dt>{labels.notes}</dt>
                            <dd>{video.notes || '—'}</dd>
                          </div>
                        </dl>

                        <div className="videoLibraryVideoLinks">
                          {video.videoUrl && (
                            <a
                              href={video.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink size={15} />
                              {labels.openVideo}
                            </a>
                          )}

                          {video.sourcePageUrl && (
                            <a
                              href={video.sourcePageUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink size={15} />
                              {labels.openSourcePage}
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
