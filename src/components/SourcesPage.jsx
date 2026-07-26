import {
  CheckCircle2,
  Database,
  ExternalLink,
  FileSearch,
  Info,
  ShieldCheck,
  TriangleAlert,
  Video,
} from 'lucide-react';
import { matchData } from '../data/loadMatches.js';
import { videoData } from '../data/loadVideos.js';

const WORLD_RUGBY_JAPAN_CHANNEL =
  'https://www.youtube.com/channel/UCINNL-f2HyUQP1y_UG682hQ';
const WORLD_RUGBY_WOMEN_CHANNEL =
  'https://www.youtube.com/channel/UCrVdmT0b9msRjf98EsL575Q';

function SourceCard({ icon: Icon, title, role, items, link, linkLabel }) {
  return (
    <article className="sourcesCard">
      <div className="sourcesCardHeading">
        <Icon size={19} aria-hidden="true" />
        <div>
          <h2>{title}</h2>
          <p>{role}</p>
        </div>
      </div>

      <ul className="sourcesList">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {link && (
        <a
          className="sourcesExternalLink"
          href={link}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={15} aria-hidden="true" />
          {linkLabel}
        </a>
      )}
    </article>
  );
}

function SourceMetric({ label, value }) {
  return (
    <div className="sourcesMetric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function SourcesPage({ onBackHome, t }) {
  const sources = t.sources;

  const realMatches = matchData.filter(
    (match) =>
      match.dataType === 'real' ||
      match.id?.startsWith('R-') ||
      match.sourceProvider === 'Rugby.com.au'
  ).length;
  const sampleMatches = Math.max(matchData.length - realMatches, 0);

  const japaneseChannelVideos = videoData.filter(
    (video) => video.sourcePageUrl === WORLD_RUGBY_JAPAN_CHANNEL
  ).length;
  const womenChannelVideos = videoData.filter(
    (video) => video.sourcePageUrl === WORLD_RUGBY_WOMEN_CHANNEL
  ).length;

  return (
    <main className="app sourcesScreen">
      <button
        type="button"
        className="backHomeButton"
        onClick={onBackHome}
      >
        {t.navigation.backHome}
      </button>

      <header className="sourcesHero">
        <p className="eyebrow">{sources.kicker}</p>
        <h1>{sources.title}</h1>
        <p>{sources.subtitle}</p>

        <div className="sourcesMetrics" aria-label={sources.currentDataTitle}>
          <SourceMetric
            label={sources.metrics.registeredMatches}
            value={matchData.length}
          />
          <SourceMetric
            label={sources.metrics.realMatches}
            value={realMatches}
          />
          <SourceMetric
            label={sources.metrics.sampleMatches}
            value={sampleMatches}
          />
          <SourceMetric
            label={sources.metrics.registeredVideos}
            value={videoData.length}
          />
        </div>
      </header>

      <section className="sourcesIntro">
        <Info size={20} aria-hidden="true" />
        <div>
          <h2>{sources.scopeTitle}</h2>
          <p>{sources.scopeBody}</p>
        </div>
      </section>

      <section className="sourcesSection">
        <div className="sourcesSectionHeading">
          <Database size={20} aria-hidden="true" />
          <div>
            <h2>{sources.dataSourcesTitle}</h2>
            <p>{sources.dataSourcesSubtitle}</p>
          </div>
        </div>

        <div className="sourcesGrid">
          <SourceCard
            icon={FileSearch}
            title={sources.rugbyComAu.title}
            role={sources.rugbyComAu.role}
            items={sources.rugbyComAu.items}
          />

          <SourceCard
            icon={CheckCircle2}
            title={sources.svnsMatchCentre.title}
            role={sources.svnsMatchCentre.role}
            items={sources.svnsMatchCentre.items}
          />

          <SourceCard
            icon={ShieldCheck}
            title={sources.rugbyPass.title}
            role={sources.rugbyPass.role}
            items={sources.rugbyPass.items}
          />

          <SourceCard
            icon={TriangleAlert}
            title={sources.sampleData.title}
            role={sources.sampleData.role}
            items={sources.sampleData.items}
          />
        </div>
      </section>

      <section className="sourcesSection">
        <div className="sourcesSectionHeading">
          <Video size={20} aria-hidden="true" />
          <div>
            <h2>{sources.videoSourcesTitle}</h2>
            <p>{sources.videoSourcesSubtitle}</p>
          </div>
        </div>

        <div className="sourcesGrid">
          <SourceCard
            icon={Video}
            title={sources.worldRugbyJapan.title}
            role={`${sources.worldRugbyJapan.role} (${japaneseChannelVideos})`}
            items={sources.worldRugbyJapan.items}
            link={WORLD_RUGBY_JAPAN_CHANNEL}
            linkLabel={sources.openChannel}
          />

          <SourceCard
            icon={Video}
            title={sources.worldRugbyWomen.title}
            role={`${sources.worldRugbyWomen.role} (${womenChannelVideos})`}
            items={sources.worldRugbyWomen.items}
            link={WORLD_RUGBY_WOMEN_CHANNEL}
            linkLabel={sources.openChannel}
          />

          <SourceCard
            icon={ShieldCheck}
            title={sources.youtubeEmbedding.title}
            role={sources.youtubeEmbedding.role}
            items={sources.youtubeEmbedding.items}
          />

          <SourceCard
            icon={TriangleAlert}
            title={sources.videoAvailability.title}
            role={sources.videoAvailability.role}
            items={sources.videoAvailability.items}
          />
        </div>
      </section>

      <section className="sourcesPolicy">
        <div>
          <h2>{sources.operationTitle}</h2>
          <p>{sources.operationBody}</p>
        </div>

        <ol>
          {sources.operationSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="sourcesLimitations">
        <TriangleAlert size={20} aria-hidden="true" />
        <div>
          <h2>{sources.limitationsTitle}</h2>
          <ul>
            {sources.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
