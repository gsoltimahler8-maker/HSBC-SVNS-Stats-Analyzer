const en = {
  appTitle: 'SVNS Stats Analyzer',
  appKicker: 'Unofficial SVNS analytics platform',

  homeDescription:
    'Built for analysis, not live scoring. This platform helps users examine SVNS match statistics with clear season, tournament, gender, team, opponent, and match-count context.',

  unofficialNotice:
    'This is an unofficial SVNS statistics and analytics app. Data sources: Rugby.com.au / SVNS Match Centre',

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

    mixedSeasonWarning:
      'This analysis combines multiple seasons. Be careful about squad changes and tournament-format differences.',

    nextImplementationItems: [
      'Create Supabase tables for seasons / tournaments / matches / match_team_stats / sources.',
      'Add CSV import and validate the workflow with manually prepared data.',
      'Add Rugby.com.au / SVNS data import through a scheduled import service or serverless functions.',
      'Store source HTML/JSON as raw_data so analysis values can be checked against source data.',
    ],
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
