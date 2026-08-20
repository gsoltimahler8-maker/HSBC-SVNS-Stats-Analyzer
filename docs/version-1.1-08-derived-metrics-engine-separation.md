# SVNS Stats Analyzer — v1.1-08 Derived Metrics Engine Separation

**Roadmap step:** v1.1-08  
**Date:** 2026-08-20  
**Implementation status:** Complete on feature branch; build/deploy validation pending

---

## 1. Objective

Separate the current shared analytics module into explicit responsibilities without changing the public 13-metric model, public match data, or component-facing API.

Before this step, `src/utils/analyticsMetrics.js` owned all of the following:

- metric definitions;
- category and relationship configuration;
- per-match derived calculations;
- pooled aggregation;
- metric formatting;
- chronological helpers;
- result helpers;
- grouping and unique-value helpers.

This made the module a single shared dependency but not a well-separated analytics layer.

---

## 2. Architecture after this step

```text
Canonical Match Model
↓
src/analytics/derivedMetrics.js
↓
src/analytics/aggregation.js
↓
src/analytics/matchCollections.js
↓
src/analytics/visualizationConfig.js
↓
src/analytics/metricPresentation.js
```

Metric metadata is centralized in:

```text
src/analytics/metricDefinitions.js
```

The existing import path remains available as a compatibility facade:

```text
src/utils/analyticsMetrics.js
```

Therefore current screens can continue importing the same symbols without component changes.

---

## 3. Responsibility boundaries

### `metricDefinitions.js`

Owns:

- `METRIC_DEFINITIONS`;
- the 13 public metric keys;
- comparison/trend metric key sets;
- `getMetricDefinition`.

It does not calculate match values.

### `derivedMetrics.js`

Owns:

- numeric/null normalization used by calculations;
- denominator-zero handling;
- per-match metric calculation;
- metric coverage.

It does not own aggregation or UI labels.

### `aggregation.js`

Owns:

- match-level mean aggregation;
- pooled numerator/denominator aggregation;
- aggregate win rate;
- `aggregateMetric`;
- compatibility alias `averageMetric`.

The formulas are intentionally preserved from the pre-v1.1-08 implementation.

### `matchCollections.js`

Owns:

- chronological ordering;
- result compatibility helper;
- grouping;
- unique-value extraction.

### `visualizationConfig.js`

Owns:

- metric categories;
- predefined relationship-analysis pairs.

These are analysis/visualisation configuration, not metric formulas.

### `metricPresentation.js`

Owns:

- localized metric labels;
- localized formula text;
- display rounding;
- suffix formatting.

Rounding remains presentation-only.

### `src/utils/analyticsMetrics.js`

Now acts only as a compatibility facade that re-exports the public analytics API.

---

## 4. Behaviour preserved

This step intentionally preserves:

- the same 13 public metrics;
- the same metric keys;
- the same labels and formula descriptions;
- the same relationship presets;
- the same per-match formulas;
- the same pooled aggregation behaviour;
- the same missing-value behaviour;
- denominator `0` returning `null` for per-match ratios;
- the same display decimals and suffixes;
- the same chronological ordering rules;
- the same compatibility result lookup order;
- the same exports consumed by Stats Analysis and Stats Trends.

No formula expansion is part of v1.1-08.

---

## 5. Public UI and data impact

### Public UI

```text
Intentional change: none
```

`StatsAnalysis.jsx` and `StatsTrends.jsx` continue to import from:

```text
../utils/analyticsMetrics.js
```

### Public match data

```text
Change: none
```

The following are not modified:

```text
src/data/matches.json
src/data/videos.json
src/components/*
src/styles.css
src/analytics.css
```

This step does not expand public Rugby.com.au-derived data.

---

## 6. Files added

```text
src/analytics/metricDefinitions.js
src/analytics/derivedMetrics.js
src/analytics/aggregation.js
src/analytics/matchCollections.js
src/analytics/visualizationConfig.js
src/analytics/metricPresentation.js
docs/version-1.1-08-derived-metrics-engine-separation.md
```

## 7. File updated

```text
src/utils/analyticsMetrics.js
```

The updated file is a compatibility facade rather than a calculation implementation.

---

## 8. Validation expectations

Before merging to the default branch:

1. validate that all previous public exports remain available through `src/utils/analyticsMetrics.js`;
2. run the existing release validation/build;
3. confirm Stats Analysis builds;
4. confirm Stats Trends builds;
5. confirm no public data files changed;
6. confirm no intentional UI output changed.

Formal automated metric tests remain the next roadmap step:

```text
v1.1-09 Tests / Reproducible Build
```

---

## 9. Completion condition

Mark:

```text
v1.1-08: COMPLETED
```

only after the feature-branch build/check is successful and the accepted change is integrated into the project baseline.

Next:

```text
v1.1-09 Tests / Reproducible Build
```
