# SVNS Stats Analyzer
# Version 1.1–2.0 Roadmap

**Updated:** 2026-08-19  
**Current release:** v1.0 completed  
**Current development line:** v1.1  
**Current active step:** v1.1-03 World Rugby enquiry / response tracking  
**Long-term product direction:** Fan-facing **Sevens Analysis Workspace** with a two-layer analytics architecture

---

## 1. Roadmap purpose

This roadmap defines how SVNS Stats Analyzer should evolve without losing the architectural discipline established for v1.1.

The project will develop through two analytical layers:

### Layer 1 — Quantitative Analysis
Use Rugby.com.au Match Centre-derived aggregated match statistics as far as they can responsibly support analysis.

### Layer 2 — Video-tagged Tactical Analysis
Use official/public YouTube video and manually or semi-automatically tagged events only where aggregate statistics cannot explain the observed change.

The core analytical loop is:

```text
Raw Match Stats
→ Derived Metrics
→ Opponent-adjusted Performance
→ Style Fingerprint
→ Matchup Analysis
→ Trend / Change Detection
→ Targeted Video Review
→ Video-tagged Tactical Explanation
```

The project should remain:

- independent;
- unofficial;
- non-commercial unless the operating model changes later;
- transparent about source, coverage and missingness;
- conservative about rights and permitted use;
- evidence-traceable;
- reimplementable by another development team or data provider;
- fan-facing rather than a clone of a professional team-analysis system.

---

# 2. Current status

## v1.0 — COMPLETED

Version 1.0 was completed on 2026-07-26.

The public prototype includes:

- Home;
- Stats Analysis;
- Stats Trends;
- Match Search;
- Video Library / player access;
- About / source information;
- Japanese / English;
- PWA support;
- GitHub Pages deployment;
- unofficial / non-affiliation notices;
- source traceability;
- a small proof-of-concept real-data set;
- official/public YouTube links and standard embeds.

Public CSV / Excel / PDF export was removed.

---

## v1.1-01 — COMPLETED

### Baseline / Issue Register

Established the v1.0 baseline and the v1.1 issue register.

---

## v1.1-02A — COMPLETED

### Public Demo Readiness / Core Analysis Model

Stats Analysis and Stats Trends were revised around 13 core indicators.

### Results & Scoring
1. Points Differential
2. Win Rate
3. Points per Match
4. Tries per Match

### Scoring Efficiency
5. Points per 100 Metres
6. Tries per 100 Metres

### Attacking Efficiency
7. Metres per Carry
8. Clean Breaks per 100 Carries
9. Defenders Beaten per Carry

### Possession & Discipline
10. Turnover Differential
11. Penalties per Match

### Defence & Retention
12. Tackle Success
13. Ruck Success

Comparison supports Tournament / Result / Opponent.

Relationship analysis uses predefined pairs rather than arbitrary X/Y selection.

Trends support Match / Tournament / Season.

---

## v1.1-02B — COMPLETED

### World Rugby enquiry preparation

Prepared the first enquiry package, project description, source/video explanation and submission checklist.

---

## v1.1-03 — ACTIVE

### World Rugby enquiry / response tracking

```text
Initial enquiry submitted: 2026-07-29
Route: World Rugby official Contact Us form
Category: Research
Language: English
Status: Response pending
```

While unresolved:

```text
Public prototype: Remains available for review
Public data expansion: Frozen
Major public data redistribution: Deferred
Architecture / documentation / tests: Continue
```

### Follow-up

The second enquiry should remain primarily:

- a follow-up to the 29 July enquiry;
- a request to confirm receipt;
- a request for routing to the appropriate data / digital / competition team;
- a concise restatement of the official-data questions.

The future Video + Stats / Analysis Workspace may be mentioned briefly.

Do not claim that video functionality was added after the first enquiry.

Do not lead with AI / ML plans.

---

# 3. Development constraints while data-use questions remain unresolved

## Continue

- bug fixes;
- architecture documentation;
- schema work;
- data-provider abstraction;
- derived-metric validation;
- tests;
- reproducible builds;
- responsive UI improvements;
- accessibility;
- localisation architecture;
- local/private analytical prototypes that do not expand public data exposure.

## Freeze / defer

- large-scale addition of Rugby.com.au-derived public data;
- bulk tournament/team coverage expansion;
- automated scraping;
- public export;
- public API distribution;
- large-scale promotion;
- official-looking branding;
- large new public redistribution surfaces.

---

# 4. v1.1 — Architecture / Handover / Maintainability

v1.1 remains a structural release. The new two-layer analytical roadmap does **not** interrupt this work.

---

## v1.1-04 — Current Architecture & Handover Inventory

Document:

- screens;
- navigation;
- confirmed data flow;
- main components;
- data-loading path;
- analytics calculation path;
- chart components;
- video components;
- localisation;
- PWA / build / deployment;
- current source assumptions;
- current limitations;
- known technical debt.

Target:

```text
docs/current-architecture-and-handover.md
```

Do not invent filenames or implementation paths that have not been confirmed from the repository.

---

## v1.1-05 — Secure Development & Repository Hygiene

Review:

- public/private information separation;
- accidental personal data exposure;
- secrets;
- GitHub Actions permissions;
- dependency hygiene;
- public source files;
- deployment workflow.

Do not add authentication solely for this step.

---

## v1.1-06 — Data Provider / Adapter Separation

Target conceptual boundary:

```text
Provider
↓
Provider Adapter
↓
Canonical Match Model
↓
Derived Metrics
↓
Analysis / Trends / Search
```

UI and analytics must not depend directly on a Rugby.com.au-specific field layout.

Possible future providers may include:

- World Rugby;
- RugbyPass;
- a designated official data provider;
- manual import;
- a future event-level source.

No provider role should be assumed until confirmed.

---

## v1.1-07 — Canonical Schema / Data Dictionary

Formalise:

- match;
- tournament;
- season;
- team;
- opponent;
- player;
- team match stats;
- source;
- video source;
- data coverage;
- metric definitions;
- provenance.

For each raw field / metric record:

- name;
- type;
- unit;
- nullable;
- raw / calculated;
- source;
- formula;
- denominator rules;
- coverage notes;
- definition version.

Mandatory rules:

- missing = `null`;
- missing must never be coerced to `0`;
- denominator `0` = `null`;
- pooled numerator/denominator aggregation for ratio metrics where mathematically appropriate;
- rounding only at display time.

---

## v1.1-08 — Derived Metrics Engine Separation

Separate:

```text
Canonical Data Model
Derived Metrics Engine
Aggregation
Filter / Comparison
Visualisation Configuration
Presentation
```

All screens must consume the same metric definitions.

No formula duplication across components.

---

## v1.1-09 — Tests / Reproducible Build

Add tests for:

- raw-to-canonical normalization;
- derived metrics;
- missing values;
- zero denominators;
- pooled aggregation;
- match/tournament/season grouping;
- comparison filters;
- relationship presets;
- display formatting;
- future baseline calculations.

Document:

- install;
- local run;
- build;
- test;
- deploy;
- rollback.

---

## v1.1-10 — Localisation Architecture

Preserve Japanese / English and make the structure scalable.

Priority later:

- French;
- Spanish.

Additional candidates:

- Portuguese (Brazil);
- Italian;
- Simplified Chinese;
- Traditional Chinese / Hong Kong;
- Arabic after RTL support is designed;
- Georgian later if justified.

---

## v1.1-11 — Information Architecture Design

Do not immediately rebuild the whole UI.

Design migration from feature-centred navigation:

```text
Home / Stats / Trends / Search / Video / Analysis / AI ...
```

toward entity-centred navigation:

```text
Home
Matches
Teams
Players
Analysis
```

Principle:

> organise around what the user wants to examine, not which technical feature they want to open.

---

## v1.1-12 — v1.1 Validation / Completion

Validate:

- architecture documentation;
- adapter boundary;
- schema / dictionary;
- shared metric engine;
- tests;
- reproducible build;
- source traceability;
- public UI stability;
- World Rugby response status;
- known unresolved data-use questions.

Then mark:

```text
Version 1.1: COMPLETED
```

---

# 5. Analytics architecture after v1.1

The project now follows a deliberate two-layer model.

```text
Layer 1: Quantitative Analysis
    broad coverage / lower manual cost

Layer 2: Video-tagged Tactical Analysis
    selected matches / higher analytical depth
```

The purpose is **not** to manually tag every match.

Layer 1 identifies where deeper review is valuable.

---

# 6. v1.2 — Quantitative Analysis Layer

v1.2 fully exploits the aggregate statistics before introducing expensive manual tactical tagging.

---

## v1.2-01 — Derived Metrics Expansion

Candidates supported directly by confirmed aggregate fields include:

```text
Carry Efficiency = Metres / Carries
Break Rate = Clean Breaks / Carries
Defender Beat Rate = Defenders Beaten / Carries
Offload Rate = Offloads / Carries
Passes per Carry = Passes / Carries
Tackle Success = Tackles / (Tackles + Missed Tackles)
Turnover Balance = Turnovers Won - Turnovers Conceded
```

Additional metrics may be added only when their numerator and denominator are actually available and clearly defined.

### Naming guardrails

Do **not** call an aggregate ratio a true event conversion rate unless event linkage exists.

For example:

```text
Tries / Clean Breaks
```

may be displayed as an aggregate relationship/ratio if analytically useful, but must not be labelled "Line Break → Try Conversion" without sequence-level evidence.

Similarly, `Points per possession` and `Metres per possession` require a clearly defined possession-count denominator; possession percentage alone is insufficient.

---

## v1.2-02 — Metric Relationship / Structural Analysis

Use combinations of indicators to describe how a statistical profile is formed.

Examples:

- high Metres/Carry × low Break Rate;
- high Break Rate × high Offload Rate;
- low possession share × high scoring efficiency;
- high Missed Tackle Rate × high Turnovers Won;
- high Passes/Carry × low Offload Rate.

Purpose:

- move beyond rankings;
- identify profile structure;
- generate hypotheses for later video review.

No causal claims.

---

## v1.2-03 — Baseline & Normalisation Model

Before Style Fingerprint and opponent adjustment, define:

- season baseline;
- tournament baseline;
- team baseline;
- opponent baseline;
- minimum sample size;
- leave-one-match-out rule where appropriate;
- percentile and/or z-score transformation;
- mixed-season handling;
- coverage thresholds.

A target match should normally be excluded from the opponent baseline used to assess that same match.

---

## v1.2-04 — Opponent-adjusted Performance

Compare actual performance with the opponent's normal concession / production profile.

Conceptual forms:

```text
Adjusted Attack
= Actual Attack - Opponent Expected Concession

Adjusted Defence
= Opponent Actual Attack - Opponent Expected Attack
```

The exact sign convention and display direction must be documented per metric.

Goals:

- reduce overrating of performances against weak opposition;
- identify unexpectedly strong/weak performances;
- create a fairer input for fingerprint and matchup analysis.

Potential future outputs:

- raw difference;
- percentage difference;
- percentile;
- standardized score.

---

## v1.2-05 — Team Style Fingerprint

Construct a multi-dimensional team profile from normalized aggregate metrics.

Candidate dimensions:

### Ball Movement
- Passes / Carry
- Offloads / Carry

### Penetration
- Metres / Carry
- Clean Breaks / Carry
- Defenders Beaten / Carry

### Security
- Turnovers Conceded
- Ruck Success

### Defence
- Tackle Success
- Missed Tackle Rate
- Turnovers Won

### Possession / Efficiency
Use only indicators whose denominators are valid and available.

Outputs:

- Team Style Fingerprint;
- tournament-by-tournament change;
- season trend;
- opponent-specific change.

Fingerprint axes should be based on normalized values rather than raw metrics with incompatible scales.

---

## v1.2-06 — Matchup Analysis

Combine one team's attack profile with the opponent's defence profile.

Examples:

- Offload-heavy attack × defence with high Missed Tackle Rate;
- high Passes/Carry attack × turnover-pressure defence;
- high-penetration attack × high Tackle Success defence.

Goal:

> identify which team types or profile combinations produce unusual outcomes, rather than simply ranking "strong" and "weak" teams.

Matchup outputs must include sample-size and baseline warnings.

---

## v1.2-07 — Trend / Change Detection

Detect meaningful changes across tournaments / seasons.

Candidate signals:

- sharp Offload Rate decline;
- Passes/Carry increase;
- Break Rate rise;
- Turnover Balance deterioration;
- defensive-profile shift;
- fingerprint-axis movement.

Purpose:

> detect statistical signs of tactical or behavioural change.

Do not infer a concrete tactical shape (for example a loop, scissors or a specific phase structure) from aggregate data alone.

---

## v1.2-08 — Quantitative Analysis Validation

Validate:

- metric definitions;
- coverage;
- baseline construction;
- opponent-adjustment direction;
- normalization;
- fingerprint stability;
- matchup sample sizes;
- false positive rate of change detection;
- explanatory labels.

Only after this validation should the application treat Layer 1 as a reliable screening mechanism for deeper video work.

---

# 7. v1.3 — Match Analysis Workspace

v1.3 turns Layer 1 outputs into a fan-facing workflow.

---

## v1.3-01 — Workspace Shell

Desktop concept:

```text
┌─────────────────────────┬────────────────────────┐
│                         │                        │
│ Official YouTube Video  │ Analysis Panel         │
│                         │                        │
│                         │ Stats / Team / Player  │
│                         │ Trends / Analysis      │
└─────────────────────────┴────────────────────────┘
```

Mobile concept:

```text
Video
↓
Analysis cards
↓
Stats / Players / Analysis switch
```

---

## v1.3-02 — Match vs Baseline Comparison

While watching a match, compare:

- current match;
- season baseline;
- tournament baseline;
- opponent-adjusted expectation where valid.

Example:

```text
Turnovers Conceded
Current Match: 5
Season Baseline: 3.2
Relative Difference: +56%
```

Do not imply statistical significance unless a statistical test supports it.

---

## v1.3-03 — Persistent Video / Video Dock

Evaluate:

- Small;
- Medium;
- Analysis Split.

Use the standard YouTube player UI.

Custom analysis controls should remain outside the video surface unless technically and contractually appropriate.

---

## v1.3-04 — Data → Video Navigation

Layer 1 result:

```text
Fingerprint shift / anomaly
↓
Tournament
↓
Match
↓
Video + relevant metrics
```

This implements the first half of the bidirectional analytical loop.

---

# 8. v1.4 — Video-tagged Tactical Layer

Layer 2 is used selectively for matches identified by Layer 1 or otherwise judged analytically important.

The project does not aim to manually code every available match.

---

## v1.4-01 — YouTube Time Read / Seek

- read current playback position;
- jump to a stored time code;
- preserve `youtube_video_id`;
- handle unavailable/changed video gracefully.

The video remains hosted and delivered by the official/public YouTube source.

---

## v1.4-02 — Video Event Schema

Minimum candidate structure:

```text
event_id
match_id
youtube_video_id
timestamp
event_type
event_subtype
team_id
player_id
opponent_id
sequence_id
memo
tagging_date
source_channel
video_duration
```

Optional later fields:

```text
field_zone
attack_direction
preceding_event_id
following_event_id
result
confidence
review_status
phase
tactical_tag
```

Video source and event metadata must remain separate.

---

## v1.4-03 — Manual Event Tagging MVP

Begin with a deliberately small set, for example:

- Line Break;
- Offload;
- Turnover;
- Penalty;
- Try;
- Restart;
- Tackle Miss;
- Support.

Do not activate the full tactical taxonomy immediately.

---

## v1.4-04 — Match Event Timeline

Example:

```text
03:24  JPN  Line Break      ▶
03:31  JPN  Offload         ▶
03:36  JPN  Try             ▶
05:12  AUS  Turnover Won    ▶
```

Selecting an event jumps to the corresponding YouTube playback position.

---

## v1.4-05 — Cross-match Event Search

Example:

```text
Team: Japan Women
Event: Line Break
Season: 2026
```

Results may link directly to relevant video timestamps.

This is a core future differentiator.

---

# 9. v1.5 — Event / Sequence Analysis

---

## v1.5-01 — Sevens-specific Tactical Taxonomy

Do not copy a 15-a-side taxonomy wholesale.

Candidate groups:

### Attack Creation
- 2v1 creation
- 3v2 creation
- Individual beat
- Change of angle
- Switch
- Scissors
- Loop / Wrap
- Overs line
- Unders line
- Miss pass
- Decoy
- Width creation
- Defensive manipulation

### Break / Continuity
- Line Break
- Clean Break
- Support Available
- Support Unavailable
- Successful Offload
- Failed Offload
- Recycle
- Breakdown Retention
- Continuity Maintained
- Continuity Lost

### Defence
- Missed Tackle
- Dominant Tackle
- Defensive Turnover
- Line Integrity Maintained
- Defensive Disconnect
- Over-chase
- Defender Bite
- Sweeper Involvement
- Cover Defence
- Breakdown Commitment

### Possession / Restart
- Turnover Won
- Turnover Conceded
- Penalty Won
- Penalty Conceded
- Kick-off / Restart
- Restart Won
- Restart Lost
- Scrum
- Lineout

Only a validated subset should be enabled in the interface.

---

## v1.5-02 — Event-derived Metrics

True sequence-dependent metrics become possible here.

Candidates:

- Line Break → Try Conversion Rate;
- Line Break → Support Success Rate;
- Offload Success Rate;
- Break-after Possession Retention;
- Break-after Average Points;
- Turnover → Try Conversion;
- Restart Win Rate;
- Continuity Loss after Break.

Each metric must be traceable to its tagged events.

---

## v1.5-03 — Event Sequence Model

Connect related events explicitly.

Example:

```text
Line Break
↓
Support Available
↓
Successful Offload
↓
Continuity Maintained
↓
Try
```

Use sequence IDs rather than assuming causal chains from temporal proximity alone.

---

## v1.5-04 — Event Trends

Integrate tagged-event indicators with the existing trends framework.

Example:

```text
Dubai
Switch usage        8
Loop / Wrap          6
Individual beat     11

Cape Town
Switch usage        5
Loop / Wrap          3
Individual beat     14
```

This does not prove causality.

It identifies tactical patterns for evidence-based review.

---

# 10. v1.6 — Integrated Team / Player / Opponent Analysis

This phase combines Layer 1 breadth with Layer 2 depth.

---

## v1.6-01 — Enhanced Team Style Fingerprint

Merge validated aggregate indicators with selected event-derived indicators.

Potential dimensions:

- Ball Movement;
- Penetration;
- Security;
- Break Creation;
- Break Conversion;
- Support Continuity;
- Defensive Pressure;
- Restart Effectiveness;
- Efficiency.

---

## v1.6-02 — Player Role Profile

Potential descriptive roles:

- Break Creator;
- Finisher;
- Distributor;
- Connector;
- Direct Carrier;
- Support Runner;
- Defensive Stopper;
- Turnover Specialist.

Do not force players into predefined roles before feature calculation.

---

## v1.6-03 — Player Similarity

Use a documented feature space and include coverage/sample-size warnings.

Possible outputs:

- nearest style neighbours;
- role-cluster neighbours;
- dimensions of similarity and difference.

---

## v1.6-04 — Enhanced Matchup Analysis

Combine:

```text
Layer 1 attack/defence profile
+
Layer 2 tactical/event profile
+
Opponent baseline
```

The objective remains explanatory matchup analysis, not deterministic prediction.

---

## v1.6-05 — Match Anomaly Detection

Identify matches that materially diverge from a team's normal profile.

Anomaly means "unusual relative to baseline", not "bad".

Potential inputs:

- Passes/Carry;
- Offload Rate;
- Break Rate;
- Turnover Balance;
- defensive indicators;
- restart indicators;
- event-derived tactical indicators.

---

## v1.6-06 — Emerging Player Detector

Only after adequate player-level coverage exists.

Potential adjustments:

- playing time;
- opponent;
- team context;
- tournament;
- recent trend.

Do not disguise a simple scoring leaderboard as AI.

---

# 11. v1.7 — Tactical Interpretation / Analysis Engine

Target analytical stack:

```text
Raw Match Stats
↓
Derived Metrics
↓
Opponent-adjusted Performance
↓
Style Fingerprint / Matchup / Change Detection
↓
Selected Video-tagged Events
↓
Event Sequences
↓
Tactical Interpretation
```

Evidence should be surfaced before interpretation.

Example form:

```text
Layer 1 detected a decline in Japan's Offload Rate after Singapore.

Selected tagged matches show fewer successful continuity actions after line breaks.

Review evidence:
03:24
05:18
06:02
```

Every interpretation should be traceable to:

- raw stats;
- formula / baseline;
- tagged video evidence where applicable.

---

# 12. Advanced future candidates

Only after sufficient event data and coverage exist:

- Possession / Sequence analysis;
- Phase-based analysis;
- Player combination effect;
- Lineup interaction;
- Pass network, if sender/receiver data exists;
- Spatial analysis, if position data exists;
- Expected Possession Value / EPV, if event and location data are sufficient;
- Tactical State transition models.

Do not simulate unavailable spatial/sequence data from aggregate statistics.

---

# 13. AI / ML policy

Advanced analysis does **not** mean "add AI".

Priority order:

1. Data quality
2. Schema / Dictionary
3. Reproducible derived metrics
4. Baseline / normalization
5. Opponent adjustment
6. Style Fingerprint
7. Matchup
8. Trend / Change Detection
9. Video-tagged Tactical Layer
10. AI / ML assistance only where justified

Initial event workflow:

```text
Human tagging
↓
Structured event data
↓
Calculation
↓
Rule-based / statistical analysis
↓
Optional AI explanation or tagging assistance
```

Only after enough reviewed training data exists should AI assist with:

- event candidate suggestions;
- tag suggestions;
- classification assistance.

Win probability remains low priority because sevens has short matches, high rotation, strong card effects, limited samples and substantial variance.

Any prediction must expose uncertainty.

---

# 14. v2.0 — Data Platform / Controlled Automation

v2.0 begins only when scale justifies persistent backend infrastructure.

Potential scope:

- database;
- canonical team/player/match IDs;
- event storage;
- controlled authentication where needed;
- admin/review workflow;
- audit log;
- event review status;
- semi-automated import;
- official API integration if available;
- source provenance preservation where permitted;
- data-quality monitoring;
- background processing.

Do not build enterprise infrastructure before real requirements exist.

---

# 15. World Rugby response branches

## Branch A — Official data route / permission available

1. clarify conditions;
2. implement official provider adapter;
3. map official IDs;
4. ingest data dictionary;
5. validate historical coverage;
6. backfill where permitted;
7. assess event-level access;
8. reassess manual tagging scope.

If official event data becomes available, manual tags should focus on tactical concepts not already represented in the official feed.

---

## Branch B — Public use permitted with conditions

Implement required:

- attribution;
- source links;
- coverage limits;
- update rules;
- branding restrictions;
- disclaimers.

Then resume controlled public data expansion.

---

## Branch C — Current public use incompatible

Possible actions:

- modify the public prototype;
- remove affected data;
- change source strategy;
- take the public prototype offline where required.

Do not assume private use is automatically permitted; clarify the scope first.

---

## Branch D — No response

Continue:

- architecture;
- schema;
- tests;
- provider abstraction;
- Layer 1 local/private prototypes.

Keep public data expansion conservative.

Consider another appropriate data-rights or governing-body route only after documenting the unanswered points.

---

# 16. Product principles

## 16.1 Aggregate first, video selectively

Do not manually analyse every match if aggregate data can screen the field first.

```text
All matches
→ Layer 1 screening
→ selected matches
→ Layer 2 review
```

This is a core operating principle.

---

## 16.2 Fan-facing first

The project should make sevens easier to explore and understand.

Do not reproduce a professional analyst tool merely because professional tools exist.

---

## 16.3 Evidence before interpretation

Every analytical conclusion should be traceable to:

- raw stats;
- metric formula;
- baseline/normalization rule;
- opponent-adjustment rule;
- source;
- tagged video evidence where applicable.

---

## 16.4 No false tactical precision

Aggregate data may support descriptors such as:

- high movement / low movement;
- high penetration / low penetration;
- high offload / low offload;
- possession-heavy / efficiency-heavy.

Aggregate data alone should **not** be used to assert:

- phase shape;
- receiver positioning;
- pass routes;
- field zone;
- exact breakdown phase;
- specific loop/scissors usage.

Those belong in Layer 2.

---

## 16.5 Video and analysis remain separate layers

Use official/public embedded video.

Do not normally:

- download;
- host;
- copy;
- redistribute

video files.

Store analysis metadata and timestamps separately.

---

## 16.6 Keep the UI simple

Backend sophistication must not turn into user-interface complexity.

Primary user actions should remain understandable:

```text
Watch
Compare
Explore
Search
Review
```

---

## 16.7 Sevens-specific design

Prioritise:

- space;
- numerical advantage;
- break creation;
- support;
- continuity;
- restart;
- defensive spacing;
- transition.

Do not import 15-a-side concepts without validation.

---

# 17. Priority summary

## NOW — v1.1 foundation

```text
v1.1-03 World Rugby follow-up / response tracking
v1.1-04 Architecture & Handover Inventory
v1.1-05 Secure Development
v1.1-06 Data Provider / Adapter
v1.1-07 Schema / Data Dictionary
v1.1-08 Derived Metrics Engine separation
v1.1-09 Tests / reproducible build
v1.1-10 Localisation architecture
v1.1-11 Information Architecture design
v1.1-12 v1.1 completion
```

## NEXT — Layer 1

```text
v1.2 Quantitative Analysis Layer
  Derived Metrics
  Structural Relationships
  Baseline / Normalisation
  Opponent-adjusted Performance
  Team Style Fingerprint
  Matchup Analysis
  Trend / Change Detection
```

## THEN — fan-facing workflow

```text
v1.3 Match Analysis Workspace
```

## THEN — Layer 2

```text
v1.4 Video-tagged Tactical Layer
v1.5 Event / Sequence Analysis
v1.6 Integrated Team / Player / Opponent Analysis
v1.7 Tactical Interpretation / Analysis Engine
```

## LATER / SCALE-DEPENDENT

```text
AI / ML assistance
Possession / phase analysis
Player combination / lineup interaction
Pass networks
Spatial analysis
EPV
v2.0 database / controlled automation
```

---

# 18. Final target

SVNS Stats Analyzer should evolve from:

> **a public-stats comparison app**

into:

> **a fan-facing Sevens Rugby Analytics Platform that quantitatively screens all available matches, identifies meaningful changes and matchup patterns, and lets the user descend into targeted official-video analysis only when deeper tactical explanation is needed.**

The intended user loop is:

```text
Explore aggregate data
↓
Find a change / anomaly / matchup pattern
↓
Open the relevant match
↓
Watch official/public video
↓
Inspect or add tagged evidence
↓
Return to quantitative analysis with better context
```

This two-layer loop is the main long-term analytical identity of SVNS Stats Analyzer.
