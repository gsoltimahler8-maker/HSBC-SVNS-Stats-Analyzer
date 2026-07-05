# Version 0.6 Plan

## Version

```text
Version 0.6
```

## Theme

```text
Real Data Import Preparation
```

## Status

```text
Planned
```

Version 0.6 prepares SVNS Stats Analyzer to add real Rugby.com.au-style match data safely.

This version should not attempt mass data import.  
The main goal is to define the workflow for adding one real match record to `matches.json`, validating it, and confirming that the app screens still work.

---

## 1. Purpose

Version 0.6 exists to bridge the gap between sample data and real match data.

Version 0.5 moved the active data source to:

```text
src/data/matches.json
```

Version 0.6 should now define how real match records are added to that JSON file.

The most important principle is:

```text
Add one real match safely before adding many real matches.
```

---

## 2. Main Goals

Version 0.6 goals:

```text
- choose one real match as the first import target
- define a real-data input template
- define source verification rules
- define how to distinguish sample data and real data
- add one real match record to matches.json
- validate the added record
- confirm StatsAnalysis still works
- confirm StatsTrends still works
- update documentation for real-data import
```

---

## 3. Recommended Implementation Stages

Version 0.6 should be implemented in the following stages.

```text
v0.6-01: Add Version 0.6 planning document
v0.6-02: Choose first real match import target
v0.6-03: Add real match input template
v0.6-04: Add real data import rules
v0.6-05: Decide sample data / real data distinction
v0.6-06: Add one real match record to matches.json
v0.6-07: Run JSON validation
v0.6-08: Confirm StatsAnalysis and StatsTrends display
v0.6-09: Update real data import workflow documentation
v0.6-10: Add Version 0.6 completion checklist
v0.6-11: Update PROJECT_MASTER_SPECIFICATION.md
```

---

## 4. First Real Match Policy

The first real match should be chosen carefully.

Recommended target:

```text
one Japan match with accessible Rugby.com.au Match Stats data
```

Preferred conditions:

```text
- one team perspective only
- clear date
- clear tournament name
- clear gender
- clear stage
- clear opponent
- clear score
- source URL available
- enough team stats available to fill core fields
```

Avoid starting with a match where key source data is unclear.

---

## 5. Real Data Record Requirements

Each real match record should follow the Version 0.4 / Version 0.5 schema.

Required or important fields:

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
tries
cleanBreaks
defendersBeaten
tackles
missedTackles
turnoversWon
turnoversConceded
possession
sourceProvider
sourceUrl
fetchedAt
dataCoverageLevel
dataCoverageSource
statDefinitionVersion
```

Unavailable stats should use:

```text
null
```

Do not use `0` when the source does not provide the value.

---

## 6. Source Policy

The preferred source for detailed team match stats is:

```text
Rugby.com.au Match Centre / Match Stats
```

Possible support sources:

```text
- SVNS match centre
- RugbyPass
- official team or tournament pages
```

Support sources may be used for context, but they should not be silently mixed into the same stat field without documentation.

Each real record should include:

```text
sourceProvider
sourceUrl
fetchedAt
dataCoverageLevel
dataCoverageSource
statDefinitionVersion
```

---

## 7. Sample Data / Real Data Distinction

Version 0.6 should decide how to distinguish sample records and real records.

Possible options:

```text
Option A: Use sourceProvider
Option B: Add dataType
Option C: Add isSample
```

Recommended direction:

```text
Add dataType
```

Possible values:

```text
sample
real
```

Reason:

```text
sourceProvider tells where the data came from.
dataType tells whether the record is sample data or real data.
```

If `dataType` is added, validation rules should eventually check it.

---

## 8. Validation Policy

After editing `matches.json`, run:

```bash
npm run validate:data
```

Before marking Version 0.6 complete, run:

```bash
npm run build
```

GitHub Actions should be green.

Validation should confirm structure and basic data quality.  
It does not replace manual source-page verification.

---

## 9. UI Check Policy

After adding one real match record, confirm:

```text
- Home opens normally
- Stats Analysis opens normally
- Stats Trends opens normally
- filters still work
- match count changes as expected
- source metadata appears
- data coverage status appears
- no chart crashes occur
```

Do not add new UI features unless required to prevent confusion.

---

## 10. What Version 0.6 Should Not Do

Version 0.6 should not attempt the following:

```text
- mass import of all SVNS matches
- automatic Rugby.com.au fetching
- scraping
- Supabase integration
- admin authentication
- full data management UI
- match search full implementation
- video library full implementation
- new analytics feature expansion
```

Those are later-version topics.

---

## 11. Completion Criteria

Version 0.6 can be treated as complete when:

```text
- one real match target is chosen
- real match input template exists
- real data import rules exist
- sample / real data distinction is decided
- one real record is added to matches.json
- npm run validate:data passes
- npm run build passes
- GitHub Actions is green
- StatsAnalysis displays normally
- StatsTrends displays normally
- source metadata remains visible
- Version 0.6 documentation exists
- PROJECT_MASTER_SPECIFICATION.md reflects Version 0.6
```

---

## 12. Expected Progress After Completion

After Version 0.6, the project progress estimate is:

```text
Initial MVP: about 90%
Long-term full platform: about 55%
```

Reason:

Version 0.6 does not complete the full real-data database, but it proves that real match data can be entered, validated, and displayed.

---

## 13. Recommended Commit Message

For this planning document:

```text
Add Version 0.6 planning document
```

