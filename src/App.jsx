import { useEffect, useRef, useState } from 'react';
import HomeMenu from './components/HomeMenu.jsx';
import StatsAnalysis from './components/StatsAnalysis.jsx';
import StatsTrends from './components/StatsTrends.jsx';
import MatchSearch from './components/MatchSearch.jsx';
import VideoLibrary from './components/VideoLibrary.jsx';
import AboutPage from './components/AboutPage.jsx';
import SourcesPage from './components/SourcesPage.jsx';
import PolicyPage from './components/PolicyPage.jsx';
import AppNavigation, {
  getAppNavigationLabels,
} from './components/AppNavigation.jsx';
import PwaStatus from './components/PwaStatus.jsx';
import ja from './i18n/ja.js';
import en from './i18n/en.js';

const dictionaries = {
  ja,
  en,
};


const FALLBACK_ACCESSIBILITY_LABELS = {
  ja: {
    skipToContent: '本文へ移動',
    languageSelector: '表示言語',
    japanese: '日本語',
    english: 'English',
    pageLoaded: 'ページを表示しました',
  },
  en: {
    skipToContent: 'Skip to main content',
    languageSelector: 'Display language',
    japanese: '日本語',
    english: 'English',
    pageLoaded: 'page loaded',
  },
};

const FALLBACK_BRAND_NOTICE = {
  ja: {
    ariaLabel: '非公式・非提携に関する表示',
    title: '独立した非公式分析ツール',
    body:
      'SVNS Stats Analyzerは独立した非公式の分析ツールです。公式、公認、提携、スポンサー提供を受けたものではありません。',
  },
  en: {
    ariaLabel: 'Unofficial and non-affiliation notice',
    title: 'Independent, unofficial analytics tool',
    body:
      'SVNS Stats Analyzer is an independent, unofficial analytics tool. It is not an official, endorsed, affiliated, or sponsored service.',
  },
};

function getAccessibilityLabels(labels, language = 'ja') {
  const fallback =
    FALLBACK_ACCESSIBILITY_LABELS[language] ||
    FALLBACK_ACCESSIBILITY_LABELS.en;

  return {
    ...fallback,
    ...(labels || {}),
  };
}

function getBrandNotice(notice, language = 'ja') {
  return (
    notice ||
    FALLBACK_BRAND_NOTICE[language] ||
    FALLBACK_BRAND_NOTICE.en
  );
}

function LanguageToggle({
  language,
  onChangeLanguage,
  labels,
}) {
  return (
    <div
      className="languageToggle"
      role="group"
      aria-label={labels.languageSelector}
    >
      <button
        type="button"
        className={
          language === 'ja'
            ? 'languageButton active'
            : 'languageButton'
        }
        aria-pressed={language === 'ja'}
        onClick={() => onChangeLanguage('ja')}
      >
        {labels.japanese}
      </button>
      <button
        type="button"
        className={
          language === 'en'
            ? 'languageButton active'
            : 'languageButton'
        }
        aria-pressed={language === 'en'}
        onClick={() => onChangeLanguage('en')}
      >
        {labels.english}
      </button>
    </div>
  );
}


function BrandNotice({
  notice,
  navigation,
  onNavigate,
}) {
  return (
    <footer className="brandNotice" aria-label={notice.ariaLabel}>
      <div className="brandNoticeText">
        <strong>{notice.title}</strong>
        <p>{notice.body}</p>
      </div>

      <nav
        className="brandNoticeLinks"
        aria-label={navigation.footerAriaLabel}
      >
        <button type="button" onClick={() => onNavigate('about')}>
          {navigation.items.about}
        </button>
        <button type="button" onClick={() => onNavigate('sources')}>
          {navigation.items.sources}
        </button>
        <button type="button" onClick={() => onNavigate('policy')}>
          {navigation.items.policy}
        </button>
        <a href="mailto:svnsstatsanalyzer@gmail.com">
          {navigation.contact}
        </a>
      </nav>
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
  const mainContentRef = useRef(null);
  const initialScreenRender = useRef(true);

  const t = dictionaries[language];
  const navigationLabels = getAppNavigationLabels(
    t?.appNavigation,
    language
  );
  const accessibilityLabels = getAccessibilityLabels(
    t?.accessibility,
    language
  );
  const brandNotice = getBrandNotice(
    t?.brandNotice,
    language
  );

  const pageTitle =
    screen === 'admin'
      ? t?.comingSoon?.adminTitle || 'Data Management'
      : navigationLabels.items[screen] || 'SVNS Stats Analyzer';

  useEffect(() => {
    document.documentElement.lang = language;
    document.title =
      screen === 'home'
        ? 'SVNS Stats Analyzer'
        : `${pageTitle} | SVNS Stats Analyzer`;
  }, [language, pageTitle, screen]);

  useEffect(() => {
    if (initialScreenRender.current) {
      initialScreenRender.current = false;
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    mainContentRef.current?.focus();
  }, [screen]);

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
  } else if (screen === 'policy') {
    content = <PolicyPage onBackHome={backHome} t={t} />;
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
    content = <HomeMenu onNavigate={navigateFromHome} t={t} />;
  }

  return (
    <>
      <a className="skipLink" href="#main-content">
        {accessibilityLabels.skipToContent}
      </a>

      <LanguageToggle
        language={language}
        onChangeLanguage={setLanguage}
        labels={accessibilityLabels}
      />

      <AppNavigation
        screen={screen}
        onNavigate={navigateFromHome}
        labels={navigationLabels}
      />

      <p className="srOnly" aria-live="polite">
        {pageTitle} — {accessibilityLabels.pageLoaded}
      </p>

      <div
        id="main-content"
        className="appMainContent"
        tabIndex="-1"
        ref={mainContentRef}
      >
        {content}
      </div>

      {screen !== 'home' && (
        <BrandNotice
          notice={brandNotice}
          navigation={navigationLabels}
          onNavigate={navigateFromHome}
        />
      )}

      <PwaStatus
        language={language}
        labels={t?.pwa}
      />
    </>
  );
}
