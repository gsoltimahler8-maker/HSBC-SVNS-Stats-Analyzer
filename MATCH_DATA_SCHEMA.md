# SVNS Stats Analyzer — Canonical Match Data Schema

**Schema version:** `v1.1-canonical-match-1`  
**Roadmap step:** v1.1-07  
**Updated:** 2026-08-20  
**Status:** Authoritative for the current v1.1 application model

---

## 1. Purpose

This document defines the canonical team-match record used by SVNS Stats Analyzer after the v1.1 provider/adapter separation.

The authoritative runtime schema metadata lives in:

```text
src/data/schema/canonicalMatchSchema.js
```

The canonical data dictionary is documented in:

```text
docs/canonical-match-data-dictionary.md
```

Older v0.x documents may still describe historical import conventions. Where those documents conflict with this file or the machine-readable schema, this v1.1 schema takes precedence.

---

## 2. Canonical data flow

```text
Provider source
↓
Provider implementation
↓
Provider-specific mapping when needed
↓
Canonical Match Adapter
↓
Canonical team-match record
↓
Derived Metrics Engine
↓
Analysis / Trends / Search / Video context
```

Current production provider:

```text
src/data/providers/staticJsonMatchProvider.js
```

Current canonical adapter:

```text
src/data/adapters/canonicalMatchAdapter.js
```

Current active source file:

```text
src/data/matches.json
```

---

## 3. Record grain

The canonical record grain is:

> **one record = one team perspective for one match**

Example:

```text
team: Japan
opponent: Australia
```

The record stores statistics from the `team` perspective.

This model is intentionally independent from the source provider. A future official World Rugby, RugbyPass or other provider adapter should map its source format into this same canonical shape.

---

## 4. Required canonical fields

The following fields are required:

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

### `id`

```text
Type: string
Nullable: no
```

Application-level unique team-match record ID.

The internal ID must not be assumed to equal any external provider match ID.

---

### `external`

```js
external: {
  rugbyComAu: string | null,
  svns: string | null,
  rugbyPass: string | null
}
```

`external` is the container for provider/external identifiers.

The adapter normalizes the known keys so unavailable identifiers use `null` rather than an empty string or missing property.

External IDs are provenance / reconciliation keys, not the canonical application record ID.

---

### Competition / identity fields

```js
season: string
tournament: string
date: string
gender: 'Women' | 'Men'
stage: string
team: string
opponent: string
result: 'W' | 'L' | 'D' | 'NC'
```

Rules:

- `date` uses `YYYY-MM-DD`.
- `team` and `opponent` must not be identical.
- `result` is the canonical result field from the `team` perspective.
- UI labels may be localized, but canonical values remain source-independent application values.

---

## 5. Score fields

```js
pointsFor: number
pointsAgainst: number
```

These fields are required and non-negative.

They represent the score from the canonical `team` perspective.

Derived point differential is not stored:

```text
Points Differential = pointsFor - pointsAgainst
```

---

## 6. Nullable raw-stat fields

The canonical model recognizes the following nullable raw-stat fields:

```text
tries
metres
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

Rules:

```text
observed zero → 0
unknown / unavailable / not captured → null
```

Do not use `0` to represent missing data.

The canonical adapter normalizes missing/empty values for these known nullable fields to `null`.

### Units

| Field | Unit |
| --- | --- |
| tries | count |
| metres | metres |
| carries | count |
| passes | count |
| offloads | count |
| cleanBreaks | count |
| defendersBeaten | count |
| tackles | count |
| missedTackles | count |
| turnoversWon | count |
| turnoversConceded | count |
| rucksWon | count |
| rucksLost | count |
| possession | percentage points, 0–100 |
| territory | percentage points, 0–100 |
| penaltiesConceded | count |
| yellowCards | count |
| redCards | count |

`possession: 55` means 55%, not `0.55`.

---

## 7. Provenance fields

```js
sourceProvider: string
sourceUrl: string
fetchedAt: string
dataCoverageLevel: string
dataCoverageSource: string
statDefinitionVersion: string
```

### `sourceProvider`

Human-readable primary source/provider label for the record.

Examples currently used by the project include source labels for sample data and Rugby.com.au Match Stats.

This field describes provenance. It must not be interpreted as permission or licensing status.

### `sourceUrl`

Traceable source URL.

It should normally use `http://` or `https://`.

### `fetchedAt`

Valid ISO datetime representing when the source record was collected or verified.

`lastFetched` is not part of the canonical v1.1 model.

### `dataCoverageLevel`

Allowed values:

```text
full_match_stats
limited_data
results_only
unknown
```

### `dataCoverageSource`

Human-readable explanation/source for the coverage classification.

### `statDefinitionVersion`

Version identifier for the provider/stat-definition mapping.

This must change when the meaning or mapping of raw fields materially changes.

---

## 8. Compatibility fields

The current application/dataset still contains fields that are useful for backwards compatibility but are not preferred canonical sources of truth for new provider mappings:

```text
teamResult
matchResult
winner
loser
dataType
```

### `teamResult`

Legacy result alias.

Canonical source of truth:

```text
result
```

If both are present and disagree, validation emits a warning.

### `matchResult`, `winner`, `loser`

Presentation-oriented compatibility fields.

New provider adapters should not depend on these when the equivalent value can be derived from canonical score/result fields.

### `dataType`

Current compatibility values:

```text
real
sample
```

It remains optional in v1.1-07 because older sample records may not yet contain it consistently.

Future migration may replace or formalize this classification through a stronger provenance model.

---

## 9. Derived metrics are not canonical raw fields

The canonical match record stores observed/source-aligned raw values and provenance.

Derived metrics remain in the analytics layer, primarily:

```text
src/utils/analyticsMetrics.js
```

Examples:

```text
Points Differential
Win Rate
Points per Match
Tries per Match
Points per 100 Metres
Tries per 100 Metres
Metres per Carry
Clean Breaks per 100 Carries
Defenders Beaten per Carry
Turnover Differential
Penalties per Match
Tackle Success
Ruck Success
```

Rules:

- do not persist derived values merely for display convenience;
- denominator `0` → `null`;
- missing numerator/denominator → `null`;
- aggregate ratio metrics should use pooled numerator/denominator where mathematically appropriate;
- round only at presentation time.

---

## 10. Conversion-rate naming safeguard

Aggregate ratios must not be mislabeled as event-sequence conversion rates.

For example:

```text
Tries / Clean Breaks
```

may be calculated as an aggregate ratio, but it must not be described as:

```text
Line Break → Try Conversion
```

unless event/sequence linkage proves that the try followed the break in the relevant possession/sequence.

True event conversion analysis belongs to the later Video-tagged Event / Event Sequence layer.

---

## 11. Possession safeguard

`possession` in the canonical record is a percentage value.

It is not a possession count.

Therefore metrics such as:

```text
Points per possession
Metres per possession
```

must not be calculated from `possession` percentage alone.

A valid possession-count denominator or event/sequence model would be required.

---

## 12. Provider mapping rule

Provider-specific field names must be translated before or at the adapter boundary.

UI components and analytics code should consume canonical names, not provider-specific names.

Target:

```text
World Rugby source shape ─┐
RugbyPass source shape    ├→ provider mapping → canonical match
Static JSON source shape  ┘
```

No provider role is assumed until confirmed.

---

## 13. Validation ownership

Machine-readable schema metadata:

```text
src/data/schema/canonicalMatchSchema.js
```

Runtime/release validation:

```text
src/utils/validateMatches.js
scripts/validateSampleMatches.mjs
scripts/validateRelease.mjs
```

The validator imports canonical enums/field lists from the machine-readable schema to reduce duplicated definitions.

---

## 14. Schema-version policy

Current canonical application schema:

```text
v1.1-canonical-match-1
```

This schema version describes the Analyzer's canonical application record.

It is distinct from:

```text
statDefinitionVersion
```

which identifies the mapping/definition of source statistics.

Conceptually:

```text
Canonical schema version
= shape expected by SVNS Stats Analyzer

Stat definition version
= meaning/mapping of a provider's statistical fields
```

---

## 15. Current migration policy

v1.1-07 is intentionally non-destructive.

It does not:

- rename current public fields;
- delete compatibility fields;
- alter current public match values;
- add new match records;
- add a backend/database;
- introduce automated scraping;
- change the public analysis UI.

Instead it establishes a stable source of truth so later provider adapters and tests can target one model.

---

## 16. Next architecture step

After v1.1-07, proceed to:

```text
v1.1-08
Derived Metrics Engine Separation
```

The canonical raw-data model should remain independent from derived-metric and presentation logic.
