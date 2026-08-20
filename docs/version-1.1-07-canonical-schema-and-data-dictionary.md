# SVNS Stats Analyzer — v1.1-07 Canonical Schema / Data Dictionary

**Roadmap step:** v1.1-07  
**Date:** 2026-08-20  
**Implementation status:** Complete; release/build validation to be confirmed by GitHub Actions

---

## 1. Objective

Create one provider-independent definition of the current team-match record before further analytics refactoring.

The step resolves drift between:

- the active `src/data/matches.json` structure;
- the older v0.x schema/import documents;
- the current `src/utils/analyticsMetrics.js` requirements;
- the v1.1-06 Provider / Adapter boundary.

No new match records or public UI features are introduced.

---

## 2. Authoritative sources after this step

### Machine-readable schema

```text
src/data/schema/canonicalMatchSchema.js
```

### Human-readable canonical schema

```text
MATCH_DATA_SCHEMA.md
```

### Handover data dictionary

```text
docs/canonical-match-data-dictionary.md
```

### Validator

```text
src/utils/validateMatches.js
```

Older v0.x import documents remain useful as historical/operational references, but they are not authoritative when they conflict with the v1.1 canonical model.

---

## 3. Canonical model decisions

### Record grain

```text
1 record = 1 team perspective for 1 match
```

### Canonical result field

```text
result
```

`teamResult` remains compatibility-only.

### Canonical date field

```text
date
```

Historical `matchDate` terminology must not be introduced into new adapters.

### Canonical provider/source field

```text
sourceProvider
```

Historical `source` terminology must not compete with it in new adapters.

### Canonical external IDs

```text
external.rugbyComAu
external.svns
external.rugbyPass
```

Historical `matchId` terminology should be mapped into the appropriate `external.*` key.

---

## 4. Runtime/data drift resolved

The active analytics engine already uses:

```text
metres
```

for metrics such as:

```text
Metres per Carry
Points per 100 Metres
Tries per 100 Metres
```

The previous legacy schema documentation did not represent this field consistently.

`metres` is now explicitly part of the canonical raw-stat dictionary and numeric validation set.

---

## 5. Canonical null policy

For known nullable raw-stat fields:

```text
observed zero = 0
missing/unavailable = null
```

The canonical adapter now ensures recognized nullable stat keys are present as `null` when they are absent/empty.

It also normalizes known external-ID keys to `null` when unavailable.

This gives downstream analytics a more stable shape without changing current visible values.

---

## 6. Raw vs calculated separation

Canonical match records contain source-aligned raw values and provenance.

Calculated metrics remain outside the canonical record.

Current derived metrics continue to be owned by:

```text
src/utils/analyticsMetrics.js
```

until v1.1-08.

This preserves the intended architecture:

```text
Provider
↓
Canonical Raw Data
↓
Derived Metrics Engine
↓
Aggregation
↓
Analysis / Trends / Search
```

---

## 7. Analytical safeguards formalized

The canonical documentation now records that:

- missing values must not become zero;
- denominator zero produces `null`;
- pooled numerator/denominator aggregation is used for appropriate ratio metrics;
- rounding belongs at presentation time;
- possession percentage is not possession count;
- aggregate ratios must not be mislabeled as event-sequence conversion rates;
- provider stat names may require definition review before cross-provider mixing.

---

## 8. Validator alignment

`src/utils/validateMatches.js` now imports canonical definitions instead of maintaining separate copies of:

- required fields;
- numeric fields;
- percentage fields;
- gender values;
- result values;
- coverage values.

It additionally validates:

- `metres` as a numeric/null field;
- `dataType` when present (`real` / `sample`);
- disagreement between compatibility `teamResult` and canonical `result` as a warning.

This reduces schema/validator drift.

---

## 9. Compatibility fields retained

The following remain for current application compatibility:

```text
teamResult
matchResult
winner
loser
dataType
```

They are not removed in this step because the goal is architectural stabilization without visible behavior change.

Future refactoring may remove redundant fields only after all consumers and tests are migrated.

---

## 10. Public/private boundary

This step does not change the v1.1-05 repository rule.

The canonical schema and provider interface may be public.

New rights-uncertain raw/staging datasets must remain outside the public repository until cleared for publication.

A future private dataset can still be mapped into the same canonical model and later promoted to the public dataset without redesigning the UI.

---

## 11. Files changed

### Added

```text
src/data/schema/canonicalMatchSchema.js
docs/canonical-match-data-dictionary.md
docs/version-1.1-07-canonical-schema-and-data-dictionary.md
```

### Updated

```text
src/data/adapters/canonicalMatchAdapter.js
src/utils/validateMatches.js
MATCH_DATA_SCHEMA.md
```

### Not changed

```text
src/data/matches.json
src/data/videos.json
src/components/*
src/utils/analyticsMetrics.js
src/styles.css
src/analytics.css
```

Therefore no match-data expansion or intentional user-facing UI change is part of v1.1-07.

---

## 12. Completion condition

Implementation is complete when:

```text
machine-readable schema established
+ canonical adapter null rules established
+ validator aligned with canonical schema
+ authoritative schema document replaced
+ handover data dictionary added
+ no public match data added
```

After GitHub Actions confirms the build/release validation is green, record:

```text
v1.1-07: COMPLETED
```

---

## 13. Next step

```text
v1.1-08
Derived Metrics Engine Separation
```

The next step should move metric definition/calculation/aggregation responsibilities into a clearer reusable engine while preserving the current 13 public indicators and current UI behavior.
