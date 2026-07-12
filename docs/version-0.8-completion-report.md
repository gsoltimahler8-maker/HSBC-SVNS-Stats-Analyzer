# SVNS Stats Analyzer

# Version0.8 Completion Report

Version: v0.8  
Status: Completed  
Completed at: 2026-07-12

---

## 1. Version0.8の目的

Version0.8では、既存のスタッツ分析機能に加えて、試合検索と動画ライブラリを実用画面として接続し、同一試合のスタッツと公式動画を相互に参照できる状態を構築した。

速報性ではなく、登録済み試合データを後から検索・比較・検証するための基盤整備を目的とした。

---

## 2. 完了した主要機能

### 2.1 Match Search

- Match Search画面を新設
- `matches.json` の登録試合を一覧表示
- 試合詳細表示
- Seasonによる絞り込み
- Genderによる絞り込み
- Teamによる絞り込み
- Opponentによる絞り込み
- Tournamentによる絞り込み
- Resultによる絞り込み
- Data Typeによる絞り込み
- Match ID検索
- 新しい試合日順で並び替え
- REAL DATAとSAMPLE DATAの区別
- PC表示対応
- スマートフォン表示対応
- 日本語／英語表示対応

---

### 2.2 Video Library

- Video Library画面を新設
- `matches.json` の登録試合を一覧表示
- 動画未登録試合を「未確認」と表示
- 試合ごとの動画情報表示
- 複数動画対応
- Full match、Highlights等の動画種別表示
- 動画提供元表示
- 公開状態表示
- 動画データと試合データの分離管理
- PC表示対応
- スマートフォン表示対応
- 日本語／英語表示対応

---

### 2.3 YouTube埋め込みプレーヤー

- Video Library内に16:9のYouTubeプレーヤーを実装
- アプリ内で動画再生
- 再生、一時停止、音量、全画面表示
- フルマッチを優先表示
- 複数動画の切替
- YouTube外部リンク表示
- `youtube-nocookie.com` を使用
- 埋め込み不可の場合を想定した外部リンク導線
- スマートフォンで横幅100％表示

---

### 2.4 Match SearchとVideo Libraryの連携

- Match Searchから同一試合のVideo Libraryへ移動
- Video Libraryから同一試合のMatch Searchへ移動
- 選択中の試合IDを維持して画面遷移
- ホームからの通常遷移では選択状態を初期化

---

## 3. 新規データファイル

```text
src/data/videos.json
src/data/loadVideos.js
```

### `videos.json`

1動画につき1レコードで管理する。

主なフィールド：

- `id`
- `matchId`
- `externalMatchId`
- `videoProvider`
- `videoType`
- `videoUrl`
- `availability`
- `checkedAt`
- `dataType`
- `title`
- `language`
- `embedAllowed`
- `geoRestriction`
- `notes`
- `sourcePageUrl`
- `publishedAt`

---

## 4. 新規コンポーネント

```text
src/components/MatchSearch.jsx
src/components/VideoLibrary.jsx
```

---

## 5. 更新した主要ファイル

```text
src/App.jsx
src/i18n/ja.js
src/i18n/en.js
src/styles.css
```

---

## 6. 登録済みDubai動画

対象：2025-26 Dubai大会のサクラセブンズ5試合

| Match ID | Opponent | Full match | Highlights |
|---|---|---|---|
| 949542 | Australia | なし | ワールドラグビー 日本チャンネル |
| 949546 | Great Britain | なし | ワールドラグビー 日本チャンネル |
| 949550 | Canada | World Rugby Women | ワールドラグビー 日本チャンネル |
| 949554 | New Zealand | なし | World Rugby Women |
| 949558 | Fiji | ワールドラグビー 日本チャンネル | World Rugby Women |

登録動画数：7件

---

## 7. 動画ソース方針

### 女子SVNS

- World Rugby Women
- ワールドラグビー 日本チャンネル
- その他公式配信

### 男子SVNS

- World Rugby
- HSBC SVNS
- その他公式配信

全試合にフルマッチまたはハイライトが存在するとは限らない。

存在確認できた公式動画のみ登録し、未確認、未公開、削除済み、地域制限等を区別する。

---

## 8. 動作確認

ユーザーによる実機確認済み。

確認済み項目：

- Match Search画面表示
- 試合一覧表示
- 試合詳細表示
- 検索・絞り込み
- 新しい日付順の並び替え
- Video Library画面表示
- 動画状態表示
- YouTube埋め込み再生
- 複数動画切替
- Match SearchとVideo Libraryの相互移動
- 選択試合の維持
- 日本語／英語表示
- PC表示
- スマートフォン表示

---

## 9. Version0.8で採用した設計判断

- 動画情報は `matches.json` に直接追加しない
- 動画は `videos.json` で独立管理
- 1試合に複数動画を登録可能
- Match IDを画面間連携の基準にする
- 埋め込み再生と外部リンクを併用
- 動画がない状態と未確認状態を区別
- 公式動画のみを優先登録
- SAMPLE DATAとREAL DATAを画面上で区別

---

## 10. Version0.8で行わなかったこと

- YouTube APIの導入
- 動画の自動収集
- 動画URLの自動検証
- 動画ファイルの保存
- 自動字幕取得
- 動画タイムコードとスタッツの同期
- Match Search内でのスタッツと動画の同時並列表示
- プレーヤー別クリップ管理
- 動画内イベントの自動タグ付け

---

## 11. Version0.8完了判定

以下をすべて満たしたため、Version0.8を完了とする。

- [x] Match Search実装
- [x] Match Detail実装
- [x] 検索フィルター実装
- [x] 新しい試合順の並び替え
- [x] Video Library実装
- [x] 動画データモデル確定
- [x] YouTube埋め込みプレーヤー実装
- [x] Match SearchとVideo Libraryの相互リンク
- [x] Dubai 5試合の公式動画登録
- [x] 日本語／英語対応
- [x] PC／スマートフォン対応
- [x] 実機動作確認

**Version0.8 Status: Completed**

---

## 12. 次期バージョン候補

Version0.9では、以下を候補とする。

- スタッツ詳細と動画の並列表示
- Match Search内への簡易動画プレーヤー追加
- 動画登録の拡大
- 動画URL検証機能
- Video Libraryの並び替え強化
- 動画種別、言語、提供元による追加フィルター
- 動画が存在する試合のみを表示するフィルター
- データvalidationの強化
- Video Libraryとスタッツ推移画面の連携

Version0.9の正式範囲は、次の計画文書で確定する。
