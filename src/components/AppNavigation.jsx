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
      <span>{label}</span>
    </button>
  );
}

export default function AppNavigation({
  screen,
  onNavigate,
  labels,
}) {
  if (screen === 'home') {
    return (
      <details className="homeProjectMenu">
        <summary>{labels.projectMenu}</summary>

        <nav
          className="homeProjectMenuPanel"
          aria-label={labels.infoGroup}
        >
          {INFO_ITEMS.map((item) => (
            <NavigationButton
              key={item.id}
              item={item}
              label={labels.items[item.id]}
              active={false}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </details>
    );
  }

  return (
    <nav className="appNavigation" aria-label={labels.ariaLabel}>
      <div className="appNavigationGroup">
        <span className="appNavigationGroupLabel">
          {labels.mainGroup}
        </span>

        <div className="appNavigationButtons">
          {MAIN_ITEMS.map((item) => (
            <NavigationButton
              key={item.id}
              item={item}
              label={labels.items[item.id]}
              active={screen === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      <div className="appNavigationGroup">
        <span className="appNavigationGroupLabel">
          {labels.infoGroup}
        </span>

        <div className="appNavigationButtons appNavigationInfoButtons">
          {INFO_ITEMS.map((item) => (
            <NavigationButton
              key={item.id}
              item={item}
              label={labels.items[item.id]}
              active={screen === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
