# SVNS Stats Analyzer

# Version0.8 Dubai Video Candidate Check

Version: v0.8-13  
Scope: Dubai SVNS 2025-26 / Japan Women 7s  
Status: Partially Completed

---

## 1. 動画ソース方針

Version0.8以降は、以下の優先順位で動画を確認する。

### サクラセブンズ

1. ワールドラグビー 日本チャンネル
2. World Rugby Women
3. HSBC SVNS / RugbyPass TV 等の公式配信

### 女子SVNS一般

1. World Rugby Women
2. ワールドラグビー 日本チャンネル（日本戦）
3. HSBC SVNS / RugbyPass TV 等の公式配信

### 男子SVNS一般

1. World Rugby
2. HSBC SVNS
3. RugbyPass TV 等の公式配信

全試合でフルマッチとハイライトが両方存在するとは限らない。動画ごとに存在・URL・公開状態を確認して登録する。

---

## 2. 今回確認した試合

| Match ID | Opponent | Full match | Highlights | Current status |
|---|---|---|---|---|
| 949542 | Australia | 日本チャンネル版のURL未取得 | 日本チャンネル版を確認 | Partial |
| 949546 | Great Britain | 日本チャンネル版のURL未取得 | 日本チャンネル版を確認 | Partial |
| 949550 | Canada | World Rugby Women版を確認／日本チャンネル版URL未取得 | 日本チャンネル版を確認 | Partial |
| 949554 | New Zealand | 日本チャンネル版のURL未取得 | World Rugby Women版を確認 | Partial |
| 949558 | Fiji | 日本チャンネル版を確認 | World Rugby Women版を確認 | Completed |

---

## 3. `videos.json` 登録内容

今回の `videos.json` には、URLを一意に確認できた7件のみを登録した。

- Australia戦：日本語ハイライト
- Great Britain戦：日本語ハイライト
- Canada戦：日本語ハイライト
- Canada戦：英語フルマッチ
- New Zealand戦：英語ハイライト
- Fiji戦：日本語フルマッチ
- Fiji戦：英語ハイライト

検索結果や関連動画欄に存在が示されていても、直接URLを一意に確認できなかったフルマッチは登録していない。

---

## 4. 未完了項目

以下の日本チャンネル版フルマッチURLを追加確認する。

- Australia戦
- Great Britain戦
- Canada戦
- New Zealand戦

ユーザー確認では、2025-26シーズンのサクラセブンズ全試合フルマッチリプレーがワールドラグビー 日本チャンネルにアップされている。

URL確定後は、同一試合に追加の `full_match` レコードとして登録する。

---

## 5. 完了判定

現時点では、Dubai 5試合すべてに少なくとも1件の公式動画を関連付けられる状態になった。

ただし、日本チャンネル版フルマッチ4件のURL確定が残っているため、v0.8-13は `Partially Completed` とする。
