import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Database,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Film,
  RotateCcw,
  Search,
  Trophy,
} from 'lucide-react';
import { matchData } from '../data/loadMatches.js';
import { videoData } from '../data/loadVideos.js';
import {
  getVideoAvailability,
  getYouTubeEmbedUrl,
  sortVideos,
} from '../utils/videoUtils.js';
import {
  buildMatchExportTable,
  createCsvBlob,
  createExportFilename,
  createXlsxBlob,
  downloadBlob,
  printMatchPdf,
} from '../utils/exportUtils.js';

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
    export: {
      title: 'エクスポート',
      description:
        '現在の検索結果をCSV／Excelへ、選択中の試合詳細をPDF印刷用画面へ出力します。',
      csv: 'CSV',
      excel: 'Excel',
      pdf: 'PDF',
      csvScope: '現在の検索結果',
      excelScope: '現在の検索結果',
      pdfScope: '選択中の試合',
      noFilteredMatches: '出力対象となる検索結果がありません。',
      noSelectedMatch: 'PDFへ出力する試合を選択してください。',
      csvComplete: 'CSVファイルを出力しました。',
      excelComplete: 'Excelファイルを出力しました。',
      pdfOpened:
        '印刷画面を開きました。印刷先で「PDFとして保存」を選択してください。',
      pdfBlocked:
        '印刷画面を開けませんでした。ブラウザのポップアップ許可を確認してください。',
      sheetName: '試合検索結果',
      documentLanguage: 'ja',
      locale: 'ja-JP',
      pdfDocumentTitle: 'SVNS Stats Analyzer 試合レポート',
      pdfPrintHelp:
        'ブラウザの印刷画面で「PDFとして保存」を選択するとPDFファイルになります。',
      generatedAt: '作成日時',
      matchInformation: '試合情報',
      pdfDisclaimer:
        '独立した非公式分析ツールによる出力です。公式記録の代替ではありません。重要な判断では原典を確認してください。',
      columns: {
        internalMatchId: '内部Match ID',
        rugbyComAuId: 'Rugby.com.au ID',
        svnsId: 'SVNS ID',
        rugbyPassId: 'RugbyPass ID',
        season: 'シーズン',
        date: '日付',
        gender: '男女区分',
        tournament: '大会',
        stage: 'ステージ',
        team: '分析対象チーム',
        opponent: '対戦相手',
        teamResult: '分析対象側の結果',
        winner: '勝者',
        loser: '敗者',
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
        sourceProvider: '主ソース',
        sourceUrl: 'ソースURL',
        fetchedAt: '最終取得日時',
        dataCoverageLevel: 'データ粒度',
        dataCoverageSource: 'データ粒度ソース',
        statDefinitionVersion: 'スタッツ定義',
        dataType: 'データ種別',
        videoCount: '登録動画数',
      },
    },
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
    export: {
      title: 'Export',
      description:
        'Export the current search results to CSV or Excel, or open the selected match as a print-ready PDF report.',
      csv: 'CSV',
      excel: 'Excel',
      pdf: 'PDF',
      csvScope: 'Current search results',
      excelScope: 'Current search results',
      pdfScope: 'Selected match',
      noFilteredMatches: 'There are no filtered matches to export.',
      noSelectedMatch: 'Select a match before exporting a PDF report.',
      csvComplete: 'The CSV file has been exported.',
      excelComplete: 'The Excel file has been exported.',
      pdfOpened:
        'The print view has opened. Choose Save as PDF in the print destination.',
      pdfBlocked:
        'The print view could not be opened. Check the browser pop-up permission.',
      sheetName: 'Match Search Results',
      documentLanguage: 'en',
      locale: 'en-US',
      pdfDocumentTitle: 'SVNS Stats Analyzer Match Report',
      pdfPrintHelp:
        'Choose Save as PDF in the browser print dialog to create a PDF file.',
      generatedAt: 'Generated at',
      matchInformation: 'Match information',
      pdfDisclaimer:
        'Generated by an independent, unofficial analytics tool. This report is not a substitute for official records. Check the original source for important decisions.',
      columns: {
        internalMatchId: 'Internal Match ID',
        rugbyComAuId: 'Rugby.com.au ID',
        svnsId: 'SVNS ID',
        rugbyPassId: 'RugbyPass ID',
        season: 'Season',
        date: 'Date',
        gender: 'Gender',
        tournament: 'Tournament',
        stage: 'Stage',
        team: 'Analyzed Team',
        opponent: 'Opponent',
        teamResult: 'Team Result',
        winner: 'Winner',
        loser: 'Loser',
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
        sourceProvider: 'Primary Source',
        sourceUrl: 'Source URL',
        fetchedAt: 'Last Fetched',
        dataCoverageLevel: 'Data Coverage',
        dataCoverageSource: 'Coverage Source',
        statDefinitionVersion: 'Stats Definition',
        dataType: 'Data Type',
        videoCount: 'Registered Videos',
      },
    },
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

  const fallback = isJapanese ? ja : en;
  const supplied = t?.matchSearch || {};

  return {
    labels: {
      ...fallback,
      ...supplied,
      filters: {
        ...fallback.filters,
        ...(supplied.filters || {}),
      },
      results: {
        ...fallback.results,
        ...(supplied.results || {}),
      },
      dataTypes: {
        ...fallback.dataTypes,
        ...(supplied.dataTypes || {}),
      },
      metrics: {
        ...fallback.metrics,
        ...(supplied.metrics || {}),
      },
      export: {
        ...fallback.export,
        ...(supplied.export || {}),
        columns: {
          ...fallback.export.columns,
          ...(supplied.export?.columns || {}),
        },
      },
    },
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
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [exportMessage, setExportMessage] = useState('');

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

  const selectedVideos = selectedMatch
    ? videosByMatch.get(selectedMatch.id) || []
    : [];
  const selectedVideoAvailability = getVideoAvailability(selectedVideos);
  const preferredVideo = selectedVideos[0] || null;
  const videoLibraryLabels = t?.videoLibrary || {};

  const playableVideos = useMemo(
    () =>
      selectedVideos.filter((video) =>
        Boolean(getYouTubeEmbedUrl(video))
      ),
    [selectedVideos]
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

  const playerLabels = {
    playerTitle:
      videoLibraryLabels.playerTitle ||
      (isJapanese ? 'YouTubeプレーヤー' : 'YouTube Player'),
    chooseVideo:
      videoLibraryLabels.chooseVideo ||
      (isJapanese ? '再生する動画' : 'Choose video'),
    nowPlaying:
      videoLibraryLabels.nowPlaying ||
      (isJapanese ? '再生中' : 'Now playing'),
    openVideo:
      videoLibraryLabels.openVideo ||
      (isJapanese ? '動画を開く' : 'Open video'),
    embedFallback:
      videoLibraryLabels.embedFallback ||
      (isJapanese
        ? '埋め込み再生できない場合は、YouTubeの外部リンクから視聴してください。'
        : 'If embedded playback is unavailable, use the external YouTube link.'),
    embedUnavailableTitle:
      videoLibraryLabels.embedUnavailableTitle ||
      (isJapanese
        ? 'この動画はアプリ内再生に対応していません。'
        : 'This video cannot be played inside the app.'),
    embedUnavailableBody:
      videoLibraryLabels.embedUnavailableBody ||
      (isJapanese
        ? '外部リンクから動画提供元のページを開いてください。'
        : 'Open the external video page using the link below.'),
    provider:
      videoLibraryLabels.provider ||
      (isJapanese ? '提供元' : 'Provider'),
    videoTypes: videoLibraryLabels.videoTypes || {},
    availability: videoLibraryLabels.availability || {},
    unknown:
      videoLibraryLabels.unknown ||
      (isJapanese ? '未確認' : 'Unknown'),
  };

  const selectedVideoStatusLabel = selectedVideos.length
    ? [
        videoLibraryLabels.availability?.[selectedVideoAvailability] ||
          selectedVideoAvailability,
        isJapanese
          ? `${selectedVideos.length}件`
          : `${selectedVideos.length} ${
              selectedVideos.length === 1 ? 'video' : 'videos'
            }`,
        videoLibraryLabels.videoTypes?.[preferredVideo?.videoType] ||
          preferredVideo?.videoType,
        preferredVideo?.videoProvider,
      ]
        .filter(Boolean)
        .join(' / ')
    : labels.videoNotChecked;

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


  const videoCounts = useMemo(() => {
    const counts = new Map();

    videosByMatch.forEach((videos, matchId) => {
      counts.set(matchId, videos.length);
    });

    return counts;
  }, [videosByMatch]);

  const buildExportTable = () =>
    buildMatchExportTable(filteredMatches, {
      labels,
      coverageLevels,
      videoCounts,
    });

  const handleCsvExport = () => {
    if (!filteredMatches.length) {
      setExportMessage(labels.export.noFilteredMatches);
      return;
    }

    const filename = createExportFilename(
      'svns-match-search',
      'csv'
    );
    downloadBlob(createCsvBlob(buildExportTable()), filename);
    setExportMessage(labels.export.csvComplete);
  };

  const handleExcelExport = () => {
    if (!filteredMatches.length) {
      setExportMessage(labels.export.noFilteredMatches);
      return;
    }

    const filename = createExportFilename(
      'svns-match-search',
      'xlsx'
    );
    downloadBlob(
      createXlsxBlob(buildExportTable(), labels.export.sheetName),
      filename
    );
    setExportMessage(labels.export.excelComplete);
  };

  const handlePdfExport = () => {
    if (!selectedMatch) {
      setExportMessage(labels.export.noSelectedMatch);
      return;
    }

    const opened = printMatchPdf(selectedMatch, {
      labels,
      coverageLabel: getCoverageLabel(
        selectedMatch.dataCoverageLevel
      ),
      videos: selectedVideos,
    });

    setExportMessage(
      opened ? labels.export.pdfOpened : labels.export.pdfBlocked
    );
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

      <section className="panel matchSearchExportPanel">
        <div className="matchSearchExportIntro">
          <h2>
            <Download size={18} />
            {labels.export.title}
          </h2>
          <p>{labels.export.description}</p>
        </div>

        <div className="matchSearchExportActions">
          <button
            type="button"
            className="matchSearchExportButton"
            onClick={handleCsvExport}
            disabled={!filteredMatches.length}
          >
            <Download size={16} />
            <span>
              <b>{labels.export.csv}</b>
              <small>{labels.export.csvScope}</small>
            </span>
          </button>

          <button
            type="button"
            className="matchSearchExportButton"
            onClick={handleExcelExport}
            disabled={!filteredMatches.length}
          >
            <FileSpreadsheet size={16} />
            <span>
              <b>{labels.export.excel}</b>
              <small>{labels.export.excelScope}</small>
            </span>
          </button>

          <button
            type="button"
            className="matchSearchExportButton"
            onClick={handlePdfExport}
            disabled={!selectedMatch}
          >
            <FileText size={16} />
            <span>
              <b>{labels.export.pdf}</b>
              <small>{labels.export.pdfScope}</small>
            </span>
          </button>
        </div>

        {exportMessage && (
          <p className="matchSearchExportMessage" aria-live="polite">
            {exportMessage}
          </p>
        )}
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

              <div className="matchSearchDetailColumns">
                <div className="matchSearchStatsColumn">
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

                <aside className="matchSearchVideoColumn">
                  <div className="matchSearchVideoStatus">
                    <div className="matchSearchVideoStatusText">
                      <Film size={18} />
                      <b>{labels.videoStatus}:</b>
                      <span>{selectedVideoStatusLabel}</span>
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

                  {selectedVideos.length > 0 && (
                    <section className="matchSearchInlinePlayer">
                      <div className="matchSearchInlinePlayerHeader">
                        <div>
                          <span>{playerLabels.playerTitle}</span>
                          <strong>
                            {selectedVideo?.title ||
                              preferredVideo?.title ||
                              playerLabels.videoTypes[
                                selectedVideo?.videoType ||
                                  preferredVideo?.videoType
                              ] ||
                              playerLabels.unknown}
                          </strong>
                        </div>

                        <b
                          className={`videoLibraryBadge videoLibraryAvailability-${
                            selectedVideoAvailability || 'unknown'
                          }`}
                        >
                          {playerLabels.availability[
                            selectedVideoAvailability
                          ] ||
                            selectedVideoAvailability ||
                            playerLabels.unknown}
                        </b>
                      </div>

                      {playableVideos.length > 1 && (
                        <div className="matchSearchInlinePlayerChoices">
                          <span>{playerLabels.chooseVideo}</span>

                          <div
                            className="matchSearchInlinePlayerChoiceButtons"
                            role="tablist"
                            aria-label={playerLabels.chooseVideo}
                          >
                            {playableVideos.map((video) => {
                              const isSelected =
                                video.id === selectedVideo?.id;

                              return (
                                <button
                                  key={video.id}
                                  type="button"
                                  role="tab"
                                  aria-selected={isSelected}
                                  className={`matchSearchInlinePlayerChoice${
                                    isSelected ? ' active' : ''
                                  }`}
                                  onClick={() =>
                                    setSelectedVideoId(video.id)
                                  }
                                >
                                  {playerLabels.videoTypes[video.videoType] ||
                                    video.videoType ||
                                    playerLabels.unknown}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selectedVideo && selectedVideoEmbedUrl ? (
                        <>
                          <div className="matchSearchInlinePlayerFrame">
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

                          <div className="matchSearchInlineNowPlaying">
                            <div>
                              <span>{playerLabels.nowPlaying}</span>
                              <strong>
                                {playerLabels.videoTypes[
                                  selectedVideo.videoType
                                ] ||
                                  selectedVideo.videoType ||
                                  playerLabels.unknown}
                              </strong>
                              <small>
                                {playerLabels.provider}:{' '}
                                {selectedVideo.videoProvider ||
                                  playerLabels.unknown}
                              </small>
                            </div>

                            {selectedVideo.videoUrl && (
                              <a
                                href={selectedVideo.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink size={15} />
                                {playerLabels.openVideo}
                              </a>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="emptyState compact matchSearchInlinePlayerUnavailable">
                          <b>{playerLabels.embedUnavailableTitle}</b>
                          <p>{playerLabels.embedUnavailableBody}</p>

                          {preferredVideo?.videoUrl && (
                            <a
                              href={preferredVideo.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="matchSearchInlineExternalLink"
                            >
                              <ExternalLink size={15} />
                              {playerLabels.openVideo}
                            </a>
                          )}
                        </div>
                      )}

                      <p className="matchSearchInlinePlayerFallback">
                        {playerLabels.embedFallback}
                      </p>
                    </section>
                  )}
                </aside>
              </div>

            </div>
          )}
        </section>
      </div>
    </div>
  );
}
