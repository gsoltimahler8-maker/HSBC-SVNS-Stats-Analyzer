const ja = {
  appTitle: 'SVNS Stats Analyzer',
  appKicker: 'Unofficial SVNS analytics platform',

  homeDescription:
    'SVNSの試合スタッツを、シーズン・大会・男女区分・チーム・対戦相手・試合数を明示して分析・検証するためのプラットフォームです。',

  unofficialNotice:
    '独立した非公式の分析ツールです。World Rugby、HSBC、Rugby Australia、YouTube等による公認・提携・提供を受けていません。',

  brandNotice: {
    ariaLabel: '非公式・非提携に関する表示',
    title: '独立した非公式分析ツール',
    body:
      'SVNS Stats Analyzerは独立した非公式の分析ツールです。World Rugby、HSBC、Rugby Australia、YouTubeその他の権利者による公認・提携・提供を受けたものではありません。大会名、商標、試合データ、動画その他のコンテンツに関する権利は、それぞれの権利者に帰属します。',
  },

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
    sourceProvider: '主ソース',
statDefinitionVersion: 'スタッツ定義',

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
      pointsFor: '得点',
      pointsAgainst: '失点',
      cleanBreaks: 'クリーンブレイク',
      defendersBeaten: 'ディフェンダー突破',
      turnoversWon: 'ターンオーバー獲得',
      turnoversConceded: 'ターンオーバー喪失',
      tackleSuccess: 'タックル成功率',
      possession: 'ポゼッション',
      pointDiff: '点差',
      tackles: 'タックル数',
      missedTackles: 'ミスタックル数',
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
        'Rugby.com.au Match Statsは高粒度の主データソース候補ですが、確認できるSVNS詳細スタッツは2022-23シーズン以降です。それ以前のシーズンはLimited Data / Results Onlyとして扱い、無警告で詳細スタッツ比較に混ぜません。',
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
      '複数シーズンの統合分析です。選手構成・大会形式の差に注意してください。',

    nextImplementationItems: [
      'Supabaseに seasons / tournaments / matches / match_team_stats / sources を作る。',
      'CSV取込を追加して手動データで検証する。',
      'Rugby.com.au / SVNSの取得処理をScheduled Import ServiceまたはServerless Functionsに追加する。',
      '取得元HTML / JSONを raw_data として保存し、分析値と元データを照合可能にする。',
    ],
  },

  matchSearch: {
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
  },

  videoLibrary: {
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
  },


  about: {
    homeButton: 'このアプリについて',
    kicker: 'About this project',
    title: 'SVNS Stats Analyzerについて',
    subtitle:
      'SVNSの公開試合情報、チームスタッツ、公式映像を、検索・比較・検証しやすい形で整理する独立した分析ツールです。',
    versionLabel: '開発段階',
    version: 'Version 1.0',
    statusLabel: '状態',
    status: '初期MVP開発中',
    purposeTitle: '目的',
    purposeBody:
      '速報や公式記録の代替ではなく、試合単位のスタッツを出典まで遡りながら比較し、数値と映像の両面から競技内容を検証できる環境を作ることを目的としています。',
    featuresTitle: '主な機能',
    features: [
      '条件を指定したスタッツ分析と勝敗比較',
      'シーズン内・大会別・対戦相手別のスタッツ推移',
      'Match IDを使った試合検索と出典追跡',
      '公式YouTube映像を動画単位で探せるVideo Library',
      '試合スタッツと対応映像の相互移動',
      '日本語・英語、PC・スマートフォン対応',
    ],
    analysisPolicyTitle: '分析方針',
    analysisPolicyBody:
      '表示する数値は、対象シーズン、大会、チーム、対戦相手、試合数、データ粒度を明示して扱います。相関や平均値は勝敗原因の断定ではなく、次に確認すべき候補指標として提示します。',
    dataPolicyTitle: 'データ運用',
    dataPolicyBody:
      '現在は公開情報を確認し、少数試合を中心に手作業で登録・検証しています。元サイトの画面や文章を複製するのではなく、事実としての試合数値を独自のデータ構造とUIで整理しています。',
    dataPolicyItems: [
      'REAL DATAとSAMPLE DATAを区別',
      'dataCoverageLevelでデータ粒度を明示',
      '主ソース、取得日時、外部Match IDを記録',
      'データ追加時にvalidationを実施',
    ],
    videoPolicyTitle: '動画の扱い',
    videoPolicyBody:
      '動画ファイルは保存・再配布せず、YouTubeが提供する公式埋め込み機能と外部リンクを使用します。投稿者による削除、埋め込み制限、地域制限がある場合は再生できないことがあります。',
    independenceTitle: '独立性と非公式性',
    independenceBody:
      '本プロジェクトは個人によって開発・維持される独立した非公式プロジェクトです。World Rugby、HSBC、Rugby Australia、YouTubeその他の権利者による公認・提携・提供を受けたものではありません。現在は非商用の初期MVPとして開発しています。',
    contactKicker: 'Contact',
    contactTitle: '問い合わせ',
    contactBody:
      'データの誤り、動画リンクの不具合、表示上の問題、その他の連絡は次のメールアドレスで受け付けます。',
  },


  sources: {
    utilityNavLabel: 'プロジェクト情報',
    homeButton: 'データ・動画ソース',
    kicker: 'Sources and methodology',
    title: 'データ・動画ソース',
    subtitle:
      'SVNS Stats Analyzerで使用する試合情報、チームスタッツ、公式動画の出典と、それぞれの役割・制約を説明します。',
    currentDataTitle: '現在の登録状況',
    metrics: {
      registeredMatches: '登録試合',
      realMatches: 'REAL DATA',
      sampleMatches: 'SAMPLE DATA',
      registeredVideos: '登録動画',
    },
    scopeTitle: 'このページの位置づけ',
    scopeBody:
      '出典を列挙するだけでなく、どの情報を主ソースとし、どの情報を照合・補完に使うかを区別します。各試合の具体的なURL、取得日時、外部Match IDはMatch Searchの出典追跡欄で確認できます。',
    dataSourcesTitle: '試合情報・スタッツ',
    dataSourcesSubtitle:
      '公開されている試合情報を手作業で確認し、独自のデータ構造へ登録しています。',
    rugbyComAu: {
      title: 'Rugby.com.au Match Stats',
      role: '詳細チームスタッツの主ソース',
      items: [
        '得点、トライ、キャリー、獲得メートル、ブレイク、タックル、ターンオーバー等を確認',
        '各試合にsourceUrl、外部Match ID、取得日時を保存',
        '確認できた詳細スタッツは主に2022-23シーズン以降を対象',
        '元ページの文章、画像、画面構成は複製しない',
      ],
    },
    svnsMatchCentre: {
      title: 'SVNS / World Rugby Match Centre',
      role: '大会・試合識別と結果照合',
      items: [
        '大会、日付、ステージ、対戦カード、得点の照合',
        'SVNS側Match IDが確認できる場合は外部IDとして記録',
        '公式記録と主スタッツソースの試合を結び付けるために使用',
        '詳細スタッツがない場合は結果のみまたは限定データとして扱う',
      ],
    },
    rugbyPass: {
      title: 'RugbyPass',
      role: '補助的な照合ソース',
      items: [
        '試合結果、記事、試合ページ等を補助確認に使用',
        'Rugby.com.auまたは公式Match Centreの代替主ソースにはしない',
        '対応する外部IDが確認できた場合のみ記録',
        '出典間に差異がある場合は自動的に統合しない',
      ],
    },
    sampleData: {
      title: 'SAMPLE DATA',
      role: 'UI・機能確認専用',
      items: [
        '実際の公式結果・公式スタッツとして扱わない',
        'REAL DATAと画面上で区別',
        '公開分析や結論の根拠に使用しない',
        '実データへ置き換えた後も検証用途として分離管理',
      ],
    },
    videoSourcesTitle: '公式動画',
    videoSourcesSubtitle:
      '動画ファイルは保存せず、公式YouTubeチャンネルが公開する映像を埋め込みまたは外部リンクで参照します。',
    worldRugbyJapan: {
      title: 'ワールドラグビー日本チャンネル',
      role: '日本語の公式ハイライト・フルマッチ',
      items: [
        '日本語タイトル・日本語向け公式映像を登録',
        'Full matchとHighlightsを別動画として管理',
        '動画URLとチャンネルページを記録',
        '公開されていない試合映像を存在するものとして扱わない',
      ],
    },
    worldRugbyWomen: {
      title: 'World Rugby Women',
      role: '英語の女子公式映像',
      items: [
        '女子SVNSの公式フルマッチ・ハイライトを登録',
        '日本語チャンネルにない映像を補完',
        '言語、動画種別、公開状態を個別に記録',
        '同一試合でも動画が異なれば別レコードとして扱う',
      ],
    },
    youtubeEmbedding: {
      title: 'YouTube公式埋め込み',
      role: 'アプリ内再生方法',
      items: [
        'YouTubeの埋め込みプレーヤーを使用',
        '動画をダウンロード、複製、再配布しない',
        'YouTubeで開く外部リンクを残す',
        '提供元と動画タイトルを表示する',
      ],
    },
    videoAvailability: {
      title: '公開状態の管理',
      role: 'リンク切れ・制限への対応',
      items: [
        'available、not checked、removed、geo restricted等を区別',
        'checkedAtで最終確認日時を記録',
        '削除・埋め込み制限時は外部リンクまたは状態表示へ切り替える',
        '動画提供元の公開判断を優先する',
      ],
    },
    openChannel: '公式チャンネルを開く',
    operationTitle: '登録・検証手順',
    operationBody:
      'Version1.0時点では自動収集を行わず、公開ページを確認してから手作業で登録します。',
    operationSteps: [
      '対象試合と公式Match IDを特定',
      '主ソースで試合結果とスタッツを確認',
      '補助ソースで大会・日付・対戦カードを照合',
      'sourceUrl、fetchedAt、dataCoverageLevelを記録',
      '動画は公式投稿とチャンネルを確認して登録',
      'validationと公開画面の動作確認を実施',
    ],
    limitationsTitle: '制約と注意点',
    limitations: [
      '提供元によってスタッツ項目の定義や集計方法が異なる可能性があります。',
      '欠損値は0として補わず、未取得または利用不能として扱います。',
      '古いシーズンは詳細スタッツがなく、結果のみの場合があります。',
      '公開ページや動画は提供元の判断で変更・削除されることがあります。',
      '本アプリの表示は公式記録の代替ではありません。',
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
