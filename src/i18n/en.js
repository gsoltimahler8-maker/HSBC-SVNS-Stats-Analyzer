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
      'Installable PWA with basic offline reopening of loaded content',
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


  sources: {
    utilityNavLabel: 'Project information',
    homeButton: 'Data and video sources',
    kicker: 'Sources and methodology',
    title: 'Data and Video Sources',
    subtitle:
      'This page explains the sources used for match information, team statistics, and official video, together with the role and limitations of each source.',
    currentDataTitle: 'Current registered data',
    metrics: {
      registeredMatches: 'Registered matches',
      realMatches: 'REAL DATA',
      sampleMatches: 'SAMPLE DATA',
      registeredVideos: 'Registered videos',
    },
    scopeTitle: 'Purpose of this page',
    scopeBody:
      'The project distinguishes primary sources from sources used for verification or supplementation. Match-specific URLs, retrieval times, and external Match IDs are available in the traceability section of Match Search.',
    dataSourcesTitle: 'Match information and statistics',
    dataSourcesSubtitle:
      'Public match information is reviewed manually and entered into an original data structure.',
    rugbyComAu: {
      title: 'Rugby.com.au Match Stats',
      role: 'Primary source for detailed team statistics',
      items: [
        'Used to review points, tries, carries, metres, breaks, tackles, turnovers, and other team values',
        'Stores sourceUrl, external Match ID, and retrieval time for each match',
        'Confirmed detailed statistics are mainly used from the 2022-23 season onward',
        'The source page text, images, and interface are not reproduced',
      ],
    },
    svnsMatchCentre: {
      title: 'SVNS / World Rugby Match Centre',
      role: 'Competition identification and result verification',
      items: [
        'Used to verify competition, date, stage, teams, and score',
        'The SVNS Match ID is recorded when it can be confirmed',
        'Used to connect official match records with the primary statistics source',
        'Matches without detailed statistics are classified as results only or limited data',
      ],
    },
    rugbyPass: {
      title: 'RugbyPass',
      role: 'Supplementary verification source',
      items: [
        'Used as a secondary check for results, articles, or match pages',
        'Not treated as a replacement primary source for Rugby.com.au or the official Match Centre',
        'An external ID is recorded only when it can be confirmed',
        'Differences between sources are not merged automatically',
      ],
    },
    sampleData: {
      title: 'SAMPLE DATA',
      role: 'Interface and feature testing only',
      items: [
        'Not treated as official results or official statistics',
        'Visually separated from REAL DATA',
        'Not used as evidence for public analysis or conclusions',
        'Maintained separately for testing after real data is added',
      ],
    },
    videoSourcesTitle: 'Official video',
    videoSourcesSubtitle:
      'Video files are not stored. Official YouTube uploads are referenced through embedding or external links.',
    worldRugbyJapan: {
      title: 'World Rugby Japan channel',
      role: 'Official Japanese highlights and full matches',
      items: [
        'Registers official Japanese-language video',
        'Manages full matches and highlights as separate video records',
        'Records the video URL and channel page',
        'Does not imply that an unpublished match video exists',
      ],
    },
    worldRugbyWomen: {
      title: 'World Rugby Women',
      role: 'Official English-language women’s video',
      items: [
        'Registers official women’s SVNS full matches and highlights',
        'Supplements video not available on the Japanese channel',
        'Records language, video type, and availability separately',
        'Treats different videos for the same match as separate records',
      ],
    },
    youtubeEmbedding: {
      title: 'Official YouTube embedding',
      role: 'In-app playback method',
      items: [
        'Uses the YouTube embedded player',
        'Does not download, copy, or redistribute video files',
        'Keeps an external Open on YouTube link',
        'Displays the provider and video title',
      ],
    },
    videoAvailability: {
      title: 'Availability management',
      role: 'Handling removed or restricted video',
      items: [
        'Distinguishes available, not checked, removed, geo restricted, and other states',
        'Records the last check time through checkedAt',
        'Uses an external link or status notice when embedding is unavailable',
        'Respects the publisher’s availability settings',
      ],
    },
    openChannel: 'Open official channel',
    operationTitle: 'Entry and verification workflow',
    operationBody:
      'Version1.0 does not use automated collection. Public pages are reviewed before data is entered manually.',
    operationSteps: [
      'Identify the target match and official Match ID',
      'Review the result and statistics in the primary source',
      'Verify competition, date, and teams with supplementary sources',
      'Record sourceUrl, fetchedAt, and dataCoverageLevel',
      'Confirm the official uploader and channel before adding video',
      'Run validation and verify the published interface',
    ],
    limitationsTitle: 'Limitations',
    limitations: [
      'Statistics definitions and aggregation methods may differ between providers.',
      'Missing values are not converted to zero; they remain unavailable or uncollected.',
      'Older seasons may contain results only without detailed statistics.',
      'Source pages and videos may be changed or removed by their providers.',
      'The app is not a substitute for official records.',
    ],
  },


  policy: {
    homeButton: 'Terms and privacy',
    kicker: 'Terms, privacy and contact',
    title: 'Terms, Privacy, and Disclaimer',
    subtitle:
      'This page brings together the conditions of use, privacy practices, disclaimer, and contact process for SVNS Stats Analyzer.',
    versionLabel: 'Document version',
    version: '1.0',
    updatedLabel: 'Effective date',
    updated: '26 July 2026',
    noticeTitle: 'Status of these documents',
    noticeBody:
      'These documents describe the current operation of a personal, non-commercial initial MVP. They are not a substitute for jurisdiction-specific legal advice from a qualified professional.',
    tabAriaLabel: 'Policy documents',
    tabs: {
      terms: 'Terms of use',
      privacy: 'Privacy',
      disclaimer: 'Disclaimer',
      contact: 'Contact',
    },
    documents: {
      terms: {
        kicker: 'Terms of use',
        title: 'Terms of Use',
        effectiveDateLabel: 'Effective date',
        effectiveDate: '26 July 2026',
        introduction:
          'Use the app with the understanding that it is an unofficial analytics tool and that official records and each provider’s terms remain controlling.',
        sections: [
          {
            title: '1. Purpose of the service',
            body:
              'The app is an informational and analytical aid that organizes publicly available SVNS match information, team statistics, and links to official video for easier search, comparison, and verification.',
          },
          {
            title: '2. Unofficial status',
            items: [
              'The app is not official, approved, affiliated, sponsored, or provided by World Rugby, HSBC, Rugby Australia, YouTube, or other rights holders.',
              'The app is not a substitute for official match records, rulings, or announcements.',
              'Competition names, organization names, and trademarks are used to identify the subject of analysis or a source.',
            ],
          },
          {
            title: '3. Permitted use',
            items: [
              'Personal match analysis, learning, research, comparison, and understanding of the sport',
              'Personal, non-commercial analysis, learning, research, and comparison through the app interface',
              'Reporting data errors, broken links, or display issues',
            ],
          },
          {
            title: '4. Prohibited conduct',
            items: [
              'Unauthorized access to or interference with the app, a source website, or a video service',
              'Circumvention of access, embedding, regional, or other technical restrictions',
              'Use that falsely suggests official, approved, or affiliated status',
              'Redistribution or commercial use of images, video, logos, text, databases, or other content without the necessary rights',
              'Excessive or automated access that places an unreasonable load on the app or a source service',
              'Conduct that violates law or a third-party service’s terms',
            ],
          },
          {
            title: '5. Changes and suspension',
            body:
              'Features, presentation, registered data, and these terms may change without notice. The project may suspend or remove all or part of the service for maintenance, faults, rights-holder requests, or other operational reasons.',
          },
          {
            title: '6. Third-party services',
            body:
              'GitHub Pages, YouTube, data providers, and video publishers are governed by their own terms and privacy policies.',
          },
        ],
      },
      privacy: {
        kicker: 'Privacy policy',
        title: 'Privacy Policy',
        effectiveDateLabel: 'Effective date',
        effectiveDate: '26 July 2026',
        introduction:
          'This policy distinguishes information collected directly by the project from information that may be processed by GitHub Pages, YouTube, or other third-party services.',
        sections: [
          {
            title: '1. Information collected directly',
            items: [
              'At Version1.0, the app does not provide account registration, login, input forms, or project-controlled analytics.',
              'When you send an email, the project receives your email address, display name, message, and any attachments.',
              'Do not email sensitive information, passwords, private API keys, or another person’s personal information.',
            ],
          },
          {
            title: '2. Purposes of use',
            items: [
              'Responding to inquiries',
              'Investigating data corrections, video-link issues, and display defects',
              'Addressing abuse, spam, or security incidents',
              'Maintaining operational records and improving the project where necessary',
            ],
          },
          {
            title: '3. Retention',
            body:
              'Inquiry information is retained only for as long as reasonably necessary for response, history, security, or legal obligations, and is deleted appropriately when no longer needed.',
          },
          {
            title: '4. Disclosure',
            body:
              'Inquiry information is not sold or provided to third parties except where required by law, necessary to protect rights or safety, or authorized by the individual. Google services are used to process email.',
          },
          {
            title: '5. Hosting and external content',
            items: [
              'The app is hosted on GitHub Pages. GitHub may process IP address, device and browser data, cookies, and other information under its own policies.',
              'Loading or playing an embedded YouTube video sends network information such as IP address and device or browser information to Google, and cookies or similar technologies may be used.',
              'Embeds use youtube-nocookie.com Privacy Enhanced Mode, but this does not guarantee that all communication with third parties is eliminated.',
              'Information handling on external links is governed by the destination provider’s policies.',
            ],
          },
          {
            title: '6. Browser and PWA cache',
            body:
              'Browsers may temporarily cache public files. The app uses a Service Worker and may cache public app files and previously loaded public data on the device. This supports basic offline reopening and update management and is not intended to identify or profile individual behavior.',
          },
          {
            title: '7. Access, correction, and deletion requests',
            body:
              'Questions or requests concerning inquiry emails may be sent to the project contact address. Some requests may be limited by identity-verification needs or applicable law.',
          },
        ],
      },
      disclaimer: {
        kicker: 'Disclaimer',
        title: 'Disclaimer',
        effectiveDateLabel: 'Effective date',
        effectiveDate: '26 July 2026',
        introduction:
          'Statistics, analysis, links, and video may contain omissions, delays, errors, or changes made by a source provider.',
        sections: [
          {
            title: '1. Accuracy and completeness',
            items: [
              'Manual review and entry may result in transcription errors, delays, or missing values.',
              'Definitions and aggregation methods may differ between statistics providers.',
              'Older seasons or selected matches may contain results only or limited statistics.',
              'Check the official record and original source before making an important decision.',
            ],
          },
          {
            title: '2. Analysis results',
            body:
              'Averages, correlations, derived indicators, and visualizations support review of match performance. They do not prove causation or conclusively establish future results, player quality, or team quality.',
          },
          {
            title: '3. Betting and high-risk decisions',
            body:
              'The app does not provide betting, investment, employment, selection, medical, safety, or other high-risk advice. Do not rely on the app alone for such decisions.',
          },
          {
            title: '4. External pages and video',
            items: [
              'Availability of external pages, YouTube video, and embedded playback is not guaranteed.',
              'A publisher or platform may remove, restrict, region-lock, or require login for a video.',
              'The project does not control the content, safety, or continuity of an external service.',
            ],
          },
          {
            title: '5. Loss or damage',
            body:
              'To the maximum extent permitted by applicable law, the project is not responsible for direct or indirect loss arising from use, inability to use, displayed content, or external links.',
          },
          {
            title: '6. Ownership',
            body:
              'Competition names, trademarks, match data, video, images, and other third-party content remain the property of their respective owners. Original code, text, interface, and project-created material belong to the project maintainer unless otherwise stated.',
          },
        ],
      },
      contact: {
        kicker: 'Contact policy',
        title: 'Contact Policy',
        effectiveDateLabel: 'Effective date',
        effectiveDate: '26 July 2026',
        introduction:
          'The project accepts email concerning data corrections, video links, display defects, rights-holder matters, security, and other project-related issues.',
        sections: [
          {
            title: '1. Contact address',
            body: 'svnsstatsanalyzer@gmail.com',
          },
          {
            title: '2. Accepted topics',
            items: [
              'Incorrect match data or inconsistent source attribution',
              'Removed video, broken link, or embedding failure',
              'Translation errors or responsive-display defects',
              'Copyright, trademark, data-use, or other rights-holder matters',
              'Security issues',
              'Inquiries from World Rugby, Rugby Australia, or other relevant organizations',
            ],
          },
          {
            title: '3. Helpful information',
            items: [
              'The relevant screen, Match ID, or Video ID',
              'The date and time when the issue was observed',
              'A description and reproduction steps',
              'The URL of an official page supporting the correction',
              'A screenshot where necessary',
            ],
          },
          {
            title: '4. Important notes',
            items: [
              'Do not send personal data, passwords, API keys, or confidential material.',
              'No automated response or guaranteed response time is provided.',
              'The project may correct, remove, investigate further, or decline action depending on the report.',
              'Spam, threats, and unlawful requests will not be handled.',
            ],
          },
        ],
      },
    },
    thirdPartyTitle: 'Third-party policies',
    thirdPartyBody:
      'Hosting, embedded video, and source pages are subject to the terms and privacy policies of their respective providers.',
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
        label: 'YouTube Terms of Service',
        url: 'https://www.youtube.com/static?template=terms',
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
    contactSummaryTitle: 'Corrections, deletion, and rights-holder inquiries',
    contactSummaryBody:
      'Include the relevant page, Match ID or Video ID, observation time, and supporting source URL.',
  },


  appNavigation: {
    ariaLabel: 'Application navigation',
    footerAriaLabel: 'Project information links',
    projectMenu: 'Project information',
    mainGroup: 'Analysis tools',
    infoGroup: 'Project information',
    contact: 'Contact',
    items: {
      home: 'Home',
      analysis: 'Stats Analysis',
      trends: 'Stats Trends',
      search: 'Match Search',
      videos: 'Video Library',
      about: 'About this app',
      sources: 'Data and video sources',
      policy: 'Terms and privacy',
    },
  },


  pwa: {
    updateTitle: 'An update is available',
    updateBody:
      'A newer version is ready. Updating will reload the page.',
    updateButton: 'Update',
    installTitle: 'Install this app',
    installBody:
      'Add the app to your home screen and launch it without opening the browser first.',
    installButton: 'Install',
    offlineTitle: 'You are offline',
    offlineBody:
      'Previously loaded screens and data remain available. Video and external links may not work.',
    offlineReadyTitle: 'Offline access is ready',
    offlineReadyBody:
      'Previously loaded app content can be reopened when a network connection is unavailable.',
    installedTitle: 'App installed',
    installedBody:
      'SVNS Stats Analyzer can now be launched from your home screen.',
    close: 'Close',
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
