const menuItems = [
  {
    id: 'analysis',
    labelJa: 'スタッツ分析',
    labelEn: 'Stats Analysis',
    descriptionJa: '試合単位のスタッツ、勝敗比較、相関候補を確認します。',
    positionClass: 'homeButtonAnalysis',
  },
  {
    id: 'trends',
    labelJa: 'スタッツ推移',
    labelEn: 'Stats Trends',
    descriptionJa: 'シーズン内推移、対戦国別推移、過去シーズン比較を確認します。',
    positionClass: 'homeButtonTrends',
  },
  {
    id: 'search',
    labelJa: '試合検索',
    labelEn: 'Match Search',
    descriptionJa: 'Season / Tournament / Team / Opponent などで試合を検索します。',
    positionClass: 'homeButtonSearch',
  },
  {
    id: 'videos',
    labelJa: '動画ライブラリ',
    labelEn: 'Video Library',
    descriptionJa: 'スタッツ分析結果を動画で確認するための補助機能です。',
    positionClass: 'homeButtonVideos',
  },
  {
    id: 'admin',
    labelJa: 'データ管理',
    labelEn: 'Data Management',
    descriptionJa: '管理者用のデータ取込・確認・更新履歴管理です。',
    positionClass: 'homeButtonAdmin',
  },
];

export default function HomeMenu({ onNavigate }) {
  const heroImage = `${import.meta.env.BASE_URL}assets/home-hero.png`;

  return (
    <div
      className="homeMenu"
      style={{
  backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.06), rgba(2, 6, 23, 0.24)), url(${heroImage})`,
}}
    >
      <div className="homeOverlay">
        <header className="homeHeader">
          <p className="homeKicker">Unofficial SVNS analytics platform</p>
          <h1>SVNS Stats Analyzer</h1>
          <p>
            速報ではなく分析。SVNSの試合スタッツを、シーズン・大会・男女区分・
            チーム・対戦相手・試合数を明示して検証するためのプラットフォームです。
          </p>
        </header>

        <div className="homeMenuButtons" aria-label="Main menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`homeButton ${item.positionClass}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="homeButtonLabelJa">{item.labelJa}</span>
              <span className="homeButtonLabelEn">{item.labelEn}</span>
              <small>{item.descriptionJa}</small>
            </button>
          ))}
        </div>

        <footer className="homeFooter">
          <p>
            本アプリは非公式のSVNSスタッツ分析アプリです。
            データ出典: Rugby.com.au / SVNS Match Centre
          </p>
        </footer>
      </div>
    </div>
  );
}
