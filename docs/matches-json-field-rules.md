# SVNS Stats Analyzer

# matches.json Field Rules

Version: v0.6-11
Scope: Real Data Import Preparation
Status: Active

---

## 1. この文書の目的

この文書は、`matches.json` に登録する試合データの項目ルールを定める。

目的は以下である。

* real data import 時の入力項目を統一する
* season / gender / tournament / team / opponent の表記揺れを防ぐ
* Rugby.com.au Match Stats 由来データと sample data を明確に区別する
* source / match ID / source URL の記録漏れを防ぐ
* 今後フィールドを追加する際の判断基準を明確にする
* StatsAnalysis / StatsTrends での集計ミスを防ぐ

詳細な重複データ運用ルールは、以下を参照する。

* `docs/data-operation-rules.md`

real data 追加時の作業確認は、以下を参照する。

* `docs/real-data-import-checklist.md`

---

## 2. 基本方針

`matches.json` は、SVNS Stats Analyzer の分析データ本体である。

そのため、以下の方針に従う。

1. 現行アプリで読み込める既存フィールド構造を優先する。
2. フィールド名を変更する場合は、必ず `loadMatches.js` および参照コンポーネントの対応を行う。
3. real data では、source / match ID / source URL を可能な限り記録する。
4. sample data と real data は明確に区別する。
5. 同じ意味の項目を複数の名前で併用しない。
6. 表記揺れを避けるため、season / gender / tournament / team / opponent の表記は固定する。
7. 数値項目は、Rugby.com.au Match Stats の定義を優先する。
8. 不明な値を推測で埋めない。
9. 空欄・未確認・非対応項目は、ルールに従って明示的に扱う。

---

## 3. 必須項目

`matches.json` の各試合レコードには、原則として以下の項目を必須とする。

### 3.1 試合識別項目

* season
* gender
* tournament
* team
* opponent
* source

これらは、フィルター・集計・表示の基礎となるため、必ず記録する。

---

### 3.2 season

`season` は、SVNS の対象シーズンを表す。

表記例：

* `2025-26`
* `2024-25`

禁止例：

* `2025/26`
* `2025`
* `2025 season`
* `25-26`

表記は必ず `YYYY-YY` 形式に統一する。

---

### 3.3 gender

`gender` は、対象カテゴリーを表す。

使用する値：

* `Men`
* `Women`

禁止例：

* `mens`
* `womens`
* `男子`
* `女子`
* `M`
* `W`

アプリ内表示で日本語化する場合でも、`matches.json` 内の値は `Men` / `Women` に統一する。

---

### 3.4 tournament

`tournament` は、大会名を表す。

表記例：

* `Dubai SVNS`
* `Cape Town SVNS`
* `Singapore SVNS`
* `Perth SVNS`
* `Vancouver SVNS`
* `New York SVNS`
* `Hong Kong SVNS`
* `Valladolid SVNS`
* `Bordeaux SVNS`

禁止例：

* `Dubai`
* `SVNS Dubai`
* `ドバイ`
* `Dubai Sevens`
* `HSBC SVNS Dubai`

大会名は、アプリ内のフィルターと一致する表記に固定する。

---

### 3.5 team / opponent

`team` は分析対象チーム、`opponent` は対戦相手を表す。

表記例：

* `Japan Women 7s`
* `Fiji Women 7s`
* `New Zealand Women 7s`
* `Australia Women 7s`
* `Canada Women 7s`
* `France Women 7s`
* `USA Women 7s`
* `Great Britain Women 7s`

方針：

* `team` は、分析対象として表示・集計する側のチームを記録する。
* `opponent` は、その試合の相手チームを記録する。
* 同一試合で team / opponent を逆にした別レコードを作らない。
* チーム名の略称は原則使用しない。

禁止例：

* `Japan`
* `JPN`
* `Sakura Sevens`
* `Fiji`
* `FIJ`
* `USA W`
* `Great Britain`

---

### 3.6 source

`source` は、データの出典を表す。

表記例：

* `Rugby.com.au Match Stats`
* `RugbyPass`
* `World Rugby`
* `SVNS`
* `Sample Data`

原則として、試合別チームスタッツでは以下を優先する。

* `Rugby.com.au Match Stats`

sample data の場合は、必ず `Sample Data` と明記する。

---

## 4. 推奨項目

以下の項目は、可能な限り記録する。

* matchId
* sourceUrl
* matchDate
* stage
* round
* dataType
* dataCoverageLevel
* notes

---

### 4.1 matchId

`matchId` は、外部データソース上の試合識別番号を記録する。

例：

* `949558`

方針：

* Rugby.com.au の match ID が確認できる場合は、必ず記録する。
* match ID は、同一試合判定の最優先キーとして扱う。
* 数字であっても、将来の互換性を考え、文字列として扱ってよい。
* match ID が確認できない場合は、空欄にせず、項目自体を省略してよい。

---

### 4.2 sourceUrl

`sourceUrl` は、データ取得元のURLを記録する。

方針：

* Rugby.com.au Match Stats のURLがある場合は記録する。
* URLは、後から検証できる形で残す。
* URLが長くても省略しない。
* source URL が確認できない場合は、無理に推測して入れない。

---

### 4.3 matchDate

`matchDate` は、試合日を記録する。

推奨形式：

* `YYYY-MM-DD`

例：

* `2025-11-29`

禁止例：

* `29/11/2025`
* `Nov 29 2025`
* `2025.11.29`
* `Dubai Day 1`

日付が未確認の場合は、推測で入力しない。

---

### 4.4 stage / round

`stage` または `round` は、大会内での試合区分を表す。

表記例：

* `Pool`
* `Quarter-final`
* `Semi-final`
* `Bronze Final`
* `Final`
* `Placement`
* `9th Place Semi-final`
* `5th Place Semi-final`

方針：

* 現行 `matches.json` で `stage` を使用している場合は `stage` に統一する。
* 現行 `matches.json` で `round` を使用している場合は `round` に統一する。
* `stage` と `round` を同じ意味で併用しない。
* 大会公式表記とアプリ内表示の整合を優先する。

---

### 4.5 dataType

`dataType` は、データが real data か sample data かを区別するための項目である。

使用する値：

* `real`
* `sample`

方針：

* real data の場合は `real`
* sample data の場合は `sample`
* 項目が未実装の場合でも、将来的には導入を検討する
* 既存構造に `isSample` 等の別項目がある場合は、当面は既存構造を優先する

---

### 4.6 dataCoverageLevel

`dataCoverageLevel` は、データの網羅度・信頼度を表す。

使用例：

* `full`
* `partial`
* `sample`
* `unknown`

方針：

* Rugby.com.au Match Stats 由来で主要項目が揃っている場合は `full`
* 一部項目のみ確認できる場合は `partial`
* sample data の場合は `sample`
* 出典はあるが網羅度が判断できない場合は `unknown`

既に画面表示で `dataCoverageLevel` を使用している場合は、既存仕様を優先する。

---

### 4.7 notes

`notes` は、補足情報を記録するために使用する。

記録例：

* `Replaced old sample Fiji match data.`
* `Rugby.com.au Match Stats used as primary source.`
* `RugbyPass checked only as reference.`
* `Some individual stats not included.`

方針：

* 数値の根拠や例外処理を簡潔に記録する。
* 分析結果そのものは書かない。
* 主観的評価は書かない。
* 長文メモにしない。

---

## 5. 数値項目の扱い

数値項目は、StatsAnalysis / StatsTrends で使用されるため、転記ミスを避ける必要がある。

### 5.1 基本ルール

* 数値は半角数字で記録する。
* 単位は値に含めない。
* `%` は値に含めない。
* 不明な値を `0` として扱わない。
* team 側と opponent 側の数値を取り違えない。
* Rugby.com.au Match Stats の項目名・定義を優先する。

---

### 5.2 パーセント項目

ポゼッションやテリトリーなどのパーセント項目は、原則として数値のみ記録する。

例：

* `54`
* `46`

禁止例：

* `54%`
* `"54%"`
* `0.54`

アプリ側で `%` 表示する場合は、表示処理側で付与する。

---

### 5.3 不明値・欠損値

不明値・欠損値は、推測で埋めない。

方針：

* 値が確認できない場合は、既存仕様に従って `null` または項目省略とする。
* `0` は「実際に0だった」場合のみ使用する。
* 未確認値を `0` にしてはいけない。
* 欠損値がある場合は、必要に応じて `dataCoverageLevel` を `partial` にする。

---

## 6. sample data の項目ルール

sample data は、開発・表示確認用の仮データである。

sample data には、以下のいずれかを明記する。

* `source: "Sample Data"`
* `dataType: "sample"`
* 既存仕様に応じた sample data 判定項目

sample data については、以下を禁止する。

* real data として表示すること
* Rugby.com.au Match Stats 由来と誤認させること
* source URL を実在ソースのように記録すること
* real data が存在する同一試合に残すこと

同一試合の real data が追加された場合、sample data は削除する。

---

## 7. real data の項目ルール

real data には、以下を可能な限り記録する。

* source
* sourceUrl
* matchId
* matchDate
* season
* gender
* tournament
* team
* opponent
* stage / round
* 数値項目
* dataCoverageLevel

real data では、以下を禁止する。

* source 不明のまま登録すること
* match ID が確認できるのに記録しないこと
* Rugby.com.au と RugbyPass の数値を無区別に混在させること
* sample data 由来の値を混ぜること
* 不明値を推測で補完すること

---

## 8. source / sourceUrl / matchId の優先順位

同一試合を識別する際の優先順位は以下とする。

1. matchId
2. sourceUrl
3. season + gender + tournament + team + opponent + stage / round
4. matchDate
5. source

Rugby.com.au の match ID がある場合は、同一試合判定の最重要情報として扱う。

---

## 9. フィールド追加時のルール

今後 `matches.json` に新しいフィールドを追加する場合は、以下を満たすこと。

* 追加目的が明確である
* StatsAnalysis / StatsTrends / Match Search 等での使用予定がある
* 既存フィールドと意味が重複していない
* フィールド名が分かりやすい
* 値の型が明確である
* sample data / real data の両方で扱いを決めている
* 欠損時の扱いを決めている
* 追加後に `loadMatches.js` 側で問題なく読み込める

フィールドを追加するだけで画面に使わない場合でも、将来の使用目的を `notes` または別ドキュメントに記録する。

---

## 10. フィールド名変更時のルール

既存フィールド名の変更は、原則として避ける。

理由は以下である。

* `loadMatches.js` が参照している可能性がある
* StatsAnalysis が参照している可能性がある
* StatsTrends が参照している可能性がある
* フィルター条件に使われている可能性がある
* 既存データとの互換性が壊れる可能性がある

フィールド名を変更する場合は、以下を同時に行う。

1. `matches.json` の全レコードを更新する。
2. `loadMatches.js` の参照箇所を更新する。
3. StatsAnalysis の参照箇所を更新する。
4. StatsTrends の参照箇所を更新する。
5. その他の参照コンポーネントを更新する。
6. 表示確認を行う。
7. 旧フィールド名が残っていないことを確認する。

---

## 11. 表記揺れ防止ルール

以下の項目は、表記揺れが集計ミスに直結するため、特に注意する。

* season
* gender
* tournament
* team
* opponent
* source
* stage / round

同じ意味の値を複数表記で登録してはいけない。

例：

禁止：

* `Japan`
* `Japan Women`
* `Japan Women 7s`
* `JPN Women`

使用：

* `Japan Women 7s`

禁止：

* `Dubai`
* `Dubai Sevens`
* `SVNS Dubai`
* `Dubai SVNS`

使用：

* `Dubai SVNS`

---

## 12. 現在の基準例

### 12.1 949558 Japan Women 7s vs Fiji Women 7s

この試合を、`matches.json` の real data 登録基準例とする。

基準情報：

* matchId: `949558`
* season: `2025-26`
* gender: `Women`
* tournament: `Dubai SVNS`
* team: `Japan Women 7s`
* opponent: `Fiji Women 7s`
* source: `Rugby.com.au Match Stats`
* dataType: `real`
* dataCoverageLevel: `full` または現行仕様に準じた値

実施済み内容：

* Rugby.com.au Match Stats 由来の real data を追加
* 古い sample Fiji 戦を削除
* `loadMatches.js` 経由で読み込み
* StatsAnalysis / StatsTrends で表示確認
* 2025-26 / Women / Japan / Dubai SVNS 条件で Fiji 戦が表示されることを確認
* Rugby.com.au Match Stats として表示確認

この試合の処理を、今後の real data import の基準とする。

---

## 13. 禁止事項

以下は禁止する。

* 同一意味のフィールドを複数作ること
* フィールド名を変更したのに参照コンポーネントを更新しないこと
* `season` の表記を混在させること
* `gender` の表記を混在させること
* `tournament` の表記を混在させること
* `team` / `opponent` の表記を混在させること
* source 不明データを real data として扱うこと
* match ID が確認できるのに記録しないこと
* sample data を Rugby.com.au Match Stats 由来のように扱うこと
* 不明な数値を `0` として入力すること
* パーセント項目に `%` を含めること
* team 側と opponent 側の数値を取り違えること

---

## 14. 完了条件

この文書が追加された状態で、以下を満たせば v0.6-11 は完了とする。

* `docs/matches-json-field-rules.md` が作成されている
* `matches.json` の必須項目が明文化されている
* season / gender / tournament / team / opponent の表記ルールが明文化されている
* source / sourceUrl / matchId の扱いが明文化されている
* sample data と real data の区別が明文化されている
* 数値項目の扱いが明文化されている
* フィールド追加・変更時のルールが明文化されている
* 949558 Japan Women 7s vs Fiji Women 7s が基準例として記録されている
