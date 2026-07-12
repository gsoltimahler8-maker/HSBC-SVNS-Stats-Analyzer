# SVNS Stats Analyzer

# Version0.8 YouTube Embedded Player

Version: v0.8-14  
Scope: Video Library  
Status: Implemented / Display check pending

---

## 1. 実装内容

Video Libraryの試合詳細画面に、YouTube動画をアプリ内で再生する16:9プレーヤーを追加した。

- YouTube通常URL
- youtu.be短縮URL
- YouTube Shorts URL
- YouTube Live URL
- YouTube embed URL

から動画IDを抽出できる。

---

## 2. 動作

1. Video Libraryで試合を選択する
2. その試合に登録された視聴可能なYouTube動画を取得する
3. フルマッチを最優先に自動選択する
4. 画面内のYouTubeプレーヤーで再生する
5. 複数動画がある場合は、動画種別ボタンで切り替える
6. 埋め込み再生できない場合に備え、YouTube外部リンクも常に表示する

---

## 3. 埋め込み判定

次の条件を満たす動画をプレーヤー候補とする。

- `availability` が `available`
- `videoUrl` からYouTube動画IDを抽出できる
- `embedAllowed` が明示的に `false` ではない

`embedAllowed: null` は未確認だが、再生を試行する。

---

## 4. プライバシー対応

埋め込みURLには `youtube-nocookie.com` を使用する。

---

## 5. レスポンシブ表示

- PC：Video Library詳細欄に16:9プレーヤー
- スマートフォン：横幅100％で縦並び
- 複数動画の選択ボタンはスマートフォンで1列表示

---

## 6. 変更ファイル

```text
src/components/VideoLibrary.jsx
src/i18n/ja.js
src/i18n/en.js
src/styles.css
src/data/videos.json
```

`videos.json` はv0.8-13で作成した公式動画7件を含む最新版を同梱した。

---

## 7. 確認項目

- Video LibraryでDubaiの実データ5試合を選ぶ
- 右側または下側にYouTubeプレーヤーが表示される
- Fiji戦とCanada戦でフルマッチが優先表示される
- Fiji戦とCanada戦で動画切替ボタンが表示される
- 再生・一時停止・音量・全画面表示が動く
- 「動画を開く」からYouTubeへ移動できる
- 日本語／英語で表示が切り替わる
- スマートフォン幅でプレーヤーが画面からはみ出さない

---

## 8. 完了判定

コード実装は完了。

実機上の埋め込み再生とレスポンシブ表示を確認後、v0.8-14を完了とする。
