# Version 0.4 Completion Checklist

## Purpose

This checklist confirms whether Version 0.4 of SVNS Stats Analyzer is ready to be treated as complete.

Version 0.4 focuses on the real-data foundation.  
It does not aim to import real match data automatically yet.

The goal is to make the project ready for future real-data import by stabilizing:

```text
match data schema
source metadata
data validation
build-time validation
documentation
manual import workflow
```

---

## Version 0.4 theme

```text
Real Data Foundation
```

Version 0.4 prepares the app to move from sample data toward real structured match data.

---

## Completed foundation items

The following items should be complete before Version 0.4 is closed.

### 1. Match data schema

Status:

```text
Complete
```

Relevant file:

```text
MATCH_DATA_SCHEMA.md
```

Confirmed items:

```text
- 1 record = 1 team perspective in 1 match
- id / external IDs defined
- season / tournament / date / gender / stage / team / opponent / result defined
- core score fields defined
- Rugby.com.au-style team stats defined
- null policy defined
- possession / territory percentage-point policy defined
- source metadata defined
- fetchedAt official timestamp policy defined
- lastFetched legacy field removed
- derived metrics are not stored directly
```

---

### 2. Sample data aligned with schema

Status:

```text
Complete
```

Relevant file:

```text
src/data/sampleMatches.js
```

Confirmed items:

```text
- external object present
- rugbyComAu / svns / rugbyPass keys present
- sourceProvider present
- sourceUrl present
- fetchedAt present
- lastFetched removed
- dataCoverageLevel present
- dataCoverageSource present
- statDefinitionVersion present
- unavailable values use null
```

---

### 3. Source metadata displayed in analysis screens

Status:

```text
Complete
```

Relevant files:

```text
src/components/StatsAnalysis.jsx
src/components/StatsTrends.jsx
```

Confirmed items:

```text
- sourceProvider displayed
- fetchedAt displayed
- statDefinitionVersion displayed
- dataCoverageLevel displayed
- dataCoverageSource displayed where appropriate
- StatsAnalysis uses fetchedAt only
- StatsTrends uses fetchedAt only
- lastFetched UI fallback removed
```

---

### 4. Data validation utility

Status:

```text
Complete
```

Relevant file:

```text
src/utils/validateMatches.js
```

Confirmed validation coverage:

```text
- required fields
- duplicate match IDs
- external ID object
- gender allowed values
- result allowed values
- dataCoverageLevel allowed values
- date format
- fetchedAt ISO datetime format
- numeric fields number-or-null policy
- non-negative numeric values
- possession / territory 0-100 range
- team and opponent must not be the same
- sourceUrl basic format warning
```

---

### 5. Sample data validation script

Status:

```text
Complete
```

Relevant file:

```text
scripts/validateSampleMatches.mjs
```

Confirmed items:

```text
- imports sampleMatches
- runs validateMatches
- prints total match count
- prints error count
- prints warning count
- prints validation summary
- prints detailed errors
- prints detailed warnings
- exits with failure on blocking errors
```

---

### 6. npm validation command

Status:

```text
Complete
```

Relevant file:

```text
package.json
```

Confirmed command:

```bash
npm run validate:data
```

Expected script:

```json
"validate:data": "node scripts/validateSampleMatches.mjs"
```

---

### 7. Build-time validation

Status:

```text
Complete
```

Relevant file:

```text
package.json
```

Expected build behavior:

```text
npm run validate:data
↓
vite build
```

Expected script pattern:

```json
"build": "npm run validate:data && vite build --base=/HSBC-SVNS-Stats-Analyzer/"
```

This ensures GitHub Actions can detect blocking data issues before deployment.

---

### 8. Data validation documentation

Status:

```text
Complete
```

Relevant file:

```text
docs/DATA_VALIDATION_RULES.md
```

Confirmed items:

```text
- validation purpose
- validation flow
- validation severity
- required fields
- external IDs
- allowed gender values
- allowed result values
- allowed data coverage levels
- date and fetchedAt rules
- legacy timestamp policy
- numeric field rules
- percentage field rules
- team/opponent rule
- source field rules
- duplicate ID rule
- derived metrics policy
- current limitations
- future improvements
```

---

### 9. Real-data import workflow documentation

Status:

```text
Complete
```

Relevant file:

```text
docs/REAL_DATA_IMPORT_WORKFLOW.md
```

Confirmed items:

```text
- source priority
- manual import workflow
- external ID workflow
- fetchedAt workflow
- null vs zero policy
- percentage-point policy
- validation workflow
- build check workflow
- data coverage policy
- sourceProvider naming guidance
- statDefinitionVersion naming guidance
- quality checks before commit
- Version 0.4 non-scope items
- future import architecture candidates
```

---

### 10. Match detail UI readability

Status:

```text
Complete
```

Relevant files:

```text
src/styles.css
src/components/StatsAnalysis.jsx
```

Confirmed items:

```text
- match detail metrics are more readable
- metric labels are not blank
- tries label has fallback display
- metric layout works as list-style cards
- mobile display remains readable
```

---

## Final Version 0.4 checks

Before marking Version 0.4 complete, confirm:

```text
- GitHub Actions is green
- app opens normally
- Stats Analysis opens normally
- Stats Trends opens normally
- npm run validate:data passes
- npm run build passes
- match detail source metadata is visible
- trends data availability metadata is visible
- no active code relies on lastFetched
- sampleMatches.js has no lastFetched fields
```

---

## Known limitations after Version 0.4

The following limitations are expected and acceptable at the end of Version 0.4:

```text
- data is still sample data
- no automatic Rugby.com.au fetching
- no scraping
- no Supabase integration
- no admin authentication
- no full data management UI
- no mass import of all SVNS matches
- no source-page numeric verification
- no JSON migration yet
```

These are not Version 0.4 failures.  
They are future implementation candidates.

---

## Recommended next version direction

The recommended next version is:

```text
Version 0.5: Data Storage Preparation / JSON Transition
```

Possible Version 0.5 goals:

```text
- move sampleMatches.js toward JSON-compatible data
- consider matches.json structure
- add a data loading layer
- keep validation working after JSON transition
- prepare for real Rugby.com.au-style records
- keep UI stable while changing storage format
```

Alternative Version 0.5 direction:

```text
Version 0.5: Data Management Prototype
```

Possible goals:

```text
- admin-only placeholder screen
- local form mockup for match data
- validation preview before saving
- no real authentication yet
```

The safer next step is the JSON/storage transition, because it improves the data foundation without changing user-facing behavior too much.

---

## Version 0.4 completion statement

Version 0.4 can be considered complete when the checklist above is satisfied and the build passes.

Recommended completion commit message:

```text
Mark Version 0.4 as complete
```
