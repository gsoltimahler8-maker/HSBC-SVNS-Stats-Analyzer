const ja = {
  appTitle: 'SVNS Stats Analyzer',
  appKicker: 'Unofficial SVNS analytics platform',

  homeDescription:
    'SVNSの試合スタッツを、シーズン・大会・男女区分・チーム・対戦相手・試合数を明示して分析・検証するためのプラットフォームです。',

  unofficialNotice:
    '本アプリは非公式のSVNSスタッツ分析アプリです。データ出典: Rugby.com.au / SVNS Match Centre',

  statsAnalysis: {
    sampleWarning:
      '⚠ SAMPLE DATA / DEMO MODE：現在表示されている試合結果・スタッツは画面確認用の仮データです。実際の公式結果・公式スタッツではありません。',
    subtitle:
      'シーズン・大会・男女区分を明示し、試合単位の元データまで遡るためのSVNS分析PWA試作。',
    badge: 'SVNS Analytics',

    dataScope: '分析条件',
    matchList: '試合一覧',
    matchDetail: '試合詳細',
    winLossComparison: '勝敗比較',
    winLossNote:
      '分析条件を固定した上で、勝利試合と敗戦試合の平均値を比較します。',
        candidateDrivers: '関連候補指標',
    candidateDriversNote:
      '点差との相関係数です。因果ではなく、勝敗・点差と統計的関連が見られる候補指標として扱います。',
    candidateDriversSampleSize: '対象試合数',
    candidateDriversSmallSampleWarning:
      '対象試合数が少ないため、この相関係数は参考値です。勝敗要因の断定には使わず、次に確認すべき候補指標として扱ってください。',
    scatterTitle: 'クリーンブレイク数と点差',
    nextImplementation: '次の実装予定',

    noSampleData: 'この条件のサンプルデータはありません。',
    traceability: '出典追跡',
    internalMatchId: '内部Match ID',
    rugbyComAuId: 'Rugby.com.au ID',
    svnsId: 'SVNS ID',
    lastFetched: '最終取得日時',

    filters: {
      season: 'シーズン',
      gender: '男女区分',
      team: 'チーム',
      tournament: '大会',
      all: 'すべて',
      women: '女子',
      men: '男子',
    },

    scopeLabels: {
      season: 'シーズン',
      gender: '男女区分',
      tournament: '大会',
      matches: '試合数',
    },

    results: {
      win: '勝利',
      loss: '敗戦',
      winsAvg: '勝利平均',
      lossesAvg: '敗戦平均',
    },

    metrics: {
      pointsFor: 'Points For',
      pointsAgainst: 'Points Against',
      cleanBreaks: 'Clean breaks',
      defendersBeaten: 'Defenders beaten',
      turnoversWon: 'Turnovers won',
      turnoversConceded: 'Turnovers conceded',
      tackleSuccess: 'Tackle success',
      possession: 'Possession',
      pointDiff: 'Point diff',
      tackles: 'Tackles',
      missedTackles: 'Missed tackles',
    },

    scatter: {
      xAxis: 'Clean breaks',
      yAxis: 'Point diff',
      matches: 'Matches',
    },

        dataAvailability: {
      title: 'データ利用可能範囲',
      fullStatsEra: '詳細チームスタッツ標準対象：2022-23シーズン以降',
      note:
        'Rugby.com.au Match Statsは高粒度の主データソース候補ですが...',
    },

    dataCoverage: {
      label: 'データ粒度',
      sourceLabel: '主スタッツソース',
      unknownSource: '未確認',
      levels: {
        full_match_stats: '詳細試合スタッツ',
        limited_data: '限定データ',
        results_only: '結果のみ',
        unknown: '未確認',
      },
    },

    mixedSeasonWarning:

    mixedSeasonWarning:
      '複数シーズンの統合分析です。選手構成・大会形式の差に注意してください。',

    nextImplementationItems: [
      'Supabaseに seasons / tournaments / matches / match_team_stats / sources を作る。',
      'CSV取込を追加して手動データで検証する。',
      'Rugby.com.au / SVNSの取得処理をScheduled Import ServiceまたはServerless Functionsに追加する。',
      '取得元HTML / JSONを raw_data として保存し、分析値と元データを照合可能にする。',
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
