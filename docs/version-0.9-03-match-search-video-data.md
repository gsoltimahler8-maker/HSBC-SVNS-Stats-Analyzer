# SVNS Stats Analyzer

# Version0.9 Match Search Video Data Connection

Version: v0.9-03  
Status: Implemented / Display check pending

---

## 1. 実装内容

Match Searchから `videos.json` を参照し、選択中の試合に対応する動画情報を取得できるようにした。

使用ファイル：

```text
src/data/loadVideos.js
src/utils/videoUtils.js
src/components/MatchSearch.jsx
```

---

## 2. 動画の関連付け

動画は `matchId` を使って試合と関連付ける。

Match Search起動時に、動画データを以下の形式で整理する。

```text
matchId
└─ sortVideos() で優先順位順に並べた動画配列
```

優先順位は共通utilityに従う。

1. full_match
2. extended_highlights
3. highlights
4. analysis
5. short_clip
6. external_page
7. unknown

---

## 3. Match Searchでの表示

試合詳細の動画欄に、次の情報を表示する。

```text
公開状態 / 動画件数 / 優先動画種別 / 提供元
```

例：

```text
視聴可能 / 2件 / フルマッチ / YouTube
```

動画未登録の場合：

```text
未確認
```

---

## 4. 確認項目

Dubaiの実データ5試合で確認する。

- Australia戦：1件／ハイライト
- Great Britain戦：1件／ハイライト
- Canada戦：2件／フルマッチ優先
- New Zealand戦：1件／ハイライト
- Fiji戦：2件／フルマッチ優先

確認対象：

- 試合を切り替えると動画件数が変わる
- Canada戦とFiji戦ではフルマッチが優先表示される
- その他のDubai戦ではハイライトが優先表示される
- SAMPLE DATAの試合では「未確認」と表示される
- Video Libraryへの遷移ボタンが従来どおり動く
- 日本語／英語の双方で表示できる

---

## 5. 今回行わないこと

v0.9-03では、Match Search内に動画プレーヤーをまだ表示しない。

プレーヤー実装は次の工程：

```text
v0.9-04 Match Search内プレーヤー実装
```

---

## 6. 完了判定

上記の動画件数、優先動画種別、画面遷移が実機で確認できた時点で、v0.9-03を完了とする。
