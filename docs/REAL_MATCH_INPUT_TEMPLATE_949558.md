# Real Match Input Template: Rugby.com.au Match ID 949558

## Version

```text
Version 0.6
```

## Purpose

This document is the first real match input template for SVNS Stats Analyzer.

The target match is:

```text
2025-26 Dubai SVNS Women
Japan Women 7s vs Fiji Women 7s
Japan 22 - 12 Fiji
Rugby.com.au Match ID: 949558
```

This template is used to prepare one real match record for `src/data/matches.json`.

---

## 1. Source Policy

Primary source for match stats:

```text
Rugby.com.au Match Stats
```

Source URL:

```text
https://www.rugby.com.au/match-centre/261/2026/949558?tab=Match-Stats
```

The numeric match stats should be taken from Rugby.com.au Match Stats.

SVNS official information should only be used to verify:

```text
stage
```

Do not use SVNS official stats to overwrite Rugby.com.au Match Stats values.

---

## 2. Stage Policy

For this match, the stage should be entered as:

```text
Bronze Final
```

Reason:

```text
The match is already identified as the Bronze Final in the project workflow.
Stage verification against SVNS official information can be handled later if needed.
```

---

## 3. JSON Record Draft

Copy this object into `src/data/matches.json` when adding the first real record.

Add it as a new object inside the top-level JSON array.

```json
{
  "id": "R-202526-W-DUB-949558-JPN-FJI",
  "external": {
    "rugbyComAu": "949558",
    "svns": null,
    "rugbyPass": null
  },
  "season": "2025-26",
  "tournament": "Dubai SVNS",
  "date": "2025-11-30",
  "gender": "Women",
  "stage": "Bronze Final",
  "team": "Japan",
  "opponent": "Fiji",
  "result": "W",
  "pointsFor": 22,
  "pointsAgainst": 12,
  "tries": 4,
  "carries": 59,
  "passes": 67,
  "offloads": 4,
  "cleanBreaks": 8,
  "defendersBeaten": 18,
  "tackles": 6,
  "missedTackles": 9,
  "turnoversWon": 1,
  "turnoversConceded": 1,
  "rucksWon": 22,
  "rucksLost": 1,
  "possession": 72,
  "territory": null,
  "penaltiesConceded": 3,
  "yellowCards": 0,
  "redCards": 0,
  "sourceProvider": "Rugby.com.au Match Stats",
  "sourceUrl": "https://www.rugby.com.au/match-centre/261/2026/949558?tab=Match-Stats",
  "fetchedAt": "2026-07-05T00:00:00Z",
  "dataCoverageLevel": "full_match_stats",
  "dataCoverageSource": "Rugby.com.au Match Stats",
  "statDefinitionVersion": "v1-rugby-com-au-match-stats",
  "dataType": "real"
}
```

---

## 4. Source Values Used

Japan-side values used in the draft record:

| Field | Value | Source label |
|---|---:|---|
| pointsFor | 22 | Score |
| pointsAgainst | 12 | Score |
| tries | 4 | Attack / Tries |
| carries | 59 | Attack / Carries |
| passes | 67 | Attack / Passes |
| offloads | 4 | Attack / Offloads |
| cleanBreaks | 8 | Attack / Clean Breaks |
| defendersBeaten | 18 | Attack / Defenders Beaten |
| tackles | 6 | Defence / Tackles |
| missedTackles | 9 | Defence / Missed Tackles |
| turnoversWon | 1 | Defence / Turnovers Won |
| turnoversConceded | 1 | Attack / Turnovers Conceded |
| rucksWon | 22 | Breakdown / Rucks Won |
| rucksLost | 1 | Breakdown / Rucks Lost |
| possession | 72 | Possession |
| penaltiesConceded | 3 | Discipline / Penalties Conceded |
| yellowCards | 0 | Discipline / Yellow Cards |
| redCards | 0 | Discipline / Red Cards |

---

## 5. Fields Left Null

The following field is left as `null`:

```text
territory
```

Reason:

```text
Territory is not available in the Rugby.com.au Match Stats values used for this record.
```

---

## 6. Validation After Import

After adding this record to `matches.json`, run:

```bash
npm run validate:data
```

Then run:

```bash
npm run build
```

Expected result:

```text
- validation passes
- build passes
- StatsAnalysis opens normally
- StatsTrends opens normally
- the new real record appears when filters match 2025-26 / Women / Japan / Dubai SVNS
```

---

## 7. Recommended Commit Message

For adding this template:

```text
Add first real match input template
```

