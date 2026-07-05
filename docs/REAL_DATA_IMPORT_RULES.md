# Real Data Import Rules

## Version

```text
Version 0.6
```

## Purpose

This document defines the rules for importing real match data into SVNS Stats Analyzer.

The active data file is:

```text
src/data/matches.json
```

These rules apply when adding real Rugby.com.au-style match records to that file.

---

## 1. Primary Source Rule

The primary source for team match statistics is:

```text
Rugby.com.au Match Stats
```

Use Rugby.com.au Match Stats for numeric match data such as:

```text
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
penaltiesConceded
yellowCards
redCards
```

Do not overwrite Rugby.com.au Match Stats values with values from another source unless a future project decision explicitly changes the data policy.

---

## 2. SVNS Official Cross-Check Rule

SVNS official information may be used to verify:

```text
stage
```

Examples:

```text
Pool
Quarter-Final
Semi-Final
Bronze Final
Final
```

SVNS official information should not be used as the normal source for Rugby.com.au-style team stat values.

Reason:

```text
The app's detailed team-stat layer is based on Rugby.com.au Match Stats.
The official SVNS source is useful for match position and competition structure, but not the primary source for this app's stat fields.
```

---

## 3. Match Identity Rule

Each real match record should have a stable internal ID.

Recommended format:

```text
R-{season}-{genderCode}-{tournamentCode}-{rugbyComAuId}-{teamCode}-{opponentCode}
```

Example:

```text
R-202526-W-DUB-949558-JPN-FJI
```

Meaning:

```text
R = real data
202526 = season
W = Women
DUB = Dubai
949558 = Rugby.com.au match ID
JPN = Japan
FJI = Fiji
```

---

## 4. dataType Rule

Real records should include:

```json
"dataType": "real"
```

Sample records should eventually include:

```json
"dataType": "sample"
```

Purpose:

```text
sourceProvider tells where the data came from.
dataType tells whether the record is sample data or real data.
```

Do not rely on `sourceProvider` alone to distinguish sample and real records.

---

## 5. Unknown Value Rule

If a stat is not available from the source, use:

```json
null
```

Do not use:

```json
0
```

unless the source confirms that the value is actually zero.

Example:

```json
"territory": null
```

Reason:

```text
Unknown and zero are different meanings.
```

---

## 6. Timestamp Rule

Use:

```text
fetchedAt
```

Do not use:

```text
lastFetched
```

`fetchedAt` should be an ISO datetime string.

Example:

```json
"fetchedAt": "2026-07-05T00:00:00Z"
```

---

## 7. Source Metadata Rule

Every real record should include:

```text
sourceProvider
sourceUrl
fetchedAt
dataCoverageLevel
dataCoverageSource
statDefinitionVersion
dataType
```

Recommended values for Rugby.com.au Match Stats records:

```json
"sourceProvider": "Rugby.com.au Match Stats",
"dataCoverageLevel": "full_match_stats",
"dataCoverageSource": "Rugby.com.au Match Stats",
"statDefinitionVersion": "v1-rugby-com-au-match-stats",
"dataType": "real"
```

---

## 8. Record Perspective Rule

Each match record is written from one team perspective.

Example:

```text
team: Japan
opponent: Fiji
pointsFor: 22
pointsAgainst: 12
```

If the opponent-side record is needed later, it should be added as a separate record.

Do not mix both teams' perspective into one record.

---

## 9. Validation Rule

After editing `matches.json`, run:

```bash
npm run validate:data
```

Before deployment, run:

```bash
npm run build
```

GitHub Actions should be green.

Validation checks structure and basic data quality.  
It does not replace manual source reading.

---

## 10. First Real Data Rule

Do not import many records at once at the start.

The first real data import should be:

```text
one match record
```

Reason:

```text
The first real record is used to test the workflow, validation, UI display, and source metadata behavior.
```

Mass import should wait until one real record works correctly.

---

## 11. First Target Match

The first real match target is:

```text
2025-26 Dubai SVNS Women
Japan Women 7s vs Fiji Women 7s
Japan 22 - 12 Fiji
Rugby.com.au Match ID: 949558
Stage: Bronze Final
```

Primary stats source:

```text
Rugby.com.au Match Stats
```

Stage handling:

```text
Stage is treated as Bronze Final.
Future official cross-check may verify or adjust stage information if needed.
```

---

## 12. What Not To Do In Version 0.6

Do not add the following in Version 0.6:

```text
- mass import of all SVNS matches
- automatic fetching
- scraping
- Supabase integration
- admin authentication
- full data management UI
- match search full implementation
- video library full implementation
```

Version 0.6 is for proving that one real record can be added safely.

---

## 13. Recommended Commit Message

For this document:

```text
Add real data import rules
```

