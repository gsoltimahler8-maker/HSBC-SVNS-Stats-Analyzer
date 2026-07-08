# SVNS Stats Analyzer

# Dubai SVNS Import Targets

Version: v0.7-03
Scope: Real Data Expansion Phase 1
Status: Active

---

## 1. この文書の目的

この文書は、Version0.7 で real data import の第一対象とする試合を整理するための一覧である。

対象は以下に限定する。

* season: `2025-26`
* gender: `Women`
* team: `Japan Women 7s`
* tournament: `Dubai SVNS`
* source: `Rugby.com.au Match Stats`

Version0.7 では、Japan Women 7s / 2025-26 / Dubai SVNS の試合を1試合ずつ real data 化し、StatsAnalysis / StatsTrends / Match Search で確認する。

---

## 2. 対象試合の基本方針

Version0.7 では、以下の方針で対象試合を扱う。

1. Dubai SVNS の Japan Women 7s 出場試合を対象にする。
2. Rugby.com.au Match Stats 由来のデータを主データとする。
3. すでに real data 化済みの Fiji Women 7s 戦を基準例とする。
4. 未追加の試合は、1試合ずつ `matches.json` に追加する。
5. 同一試合の sample data が存在する場合は削除する。
6. 追加後は StatsAnalysis / StatsTrends / Match Search で確認する。
7. 将来の Video Library 連携を見据え、matchId / sourceUrlCandidate を記録する。

---

## 3. Japan Women 7s / Dubai SVNS 対象試合一覧

現時点で確認対象とする試合は以下の5試合である。

| Import Priority | Import ID | Match ID | Match                                    | Score                      | Stage / Round                       | Match Date | Status   |
| --------------: | --------- | -------- | ---------------------------------------- | -------------------------- | ----------------------------------- | ---------- | -------- |
|               1 | IMP-0001  | `949558` | Japan Women 7s vs Fiji Women 7s          | Japan 22 - 12 Fiji         | Third-Place Play Off / Bronze Final | 2025-11-30 | Verified |
|               2 | IMP-0002  | `949546` | Great Britain Women 7s vs Japan Women 7s | Great Britain 5 - 36 Japan | Pool B                              | 2025-11-29 | Planned  |
|               3 | IMP-0003  | `949550` | Canada Women 7s vs Japan Women 7s        | Canada 19 - 21 Japan       | Pool B                              | 2025-11-29 | Planned  |
|               4 | IMP-0004  | `949542` | Australia Women 7s vs Japan Women 7s     | Australia 31 - 7 Japan     | Pool B                              | 2025-11-29 | Planned  |
|               5 | IMP-0005  | `949554` | New Zealand Women 7s vs Japan Women 7s   | New Zealand 31 - 5 Japan   | Semi-final                          | 2025-11-30 | Planned  |

---

## 4. Import Priority の考え方

Version0.7 では、以下の順で real data import を進める。

### Priority 1: IMP-0001 Fiji Women 7s 戦

この試合はすでに real data import 済みであり、Version0.6 の基準例である。

扱い：

* baseline case
* already imported
* already verified
* old sample Fiji match removed

---

### Priority 2: IMP-0002 Great Britain Women 7s 戦

次に追加する候補は、Great Britain Women 7s 戦とする。

理由：

* Japan が 36-5 で勝利している
* 試合内容・スタッツの差が大きく、表示確認に向いている
* Fiji 戦と同じく Japan 側の positive case として比較しやすい
* Match Count 増加確認に向いている
* StatsTrends の変化を確認しやすい

---

### Priority 3: IMP-0003 Canada Women 7s 戦

次点候補は、Canada Women 7s 戦とする。

理由：

* Japan が 21-19 で接戦勝利している
* Great Britain 戦とは異なる接戦データとして有用
* conversion accuracy などの確認材料になる
* Canada は今後の比較対象として重要である

---

### Priority 4: IMP-0004 Australia Women 7s 戦

Australia Women 7s 戦は、負け試合の real data として重要である。

理由：

* Japan が 7-31 で敗れている
* 強豪相手の defensive / possession / territory などの比較に向く
* 勝利試合だけに偏らない dataset を作れる
* StatsAnalysis の win / loss 比較拡張時に重要になる

---

### Priority 5: IMP-0005 New Zealand Women 7s 戦

New Zealand Women 7s 戦は、準決勝の強豪相手データとして重要である。

理由：

* Japan が 5-31 で敗れている
* eventual tournament champion との比較対象になる
* 最上位国相手の差を見る材料になる
* 将来の defensive efficiency / attack efficiency 分析に有用である

---

## 5. Source URL Candidate List

`matches.json` に登録する前に、以下の source URL candidate を実ブラウザで確認する。

Rugby.com.au の canonical URL としては、以下の形式を候補にする。

```text
https://www.rugby.com.au/match-centre/261/2026/{matchId}?tab=Match-Stats
```

| Import ID | Match ID | Source URL Candidate                                                    |
| --------- | -------- | ----------------------------------------------------------------------- |
| IMP-0001  | `949558` | `https://www.rugby.com.au/match-centre/261/2026/949558?tab=Match-Stats` |
| IMP-0002  | `949546` | `https://www.rugby.com.au/match-centre/261/2026/949546?tab=Match-Stats` |
| IMP-0003  | `949550` | `https://www.rugby.com.au/match-centre/261/2026/949550?tab=Match-Stats` |
| IMP-0004  | `949542` | `https://www.rugby.com.au/match-centre/261/2026/949542?tab=Match-Stats` |
| IMP-0005  | `949554` | `https://www.rugby.com.au/match-centre/261/2026/949554?tab=Match-Stats` |

注意：

* `sourceUrlCandidate` は、`matches.json` へ登録する前に実際に開いて確認する。
* Rugby.com.au / Rugby Network 系の同一 matchId ページが複数ドメインで見える場合がある。
* `matches.json` に登録する source は、原則として `Rugby.com.au Match Stats` とする。
* URLがRugby.com.auで開けない場合は、実際に確認できた Rugby Network 系URLを `sourceUrl` として記録し、`notes` に補足する。

---

## 6. Import Target Detail Records

---

### IMP-0001

| Field                     | Value                               |
| ------------------------- | ----------------------------------- |
| Match ID                  | `949558`                            |
| Match                     | Japan Women 7s vs Fiji Women 7s     |
| Score                     | Japan 22 - 12 Fiji                  |
| Stage / Round             | Third-Place Play Off / Bronze Final |
| Match Date                | 2025-11-30                          |
| Source                    | Rugby.com.au Match Stats            |
| Status                    | Verified                            |
| Import Priority           | 1                                   |
| Data Type                 | real                                |
| Data Coverage Level       | full または現行仕様に準拠                     |
| Sample Data Replacement   | Completed                           |
| Match Search Verification | Pending                             |
| Video Library Candidate   | Yes                                 |

Notes:

* Version0.6 で real data import 済み。
* 古い sample Fiji 戦は削除済み。
* 2025-26 / Women / Japan Women 7s / Dubai SVNS 条件で表示確認済み。
* Version0.7 では、Match Search 反映確認を追加で行う。

---

### IMP-0002

| Field                     | Value                                    |
| ------------------------- | ---------------------------------------- |
| Match ID                  | `949546`                                 |
| Match                     | Great Britain Women 7s vs Japan Women 7s |
| Score                     | Great Britain 5 - 36 Japan               |
| Stage / Round             | Pool B                                   |
| Match Date                | 2025-11-29                               |
| Source                    | Rugby.com.au Match Stats                 |
| Status                    | Planned                                  |
| Import Priority           | 2                                        |
| Data Type                 | real                                     |
| Data Coverage Level       | full または現行仕様に準拠                          |
| Sample Data Replacement   | To be checked                            |
| Match Search Verification | Pending                                  |
| Video Library Candidate   | Yes                                      |

Notes:

* Fiji 戦に続く2試合目の real data import 候補。
* Japan の大勝試合であり、positive case として扱いやすい。
* `matches.json` 追加時には、team を `Japan Women 7s`、opponent を `Great Britain Women 7s` として登録する。
* Match Centre 表示上は Great Britain Women 7s vs Japan Women 7s の順だが、アプリ内では分析対象側を Japan とする。

---

### IMP-0003

| Field                     | Value                             |
| ------------------------- | --------------------------------- |
| Match ID                  | `949550`                          |
| Match                     | Canada Women 7s vs Japan Women 7s |
| Score                     | Canada 19 - 21 Japan              |
| Stage / Round             | Pool B                            |
| Match Date                | 2025-11-29                        |
| Source                    | Rugby.com.au Match Stats          |
| Status                    | Planned                           |
| Import Priority           | 3                                 |
| Data Type                 | real                              |
| Data Coverage Level       | full または現行仕様に準拠                   |
| Sample Data Replacement   | To be checked                     |
| Match Search Verification | Pending                           |
| Video Library Candidate   | Yes                               |

Notes:

* 接戦勝利の real data として重要。
* Canada Women 7s は今後も比較対象として重要度が高い。
* `matches.json` 追加時には、team を `Japan Women 7s`、opponent を `Canada Women 7s` とする。
* Match Centre 表示上は Canada Women 7s vs Japan Women 7s の順だが、アプリ内では分析対象側を Japan とする。

---

### IMP-0004

| Field                     | Value                                |
| ------------------------- | ------------------------------------ |
| Match ID                  | `949542`                             |
| Match                     | Australia Women 7s vs Japan Women 7s |
| Score                     | Australia 31 - 7 Japan               |
| Stage / Round             | Pool B                               |
| Match Date                | 2025-11-29                           |
| Source                    | Rugby.com.au Match Stats             |
| Status                    | Planned                              |
| Import Priority           | 4                                    |
| Data Type                 | real                                 |
| Data Coverage Level       | full または現行仕様に準拠                      |
| Sample Data Replacement   | To be checked                        |
| Match Search Verification | Pending                              |
| Video Library Candidate   | Yes                                  |

Notes:

* 強豪 Australia Women 7s 相手の敗戦データ。
* Japan の課題分析、特に possession / defence / missed tackles / clean breaks conceded の確認に使える。
* `matches.json` 追加時には、team を `Japan Women 7s`、opponent を `Australia Women 7s` とする。
* Match Centre 表示上は Australia Women 7s vs Japan Women 7s の順だが、アプリ内では分析対象側を Japan とする。

---

### IMP-0005

| Field                     | Value                                  |
| ------------------------- | -------------------------------------- |
| Match ID                  | `949554`                               |
| Match                     | New Zealand Women 7s vs Japan Women 7s |
| Score                     | New Zealand 31 - 5 Japan               |
| Stage / Round             | Semi-final                             |
| Match Date                | 2025-11-30                             |
| Source                    | Rugby.com.au Match Stats               |
| Status                    | Planned                                |
| Import Priority           | 5                                      |
| Data Type                 | real                                   |
| Data Coverage Level       | full または現行仕様に準拠                        |
| Sample Data Replacement   | To be checked                          |
| Match Search Verification | Pending                                |
| Video Library Candidate   | Yes                                    |

Notes:

* eventual tournament champion である New Zealand Women 7s との対戦。
* Japan が最上位層に対してどの程度差をつけられたかを見るために重要。
* `matches.json` 追加時には、team を `Japan Women 7s`、opponent を `New Zealand Women 7s` とする。
* Match Centre 表示上は New Zealand Women 7s vs Japan Women 7s の順だが、アプリ内では分析対象側を Japan とする。

---

## 7. matches.json 登録時の team / opponent 方針

Match Centre 上の表示順に関係なく、SVNS Stats Analyzer では以下の方針に統一する。

```text
team: Japan Women 7s
opponent: 対戦相手
```

例：

Match Centre 表示：

```text
Australia Women 7s vs Japan Women 7s
```

`matches.json` 登録：

```text
team: Japan Women 7s
opponent: Australia Women 7s
```

理由：

* StatsAnalysis で Japan Women 7s を分析対象にするため
* StatsTrends で Japan Women 7s の推移を見るため
* 対戦相手別平均を安定させるため
* Match Search で team / opponent の意味を固定するため

---

## 8. 追加前チェック

各試合を `matches.json` に追加する前に、以下を確認する。

* [ ] source URL candidate を開いて Match Stats を確認した
* [ ] matchId が一致している
* [ ] season が `2025-26` である
* [ ] gender が `Women` である
* [ ] tournament が `Dubai SVNS` である
* [ ] team を `Japan Women 7s` として登録する
* [ ] opponent を正しく登録する
* [ ] stage / round を確認した
* [ ] matchDate を確認した
* [ ] score を確認した
* [ ] Rugby.com.au Match Stats の数値を転記する
* [ ] team 側と opponent 側の数値を取り違えない
* [ ] 同一 matchId の既存レコードがないか確認した
* [ ] 同一試合の sample data がないか確認した

---

## 9. 追加後チェック

各試合を追加した後に、以下を確認する。

* [ ] アプリが正常に起動する
* [ ] StatsAnalysis で表示される
* [ ] StatsTrends で表示される
* [ ] Match Search で表示される
* [ ] Match Count が想定どおりである
* [ ] 同一試合が二重表示されていない
* [ ] source が `Rugby.com.au Match Stats` として表示される
* [ ] dataCoverageLevel が想定どおり表示される
* [ ] sample data と誤認されていない
* [ ] real data import log を更新した

---

## 10. Video Library 連携候補

Version0.7 では Video Library の本格改修は行わない。

ただし、以下の5試合は将来的な Video Library 連携候補とする。

| Import ID | Match ID | Match                                    | Video Library Candidate | Notes                                                                  |
| --------- | -------- | ---------------------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| IMP-0001  | `949558` | Japan Women 7s vs Fiji Women 7s          | Yes                     | Bronze Final / Third-Place Play Off. Highlight video likely useful.    |
| IMP-0002  | `949546` | Great Britain Women 7s vs Japan Women 7s | Yes                     | Japan's large win. Useful for positive attack examples.                |
| IMP-0003  | `949550` | Canada Women 7s vs Japan Women 7s        | Yes                     | Close win. Useful for pressure game analysis.                          |
| IMP-0004  | `949542` | Australia Women 7s vs Japan Women 7s     | Yes                     | Loss to elite team. Useful for gap analysis.                           |
| IMP-0005  | `949554` | New Zealand Women 7s vs Japan Women 7s   | Yes                     | Semi-final loss to tournament champion. Useful for benchmark analysis. |

今後、動画URLを確認した場合は、以下のフィールド追加を検討する。

* `videoUrl`
* `videoSource`
* `videoType`
* `embedAvailable`
* `externalLinkOnly`

---

## 11. Match Search 確認対象

Version0.7 では、real data 追加後に Match Search で以下を確認する。

| Import ID | Match ID | Search by Season | Search by Gender | Search by Tournament | Search by Team | Search by Opponent | Source Visible | Status  |
| --------- | -------- | ---------------- | ---------------- | -------------------- | -------------- | ------------------ | -------------- | ------- |
| IMP-0001  | `949558` | Pending          | Pending          | Pending              | Pending        | Pending            | Pending        | Pending |
| IMP-0002  | `949546` | Pending          | Pending          | Pending              | Pending        | Pending            | Pending        | Pending |
| IMP-0003  | `949550` | Pending          | Pending          | Pending              | Pending        | Pending            | Pending        | Pending |
| IMP-0004  | `949542` | Pending          | Pending          | Pending              | Pending        | Pending            | Pending        | Pending |
| IMP-0005  | `949554` | Pending          | Pending          | Pending              | Pending        | Pending            | Pending        | Pending |

---

## 12. v0.7-03 完了条件

以下を満たした場合、v0.7-03 は完了とする。

* [x] `docs/dubai-svns-import-targets.md` が作成されている
* [x] Japan Women 7s / 2025-26 / Dubai SVNS の対象試合が整理されている
* [x] 949558 Fiji Women 7s 戦が基準例として記録されている
* [x] 追加予定試合の matchId が記録されている
* [x] source URL candidate が記録されている
* [x] import priority が定義されている
* [x] Match Search 確認対象が記録されている
* [x] Video Library 連携候補が記録されている

---

## 13. 次の作業

次は v0.7-04 として、`matches.json` に2試合目の real data を追加する。

推奨対象：

```text
IMP-0002
matchId: 949546
Great Britain Women 7s vs Japan Women 7s
score: Great Britain 5 - 36 Japan
```

作業方式：

1. 現行 `matches.json` 全文を確認する。
2. Great Britain 戦の既存 sample data があるか確認する。
3. 必要であれば sample data を削除する。
4. Rugby.com.au Match Stats 由来の real data を1件追加する。
5. `matches.json` 全文置き換え版を作成する。
6. StatsAnalysis / StatsTrends / Match Search で確認する。
