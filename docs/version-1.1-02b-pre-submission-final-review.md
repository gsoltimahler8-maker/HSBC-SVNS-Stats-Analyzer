# SVNS Stats Analyzer

# v1.1-02B Pre-submission Final Review

Version: v1.1  
Step: v1.1-02B  
Status: Review package prepared  
Created: 2026-07-29

---

## 1. Purpose

Perform the final alignment check between:

- the current public prototype;
- the World Rugby enquiry text;
- the public repository documentation;
- the private sender information; and
- the official submission route.

This step does not submit the enquiry.

---

## 2. Current public-demo position

v1.1-02A and its revisions established the following public-facing analysis model:

### Stats Analysis

- 13 core performance indicators
- category-based overview
- comparison by Tournament / Result / Opponent
- preset relationship charts
- data-coverage and metric-definition display

### Stats Trends

- Match
- Tournament
- Season
- compact mobile opponent labels
- missing-value handling without coercion to zero

The enquiry text therefore describes the application as showing:

> key performance indicators, comparisons and trends, together with match search and links to publicly available match videos

This is intentionally simpler than listing every analytical control in the first enquiry.

---

## 3. Final wording decision

Use the following subject:

```text
Question about HSBC SVNS match data for an independent analytics project
```

The body should remain a human first enquiry rather than a technical specification.

It should:

- explain why the prototype was created;
- describe the current functionality briefly;
- disclose the limited manually entered Rugby Australia sample;
- state that automated scraping is not used;
- ask for the official data route and conditions; and
- request redirection when another team or provider is responsible.

It should not:

- ask for endorsement;
- pitch a sale or partnership;
- claim permission;
- imply that no official source exists;
- claim that World Rugby controls every third-party data right; or
- offer free code transfer.

---

## 4. Privacy decision

The public repository and private submission copy must be separated.

### Public repository

```text
docs/world-rugby-inquiry-email-draft.md
```

This file uses:

```text
[FULL NAME]
[PERSONAL EMAIL]
```

### Private submission copy

```text
PRIVATE-DO-NOT-COMMIT/world-rugby-inquiry-form-copy-Hironobu-Otsuka.md
```

This file contains the actual sender details and must not be committed to the public repository.

The application itself continues to publish:

```text
svnsstatsanalyzer@gmail.com
```

---

## 5. Submission route

Use the official World Rugby Contact Us page:

```text
https://www.world.rugby/organisation/about-us/contact
```

The page embeds World Rugby's enquiry form.

The form fields may change. The private copy is therefore prepared as a paste-ready message rather than tied to assumed field names.

---

## 6. Files

### Replace in repository

```text
docs/world-rugby-inquiry-email-draft.md
docs/world-rugby-inquiry-submission-checklist.md
```

### Add to repository

```text
docs/version-1.1-02b-pre-submission-final-review.md
```

### Keep private; do not commit

```text
PRIVATE-DO-NOT-COMMIT/world-rugby-inquiry-form-copy-Hironobu-Otsuka.md
```

### Delete

```text
None
```

---

## 7. Completion and next step

After the owner completes the checklist and is ready to submit:

```text
v1.1-02B: COMPLETED
```

After the form has actually been submitted:

```text
v1.1-03: STARTED
```

v1.1-03 records:

- submission date;
- submission route;
- exact submitted text;
- confirmation or reference number;
- reply;
- confirmed facts;
- conditions;
- unanswered points; and
- next action.
