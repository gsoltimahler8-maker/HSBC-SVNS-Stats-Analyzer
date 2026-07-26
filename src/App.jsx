import { useState } from 'react';
import HomeMenu from './components/HomeMenu.jsx';
import StatsAnalysis from './components/StatsAnalysis.jsx';
import StatsTrends from './components/StatsTrends.jsx';
import MatchSearch from './components/MatchSearch.jsx';
import VideoLibrary from './components/VideoLibrary.jsx';
import AboutPage from './components/AboutPage.jsx';
import SourcesPage from './components/SourcesPage.jsx';
import ja from './i18n/ja.js';
import en from './i18n/en.js';

const dictionaries = {
  ja,
  en,
};

function LanguageToggle({ language, onChangeLanguage }) {
  return (
    <div className="languageToggle" aria-label="Language selector">
      <button
        type="button"
        className={language === 'ja' ? 'languageButton active' : 'languageButton'}
        onClick={() => onChangeLanguage('ja')}
      >
        日本語
      </button>
      <button
        type="button"
        className={language === 'en' ? 'languageButton active' : 'languageButton'}
        onClick={() => onChangeLanguage('en')}
      >
        English
      </button>
    </div>
  );
}


function BrandNotice({ notice }) {
  return (
    <footer className="brandNotice" aria-label={notice.ariaLabel}>
      <strong>{notice.title}</strong>
      <p>{notice.body}</p>
    </footer>
  );
}

function ComingSoon({
  title,
  description,
  notice,
  onBackHome,
  backHomeLabel,
  screenClassName = '',
  backgroundImage,
  mobileBackgroundImage,
}) {
  const appClassName = screenClassName
    ? `app screenBackground ${screenClassName}`
    : 'app';

  const backgroundStyle =
    backgroundImage && mobileBackgroundImage
      ? {
          '--screen-bg-image': `url(${backgroundImage})`,
          '--screen-bg-mobile-image': `url(${mobileBackgroundImage})`,
        }
      : undefined;

  return (
    <div className={appClassName} style={backgroundStyle}>
      <button type="button" className="backHomeButton" onClick={onBackHome}>
        {backHomeLabel}
      </button>

      <section className="panel">
        <h1>{title}</h1>
        <p>{description}</p>
        <p className="note">{notice}</p>
      </section>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [language, setLanguage] = useState('ja');
  const [selectedMatchId, setSelectedMatchId] = useState('');

  const t = dictionaries[language];

  const backHome = () => {
    setSelectedMatchId('');
    setScreen('home');
  };

  const navigateFromHome = (nextScreen) => {
    setSelectedMatchId('');
    setScreen(nextScreen);
  };

  const openVideoLibraryForMatch = (matchId) => {
    setSelectedMatchId(matchId);
    setScreen('videos');
  };

  const openMatchSearchForMatch = (matchId) => {
    setSelectedMatchId(matchId);
    setScreen('search');
  };

  const matchSearchBgImage = `${import.meta.env.BASE_URL}assets/bg-match-search.png`;
  const matchSearchMobileBgImage = `${import.meta.env.BASE_URL}assets/bg-match-search-mobile.png`;
  const videoLibraryBgImage = `${import.meta.env.BASE_URL}assets/bg-video-library.png`;
  const videoLibraryMobileBgImage = `${import.meta.env.BASE_URL}assets/bg-video-library-mobile.png`;

  let content;

  if (screen === 'analysis') {
    content = <StatsAnalysis onBackHome={backHome} t={t} />;
  } else if (screen === 'trends') {
    content = <StatsTrends onBackHome={backHome} t={t} />;
  } else if (screen === 'search') {
    content = (
      <MatchSearch
        onBackHome={backHome}
        onOpenVideoLibrary={openVideoLibraryForMatch}
        initialSelectedMatchId={selectedMatchId}
        t={t}
        backgroundImage={matchSearchBgImage}
        mobileBackgroundImage={matchSearchMobileBgImage}
      />
    );
  } else if (screen === 'videos') {
    content = (
      <VideoLibrary
        onBackHome={backHome}
        onOpenMatchSearch={openMatchSearchForMatch}
        initialSelectedMatchId={selectedMatchId}
        t={t}
        backgroundImage={videoLibraryBgImage}
        mobileBackgroundImage={videoLibraryMobileBgImage}
      />
    );
  } else if (screen === 'about') {
    content = <AboutPage onBackHome={backHome} t={t} />;
  } else if (screen === 'sources') {
    content = <SourcesPage onBackHome={backHome} t={t} />;
  } else if (screen === 'admin') {
    content = (
      <ComingSoon
        title={t.comingSoon.adminTitle}
        description={t.comingSoon.adminDescription}
        notice={t.comingSoon.notice}
        backHomeLabel={t.navigation.backHome}
        onBackHome={backHome}
      />
    );
  } else {
    content = (
      <>
        <HomeMenu onNavigate={navigateFromHome} t={t} />
        <nav className="homeUtilityNav" aria-label={t.sources.utilityNavLabel}>
          <button
            type="button"
            className="homeUtilityButton"
            onClick={() => navigateFromHome('about')}
          >
            {t.about.homeButton}
          </button>
          <button
            type="button"
            className="homeUtilityButton"
            onClick={() => navigateFromHome('sources')}
          >
            {t.sources.homeButton}
          </button>
        </nav>
      </>
    );
  }

  return (
    <>
      <LanguageToggle language={language} onChangeLanguage={setLanguage} />
      {content}
      {screen !== 'home' && <BrandNotice notice={t.brandNotice} />}
    </>
  );
}
