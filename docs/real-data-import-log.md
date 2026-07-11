# SVNS Stats Analyzer  
# Real Data Import Log

Version: v0.7-08  
Scope: Real Data Expansion Phase 1  
Status: Active

---

## 1. この文書の目的

この文書は、`matches.json` に追加した real data の作業履歴を記録するためのログである。

目的は以下である。

- どの試合を real data として追加したか記録する
- match ID / source URL / source を追跡できるようにする
- sample data を削除・置換したか確認する
- StatsAnalysis / StatsTrends / Match Search の確認結果を残す
- 将来の Video Library 連携候補を整理する
- Version0.8 以降の CSV import / 検索強化 / データ管理画面の検討材料にする

詳細ルールは以下を参照する。

- `docs/data-operation-rules.md`
- `docs/real-data-import-checklist.md`
- `docs/matches-json-field-rules.md`
- `docs/version-0.7-plan.md`
- `docs/dubai-svns-import-targets.md`

---

## 2. Version0.7 の現在の import 方針

Version0.7 では、以下を第一対象とする。

- season: `2025-26`
- gender: `Women`
- team: `Japan`
- tournament: `Dubai SVNS`
- source: `Rugby.com.au Match Stats`

Version0.7 の第一対象として、Dubai SVNS の Japan Women 7s 関連5試合を real data 化した。

対象試合：

- Australia vs Japan
- Great Britain vs Japan
- Canada vs Japan
- New Zealand vs Japan
- Japan vs Fiji

---

## 3. Source Provider 運用ルール

`sourceProvider: "Rugby.com.au Match Stats"` として登録する場合、根拠は Rugby.com.au の Match Centre に限定する。

採用する source URL は原則として以下の形式とする。

```text
https://www.rugby.com.au/match-centre/261/2026/{matchId}?tab=Match-Stats
