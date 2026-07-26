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
  VIDEO_TYPE_PRIORITY,
  getYouTubeEmbedUrl,
} from '../utils/videoUtils.js';

const ALL = 'all';
const SORT_MATCH_DATE_DESC = 'match_date_desc';
const SORT_PUBLISHED_DESC = 'published_desc';
const SORT_TITLE_ASC = 'title_asc';

function getUniqueOptions(items, selector) {
  return [...new Set(items.map(selector).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b))
  );
}

function getMatchDataType(match) {
  return match?.dataType === 'real' ? 'real' : 'sample';
}

function getWinner(match) {
  if (match?.winner) {
    return match.winner;
  }

  if (
    typeof match?.pointsFor === 'number' &&
    typeof match?.pointsAgainst === 'number'
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
  const result = match?.teamResult || match?.result;

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

  return match?.matchResult || '—';
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

function matchesIdQuery(item, query) {
  const normalizedQuery = String(query || '').trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    item.video.id,
    item.video.externalMatchId,
    item.match.id,
    item.match.external?.rugbyComAu,
    item.match.external?.svns,
    item.match.external?.rugbyPass,
  ].some((value) =>
    String(value || '').toLowerCase().includes(normalizedQuery)
  );
}

function compareCatalogItems(a, b, sortOrder) {
  if (sortOrder === SORT_TITLE_ASC) {
    return String(a.video.title || '').localeCompare(
      String(b.video.title || '')
    );
  }

  if (sortOrder === SORT_PUBLISHED_DESC) {
    const aPublished =
      a.video.publishedAt || a.video.checkedAt || a.match.date || '';
    const bPublished =
      b.video.publishedAt || b.video.checkedAt || b.match.date || '';
    const publishedCompare = String(bPublished).localeCompare(
      String(aPublished)
    );

    if (publishedCompare !== 0) {
      return publishedCompare;
    }
  }

  const dateCompare = String(b.match.date || '').localeCompare(
    String(a.match.date || '')
  );

  if (dateCompare !== 0) {
    return dateCompare;
  }

  const aPriority = VIDEO_TYPE_PRIORITY[a.video.videoType] || 99;
  const bPriority = VIDEO_TYPE_PRIORITY[b.video.videoType] || 99;

  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }

  return String(a.video.id || '').localeCompare(String(b.video.id || ''));
}

function findInitialVideoId(matchId) {
  if (!matchId) {
    return '';
  }

  return [...videoData]
    .filter((video) => video.matchId === matchId)
    .sort((a, b) => {
      const aPriority = VIDEO_TYPE_PRIORITY[a.videoType] || 99;
      const bPriority = VIDEO_TYPE_PRIORITY[b.videoType] || 99;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return String(a.id || '').localeCompare(String(b.id || ''));
    })[0]?.id || '';
}

function getDefaultLabels(t) {
  const isJapanese = t?.navigation?.backHome?.includes('ホーム');

  const ja = {
    title: '公式映像カタログ',
    subtitle:
      '登録済みの公式フルマッチ、ハイライト、関連映像を動画単位で検索・再生します。',
    filtersTitle: '動画検索',
    resultsTitle: '動画一覧',
    detailTitle: '選択中の動画',
    all: 'すべて',
    reset: '条件をリセット',
    resultCount: '表示件数',
    videos: '動画',
    filters: {
      season: 'シーズン',
      gender: '男女区分',
      team: 'チーム',
      opponent: '対戦相手',
      tournament: '大会',
      videoType: '動画種別',
      language: '言語',
      provider: '提供元',
      availability: '公開状態',
      matchId: 'Match ID',
      sortOrder: '並び順',
    },
    sortOptions: {
      match_date_desc: '試合日の新しい順',
      published_desc: '動画確認・公開日の新しい順',
      title_asc: '動画タイトル順',
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
    languageNames: {
      ja: '日本語',
      en: '英語',
    },
    noResultsTitle: 'この条件に一致する動画はありません。',
    noResultsBody: '動画種別、言語、提供元などの条件を変更してください。',
    noSelection: '動画カードを選択すると、再生画面と詳細が表示されます。',
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
    openVideo: 'YouTubeで開く',
    openSourcePage: '掲載元ページを開く',
    yes: '可',
    no: '不可',
    unknown: '未確認',
    openInMatchSearch: '試合検索でスタッツ詳細を見る',
    playerTitle: 'YouTubeプレーヤー',
    nowPlaying: '再生中',
    embedFallback:
      '埋め込み再生できない場合は「YouTubeで開く」から視聴してください。',
    embedUnavailableTitle: 'この動画はアプリ内再生に対応していません。',
    embedUnavailableBody:
      '外部リンクから動画提供元のページを開いてください。',
    matchResult: '試合結果',
  };

  const en = {
    title: 'Official Video Catalog',
    subtitle:
      'Search and play registered official full matches, highlights, and related videos as individual video records.',
    filtersTitle: 'Video Search',
    resultsTitle: 'Video List',
    detailTitle: 'Selected Video',
    all: 'All',
    reset: 'Reset Filters',
    resultCount: 'Showing',
    videos: 'videos',
    filters: {
      season: 'Season',
      gender: 'Gender',
      team: 'Team',
      opponent: 'Opponent',
      tournament: 'Tournament',
      videoType: 'Video Type',
      language: 'Language',
      provider: 'Provider',
      availability: 'Availability',
      matchId: 'Match ID',
      sortOrder: 'Sort Order',
    },
    sortOptions: {
      match_date_desc: 'Newest match date',
      published_desc: 'Newest published or checked',
      title_asc: 'Video title',
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
    languageNames: {
      ja: 'Japanese',
      en: 'English',
    },
    noResultsTitle: 'No videos were found for these filters.',
    noResultsBody: 'Try changing video type, language, provider, or match filters.',
    noSelection: 'Select a video card to view playback and details.',
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
    openVideo: 'Open on YouTube',
    openSourcePage: 'Open source page',
    yes: 'Allowed',
    no: 'Not allowed',
    unknown: 'Unknown',
    openInMatchSearch: 'View stats detail in Match Search',
    playerTitle: 'YouTube Player',
    nowPlaying: 'Now playing',
    embedFallback:
      'If embedded playback is unavailable, use “Open on YouTube”.',
    embedUnavailableTitle: 'This video cannot be played inside the app.',
    embedUnavailableBody:
      'Open the external video page using the link below.',
    matchResult: 'Match result',
  };

  return {
    labels: t?.videoLibrary || (isJapanese ? ja : en),
    isJapanese,
  };
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
  const [videoType, setVideoType] = useState(ALL);
  const [language, setLanguage] = useState(ALL);
  const [provider, setProvider] = useState(ALL);
  const [availability, setAvailability] = useState(ALL);
  const [matchIdQuery, setMatchIdQuery] = useState('');
  const [sortOrder, setSortOrder] = useState(SORT_MATCH_DATE_DESC);
  const [selectedVideoId, setSelectedVideoId] = useState(() =>
    findInitialVideoId(initialSelectedMatchId)
  );

  const matchById = useMemo(
    () => new Map(matchData.map((match) => [match.id, match])),
    []
  );

  const catalogItems = useMemo(
    () =>
      videoData
        .map((video) => ({
          video,
          match: matchById.get(video.matchId),
        }))
        .filter((item) => item.match),
    [matchById]
  );

  const seasons = useMemo(
    () =>
      getUniqueOptions(catalogItems, (item) => item.match.season).sort(
        (a, b) => String(b).localeCompare(String(a))
      ),
    [catalogItems]
  );
  const genders = useMemo(
    () => getUniqueOptions(catalogItems, (item) => item.match.gender),
    [catalogItems]
  );
  const teams = useMemo(
    () => getUniqueOptions(catalogItems, (item) => item.match.team),
    [catalogItems]
  );
  const opponents = useMemo(
    () => getUniqueOptions(catalogItems, (item) => item.match.opponent),
    [catalogItems]
  );
  const tournaments = useMemo(
    () => getUniqueOptions(catalogItems, (item) => item.match.tournament),
    [catalogItems]
  );
  const videoTypes = useMemo(
    () => getUniqueOptions(catalogItems, (item) => item.video.videoType),
    [catalogItems]
  );
  const languages = useMemo(
    () => getUniqueOptions(catalogItems, (item) => item.video.language),
    [catalogItems]
  );
  const providers = useMemo(
    () => getUniqueOptions(catalogItems, (item) => item.video.videoProvider),
    [catalogItems]
  );
  const availabilities = useMemo(
    () => getUniqueOptions(catalogItems, (item) => item.video.availability),
    [catalogItems]
  );

  const filteredItems = useMemo(
    () =>
      catalogItems
        .filter((item) => season === ALL || item.match.season === season)
        .filter((item) => gender === ALL || item.match.gender === gender)
        .filter((item) => team === ALL || item.match.team === team)
        .filter(
          (item) => opponent === ALL || item.match.opponent === opponent
        )
        .filter(
          (item) =>
            tournament === ALL || item.match.tournament === tournament
        )
        .filter(
          (item) =>
            videoType === ALL || item.video.videoType === videoType
        )
        .filter(
          (item) => language === ALL || item.video.language === language
        )
        .filter(
          (item) =>
            provider === ALL || item.video.videoProvider === provider
        )
        .filter(
          (item) =>
            availability === ALL ||
            item.video.availability === availability
        )
        .filter((item) => matchesIdQuery(item, matchIdQuery))
        .sort((a, b) => compareCatalogItems(a, b, sortOrder)),
    [
      catalogItems,
      season,
      gender,
      team,
      opponent,
      tournament,
      videoType,
      language,
      provider,
      availability,
      matchIdQuery,
      sortOrder,
    ]
  );

  useEffect(() => {
    if (!filteredItems.length) {
      setSelectedVideoId('');
      return;
    }

    if (!filteredItems.some((item) => item.video.id === selectedVideoId)) {
      const initialItem = initialSelectedMatchId
        ? filteredItems.find(
            (item) => item.video.matchId === initialSelectedMatchId
          )
        : null;

      setSelectedVideoId(
        initialItem?.video.id || filteredItems[0].video.id
      );
    }
  }, [filteredItems, initialSelectedMatchId, selectedVideoId]);

  const selectedItem =
    filteredItems.find((item) => item.video.id === selectedVideoId) ||
    null;
  const selectedVideo = selectedItem?.video || null;
  const selectedMatch = selectedItem?.match || null;
  const selectedVideoEmbedUrl = getYouTubeEmbedUrl(selectedVideo);

  const resetFilters = () => {
    setSeason(ALL);
    setGender(ALL);
    setTeam(ALL);
    setOpponent(ALL);
    setTournament(ALL);
    setVideoType(ALL);
    setLanguage(ALL);
    setProvider(ALL);
    setAvailability(ALL);
    setMatchIdQuery('');
    setSortOrder(SORT_MATCH_DATE_DESC);
  };

  const languageLabel = (code) =>
    labels.languageNames?.[code] || code || labels.unknown;

  const videoTypeLabel = (type) =>
    labels.videoTypes?.[type] || type || labels.unknown;

  const availabilityLabel = (status) =>
    labels.availability?.[status] || status || labels.unknown;

  const backgroundStyle =
    backgroundImage && mobileBackgroundImage
      ? {
          '--screen-bg-image': `url(${backgroundImage})`,
          '--screen-bg-mobile-image': `url(${mobileBackgroundImage})`,
        }
      : undefined;

  return (
    <div
      className="app screenBackground videoLibraryScreen videoCatalogScreen"
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
            {filteredItems.length} / {videoData.length} {labels.videos}
          </span>
        </div>
      </section>

      <section className="panel scope videoCatalogFilters">
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
            {labels.filters.videoType}
            <select
              value={videoType}
              onChange={(event) => setVideoType(event.target.value)}
            >
              <option value={ALL}>{labels.all}</option>
              {videoTypes.map((option) => (
                <option key={option} value={option}>
                  {videoTypeLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.language}
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value={ALL}>{labels.all}</option>
              {languages.map((option) => (
                <option key={option} value={option}>
                  {languageLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.provider}
            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            >
              <option value={ALL}>{labels.all}</option>
              {providers.map((option) => (
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
              {availabilities.map((option) => (
                <option key={option} value={option}>
                  {availabilityLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.sortOrder}
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              {Object.entries(labels.sortOptions).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label>
            {labels.filters.matchId}
            <input
              className="videoLibraryTextInput"
              type="search"
              value={matchIdQuery}
              onChange={(event) => setMatchIdQuery(event.target.value)}
              placeholder="949550 / R-202526 / V-949550"
            />
          </label>
        </div>

        <div className="videoLibraryToolbar">
          <p className="note" role="status" aria-live="polite">
            {labels.resultCount}: {filteredItems.length} {labels.videos}
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

      <div className="grid videoCatalogLayout">
        <section className="panel videoCatalogResults">
          <h2>
            <Film size={18} />
            {labels.resultsTitle}
          </h2>

          {!filteredItems.length ? (
            <div className="emptyState">
              <b>{labels.noResultsTitle}</b>
              <p>{labels.noResultsBody}</p>
            </div>
          ) : (
            <div className="videoCatalogCards">
              {filteredItems.map(({ video, match }) => {
                const isActive = video.id === selectedVideoId;
                const currentDataType = getMatchDataType(match);

                return (
                  <button
                    key={video.id}
                    type="button"
                    className={`videoCatalogCard${
                      isActive ? ' active' : ''
                    }`}
                    aria-pressed={isActive}
                    aria-label={`${video.title || videoTypeLabel(
                      video.videoType
                    )}, ${match.team} ${match.pointsFor}-${
                      match.pointsAgainst
                    } ${match.opponent}`}
                    onClick={() => setSelectedVideoId(video.id)}
                  >
                    <span className="videoCatalogCardTitle">
                      {video.title || videoTypeLabel(video.videoType)}
                    </span>

                    <strong className="videoCatalogCardMatch">
                      {match.team} {match.pointsFor}-{match.pointsAgainst}{' '}
                      {match.opponent}
                    </strong>

                    <span className="videoCatalogCardMeta">
                      {match.date} / {match.tournament} / {match.stage}
                    </span>

                    <span className="videoCatalogBadgeRow">
                      <b className="videoLibraryBadge">
                        {videoTypeLabel(video.videoType)}
                      </b>
                      <b className="videoLibraryBadge">
                        {languageLabel(video.language)}
                      </b>
                      <b className="videoLibraryBadge">
                        {video.videoProvider || labels.unknown}
                      </b>
                      <b
                        className={`videoLibraryBadge videoLibraryAvailability-${
                          video.availability || 'unknown'
                        }`}
                      >
                        {availabilityLabel(video.availability)}
                      </b>
                      <b
                        className={`videoLibraryBadge videoLibraryDataType-${currentDataType}`}
                      >
                        {labels.dataTypes[currentDataType]}
                      </b>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="panel videoCatalogDetail">
          <h2>
            <PlayCircle size={18} />
            {labels.detailTitle}
          </h2>

          {!selectedItem ? (
            <div className="emptyState compact">
              <p>{labels.noSelection}</p>
            </div>
          ) : (
            <div className="detail">
              <div className="videoCatalogDetailHeader">
                <div>
                  <span>{videoTypeLabel(selectedVideo.videoType)}</span>
                  <h3>
                    {selectedVideo.title ||
                      videoTypeLabel(selectedVideo.videoType)}
                  </h3>
                </div>

                <b
                  className={`videoLibraryBadge videoLibraryAvailability-${
                    selectedVideo.availability || 'unknown'
                  }`}
                >
                  {availabilityLabel(selectedVideo.availability)}
                </b>
              </div>

              <div className="scoreLine">
                <b>
                  {selectedMatch.team} {selectedMatch.pointsFor}-
                  {selectedMatch.pointsAgainst} {selectedMatch.opponent}
                </b>
                <span>
                  {labels.matchResult}:{' '}
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

              {selectedVideo && selectedVideoEmbedUrl ? (
                <section className="videoLibraryPlayer">
                  <div className="videoLibraryPlayerHeader">
                    <div>
                      <span>{labels.playerTitle}</span>
                      <strong>
                        {selectedVideo.title ||
                          videoTypeLabel(selectedVideo.videoType)}
                      </strong>
                    </div>

                    <b className="videoLibraryBadge">
                      {languageLabel(selectedVideo.language)}
                    </b>
                  </div>

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
                        {videoTypeLabel(selectedVideo.videoType)}
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
              ) : (
                <div className="emptyState compact videoLibraryEmbedUnavailable">
                  <b>{labels.embedUnavailableTitle}</b>
                  <p>{labels.embedUnavailableBody}</p>

                  {selectedVideo.videoUrl && (
                    <a
                      href={selectedVideo.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="videoCatalogExternalLink"
                    >
                      <ExternalLink size={15} />
                      {labels.openVideo}
                    </a>
                  )}
                </div>
              )}

              <dl className="videoLibraryVideoMeta videoCatalogMetadata">
                <div>
                  <dt>{labels.videoType}</dt>
                  <dd>{videoTypeLabel(selectedVideo.videoType)}</dd>
                </div>
                <div>
                  <dt>{labels.provider}</dt>
                  <dd>{selectedVideo.videoProvider || '—'}</dd>
                </div>
                <div>
                  <dt>{labels.language}</dt>
                  <dd>{languageLabel(selectedVideo.language)}</dd>
                </div>
                <div>
                  <dt>{labels.availabilityLabel}</dt>
                  <dd>{availabilityLabel(selectedVideo.availability)}</dd>
                </div>
                <div>
                  <dt>{labels.checkedAt}</dt>
                  <dd>{selectedVideo.checkedAt || '—'}</dd>
                </div>
                <div>
                  <dt>{labels.publishedAt}</dt>
                  <dd>{selectedVideo.publishedAt || '—'}</dd>
                </div>
                <div>
                  <dt>{labels.duration}</dt>
                  <dd>{formatDuration(selectedVideo.durationSeconds)}</dd>
                </div>
                <div>
                  <dt>{labels.embedAllowed}</dt>
                  <dd>
                    {selectedVideo.embedAllowed === true
                      ? labels.yes
                      : selectedVideo.embedAllowed === false
                        ? labels.no
                        : labels.unknown}
                  </dd>
                </div>
                <div>
                  <dt>{labels.geoRestriction}</dt>
                  <dd>
                    {Array.isArray(selectedVideo.geoRestriction) &&
                    selectedVideo.geoRestriction.length
                      ? selectedVideo.geoRestriction.join(', ')
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>{labels.notes}</dt>
                  <dd>{selectedVideo.notes || '—'}</dd>
                </div>
              </dl>

              <div className="videoLibraryVideoLinks">
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

                {selectedVideo.sourcePageUrl && (
                  <a
                    href={selectedVideo.sourcePageUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={15} />
                    {labels.openSourcePage}
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
