import { useState } from 'react';
import HomeMenu from './components/HomeMenu.jsx';
import StatsAnalysis from './components/StatsAnalysis.jsx';
import StatsTrends from './components/StatsTrends.jsx';
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

function ComingSoon({ title, description, notice, onBackHome, backHomeLabel }) {
  return (
    <div className="app">
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

  const t = dictionaries[language];

  const backHome = () => setScreen('home');

  let content;

  if (screen === 'analysis') {
  content = <StatsAnalysis onBackHome={backHome} t={t} />;
  } else if (screen === 'trends') {
    content = <StatsTrends onBackHome={backHome} t={t} />;
  } else if (screen === 'search') {
    content = (
      <ComingSoon
        title={t.comingSoon.searchTitle}
        description={t.comingSoon.searchDescription}
        notice={t.comingSoon.notice}
        backHomeLabel={t.navigation.backHome}
        onBackHome={backHome}
      />
    );
  } else if (screen === 'videos') {
    content = (
      <ComingSoon
        title={t.comingSoon.videosTitle}
        description={t.comingSoon.videosDescription}
        notice={t.comingSoon.notice}
        backHomeLabel={t.navigation.backHome}
        onBackHome={backHome}
      />
    );
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
    content = <HomeMenu onNavigate={setScreen} t={t} />;
  }

  return (
    <>
      <LanguageToggle language={language} onChangeLanguage={setLanguage} />
      {content}
    </>
  );
}
