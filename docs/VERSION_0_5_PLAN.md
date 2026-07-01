# Version 0.5 Plan

## Version

```text
Version 0.5
```

## Theme

```text
Data Storage Preparation / JSON Transition
```

## Status

```text
Planned
```

Version 0.5 prepares SVNS Stats Analyzer to move from JavaScript-based sample data toward JSON-based match data.

This version should keep the visible UI stable as much as possible. The main target is the data layer, not new analysis features.

---

## 1. Purpose

Version 0.5 exists to make future real match data easier to store, validate, load, and maintain.

Version 0.4 created the real-data foundation:

```text
- match data schema
- source metadata
- fetchedAt timestamp policy
- data coverage level
- stat definition version
- validation utility
- validate:data command
- build-time validation
- real data import workflow
```

Version 0.5 builds on that foundation by separating match data from application logic.

---

## 2. Main Goals

Version 0.5 goals:

```text
- move match data toward JSON-compatible storage
- introduce a data loading layer
- keep StatsAnalysis working after the storage change
- keep StatsTrends working after the storage change
- keep npm run validate:data working
- keep npm run build working
- prepare for future real Rugby.com.au-style records
```

The most important principle is:

```text
Change the data storage structure without changing the user-facing analysis behavior too much.
```

---

## 3. Recommended Implementation Stages

Version 0.5 should be implemented in the following stages.

```text
v0.5-01: Add Version 0.5 planning document
v0.5-02: Identify current sampleMatches.js dependencies
v0.5-03: Define matches.json structure
v0.5-04: Add src/data/matches.json
v0.5-05: Add data loader
v0.5-06: Update StatsAnalysis to use data loader
v0.5-07: Update StatsTrends to use data loader
v0.5-08: Update validate:data for JSON data
v0.5-09: Decide the role of sampleMatches.js
v0.5-10: Add JSON transition documentation
v0.5-11: Add Version 0.5 completion checklist
v0.5-12: Update PROJECT_MASTER_SPECIFICATION.md
```

---

## 4. Target Data Direction

The current data source is:

```text
src/data/sampleMatches.js
```

Version 0.5 should move toward:

```text
src/data/matches.json
```

The future direction is:

```text
JSON data file
  -> data loading layer
  -> validation utility
  -> analysis components
```

This allows future data sources to change without forcing every screen to know where the data came from.

---

## 5. Proposed Data Loader Role

The data loader should become the single place where app components receive match data.

Possible file:

```text
src/data/loadMatches.js
```

Expected role:

```text
- import JSON match records
- return normalized match records
- keep component imports stable
- provide future room for filtering or source switching
```

Initial implementation should stay simple.

It should not introduce Supabase, API fetching, scraping, authentication, or a complex repository pattern in Version 0.5.

---

## 6. What Version 0.5 Should Not Do

Version 0.5 should not attempt the following:

```text
- automatic Rugby.com.au fetching
- scraping
- Supabase integration
- admin authentication
- full data management UI
- mass import of all SVNS matches
- source-page numeric verification
- video library implementation
- match search implementation
- new analytics feature expansion
```

These are later-version topics.

---

## 7. Expected File Changes

Likely files to add:

```text
src/data/matches.json
src/data/loadMatches.js
docs/JSON_DATA_TRANSITION.md
docs/VERSION_0_5_COMPLETION_CHECKLIST.md
```

Likely files to update:

```text
src/components/StatsAnalysis.jsx
src/components/StatsTrends.jsx
scripts/validateSampleMatches.mjs
package.json
PROJECT_MASTER_SPECIFICATION.md
```

The exact list should be confirmed by checking current imports before editing.

---

## 8. Validation Policy

The validation rules introduced in Version 0.4 should remain active.

Version 0.5 must preserve:

```text
npm run validate:data
npm run build
```

The validation script may change from validating `sampleMatches.js` to validating `matches.json`, but the command name should stay the same if possible.

This keeps GitHub Actions and future workflow documentation stable.

---

## 9. UI Stability Policy

The following screens should continue to work after Version 0.5:

```text
- Home
- Stats Analysis
- Stats Trends
```

Version 0.5 should not intentionally change:

```text
- home menu behavior
- chart behavior
- trends filters
- match detail display
- language switching
- source metadata display
```

Any UI change should be limited to what is required by the data transition.

---

## 10. Completion Criteria

Version 0.5 can be treated as complete when:

```text
- match data is available from JSON or a JSON-compatible structure
- app components no longer need to import raw sample data directly
- data loader is in place
- StatsAnalysis opens normally
- StatsTrends opens normally
- source metadata still displays correctly
- npm run validate:data passes
- npm run build passes
- GitHub Actions is green
- JSON transition documentation exists
- Version 0.5 completion checklist exists
- PROJECT_MASTER_SPECIFICATION.md reflects Version 0.5
```

---

## 11. Expected Progress After Completion

After Version 0.5, the project progress estimate is:

```text
Initial MVP: about 85%
Long-term full platform: about 50%
```

Reason:

Version 0.5 does not add major user-facing features, but it makes the app much closer to real-data operation.

---

## 12. Recommended Commit Message

For this planning document:

```text
Add Version 0.5 planning document
```

