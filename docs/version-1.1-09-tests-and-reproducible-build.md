# SVNS Stats Analyzer — v1.1-09 Tests / Reproducible Build

**Roadmap step:** v1.1-09  
**Date:** 2026-08-20  
**Implementation status:** Complete on feature branch; branch/main build validation pending

## 1. Objective

Add repeatable automated checks around the canonical adapter and v1.1-08 analytics engine, and establish a deterministic install/build path before changes reach the public `main` branch.

No public match data expansion or intentional user-facing UI change is part of this step.

## 2. Test framework

The project now uses the Node.js built-in test runner:

```text
node --test
```

No new test library dependency is added.

`package.json` adds `npm test`, and `validate:release` runs the unit tests before the existing data/release checks.

## 3. Canonical adapter tests

Added coverage for:

- absent nullable raw stats → `null`;
- observed zero remains `0`;
- absent known external IDs → `null`;
- source record is not mutated by normalization;
- provider collection mapping;
- invalid record/collection input rejection.

## 4. Derived metrics tests

Added coverage for the 13 public core metrics and the current shared engine.

Checks include:

- core metric count/configuration;
- per-match formulas;
- missing input handling;
- denominator-zero handling;
- pooled aggregation;
- win-rate denominator behavior;
- coverage calculation;
- grouping primitives used by comparison views;
- chronology;
- relationship preset integrity;
- display rounding/formatting.

## 5. Aggregation defect fixed

During test design, the pooled ratio helper exposed a boundary-case defect.

Previous behavior:

```text
row numerator = known
row denominator = 0
```

could still add the numerator to the pooled numerator when another row supplied a non-zero denominator.

That contradicted the project rule:

```text
denominator 0 = null
```

The aggregation helper now excludes any row whose denominator is zero before adding either numerator or denominator to the pooled totals.

## 6. Reproducible-build defects found

Before v1.1-09:

- `package-lock.json` existed;
- GitHub Actions installed with `pnpm install`;
- no pnpm lockfile existed;
- all six direct dependencies in `package.json` used `latest`;
- the npm lockfile contained environment-specific registry URLs.

Therefore the deployed dependency graph was not actually controlled by the committed npm lockfile.

### First branch validation failure

The first validation failed during `npm ci` with an npm CLI abnormal exit. The initial registry replacement approach was discarded rather than hidden.

### Second branch validation failure

After registry portability was corrected, `npm ci` correctly reported that `package.json` and `package-lock.json` were not in sync.

Examples from the run included:

```text
@vitejs/plugin-react: locked 6.0.2 vs latest 6.1.0
react:                locked 19.2.7 vs latest 19.2.8
vite:                 locked 8.0.16 vs latest 8.2.2
```

The important point is that `latest` is not a reproducible dependency declaration. npm 11 resolves the tag against the current registry state and rejects the older lock graph when newer packages exist.

## 7. Direct dependency baseline fixed

The six direct dependencies are now pinned to the versions already present in the committed lockfile:

```text
@vitejs/plugin-react 6.0.2
vite                 8.0.16
react                19.2.7
react-dom            19.2.7
lucide-react         1.17.0
recharts             3.8.1
```

This intentionally freezes the dependency graph already used by the project. v1.1-09 does not silently upgrade libraries while also changing analytics/tests.

A release-configuration test now fails if a direct dependency is changed back to a tag/range or no longer matches its corresponding locked package version.

## 8. Portable legacy lockfile preparation

Added:

```text
scripts/preparePortableLockfile.mjs
```

Before `npm ci`, the script performs two deterministic compatibility operations on the working-copy lockfile:

1. synchronizes the legacy root dependency specifiers with the exact versions now declared in `package.json`;
2. removes only `resolved` fields beginning with the known environment-specific registry prefix.

It preserves:

- locked package versions;
- integrity hashes;
- dependency structure;
- non-matching external URLs.

The root `.npmrc` uses:

```ini
registry=https://registry.npmjs.org/
omit-lockfile-registry-resolved=true
```

No registry credentials are stored in the repository.

## 9. Runtime baseline

Both feature-branch validation and public deployment use a fixed runtime:

```text
Node.js 24.19.0 LTS
```

The workflows also print `node --version` and `npm --version` so the actual runtime is visible in every build log.

Using a fixed patch version avoids the ambiguity of a floating `node-version: 22` configuration.

## 10. Release path after this step

Feature-branch validation and GitHub Pages deployment use the same sequence:

```text
Node.js 24.19.0
↓
log node/npm versions
↓
npm run prepare:lockfile
↓
npm ci --no-audit --no-fund
↓
npm run build
↓
validate:release
    ↓
    npm test
    ↓
    data validation
    ↓
    existing release validation
↓
Vite build
```

The public deployment workflow continues only on `main`.

## 11. Reproducible-build documentation

Added:

```text
docs/reproducible-build-and-release.md
```

It documents:

- exact dependency baseline;
- lockfile preparation;
- clean install;
- local run;
- tests;
- data validation;
- release validation;
- production build;
- deployment;
- rollback;
- dependency-update procedure.

## 12. Baseline test scope

The roadmap mentions tests for future baseline calculations.

No baseline/normalisation engine exists yet in the current application. v1.1-09 therefore does not invent a placeholder formula solely to satisfy a test checkbox.

Baseline calculation tests must be added with the actual v1.2 baseline implementation.

## 13. Files changed

### Added

```text
.npmrc
.github/workflows/ci.yml
scripts/preparePortableLockfile.mjs
tests/canonicalMatchAdapter.test.mjs
tests/analyticsMetrics.test.mjs
tests/releaseConfiguration.test.mjs
docs/reproducible-build-and-release.md
docs/version-1.1-09-tests-and-reproducible-build.md
```

### Updated

```text
src/analytics/aggregation.js
package.json
.github/workflows/deploy.yml
```

### Not changed

```text
src/data/matches.json
src/data/videos.json
src/components/*
src/styles.css
src/analytics.css
```

## 14. Public impact

Intentional public UI impact:

```text
none
```

Public match/video data impact:

```text
none
```

The only runtime-calculation change is the zero-denominator pooled-ratio correction described above.

## 15. Completion condition

After feature-branch validation is green, the branch can be fast-forwarded to `main`. After the latest `main` GitHub Actions run is also green, record:

```text
v1.1-09: COMPLETED
```

## 16. Next step

```text
v1.1-10
Localisation Architecture
```
