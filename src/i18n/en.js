const en = {
  appTitle: 'SVNS Stats Analyzer',
  appKicker: 'Unofficial SVNS analytics platform',

  homeDescription:
    'Built for analysis, not live scoring. This platform helps users examine SVNS match statistics with clear season, tournament, gender, team, opponent, and match-count context.',

  unofficialNotice:
    'This is an unofficial SVNS statistics and analytics app. Data sources: Rugby.com.au / SVNS Match Centre',

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
