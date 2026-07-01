# JSON Data Transition

## Version

```text
Version 0.5
```

## Purpose

This document defines how SVNS Stats Analyzer handles the transition from JavaScript sample data to JSON-based match data.

The goal is to make future real match data easier to add, validate, and maintain without changing every UI component.

---

## 1. Active Data Source

The active match data source is:

```text
src/data/matches.json
```

New match records should be added to:

```text
src/data/matches.json
```

Do not add new active match records to:

```text
src/data/sampleMatches.js
```

---

## 2. Data Loader

Application screens should not import `matches.json` directly.

Application screens should receive match data through:

```text
src/data/loadMatches.js
```

Current loader export:

```js
export const matchData = loadMatches();
```

Components may import it like this:

```js
import { matchData as sampleMatches } from '../data/loadMatches.js';
```

The alias `sampleMatches` may remain temporarily inside components to reduce unnecessary code churn during the transition.

---

## 3. Current Component Policy

The following screens should use `loadMatches.js`:

```text
src/components/StatsAnalysis.jsx
src/components/StatsTrends.jsx
```

These components should not directly import:

```text
src/data/sampleMatches.js
```

They should also avoid importing `matches.json` directly.

Reason:

```text
The loader gives the project one place to change data loading behavior later.
```

---

## 4. Validation Script Policy

The validation script currently reads JSON directly with Node.js `fs`.

Current validation target:

```text
src/data/matches.json
```

Current script:

```text
scripts/validateSampleMatches.mjs
```

This is acceptable because Node.js and Vite handle JSON imports differently.

The command should remain:

```bash
npm run validate:data
```

The command name should stay stable even if the internal implementation changes.

---

## 5. sampleMatches.js Policy

The legacy file is:

```text
src/data/sampleMatches.js
```

Current status:

```text
legacy backup
```

It should not be treated as the active source of truth.

For now, it may remain in the repository as a fallback reference while the JSON transition is verified.

Future options:

```text
- keep it as a historical reference
- move it to documentation or fixtures
- delete it after all direct references are confirmed removed
```

Do not delete it until:

```text
- StatsAnalysis works from matches.json
- StatsTrends works from matches.json
- npm run validate:data passes
- npm run build passes
- GitHub Actions is green
- repository search confirms no active imports from sampleMatches.js
```

---

## 6. JSON Record Shape

Each record in `matches.json` should follow the Version 0.4 match data schema.

Required or important fields include:

```text
id
external
season
tournament
date
gender
stage
team
opponent
result
pointsFor
pointsAgainst
sourceProvider
sourceUrl
fetchedAt
dataCoverageLevel
dataCoverageSource
statDefinitionVersion
```

Unavailable numeric stats should use:

```text
null
```

Do not use `0` when the value is unknown.

---

## 7. Timestamp Policy

Use:

```text
fetchedAt
```

Do not add:

```text
lastFetched
```

`lastFetched` is a legacy field and should not be used by active data records or active UI components.

---

## 8. Source Metadata Policy

Each match record should include:

```text
sourceProvider
sourceUrl
fetchedAt
dataCoverageLevel
dataCoverageSource
statDefinitionVersion
```

These fields are required for traceability.

For sample records, `sourceProvider` may remain:

```text
Sample data
```

For future real data, `sourceProvider` should identify the actual source, such as:

```text
Rugby.com.au Match Centre
```

---

## 9. Validation Workflow

After editing `matches.json`, run:

```bash
npm run validate:data
```

Before merging or deploying, run:

```bash
npm run build
```

GitHub Actions should also run the build check.

If validation fails, fix the JSON data before adding more records.

---

## 10. What This Transition Does Not Do

This transition does not add:

```text
- automatic Rugby.com.au fetching
- scraping
- Supabase integration
- admin authentication
- full data management UI
- mass import of all SVNS matches
- source-page numeric verification
```

Those remain future implementation topics.

---

## 11. Recommended Commit Message

For this document:

```text
Add JSON data transition documentation
```

