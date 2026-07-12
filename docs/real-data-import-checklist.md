# SVNS Stats Analyzer

# Real Data Import Checklist

Version: v0.7-11  
Scope: Real Data Import Workflow  
Status: Active

---

## 1. このチェックリストの目的

このチェックリストは、`matches.json` に real data を追加・更新する際に、以下を防止するために使用する。

- 作業漏れ
- 重複登録
- sample data の残存
- source の誤認
- team 側と opponent 側の値の取り違え
- `metres` など取得項目の欠落
- 勝敗表示の曖昧さ
- 欠損値の誤った `0` 入力
- StatsAnalysis / StatsTrends / 分布図での表示不整合

詳細な運用ルールは、以下を参照する。

- `docs/data-operation-rules.md`
- `docs/matches-json-field-rules.md`
- `docs/real-data-import-log.md`
- `docs/real-data-import-log-v0.7-08-addendum.md`

このチェックリストは、実作業時に毎回確認するための簡易版である。

---

## 2. 作業前チェック

real data を追加する前に、以下を確認する。

- [ ] 対象試合が決まっている
- [ ] season が確認済み
- [ ] gender が確認済み
- [ ] tournament が確認済み
- [ ] team が確認済み
- [ ] opponent が確認済み
- [ ] stage / round が確認済み
- [ ] match date が確認済み
- [ ] final score が確認済み
- [ ] winner が確認済み
- [ ] loser が確認済み
- [ ] 主データソースが確認済み
- [ ] source URL が確認済み
- [ ] Rugby.com.au match ID が確認済み
- [ ] 同一試合の既存レコード有無を確認した
- [ ] 同一試合の sample data 有無を確認した

---

## 3. データソース確認

原則として、試合別チームスタッツは Rugby.com.au Match Stats を主データソースとする。

### 3.1 Rugby.com.au 直接確認

- [ ] Rugby.com.au Match Centre の対象ページを直接確認した
- [ ] URL が `www.rugby.com.au/match-centre/...` である
- [ ] Match Stats タブの数値を確認した
- [ ] `sourceProvider: "Rugby.com.au Match Stats"` とする根拠が Rugby.com.au 直接ページである
- [ ] source URL を以下の形式で記録する準備ができている

```text
https://www.rugby.com.au/match-centre/261/2026/{matchId}?tab=Match-Stats
```

### 3.2 補助サイトの扱い

以下は補助確認には使えても、`Rugby.com.au Match Stats` の数値根拠にはしない。

- eagles.rugby
- au7s.rugby
- rugby.ca
- svns.com
- Rugby Network 系ミラー
- その他第三者サイト

確認事項：

- [ ] 補助サイトの数値を Rugby.com.au 由来として登録していない
- [ ] 複数ソースの数値を同一項目内で混在させていない
- [ ] RugbyPass 等を使う場合、補助データとして扱う理由が明確である

### 3.3 Rugby.com.au で詳細確認できない場合

- [ ] 推測で数値を入力していない
- [ ] 未確認項目を `0` にしていない
- [ ] 必要に応じて `Blocked` / `limited_data` / `results_only` / import 保留としている

---

## 4. Team Orientation 確認

現在のアプリでは、分析対象側を `team` に置く。

Japan Women 7s を分析する場合は、Rugby.com.au の左右表示やホーム・アウェー表示にかかわらず、以下で統一する。

```json
{
  "team": "Japan",
  "opponent": "Canada",
  "pointsFor": 21,
  "pointsAgainst": 19
}
```

確認事項：

- [ ] `team` が分析対象チームになっている
- [ ] `opponent` が対戦相手になっている
- [ ] `pointsFor` が team 側得点になっている
- [ ] `pointsAgainst` が opponent 側得点になっている
- [ ] すべてのスタッツ値が team 側の値になっている
- [ ] Rugby.com.au の左右表示をそのまま転記していない

---

## 5. 重複確認

`matches.json` に追加する前に、同一試合の既存データがないか確認する。

確認項目：

- [ ] Rugby.com.au match ID
- [ ] season
- [ ] gender
- [ ] tournament
- [ ] team
- [ ] opponent
- [ ] stage / round
- [ ] match date
- [ ] final score
- [ ] source
- [ ] source URL

以下に該当する場合は、同一試合の可能性が高い。

- [ ] match ID が一致している
- [ ] season が一致している
- [ ] gender が一致している
- [ ] tournament が一致している
- [ ] team が一致している
- [ ] opponent が一致している
- [ ] match date が一致している
- [ ] score が一致している
- [ ] source URL が一致している

別大会・別日・別 match ID の同一カードは、別試合として残す。

---

## 6. sample data 確認

同一試合の sample data が存在する場合は、real data 追加前または追加時に削除する。

- [ ] 同一試合の sample data が存在するか確認した
- [ ] sample data が存在する場合、削除対象として特定した
- [ ] real data と sample data を併存させていない
- [ ] 古い表示確認用データを real data として扱っていない
- [ ] 別大会の同一カードを誤って削除していない

---

## 7. Result Fields 確認

勝敗は以下の5項目で管理する。

```json
{
  "result": "W",
  "teamResult": "W",
  "matchResult": "Japan Win",
  "winner": "Japan",
  "loser": "Canada"
}
```

確認事項：

- [ ] `result` が team 側から見た W / L である
- [ ] `teamResult` が team 側から見た W / L である
- [ ] `matchResult` が試合全体の結果を示している
- [ ] `winner` が実際の勝者である
- [ ] `loser` が実際の敗者である
- [ ] score と winner / loser が一致している
- [ ] `result: "W"` / `"L"` だけで勝者を表現していない
- [ ] 既存コード互換のため `result` を残している

---

## 8. real data 追加・更新チェック

`matches.json` に real data を追加または更新する際に、以下を確認する。

### 8.1 基本情報

- [ ] 1試合につき1レコードとして登録している
- [ ] 同一 Rugby.com.au Match Stats 由来のレコードを複数登録していない
- [ ] season が正しい
- [ ] gender が正しい
- [ ] tournament が正しい
- [ ] team が正しい
- [ ] opponent が正しい
- [ ] stage / round が正しい
- [ ] match date が正しい
- [ ] final score が正しい

### 8.2 Attack

- [ ] `pointsFor`
- [ ] `tries`
- [ ] `metres`
- [ ] `carries`
- [ ] `passes`
- [ ] `offloads`
- [ ] `cleanBreaks`
- [ ] `defendersBeaten`
- [ ] `turnoversConceded`

### 8.3 Defence

- [ ] `pointsAgainst`
- [ ] `tackles`
- [ ] `missedTackles`
- [ ] `turnoversWon`

### 8.4 Possession / Breakdown

- [ ] `possession`
- [ ] `territory`
- [ ] `rucksWon`
- [ ] `rucksLost`

### 8.5 Discipline

- [ ] `penaltiesConceded`
- [ ] `yellowCards`
- [ ] `redCards`

### 8.6 Source / Metadata

- [ ] `external.rugbyComAu`
- [ ] `sourceProvider`
- [ ] `sourceUrl`
- [ ] `fetchedAt`
- [ ] `dataCoverageLevel`
- [ ] `dataCoverageSource`
- [ ] `statDefinitionVersion`
- [ ] `dataType: "real"`

---

## 9. 欠損値確認

未確認または取得不能な値は `null` とする。

```json
{
  "metres": null,
  "territory": null
}
```

確認事項：

- [ ] 未確認値を `0` にしていない
- [ ] `0` は実際に0だった場合のみ使用している
- [ ] `null` と `0` の意味を区別している
- [ ] sample data の未確認値も `null` としている
- [ ] 画面上で `null` が `—` と表示される

---

## 10. ID ルール確認

real data の内部IDは以下を基本とする。

```text
R-{season}-{gender}-{tournamentCode}-{rugbyComAuId}-{teamCode}-{opponentCode}
```

例：

```text
R-202526-W-DUB-949550-JPN-CAN
```

確認事項：

- [ ] real data は `R-` で始まる
- [ ] sample data は `M-` で始まる
- [ ] season code が正しい
- [ ] gender code が正しい
- [ ] tournament code が正しい
- [ ] Rugby.com.au match ID が含まれている
- [ ] team code / opponent code が正しい

---

## 11. 追加後の基本表示確認

データ追加後、アプリ上で以下を確認する。

- [ ] アプリが正常に起動する
- [ ] `loadMatches.js` 経由で `matches.json` が読み込まれている
- [ ] StatsAnalysis が正常に表示される
- [ ] StatsTrends が正常に表示される
- [ ] 対象 season でフィルターできる
- [ ] 対象 gender でフィルターできる
- [ ] 対象 team でフィルターできる
- [ ] 対象 tournament でフィルターできる
- [ ] 対象 opponent でフィルターできる
- [ ] 対象試合が表示される
- [ ] 対象試合が二重表示されていない
- [ ] source 表示が正しい
- [ ] dataCoverageLevel 表示が正しい
- [ ] real data / sample data の区別が正しい

---

## 12. StatsAnalysis 確認

- [ ] Match Count が想定どおりである
- [ ] 対象試合が1件として集計されている
- [ ] 古い sample data が集計に残っていない
- [ ] 試合一覧が日付昇順である
- [ ] 同日は Rugby.com.au match ID 順である
- [ ] 試合一覧の score が正しい
- [ ] 試合一覧の「○○ 勝利」表示が正しい
- [ ] 試合詳細の winner が正しい
- [ ] 試合詳細の loser が正しい
- [ ] 試合詳細の matchResult が正しい
- [ ] `metres` が表示される
- [ ] `null` が `—` と表示される
- [ ] sourceProvider が正しい
- [ ] dataCoverageLevel が正しい
- [ ] 勝敗別平均が不自然に変化していない

---

## 13. StatsTrends 確認

- [ ] 対象試合が時系列順で表示される
- [ ] 同日は Rugby.com.au match ID 順である
- [ ] `metres` を指標として選択できる
- [ ] 欠損値が0として表示されない
- [ ] 対象試合数と有効データ数が区別される
- [ ] 実データ／サンプルデータが表示される
- [ ] real data と sample data の混在時に警告が出る
- [ ] 大会別平均が欠損値を除外している
- [ ] 対戦相手別平均が欠損値を除外している
- [ ] ツールチップに試合情報が表示される
- [ ] ツールチップに試合結果が表示される

---

## 14. 分布図確認

- [ ] X軸を選択できる
- [ ] Y軸を選択できる
- [ ] `metres` を選択できる
- [ ] 欠損値を含む試合を除外している
- [ ] 有効プロット数が表示される
- [ ] 小標本警告が表示される
- [ ] 同じ指標を両軸に選んだ場合に警告が出る
- [ ] ツールチップに対戦相手が表示される
- [ ] ツールチップに score が表示される
- [ ] ツールチップに date / tournament / stage が表示される
- [ ] ツールチップに match result が表示される

---

## 15. 分析結果確認

StatsAnalysis / StatsTrends / 分布図で、二重集計や異常値がないか確認する。

- [ ] Match Count が想定どおりである
- [ ] 同一試合が重複表示されていない
- [ ] 古い sample data が集計に残っていない
- [ ] 平均値が不自然に変化していない
- [ ] 欠損値が平均値の分母に含まれていない
- [ ] トレンドグラフに同一試合が重複して表示されていない
- [ ] 対戦相手別平均に同一試合が二重反映されていない
- [ ] source 表示と実際のデータ内容が一致している
- [ ] 小標本の分析結果を確定的に解釈させる表示になっていない

---

## 16. Import Log 更新

表示確認後、以下を import log に記録する。

- [ ] Import ID
- [ ] Rugby.com.au match ID
- [ ] source URL
- [ ] season
- [ ] tournament
- [ ] match date
- [ ] stage / round
- [ ] team
- [ ] opponent
- [ ] score
- [ ] winner / loser
- [ ] import status
- [ ] sample data replacement の有無
- [ ] StatsAnalysis 確認結果
- [ ] StatsTrends 確認結果
- [ ] 分布図確認結果
- [ ] Match Search 確認結果
- [ ] Video Library candidate
- [ ] 発生した問題
- [ ] 解決方法

---

## 17. 完了判定

以下をすべて満たした場合、その試合の real data import を完了とする。

- [ ] Rugby.com.au を直接確認した
- [ ] real data が `matches.json` に登録されている
- [ ] 取得可能なスタッツを記録した
- [ ] `metres` を確認した
- [ ] result fields を記録した
- [ ] 同一試合の sample data が残っていない
- [ ] 同一試合の real data が二重登録されていない
- [ ] source が明記されている
- [ ] source URL と match ID が記録されている
- [ ] `dataType: "real"` が記録されている
- [ ] StatsAnalysis で正常に表示される
- [ ] StatsTrends で正常に表示される
- [ ] 分布図に正常に反映される
- [ ] Match Count が想定どおりである
- [ ] import log が更新されている

---

## 18. 現在の基準例

### Dubai SVNS 2025-26 / Japan Women 7s

Version0.7 時点では、以下の5試合を real data import の基準例とする。

| Match ID | Opponent | Score | Result | Status |
|---|---|---|---|---|
| 949542 | Australia | Japan 7-31 Australia | Australia Win | Completed |
| 949546 | Great Britain | Japan 36-5 Great Britain | Japan Win | Completed |
| 949550 | Canada | Japan 21-19 Canada | Japan Win | Completed |
| 949554 | New Zealand | Japan 5-31 New Zealand | New Zealand Win | Completed |
| 949558 | Fiji | Japan 22-12 Fiji | Japan Win | Completed |

確認済み内容：

- [x] Rugby.com.au Match Stats を直接確認済み
- [x] 5試合を `matches.json` に追加済み
- [x] `metres` を追加済み
- [x] `teamResult` / `matchResult` / `winner` / `loser` を追加済み
- [x] New Zealand sample data を削除済み
- [x] Fiji sample data を削除済み
- [x] `loadMatches.js` 経由で読み込み済み
- [x] StatsAnalysis で表示確認済み
- [x] StatsTrends で表示確認済み
- [x] 試合一覧の時系列ソート確認済み
- [x] 分布図の指標選択化確認済み
- [x] Rugby.com.au Match Stats として表示確認済み

今後の real data import では、この5試合の処理を基準にする。

---

## 19. 禁止事項チェック

作業完了前に、以下に該当していないことを確認する。

- [ ] real data と同一試合の sample data を併存させていない
- [ ] 同一試合を複数レコードとして登録していない
- [ ] Rugby.com.au 以外のサイトを Rugby.com.au Match Stats の根拠にしていない
- [ ] Rugby.com.au と RugbyPass の数値を無区別に混在させていない
- [ ] 出典不明データを real data として扱っていない
- [ ] season / gender / tournament が異なるデータを同一試合として扱っていない
- [ ] team 側と opponent 側の数値を取り違えていない
- [ ] 未確認値を `0` にしていない
- [ ] `metres` を転記し忘れていない
- [ ] `result: "W"` / `"L"` だけで勝者を表現していない
- [ ] source URL や match ID を確認できるのに記録していない

---

## 20. 作業メモ欄

real data import 作業時に、必要に応じて以下を記録する。

```text
対象試合:

season:

gender:

tournament:

stage / round:

match date:

team:

opponent:

final score:

winner:

loser:

result:

teamResult:

matchResult:

source:

source URL:

Rugby.com.au match ID:

既存 sample data の有無:

削除した既存データ:

追加・更新した内容:

metres 確認結果:

欠損値確認結果:

表示確認結果:

StatsAnalysis 確認結果:

StatsTrends 確認結果:

分布図確認結果:

Match Search 確認結果:

import log 更新結果:

備考:
```
