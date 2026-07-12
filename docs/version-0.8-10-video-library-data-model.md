# SVNS Stats Analyzer

# Version0.8 Video Library Data Model

Version: v0.8-10  
Scope: Video Library Data Model  
Status: Completed

---

## 1. この文書の目的

この文書は、Version0.8で実装する Video Library の動画データ管理方式を確定するためのものである。

Match Search、Match Detail、Video Libraryの各画面から同じ動画情報を参照できるようにし、試合データと動画情報を無理なく分離して管理する。

---

## 2. 採用方式

Version0.8では、動画情報を `matches.json` に直接追加せず、独立した `videos.json` で管理する。

採用ファイル：

```text
src/data/videos.json
```

採用理由：

- 1試合に複数動画を登録できる
- full match、highlights、short clipを分けて管理できる
- 動画URLの変更・削除・地域制限に対応しやすい
- 試合スタッツと動画メタデータを分離できる
- `matches.json` を動画事情によって頻繁に更新せずに済む
- 将来的な動画追加に対して拡張しやすい

---

## 3. 基本単位

`videos.json` は、**1動画につき1レコード**とする。

同じ試合に複数動画がある場合は、同じ `matchId` を持つ複数レコードを登録する。

例：

```json
[
  {
    "id": "V-949550-001",
    "matchId": "R-202526-W-DUB-949550-JPN-CAN",
    "externalMatchId": "949550",
    "videoProvider": "YouTube",
    "videoType": "highlights",
    "videoUrl": "https://example.com/video-1",
    "availability": "available"
  },
  {
    "id": "V-949550-002",
    "matchId": "R-202526-W-DUB-949550-JPN-CAN",
    "externalMatchId": "949550",
    "videoProvider": "RugbyPass TV",
    "videoType": "full_match",
    "videoUrl": "https://example.com/video-2",
    "availability": "login_required"
  }
]
```

---

## 4. 必須フィールド

各動画レコードは、以下を必須とする。

```json
{
  "id": "V-949550-001",
  "matchId": "R-202526-W-DUB-949550-JPN-CAN",
  "externalMatchId": "949550",
  "videoProvider": "YouTube",
  "videoType": "highlights",
  "videoUrl": "https://example.com/video",
  "availability": "available",
  "checkedAt": "2026-07-12T00:00:00Z",
  "dataType": "real"
}
```

---

## 5. フィールド定義

| Field | Type | Required | Meaning |
|---|---|---:|---|
| `id` | string | Yes | 動画レコードの内部ID |
| `matchId` | string | Yes | `matches.json` の内部match ID |
| `externalMatchId` | string / null | Yes | Rugby.com.au等の外部match ID |
| `videoProvider` | string | Yes | 動画提供元 |
| `videoType` | string | Yes | full match / highlights等 |
| `videoUrl` | string / null | Yes | 動画または外部ページURL |
| `availability` | string | Yes | 公開状態 |
| `checkedAt` | ISO datetime | Yes | 最終確認日時 |
| `dataType` | string | Yes | real / sample |
| `title` | string / null | No | 動画タイトル |
| `language` | string / null | No | 音声・表示言語 |
| `durationSeconds` | number / null | No | 動画時間 |
| `embedAllowed` | boolean / null | No | 埋め込み可否 |
| `geoRestriction` | string[] / null | No | 地域制限情報 |
| `notes` | string / null | No | 補足 |
| `sourcePageUrl` | string / null | No | 動画掲載元ページ |
| `publishedAt` | ISO datetime / null | No | 公開日時 |

---

## 6. `videoProvider` の許容値

Version0.8では以下を標準値とする。

```text
YouTube
RugbyPass TV
SVNS
World Rugby
Rugby.com.au
Other
Unknown
```

表記ゆれを避けるため、自由入力ではなく固定値として扱う。

---

## 7. `videoType` の許容値

```text
full_match
extended_highlights
highlights
short_clip
analysis
external_page
unknown
```

### 優先順位

Video Libraryでは、同一試合に複数動画がある場合、以下の順で表示する。

1. `full_match`
2. `extended_highlights`
3. `highlights`
4. `analysis`
5. `short_clip`
6. `external_page`
7. `unknown`

---

## 8. `availability` の許容値

```text
available
not_available
not_checked
geo_restricted
login_required
removed
broken_link
unknown
```

### 各値の意味

| Value | Meaning |
|---|---|
| `available` | 現在視聴可能 |
| `not_available` | 動画が存在しないことを確認 |
| `not_checked` | 未確認 |
| `geo_restricted` | 地域制限あり |
| `login_required` | ログインまたは登録が必要 |
| `removed` | 以前存在したが削除済み |
| `broken_link` | URLはあるがリンク切れ |
| `unknown` | 状態不明 |

---

## 9. `dataType` の扱い

動画レコードにも `dataType` を持たせる。

```text
real
sample
```

### real

実在する動画URLまたは実在する外部動画ページ。

### sample

画面確認用の仮URLまたはデモデータ。

Video Library画面では、match dataと同様にreal/sampleを明確に区別する。

---

## 10. IDルール

動画内部IDは以下を基本とする。

```text
V-{externalMatchId}-{sequence}
```

例：

```text
V-949550-001
V-949550-002
```

外部match IDがない場合：

```text
V-{internalMatchId}-{sequence}
```

---

## 11. 試合データとの関連付け

主キーは `matchId` とする。

```json
{
  "matchId": "R-202526-W-DUB-949550-JPN-CAN"
}
```

`externalMatchId` は補助確認用として保持する。

関連付け優先順位：

1. `matchId`
2. `externalMatchId`
3. date / team / opponent による補助確認

date / team / opponentだけで自動結合しない。

---

## 12. 動画が未確認の場合

動画がまだ確認されていない試合については、動画レコードを無理に作らない。

Video Library側で、動画レコードが存在しない場合は以下を表示する。

```text
Video: Not checked
```

日本語：

```text
動画：未確認
```

したがって、全試合分の `not_checked` レコードを先に作る必要はない。

---

## 13. 動画が存在しない場合

動画が存在しないことを確認できた場合のみ、以下を登録する。

```json
{
  "id": "V-949550-001",
  "matchId": "R-202526-W-DUB-949550-JPN-CAN",
  "externalMatchId": "949550",
  "videoProvider": "Unknown",
  "videoType": "unknown",
  "videoUrl": null,
  "availability": "not_available",
  "checkedAt": "2026-07-12T00:00:00Z",
  "dataType": "real"
}
```

未確認と不存在を混同しない。

---

## 14. URLルール

`videoUrl` は以下を満たす。

- `https://` を基本とする
- 動画の直接URLまたは公式外部ページURL
- 短縮URLは原則使わない
- tracking parameterは可能な限り除去する
- 同一URLの重複登録を避ける
- 埋め込みURLではなく通常の閲覧URLを保存する

---

## 15. 埋め込み方針

Version0.8では、動画の埋め込みを必須としない。

初期実装：

- 外部リンクとして開く
- `embedAllowed` は将来用
- providerごとの埋め込み差異はVersion0.9以降で検討

理由：

- CSPや埋め込み制限への対応を避ける
- 地域制限・ログイン制限に対応しやすい
- GitHub Pages上での実装を単純に保つ
- provider別の例外処理を後回しにできる

---

## 16. 表示ルール

Video Library一覧では、最低限以下を表示する。

- match date
- tournament
- stage
- team
- opponent
- score
- match result
- video provider
- video type
- availability
- data type

詳細表示：

- video title
- provider
- type
- URL
- checkedAt
- publishedAt
- duration
- language
- embedAllowed
- geo restriction
- notes

---

## 17. Match Searchとの連携

Match Searchの試合詳細では、`matchId` を使って動画レコードを検索する。

### 0件

```text
Video: Not checked
```

### 1件

最優先の動画を表示する。

### 複数件

以下を表示する。

```text
Videos: 3
```

Video Libraryへの遷移リンクを表示する。

---

## 18. 読込ファイル

新規作成候補：

```text
src/data/loadVideos.js
```

基本形：

```js
import videos from './videos.json';

export function loadVideos() {
  return videos;
}

export const videoData = loadVideos();
```

Match SearchとVideo Libraryは、このloaderを通じて参照する。

---

## 19. `videos.json` 初期状態

初期ファイルは空配列で開始する。

```json
[]
```

Dubai 5試合の動画候補確認後に、確認できた動画だけを追加する。

---

## 20. Validation方針

将来のvalidatorで以下を確認する。

- `id` の重複
- `matchId` の存在
- `videoProvider` の許容値
- `videoType` の許容値
- `availability` の許容値
- URL形式
- `checkedAt` のISO datetime
- `dataType` の許容値
- `durationSeconds` が0以上
- 同一URLの重複
- `available` なのに `videoUrl` がnullでないか
- `not_available` なのにURLが入っていないか

---

## 21. Version0.8での実装範囲

Version0.8で行う。

- [x] `videos.json` 分離方式の採用
- [x] 1動画1レコード方式
- [x] 複数動画対応のデータ構造
- [x] provider / type / availabilityの固定値
- [x] Match Searchとの関連付け方式
- [ ] `videos.json` 作成
- [ ] `loadVideos.js` 作成
- [ ] Video Library画面作成
- [ ] Dubai 5試合の動画確認
- [ ] Match Searchとの相互リンク

---

## 22. Version0.8で行わないこと

- 動画ファイルの保存
- 自動ダウンロード
- 動画自動収集
- YouTube API導入
- RugbyPass API導入
- 自動字幕取得
- 動画内スタッツ同期
- タイムコード管理
- プレーヤー別クリップ管理
- 埋め込み再生の必須化

---

## 23. v0.8-10 完了判定

以下を確定したため、v0.8-10は完了とする。

- [x] `videos.json` 分離方式
- [x] 1動画1レコード
- [x] 複数動画対応
- [x] 必須フィールド
- [x] optionalフィールド
- [x] provider許容値
- [x] type許容値
- [x] availability許容値
- [x] IDルール
- [x] Match Searchとの関連付け
- [x] 未確認と不存在の区別
- [x] 外部リンク優先
- [x] Version0.8では埋め込みを必須としない

**v0.8-10 Status: Completed**

---

## 24. 次の作業

次は **v0.8-11：Video Library一覧画面作成**。

最初に作成するファイル：

```text
src/data/videos.json
src/data/loadVideos.js
src/components/VideoLibrary.jsx
```

初期実装では、`videos.json` が空でも試合一覧を表示し、各試合の動画状態を `Not checked` と表示できる構造とする。
