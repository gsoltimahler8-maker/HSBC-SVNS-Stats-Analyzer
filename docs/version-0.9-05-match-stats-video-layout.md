# SVNS Stats Analyzer

# Version0.9 Match Stats and Video Parallel Layout

Version: v0.9-05  
Status: Implemented / Display check pending

---

## 1. 実装内容

Match Searchの試合詳細を、PCではスタッツと動画の2カラム表示に変更した。

### 左カラム

- Attack
- Defence
- Breakdown
- Set Piece
- Discipline
- データ追跡情報
- 公式スタッツソースリンク

### 右カラム

- 動画登録状態
- Video Libraryへのリンク
- YouTubeプレーヤー
- Full match / Highlights切替
- YouTube外部リンク

---

## 2. 画面幅

Match Search画面だけ最大幅を1600pxへ拡張した。

他の画面の最大幅には影響しない。

---

## 3. レスポンシブ動作

### 広いPC画面

- 試合一覧と試合詳細を左右表示
- 試合詳細内でも、スタッツと動画を左右表示
- 動画欄をスクロール追従表示

### 1180px以下

- 試合詳細内のスタッツと動画を縦並び
- 動画欄のスクロール追従を解除

### 980px以下

- 試合一覧と試合詳細も縦並び

### 800px以下

- 各カラム間隔を縮小
- 既存のスマートフォン用動画表示を維持

---

## 4. 変更ファイル

```text
src/components/MatchSearch.jsx
src/styles.css
```

---

## 5. 確認項目

- 広いPC画面でスタッツが左、動画が右に表示される
- 動画を再生しながらスタッツを確認できる
- ページを下へ動かした際、動画欄が追従する
- Canada戦とFiji戦で動画切替が動く
- 1180px前後で縦並びへ切り替わる
- スマートフォンで横スクロールが発生しない
- SAMPLE DATAでは動画欄に未確認状態が表示される
- Video Libraryへのリンクが動く
- 日本語／英語表示が崩れない

---

## 6. 完了判定

PC、狭い画面、スマートフォンで表示と動画再生を確認後、v0.9-05を完了とする。
