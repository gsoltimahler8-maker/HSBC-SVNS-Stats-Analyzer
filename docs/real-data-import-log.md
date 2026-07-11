# SVNS Stats Analyzer
# Real Data Import Log Addendum

Version: v0.7-08  
Scope: Dubai SVNS / Women / Japan Real Data Import  
Status: Active

---

## 1. この追補ファイルの目的

この文書は、`docs/real-data-import-log.md` の追補である。

Version0.7 において、Dubai SVNS / Women / Japan の5試合を Rugby.com.au Match Stats 由来の real data として追加・整理したため、その作業履歴を記録する。

既存の `docs/real-data-import-log.md` はそのまま残し、この追補ファイルで v0.7-08 時点の更新内容を補足する。

---

## 2. v0.7-08 時点の重要更新

Version0.7-08 で以下を実施した。

- Dubai SVNS / Women / Japan の5試合を real data 化した
- Australia 戦を追加した
- Great Britain 戦を再確認した
- Canada 戦を追加した
- New Zealand 戦を sample data から real data に置換した
- Fiji 戦に `metres` 等の追加フィールドを反映した
- 全 real data の sourceUrl を Rugby.com.au に統一した
- `metres` フィールドを追加した
- `teamResult` を追加した
- `matchResult` を追加した
- `winner` / `loser` を追加した
- `result` は既存互換性維持のため残した

---

## 3. Rugby.com.au 直接確認ルール

`sourceProvider: "Rugby.com.au Match Stats"` として登録する場合、根拠は Rugby.com.au の Match Centre に限定する。

採用する source URL は原則として以下の形式とする。

```text
https://www.rugby.com.au/match-centre/261/2026/{matchId}?tab=Match-Stats
```

以下のドメインは、補助確認には使えても、`sourceProvider: "Rugby.com.au Match Stats"` の根拠にはしない。

- eagles.rugby
- au7s.rugby
- rugby.ca
- svns.com
- その他第三者サイト・ミラーサイト

---

## 4. 追加・整理済み real data 一覧

| Import ID | Match ID | Date | Stage | Team | Opponent | Score | Match Result | Status |
|---|---|---|---|---|---|---|---|---|
| IMP-0004 | 949542 | 2025-11-29 | Pool | Japan | Australia | Japan 7-31 Australia | Australia Win | Verified |
| IMP-0002 | 949546 | 2025-11-29 | Pool | Japan | Great Britain | Japan 36-5 Great Britain | Japan Win | Verified |
| IMP-0003 | 949550 | 2025-11-29 | Pool | Japan | Canada | Japan 21-19 Canada | Japan Win | Verified |
| IMP-0005 | 949554 | 2025-11-30 | Semi Final | Japan | New Zealand | Japan 5-31 New Zealand | New Zealand Win | Verified |
| IMP-0001 | 949558 | 2025-11-30 | Bronze Final | Japan | Fiji | Japan 22-12 Fiji | Japan Win | Verified |

---

## 5. Japan Match Stats 一覧

| Match ID | Opponent | Tries | Metres | Carries | Passes | Offloads | Clean Breaks | Defenders Beaten | Tackles | Missed Tackles | TO Won | TO Conceded | Rucks Won | Rucks Lost | Possession | Pens Conc. | YC | RC |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 949542 | Australia | 1 | 198 | 19 | 27 | 2 | 2 | 3 | 18 | 13 | 2 | 4 | 4 | 2 | 28 | 6 | 0 | 0 |
| 949546 | Great Britain | 6 | 336 | 47 | 55 | 5 | 8 | 17 | 14 | 5 | 2 | 1 | 16 | 0 | 67 | 4 | 1 | 0 |
| 949550 | Canada | 3 | 258 | 32 | 61 | 4 | 9 | 4 | 15 | 4 | 1 | 3 | 16 | 0 | 61 | 3 | 0 | 0 |
| 949554 | New Zealand | 1 | 133 | 22 | 39 | 4 | 5 | 4 | 6 | 15 | 0 | 6 | 9 | 0 | 44 | 1 | 0 | 0 |
| 949558 | Fiji | 4 | 289 | 59 | 67 | 4 | 8 | 18 | 6 | 9 | 1 | 1 | 22 | 1 | 72 | 3 | 0 | 0 |

---

## 6. result 関連フィールドの整理

従来の `result: "W"` / `"L"` は、`team` 側から見た勝敗である。

ただし、Match Search で Japan 以外のチームを検索した場合、`result` だけでは意味が曖昧になる。

そのため、Version0.7-08 で以下を追加した。

| Field | Meaning |
|---|---|
| result | 既存互換用。team 側から見た W / L |
| teamResult | team 側から見た W / L |
| matchResult | 試合全体の結果。例：Japan Win |
| winner | 勝利チーム |
| loser | 敗戦チーム |

例：

```json
{
  "team": "Japan",
  "opponent": "Canada",
  "result": "W",
  "teamResult": "W",
  "matchResult": "Japan Win",
  "winner": "Japan",
  "loser": "Canada"
}
```

---

## 7. sample data replacement

Version0.7-08 で以下の sample data を削除・置換した。

| Removed Sample ID | Replacement ID | Match ID | Match | Status |
|---|---|---|---|---|
| M-202526-W-DUB-001 | R-202526-W-DUB-949554-JPN-NZL | 949554 | Japan vs New Zealand | Completed |

Fiji 戦の古い sample data は Version0.6 時点で削除済み。

Cape Town SVNS、Men Dubai、Hong Kong SVNS の sample data は今回の対象外のため残している。

---

## 8. 表示確認

Version0.7-08 時点で、以下は表示確認済み。

- StatsAnalysis
- StatsTrends
- Match Search / 試合一覧
- source 表示
- dataCoverageLevel 表示
- Dubai SVNS / Women / Japan の5試合表示

確認済み対象：

- Australia
- Great Britain
- Canada
- New Zealand
- Fiji

---

## 9. 残課題

Version0.7 内または Version0.8 以降で扱う課題は以下。

| Issue | Status | Notes |
|---|---|---|
| 試合一覧の時系列ソート | Open | v0.7-13 で対応予定 |
| 分布図の指標固定問題 | Open | Clean Breaks × Point Difference 固定では傾向が見えにくい |
| sample size warning | Open | データ数が少ないため注意文が必要 |
| metres の画面表示対応 | Open | 画面側で未表示なら追加検討 |
| Match Search の結果表示改善 | Open | matchResult / winner / loser を活用予定 |
| Video Library 連携 | Open | videoUrl 等は未確認 |

---

## 10. v0.7-08 完了条件

以下を満たしたため、v0.7-08 は完了扱いとする。

- [x] Dubai SVNS / Women / Japan の5試合が real data 化された
- [x] Rugby.com.au sourceUrl が記録された
- [x] `metres` が追加された
- [x] `teamResult` が追加された
- [x] `matchResult` が追加された
- [x] `winner` / `loser` が追加された
- [x] New Zealand sample data が real data に置換された
- [x] Match Search / 試合一覧で表示確認済み
- [x] StatsAnalysis / StatsTrends で表示確認済み
- [x] 残課題が記録された

---

## 11. 備考

この追補ファイルは、`docs/real-data-import-log.md` の完全置換ではない。

今後、ドキュメントが肥大化した場合は、全文置き換えではなく、以下のどちらかで運用する。

1. 追補ファイル方式
2. 章単位の小分け置換方式

Version0.7-08 では、追補ファイル方式を採用する。

https://www.rugby.com.au/match-centre/261/2026/{matchId}?tab=Match-Stats
