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
      'ホーム画面へのインストールと基本的なオフライン再表示',
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


  policy: {
    homeButton: '利用条件・プライバシー',
    kicker: 'Terms, privacy and contact',
    title: '利用条件・プライバシー・免責事項',
    subtitle:
      'SVNS Stats Analyzerの利用条件、個人情報の取扱い、表示内容に関する免責事項、問い合わせ方法をまとめています。',
    versionLabel: '文書版',
    version: '1.0',
    updatedLabel: '制定日',
    updated: '2026年7月26日',
    noticeTitle: '文書の位置づけ',
    noticeBody:
      'この文書は、個人開発・非商用の初期MVPについて、現在の機能と運用を説明するためのものです。法域や利用形態に応じた専門家による法的助言の代替ではありません。',
    tabAriaLabel: 'ポリシー文書',
    tabs: {
      terms: '利用条件',
      privacy: 'プライバシー',
      disclaimer: '免責事項',
      contact: '問い合わせ',
    },
    documents: {
      terms: {
        kicker: 'Terms of use',
        title: '利用条件',
        effectiveDateLabel: '制定日',
        effectiveDate: '2026年7月26日',
        introduction:
          '本アプリを利用する際は、非公式の分析ツールであることと、元の公式記録・各提供元の利用条件を尊重してください。',
        sections: [
          {
            title: '1. サービスの目的',
            body:
              '本アプリは、公開されているSVNSの試合情報、チームスタッツ、公式動画への導線を、検索・比較・検証しやすい形で整理する情報提供・分析支援ツールです。',
          },
          {
            title: '2. 非公式性',
            items: [
              'World Rugby、HSBC、Rugby Australia、YouTubeその他の権利者による公式、公認、提携、スポンサー提供を受けたものではありません。',
              '本アプリの表示は公式試合記録、公式裁定、公式発表の代替ではありません。',
              '大会名、組織名、商標は分析対象または出典を識別するために使用します。',
            ],
          },
          {
            title: '3. 許容される利用',
            items: [
              '個人的な試合分析、学習、研究、比較、競技理解のための閲覧',
              '本アプリの画面を用いた個人的・非商用の分析、学習、研究、比較',
              'データ誤り、リンク切れ、表示不具合の報告',
            ],
          },
          {
            title: '4. 禁止事項',
            items: [
              '本アプリ、提供元サイト、動画サービスへの不正アクセスまたは運用妨害',
              'アクセス制限、埋め込み制限、地域制限その他の技術的措置の回避',
              '公式、公認、提携済みであると誤認させる利用',
              '権利を有しない画像、動画、ロゴ、文章、データベース等の再配布または商用利用',
              '大量・自動アクセスによってサービスまたは提供元へ過度な負荷を与える行為',
              '法令または第三者サービスの利用条件に反する行為',
            ],
          },
          {
            title: '5. 変更・停止',
            body:
              '機能、表示、登録データ、利用条件は予告なく変更される場合があります。保守、障害、権利上の要請その他の理由により、全部または一部を停止・削除する場合があります。',
          },
          {
            title: '6. 第三者サービス',
            body:
              'GitHub Pages、YouTube、各データ・動画提供元などの第三者サービスには、それぞれの利用規約とプライバシーポリシーが適用されます。',
          },
        ],
      },
      privacy: {
        kicker: 'Privacy policy',
        title: 'プライバシーポリシー',
        effectiveDateLabel: '制定日',
        effectiveDate: '2026年7月26日',
        introduction:
          '本アプリ自身が取得する情報と、GitHub PagesやYouTube等の第三者サービスが処理する可能性のある情報を区別して説明します。',
        sections: [
          {
            title: '1. 本アプリが直接取得する情報',
            items: [
              'Version1.0時点では、アカウント登録、ログイン、入力フォーム、独自アクセス解析を設けていません。',
              '問い合わせメールを送信した場合、メールアドレス、表示名、本文、添付情報が取得されます。',
              '機微情報、パスワード、非公開APIキー、第三者の個人情報をメールで送らないでください。',
            ],
          },
          {
            title: '2. 利用目的',
            items: [
              '問い合わせへの回答',
              'データ訂正、動画リンク修正、表示不具合の調査',
              '不正利用、迷惑行為、セキュリティ上の問題への対応',
              '必要な範囲での運用記録と改善',
            ],
          },
          {
            title: '3. 保存期間',
            body:
              '問い合わせ情報は、対応、履歴確認、セキュリティ、法的義務のため合理的に必要な期間に限って保存し、不要になった情報は適切な方法で削除します。',
          },
          {
            title: '4. 第三者への提供',
            body:
              '法令に基づく場合、権利・安全を守るために必要な場合、または本人の同意がある場合を除き、問い合わせ情報を第三者へ販売・提供しません。メールの処理にはGoogleのサービスを利用します。',
          },
          {
            title: '5. ホスティングと外部コンテンツ',
            items: [
              '本アプリはGitHub Pagesで公開され、GitHubがIPアドレス、端末・ブラウザ情報、Cookieその他の情報を自社方針に従って処理する場合があります。',
              'YouTube埋め込み動画を表示・再生すると、ブラウザからGoogleへIPアドレス、端末・ブラウザ情報その他の通信情報が送信され、Cookie等が利用される場合があります。',
              '埋め込みにはプライバシー強化モードのyoutube-nocookie.comを使用しますが、第三者への通信が完全になくなることを保証するものではありません。',
              '外部リンク先での情報取扱いは、各提供元のポリシーに従います。',
            ],
          },
          {
            title: '6. ブラウザ・PWAキャッシュ',
            body:
              'ブラウザは公開ファイルを一時保存する場合があります。本アプリはService Workerを使用し、公開アプリファイルや読み込み済みの公開データを端末へキャッシュする場合があります。これは基本的なオフライン再表示と更新管理のためであり、個人の行動履歴を識別・プロファイリングする目的では使用しません。',
          },
          {
            title: '7. 照会・削除依頼',
            body:
              '問い合わせメールに関する確認、訂正、削除その他の相談は、連絡先メールへ送付してください。本人確認や法令上の制約により、すべての依頼に応じられない場合があります。',
          },
        ],
      },
      disclaimer: {
        kicker: 'Disclaimer',
        title: '免責事項',
        effectiveDateLabel: '制定日',
        effectiveDate: '2026年7月26日',
        introduction:
          '本アプリの数値、分析、リンク、動画には、欠損、遅延、誤り、提供元による変更が含まれる可能性があります。',
        sections: [
          {
            title: '1. 正確性と完全性',
            items: [
              'データは公開情報を手作業で確認・登録するため、転記ミス、更新遅延、欠損が生じる可能性があります。',
              '提供元ごとにスタッツ項目の定義・集計方法が異なる可能性があります。',
              '古いシーズンや一部試合は結果のみ、または限定的なスタッツです。',
              '重要な判断では必ず公式記録と原典を確認してください。',
            ],
          },
          {
            title: '2. 分析結果',
            body:
              '平均値、相関、派生指標、可視化は競技分析を補助するもので、因果関係、将来の試合結果、選手・チームの能力を確定的に示すものではありません。',
          },
          {
            title: '3. 賭博・投資・業務判断',
            body:
              '本アプリは賭博、投資、雇用、選考、医療、安全管理その他の高リスク判断を目的とした助言を提供しません。本アプリだけを根拠にそのような判断を行わないでください。',
          },
          {
            title: '4. 外部ページと動画',
            items: [
              '外部ページ、YouTube動画、埋め込み再生の可用性を保証しません。',
              '動画は投稿者やプラットフォームの判断で削除、非公開、地域制限、ログイン必須になる場合があります。',
              '外部サービスの内容・安全性・継続性について本プロジェクトは管理しません。',
            ],
          },
          {
            title: '5. 損害',
            body:
              '適用法で認められる最大限の範囲で、本アプリの利用、利用不能、表示内容、外部リンクに起因する直接・間接の損害について責任を負いません。',
          },
          {
            title: '6. 権利帰属',
            body:
              '大会名、商標、試合データ、動画、画像その他の第三者コンテンツに関する権利は各権利者に帰属します。本アプリの独自コード、文章、UI、独自制作物については別段の表示がない限りプロジェクト管理者に帰属します。',
          },
        ],
      },
      contact: {
        kicker: 'Contact policy',
        title: '問い合わせ方針',
        effectiveDateLabel: '制定日',
        effectiveDate: '2026年7月26日',
        introduction:
          'データ訂正、動画リンク、表示不具合、権利上の連絡、その他のプロジェクト関連事項をメールで受け付けます。',
        sections: [
          {
            title: '1. 連絡先',
            body: 'svnsstatsanalyzer@gmail.com',
          },
          {
            title: '2. 受け付ける内容',
            items: [
              '試合データの誤りまたは出典の不一致',
              '動画の削除、リンク切れ、埋め込み不具合',
              '日本語・英語の誤記や表示崩れ',
              '著作権、商標、データ利用その他の権利に関する連絡',
              'セキュリティ上の問題',
              'World Rugby、Rugby Australiaその他の関係者からの照会',
            ],
          },
          {
            title: '3. 記載してほしい情報',
            items: [
              '対象画面または試合ID・動画ID',
              '問題を確認した日時',
              '問題の内容と再現手順',
              '根拠となる公式ページのURL',
              '必要に応じて画面のスクリーンショット',
            ],
          },
          {
            title: '4. 注意事項',
            items: [
              '個人情報、パスワード、APIキー、未公開資料を送らないでください。',
              '自動返信や回答期限は設けていません。',
              '内容に応じて修正、削除、追加確認、対応見送りを判断します。',
              '迷惑メール、脅迫、違法な要求には対応しません。',
            ],
          },
        ],
      },
    },
    thirdPartyTitle: '第三者サービスの方針',
    thirdPartyBody:
      'ホスティング、埋め込み動画、出典ページには、それぞれの提供元の利用規約・プライバシーポリシーが適用されます。',
    thirdPartyLinks: [
      {
        label: 'GitHub Privacy Statement',
        url: 'https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement',
      },
      {
        label: 'Google Privacy Policy',
        url: 'https://policies.google.com/privacy',
      },
      {
        label: 'YouTube利用規約',
        url: 'https://www.youtube.com/static?gl=JP&hl=ja&template=terms',
      },
      {
        label: 'World Rugby Terms and Conditions',
        url: 'https://www.world.rugby/terms-and-conditions',
      },
      {
        label: 'Rugby Australia Terms and Conditions',
        url: 'https://australia.rugby/terms-and-conditions',
      },
    ],
    contactSummaryKicker: 'Contact',
    contactSummaryTitle: '訂正・削除・権利に関する連絡',
    contactSummaryBody:
      '対象ページ、試合IDまたは動画ID、確認日時、根拠URLを添えてご連絡ください。',
  },


  appNavigation: {
    ariaLabel: 'アプリ内ナビゲーション',
    footerAriaLabel: 'プロジェクト情報へのリンク',
    projectMenu: 'プロジェクト情報',
    mainGroup: '分析機能',
    infoGroup: 'プロジェクト情報',
    contact: '問い合わせ',
    items: {
      home: 'ホーム',
      analysis: 'スタッツ分析',
      trends: 'スタッツ推移',
      search: '試合検索',
      videos: '動画ライブラリ',
      about: 'このアプリについて',
      sources: 'データ・動画ソース',
      policy: '利用条件・プライバシー',
    },
  },


  pwa: {
    updateTitle: '更新があります',
    updateBody:
      '新しいバージョンを利用できます。更新するとページを再読み込みします。',
    updateButton: '更新する',
    installTitle: 'アプリとして利用できます',
    installBody:
      'ホーム画面へ追加すると、ブラウザを開かずに起動できます。',
    installButton: 'インストール',
    offlineTitle: 'オフラインです',
    offlineBody:
      '読み込み済みの画面とデータを表示しています。一部の動画や外部リンクは利用できません。',
    offlineReadyTitle: 'オフライン利用の準備ができました',
    offlineReadyBody:
      '次回以降、通信がない状態でも読み込み済みのアプリを再表示できます。',
    installedTitle: 'インストールしました',
    installedBody:
      'SVNS Stats Analyzerをホーム画面から起動できます。',
    close: '閉じる',
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
