# SVNS Stats Analyzer

# Version0.9 Completion Report

Version: v0.9  
Status: Completed  
Completed at: 2026-07-13

---

## 1. 概要

Version0.9では、Match SearchとVideo Libraryの役割を整理し、試合スタッツと公式映像を相互に参照できる初期MVP機能を完成させた。

- Match Search：試合・スタッツ起点
- Video Library：動画起点
- 両画面をMatch IDで連携
- YouTube公式埋め込みによるアプリ内再生
- 動画データvalidation
- PC・スマートフォン・日本語・英語の表示確認

---

## 2. 完了した工程

### v0.9-01

Version0.9計画整理。

- Match SearchとVideo Libraryの役割分担
- 動画カタログ化方針
- 実装順序の確定

Status: Completed

### v0.9-02

共通動画ユーティリティ整備。

- YouTube動画ID処理
- 埋め込みURL生成
- 動画優先順位
- 動画レコード共通処理

Status: Completed

### v0.9-03

Match Searchと動画データの接続。

- 選択試合に対応する動画取得
- 動画有無の状態表示
- Video Libraryへの画面遷移

Status: Completed

### v0.9-04

Match Search内YouTube再生。

- YouTube埋め込みプレーヤー
- 外部リンク
- 動画がない場合の案内
- 日本語／英語対応

Status: Completed

### v0.9-05

スタッツと動画の並列表示。

- PCでスタッツ左・動画右
- 動画欄の追従表示
- タブレット・スマートフォンで縦並び
- Match Search表示幅の拡張

Status: Completed

### v0.9-05a

スタッツ項目名の可読性調整。

- PC表示を3列から2列へ変更
- 項目名の文字サイズ調整
- ラベルと数値の間隔調整
- スマートフォンは1列表示を維持

Status: Completed

### v0.9-06

Video Libraryの動画中心化。

- 1試合1カードから1動画1カードへ変更
- Full matchとHighlightsを別カード化
- 登録済み7動画を7カード表示
- 動画種別・言語・提供元・公開状態フィルター
- Team・Opponent・Tournament・Seasonフィルター
- Match ID／Video ID検索
- 並び順
- Match Searchとの相互リンク

Status: Completed

### v0.9-07

動画validation実装。

- 動画ID重複
- 動画URL重複
- 存在しないMatch ID
- YouTube URL形式
- videoProvider
- videoType
- availability
- dataType
- checkedAt
- publishedAt
- URLと公開状態の整合性
- build前validation

Status: Completed

### v0.9-08

表示・動作確認。

- PC表示
- スマートフォン表示
- 日本語／英語
- 動画再生
- 画面遷移
- フィルター
- 横スクロール
- GitHub Actions
- 公開画面

Status: Completed

---

## 3. Version0.9完了時点の機能

### Match Search

- 試合一覧
- 試合詳細
- スタッツ表示
- 試合切替
- YouTube動画再生
- スタッツと動画の並列表示
- 動画がない試合の状態表示
- Video Libraryへの移動
- 日本語／英語
- PC／スマートフォン対応

### Video Library

- 1動画1カード
- 公式動画7件
- Full match 2件
- Highlights 5件
- 日本語動画4件
- 英語動画3件
- フィルター
- 並び順
- YouTube動画再生
- 動画詳細
- Match Searchへの移動
- PC／スマートフォン対応

### データ運用

- matches.json
- videos.json
- Match ID連携
- dataCoverageLevel
- dataType
- 動画validation
- build前validation
- GitHub Actions

---

## 4. 現在の登録動画

```text
Australia戦：1件
Great Britain戦：1件
Canada戦：2件
New Zealand戦：1件
Fiji戦：2件
合計：7件
```

---

## 5. Version0.9完了判定

以下を確認済み。

- Match Searchでスタッツと動画を同時確認できる
- Video Libraryが動画中心の画面になっている
- 1動画1カードになっている
- Full matchとHighlightsを区別できる
- 動画フィルターが動作する
- Match SearchとVideo Libraryが同じ試合を維持して移動する
- 日本語／英語表示が動作する
- PC・スマートフォンで表示崩れがない
- 動画validationが成功する
- GitHub Actionsが成功する
- 公開画面で動作確認済み

Version0.9は完了とする。

---

## 6. 次のバージョン

次はVersion1.0。

Version1.0の目的は、Version0.8〜0.9で構築した試合検索・動画ライブラリを、外部へ説明可能な初期MVPとして仕上げることである。

主な対象：

- アプリ名称の最終整理
- 非公式表示
- Aboutページ
- データソース一覧
- 動画ソース一覧
- 利用規約
- プライバシーポリシー
- 免責事項
- 問い合わせ先
- 公開デモの安定化
- UI最終調整
- パフォーマンス確認
- v1.0完了文書
- v1.0完了後のWorld Rugby／Rugby Australiaへの初回連絡準備

---

## 7. ロードマップ上の現在地

```text
v0.6〜v0.7
実データ投入の型を固める
Status: Completed

v0.8〜v1.0
試合検索・動画ライブラリを最低限使える形にして初期MVP化
Status: v0.9 Completed / v1.0 Next

v1.1〜v1.5
データ拡張・高度指標・管理画面
Status: Planned

v2.0
DB化・認証・半自動運用
Status: Future
```
