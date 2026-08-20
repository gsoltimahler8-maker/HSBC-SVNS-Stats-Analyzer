# SVNS Stats Analyzer Data Pipeline Storage Policy

Status: Draft / probe branch

## Purpose

Separate source preservation, analysis-ready datasets, and the public reproducible codebase.

## Three-layer model

### 1. Raw Source Archive

Source of truth for acquired Rugby.com.au Match Centre data.

- Preserve the original Next.js JSON response per fixture.
- Do not transform or overwrite the raw source object.
- Keep outside the public GitHub repository by default.
- Use raw JSON to regenerate analysis datasets if schemas or methodology change.

Recommended layout:

```text
raw/
  <season>/
    <gender>/
      <tournament>/
        <fixture_id>.json
```

### 2. Analysis-ready Dataset

CSV is the primary working format for exploratory and statistical analysis.

Initial canonical exports:

```text
tournaments.csv
matches.csv
team_match_stats.csv
team_match_stats_long.csv
points_summary.csv
commentary.csv
lineups.csv
```

The CSV layer is derived data, not the source of truth.

### 3. GitHub Reproducible Pipeline

The public repository should contain the reproducible method rather than the complete acquired dataset.

Keep in GitHub:

- acquisition scripts
- raw JSON to CSV normalization scripts
- QA rules
- stage audit / correction logic
- schemas and field dictionaries
- statistical analysis code
- methodology validation code
- documentation and reproducibility instructions

Do not commit the complete acquired raw archive or full exported dataset by default.

## Data ownership roles

```text
Raw JSON = Source of Truth
CSV = Analysis-ready Dataset
GitHub = Reproducible Pipeline
```

## Stage policy

Never destroy the source stage label. Preserve raw source fields such as `round`, `roundLabel`, `group`, `stage`, and `matchType` where present.

Future canonical stage fields should be added separately, for example:

```text
stage_raw
stage_canonical
stage_quality
stage_resolution
stage_reason
```

Stage correction should be reproducible from tournament structure and/or an approved verification source rather than manual silent overwrite.

## Current pilot

Bordeaux 2026 Women is the pilot tournament for validating the canonical export before expanding the pipeline to all available SVNS / World Rugby Sevens Series tournaments from the Rugby.com.au coverage period.
