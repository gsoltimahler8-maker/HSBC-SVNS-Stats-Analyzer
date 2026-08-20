# SVNS Stats Analyzer — Reproducible Build and Release

**Applies from:** v1.1-09  
**Runtime baseline:** Node.js 24.19.0 LTS  
**Package manager for release validation:** npm  

## 1. Purpose

This document defines the repeatable path for installing, testing, building, deploying and rolling back the current public application.

The release path must use the committed dependency graph and must not silently resolve a fresh dependency set.

## 2. Dependency baseline

The six direct dependencies are pinned to the exact versions already present in the committed lockfile:

```text
@vitejs/plugin-react 6.0.2
vite                 8.0.16
react                19.2.7
react-dom            19.2.7
lucide-react         1.17.0
recharts             3.8.1
```

Do not replace these exact versions with `latest`, caret ranges or tilde ranges as part of unrelated work. Intentional dependency updates must update `package.json` and the lockfile together and pass the full validation path.

## 3. Legacy lockfile portability preparation

The committed `package-lock.json` predates v1.1-09 and contains two legacy characteristics:

1. some registry tarball `resolved` values point to the environment where the lockfile was originally generated;
2. the root dependency specifiers were recorded as `latest`, even though the package entries themselves contain fixed versions.

Before a frozen install, prepare the working-copy lockfile:

```bash
npm run prepare:lockfile
npm ci --no-audit --no-fund
```

`npm run prepare:lockfile` executes:

```text
scripts/preparePortableLockfile.mjs
```

The script performs only deterministic compatibility normalization:

- copies the exact direct dependency versions from `package.json` into the root lockfile metadata;
- removes only `resolved` entries beginning with the known environment-specific registry prefix;
- preserves package versions;
- preserves integrity hashes;
- preserves dependency structure;
- preserves non-matching external URLs.

This is required because modern npm validates `package.json` and `package-lock.json` before `npm ci`. The preparation step prevents historical `latest` metadata or an inaccessible old registry URL from changing the dependency graph.

The root `.npmrc` contains:

```ini
registry=https://registry.npmjs.org/
omit-lockfile-registry-resolved=true
```

No credentials, tokens or passwords are stored in `.npmrc`.

The preparation step modifies only the local/runner working copy during normal CI. It does not update dependencies.

## 4. Clean install

Use the pinned runtime and the prepared lockfile:

```bash
npm run prepare:lockfile
npm ci --no-audit --no-fund
```

Do not use `npm install` for routine release verification. `npm install` is reserved for intentional dependency-maintenance work.

## 5. Local development

After a clean install:

```bash
npm run dev
```

Vite starts the local development server.

## 6. Unit tests

Run:

```bash
npm test
```

The suite uses the Node.js built-in test runner and introduces no additional test-framework dependency.

Current coverage includes:

- canonical adapter normalization;
- nullable-stat and external-ID normalization;
- derived metric formulas;
- missing values;
- zero denominators;
- pooled ratio aggregation;
- win-rate denominator rules;
- metric coverage;
- tournament/opponent/result grouping primitives;
- chronology/tie-breaking;
- relationship preset integrity;
- display formatting;
- exact direct-dependency pinning;
- direct dependency vs locked package-version consistency;
- lockfile portability preparation;
- legacy root lock metadata synchronization;
- release/install configuration.

Baseline/normalisation calculations are not yet implemented in the product. Tests for those calculations must be added when the v1.2 baseline engine is introduced rather than inventing a speculative formula in v1.1.

## 7. Data validation

Run:

```bash
npm run validate:data
```

This executes the existing match and video validators.

## 8. Release validation

Run:

```bash
npm run validate:release
```

The release validation sequence is:

```text
unit tests
→ match/video validation
→ existing release checks
```

A failure at any stage blocks the build.

## 9. Production build

Run:

```bash
npm run build
```

`build` first runs `validate:release`, then runs the Vite production build with the GitHub Pages base path.

Expected output directory:

```text
dist/
```

## 10. CI / GitHub Pages deployment

Feature branches use:

```text
.github/workflows/ci.yml
```

The public deployment uses:

```text
.github/workflows/deploy.yml
```

Both use the same build baseline:

```text
Node.js 24.19.0
node --version / npm --version logged
npm cache keyed by the committed lockfile
npm run prepare:lockfile
npm ci --no-audit --no-fund
npm run build
```

The deployment workflow runs only after a push to `main`. Because `npm run build` includes `validate:release`, a failed unit test or validation check prevents deployment.

## 11. Rollback

Preferred rollback is a new revert commit rather than rewriting public history.

For a single bad commit:

```bash
git revert <bad-commit-sha>
git push origin main
```

For multiple related commits, review the exact range before reverting. Do not force-push `main` as the normal rollback mechanism.

After the revert reaches `main`, the same GitHub Pages workflow rebuilds and redeploys the reverted state.

## 12. Dependency-update procedure

When dependencies are intentionally changed:

1. use Node.js 24.19.0;
2. change dependency versions intentionally in a dedicated maintenance change;
3. do not use `latest` for direct dependencies;
4. regenerate/update `package-lock.json` with npm;
5. review both `package.json` and `package-lock.json` diffs;
6. ensure package.json direct versions match the corresponding locked package versions;
7. keep `.npmrc` active so new registry dependencies do not retain environment-specific registry `resolved` values;
8. run `npm run prepare:lockfile`;
9. run `npm ci --no-audit --no-fund` from a clean state;
10. run `npm test`;
11. run `npm run build`;
12. commit the manifest and lockfile together when an intentional dependency change modifies them.

The v1.1-09 baseline deliberately freezes the dependency graph that was already in use rather than silently upgrading libraries during an analytics/test architecture step.
