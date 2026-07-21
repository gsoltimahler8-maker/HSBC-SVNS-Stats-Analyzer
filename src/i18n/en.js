const en = {
  appTitle: 'SVNS Stats Analyzer',
  appKicker: 'Unofficial SVNS analytics platform',

  homeDescription:
    'Built for analysis, not live scoring. This platform helps users examine SVNS match statistics with clear season, tournament, gender, team, opponent, and match-count context.',

  unofficialNotice:
    'This is an independent, unofficial analytics tool. It is not affiliated with, endorsed by, sponsored by, or provided by World Rugby, HSBC, Rugby Australia, YouTube, or other rights holders.',

  brandNotice: {
    ariaLabel: 'Unofficial and non-affiliation notice',
    title: 'Independent, unofficial analytics tool',
    body:
      'SVNS Stats Analyzer is an independent, unofficial analytics tool. It is not affiliated with, endorsed by, sponsored by, or provided by World Rugby, HSBC, Rugby Australia, YouTube, or other rights holders. Tournament names, trademarks, match data, videos, and other content remain the property of their respective owners.',
  },

  statsAnalysis: {
    sampleWarning:
      '⚠ SAMPLE DATA / DEMO MODE: The match results and statistics shown here are sample data for screen testing. They are not official results or official statistics.',
    subtitle:
      'A prototype SVNS analytics PWA for keeping season, tournament, gender, and match-level traceability explicit.',
    badge: 'SVNS Analytics',

    dataScope: 'Data Scope',
    matchList: 'Match List',
    matchDetail: 'Match Detail',
    winLossComparison: 'Win/Loss Comparison',
    winLossNote:
      'Compares average values for wins and losses while keeping the analysis scope fixed.',
    candidateDrivers: 'Candidate Drivers',
    candidateDriversNote:
      'Correlation with point difference. Treat these as candidate indicators, not causal factors.',
    candidateDriversSampleSize: 'Sample size',
    candidateDriversSmallSampleWarning:
      'The sample size is small, so these correlations should be treated as reference values. Do not use them as proof of causal win/loss factors; use them as indicators for further review.',
    scatterTitle: 'Clean Breaks vs Point Difference',
    nextImplementation: 'Next Implementation',

    noSampleData: 'No sample data is available for this condition.',
    traceability: 'Traceability',
    internalMatchId: 'Internal Match ID',
    rugbyComAuId: 'Rugby.com.au ID',
    svnsId: 'SVNS ID',
    lastFetched: 'Last fetched',
    sourceProvider: 'Primary source',
statDefinitionVersion: 'Stats definition',

    filters: {
      season: 'Season',
      gender: 'Gender',
      team: 'Team',
      tournament: 'Tournament',
      all: 'All',
      women: 'Women',
      men: 'Men',
    },

    scopeLabels: {
      season: 'Season',
      gender: 'Gender',
      tournament: 'Tournament',
      matches: 'Matches',
    },

    results: {
      win: 'Win',
      loss: 'Loss',
      winsAvg: 'Wins avg',
      lossesAvg: 'Losses avg',
    },

    metrics: {
      pointsFor: 'Points For',
      pointsAgainst: 'Points Against',
      cleanBreaks: 'Clean Breaks',
      defendersBeaten: 'Defenders Beaten',
      turnoversWon: 'Turnovers Won',
      turnoversConceded: 'Turnovers Conceded',
      tackleSuccess: 'Tackle Success',
      possession: 'Possession',
      pointDiff: 'Point Difference',
      tackles: 'Tackles',
      missedTackles: 'Missed Tackles',
    },

    scatter: {
      xAxis: 'Clean Breaks',
      yAxis: 'Point Difference',
      matches: 'Matches',
    },

    dataAvailability: {
      title: 'Data Availability',
      fullStatsEra: 'Full team match stats: 2022-23 season onward',
      note:
        'Rugby.com.au Match Stats is the primary high-detail source candidate, but confirmed SVNS detailed match stats are available from the 2022-23 season onward. Earlier seasons should be treated as Limited Data / Results Only and must not be mixed into detailed-stat comparisons without warning.',
    },

    dataCoverage: {
      label: 'Data coverage',
      sourceLabel: 'Primary stats source',
      unknownSource: 'Unknown',
      levels: {
        full_match_stats: 'Full match stats',
        limited_data: 'Limited data',
        results_only: 'Results only',
        unknown: 'Unknown',
      },
    },

    mixedSeasonWarning:
      'This analysis combines multiple seasons. Be careful about squad changes and tournament-format differences.',

    nextImplementationItems: [
      'Create Supabase tables for seasons / tournaments / matches / match_team_stats / sources.',
      'Add CSV import and validate the workflow with manually prepared data.',
      'Add Rugby.com.au / SVNS data import through a scheduled import service or serverless functions.',
      'Store source HTML/JSON as raw_data so analysis values can be checked against source data.',
    ],
  },

  matchSearch: {
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
  },

  videoLibrary: {
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
  },


  about: {
    homeButton: 'About this app',
    kicker: 'About this project',
    title: 'About SVNS Stats Analyzer',
    subtitle:
      'An independent analytics tool that organizes publicly available SVNS match information, team statistics, and official video for easier search, comparison, and verification.',
    versionLabel: 'Development stage',
    version: 'Version 1.0',
    statusLabel: 'Status',
    status: 'Initial MVP in development',
    purposeTitle: 'Purpose',
    purposeBody:
      'The project is not intended to replace live coverage or official records. Its purpose is to make match-level statistics traceable to their sources and to support verification through both numerical data and match video.',
    featuresTitle: 'Core features',
    features: [
      'Filtered statistics analysis and win/loss comparison',
      'Season, tournament, and opponent-specific statistics trends',
      'Match search and source traceability using Match IDs',
      'A video-centered catalog of official YouTube content',
      'Cross-navigation between match statistics and related video',
      'Japanese and English support on desktop and mobile',
    ],
    analysisPolicyTitle: 'Analysis policy',
    analysisPolicyBody:
      'Statistics are presented with the relevant season, tournament, team, opponent, match count, and data coverage. Correlations and averages are treated as candidate indicators for further review, not as proof of causation.',
    dataPolicyTitle: 'Data operations',
    dataPolicyBody:
      'The current dataset is built through manual review and entry of a limited number of matches from publicly available sources. The project does not reproduce source-site layouts or articles; it organizes factual match values in an original data structure and interface.',
    dataPolicyItems: [
      'Separate REAL DATA from SAMPLE DATA',
      'Declare data granularity through dataCoverageLevel',
      'Record the primary source, retrieval time, and external Match IDs',
      'Run validation when data is added or updated',
    ],
    videoPolicyTitle: 'Video policy',
    videoPolicyBody:
      'Video files are not downloaded, stored, or redistributed. The app uses official YouTube embedding and external links. Playback may become unavailable when a publisher removes a video or applies embedding, login, or regional restrictions.',
    independenceTitle: 'Independence and unofficial status',
    independenceBody:
      'This project is independently developed and maintained as a personal, unofficial project. It is not affiliated with, endorsed by, sponsored by, or provided by World Rugby, HSBC, Rugby Australia, YouTube, or other rights holders. It is currently being developed as a non-commercial initial MVP.',
    contactKicker: 'Contact',
    contactTitle: 'Contact',
    contactBody:
      'Use the following email address to report data errors, broken video links, display issues, or other project-related matters.',
  },

  menu: {
    analysis: {
      label: 'Stats Analysis',
      labelEn: 'Stats Analysis',
      description:
        'Review match-level statistics, win/loss comparison, and candidate statistical drivers.',
    },
    trends: {
      label: 'Stats Trends',
      labelEn: 'Stats Trends',
      description:
        'Review season trends, opponent-specific trends, and past-season comparisons.',
    },
    search: {
      label: 'Match Search',
      labelEn: 'Match Search',
      description:
        'Search matches by season, tournament, team, opponent, and other conditions.',
    },
    videos: {
      label: 'Video Library',
      labelEn: 'Video Library',
      description:
        'Use video as a supporting tool to verify statistical findings.',
    },
    admin: {
      label: 'Data Management',
      labelEn: 'Data Management',
      description:
        'Admin-only data import, review, update history, and tournament status management.',
      adminOnly: 'Admin only',
    },
  },

  navigation: {
    backHome: '← Back to Home',
  },

  comingSoon: {
    notice:
      'This screen will be implemented step by step after Version 0.2. For now, the priority is to keep the existing stats analysis screen stable while adding home-screen navigation.',
    trendsTitle: 'Stats Trends',
    trendsDescription:
      'Core feature for season trends, opponent-specific trends, past-season comparisons, and tournament comparisons.',
    searchTitle: 'Match Search',
    searchDescription:
      'Search matches by Season / Tournament / Gender / Team / Opponent / Stage / Result / Match ID.',
    videosTitle: 'Video Library',
    videosDescription:
      'A supporting feature for verifying statistical findings with match video. The long-term goal is to view stats and video side by side.',
    adminTitle: 'Data Management',
    adminDescription:
      'Admin-only screen for data import, review, update history, and tournament status management.',
  },
};

export default en;
