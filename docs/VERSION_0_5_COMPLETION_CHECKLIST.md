# Version 0.5 Completion Checklist

## Version

```text
Version 0.5
```

## Theme

```text
Data Storage Preparation / JSON Transition
```

## Purpose

This checklist defines the completion criteria for Version 0.5.

Version 0.5 is complete when match data has moved to a JSON-based active source, app screens can load data through a loader, validation works against the JSON data, and the transition is documented.

---

## 1. Required Files

Confirm these files exist:

```text
src/data/matches.json
src/data/loadMatches.js
docs/VERSION_0_5_PLAN.md
docs/JSON_DATA_TRANSITION.md
docs/VERSION_0_5_COMPLETION_CHECKLIST.md
```

---

## 2. Active Data Source

Confirm the active match data source is:

```text
src/data/matches.json
```

Confirm new match records should be added to:

```text
src/data/matches.json
```

Confirm this file is no longer the active source of truth:

```text
src/data/sampleMatches.js
```

Current status of `sampleMatches.js`:

```text
legacy backup
```

---

## 3. Data Loader

Confirm this file exists:

```text
src/data/loadMatches.js
```

Expected role:

```text
- imports matches.json
- exposes match data to app components
- gives the project one place to change data loading behavior later
```

Expected export:

```js
export const matchData = loadMatches();
```

---

## 4. StatsAnalysis Import

Confirm `src/components/StatsAnalysis.jsx` imports match data from the loader.

Expected import:

```js
import { matchData as sampleMatches } from '../data/loadMatches.js';
```

This import should not remain:

```js
import { sampleMatches } from '../data/sampleMatches.js';
```

---

## 5. StatsTrends Import

Confirm `src/components/StatsTrends.jsx` imports match data from the loader.

Expected import:

```js
import { matchData as sampleMatches } from '../data/loadMatches.js';
```

This import should not remain:

```js
import { sampleMatches } from '../data/sampleMatches.js';
```

---

## 6. Validation Script

Confirm `scripts/validateSampleMatches.mjs` reads JSON data directly with Node.js `fs`.

Expected start:

```js
import { readFileSync } from 'node:fs';
import { validateMatches, summarizeValidation } from '../src/utils/validateMatches.js';

const sampleMatches = JSON.parse(
  readFileSync(new URL('../src/data/matches.json', import.meta.url), 'utf8')
);
```

These imports should not remain:

```js
import { sampleMatches } from '../src/data/sampleMatches.js';
```

```js
import { matchData as sampleMatches } from '../src/data/loadMatches.js';
```

Reason:

```text
Vite and Node.js handle JSON imports differently.
The validation script should read matches.json directly.
```

---

## 7. Validation Command

Confirm this command still exists:

```bash
npm run validate:data
```

Expected behavior:

```text
- reads src/data/matches.json
- runs validateMatches
- prints total match count
- prints errors and warnings
- exits with failure on blocking validation errors
```

---

## 8. Build Check

Confirm this command passes:

```bash
npm run build
```

Expected behavior:

```text
- runs npm run validate:data
- runs vite build
- exits successfully
```

---

## 9. App Screen Checks

Confirm these screens open normally:

```text
Home
Stats Analysis
Stats Trends
```

Stats Analysis should show:

```text
- season filter
- gender filter
- team filter
- tournament filter
- match list
- match detail
- win/loss comparison chart
- candidate drivers
- source metadata
```

Stats Trends should show:

```text
- season filter
- gender filter
- team filter
- tournament filter
- opponent filter
- metric filter
- trend chart
- tournament averages
- opponent averages
- data availability metadata
```

---

## 10. Source Metadata Checks

Confirm source metadata still appears from JSON records:

```text
sourceProvider
sourceUrl
fetchedAt
dataCoverageLevel
dataCoverageSource
statDefinitionVersion
```

Confirm active records use:

```text
fetchedAt
```

Confirm active records do not use:

```text
lastFetched
```

---

## 11. sampleMatches.js Policy

For Version 0.5, `sampleMatches.js` may remain in the repository as:

```text
legacy backup
```

Do not treat it as the active data source.

Do not add new match records to it.

Future cleanup may delete or move it only after:

```text
- repository search works reliably
- no active imports remain
- app screens work from matches.json
- validation and build pass
```

---

## 12. Known Limitations After Version 0.5

These limitations are acceptable at the end of Version 0.5:

```text
- match data is still sample data
- no automatic Rugby.com.au fetching
- no scraping
- no Supabase integration
- no admin authentication
- no full data management UI
- no mass import of all SVNS matches
- no source-page numeric verification
- sampleMatches.js may still exist as legacy backup
```

These are not Version 0.5 failures.

---

## 13. Recommended Next Version Direction

Possible Version 0.6 direction:

```text
Real Data Import Preparation
```

Possible goals:

```text
- define real Rugby.com.au import template
- add manual real-data entry checklist
- add source verification fields
- test one real match record
- keep JSON validation active
```

Alternative Version 0.6 direction:

```text
Match Search Prototype
```

This should wait unless data structure stability is already confirmed.

---

## 14. Final Version 0.5 Checks

Before marking Version 0.5 complete, confirm:

```text
- GitHub Actions is green
- app opens normally
- Stats Analysis opens normally
- Stats Trends opens normally
- npm run validate:data passes
- npm run build passes
- src/data/matches.json exists
- src/data/loadMatches.js exists
- StatsAnalysis uses loadMatches.js
- StatsTrends uses loadMatches.js
- validation script reads matches.json with fs
- JSON transition documentation exists
- no active UI code imports sampleMatches.js directly
```

---

## 15. Recommended Commit Message

For this checklist:

```text
Add Version 0.5 completion checklist
```

