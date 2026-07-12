# SVNS Stats Analyzer

# Version0.9 Implementation Plan

Version: v0.9-01  
Status: Completed  
Created at: 2026-07-12

---

## 1. Version0.9の主目的

Version0.9では、Match Searchで試合スタッツを確認しながら、同じ試合の公式動画を同一画面内で再生できる構造を実装する。

Version0.8では、Match SearchとVideo Libraryを相互リンクで接続した。Version0.9では、その連携を一段進め、画面を移動せずに「試合スタッツ」と「動画」を並列または縦並びで確認できるようにする。

---

## 2. 中心機能

### Match Search内の動画プレーヤー

Match Searchの試合詳細に、同じ `matchId` を持つ動画を表示する。

PC表示：

```text
┌──────────────────────────┬──────────────────────────┐
│ 試合スタッツ詳細           │ YouTubeプレーヤー           │
│                          │                          │
│ Score                    │ Full match / Highlights │
│ Result                   │                          │
│ Metres                   │ 動画切替                  │
│ Tackles                  │ YouTubeで開く             │
│ Possession               │                          │
│ Territory                │                          │
└──────────────────────────┴──────────────────────────┘
```

スマートフォン表示：

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

## 3. Version0.9の実装範囲

### 3.1 Match Search動画統合

- `videos.json` をMatch Searchから読み込む
- 選択中の `matchId` に対応する動画を取得
- Full matchを優先表示
- Full matchがなければHighlightsを表示
- 複数動画を切り替え可能
- 動画未登録時は「未確認」と表示
- 埋め込み不可の場合は外部リンクのみ表示
- Video Libraryへの遷移リンクは維持

---

### 3.2 スタッツ・動画並列レイアウト

PC：

- 左側：試合スタッツ詳細
- 右側：動画プレーヤー
- 2カラム表示
- 動画プレーヤーは16:9
- 画面幅が狭い場合は1カラムへ切替

スマートフォン：

- 1カラム
- 試合情報の下に動画
- プレーヤーが画面幅からはみ出さない
- 動画切替ボタンは縦並び

---

### 3.3 動画情報表示

Match Search内で最低限、以下を表示する。

- 動画タイトル
- 動画種別
- 提供元
- 公開状態
- 言語
- YouTube外部リンク
- Video Libraryへのリンク

---

### 3.4 共通ロジック整理

Version0.8では、YouTube URL解析、動画優先順位、埋め込みURL生成の処理がVideo Library内にある。

Version0.9では、重複実装を避けるため、共通utilityへ分離する。

新規候補：

```text
src/utils/videoUtils.js
```

移動対象：

- `VIDEO_TYPE_PRIORITY`
- `getYouTubeVideoId`
- `getYouTubeEmbedUrl`
- `sortVideos`
- `getVideoAvailability`

Match SearchとVideo Libraryの両方から参照する。

---

### 3.5 動画データvalidation

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

### 3.6 ビルド時validation

`package.json` のbuild前に動画validationを追加する。

想定：

```json
{
  "scripts": {
    "validate:data": "node scripts/validateSampleMatches.mjs && node scripts/validateVideos.mjs"
  }
}
```

既存のmatch validationを壊さず、videos validationを追加する。

---

## 4. Version0.9で維持する機能

- Match Search一覧
- Match Detail
- 各種フィルター
- Match ID検索
- 新しい日付順
- Video Library
- YouTube埋め込みプレーヤー
- Match SearchとVideo Libraryの相互リンク
- 日本語／英語
- PC／スマートフォン
- REAL DATA／SAMPLE DATAの区別

---

## 5. Version0.9で行わないこと

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

これらはVersion1.0以降の候補とする。

---

## 6. 実装タスク

### v0.9-01：Version0.9計画策定

- Version0.9の目的確定
- 実装範囲確定
- 非対象範囲確定
- タスク分解

Status: Completed

---

### v0.9-02：動画utility分離

対象：

```text
src/utils/videoUtils.js
src/components/VideoLibrary.jsx
```

内容：

- 動画優先順位をutilityへ移動
- YouTube ID抽出をutilityへ移動
- embed URL生成をutilityへ移動
- Video Libraryを共通utility利用へ変更

完了条件：

- Video Libraryの表示・再生動作が変わらない
- 重複ロジックがない

---

### v0.9-03：Match Searchへ動画データ接続

対象：

```text
src/components/MatchSearch.jsx
src/data/loadVideos.js
src/utils/videoUtils.js
```

内容：

- `videos.json` をMatch Searchから参照
- 選択試合の動画を取得
- 優先動画を決定
- 動画未登録状態を判定

完了条件：

- 選択試合ごとに正しい動画件数を取得
- Fiji戦とCanada戦でFull matchを優先
- その他のDubai戦でHighlightsを表示

---

### v0.9-04：Match Search内プレーヤー実装

対象：

```text
src/components/MatchSearch.jsx
src/styles.css
src/i18n/ja.js
src/i18n/en.js
```

内容：

- Match Search詳細内にYouTubeプレーヤー追加
- 動画切替
- 動画タイトル・種別・提供元表示
- 外部リンク表示
- Video Libraryリンク維持

完了条件：

- Match Search内で動画再生
- 複数動画切替
- 埋め込み不可時の外部リンク
- 日英対応

---

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

---

### v0.9-06：動画validation実装

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

---

### v0.9-07：表示・動作確認

確認対象：

- Match Search
- Video Library
- 相互リンク
- 動画再生
- 動画切替
- 外部リンク
- 日本語
- 英語
- PC
- スマートフォン

---

### v0.9-08：Version0.9完了文書

新規文書：

```text
docs/version-0.9-completion-report.md
```

内容：

- 実装内容
- 更新ファイル
- データ構造
- 動作確認
- 未実装項目
- Version1.0候補

---

## 7. 実装順序

```text
v0.9-01 計画策定
↓
v0.9-02 動画utility分離
↓
v0.9-03 Match Searchへ動画データ接続
↓
v0.9-04 Match Search内プレーヤー
↓
v0.9-05 並列レイアウト
↓
v0.9-06 動画validation
↓
v0.9-07 表示・動作確認
↓
v0.9-08 完了文書
```

---

## 8. Version0.9完了条件

以下をすべて満たした時点でVersion0.9完了とする。

- [ ] Match Searchで選択試合の動画を取得
- [ ] Match Search内でYouTube再生
- [ ] Full match優先表示
- [ ] 複数動画切替
- [ ] スタッツと動画の並列表示
- [ ] スマートフォン縦並び
- [ ] Video Libraryの既存動作維持
- [ ] 共通動画utility
- [ ] 動画validation
- [ ] build前validation
- [ ] 日本語／英語
- [ ] PC／スマートフォン
- [ ] 実機動作確認
- [ ] 完了文書

---

## 9. Version0.9開始時点の進捗

**Version0.9進捗：10％**

計画策定完了。次は **v0.9-02：動画utility分離**。
