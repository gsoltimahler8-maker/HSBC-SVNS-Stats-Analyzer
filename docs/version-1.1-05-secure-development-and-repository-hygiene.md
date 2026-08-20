# SVNS Stats Analyzer — Secure Development & Repository Hygiene

**Roadmap step:** v1.1-05  
**Review date:** 2026-08-20  
**Repository:** `gsoltimahler8-maker/HSBC-SVNS-Stats-Analyzer`  
**Repository visibility:** Public

---

## 1. Purpose

This step defines the security and repository-hygiene boundary for continued v1.1 development while the public application remains available.

The objective is not to add user-facing features. It is to reduce accidental disclosure, make the public/private boundary explicit, and preserve a clean path toward later provider/schema/test work.

---

## 2. Core public-repository rule

The repository is public.

Therefore:

> **Not displayed in the application does not mean private.**

Any file committed to any branch of this public repository must be treated as publicly accessible, even if:

- it is not imported by the React application;
- it is not included in navigation;
- it is not referenced by GitHub Pages;
- it is stored under a folder named `internal`, `staging`, `raw`, `private`, or similar;
- it exists only on a non-`main` branch.

This rule applies especially to:

- newly collected match data;
- raw provider responses;
- private correspondence;
- personal sender details;
- credentials / API keys / tokens;
- rights-uncertain working datasets.

---

## 3. Public-safe material

The following are suitable for this public repository when they contain no sensitive or rights-restricted content:

- application source code;
- public-safe architecture documents;
- canonical schema definitions;
- data dictionaries;
- validation rules;
- calculation logic;
- unit / integration tests using synthetic or already-public-safe fixture data;
- public source attribution;
- public project contact information;
- public-safe roadmap and handover documentation.

---

## 4. Material that must remain local/private

Keep the following outside this public repository unless a later review explicitly clears publication:

- private World Rugby correspondence copies;
- personal sender email details not intended as project contact information;
- credentials;
- `.env` secrets;
- access tokens;
- API keys;
- private account identifiers;
- raw or staging match data whose publication status is not yet resolved;
- bulk source exports not intended for public redistribution;
- screenshots containing unnecessary personal information;
- temporary analysis files containing private notes or unpublished material.

Recommended private/local working directories are covered by `.gitignore` patterns such as:

```text
PRIVATE-DO-NOT-COMMIT/
private/
private-data/
local-only/
raw-private/
staging-private/
```

A `.gitignore` rule is only a local safety mechanism. It does not protect a file after the file has already been committed.

---

## 5. Current repository findings

### 5.1 No previous root `.gitignore`

A root `.gitignore` was not present in the reviewed repository state.

A new `.gitignore` has therefore been added to exclude:

- dependency/build output;
- local logs and caches;
- `.env` files;
- private/local working directories;
- common OS/editor noise.

### 5.2 Personal sender address appeared in a public checklist

The current branch of:

```text
docs/world-rugby-inquiry-submission-checklist.md
```

contained a personal sender email address even though the document itself described a public/private separation policy.

The current branch has been sanitized so the personal sender address is no longer stored in that public file.

Important:

> Editing the current file does not erase the old value from Git history.

History rewriting is a separate operation and should not be performed casually because it changes commit history and can disrupt existing clones/references.

At this stage the practical mitigation is:

- remove the value from the current branch;
- do not reintroduce it;
- keep future private correspondence outside the repository;
- consider history cleanup separately only if the privacy benefit justifies the operational cost.

### 5.3 Targeted secret search

Targeted repository searches were performed for common indicators such as API-key / secret wording and the known private sender address.

No actual API key was identified in the targeted checks performed for this step.

This is **not** equivalent to a complete credential-scanning guarantee. Future CI/security work may add automated secret scanning or a dedicated scanning tool where appropriate.

### 5.4 Public project contact remains acceptable

The intentionally public project contact remains:

```text
svnsstatsanalyzer@gmail.com
```

This address may remain in application/repository documentation intended for public contact.

---

## 6. GitHub Pages / Actions boundary

Current deployment is driven by:

```text
.github/workflows/deploy.yml
```

and runs on pushes to:

```text
main
```

Current workflow permissions are explicitly limited to:

```text
contents: read
pages: write
id-token: write
```

These permissions match the current GitHub Pages deployment purpose and do not grant repository-content write access to the workflow.

For this step, the workflow is therefore retained without changing runtime/deployment behavior.

### Consequence for internal-only work

A documentation-only or test-only commit to `main` may still trigger a Pages build because the workflow trigger is branch-based rather than path-filtered.

This does not itself mean the UI changed.

A later CI refinement may separate:

- validation on all safe development changes;
- Pages deployment only when deploy-relevant files change.

That refinement should be made deliberately and tested rather than introduced during this hygiene pass.

---

## 7. Dependency / reproducibility finding

Current `package.json` uses several dependencies with the version string:

```text
latest
```

The current repository also contains `package-lock.json`, while the Pages workflow currently installs with `pnpm`.

This creates a reproducibility concern because the declared package-manager / lockfile strategy is not yet fully aligned.

This is not changed in v1.1-05 because dependency-lock migration can alter the resolved dependency graph and therefore deserves its own validation.

Resolve this during the test/reproducible-build work, not as an incidental security edit.

---

## 8. Data collection boundary while rights/data questions remain open

The active public application currently bundles its match dataset from:

```text
src/data/matches.json
```

through:

```text
src/data/loadMatches.js
```

Therefore any new record added to the active dataset and committed to `main` becomes part of the public application bundle after deployment.

For newly collected data that should not yet be displayed or publicly exposed:

### Allowed public-repository preparation

- schema work;
- parsers that contain no restricted payload;
- adapters using synthetic fixtures;
- validators;
- import mapping definitions;
- field dictionaries;
- transformation tests using synthetic values;
- source-independent provider interfaces.

### Keep outside the public repository

- newly collected raw match payloads;
- bulk staging datasets;
- unpublished full-season datasets;
- rights-uncertain source copies;
- private source-response archives.

This distinction allows architecture and collection tooling to progress without expanding public data exposure.

---

## 9. Branch policy

Because the repository is public:

> A development branch is not a privacy boundary.

Use branches for software-development isolation, not for confidential data.

Recommended use:

```text
main
  public-safe application / docs / schema / tests

development branches
  public-safe code under review

local/private storage
  sensitive, private, raw, staging or rights-uncertain material
```

If a future workflow requires repository-backed private staging data, use a genuinely private repository or another controlled storage mechanism rather than a branch in this repository.

---

## 10. Security reporting policy

A root-level:

```text
SECURITY.md
```

has been added.

It directs security reports to the public project contact and explicitly asks users not to publish credentials, private data or sensitive vulnerability details in public issues.

It also distinguishes technical security issues from data-rights / licensing questions.

---

## 11. Secure-development rules going forward

### Rule 1 — public-by-default assumption

Treat every committed file as public unless it lives in a genuinely private system.

### Rule 2 — no secrets in source

Do not commit:

- passwords;
- API keys;
- tokens;
- private account credentials;
- private form copies.

### Rule 3 — environment configuration

Use environment variables for future secrets.

Keep real `.env` files ignored.

If an example becomes necessary, use a public-safe `.env.example` containing placeholder values only.

### Rule 4 — synthetic fixtures for public tests

When testing future provider adapters before publication rights are clear, use synthetic or deliberately public-safe fixtures.

### Rule 5 — provenance without confidential payload

Public schema/tests may preserve:

- provider name;
- field name;
- mapping logic;
- provenance model;

without storing a restricted raw provider payload.

### Rule 6 — no Git-history rewrite without explicit decision

History cleanup must be handled as a separate task with explicit risk/benefit review.

### Rule 7 — security and licensing remain separate

Repository privacy and secure-development hygiene reduce accidental disclosure risk but do not themselves grant permission to use or publish third-party data.

---

## 12. Files changed in v1.1-05

### Added

```text
.gitignore
SECURITY.md
docs/version-1.1-05-secure-development-and-repository-hygiene.md
```

### Updated

```text
docs/world-rugby-inquiry-submission-checklist.md
```

The checklist update sanitizes the current-branch copy of the personal sender address.

### Not changed

```text
src/App.jsx
src/components/*
src/data/matches.json
src/data/videos.json
src/utils/analyticsMetrics.js
src/styles.css
src/analytics.css
.github/workflows/deploy.yml
package.json
package-lock.json
```

Therefore this step is intentionally non-feature-facing and does not add or alter match data.

---

## 13. Deferred items

The following remain for later steps:

- provider/adapter separation;
- canonical schema reconciliation;
- automated secret scanning;
- dependency pinning / package-manager lock strategy;
- broader CI restructuring;
- branch protection review;
- automated test expansion;
- optional Git-history privacy cleanup;
- private staging repository/storage design if eventually required.

---

## 14. Completion condition

v1.1-05 is complete when:

```text
public/private repository boundary documented
+ .gitignore added
+ current public personal-email exposure sanitized
+ public security-reporting policy added
+ current deployment/security findings recorded
+ no user-facing feature or match-data expansion introduced
```

**Status: COMPLETED — 2026-08-20**

---

## 15. Next step

Proceed to:

```text
v1.1-06
Data Provider / Adapter Separation
```

The next step should preserve the current public application behavior while introducing a provider-independent boundary between source data and the canonical application model.
