# SVNS Stats Analyzer
# Roadmap Revision Note — 2026-08-18

**Revision target:** `docs/version-1.1-roadmap.md`  
**Date:** 2026-08-18

---

## 1. Revision summary

今回の更新では、従来のv1.1 Architecture / Handover路線を維持したまま、その後の長期ロードマップを追加した。

追加した主要方向：

1. Match Analysis Workspace
2. Video + Stats / Analysisの同一画面統合
3. Data → Video / Video → Dataの双方向導線
4. YouTube再生時刻取得・時刻ジャンプ
5. Manual Video Event Tagging
6. Match Event Timeline
7. Cross-match Event Search
8. Sevens-specific Tactical Taxonomy
9. Event-derived Metrics
10. Event Sequence Analysis
11. Team Style Fingerprint
12. Player Role / Similarity
13. Opponent Matchup
14. Match Anomaly Detection
15. Emerging Player Detector
16. Tactical Interpretation / Analysis Engine
17. AI / MLは後段補助として配置

---

## 2. Important continuity rule

現在のv1.1は中断しない。

```text
Architecture / Handover
→ Secure Development
→ Data Provider separation
→ Schema / Data Dictionary
→ Derived Metrics separation
→ Tests
→ Localisation architecture
→ Information Architecture design
→ v1.1 completion
```

その後に：

```text
Match Analysis Workspace
→ YouTube Time Integration
→ Manual Event Tagging
→ Event Analysis
→ Profiles
→ Tactical Interpretation
```

へ進む。

---

## 3. World Rugby response dependency

World Rugbyへの初回問い合わせは2026-07-29に送信済みで、2026-08-18時点では回答待ち。

回答が得られるまでは：

- public data expansionを凍結
- scrapingを行わない
- large-scale redistributionを増やさない
- architecture / tests / local prototypeを優先

とする。

第2回問い合わせでは、Video + Stats / Analysis Workspace構想を1〜2文で説明する程度に留め、AI / MLや詳細event taxonomyは相手から説明を求められた場合に提示する。

---

## 4. Product positioning update

SVNS Stats Analyzerの競争軸を、

> World Rugby内部分析より高度なものを作る

には置かない。

長期的には：

> **World Rugby / RugbyPass / official data providersが持つ一次データと公式公開映像を、一般SVNSファンが探索・比較・分析しやすい体験へ変換する**

ことを中心価値とする。

---

## 5. Video-tagging architecture principle

通常構造：

```text
Official/public YouTube video
+
standard embedded player
+
YouTube video ID / timestamp
+
SVNS Stats Analyzer event metadata
```

動画ファイル自体はAnalyzer側でdownload / host / redistributeしない。

---

## 6. AI policy

AIを先行実装しない。

基本順：

```text
Human tagging
→ Structured Event Data
→ Derived Metrics
→ Rule-based Analysis
→ Optional AI Explanation / Assistance
```

十分なreviewed dataができた後にのみ、tagging補助・event候補提示等を検討する。

---

## 7. Repository operations

### 置き換え

```text
docs/version-1.1-roadmap.md
```

### 新規追加

```text
docs/version-1.1-roadmap-revision-2026-08-18.md
```

### 削除

```text
なし
```
