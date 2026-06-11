import ja from '../i18n/ja.js';

function getMenuItems(t) {
  return [
    {
      id: 'analysis',
      label: t.menu.analysis.label,
      labelEn: t.menu.analysis.labelEn,
      description: t.menu.analysis.description,
      positionClass: 'homeButtonAnalysis',
    },
    {
      id: 'trends',
      label: t.menu.trends.label,
      labelEn: t.menu.trends.labelEn,
      description: t.menu.trends.description,
      positionClass: 'homeButtonTrends',
    },
    {
      id: 'search',
      label: t.menu.search.label,
      labelEn: t.menu.search.labelEn,
      description: t.menu.search.description,
      positionClass: 'homeButtonSearch',
    },
    {
      id: 'videos',
      label: t.menu.videos.label,
      labelEn: t.menu.videos.labelEn,
      description: t.menu.videos.description,
      positionClass: 'homeButtonVideos',
    },
    {
      id: 'admin',
      label: t.menu.admin.label,
      labelEn: t.menu.admin.labelEn,
      description: t.menu.admin.description,
      adminOnly: t.menu.admin.adminOnly,
      positionClass: 'homeButtonAdmin',
    },
  ];
}

export default function HomeMenu({ onNavigate, t = ja }) {
  const heroImage = `${import.meta.env.BASE_URL}assets/home-hero.png`;
  const menuItems = getMenuItems(t);

  return (
    <div
      className="homeMenu"
      style={{
        backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.06), rgba(2, 6, 23, 0.24)), url(${heroImage})`,
      }}
    >
      <div className="homeOverlay">
        <header className="homeHeader">
          <p className="homeKicker">{t.appKicker}</p>
          <h1>{t.appTitle}</h1>
          <p>{t.homeDescription}</p>
        </header>

        <div className="homeMenuButtons" aria-label="Main menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`homeButton ${item.positionClass}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="homeButtonLabelJa">{item.label}</span>
              <span className="homeButtonLabelEn">{item.labelEn}</span>
              {item.id === 'admin' && (
                <span className="adminOnlyBadge">{item.adminOnly}</span>
              )}
              <small>{item.description}</small>
            </button>
          ))}
        </div>

        <footer className="homeFooter">
          <p>{t.unofficialNotice}</p>
        </footer>
      </div>
    </div>
  );
}
