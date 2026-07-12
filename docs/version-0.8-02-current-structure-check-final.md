# SVNS Stats Analyzer

# Version0.8 Current Structure Check

Version: v0.8-02  
Scope: Screen Navigation, Data, i18n, Utilities, Entry Point, Dependencies, and CSS Review  
Status: Completed

---

## 1. 確認対象

Version0.8 開始時点の構造確認として、以下を確認した。

- `src/App.jsx`
- `src/components/HomeMenu.jsx`
- `src/components/StatsAnalysis.jsx`
- `src/components/StatsTrends.jsx`
- `src/data/loadMatches.js`
- `src/data/matches.json`
- `src/data/sampleMatches.js`
- `src/i18n/ja.js`
- `src/i18n/en.js`
- `src/utils/statistics.js`
- `src/utils/validateMatches.js`
- `src/main.jsx`
- `src/styles.css`
- `package.json`

---

## 2. 現在の `src` 構成

確認できた構成：

```text
src/
├─ components/
│  ├─ HomeMenu.jsx
│  ├─ StatsAnalysis.jsx
│  └─ StatsTrends.jsx
├─ data/
│  ├─ loadMatches.js
│  ├─ matches.json
│  └─ sampleMatches.js
├─ i18n/
│  ├─ ja.js
│  └─ en.js
├─ utils/
│  ├─ statistics.js
│  └─ validateMatches.js
├─ App.jsx
├─ main.jsx
├─ registerSW.js
└─ styles.css
```

Version0.8 開始時点では、Match Search、Video Library、共通 Match Detail の独立コンポーネントは存在しない。

---

## 3. 現在の画面切替方式

React Router は使用していない。

`App.jsx` 内の state で画面を切り替えている。

```jsx
const [screen, setScreen] = useState('home');
```

現在の画面対応：

| screen | 表示 |
|---|---|
| `home` | `HomeMenu` |
| `analysis` | `StatsAnalysis` |
| `trends` | `StatsTrends` |
| `search` | `ComingSoon` |
| `videos` | `ComingSoon` |
| `admin` | `ComingSoon` |

Version0.8 では、React Router を新規導入せず、この state ベースの画面切替を維持する。

---

## 4. HomeMenu の状態

`HomeMenu.jsx` は各ボタンの `id` を `onNavigate` に渡している。

```jsx
onClick={() => onNavigate(item.id)}
```

Match Search：

```js
id: 'search'
```

Video Library：

```js
id: 'videos'
```

HomeMenu からの導線はすでに成立しているため、Version0.8 前半では HomeMenu の基本構造を変更しない。

---

## 5. Match Search の現在の状態

現在は `screen === 'search'` で `ComingSoon` を表示している。

未実装項目：

- Match Search 独立コンポーネント
- 検索条件
- 検索結果一覧
- 並び替え
- 試合詳細
- Video Library への導線

実装時は以下を新規追加する。

```text
src/components/MatchSearch.jsx
```

---

## 6. Video Library の現在の状態

現在は `screen === 'videos'` で `ComingSoon` を表示している。

未実装項目：

- Video Library 独立コンポーネント
- 動画データモデル
- 動画URL状態表示
- Match Detail との接続
- Match Search との相互リンク

実装時は以下を新規追加する。

```text
src/components/VideoLibrary.jsx
```

---

## 7. データ読込構造

アプリが現在使用しているデータは `matches.json` である。

```js
import matches from './matches.json';

export function loadMatches() {
  return matches;
}

export const matchData = loadMatches();
```

したがって、Match Search も `loadMatches.js` を通じて `matches.json` を使用する。

---

## 8. `matches.json` の現在の内容

現在の登録件数は9試合。

内訳：

| Data type | 件数 |
|---|---:|
| real data | 5 |
| sample data | 4 |

real data：

- Dubai SVNS / Women / Japan：5試合

sample data：

- Cape Town SVNS / Women / Japan：2試合
- Dubai SVNS / Men / Japan：1試合
- Hong Kong SVNS / Women / Japan：1試合

real data には以下が存在する。

```json
{
  "dataType": "real"
}
```

sample data には `dataType` がない。

Match Search では以下の fallback が必要である。

```js
const dataType =
  match.dataType === 'real' ? 'real' : 'sample';
```

Version0.8 後半で sample data に明示的な `dataType: "sample"` を追加する候補とする。

---

## 9. `sampleMatches.js` の位置づけ

`sampleMatches.js` は、現在の `loadMatches.js` から参照されていない。

さらに、すでに real data に置換した Dubai の New Zealand 戦と Fiji 戦が古い sample data として残っている。

したがって、`sampleMatches.js` はレガシーファイルであり、Version0.8 での削除候補とする。

ただし、削除前に以下を確認する。

- 他ファイルから import されていないか
- validation script が参照していないか
- build process で必要とされていないか

---

## 10. i18n 構造

翻訳ファイルは以下の2つ。

```text
src/i18n/ja.js
src/i18n/en.js
```

`App.jsx` から `t` を各コンポーネントへ渡す方式である。

Version0.8 では、既存方式を維持し、両ファイルに以下を追加する。

```js
matchSearch: {
  title: '',
  subtitle: '',
  filters: {},
  results: {},
  detail: {},
  dataType: {},
  sort: {},
  emptyState: '',
}
```

Video Library 実装時は、別途以下を追加する。

```js
videoLibrary: {
  title: '',
  subtitle: '',
  filters: {},
  results: {},
  availability: {},
  emptyState: '',
}
```

既存の `comingSoon.search...` と `comingSoon.videos...` は、実装後は画面本体には使用しない。

---

## 11. `statistics.js` の評価

現在の関数：

- `pct`
- `avg`
- `corr`

Match Search の検索・並び替えには直接使用しない。

注意点：

```js
(m[key] || 0)
```

を使用する `avg()` は、欠損値を0として扱い、全件を分母に含める。

これはVersion0.7で確定した欠損値ルールと一致しない。

`corr()` も `null` を事前除外しないため、欠損値を含むデータへそのまま使用しない。

Version0.8 では Match Search 実装と切り離し、後段で utility の整理候補とする。

---

## 12. `validateMatches.js` の評価

現在の validator は以下を確認する。

- 必須フィールド
- external ID
- gender / result / dataCoverageLevel
- date / fetchedAt
- 数値項目
- percentage
- team と opponent の一致
- source URL
- duplicate ID

Version0.7 追加後に不足している検証：

- `metres`
- `teamResult`
- `matchResult`
- `winner`
- `loser`
- `dataType`
- winner / loser と score の整合性
- `result` と `teamResult` の整合性
- real data の Rugby.com.au 直接URL
- sample data の data type
- internal ID と Rugby.com.au ID の整合性

Version0.8 では、Match Search 基本実装後に validator を更新する。

---

## 13. `main.jsx` の状態

`main.jsx` は以下を行うだけの単純な構造である。

- Service Worker 登録
- React root 作成
- `App` 読込
- `styles.css` 読込

React Router、Context Provider、外部状態管理は使用していない。

Version0.8 前半では変更不要。

---

## 14. `package.json` の状態

主要依存関係：

- React
- React DOM
- Vite
- lucide-react
- recharts

React Router は依存関係にない。

build：

```json
"build": "npm run validate:data && vite build --base=/HSBC-SVNS-Stats-Analyzer/"
```

data validation：

```json
"validate:data": "node scripts/validateSampleMatches.mjs"
```

注意点：

アプリ本体は `matches.json` を使用している一方、validation script 名は `validateSampleMatches.mjs` のままである。

現時点では script 本文を未確認のため、実際に `matches.json` を検証しているかは断定しない。

Version0.8 の validator 更新前に、以下を確認する。

```text
scripts/validateSampleMatches.mjs
```

これは v0.8-02 の完了を妨げないが、データ構造更新前の確認事項とする。

---

## 15. `styles.css` の評価

既存の再利用可能クラス：

- `.app`
- `.hero`
- `.panel`
- `.filters`
- `.grid`
- `.wide`
- `.matches`
- `.match`
- `.detail`
- `.scoreLine`
- `.metricGrid`
- `.sourceBox`
- `.emptyState`
- `.screenBackground`

Match Search はこれらを一部再利用できる。

特に以下はそのまま活用可能。

- 画面全体：`.app.screenBackground`
- 検索条件：`.filters`
- 結果一覧：`.matches` / `.match`
- 詳細：`.detail` / `.scoreLine` / `.metricGrid`
- source：`.sourceBox`
- 0件時：`.emptyState`

---

## 16. CSS上の注意点

`styles.css` はVersionごとの追記が積み重なっており、HomeMenu周辺には同一セレクタの再定義と多数の `!important` が存在する。

Version0.8 では、既存のHomeMenu CSSを整理しながら変更しない。

Match Search 用には、以下のような専用クラスを追加する。

```text
.matchSearchScreen
.matchSearchHeader
.matchSearchFilters
.matchSearchResults
.matchSearchResultCard
.matchSearchDetail
.matchSearchBadge
```

これにより、既存画面への副作用を避ける。

レスポンシブの基準は、既存に合わせて `800px` とする。

---

## 17. 背景画像の継続利用

Match Search 用背景：

```text
assets/bg-match-search.png
assets/bg-match-search-mobile.png
```

Video Library 用背景：

```text
assets/bg-video-library.png
assets/bg-video-library-mobile.png
```

新規コンポーネントへ props として渡し、既存のCSS変数を使用する。

```jsx
style={{
  '--screen-bg-image': `url(${backgroundImage})`,
  '--screen-bg-mobile-image': `url(${mobileBackgroundImage})`,
}}
```

---

## 18. Version0.8 の構造判断

### 確定

- React Router は導入しない
- state ベースの画面切替を維持
- `loadMatches.js` を Match Search でも使用
- `MatchSearch.jsx` を `src/components/` に追加
- `VideoLibrary.jsx` を `src/components/` に追加
- HomeMenu の基本構造は変更しない
- `main.jsx` は変更しない
- Match Search 用翻訳領域を `ja.js` / `en.js` に追加
- Match Search 用CSSは専用クラスで追加
- sample data の `dataType` は初期実装では fallback 判定
- `sampleMatches.js` は削除候補
- validation script は後段で確認

### 保留

- `MatchDetail.jsx` の共通化
- `videos.json` の採用
- 動画情報を `matches.json` に持たせるか
- URL共有・ブラウザバック対応
- React Router の将来導入
- `sampleMatches.js` の削除時期
- validator の更新範囲

---

## 19. 推奨する初期ファイル構成

```text
src/
├─ components/
│  ├─ HomeMenu.jsx
│  ├─ StatsAnalysis.jsx
│  ├─ StatsTrends.jsx
│  ├─ MatchSearch.jsx
│  └─ VideoLibrary.jsx
├─ data/
│  ├─ loadMatches.js
│  ├─ matches.json
│  └─ sampleMatches.js
├─ i18n/
│  ├─ ja.js
│  └─ en.js
├─ utils/
│  ├─ statistics.js
│  └─ validateMatches.js
├─ App.jsx
├─ main.jsx
└─ styles.css
```

`MatchDetail.jsx` は Match Search の詳細表示が安定した後に判断する。

---

## 20. v0.8-02 完了判定

以下を確認できたため、v0.8-02 は完了とする。

- [x] `src` 構成を確認
- [x] components を確認
- [x] data を確認
- [x] i18n を確認
- [x] utils を確認
- [x] `App.jsx` を確認
- [x] `main.jsx` を確認
- [x] `styles.css` を確認
- [x] `package.json` を確認
- [x] React Router 未使用を確認
- [x] Match Search / Video Library が ComingSoon であることを確認
- [x] `matches.json` が実データ読込元であることを確認
- [x] sample data の fallback 必要性を確認
- [x] CSS再利用範囲を確認
- [x] 新規コンポーネントの配置方針を確定

**v0.8-02 Status: Completed**

---

## 21. 次の作業

次は **v0.8-03：Match Search requirements 確定**。

決定対象：

- 初期表示
- 検索条件
- 一覧表示項目
- 詳細表示項目
- 標準並び順
- real / sample data の表示方法
- source / coverage 表示
- 1画面の表示件数
- Match ID 検索
- Video Library への導線
