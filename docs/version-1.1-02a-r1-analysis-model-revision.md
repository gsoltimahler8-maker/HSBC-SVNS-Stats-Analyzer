# v1.1-02A-r1 Analysis Model Revision

Date: 2026-07-29

## Revision reason

The initial implementation treated free-form scatterplot selection as the centre of Stats Analysis. This did not clearly express the intended product value.

The revised model makes the following 13 indicators the core analytical layer:

- Points Differential
- Win Rate
- Points per Match
- Tries per Match
- Points per 100 Metres
- Tries per 100 Metres
- Metres per Carry
- Clean Breaks per 100 Carries
- Defenders Beaten per Carry
- Turnover Differential
- Penalties per Match
- Tackle Success
- Ruck Success

## Revised roles

```text
Performance Profile
= show the 13 indicators in five rugby-performance categories

Comparison
= compare one indicator by tournament, result or opponent

Relationships
= inspect a small set of predefined rugby questions

Stats Trends
= track the same 13 indicators across match, tournament and season
```

## Relationship policy

Custom X/Y selection is removed from the public demo readiness scope.

Presets are retained only where the rugby question is understandable and the relationship is not primarily created by overlapping formulas.

## Aggregation policy

Ratio and success-rate metrics are aggregated from total valid numerators and denominators. They are not calculated as an unweighted mean of match-level rates.
