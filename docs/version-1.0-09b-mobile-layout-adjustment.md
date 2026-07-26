# SVNS Stats Analyzer

# Version1.0-09b スマートフォン表示調整

Version: v1.0-09b  
Status: Implemented / Device check pending  
Updated: 2026-07-26

## 1. Home画面

スマートフォン表示で次を調整する。

- 言語切替部分の上下余白を縮小
- 説明枠を上へ移動
- 説明枠のパディングと文字サイズをわずかに縮小
- Stats Analysis / Stats Trendsを上へ移動
- Match Search / Video Libraryをわずかに上へ移動
- 主要4タブを少し小型化
- Data Managementの位置は概ね維持
- Project Informationを小型化
- Project Informationを画面最下部へ移し、Data Managementとの重なりを軽減

背景画像そのものは変更しない。

## 2. 各ページの共通ナビゲーション

各ページには既存の「ホームへ戻る」ボタンがあるため、
共通ナビゲーションからHomeタブを削除する。

分析機能：

```text
Stats Analysis | Stats Trends
Match Search   | Video Library
```

プロジェクト情報：

```text
About | Sources
Terms and Privacy（全幅）
```

## 3. スマートフォンの列数

- 480px以下でも2列を維持
- 340px以下のみ1列へ切替
- タブの高さは操作性のため44pxを維持
- パディングと文字サイズを縮小して全体をコンパクト化

## 4. 変更ファイル

```text
src/components/AppNavigation.jsx
src/styles.css
public/service-worker.js
```

## 5. 確認項目

- Home説明枠が以前より上にある
- 最初の2タブが以前より上にある
- Project Informationが小さくなっている
- Project InformationとData Managementが重ならない
- 非Home画面にHomeタブがない
- 480px以下でもナビゲーションが2列
- Terms and Privacyはスマホで全幅
- active表示が維持される
- 横スクロールが発生しない
- PWA更新通知から新しいレイアウトへ更新できる
