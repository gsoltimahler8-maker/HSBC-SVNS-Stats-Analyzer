# v1.1-02A-r3 Compact Chart Labels

Created: 2026-07-29

## Purpose

Improve smartphone chart readability without removing the external axis guide.

## Changes

- Remove X-axis and Y-axis titles drawn inside all charts.
- Keep the compact axis guide above each chart.
- Reclaim plotting area by reducing chart margins and axis widths.
- On screens up to 640px wide, use three-letter opponent abbreviations in chart ticks.
- In match trends, show date and opponent abbreviation on two lines.
- Keep full opponent names in filters and tooltips.
- Use abbreviations rather than flag emoji because country-flag rendering inside SVG charts is inconsistent across browsers and operating systems.

## Replace

```text
src/components/StatsAnalysis.jsx
src/components/StatsTrends.jsx
```

## Add

```text
docs/version-1.1-02a-r3-compact-chart-labels.md
```

## Delete

```text
None
```
