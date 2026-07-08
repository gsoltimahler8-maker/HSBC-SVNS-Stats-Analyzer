# SVNS Stats Analyzer

# Version0.7 Plan

Version: v0.7-01
Scope: Real Data Expansion Phase 1
Status: Planned

---

## 1. この文書の目的

この文書は、Version0.7: Real Data Expansion Phase 1 の作業範囲・目的・完了条件を定義する。

Version0.6 では、SVNS Stats Analyzer のデータ構造を real data import に対応できる形へ移行した。

Version0.7 では、その構造を使って実際に real data を複数試合分追加し、分析画面・推移画面・試合検索・将来の動画ライブラリ連携に耐えられるかを確認する。

---

## 2. Version0.7 の位置づけ

Version0.7 は、real data import の本格運用に入る前の第一段階である。

Version0.6 までに、以下は完了済みである。

* `matches.json` への移行
* `loadMatches.js` 経由のデータ読み込み
* StatsAnalysis の `loadMatches.js` 参照
* StatsTrends の `loadMatches.js` 参照
* Rugby.com.au Match Stats 由来の real data 1試合追加
* 古い sample Fiji 戦の削除
* 重複データ運用ルールの文書化
* real data import checklist の作成
* `matches.json` field rules の作成

Version0.7 では、これらを前提として、real data の追加対象を広げる。

---

## 3. Version0.7 の名称

Version0.7 の名称は以下とする。

**Version0.7: Real Data Expansion Phase 1**

---

## 4. Version0.7 の主目的

Version0.7 の主目的は、以下である。

1. Japan Women 7s / 2025-26 / Dubai SVNS の real data を拡充する。
2. Rugby.com.au Match Stats 由来データを複数試合登録する。
3. `matches.json` の運用ルールが実作業に耐えるか確認する。
4. StatsAnalysis で real data が正常に分析できるか確認する。
5. StatsTrends で real data が正常に推移表示できるか確認する。
6. Match Search で real data を検索・確認できる状態を整える。
7. 将来の Video Library 連携に必要な試合識別情報を意識して整理する。
8. sample data と real data の混在をさらに減らす。
9. v0.8 以降の CSV import / 検索強化 / 動画連携に向けた課題を整理する。

---

## 5. Version0.7 の基本方針

Version0.7 では、いきなり大量の試合データを投入しない。

理由は以下である。

* real data の登録実績は、現時点では 949558 Japan Women 7s vs Fiji Women 7s の1試合である。
* 複数試合を追加した際の Match Count、source 表示、Data Availability 表示、StatsTrends の挙動はまだ十分に検証されていない。
* sample data と real data が混在した場合、分析結果が歪む可能性がある。
* 試合検索ページとの接続確認が必要である。
* 将来の動画ライブラリ連携を考えると、matchId / sourceUrl / videoUrl 候補を雑に扱うべきではない。

したがって、Version0.7 では、1試合ずつ real data を追加し、その都度確認する。

---

## 6. Version0.7 の第一対象

Version0.7 の第一対象は以下とする。

* season: `2025-26`
* gender: `Women`
* team: `Japan Women 7s`
* tournament: `Dubai SVNS`
* source: `Rugby.com.au Match Stats`

対象を Dubai SVNS に限定する理由は以下である。

* すでに Fiji Women 7s 戦の real data 登録実績がある。
* season / gender / team / tournament を固定できる。
* 同一大会内で比較しやすい。
* StatsAnalysis / StatsTrends の確認条件を固定できる。
* Match Search への反映確認がしやすい。
* sample data との重複確認がしやすい。
* 将来的に Video Library と試合データを紐づける基準を作りやすい。

---

## 7. Version0.7 の対象外

Version0.7 では、以下は本格実装しない。

* Supabase 移行
* 外部DB化
* CSV import 本実装
* 管理者用データ管理画面の本実装
* 全大会・全チームの大量 real data 投入
* RugbyPass データとの本格統合
* 選手別データ管理
* 自動スクレイピング
* 動画解析
* 映像タグ付け
* 全試合動画の手入力整理
* 高度な自動分析指標の追加

これらは、Version0.8 以降で検討する。

---

## 8. Version0.7 の作業単位

Version0.7 は、以下の作業単位で進める。

---

### v0.7-01: Version0.7 scope document 作成

ファイル：

* `docs/version-0.7-plan.md`

内容：

* Version0.7 の目的
* 対象範囲
* 対象外範囲
* Dubai SVNS から始める理由
* Match Search との関係
* Video Library との将来連携
* 完了条件
* Version0.8 へ送る課題

---

### v0.7-02: real data import log 作成

ファイル：

* `docs/real-data-import-log.md`

目的：

real data の追加履歴を記録する。

記録項目：

* import ID
* match ID
* source URL
* season
* gender
* tournament
* team
* opponent
* stage / round
* match date
* source
* dataType
* dataCoverageLevel
* sample data 削除有無
* StatsAnalysis 確認結果
* StatsTrends 確認結果
* Match Search 確認結果
* Video Library 連携候補
* 備考

---

### v0.7-03: Dubai SVNS 対象試合一覧整理

目的：

Japan Women 7s / 2025-26 / Dubai SVNS の追加対象試合を一覧化する。

確認項目：

* 対戦相手
* stage / round
* match ID
* source URL
* 追加済みか
* sample data が存在するか
* Match Search に表示されるか
* Video Library 連携候補があるか
* 優先順位

この段階では、まだ `matches.json` は変更しない。

---

### v0.7-04: matches.json へ real data を1試合追加

目的：

Fiji 戦に続く2試合目の real data を追加する。

作業方式：

1. 対象試合を決める。
2. Rugby.com.au Match Stats の source URL / match ID を確認する。
3. 既存 `matches.json` 全文を確認する。
4. 同一試合の sample data があれば削除する。
5. real data を1件だけ追加する。
6. `matches.json` 全文置き換え版を作成する。
7. アプリ上で表示確認する。

注意：

同一試合の sample data と real data を併存させない。

---

### v0.7-05: 追加後の表示確認

確認対象画面：

* StatsAnalysis
* StatsTrends
* Match Search
* source 表示
* Data Availability 表示

確認条件：

* season: `2025-26`
* gender: `Women`
* team: `Japan Women 7s`
* tournament: `Dubai SVNS`

確認項目：

* 追加した試合が表示されるか
* 同一試合が二重表示されていないか
* Match Count が想定どおりか
* source が `Rugby.com.au Match Stats` として表示されるか
* dataCoverageLevel が想定どおりか
* sample data と誤認されていないか
* StatsTrends のグラフが崩れていないか
* Match Search に反映されているか

---

### v0.7-06: Dubai SVNS 残り試合の real data 追加

目的：

Japan Women 7s / 2025-26 / Dubai SVNS の real data をさらに追加する。

原則：

* 1試合ずつ追加する。
* 追加ごとに表示確認する。
* 作業ログを更新する。
* sample data があれば削除する。
* source / match ID / source URL を記録する。

---

### v0.7-07: sample data cleanup

目的：

real data と重複する sample data を整理する。

確認項目：

* Japan Women 7s / 2025-26 / Dubai SVNS の sample data が残っていないか
* 同一試合の sample data と real data が併存していないか
* source が `Sample Data` のまま残っていないか
* Match Count が不自然に増えていないか
* StatsAnalysis / StatsTrends に古い sample data が混入していないか

---

### v0.7-08: Match Search 反映確認

目的：

追加した real data が Match Search で確認できるか検証する。

確認項目：

* season で検索できるか
* gender で検索できるか
* tournament で検索できるか
* team で検索できるか
* opponent で検索できるか
* source が確認できるか
* real data / sample data の区別が可能か
* matchId または sourceUrl を確認できる設計になっているか
* StatsAnalysis / StatsTrends への導線を将来追加できそうか

Version0.7 では、Match Search の大規模改修までは行わない。

ただし、real data が追加されたときに検索対象として機能するかは確認する。

---

### v0.7-09: Video Library 連携候補整理

目的：

将来的に Video Library と match data を接続するための情報を整理する。

Version0.7 では、動画ライブラリの本格改修は行わない。

ただし、以下を検討対象として記録する。

* matchId と videoUrl を将来紐づけられるか
* sourceUrl と videoUrl を分けて管理すべきか
* YouTube 埋め込み可否をどう扱うか
* 外部リンクのみの場合の表示方法
* Match Search から Video Library へ遷移できる設計が必要か
* Video Library から StatsAnalysis / StatsTrends へ遷移できる設計が必要か
* 試合単位で動画とスタッツを並べる画面が必要か

---

### v0.7-10: source / dataCoverageLevel 表示確認

目的：

real data が複数試合になった場合でも、出典とデータ網羅度が正しく表示されるか確認する。

確認項目：

* `Rugby.com.au Match Stats` が正しく表示されるか
* `Sample Data` と区別できるか
* `dataCoverageLevel` が表示崩れを起こしていないか
* real data を sample data と誤表示していないか
* source が空欄になっていないか
* sourceUrl / matchId を将来表示できる構造になっているか

---

### v0.7-11: import workflow 見直し

目的：

v0.7 の実作業を踏まえて、v0.6 で作成した運用文書に不足がないか確認する。

確認対象：

* `docs/data-operation-rules.md`
* `docs/real-data-import-checklist.md`
* `docs/matches-json-field-rules.md`
* `docs/real-data-import-log.md`
* `docs/version-0.7-plan.md`

確認項目：

* 実作業に合わないルールがなかったか
* 追加すべきチェック項目がなかったか
* field rules に不足がなかったか
* source / match ID / source URL の扱いに問題がなかったか
* Match Search 用に追加すべき項目がないか
* Video Library 連携用に追加すべき項目がないか

---

### v0.7-12: Version0.7 completion check 作成

ファイル：

* `docs/version-0.7-completion-check.md`

目的：

Version0.7 の完了条件を確認する。

記録項目：

* 追加済み real data 一覧
* 削除済み sample data 一覧
* StatsAnalysis 確認結果
* StatsTrends 確認結果
* Match Search 確認結果
* source 表示確認
* dataCoverageLevel 表示確認
* Match Count 確認
* Video Library 連携候補
* 残課題
* Version0.8 へ送る事項

---

## 9. Match Search との関係

Version0.7 では、Match Search を無視しない。

real data が増えると、ユーザーが試合を探す入口として Match Search の重要性が高まる。

Version0.7 では、少なくとも以下を確認する。

* `matches.json` に追加した real data が Match Search の検索対象になるか
* season / gender / tournament / team / opponent で絞り込めるか
* source 表示が確認できるか
* sample data と real data の違いを把握できるか
* matchId / sourceUrl を将来的に表示できるか

Match Search の本格強化は Version0.8 以降に送る。

---

## 10. Video Library との関係

Version0.7 では、Video Library の本格改修は行わない。

ただし、将来的に Video Library と match data を接続する前提で、以下を意識する。

* 各試合に matchId を持たせる
* 各試合に sourceUrl を持たせる
* 将来的に videoUrl を追加できる余地を残す
* 試合検索から動画へ移動できる設計を検討する
* 動画ライブラリから試合スタッツへ移動できる設計を検討する
* 動画とスタッツを紐づける単位は、原則として1試合単位とする

動画ライブラリは、単なる動画リンク集ではなく、将来的には試合分析と連携する機能として扱う。

---

## 11. データ追加時の作業ルール

Version0.7 で `matches.json` を変更する場合は、必ず以下の方式で進める。

1. 既存ファイル全文を確認する。
2. 変更対象を1作業に絞る。
3. 全文置き換え版を作成する。
4. 「探して」「近くに追加」のような曖昧な指示は使わない。
5. 1試合追加ごとに表示確認する。
6. 表示確認後に作業ログを更新する。

---

## 12. Version0.7 の完了条件

Version0.7 は、以下を満たした場合に完了とする。

* [ ] `docs/version-0.7-plan.md` が作成されている
* [ ] `docs/real-data-import-log.md` が作成されている
* [ ] Japan Women 7s / 2025-26 / Dubai SVNS の対象試合一覧が整理されている
* [ ] Fiji 戦以外の Rugby.com.au Match Stats 由来 real data が追加されている
* [ ] 可能であれば Dubai SVNS の Japan Women 7s 全試合が real data 化されている
* [ ] 同一試合の sample data が削除されている
* [ ] StatsAnalysis で追加試合が表示確認されている
* [ ] StatsTrends で追加試合が表示確認されている
* [ ] Match Search で追加試合が確認されている
* [ ] Match Count に異常がない
* [ ] source 表示が正しい
* [ ] dataCoverageLevel 表示が破綻していない
* [ ] real data import log に追加履歴が残っている
* [ ] Video Library 連携候補が整理されている
* [ ] Version0.8 へ送る課題が整理されている
* [ ] `docs/version-0.7-completion-check.md` が作成されている

---

## 13. Version0.8 へ送る予定の課題

Version0.7 で見えた課題は、Version0.8 以降へ送る。

現時点の候補は以下である。

---

### 13.1 Match Search 強化

候補：

* real data / sample data フィルター
* source フィルター
* matchId 検索
* sourceUrl 表示
* 試合詳細表示
* StatsAnalysis への導線
* StatsTrends への導線
* Video Library への導線

---

### 13.2 Video Library 基礎整備

候補：

* videoUrl フィールド追加
* videoSource フィールド追加
* embedded / external link の区別
* 試合データとの紐づけ
* Match Search からの導線
* StatsAnalysis / StatsTrends からの導線
* 動画ライブラリから試合スタッツへの導線

---

### 13.3 CSV import 検討

候補：

* CSVテンプレート
* CSV → JSON 変換
* matchId 重複チェック
* sourceUrl 必須チェック
* season / gender / tournament / team / opponent の表記揺れチェック
* sample data との重複警告
* import log 自動生成

---

### 13.4 Data Coverage Dashboard

候補：

* season別登録試合数
* tournament別登録試合数
* team別登録試合数
* real data / sample data 件数
* source別件数
* Rugby.com.au Match Stats 由来件数
* sample data 残存チェック

---

## 14. Version0.7 完了後の理想状態

Version0.7 完了時点で、SVNS Stats Analyzer は以下の状態になることを目指す。

* Japan Women 7s / 2025-26 / Dubai SVNS の real data が複数試合登録されている。
* StatsAnalysis で real data を条件別に確認できる。
* StatsTrends で real data の推移を確認できる。
* Match Search で追加済み real data を探せる。
* Rugby.com.au Match Stats 由来であることを確認できる。
* sample data と real data が混在していない。
* 将来の Video Library 連携に必要な試合識別情報が整理され始めている。
* Version0.8 で検索強化・動画連携・CSV import を検討できる状態になっている。

---

## 15. 備考

Version0.7 は、SVNS Stats Analyzer が「見た目のある分析アプリ」から「実データを扱う分析アプリ」へ進むための最初の実運用フェーズである。

この段階で重要なのは、機能を一気に増やすことではない。

重要なのは、以下である。

* 1試合ずつ正確に real data を追加すること
* 同一試合の重複を防ぐこと
* source を明確にすること
* sample data を整理すること
* StatsAnalysis / StatsTrends / Match Search の挙動を確認すること
* 将来の Video Library 連携を見据えて、試合識別情報を雑に扱わないこと

Version0.7 では、拡張よりも正確な運用を優先する。
