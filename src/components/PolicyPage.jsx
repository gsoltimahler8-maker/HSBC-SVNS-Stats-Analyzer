import { useState } from 'react';
import {
  ExternalLink,
  FileText,
  Info,
  Lock,
  Mail,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';

const POLICY_SECTIONS = [
  { id: 'terms', icon: FileText },
  { id: 'privacy', icon: Lock },
  { id: 'disclaimer', icon: TriangleAlert },
  { id: 'contact', icon: Mail },
];

function PolicyList({ items }) {
  return (
    <ul className="policyList">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function PolicySubsection({ title, body, items }) {
  return (
    <section className="policySubsection">
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {items?.length > 0 && <PolicyList items={items} />}
    </section>
  );
}

function PolicyDocument({ document }) {
  return (
    <article className="policyDocument">
      <header className="policyDocumentHeader">
        <p>{document.kicker}</p>
        <h2>{document.title}</h2>
        <span>
          {document.effectiveDateLabel}: {document.effectiveDate}
        </span>
      </header>

      <p className="policyLead">{document.introduction}</p>

      <div className="policySubsectionGrid">
        {document.sections.map((section) => (
          <PolicySubsection
            key={section.title}
            title={section.title}
            body={section.body}
            items={section.items}
          />
        ))}
      </div>
    </article>
  );
}

export default function PolicyPage({ onBackHome, t }) {
  const policy = t.policy;
  const [activeSection, setActiveSection] = useState('terms');

  return (
    <main className="app policyScreen">
      <button
        type="button"
        className="backHomeButton"
        onClick={onBackHome}
      >
        {t.navigation.backHome}
      </button>

      <header className="policyHero">
        <p className="eyebrow">{policy.kicker}</p>
        <h1>{policy.title}</h1>
        <p>{policy.subtitle}</p>

        <div className="policyStatusRow">
          <span>{policy.versionLabel}: {policy.version}</span>
          <span>{policy.updatedLabel}: {policy.updated}</span>
        </div>
      </header>

      <aside className="policyImportantNotice">
        <Info size={20} aria-hidden="true" />
        <div>
          <h2>{policy.noticeTitle}</h2>
          <p>{policy.noticeBody}</p>
        </div>
      </aside>

      <nav className="policyTabs" aria-label={policy.tabAriaLabel}>
        {POLICY_SECTIONS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`policyTabButton${
              activeSection === id ? ' active' : ''
            }`}
            onClick={() => setActiveSection(id)}
            aria-pressed={activeSection === id}
          >
            <Icon size={17} aria-hidden="true" />
            {policy.tabs[id]}
          </button>
        ))}
      </nav>

      <PolicyDocument document={policy.documents[activeSection]} />

      <section className="thirdPartyPolicies">
        <div className="thirdPartyPoliciesHeading">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <h2>{policy.thirdPartyTitle}</h2>
            <p>{policy.thirdPartyBody}</p>
          </div>
        </div>

        <div className="thirdPartyPolicyLinks">
          {policy.thirdPartyLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={15} aria-hidden="true" />
              {link.label}
            </a>
          ))}
        </div>
      </section>

      <section className="policyContactSummary">
        <div>
          <p className="eyebrow">{policy.contactSummaryKicker}</p>
          <h2>{policy.contactSummaryTitle}</h2>
          <p>{policy.contactSummaryBody}</p>
        </div>

        <a
          href="mailto:svnsstatsanalyzer@gmail.com"
          className="policyContactLink"
        >
          <Mail size={17} aria-hidden="true" />
          svnsstatsanalyzer@gmail.com
        </a>
      </section>
    </main>
  );
}
