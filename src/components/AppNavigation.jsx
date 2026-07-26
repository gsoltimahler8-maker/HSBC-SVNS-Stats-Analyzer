import {
  BarChart3,
  Database,
  FileText,
  Home,
  Info,
  Search,
  TrendingUp,
  Video,
} from 'lucide-react';

const MAIN_ITEMS = [
  { id: 'home', icon: Home },
  { id: 'analysis', icon: BarChart3 },
  { id: 'trends', icon: TrendingUp },
  { id: 'search', icon: Search },
  { id: 'videos', icon: Video },
];

const INFO_ITEMS = [
  { id: 'about', icon: Info },
  { id: 'sources', icon: Database },
  { id: 'policy', icon: FileText },
];

const FALLBACK_LABELS = {
  ja: {
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
  en: {
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
};

export function getAppNavigationLabels(labels, language = 'ja') {
  const fallback = FALLBACK_LABELS[language] || FALLBACK_LABELS.en;

  return {
    ...fallback,
    ...(labels || {}),
    items: {
      ...fallback.items,
      ...(labels?.items || {}),
    },
  };
}

function NavigationButton({ item, label, active, onNavigate }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      className={`appNavigationButton${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={() => onNavigate(item.id)}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{label || item.id}</span>
    </button>
  );
}

export default function AppNavigation({
  screen,
  onNavigate,
  labels,
}) {
  const resolvedLabels = getAppNavigationLabels(labels);

  if (screen === 'home') {
    return (
      <details className="homeProjectMenu">
        <summary>{resolvedLabels.projectMenu}</summary>

        <nav
          className="homeProjectMenuPanel"
          aria-label={resolvedLabels.infoGroup}
        >
          {INFO_ITEMS.map((item) => (
            <NavigationButton
              key={item.id}
              item={item}
              label={resolvedLabels.items[item.id]}
              active={false}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </details>
    );
  }

  return (
    <nav
      className="appNavigation"
      aria-label={resolvedLabels.ariaLabel}
    >
      <div className="appNavigationGroup">
        <span className="appNavigationGroupLabel">
          {resolvedLabels.mainGroup}
        </span>

        <div className="appNavigationButtons">
          {MAIN_ITEMS.map((item) => (
            <NavigationButton
              key={item.id}
              item={item}
              label={resolvedLabels.items[item.id]}
              active={screen === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      <div className="appNavigationGroup">
        <span className="appNavigationGroupLabel">
          {resolvedLabels.infoGroup}
        </span>

        <div className="appNavigationButtons appNavigationInfoButtons">
          {INFO_ITEMS.map((item) => (
            <NavigationButton
              key={item.id}
              item={item}
              label={resolvedLabels.items[item.id]}
              active={screen === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
