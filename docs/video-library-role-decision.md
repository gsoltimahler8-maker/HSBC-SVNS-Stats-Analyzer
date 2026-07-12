# SVNS Stats Analyzer

# Video Library Role Decision

Decision date: 2026-07-12
Status: Adopted

---

## Decision

Video Libraryは削除せず、試合ベースの画面から動画ベースの公式映像カタログへ変更する。

---

## Reason

Match Search内にYouTubeプレーヤーを実装したことで、従来のVideo LibraryはMatch Searchと機能が重複した。

独立画面として残すには、役割を明確に分ける必要がある。

---

## Role separation

### Match Search

試合・スタッツから動画へ進む。

### Video Library

動画を探し、必要に応じて試合スタッツへ進む。

---

## Data unit

Video Libraryの表示単位：

```text
1動画 = 1カード
```

`videos.json` はすでに1動画1レコードであるため、データ構造の変更は不要。

---

## Expected result

- 視聴可能な動画だけを探しやすい
- Full matchとHighlightsを区別できる
- 同一試合の複数動画を個別に扱える
- 言語、提供元、動画種別で検索できる
- Match Searchとの役割が重複しない
