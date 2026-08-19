# SVNS Stats Analyzer
# Roadmap Revision Note — 2026-08-19

**Revision target:** `docs/version-1.1-roadmap.md`  
**Revision theme:** Quantitative + Tactical Two-Layer Analytics Architecture

---

## 1. What changed

The roadmap has been reorganised around a two-layer analytical model.

```text
Layer 1 — Quantitative Analysis
Rugby.com.au Match Centre-derived aggregate statistics

Layer 2 — Video-tagged Tactical Analysis
official/public YouTube video + event metadata
```

The major change is that aggregate-data analysis is now developed much further **before** manual video tagging.

---

## 2. New ordering

Previous long-term emphasis:

```text
Architecture
→ Match Analysis Workspace
→ Video Tagging
→ Event Analysis
→ Profiles / Matchup
```

Revised emphasis:

```text
Architecture
→ Derived Metrics
→ Baseline / Normalisation
→ Opponent-adjusted Performance
→ Style Fingerprint
→ Matchup
→ Trend / Change Detection
→ Match Analysis Workspace
→ Targeted Video Tagging
→ Event / Sequence Analysis
→ Tactical Interpretation
```

---

## 3. Why this is preferred

Manual video analysis is expensive.

The project should therefore use broad aggregate coverage to identify the matches where deeper review has the highest value.

```text
Layer 1 detects an anomaly / change
↓
select relevant matches
↓
Layer 2 video tagging
↓
explain the statistical change
↓
refine metrics / tags if needed
```

This reduces manual workload and creates a clearer separation between screening and explanation.

---

## 4. Quantitative analysis additions

The revised roadmap formally adds:

- expanded reproducible derived metrics;
- metric-relationship / structural analysis;
- baseline and normalisation rules;
- Opponent-adjusted Performance;
- Team Style Fingerprint;
- Matchup Analysis;
- Trend / Change Detection.

---

## 5. Definition safeguards

The revision adds explicit analytical safeguards.

### Aggregate ratios are not automatically event conversion rates

For example:

```text
Tries / Clean Breaks
```

must not be described as true `Line Break → Try Conversion` without event/sequence linkage.

### Possession percentage is not possession count

`Points per possession` or `Metres per possession` require a valid possession-count denominator.

### Fingerprint metrics require normalisation

Raw metrics with different units should not simply be plotted on a common scale.

### Opponent baseline should normally exclude the match being assessed

This reduces circularity in the adjustment.

### Aggregate data must not imply tactical detail it cannot observe

Specific phase shape, receiver positioning, pass routes, field position and loop/scissors usage remain Layer 2 questions.

---

## 6. Layer 1 → Layer 2 integration

The roadmap now treats this as a core operating principle:

```text
All available matches
→ quantitative screening
→ selected matches
→ video-tagged tactical review
```

Video-tagged data becomes an explanation layer rather than a requirement for every match.

---

## 7. AI position

The roadmap further de-emphasises AI as an objective.

Priority is now:

```text
Data quality
→ Schema / Dictionary
→ Reproducible metrics
→ Baseline / normalisation
→ Opponent adjustment
→ Style Fingerprint
→ Matchup
→ Change Detection
→ Video-tagged Tactical Layer
→ AI only where justified
```

---

## 8. Current v1.1 sequence is unchanged

The revision does **not** interrupt the existing v1.1 foundation work.

Next remains:

```text
v1.1-03 World Rugby follow-up / response tracking
v1.1-04 Current Architecture & Handover Inventory
```

The Layer 1 implementation begins after the v1.1 architectural foundation is completed.

---

## 9. Files

### Replace

```text
docs/version-1.1-roadmap.md
```

### Add

```text
docs/version-1.1-roadmap-revision-2026-08-19.md
```

### Delete

```text
None
```
