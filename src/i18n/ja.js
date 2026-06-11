const ja = {
  appTitle: 'SVNS Stats Analyzer',
  appKicker: 'Unofficial SVNS analytics platform',

  homeDescription:
    '速報ではなく分析。SVNSの試合スタッツを、シーズン・大会・男女区分・チーム・対戦相手・試合数を明示して検証するためのプラットフォームです。',

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
      label: 'スタッツ分析',
      labelEn: 'Stats Analysis',
      description: '試合単位のスタッツ、勝敗比較、相関候補を確認します。',
    },
    trends: {
      label: 'スタッツ推移',
      labelEn: 'Stats Trends',
      description: 'シーズン内推移、対戦国別推移、過去シーズン比較を確認します。',
    },
    search: {
      label: '試合検索',
      labelEn: 'Match Search',
      description: 'Season / Tournament / Team / Opponent などで試合を検索します。',
    },
    videos: {
      label: '動画ライブラリ',
      labelEn: 'Video Library',
      description: 'スタッツ分析結果を動画で確認するための補助機能です。',
    },
    admin: {
      label: 'データ管理',
      labelEn: 'Data Management',
      description: '管理者用のデータ取込・確認・更新履歴管理です。',
      adminOnly: '管理者のみ',
    },
  },

  navigation: {
    backHome: '← ホームへ戻る',
  },

  comingSoon: {
    notice:
      'この画面はVersion0.2以降で段階的に実装します。現時点では、既存のスタッツ分析画面を壊さずにホーム画面から遷移できることを優先しています。',
    trendsTitle: 'スタッツ推移',
    trendsDescription:
      'シーズン内推移、対戦国別推移、過去シーズン比較、大会別比較を確認する中核機能です。',
    searchTitle: '試合検索',
    searchDescription:
      'Season / Tournament / Gender / Team / Opponent / Stage / Result / Match ID で試合を検索する画面です。',
    videosTitle: '動画ライブラリ',
    videosDescription:
      'スタッツ分析結果を動画で検証するための補助機能です。将来的にはスタッツを見ながら動画を確認できる構成にします。',
    adminTitle: 'データ管理',
    adminDescription:
      '管理者専用のデータ取込、確認、更新履歴、大会ステータス管理画面です。',
  },
};

export default ja;
