# SVNS Stats Analyzer

# Version0.8 Dubai Video Candidate Check

Version: v0.8-13  
Revision: v0.8-15 correction  
Scope: Dubai SVNS 2025-26 / Japan Women 7s  
Status: Completed

---

## 1. 動画ソース方針

### サクラセブンズ

1. ワールドラグビー 日本チャンネル
2. World Rugby Women
3. HSBC SVNS / RugbyPass TV等の公式配信

### 女子SVNS一般

1. World Rugby Women
2. ワールドラグビー 日本チャンネル（日本戦）
3. HSBC SVNS / RugbyPass TV等の公式配信

### 男子SVNS一般

1. World Rugby
2. HSBC SVNS
3. RugbyPass TV等の公式配信

全試合でフルマッチとハイライトが両方公開されるとは限らない。動画ごとに存在、URL、公開状態を確認して登録する。

---

## 2. ドバイ大会の確認結果

ワールドラグビー 日本チャンネルで公開されたサクラセブンズのドバイ大会フルマッチリプレーは、3位決定戦の日本対フィジーのみだった。

したがって、次の4試合について、日本チャンネル版フルマッチは存在しない。

- Australia戦
- Great Britain戦
- Canada戦
- New Zealand戦

---

## 3. 登録済み動画

| Match ID | Opponent | Full match | Highlights | Status |
|---|---|---|---|---|
| 949542 | Australia | なし | 日本チャンネル版 | Completed |
| 949546 | Great Britain | なし | 日本チャンネル版 | Completed |
| 949550 | Canada | World Rugby Women版 | 日本チャンネル版 | Completed |
| 949554 | New Zealand | なし | World Rugby Women版 | Completed |
| 949558 | Fiji | 日本チャンネル版 | World Rugby Women版 | Completed |

---

## 4. `videos.json` 登録内容

登録件数は7件。

- Australia戦：日本語ハイライト
- Great Britain戦：日本語ハイライト
- Canada戦：日本語ハイライト
- Canada戦：英語フルマッチ
- New Zealand戦：英語ハイライト
- Fiji戦：日本語フルマッチ
- Fiji戦：英語ハイライト

存在しない日本チャンネル版フルマッチを推測で追加しない。

---

## 5. 訂正内容

旧版には、Australia戦、Great Britain戦、Canada戦、New Zealand戦について、日本チャンネル版フルマッチURLの確認が残っていると記載していた。

これは誤りであり、実際には日本チャンネル版フルマッチは3位決定戦のみだった。

`videos.json` の各動画メモも、この事実に合わせて修正した。

---

## 6. 完了判定

Dubai 5試合について、現時点で確認できた公式動画の登録は完了。

**v0.8-13 Status: Completed**
