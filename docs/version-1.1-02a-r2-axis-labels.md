# v1.1-02A-r2 Explicit Axis Labels

Date: 2026-07-29

## Purpose

Make every comparison chart, relationship scatter plot and trend chart self-explanatory without relying only on the controls or tooltip.

## Changes

### Stats Analysis — Comparison

- X axis: Tournament / Result / Opponent
- Y axis: selected indicator average

### Stats Analysis — Relationships

- X axis: the explanatory indicator defined by the selected preset
- Y axis: the outcome or paired indicator defined by the selected preset

### Stats Trends

- X axis: Matches (chronological) / Tournaments (chronological) / Season
- Y axis: selected indicator

## Presentation

Each chart now has:

1. a readable X-axis/Y-axis guide above the chart;
2. an X-axis title inside the chart;
3. a Y-axis title inside the chart.

The external guide remains important on small screens where long vertical labels can be difficult to read.

## Files

Replace:

```text
src/components/StatsAnalysis.jsx
src/components/StatsTrends.jsx
src/analytics.css
```

Add:

```text
docs/version-1.1-02a-r2-axis-labels.md
```

Delete: none.
