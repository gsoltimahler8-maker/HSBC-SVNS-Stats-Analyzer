# SVNS Stats Analyzer

# v1.1-02 World Rugby問い合わせ資料

Version: v1.1  
Step: v1.1-02  
Status: Draft ready for owner details and final review  
Created: 2026-07-27

---

## 1. 問い合わせの目的

完成済みの非公式・非商用prototypeを提示し、HSBC SVNSに関する公式データ経路と利用条件を確認する。

初回問い合わせの目的は次の確認である。

1. 一般公開ページより詳細なHSBC SVNS match statisticsをWorld Rugbyが保持しているか
2. API、data feed、downloadable datasetその他の公式な提供手段があるか
3. data dictionaryまたはmetric definitionがあるか
4. 限定的・非商用の公開分析に適用される条件
5. World Rugby公式YouTube動画のlink／embedに推奨条件があるか
6. 適切なGame Analysis、Game Systems、Information Management、Digital、SVNS operations担当への取り次ぎ
7. World Rugbyが適切な窓口でない場合、RugbyPass、data providerその他の担当先を案内できるか

初回問い合わせでは、次を主要求にしない。

- 公式公認
- partnership
- paid pilot
- purchase
- source-code transfer
- hosting
- commercial negotiation

相手が具体的な関心を示した後に限り、技術協議と商業協議を分けて進める。

---

## 2. 自己紹介の推奨表現

### 推奨

> I am an independent rugby fan based in Japan and the creator of SVNS Stats Analyzer, an unofficial, non-commercial rugby sevens analytics prototype.

日本語：

> 私は日本在住の一ラグビーファンであり、非公式・非商用のラグビーセブンズ分析prototype「SVNS Stats Analyzer」の制作者です。

### 補足文

> I am contacting you in an individual capacity and do not represent a rugby union, broadcaster, data company, or commercial organisation.

日本語：

> 今回は個人として問い合わせており、ラグビー協会、放送事業者、データ会社その他の商業組織を代表するものではありません。

### この表現を使う理由

- 「fan」で個人の立場を正直に示す
- 「creator」でprofessional developerを過度に名乗らない
- 実際に動作するprototypeを制作した事実を示す
- 「viewer」だけより、問い合わせの技術的背景を説明しやすい
- unionや企業を代表しているとの誤解を避ける

---

## 3. 推奨subject

```text
Inquiry about HSBC SVNS match statistics and an independent analytics prototype
```

代替案：

```text
Request for guidance on official HSBC SVNS data access and usage
```

初回は一つ目を推奨する。データ照会であることと、実働prototypeがあることを同時に伝えられる。

---

## 4. 英文問い合わせ本文

```text
Dear World Rugby team,

My name is [FULL NAME]. I am an independent rugby fan based in Japan and the creator of SVNS Stats Analyzer, an unofficial, non-commercial rugby sevens analytics prototype.

I am contacting you in an individual capacity and do not represent a rugby union, broadcaster, data company, or commercial organisation.

The prototype is designed to help users explore rugby sevens match statistics through season and tournament analysis, longer-term trends, match search, and links between match data and publicly available match videos. It is currently available in Japanese and English as a progressive web application.

The public-facing statistics I have been able to access through World Rugby, RugbyPass and HSBC SVNS pages are useful for scores and basic match information, but I may have overlooked an official source that provides the additional detail and consistency required for this type of analysis.

As a temporary and limited proof of concept, the prototype currently contains a small manually entered sample of publicly displayed team match statistics from Rugby Australia's Match Centre, with source attribution. It does not use automated scraping. I have used this sample only to validate the product concept, data model and user interface while seeking guidance on an appropriate official data route. I have not assumed that public display alone grants permission for broader reuse or expansion.

The prototype also links to and embeds publicly available match videos using the standard YouTube embedded player. It does not download, host, copy or redistribute any video files. Video availability and playback remain controlled by YouTube and the relevant channel or rights holder.

I would be grateful for guidance on the following questions:

1. Does World Rugby hold more detailed HSBC SVNS match statistics than those currently available on public-facing pages?
2. Is there an official API, data feed, downloadable dataset or other access route for those statistics?
3. Is an official data dictionary or set of metric definitions available?
4. What conditions would apply to the limited, non-commercial public display and analysis of official HSBC SVNS match statistics in an independent prototype?
5. Does World Rugby have any preferred conditions or technical requirements for linking to or embedding videos published on its official YouTube channels?
6. Could this enquiry be directed to the appropriate Game Analysis, Game Systems, Information Management, Digital or HSBC SVNS operations contact?
7. If another organisation, such as RugbyPass or a designated data provider, is the appropriate contact, could you please direct me to them?

Project links:

Public prototype:
[PUBLIC DEMO URL]

About:
[ABOUT PAGE URL]

Data and video sources:
[DATA AND VIDEO SOURCES PAGE URL]

GitHub repository:
[GITHUB REPOSITORY URL]

The current prototype is intentionally small. Its present data sample is for technical validation rather than a claim of comprehensive coverage. My preference is to use an appropriate official World Rugby data source, subject to the relevant terms, before expanding it.

Thank you for your time and guidance.

Kind regards,

[FULL NAME]
Creator, SVNS Stats Analyzer
Japan
svnsstatsanalyzer@gmail.com
```

---

## 5. World Rugby contact form向け短縮版

問い合わせフォームの入力欄が短い場合に使用する。

```text
Dear World Rugby team,

My name is [FULL NAME]. I am an independent rugby fan based in Japan and the creator of SVNS Stats Analyzer, an unofficial, non-commercial rugby sevens analytics prototype.

The prototype provides season and tournament analysis, longer-term trends, match search, and links between statistics and publicly available match videos.

The public-facing World Rugby, RugbyPass and HSBC SVNS pages I have found do not appear to provide all of the detailed, consistently defined statistics needed for the planned analysis. As a small proof of concept, I have manually entered a limited sample of publicly displayed Rugby Australia Match Centre statistics with source attribution. No automated scraping is used, and I have not assumed that public display alone permits broader reuse.

The prototype links to and embeds publicly available videos through the standard YouTube player. It does not download, host, copy or redistribute video files.

Could you please advise:

- whether more detailed official HSBC SVNS statistics are available;
- whether there is an API, data feed, dataset or data dictionary;
- what conditions apply to limited non-commercial public analysis;
- whether World Rugby has preferred conditions for linking to or embedding videos from its official YouTube channels; and
- which Game Analysis, Game Systems, Information Management, Digital, SVNS, RugbyPass or data-provider contact should handle this enquiry?

Public prototype:
[PUBLIC DEMO URL]

Repository:
[GITHUB REPOSITORY URL]

Thank you,

[FULL NAME]
svnsstatsanalyzer@gmail.com
```

---

## 6. Project summary

### Product

```text
Name:
SVNS Stats Analyzer

Status:
Working unofficial non-commercial prototype

Format:
React / Vite progressive web application

Current languages:
Japanese
English
```

### Current functions

- Stats Analysis
- Stats Trends
- Match Search
- Video Library
- match details
- source attribution
- YouTube link／embed
- mobile and desktop layouts
- PWA installation
- data validation
- operational and legal documentation

### Planned v1.1 structure

```text
Stats Analysis
├─ Overview
├─ Comparison
│  ├─ Tournament
│  ├─ Result
│  └─ Opponent
└─ Relationships

Stats Trends
├─ Match
├─ Tournament
└─ Season
```

### Planned technical preparation

- Architecture and Handover documentation
- secure development controls
- provider／adapter separation
- canonical match model
- schema and data dictionary
- derived metrics engine
- reproducible build and testing
- French and Spanish localisation
- source, coverage and provenance tracking

### Current data limitation

The current sample is deliberately limited and manually entered. Its purpose is to validate:

- user experience
- canonical data model
- analysis structure
- source tracking
- video integration
- future provider replacement

It is not presented as a complete official HSBC SVNS database.

---

## 7. YouTube利用説明

### 外部向け説明

```text
The prototype links to and embeds publicly available match videos using the standard YouTube embedded player. It does not download, host, copy or redistribute any video files. Video availability and playback remain controlled by YouTube and the relevant channel or rights holder.
```

### 技術・運用上の整理

- 動画URLとvideo IDのみを管理
- 動画ファイルをrepositoryへ保存しない
- 動画を再配布しない
- 標準YouTube playerを使用
- embed不可・削除・非公開時はfallbackを表示
- 公式動画と第三者動画のsourceを区別
- 利用可能性はYouTubeとchannel／rights holderに依存
- v1.1-04でexternal dependencyとして記録
- v1.1-05でprivacy、external request、CSP、iframe設定を確認

---

## 8. 送信先と取り次ぎ希望

### 第一経路

World Rugby公式Contact Usフォームを使用する。

問い合わせ本文内で、次の担当への取り次ぎを依頼する。

```text
Game Analysis
Game Systems
Information Management
Digital
HSBC SVNS operations
```

### 理由

本件はpress enquiryではなく、次を含むproduct／data enquiryである。

- match statistics
- metric definitions
- API／data feed
- data usage conditions
- technical integration
- YouTube embedding guidance

### 直接担当が判明した場合

World Rugbyから正式に担当者または委託先を案内された場合、その案内経路と担当範囲を記録して次の連絡を行う。

---

## 9. 送信前チェックリスト

```text
[ ] FULL NAMEを入力
[ ] Public prototype URLを入力
[ ] About page URLを入力
[ ] Data and Video Sources page URLを入力
[ ] GitHub repository URLを入力
[ ] 各URLをログアウト状態で開けることを確認
[ ] Aboutにunofficial noticeがある
[ ] Data SourcesにRugby Australiaの出典がある
[ ] YouTube利用説明が実際の実装と一致
[ ] 自動scrapingなしという説明が実態と一致
[ ] attachmentを付けず、まずURLで提示
[ ] pilot、売却、partnershipを主要求にしていない
[ ] 誤字、署名、送信元emailを確認
[ ] 送信本文を保存
[ ] 送信日を記録
```

---

## 10. 送信後の記録

```text
Sent date:
[YYYY-MM-DD]

Route:
World Rugby Contact Us form

Subject:
Inquiry about HSBC SVNS match statistics and an independent analytics prototype

Submitted by:
[FULL NAME]

Automatic acknowledgement:
[YES / NO]

Reference number:
[IF PROVIDED]

Reply received:
[YES / NO]

Reply date:
[YYYY-MM-DD]

Referred team or organisation:
[NAME]

Next action:
[TEXT]
```

---

## 11. Follow-up方針

```text
送信後0～14日：
待機

15～21日：
必要に応じて一度だけ簡潔なfollow-up

22日以降：
無回答として記録可能
```

無回答は許諾と扱わない。

返信があった場合は、次を分けて記録する。

- 明示された事実
- 利用条件
- 担当範囲
- 追加質問
- こちらの解釈
- 公開継続／縮小／停止判断
- 技術協議
- 商業協議

---

## 12. v1.1-02完了条件

```text
[x] 自己紹介表現を確定
[x] 英文問い合わせ本文を作成
[x] contact form短縮版を作成
[x] Rugby Australiaの限定sample利用を明記
[x] automated scrapingなしを明記
[x] YouTube標準embed利用を明記
[x] 動画の保存・複製・再配布なしを明記
[x] 質問事項を整理
[x] project summaryを作成
[x] 送信前checklistを作成
[x] 送信後記録templateを作成

[ ] Owner detailsとURLを入力
[ ] 最終本文を確認
[ ] World Rugbyへ送信
```

上記3項目が完了した時点でv1.1-02をCompletedとし、送信・対応記録をv1.1-03で管理する。
