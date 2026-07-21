import {
  BarChart3,
  Database,
  Info,
  Mail,
  Search,
  ShieldCheck,
  Video,
} from 'lucide-react';

function AboutSection({ icon: Icon, title, children }) {
  return (
    <section className="aboutSection">
      <div className="aboutSectionHeading">
        <Icon size={19} aria-hidden="true" />
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function AboutPage({ onBackHome, t }) {
  const about = t.about;

  return (
    <main className="app aboutScreen">
      <button
        type="button"
        className="backHomeButton"
        onClick={onBackHome}
      >
        {t.navigation.backHome}
      </button>

      <header className="aboutHero">
        <p className="eyebrow">{about.kicker}</p>
        <h1>{about.title}</h1>
        <p>{about.subtitle}</p>
        <div className="aboutStatusRow">
          <span>{about.versionLabel}: {about.version}</span>
          <span>{about.statusLabel}: {about.status}</span>
        </div>
      </header>

      <div className="aboutGrid">
        <AboutSection icon={Info} title={about.purposeTitle}>
          <p>{about.purposeBody}</p>
        </AboutSection>

        <AboutSection icon={BarChart3} title={about.featuresTitle}>
          <ul className="aboutList">
            {about.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </AboutSection>

        <AboutSection icon={Search} title={about.analysisPolicyTitle}>
          <p>{about.analysisPolicyBody}</p>
        </AboutSection>

        <AboutSection icon={Database} title={about.dataPolicyTitle}>
          <p>{about.dataPolicyBody}</p>
          <ul className="aboutList compact">
            {about.dataPolicyItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </AboutSection>

        <AboutSection icon={Video} title={about.videoPolicyTitle}>
          <p>{about.videoPolicyBody}</p>
        </AboutSection>

        <AboutSection icon={ShieldCheck} title={about.independenceTitle}>
          <p>{about.independenceBody}</p>
        </AboutSection>
      </div>

      <section className="aboutContact">
        <div>
          <p className="eyebrow">{about.contactKicker}</p>
          <h2>{about.contactTitle}</h2>
          <p>{about.contactBody}</p>
        </div>

        <a
          className="aboutContactLink"
          href="mailto:svnsstatsanalyzer@gmail.com"
        >
          <Mail size={17} aria-hidden="true" />
          svnsstatsanalyzer@gmail.com
        </a>
      </section>
    </main>
  );
}
