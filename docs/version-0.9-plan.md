# SVNS Stats Analyzer

# Version0.9 Implementation Plan

Version: v0.9-01
Revision: 2026-07-12
Status: Updated

---

## 1. Version0.9の主目的

Version0.9では、Match Searchで試合スタッツを確認しながら、同じ試合の公式動画を同一画面内で再生できる構造を実装する。

加えて、Video Libraryを「試合一覧の別表示」ではなく、公式映像を探すための独立した動画カタログへ再設計する。

---

## 2. 画面ごとの役割

### Match Search

試合・スタッツ起点。

- 試合を検索
- 試合詳細を確認
- スタッツを確認
- 同一試合の動画を補助的に再生
- Video Libraryへ移動

### Video Library

動画起点。

- 視聴可能な公式動画を探す
- Full matchを探す
- Highlightsを探す
- チーム別、大会別、言語別、提供元別に検索
- 動画を再生
- 対応するMatch Searchへ移動

---

## 3. Video Libraryの基本単位

Version0.8：

```text
1試合 = 1カード
```

Version0.9：

```text
1動画 = 1カード
```

同一試合にFull matchとHighlightsがある場合は、別々の動画カードとして表示する。

---

## 4. Match Search内動画表示

PC：

```text
┌──────────────────────────┬──────────────────────────┐
│ 試合スタッツ詳細           │ YouTubeプレーヤー           │
│                          │                          │
│ Score                    │ Full match / Highlights │
│ Result                   │                          │
│ Metres                   │ 動画切替                  │
│ Tackles                  │ YouTubeで開く             │
└──────────────────────────┴──────────────────────────┘
```

スマートフォン：

```text
試合情報
↓
主要スタッツ
↓
YouTubeプレーヤー
↓
動画切替
↓
動画詳細
```

---

## 5. Video Libraryの検索項目

- Video Type
- Gender
- Team
- Opponent
- Tournament
- Season
- Language
- Video Provider
- Availability
- Match ID
- 新着順
- 試合日順

初期表示では、動画レコードが存在する試合だけを対象とする。

---

## 6. 共通動画utility

```text
src/utils/videoUtils.js
```

共通処理：

- `VIDEO_TYPE_PRIORITY`
- `getYouTubeVideoId`
- `getYouTubeEmbedUrl`
- `sortVideos`
- `getVideoAvailability`

Match SearchとVideo Libraryの両方から参照する。

---

## 7. 動画validation

新規候補：

```text
src/utils/validateVideos.js
scripts/validateVideos.mjs
```

確認項目：

- `id` の重複
- `matchId` が `matches.json` に存在するか
- `videoProvider` の許容値
- `videoType` の許容値
- `availability` の許容値
- `dataType` の許容値
- `checkedAt` の形式
- `videoUrl` のURL形式
- 同一URLの重複
- `available` なのにURLがないレコード
- `not_available` なのにURLがあるレコード

---

## 8. Version0.9で維持する機能

- Match Search一覧
- Match Detail
- 各種フィルター
- Match ID検索
- 新しい日付順
- YouTube埋め込みプレーヤー
- Match SearchとVideo Libraryの相互リンク
- 日本語／英語
- PC／スマートフォン
- REAL DATA／SAMPLE DATAの区別

---

## 9. Version0.9で行わないこと

- 動画とスタッツの自動時間同期
- 動画タイムコードへのイベント登録
- トライ、タックル等の映像位置自動検出
- YouTube API導入
- 動画自動収集
- 自動字幕取得
- プレーヤー別クリップ管理
- 動画ファイルの保存
- 動画の自動ダウンロード
- 独自動画配信

---

## 10. 実装タスク

### v0.9-01：Version0.9計画策定

Status: Completed

### v0.9-02：動画utility分離

Status: Completed

### v0.9-03：Match Searchへ動画データ接続

Status: Completed

### v0.9-04：Match Search内プレーヤー実装

Status: Completed

### v0.9-05：スタッツ・動画並列レイアウト

対象：

```text
src/components/MatchSearch.jsx
src/styles.css
```

内容：

- PCでスタッツと動画を2カラム表示
- 狭い画面では1カラム
- スマートフォンで縦並び
- プレーヤー16:9維持

完了条件：

- PCで並列表示
- タブレットで崩れない
- スマートフォンで横スクロールが発生しない

### v0.9-06：Video Library動画中心化

対象：

```text
src/components/VideoLibrary.jsx
src/styles.css
src/i18n/ja.js
src/i18n/en.js
```

内容：

- 1動画1カードへ変更
- 動画が存在するレコードだけを一覧表示
- Full match / Highlightsを別カード表示
- Video Typeフィルター
- Languageフィルター
- Providerフィルター
- Availabilityフィルター
- Team / Opponent / Tournament / Seasonフィルター
- 動画カードから再生
- 動画カードからMatch Searchへ移動
- 試合日順または新着順

完了条件：

- Canada戦とFiji戦が2カードずつ表示
- その他Dubai戦が1カードずつ表示
- 登録動画7件が合計7カードとして表示
- 動画種別、言語、提供元で絞り込み可能
- Match Searchへの遷移が正しい試合を保持

### v0.9-07：動画validation実装

対象：

```text
src/utils/validateVideos.js
scripts/validateVideos.mjs
package.json
```

内容：

- 動画データ構造validation
- match ID参照確認
- URL形式確認
- 重複確認
- build前実行

完了条件：

- 正常データでbuild成功
- 不正データでvalidation失敗
- エラー内容が特定可能

### v0.9-08：表示・動作確認

確認対象：

- Match Search
- スタッツ・動画並列表示
- Video Library動画カード
- 動画検索
- 動画再生
- 動画切替
- 外部リンク
- Match Searchへの遷移
- 日本語
- 英語
- PC
- スマートフォン

### v0.9-09：Version0.9完了文書

新規文書：

```text
docs/version-0.9-completion-report.md
```

---

## 11. 実装順序

```text
v0.9-01 計画策定
↓
v0.9-02 動画utility分離
↓
v0.9-03 Match Searchへ動画データ接続
↓
v0.9-04 Match Search内プレーヤー
↓
v0.9-05 スタッツ・動画並列レイアウト
↓
v0.9-06 Video Library動画中心化
↓
v0.9-07 動画validation
↓
v0.9-08 表示・動作確認
↓
v0.9-09 完了文書
```

---

## 12. Version0.9完了条件

- [x] Match Searchで選択試合の動画を取得
- [x] Match Search内でYouTube再生
- [x] Full match優先表示
- [x] 複数動画切替
- [ ] スタッツと動画の並列表示
- [ ] スマートフォン縦並び
- [ ] Video Libraryを1動画1カードへ変更
- [ ] 動画種別フィルター
- [ ] 言語フィルター
- [ ] 提供元フィルター
- [ ] Video Libraryの既存再生機能維持
- [x] 共通動画utility
- [ ] 動画validation
- [ ] build前validation
- [ ] 日本語／英語
- [ ] PC／スマートフォン
- [ ] 実機動作確認
- [ ] 完了文書

---

## 13. Version0.9進捗

**Version0.9進捗：約50％**

v0.9-04まで完了。次は **v0.9-05：スタッツ・動画並列レイアウト**。
