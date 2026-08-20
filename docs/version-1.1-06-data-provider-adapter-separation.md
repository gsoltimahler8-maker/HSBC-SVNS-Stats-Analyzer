# SVNS Stats Analyzer — Data Provider / Adapter Separation

**Roadmap step:** v1.1-06  
**Implementation date:** 2026-08-20  
**Repository:** `gsoltimahler8-maker/HSBC-SVNS-Stats-Analyzer`

---

## 1. Purpose

v1.1-06 introduces the first explicit boundary between match-data source access and the rest of the application.

Before this step, the active path was effectively:

```text
src/data/matches.json
↓
src/data/loadMatches.js
↓
Analysis / Trends / Search / Video
```

`loadMatches.js` imported `matches.json` directly, so the source file and application data layer were coupled.

The target architecture is:

```text
Provider
↓
Provider Adapter
↓
Canonical Match Model
↓
Derived Metrics
↓
Analysis / Trends / Search / Video
```

This step establishes the first two boundaries without changing the public dataset or public UI.

---

## 2. Implemented files

### Added

```text
src/data/providers/staticJsonMatchProvider.js
src/data/adapters/canonicalMatchAdapter.js
```

### Updated

```text
src/data/loadMatches.js
```

### Not changed

```text
src/data/matches.json
src/data/videos.json
src/utils/analyticsMetrics.js
src/components/*
src/styles.css
src/analytics.css
```

No match record was added, removed or edited in this step.

---

## 3. Current provider boundary

The current production provider is:

```text
src/data/providers/staticJsonMatchProvider.js
```

It owns access to the existing bundled dataset:

```text
src/data/matches.json
```

Conceptually:

```text
matches.json
↓
staticJsonMatchProvider.loadMatches()
```

The provider deliberately contains no:

- metric calculation;
- filtering;
- chart preparation;
- UI wording;
- React state;
- source-specific analysis logic.

Its responsibility is only to provide source records.

---

## 4. Current adapter boundary

The adapter is:

```text
src/data/adapters/canonicalMatchAdapter.js
```

It currently exports:

```text
adaptMatchRecord()
adaptMatchCollection()
```

The adapter validates that:

- the provider collection is an array;
- each match is an object record.

It then returns application records while preserving the current field set.

### Why the adapter is intentionally conservative

v1.1-06 is not the canonical-schema redesign.

The current public application already depends on the existing runtime shape, and v1.1-07 is the dedicated step for:

- field definitions;
- nullability;
- type rules;
- source/provenance structure;
- schema drift resolution;
- canonical identifiers;
- data dictionary.

Therefore v1.1-06 does **not** aggressively rename, drop, coerce or reinterpret fields.

The current adapter is a structural boundary first.

This minimizes regression risk while creating the location where source-specific mappings can later live.

---

## 5. Updated application-loading path

`src/data/loadMatches.js` no longer imports `matches.json` directly.

The current path is now:

```text
src/data/matches.json
↓
staticJsonMatchProvider
↓
canonicalMatchAdapter
↓
loadMatches()
↓
matchData
↓
StatsAnalysis / StatsTrends / MatchSearch / VideoLibrary
```

Existing consumers still import:

```text
matchData
```

from:

```text
src/data/loadMatches.js
```

Therefore no consumer component needs to know which provider supplied the records.

---

## 6. Provider replacement principle

Future providers should be introduced behind the provider boundary rather than imported directly by UI components.

Possible examples include:

```text
World Rugby provider
RugbyPass provider
Designated official data provider
Manual import provider
Local/private staging provider
Future event-level source
```

These names describe architectural possibilities only. They do not assume that any organisation has agreed to provide data.

The intended pattern is:

```text
Provider-specific source shape
↓
Provider access module
↓
Provider/source-specific mapping
↓
Canonical Match Model
↓
Shared analytics
```

---

## 7. Public/private boundary

v1.1-05 remains in force.

A provider module may be public-safe code while its actual raw/staging payload remains private.

For example:

```text
Public repository
├─ provider interface/code
├─ adapter/mapping code
├─ canonical schema
├─ validators
└─ synthetic fixtures

Local or genuinely private storage
├─ rights-uncertain raw payloads
├─ unpublished staging datasets
├─ private correspondence
└─ credentials / tokens
```

A public development branch is not a privacy boundary.

---

## 8. Public-ready-later principle

The provider/adapter architecture is designed so that work prepared internally can later be promoted to the public application deliberately.

The intended promotion path is:

```text
Raw / staging source
↓
Validation
↓
Provider
↓
Adapter
↓
Canonical Match Model
↓
Approved public dataset
↓
Analytics / UI
```

This means an internal collection workflow does not need to be discarded when publication becomes appropriate.

The publication decision remains separate from the technical ingestion decision.

---

## 9. Failure behavior

The new loader fails explicitly when:

- no valid provider is supplied;
- the provider does not implement `loadMatches()`;
- the provider returns a non-array collection;
- a collection member is not an object record.

This is preferable to silently passing an invalid provider payload deeper into analytics/UI code.

Field-level validation remains the responsibility of the existing match validators and the upcoming canonical-schema work.

---

## 10. Synchronous boundary for the current application

The current application bundles static JSON at build time, so the provider contract is currently synchronous:

```text
provider.loadMatches() → array
```

This is sufficient for the current public architecture and keeps v1.1-06 low-risk.

A future network/API provider may require an asynchronous application-loading lifecycle.

That should be introduced deliberately if an official/remote data route exists rather than changing the current React startup model speculatively.

---

## 11. What v1.1-06 does not do

This step does not:

- fetch data from Rugby.com.au automatically;
- scrape a website;
- call a World Rugby API;
- add new public match records;
- change metric formulas;
- change analysis charts;
- create a database;
- add authentication;
- expose a public API;
- implement event-level video tagging;
- finalize the canonical schema.

---

## 12. Handover value

A new developer can now locate source access independently from analytics/UI logic.

Current responsibilities are clearer:

```text
src/data/providers/
    source access

src/data/adapters/
    source → application-model boundary

src/data/loadMatches.js
    provider orchestration / compatibility export

src/utils/analyticsMetrics.js
    derived metrics / aggregation

src/components/
    presentation / interaction
```

This is the minimum architecture needed before more sophisticated provider-specific mappings are added.

---

## 13. Validation requirement

The public behavior should remain unchanged because:

- the same `src/data/matches.json` remains the active source;
- no record content changed;
- consumers still receive `matchData` from the same module path;
- adapter output preserves existing fields;
- metric/UI code was not modified.

Repository build / release validation should still be checked after the commit because the import graph changed.

---

## 14. Completion condition

v1.1-06 is complete when:

```text
source access is isolated behind a provider
+ provider records pass through an adapter boundary
+ loadMatches no longer imports matches.json directly
+ existing consumers remain unchanged
+ public dataset remains unchanged
+ public UI behavior remains unchanged after build validation
```

**Implementation status: COMPLETE — build validation pending/required**

---

## 15. Next step

Proceed to:

```text
v1.1-07
Canonical Schema / Data Dictionary
```

That step should reconcile the historical schema document with the current runtime model and define the canonical field contract that provider adapters must produce.
