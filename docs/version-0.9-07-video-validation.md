# SVNS Stats Analyzer

# Version0.9 Video Validation

Version: v0.9-07  
Status: Implemented / Repository build check pending

---

## 1. 目的

`videos.json` の構造、参照関係、URL、重複をbuild前に検証し、不正な動画データが公開環境へ入ることを防ぐ。

---

## 2. 追加ファイル

```text
src/utils/validateVideos.js
scripts/validateVideos.mjs
```

## 3. 置き換えファイル

```text
package.json
```

---

## 4. 検証項目

### レコード構造

- 動画レコードがobjectであること
- 必須項目の存在
- `videoProvider` の許容値
- `videoType` の許容値
- `availability` の許容値
- `dataType` の許容値
- `checkedAt` のISO日時形式
- `publishedAt` のISO日時形式
- `durationSeconds` の型と範囲
- `embedAllowed` の型
- `geoRestriction` の型
- `language` のコード形式

### URL

- `videoUrl` のhttp / https形式
- `sourcePageUrl` のhttp / https形式
- YouTubeレコードのYouTube URL形式
- 同一動画URLの重複
- YouTube URL表現が異なる場合もvideo IDで重複判定

### 公開状態

- `available` なのに `videoUrl` がないレコード
- `not_available` なのに `videoUrl` があるレコード
- 非公開状態なのに `embedAllowed: true` の場合はwarning

### 参照関係

- `id` の重複
- `matchId` が `matches.json` に存在すること
- `externalMatchId` と参照先試合の外部IDが一致しない場合はwarning

---

## 5. npm scripts

```text
npm run validate:matches
npm run validate:videos
npm run validate:data
npm run build
```

`npm run build` は次の順序で実行する。

```text
Match validation
↓
Video validation
↓
Vite build
```

動画validationでerrorが1件以上ある場合、Vite buildは開始されない。

---

## 6. 通常確認

```bash
npm run validate:videos
```

正常時の表示例：

```text
Video validation passed: 7 video record(s), 9 match record(s), no errors or warnings.
```

次に実行：

```bash
npm run build
```

---

## 7. エラー表示

エラーは次の形式で表示する。

```text
[ERROR] 動画ID / 項目名: エラー内容
```

例：

```text
[ERROR] V-949550-002 / matchId: matchId "..." does not exist in matches.json.
```

---

## 8. 任意ファイルを使った検証

通常は実データファイルを自動的に読む。検証対象を一時的に差し替える場合は次を使用できる。

```bash
node scripts/validateVideos.mjs --videos path/to/videos.json --matches path/to/matches.json
```

---

## 9. 完了条件

- 現在の `videos.json` で `npm run validate:videos` が成功
- 不正データで終了コード1になる
- エラー対象の動画ID、項目名、原因を確認できる
- `npm run build` の前に動画validationが実行される
