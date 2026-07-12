# SVNS Stats Analyzer

# Version0.8 Match Search Requirements

Version: v0.8-03  
Scope: Match Search Requirements  
Status: Completed

---

## 1. この文書の目的

この文書は、Version0.8で実装する Match Search の初期仕様を確定するためのものである。

Version0.8前半では、現在 `ComingSoon` となっている Match Search 画面を、`matches.json` を検索・閲覧できる独立機能へ置き換える。

---

## 2. 基本方針

- `src/data/loadMatches.js` を通じて `matches.json` を使用する
- React Routerは導入しない
- 現在の `screen` state による画面切替を維持する
- `src/components/MatchSearch.jsx` を新規作成する
- HomeMenuの基本構造は変更しない
- Match Search専用CSSクラスを追加し、既存画面への影響を避ける
- 日本語・英語の両方に対応する
- real data と sample data を明確に区別する
- 試合単位で source と data coverage を確認できるようにする

---

## 3. 初期表示

Match Searchを開いた時点では、登録されている全試合を表示する。

Version0.8開始時点の対象件数：

- 全9試合
- real data：5試合
- sample data：4試合

初期表示時に自動で特定のseason、gender、teamへ絞り込まない。

---

## 4. 標準並び順

Match Searchの標準並び順は、以下とする。

1. date descending
2. 同日は Rugby.com.au Match ID descending
3. 最後に internal match ID

つまり、最新試合を上に表示する。

StatsAnalysis / StatsTrends の時系列分析では date ascending を維持し、Match Searchだけを date descending とする。

---

## 5. 検索条件

初期実装では、以下の検索条件を用意する。

- Season
- Gender
- Team
- Opponent
- Tournament
- Stage
- Result
- Data Type
- Match ID

---

## 6. 各検索条件の仕様

### 6.1 Season

`matches.json` に存在するseasonを自動抽出する。

例：

- 2025-26
- 2024-25

初期値：

```text
All
```

### 6.2 Gender

候補：

- All
- Women
- Men

### 6.3 Team

`matches.json` に存在するteamを自動抽出する。

Version0.8開始時点では Japan のみ。

### 6.4 Opponent

`matches.json` に存在するopponentを自動抽出する。

候補例：

- Australia
- Great Britain
- Canada
- New Zealand
- Fiji
- France
- South Africa

初期値：

```text
All
```

### 6.5 Tournament

`matches.json` に存在するtournamentを自動抽出する。

例：

- Dubai SVNS
- Cape Town SVNS
- Hong Kong SVNS

### 6.6 Stage

`matches.json` に存在するstageを自動抽出する。

例：

- Pool
- Semi Final
- Bronze Final

### 6.7 Result

team側から見た結果を使用する。

候補：

- All
- Win
- Loss
- Draw
- No Contest

判定優先順位：

```js
match.teamResult || match.result
```

### 6.8 Data Type

候補：

- All
- Real Data
- Sample Data

判定：

```js
match.dataType === 'real' ? 'real' : 'sample'
```

sample dataに `dataType` が存在しない現状をfallbackで吸収する。

### 6.9 Match ID

文字入力欄とする。

以下を部分一致で検索できるようにする。

- internal match ID
- Rugby.com.au match ID
- SVNS ID
- RugbyPass ID

対象候補：

```js
match.id
match.external?.rugbyComAu
match.external?.svns
match.external?.rugbyPass
```

---

## 7. 検索結果件数

検索条件の上部または結果一覧上部に、以下を表示する。

```text
Results: 5 matches
```

日本語例：

```text
検索結果：5試合
```

全登録件数と絞り込み後件数を区別できる形が望ましい。

例：

```text
5 / 9 matches
```

---

## 8. 検索条件のリセット

全検索条件を初期状態へ戻すリセットボタンを設置する。

初期状態：

- 全select：All
- Match ID：空欄
- 並び順：Date newest first
- 選択中の試合詳細：先頭試合または未選択

---

## 9. 一覧表示項目

各試合カードには、最低限以下を表示する。

- date
- tournament
- stage
- team
- opponent
- score
- winner
- match result
- data type
- data coverage level

表示例：

```text
2025-11-30
Dubai SVNS / Bronze Final

Japan 22-12 Fiji
Japan Win

REAL DATA
Full match stats
```

---

## 10. 勝敗表示

一覧では `W` / `L` だけを表示しない。

優先表示：

- `matchResult`
- `winner`

例：

```text
Japan Win
```

日本語表示：

```text
日本勝利
```

データに `matchResult` がない場合は、以下からfallback生成する。

```js
match.winner
match.loser
match.teamResult || match.result
```

---

## 11. Data Type表示

real data と sample data は、異なるバッジで表示する。

### real data

```text
REAL DATA
```

### sample data

```text
SAMPLE DATA
```

色・背景・枠線で視覚的に区別する。

sample dataには、画面確認用の仮データであることを示す。

---

## 12. Data Coverage表示

以下を表示する。

- full_match_stats
- limited_data
- results_only
- unknown

表示文言は `ja.js` / `en.js` の翻訳辞書を使用する。

---

## 13. 試合詳細の表示方法

一覧から試合を選択すると、同じ画面内に詳細を表示する。

Version0.8初期では、別画面遷移やURLルーティングは行わない。

デスクトップ：

- 左または上：検索結果一覧
- 右または下：試合詳細

モバイル：

- 一覧の下に詳細
- 1カラム表示

---

## 14. 試合詳細の基本情報

最低限、以下を表示する。

- date
- season
- tournament
- stage
- gender
- team
- opponent
- score
- winner
- loser
- match result
- team result

---

## 15. 試合詳細の主要スタッツ

最低限、以下を表示する。

### Attack

- pointsFor
- tries
- metres
- carries
- passes
- offloads
- cleanBreaks
- defendersBeaten
- turnoversConceded

### Defence

- pointsAgainst
- tackles
- missedTackles
- turnoversWon

### Possession / Breakdown

- possession
- territory
- rucksWon
- rucksLost

### Discipline

- penaltiesConceded
- yellowCards
- redCards

欠損値は `0` とせず、`—` と表示する。

---

## 16. Source / Traceability表示

最低限、以下を表示する。

- internal match ID
- Rugby.com.au match ID
- SVNS ID
- RugbyPass ID
- source provider
- source URL
- fetchedAt
- data coverage level
- data coverage source
- stat definition version
- data type

source URLが有効な場合は、外部リンクとして開けるようにする。

---

## 17. Video Library状態欄

Version0.8前半では、動画実リンクはまだ接続しない。

詳細画面に以下の状態欄のみ用意する。

候補表示：

```text
Video: Not checked
```

日本語：

```text
動画：未確認
```

将来の候補状態：

- Available
- Not available
- Not checked
- Geo restricted
- Login required
- Removed

Version0.8前半では、固定で `Not checked` としてもよい。

---

## 18. ページ分割

Version0.8初期ではページネーションを導入しない。

理由：

- 現在の登録件数が9試合
- フィルターで十分に絞り込める
- 実装複雑性を抑える
- Match Searchの基本動作確認を優先する

将来的に件数が増えた場合は、以下を再検討する。

- 20件単位のページ分割
- Load More
- 仮想スクロール

---

## 19. 空状態

検索結果が0件の場合は、専用のempty stateを表示する。

日本語例：

```text
この条件に一致する試合はありません。
検索条件を変更してください。
```

英語例：

```text
No matches were found for these filters.
Try changing the search conditions.
```

---

## 20. エラー耐性

以下の欠損に耐えられるようにする。

- `dataType` がない
- `teamResult` がない
- `matchResult` がない
- `winner` / `loser` がない
- external ID がない
- source URL がない
- individual stats が `null`
- video fields がない

画面をクラッシュさせず、fallbackまたは `—` を表示する。

---

## 21. i18n追加方針

`ja.js` / `en.js` に以下の領域を追加する。

```js
matchSearch: {
  title: '',
  subtitle: '',
  filters: {},
  sort: {},
  results: {},
  detail: {},
  dataType: {},
  video: {},
  emptyState: {},
}
```

既存の `comingSoon.search...` はMatch Search実装後、画面本体では使用しない。

---

## 22. CSS追加方針

Match Search専用クラスを追加する。

候補：

```text
.matchSearchScreen
.matchSearchHero
.matchSearchFilters
.matchSearchToolbar
.matchSearchResults
.matchSearchResultCard
.matchSearchResultCardActive
.matchSearchBadge
.matchSearchDetail
.matchSearchMeta
.matchSearchVideoStatus
```

既存のHomeMenu CSSには触れない。

既存の以下は必要に応じて再利用する。

- `.app`
- `.screenBackground`
- `.panel`
- `.filters`
- `.detail`
- `.scoreLine`
- `.metricGrid`
- `.sourceBox`
- `.emptyState`

---

## 23. App.jsx変更方針

以下を追加する。

```jsx
import MatchSearch from './components/MatchSearch.jsx';
```

`screen === 'search'` の分岐を、`ComingSoon` から `MatchSearch` へ置き換える。

```jsx
} else if (screen === 'search') {
  content = (
    <MatchSearch
      onBackHome={backHome}
      t={t}
      backgroundImage={matchSearchBgImage}
      mobileBackgroundImage={matchSearchMobileBgImage}
    />
  );
}
```

`ComingSoon` はVideo Libraryとadmin用として残す。

---

## 24. Version0.8前半で行わないこと

- React Router導入
- URLによる試合直接指定
- ブラウザバック対応
- ページネーション
- 動画URL実接続
- `videos.json` 作成
- Match Detail共通コンポーネント抽出
- sample data削除
- validator更新
- Cape Town real data追加

これらはMatch Search基本機能完成後に扱う。

---

## 25. v0.8-03 完了条件

以下を確定したため、v0.8-03は完了とする。

- [x] 初期表示
- [x] 検索条件
- [x] Match ID検索範囲
- [x] 標準並び順
- [x] 一覧表示項目
- [x] 詳細表示項目
- [x] real / sample data表示方法
- [x] data coverage表示
- [x] 欠損値表示
- [x] source追跡表示
- [x] Video Library状態欄
- [x] ページネーションを導入しない方針
- [x] i18n追加方針
- [x] CSS追加方針
- [x] App.jsx変更方針

**v0.8-03 Status: Completed**

---

## 26. 次の作業

次は **v0.8-04：Match Search データ抽出ロジック作成**。

最初に新規作成する候補：

```text
src/components/MatchSearch.jsx
```

初回実装範囲：

- `loadMatches.js` から読込
- option自動生成
- filter state
- Match ID部分一致検索
- data type fallback
- result fallback
- date descending sort
- 検索結果件数
- リセット処理
- 一覧と詳細の基本表示
