# SVNS Stats Analyzer — Canonical Match Data Dictionary

**Canonical schema:** `v1.1-canonical-match-1`  
**Roadmap step:** v1.1-07  
**Updated:** 2026-08-20

---

## 1. Purpose

This is the handover-oriented field dictionary for the canonical team-match record.

Machine-readable definitions:

```text
src/data/schema/canonicalMatchSchema.js
```

Authoritative schema policy:

```text
MATCH_DATA_SCHEMA.md
```

---

## 2. Field dictionary

| Field | Type | Unit | Nullable | Required | Class | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | string | — | No | Yes | Identity | Application-level unique team-match record ID |
| `external` | object | — | No | No | Identity | Container for external provider IDs |
| `external.rugbyComAu` | string | — | Yes | No | Provenance ID | Rugby.com.au match ID when known |
| `external.svns` | string | — | Yes | No | Provenance ID | SVNS/World Rugby-side match ID when known |
| `external.rugbyPass` | string | — | Yes | No | Provenance ID | RugbyPass match ID when known |
| `season` | string | — | No | Yes | Competition | Normally `YYYY-YY` |
| `tournament` | string | — | No | Yes | Competition | Application-normalized tournament label |
| `date` | string | ISO date | No | Yes | Competition | `YYYY-MM-DD` |
| `gender` | enum | — | No | Yes | Competition | `Women` / `Men` |
| `stage` | string | — | No | Yes | Competition | Tournament stage/round label |
| `team` | string | — | No | Yes | Team | Team represented by the record |
| `opponent` | string | — | No | Yes | Team | Opponent |
| `result` | enum | — | No | Yes | Result | `W` / `L` / `D` / `NC`; canonical source of truth |
| `pointsFor` | number | points | No | Yes | Raw stat | Team points |
| `pointsAgainst` | number | points | No | Yes | Raw stat | Opponent points |
| `tries` | number | count | Yes | No | Raw stat | Tries scored |
| `metres` | number | metres | Yes | No | Raw stat | Metres gained |
| `carries` | number | count | Yes | No | Raw stat | Carries |
| `passes` | number | count | Yes | No | Raw stat | Passes |
| `offloads` | number | count | Yes | No | Raw stat | Offloads |
| `cleanBreaks` | number | count | Yes | No | Raw stat | Clean breaks |
| `defendersBeaten` | number | count | Yes | No | Raw stat | Defenders beaten |
| `tackles` | number | count | Yes | No | Raw stat | Completed tackles under source definition |
| `missedTackles` | number | count | Yes | No | Raw stat | Missed tackles |
| `turnoversWon` | number | count | Yes | No | Raw stat | Turnovers won |
| `turnoversConceded` | number | count | Yes | No | Raw stat | Turnovers conceded |
| `rucksWon` | number | count | Yes | No | Raw stat | Rucks won |
| `rucksLost` | number | count | Yes | No | Raw stat | Rucks lost |
| `possession` | number | percentage points | Yes | No | Raw stat | 0–100; not possession count |
| `territory` | number | percentage points | Yes | No | Raw stat | 0–100 |
| `penaltiesConceded` | number | count | Yes | No | Raw stat | Penalties conceded |
| `yellowCards` | number | count | Yes | No | Raw stat | Yellow cards |
| `redCards` | number | count | Yes | No | Raw stat | Red cards |
| `sourceProvider` | string | — | No | Yes | Provenance | Primary source/provider label |
| `sourceUrl` | string | URL | No | Yes | Provenance | Traceable source URL |
| `fetchedAt` | string | ISO datetime | No | Yes | Provenance | Collection/verification timestamp |
| `dataCoverageLevel` | enum | — | No | Yes | Coverage | `full_match_stats` / `limited_data` / `results_only` / `unknown` |
| `dataCoverageSource` | string | — | No | Yes | Coverage | Explanation/source for coverage classification |
| `statDefinitionVersion` | string | — | No | Yes | Provenance | Source stat-definition/mapping version |
| `dataType` | enum | — | Yes | No | Compatibility | `real` / `sample`; optional during migration |
| `teamResult` | string | — | Yes | No | Compatibility | Legacy alias; prefer `result` |
| `matchResult` | string | — | Yes | No | Compatibility | Presentation-oriented legacy field |
| `winner` | string | — | Yes | No | Compatibility | Presentation-oriented legacy field |
| `loser` | string | — | Yes | No | Compatibility | Presentation-oriented legacy field |

---

## 3. Nullability rules

Canonical rule:

```text
Known observed zero = 0
Unknown/unavailable/not captured = null
```

The following must never be used as substitutes for missing numeric values:

```text
0
''
'0'
'—'
'N/A'
```

The canonical adapter converts absent/empty known nullable raw-stat fields to `null`.

---

## 4. Raw vs derived

The canonical record is a raw/source-aligned layer.

Derived metrics do **not** belong in the raw record.

Examples of calculated metrics:

| Metric | Formula / aggregation principle |
| --- | --- |
| Points Differential | `pointsFor - pointsAgainst` |
| Win Rate | wins / known W/L matches × 100 |
| Points per Match | mean pointsFor over selected matches |
| Tries per Match | mean tries over selected matches |
| Points per 100 Metres | pooled pointsFor / pooled metres × 100 |
| Tries per 100 Metres | pooled tries / pooled metres × 100 |
| Metres per Carry | pooled metres / pooled carries |
| Clean Breaks per 100 Carries | pooled cleanBreaks / pooled carries × 100 |
| Defenders Beaten per Carry | pooled defendersBeaten / pooled carries |
| Turnover Differential | turnoversWon − turnoversConceded |
| Penalties per Match | mean penaltiesConceded |
| Tackle Success | pooled tackles / pooled (tackles + missedTackles) × 100 |
| Ruck Success | pooled rucksWon / pooled (rucksWon + rucksLost) × 100 |

Derived metric definitions remain owned by:

```text
src/utils/analyticsMetrics.js
```

until the dedicated v1.1-08 separation step.

---

## 5. Denominator rules

For any ratio metric:

```text
missing numerator → null
missing denominator → null
denominator = 0 → null
```

Do not coerce invalid or unavailable ratios to zero.

For aggregate ratios, pool valid numerators and denominators where mathematically appropriate rather than averaging already-calculated per-match ratios.

---

## 6. Source-definition rule

Field names in the canonical model do not, by themselves, guarantee identical definitions across providers.

Example:

```text
tackles
cleanBreaks
turnoversWon
```

may require provider-specific definition review before data from different sources are mixed.

Use:

```text
statDefinitionVersion
```

to distinguish materially different provider definitions/mappings.

Do not silently merge incompatible source definitions.

---

## 7. Coverage rule

`dataCoverageLevel` describes how complete the record is, not how trustworthy a rights/licensing position is.

Allowed values:

```text
full_match_stats
limited_data
results_only
unknown
```

A record may be technically complete while still requiring separate source/use-permission review.

---

## 8. Compatibility migration

Preferred canonical fields:

```text
result
external.*
date
sourceProvider
```

Older project documents may refer to historical names such as:

```text
teamResult
matchId
matchDate
source
```

Those names must not be introduced into new provider adapters as competing canonical fields.

Where a provider uses those concepts, map them into the canonical names.

---

## 9. Future entities not yet in this match schema

The following are intentionally outside the current team-match record and should receive their own schemas when implemented:

```text
Player
Player Match Stats
Tournament entity
Team entity
Video source entity
Video-tagged Event
Event Sequence
Lineup / combination data
Spatial / pitch-position data
```

Do not overload the match record with future event/player structures.

---

## 10. Handover rule

A replacement implementation should be able to change:

```text
Provider
Provider mapping
Storage
Backend
```

without changing the semantic meaning of the canonical fields consumed by analytics.

That is the principal purpose of this dictionary.
