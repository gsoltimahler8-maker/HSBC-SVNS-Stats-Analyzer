# Real Data Import Workflow

## Purpose

This document defines the recommended workflow for adding real match data to SVNS Stats Analyzer.

Version 0.4 does not implement automatic data fetching, scraping, Supabase, or a full data management screen.  
Instead, it prepares a safe foundation for future real-data import by defining the data schema, validation rules, and operational workflow.

The purpose of this workflow is to prevent silent data corruption when moving from sample data to real match data.

---

## Current status

As of Version 0.4, the project has the following real-data foundation:

```text
MATCH_DATA_SCHEMA.md
docs/DATA_VALIDATION_RULES.md
src/data/sampleMatches.js
src/utils/validateMatches.js
scripts/validateSampleMatches.mjs
npm run validate:data
build-time validation
```

The active sample dataset still lives in:

```text
src/data/sampleMatches.js
```

Future real data may later move to JSON files, a database, or a managed import workflow.

---

## Source priority

The primary source for team match statistics is:

```text
Rugby.com.au Match Stats
```

Secondary or supporting sources may include:

```text
SVNS official pages
RugbyPass
team announcements
competition reports
manual review notes
```

Supporting sources must not be silently mixed into the main Rugby.com.au-style team stats.

If a statistic comes from a different source or has a different definition, it should be marked clearly through:

```text
sourceProvider
sourceUrl
dataCoverageLevel
dataCoverageSource
statDefinitionVersion
```

---

## Import principle

Each record represents one team perspective in one match.

Example:

```text
Japan vs New Zealand
team: Japan
opponent: New Zealand
```

If both team perspectives are recorded in the future, they should be stored as separate records with separate IDs.

---

## Manual import workflow

When adding real match data manually, use the following workflow.

### Step 1: Identify the match

Confirm:

```text
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
```

Use stable naming and avoid mixing seasons or tournaments.

---

### Step 2: Confirm source page

Record the closest available source page.

Required source metadata:

```text
sourceProvider
sourceUrl
fetchedAt
dataCoverageLevel
dataCoverageSource
statDefinitionVersion
```

`fetchedAt` should use a valid ISO datetime string.

Example:

```text
2026-06-01T00:00:00Z
```

Do not use `lastFetched`.

---

### Step 3: Create or update external IDs

Use the `external` object.

Expected keys:

```text
rugbyComAu
svns
rugbyPass
```

Use `null` when a value is unavailable.

Example:

```js
external: {
  rugbyComAu: '950101',
  svns: 'dubai-w-001',
  rugbyPass: null
}
```

---

### Step 4: Enter base stats only

Enter source statistics as base values.

Do not manually store derived metrics such as:

```text
pointDifferential
tackleSuccess
attackEfficiency
defensiveEfficiency
```

These should be calculated in the app or utility layer.

---

### Step 5: Use null for unknown values

Use `null` when a statistic is not available or has not been confirmed.

Correct:

```js
territory: null
```

Do not use `0` unless the statistic is confirmed to be zero.

Incorrect:

```js
territory: 0
```

when the real value is simply unknown.

---

### Step 6: Check percentage values

The following fields should use percentage-point values:

```text
possession
territory
```

Correct:

```text
55
```

Incorrect:

```text
0.55
```

---

### Step 7: Run validation

Run:

```bash
npm run validate:data
```

The script should show:

```text
total match count
error count
warning count
validation summary
error details
warning details
```

Blocking errors should be fixed before the data is used.

---

### Step 8: Build check

Run or confirm the build process:

```bash
npm run build
```

The build process already runs data validation before building the app.

If validation fails, the build should fail.

---

## Data coverage policy

Each match record must indicate data coverage.

Allowed values:

```text
full_match_stats
limited_data
results_only
unknown
```

Meaning:

```text
full_match_stats = Detailed match statistics are available
limited_data     = Some statistics are available, but coverage is incomplete
results_only     = Only result-level information is available
unknown          = Data coverage has not been confirmed
```

The app should avoid presenting mixed-coverage data as if it were fully comparable.

---

## Recommended sourceProvider values

Suggested values:

```text
Rugby.com.au
SVNS
RugbyPass
Manual entry
Sample data
Unknown
```

Use consistent naming.

Do not alternate between variations such as:

```text
rugby.com.au
Rugby.com
Rugby AU
Rugby Australia
```

unless a deliberate normalization rule is added.

---

## Recommended statDefinitionVersion values

Current sample-data version:

```text
v1-rugby-com-au-match-stats
```

Future examples:

```text
v2-rugby-com-au-match-stats
v1-svns-results-only
v1-manual-entry-limited
```

Change the version when the stat definition, source structure, or import assumptions change.

---

## Quality checks before commit

Before committing a real-data change, confirm:

```text
- match ID is unique
- season is correct
- gender is Women or Men
- team and opponent are not the same
- score matches the source
- sourceProvider is present
- sourceUrl is present
- fetchedAt is present
- dataCoverageLevel is present
- statDefinitionVersion is present
- unknown values are null, not fake zeroes
- npm run validate:data passes
- npm run build passes
```

---

## What Version 0.4 does not do

Version 0.4 does not yet do the following:

```text
- automatic Rugby.com.au data fetching
- scraping
- browser automation
- source-page numeric verification
- Supabase integration
- admin authentication
- full data management UI
- mass import of all SVNS matches
```

These should remain future tasks.

---

## Future import architecture candidates

Possible future approaches:

```text
Option A: Continue using JavaScript data files
Option B: Move match data into JSON files
Option C: Add a local import script for Rugby.com.au-style data
Option D: Use GitHub-based manual review workflow
Option E: Move storage to Supabase
Option F: Add an authenticated admin data management screen
```

The safest next step after Version 0.4 is likely:

```text
Move sampleMatches.js toward a JSON-compatible structure while keeping the app stable.
```

---

## Operational principle

Real data should be slower to add but easier to trust.

The project should prefer:

```text
traceability over speed
null over fake zero
explicit source limits over silent mixing
schema stability over quick display hacks
validation before visualization
```

This keeps the platform useful for analysis rather than merely decorative display.
