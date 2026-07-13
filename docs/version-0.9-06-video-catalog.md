# SVNS Stats Analyzer

# Version0.9 Video Library Catalog Redesign

Version: v0.9-06  
Status: Implemented / Display check pending

---

## 1. 目的

Video Libraryを「試合一覧の別表示」から、公式動画を探すための独立した映像カタログへ変更した。

---

## 2. 表示単位

旧仕様：

```text
1試合 = 1カード
```

新仕様：

```text
1動画 = 1カード
```

同一試合にFull matchとHighlightsがある場合は、別々の動画カードとして表示する。

---

## 3. 登録済み動画の表示

Dubaiの登録済み7動画を、7枚の動画カードとして表示する。

- Australia戦：1カード
- Great Britain戦：1カード
- Canada戦：2カード
- New Zealand戦：1カード
- Fiji戦：2カード

---

## 4. 検索・絞り込み

- Season
- Gender
- Team
- Opponent
- Tournament
- Video Type
- Language
- Provider
- Availability
- Match ID / Video ID
- 並び順

---

## 5. 並び順

- 試合日の新しい順
- 動画公開日または確認日の新しい順
- 動画タイトル順

---

## 6. 動画カード

各カードに以下を表示する。

- 動画タイトル
- 対戦カードと得点
- 試合日
- 大会
- ステージ
- 動画種別
- 言語
- 提供元
- 公開状態
- REAL / SAMPLE

---

## 7. 動画詳細

- YouTube埋め込みプレーヤー
- YouTube外部リンク
- 対応するMatch Searchへのリンク
- 動画種別
- 提供元
- 言語
- 公開状態
- 最終確認日時
- 公開日時
- 再生時間
- 埋め込み状態
- 地域制限
- 備考
- 掲載元ページ

---

## 8. 画面間連携

Match SearchからVideo Libraryへ移動した場合、同じ試合の優先動画を選択する。

Video LibraryからMatch Searchへ移動した場合、対応する試合IDを維持する。

---

## 9. 変更ファイル

```text
src/components/VideoLibrary.jsx
src/i18n/ja.js
src/i18n/en.js
src/styles.css
```

---

## 10. 確認項目

- 初期表示が7 / 7 videos
- Canada戦とFiji戦が2カードずつ表示
- その他3試合が1カードずつ表示
- Full matchフィルターで2件
- Highlightsフィルターで5件
- 日本語フィルターで4件
- 英語フィルターで3件
- Providerフィルターが動く
- カードを選択すると対応動画が再生される
- Match Searchへのリンクが正しい試合を開く
- Match Searchから戻ると同じ試合の優先動画が選択される
- 日本語／英語表示
- PC／スマートフォン表示

---

## 11. 完了判定

上記の表示、フィルター、動画再生、画面遷移を実機確認後、v0.9-06を完了とする。
