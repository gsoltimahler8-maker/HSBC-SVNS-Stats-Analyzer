# Data Validation Rules

## Purpose

This document defines the validation rules used by SVNS Stats Analyzer for match data.

The goal of validation is not to judge match performance, but to protect the reliability of the dataset before it is used for analysis, visualization, comparison, or future real-data import.

Validation currently runs against `sampleMatches.js` and is designed to support the future transition from sample data to structured real match data.

---

## Current validation flow

The current validation flow is:

1. `src/data/sampleMatches.js`
2. `src/utils/validateMatches.js`
3. `scripts/validateSampleMatches.mjs`
4. `npm run validate:data`
5. `npm run build`

The build command runs data validation before building the app.

If validation finds blocking errors, the build should fail.  
If validation finds only warnings, the build may continue, depending on the validation result.

---

## Validation script

The current npm command is:

```bash
npm run validate:data
```

This command runs:

```bash
node scripts/validateSampleMatches.mjs
```

The script checks the match records and prints:

- total match count
- error count
- warning count
- validation summary
- detailed error list
- detailed warning list

---

## Validation severity

Validation issues are divided into two levels.

### Error

An error indicates a blocking data problem.

Examples:

- missing required field
- invalid enum value
- invalid date format
- invalid numeric value
- duplicate match ID
- team and opponent are the same

Errors should be fixed before data is used for analysis.

### Warning

A warning indicates a non-blocking data quality issue.

Examples:

- missing external match IDs
- sample URL still using `example.com`
- source URL does not look like an HTTP or HTTPS URL

Warnings do not necessarily mean the app is broken, but they should be reviewed before real-data import.

---

## Required fields

Each match record should include the following required fields:

```text
id
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

These fields are required because they support:

- filtering
- comparison
- traceability
- source review
- future real-data import
- reproducible analysis

---

## External IDs

Each match record may include an `external` object.

Expected keys include:

```text
rugbyComAu
svns
rugbyPass
```

At least one external ID is preferred.

External IDs are used for traceability and future source reconciliation.  
Temporary sample data may contain `null` values, but real imported data should aim to preserve source-specific IDs whenever possible.

---

## Allowed gender values

Allowed values:

```text
Women
Men
```

These values are intentionally strict to avoid inconsistent filtering such as:

```text
women
Womens
Female
女子
Men's
```

Display labels can be translated in the UI, but stored data should remain stable.

---

## Allowed result values

Allowed values:

```text
W
L
D
NC
```

Meaning:

```text
W  = Win
L  = Loss
D  = Draw
NC = No contest / not classified
```

This keeps the data compact and consistent across English and Japanese UI labels.

---

## Allowed data coverage levels

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

The app should avoid mixing these levels silently in analysis.

When data coverage is mixed, the UI should show a warning or explanation.

---

## Date rules

The `date` field should use:

```text
YYYY-MM-DD
```

Example:

```text
2026-06-01
```

The `fetchedAt` field should use a valid ISO datetime string.

Example:

```text
2026-06-01T00:00:00Z
```

`fetchedAt` is the official field for the data retrieval timestamp.

The legacy field `lastFetched` is no longer used in the match data schema and should not be added to new records.

---

## Legacy timestamp policy

The project previously used `lastFetched` as a compatibility field while the match data schema was being stabilized.

As of Version 0.4, the app uses `fetchedAt` only.

Current policy:

```text
Use fetchedAt.
Do not use lastFetched.
Do not add lastFetched to new match records.
Do not rely on lastFetched in UI components.
```

If old records are imported from earlier experimental versions, they should be migrated to `fetchedAt` before being added to the active dataset.

---

## Numeric field rules

The following fields should be numbers or `null`:

```text
pointsFor
pointsAgainst
tries
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
```

A value should be `null` when the statistic is genuinely unavailable.

Do not use `0` as a substitute for unknown data.

Use `0` only when the stat is known to be zero.

---

## Percentage field rules

The following fields should be between `0` and `100`, or `null`:

```text
possession
territory
```

These fields should be stored as percentage-point values.

Correct:

```text
55
```

Incorrect:

```text
0.55
```

---

## Team and opponent rule

The `team` and `opponent` fields must not be the same.

Invalid example:

```text
team: Japan
opponent: Japan
```

Each match record is written from one team’s perspective.

Example:

```text
team: Japan
opponent: New Zealand
```

If the same match is recorded from both teams’ perspectives in the future, those should be separate records with separate IDs.

---

## Source fields

Each match record should include source metadata:

```text
sourceProvider
sourceUrl
fetchedAt
dataCoverageLevel
dataCoverageSource
statDefinitionVersion
```

These fields are essential because the app is intended to support transparent analysis.

The app should distinguish:

- Rugby.com.au Match Stats
- SVNS official data
- RugbyPass
- sample data
- unknown or limited data

Different sources may define or aggregate statistics differently, so the source must remain visible.

---

## Source URL rule

The `sourceUrl` field should normally start with:

```text
http://
```

or

```text
https://
```

Sample records may temporarily use placeholder URLs, but real data should point to the closest available source page.

---

## Duplicate ID rule

Each match record must have a unique `id`.

Duplicate IDs are blocking errors because they can break:

- match selection
- React rendering keys
- traceability
- future update logic
- source reconciliation

---

## Derived metrics

Derived metrics should generally not be stored directly in the match record.

Examples:

```text
pointDifferential = pointsFor - pointsAgainst
tackleSuccess = tackles / (tackles + missedTackles) * 100
```

These should be calculated in the app or utility layer.

This avoids storing stale derived values when base stats are corrected.

---

## Current limitation

The current validation system checks structure and basic data quality.

It does not yet verify whether the numbers match the original source page.

For example, validation can confirm that `cleanBreaks` is a valid number, but it does not confirm that the number is identical to Rugby.com.au.

Source-level verification remains a separate future task.

---

## Future improvements

Future validation improvements may include:

```text
- schema version migration checks
- source-specific required field rules
- Rugby.com.au import format validation
- warnings for mixed data coverage in filtered analysis
- stricter checks for real-data mode
- automated validation reports
- CI summary output
- JSON-based match data validation
```

---

## Operational principle

Validation should protect the app from silent data corruption.

When in doubt:

```text
- unknown data should be null
- source uncertainty should be explicit
- data coverage should be visible
- sample data should not be treated as real data
- derived metrics should be recalculated, not manually stored
- retrieval timestamps should use fetchedAt
```

The project should prioritize traceability and reproducibility over filling every field.
