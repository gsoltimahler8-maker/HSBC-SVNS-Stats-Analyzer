# SVNS Stats Analyzer — Current Architecture and Handover Inventory

**Roadmap step:** v1.1-04  
**Snapshot date:** 2026-08-20  
**Repository:** `gsoltimahler8-maker/HSBC-SVNS-Stats-Analyzer`  
**Default branch:** `main`

---

## 1. Purpose

This document records the current application architecture as it actually exists in the repository before the v1.1 provider/schema/test refactor proceeds further.

The main goals are:

- make the current implementation understandable to another developer without requiring a full codebase read first;
- identify the present data flow and calculation flow;
- distinguish current implementation from planned architecture;
- record known coupling, duplication and handover risks;
- provide a stable starting point for v1.1-05 onward;
- preserve the current public UI while internal architecture is improved.

This is an inventory of the current state. It is not a claim that every current structure is the desired final structure.

---

# 2. Technology and runtime overview

The current application is a client-side React / Vite application.

Main runtime dependencies in `package.json`:

- React
- React DOM
- Vite
- Recharts
- Lucide React

The project currently has no application backend, database, authentication service or admin API.

Conceptually:

```text
Static repository data
        ↓
React / Vite client application
        ↓
Derived metrics / filters / charts
        ↓
GitHub Pages static deployment
```

The current project is therefore a static-data analytical web application rather than a server-backed analytics platform.

---

# 3. Application entry point

## `src/main.jsx`

Responsibilities:

- imports PWA registration logic from `src/registerSW.js`;
- imports global CSS from `src/styles.css`;
- creates the React root;
- wraps the application in `AppErrorBoundary`;
- renders `App`.

Current chain:

```text
index.html
    ↓
src/main.jsx
    ↓
AppErrorBoundary
    ↓
App
```

---

# 4. Top-level application controller

## `src/App.jsx`

`App.jsx` is currently the top-level screen controller.

It does not use a routing library. The visible page is selected through React state:

```text
screen
selectedMatchId
language
```

Current screen states include:

```text
home
analysis
trends
search
videos
about
sources
policy
admin
```

The `admin` screen is currently a `ComingSoon` placeholder, not an implemented administration system.

`App.jsx` also controls:

- Japanese / English selection;
- document language and page title;
- accessibility focus handling after screen changes;
- top-level navigation;
- footer / non-affiliation notice;
- cross-navigation between Match Search and Video Library using `selectedMatchId`;
- PWA status UI.

### Current screen-component mapping

| Screen | Component |
| --- | --- |
| Home | `src/components/HomeMenu.jsx` |
| Stats Analysis | `src/components/StatsAnalysis.jsx` |
| Stats Trends | `src/components/StatsTrends.jsx` |
| Match Search | `src/components/MatchSearch.jsx` |
| Video Library | `src/components/VideoLibrary.jsx` |
| About | `src/components/AboutPage.jsx` |
| Sources | `src/components/SourcesPage.jsx` |
| Policy | `src/components/PolicyPage.jsx` |
| Admin placeholder | `ComingSoon` inside `src/App.jsx` |

Navigation UI itself is implemented in:

```text
src/components/AppNavigation.jsx
```

---

# 5. Current match-data layer

## Active files

```text
src/data/matches.json
src/data/loadMatches.js
```

`loadMatches.js` currently performs a direct static import:

```text
matches.json
    ↓
loadMatches()
    ↓
matchData
```

There is currently no provider adapter, normalization boundary or asynchronous fetch layer in `loadMatches.js`.

This is important for handover: although the function name suggests a loading boundary, the current implementation is effectively a thin alias around the bundled JSON file.

### Current consumers

At minimum, the active match dataset is consumed by:

```text
StatsAnalysis.jsx
StatsTrends.jsx
MatchSearch.jsx
VideoLibrary.jsx
```

Therefore the current practical data flow is:

```text
src/data/matches.json
        ↓
src/data/loadMatches.js
        ↓
┌───────────────────────────────┐
│ StatsAnalysis                 │
│ StatsTrends                   │
│ MatchSearch                   │
│ VideoLibrary                  │
└───────────────────────────────┘
```

For Analysis / Trends, the flow continues through `analyticsMetrics.js`.

---

# 6. Current match record model

The repository already contains a formal schema document:

```text
MATCH_DATA_SCHEMA.md
```

Its key principles include:

- one record represents one team-perspective match record;
- Rugby.com.au Match Stats is the primary source model;
- source provenance must be retained;
- unknown values should remain `null`, not be converted to `0`;
- derived metrics should normally be calculated by the application rather than stored;
- `fetchedAt` is the canonical acquisition timestamp;
- coverage level and stat-definition version should be retained.

Current active records in `src/data/matches.json` include fields such as:

```text
id
external.rugbyComAu
external.svns
external.rugbyPass
season
tournament
date
gender
stage
team
opponent
result
teamResult
matchResult
winner
loser
pointsFor
pointsAgainst
tries
metres
carries
passes
offloads
cleanBreaks
defendersBeaten
tackles
missedTackles
turnoversWon
turnoversConceded
rucksWon
rucksLost
possession
territory
penaltiesConceded
yellowCards
redCards
sourceProvider
sourceUrl
fetchedAt
dataCoverageLevel
dataCoverageSource
statDefinitionVersion
dataType
```

### Important current-state note

The active dataset contains both sample-style records and real-data records.

Some UI code classifies a match as real only when:

```text
dataType === 'real'
```

and otherwise treats it as sample data.

This convention is operationally useful now, but should be formalised or replaced by a clearer canonical provenance model during the v1.1 schema work.

### Schema drift to resolve later

`metres` is actively used by the current metrics engine and is present in real match records, while the older `MATCH_DATA_SCHEMA.md` field listing does not consistently expose it in the same place as the current runtime model.

The current runtime dataset and the historical schema document are therefore close, but not yet a single authoritative canonical model.

This should be resolved in v1.1-07 rather than patched ad hoc in UI components.

---

# 7. Current analytics layer

## Main analytics module

```text
src/utils/analyticsMetrics.js
```

This file is currently the central shared analytical module for Stats Analysis and Stats Trends.

It contains:

- metric definitions;
- metric labels and formulas;
- the 13 public analysis metric keys;
- metric categories;
- predefined relationship presets;
- per-match metric calculation;
- metric coverage calculation;
- aggregate metric calculation;
- formatting helpers;
- chronology helpers;
- grouping helpers;
- basic result helpers.

### Current 13 core metrics

#### Results & Scoring

- Points Differential
- Win Rate
- Points per Match
- Tries per Match

#### Scoring Efficiency

- Points per 100 Metres
- Tries per 100 Metres

#### Attacking Efficiency

- Metres per Carry
- Clean Breaks per 100 Carries
- Defenders Beaten per Carry

#### Possession & Discipline

- Turnover Differential
- Penalties per Match

#### Defence & Retention

- Tackle Success
- Ruck Success

### Missing-value policy in code

The current metric engine already applies important safeguards:

```text
missing numerator → null
missing denominator → null
denominator = 0 → null
```

This behavior should be preserved in later refactors.

### Aggregate-ratio policy

For ratio metrics such as:

- Metres per Carry
- Clean Breaks per 100 Carries
- Tackle Success
- Ruck Success

`aggregateMetric()` pools valid numerators and denominators before division rather than simply averaging per-match ratios.

This is an important analytical behavior and must be covered by tests before later architecture changes.

---

# 8. Stats Analysis architecture

## `src/components/StatsAnalysis.jsx`

Main responsibilities currently include:

- loading active match data through `matchData`;
- season / gender / team / tournament / opponent / result filtering;
- displaying the 13-indicator performance profile;
- comparison by tournament, result or opponent;
- predefined relationship scatterplots;
- coverage information;
- mobile chart-label handling;
- Recharts rendering.

It imports calculation and aggregation functions from:

```text
src/utils/analyticsMetrics.js
```

Therefore formula logic is substantially more centralised than in earlier project stages.

However, the component still owns significant presentation-specific filtering and chart preparation logic.

---

# 9. Stats Trends architecture

## `src/components/StatsTrends.jsx`

Main responsibilities currently include:

- loading active match data through `matchData`;
- selecting analysis scope;
- displaying Match / Tournament / Season trends;
- using the shared metric definitions and aggregation functions;
- preparing chronological chart data;
- mobile opponent-label handling;
- Recharts rendering.

Stats Analysis and Stats Trends therefore share the calculation layer but remain separate presentation / filter components.

---

# 10. Current video-data layer

## Active files

```text
src/data/videos.json
src/data/loadVideos.js
src/utils/videoUtils.js
src/utils/validateVideos.js
src/components/VideoLibrary.jsx
```

`loadVideos.js` mirrors the current match loader design:

```text
videos.json
    ↓
loadVideos()
    ↓
videoData
```

It is also a static import rather than a provider abstraction.

### Video Library responsibilities

`VideoLibrary.jsx` currently:

- joins video metadata with match metadata;
- filters and sorts video catalog items;
- supports YouTube embed URL generation;
- shows match-result context;
- supports navigation back to Match Search for a selected match.

### Current video boundary

The present application uses public/official YouTube video metadata and embeds/links.

The current codebase does **not** yet implement the future Video-tagged Event Data model.

Not currently present as production architecture:

```text
playback timestamp capture
event_id
sequence_id
manual event-tag persistence
cross-match event search
persistent Video Dock
YouTube IFrame event-analysis workflow
```

Those remain later roadmap layers.

---

# 11. Match Search architecture

## `src/components/MatchSearch.jsx`

This component currently combines:

- active match records;
- video records;
- filtering / search logic;
- result / winner / loser presentation helpers;
- source / match metadata display;
- navigation to the corresponding video entry.

It therefore acts as a cross-linking surface between match data and video data.

Current cross-navigation is coordinated at `App.jsx` level through `selectedMatchId`.

Conceptually:

```text
Match Search
    ↓ selectedMatchId
App.jsx
    ↓
Video Library
```

and the reverse direction is also supported.

This is the current foundation for the later Match Analysis Workspace, but it is not yet a persistent shared workspace.

---

# 12. Internationalisation

Current translation files:

```text
src/i18n/ja.js
src/i18n/en.js
```

`App.jsx` maintains a dictionary map and switches between Japanese and English.

The current design therefore has a working bilingual base.

### Current coupling to clean up later

Some feature components infer Japanese mode by inspecting translated text, for example by checking whether the back-home label contains `ホーム`.

That works for the current two-language implementation but is not a scalable locale API.

Future localisation work should pass an explicit locale / language identifier rather than infer locale from UI strings.

---

# 13. Styling

Main styling files currently include:

```text
src/styles.css
src/analytics.css
```

`styles.css` contains the large global application styling layer.

`analytics.css` contains analysis/trend-specific styling introduced for the v1.1 analysis revision.

Several screens also reference background assets through `import.meta.env.BASE_URL`.

Future refactoring should avoid changing visual behavior merely for architectural purity. Style modularisation should be done only when it improves maintainability or enables the planned entity/workspace UI.

---

# 14. PWA architecture

Current PWA-related files include:

```text
src/registerSW.js
src/components/PwaStatus.jsx
public/manifest.webmanifest
public/service-worker.js
public/offline.html
```

`src/registerSW.js` currently handles:

- service-worker registration in production;
- update-ready state;
- offline-ready state;
- install prompt state;
- application update triggering;
- reload after service-worker controller change.

The service worker is registered using `import.meta.env.BASE_URL`, matching the GitHub Pages subdirectory deployment model.

---

# 15. Validation architecture

## Runtime / utility validators

```text
src/utils/validateMatches.js
src/utils/validateVideos.js
```

## Script entry points

```text
scripts/validateSampleMatches.mjs
scripts/validateVideos.mjs
scripts/validateRelease.mjs
```

## Package scripts

Current package commands include:

```text
npm run validate:matches
npm run validate:videos
npm run validate:data
npm run validate:release
npm run build
```

The build command is currently:

```text
npm run validate:release && vite build --base=/HSBC-SVNS-Stats-Analyzer/
```

This means release validation is already part of the production build path.

That is a good foundation for v1.1-09.

The next testing phase should extend this from structural validation toward deterministic unit tests for:

- derived metrics;
- missing-value handling;
- zero-denominator handling;
- pooled ratios;
- grouping;
- relationship presets;
- provider normalization once adapters are introduced.

---

# 16. Build and deployment

## Local development

From `package.json`:

```text
npm run dev
npm run build
npm run preview
```

## GitHub Pages deployment

Workflow:

```text
.github/workflows/deploy.yml
```

Current deployment trigger:

```text
push to main
```

Current deployment sequence:

```text
checkout
↓
Node 22
↓
activate pnpm
↓
pnpm install
↓
pnpm run build
↓
configure GitHub Pages
↓
upload ./dist
↓
deploy-pages
```

The workflow grants:

```text
contents: read
pages: write
id-token: write
```

Any commit merged into `main` currently triggers a Pages build/deployment, even if the change only affects repository documentation.

A documentation-only commit should not change the generated app unless source/build inputs changed, but it still causes the deployment workflow to run.

---

# 17. Current architecture diagram

## Match analysis path

```text
src/data/matches.json
        ↓
src/data/loadMatches.js
        ↓
        ├──────────────→ MatchSearch.jsx
        │
        ├──────────────→ VideoLibrary.jsx
        │
        └→ analyticsMetrics.js
                ↓
        ┌───────┴────────┐
        ↓                ↓
StatsAnalysis.jsx   StatsTrends.jsx
        ↓                ↓
      Recharts          Recharts
```

## Video path

```text
src/data/videos.json
        ↓
src/data/loadVideos.js
        ↓
        ├──────────────→ MatchSearch.jsx
        └──────────────→ VideoLibrary.jsx
                              ↓
                       videoUtils.js
                              ↓
                       YouTube embed/link
```

## Application shell

```text
main.jsx
  ↓
AppErrorBoundary
  ↓
App.jsx
  ├─ HomeMenu
  ├─ StatsAnalysis
  ├─ StatsTrends
  ├─ MatchSearch
  ├─ VideoLibrary
  ├─ AboutPage
  ├─ SourcesPage
  ├─ PolicyPage
  ├─ AppNavigation
  └─ PwaStatus
```

---

# 18. Current implementation strengths to preserve

The following current behaviors should be treated as intentional unless a later roadmap step explicitly changes them:

1. **Static, auditable source records**  
   Source data can currently be inspected directly in repository JSON.

2. **Provenance fields**  
   Source provider, source URL, fetch timestamp, coverage and definition-version fields are already part of the data model.

3. **Null is distinct from zero**  
   Missing data is not intended to become a false zero.

4. **Derived metrics are calculated from source data**  
   Calculated fields are not generally persisted in match records.

5. **Shared analysis definitions**  
   Stats Analysis and Stats Trends consume the same central metric module.

6. **Pooled aggregation for ratio metrics**  
   The current analytics engine already avoids a common aggregation error.

7. **Predefined relationship questions**  
   Relationship charts are constrained to rugby-relevant pairings rather than unrestricted X/Y combinations.

8. **Source / policy screens and non-affiliation notice**  
   Data and branding context are built into the public application shell.

9. **Release validation before build**  
   Structural validation already gates the production build.

10. **Match ↔ video cross-navigation**  
    The current `selectedMatchId` mechanism is a useful precursor to the later workspace architecture.

---

# 19. Known architectural debt / handover risks

These are inventory findings, not immediate v1.1-04 code-change tasks.

## 19.1 `loadMatches.js` is not yet a provider abstraction

Current:

```text
matches.json → direct import
```

Future:

```text
Provider
→ Provider Adapter
→ Canonical Match Model
→ application
```

This is the main target of v1.1-06.

---

## 19.2 Runtime schema and schema documentation are not yet one authoritative contract

The active dataset has evolved beyond some older schema text.

Future work must define one canonical field contract and version it explicitly.

---

## 19.3 Presentation helpers are duplicated

Examples include:

- team abbreviations in both Stats Analysis and Stats Trends;
- winner / result helpers in multiple search/video components;
- some filtering/grouping logic living inside components.

These should be consolidated only where the shared semantics are truly identical.

---

## 19.4 Locale is sometimes inferred from translated copy

Feature components should eventually receive an explicit language / locale value.

---

## 19.5 Static data and application source are bundled together

This is acceptable at current scale but unsuitable for large-scale updating or controlled unpublished staging.

A public GitHub repository must not be treated as private storage merely because a file is not imported by the public UI.

Unpublished raw/staging data should remain outside the public repository until the data-use position is clear.

---

## 19.6 No persistent data-review workflow

There is currently no:

- database;
- review-status state machine;
- audit log;
- role-based data administration;
- event-tag review workflow.

These should not be added before scale or operating requirements justify them.

---

## 19.7 No event-level tactical data model in production

Future Video-tagged Event Data is not part of the current production path and should remain a later layer after the v1.1 foundation and quantitative-analysis layer are stable.

---

# 20. Current public-data / internal-work boundary

While data-use questions remain unresolved, the recommended operating boundary is:

## Suitable for the public repository

```text
architecture documentation
schema definitions
validators
tests
generic provider interfaces
generic analytics logic
existing public prototype data
UI code
```

## Keep local/private unless and until publication is appropriate

```text
newly collected raw match data
unpublished staging datasets
bulk source captures
private correspondence
credentials / secrets
unreviewed event-tag datasets
```

Important distinction:

```text
not shown in the app
≠
not public on GitHub
```

A file committed to a public repository is public even when no application component imports it.

---

# 21. Target architecture after the next foundation steps

The desired direction is:

```text
Data Provider
    ↓
Provider Adapter
    ↓
Canonical Match Model
    ↓
Validation
    ↓
Derived Metrics Engine
    ↓
Aggregation / Comparison / Baseline
    ↓
Analysis Services
    ↓
Presentation Components
```

Later layers may add:

```text
Video Provider Metadata
        ↓
Video-tagged Event Data
        ↓
Event Sequences
        ↓
Team / Player / Opponent Profiles
        ↓
Tactical Interpretation
```

The later event layer must complement, not replace, the aggregate quantitative layer.

---

# 22. Handover notes for a future implementation owner

A future developer, World Rugby team, RugbyPass team, data provider or designated development contractor should confirm the following before replacing the current data layer:

1. Which organization is the authoritative provider for SVNS detailed statistics?
2. Which rights and publication conditions apply?
3. Is there an official API, feed, export or dataset?
4. What are the canonical match / tournament / team / player IDs?
5. What is the official data dictionary?
6. Which fields are stable across seasons?
7. How are corrections to historical match data communicated?
8. Is event-level data available?
9. Which video identifiers may be stored and linked?
10. What attribution and source-display requirements apply?
11. What historical coverage can be obtained legitimately?
12. What update cadence is supported?

The provider-specific answers should live in provider documentation and adapters, not be hard-coded throughout the UI.

---

# 23. v1.1-04 completion assessment

This inventory establishes the current implementation path as:

```text
Static JSON
→ thin loader
→ shared metric utilities / component-level filtering
→ React presentation
→ Recharts / YouTube embed
→ Vite build
→ GitHub Pages
```

It also identifies the principal next separation point:

```text
thin loader
↓
provider-independent canonical data boundary
```

No application UI behavior needs to change as part of this inventory step.

### v1.1-04 status

```text
Current Architecture & Handover Inventory: COMPLETED
```

### Next planned foundation step

```text
v1.1-05 — Secure Development & Repository Hygiene
```

After that:

```text
v1.1-06 — Data Provider / Adapter Separation
v1.1-07 — Canonical Schema / Data Dictionary
v1.1-08 — Derived Metrics Engine Separation
v1.1-09 — Tests / Reproducible Build
```
