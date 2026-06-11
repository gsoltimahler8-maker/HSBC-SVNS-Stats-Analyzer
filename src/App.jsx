import { useState } from 'react';
import HomeMenu from './components/HomeMenu.jsx';
import StatsAnalysis from './components/StatsAnalysis.jsx';

function ComingSoon({ title, description, onBackHome }) {
  return (
    <div className="app">
      <button type="button" className="backHomeButton" onClick={onBackHome}>
        ← ホームへ戻る
      </button>

      <section className="panel">
        <h1>{title}</h1>
        <p>{description}</p>
        <p className="note">
          この画面はVersion0.2以降で段階的に実装します。現時点では、既存のスタッツ分析画面を壊さずにホーム画面から遷移できることを優先しています。
        </p>
      </section>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');

  if (screen === 'analysis') {
    return <StatsAnalysis onBackHome={() => setScreen('home')} />;
  }

  if (screen === 'trends') {
    return (
      <ComingSoon
        title="スタッツ推移"
        description="シーズン内推移、対戦国別推移、過去シーズン比較、大会別比較を確認する中核機能です。"
        onBackHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'search') {
    return (
      <ComingSoon
        title="試合検索"
        description="Season / Tournament / Gender / Team / Opponent / Stage / Result / Match ID で試合を検索する画面です。"
        onBackHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'videos') {
    return (
      <ComingSoon
        title="動画ライブラリ"
        description="スタッツ分析結果を動画で検証するための補助機能です。将来的にはスタッツを見ながら動画を確認できる構成にします。"
        onBackHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'admin') {
    return (
      <ComingSoon
        title="データ管理"
        description="管理者専用のデータ取込、確認、更新履歴、大会ステータス管理画面です。"
        onBackHome={() => setScreen('home')}
      />
    );
  }

  return <HomeMenu onNavigate={setScreen} />;
}
