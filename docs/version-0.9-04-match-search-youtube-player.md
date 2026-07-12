# SVNS Stats Analyzer

# Version0.9 Match Search YouTube Player

Version: v0.9-04  
Status: Implemented / Display check pending

---

## 1. 実装内容

Match Searchの試合詳細内に、選択中の試合に対応するYouTubeプレーヤーを追加した。

---

## 2. 動作

- `videos.json` の動画を `matchId` で取得
- `sortVideos()` によりFull matchを優先
- Full matchがなければHighlightsを表示
- 複数動画がある場合はボタンで切替
- YouTube動画を16:9でアプリ内再生
- 提供元と動画種別を表示
- YouTube外部リンクを表示
- Video Libraryへの既存リンクを維持
- 埋め込み不可の場合は外部リンクのみ表示

---

## 3. i18n

新しい翻訳キーは追加せず、Version0.8で作成した `videoLibrary` の共通表示文言を再利用する。

これにより、Match SearchとVideo Libraryの動画表示文言を統一する。

---

## 4. レイアウト

v0.9-04では、動画プレーヤーを試合スタッツの下に表示する。

スタッツと動画のPC横並び表示は、次工程のv0.9-05で実装する。

---

## 5. 確認項目

- Australia戦：Highlightsを再生
- Great Britain戦：Highlightsを再生
- Canada戦：Full matchを優先表示
- New Zealand戦：Highlightsを再生
- Fiji戦：Full matchを優先表示
- Canada戦とFiji戦で動画切替ボタンが表示される
- 再生、一時停止、音量、全画面表示が動く
- YouTube外部リンクが動く
- Video Libraryへの移動が動く
- 日本語／英語表示
- スマートフォンでプレーヤーがはみ出さない

---

## 6. 変更ファイル

```text
src/components/MatchSearch.jsx
src/styles.css
```

---

## 7. 完了判定

実機でプレーヤー表示、再生、動画切替を確認後、v0.9-04を完了とする。
