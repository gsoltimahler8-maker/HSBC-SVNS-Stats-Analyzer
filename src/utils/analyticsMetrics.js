const isPresent = (value) =>
  value !== null && value !== undefined && value !== '';

const numberOrNull = (value) => {
  if (!isPresent(value)) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const divideOrNull = (numerator, denominator, multiplier = 1) => {
  const numeratorValue = numberOrNull(numerator);
  const denominatorValue = numberOrNull(denominator);

  if (
    numeratorValue === null ||
    denominatorValue === null ||
    denominatorValue === 0
  ) {
    return null;
  }

  return (numeratorValue / denominatorValue) * multiplier;
};

export const METRIC_DEFINITIONS = {
  pointDiff: {
    labelJa: '得失点差',
    labelEn: 'Points Differential',
    formulaJa: '得点 − 失点',
    formulaEn: 'Points For − Points Against',
    suffix: '',
    decimals: 1,
    type: 'calculated',
  },
  winRate: {
    labelJa: '勝率',
    labelEn: 'Win Rate',
    formulaJa: '勝利試合数 ÷ 勝敗確定試合数 × 100',
    formulaEn: 'Wins ÷ matches with a known result × 100',
    suffix: '%',
    decimals: 1,
    type: 'calculated',
  },
  pointsPerMatch: {
    labelJa: '1試合当たり得点',
    labelEn: 'Points per Match',
    formulaJa: '選択範囲の得点合計 ÷ 対象試合数',
    formulaEn: 'Total Points For ÷ selected matches',
    suffix: '',
    decimals: 1,
    type: 'calculated',
  },
  triesPerMatch: {
    labelJa: '1試合当たりトライ',
    labelEn: 'Tries per Match',
    formulaJa: '選択範囲のトライ合計 ÷ 対象試合数',
    formulaEn: 'Total Tries ÷ selected matches',
    suffix: '',
    decimals: 1,
    type: 'calculated',
  },
  pointsPer100Metres: {
    labelJa: '100m当たり得点',
    labelEn: 'Points per 100 Metres',
    formulaJa: '得点 ÷ 獲得メートル × 100',
    formulaEn: 'Points For ÷ Metres × 100',
    suffix: '',
    decimals: 2,
    type: 'calculated',
  },
  triesPer100Metres: {
    labelJa: '100m当たりトライ',
    labelEn: 'Tries per 100 Metres',
    formulaJa: 'トライ ÷ 獲得メートル × 100',
    formulaEn: 'Tries ÷ Metres × 100',
    suffix: '',
    decimals: 2,
    type: 'calculated',
  },
  metresPerCarry: {
    labelJa: '1キャリー当たりメートル',
    labelEn: 'Metres per Carry',
    formulaJa: '獲得メートル ÷ キャリー',
    formulaEn: 'Metres ÷ Carries',
    suffix: '',
    decimals: 2,
    type: 'calculated',
  },
  cleanBreaksPer100Carries: {
    labelJa: '100キャリー当たりクリーンブレイク',
    labelEn: 'Clean Breaks per 100 Carries',
    formulaJa: 'クリーンブレイク ÷ キャリー × 100',
    formulaEn: 'Clean Breaks ÷ Carries × 100',
    suffix: '',
    decimals: 1,
    type: 'calculated',
  },
  defendersBeatenPerCarry: {
    labelJa: '1キャリー当たりディフェンダー突破',
    labelEn: 'Defenders Beaten per Carry',
    formulaJa: 'ディフェンダー突破 ÷ キャリー',
    formulaEn: 'Defenders Beaten ÷ Carries',
    suffix: '',
    decimals: 2,
    type: 'calculated',
  },
  turnoverDifferential: {
    labelJa: 'ターンオーバー差',
    labelEn: 'Turnover Differential',
    formulaJa: 'ターンオーバー獲得 − ターンオーバー喪失',
    formulaEn: 'Turnovers Won − Turnovers Conceded',
    suffix: '',
    decimals: 1,
    type: 'calculated',
  },
  penaltiesPerMatch: {
    labelJa: '1試合当たり反則',
    labelEn: 'Penalties per Match',
    formulaJa: '選択範囲の反則合計 ÷ 対象試合数',
    formulaEn: 'Total Penalties Conceded ÷ selected matches',
    suffix: '',
    decimals: 1,
    type: 'calculated',
  },
  tackleSuccess: {
    labelJa: 'タックル成功率',
    labelEn: 'Tackle Success',
    formulaJa: 'タックル ÷（タックル＋ミスタックル）× 100',
    formulaEn: 'Tackles ÷ (Tackles + Missed Tackles) × 100',
    suffix: '%',
    decimals: 1,
    type: 'calculated',
  },
  ruckSuccess: {
    labelJa: 'ラック成功率',
    labelEn: 'Ruck Success',
    formulaJa: 'ラック獲得 ÷（ラック獲得＋ラック喪失）× 100',
    formulaEn: 'Rucks Won ÷ (Rucks Won + Rucks Lost) × 100',
    suffix: '%',
    decimals: 1,
    type: 'calculated',
  },
  pointsAgainst: {
    labelJa: '失点',
    labelEn: 'Points Against',
    formulaJa: '試合で許した得点',
    formulaEn: 'Points conceded in the match',
    suffix: '',
    decimals: 1,
    type: 'raw',
  },
  turnoversConceded: {
    labelJa: 'ターンオーバー喪失',
    labelEn: 'Turnovers Conceded',
    formulaJa: '試合で失ったターンオーバー数',
    formulaEn: 'Turnovers conceded in the match',
    suffix: '',
    decimals: 1,
    type: 'raw',
  },
};

export const ANALYSIS_METRIC_KEYS = [
  'pointDiff',
  'winRate',
  'pointsPerMatch',
  'triesPerMatch',
  'pointsPer100Metres',
  'triesPer100Metres',
  'metresPerCarry',
  'cleanBreaksPer100Carries',
  'defendersBeatenPerCarry',
  'turnoverDifferential',
  'penaltiesPerMatch',
  'tackleSuccess',
  'ruckSuccess',
];

export const METRIC_CATEGORIES = [
  {
    id: 'results',
    labelJa: '結果・得点力',
    labelEn: 'Results & Scoring',
    descriptionJa: '勝敗と、1試合当たりの得点生産を確認します。',
    descriptionEn: 'Outcome and scoring production per match.',
    metricKeys: [
      'pointDiff',
      'winRate',
      'pointsPerMatch',
      'triesPerMatch',
    ],
  },
  {
    id: 'scoringEfficiency',
    labelJa: '得点効率',
    labelEn: 'Scoring Efficiency',
    descriptionJa: '獲得した前進を得点・トライへ変換した効率を確認します。',
    descriptionEn: 'How efficiently territorial gain became points and tries.',
    metricKeys: ['pointsPer100Metres', 'triesPer100Metres'],
  },
  {
    id: 'attackingEfficiency',
    labelJa: '攻撃効率',
    labelEn: 'Attacking Efficiency',
    descriptionJa: 'キャリーによる前進とラインブレイクの効率を確認します。',
    descriptionEn: 'Carry gain and line-breaking efficiency.',
    metricKeys: [
      'metresPerCarry',
      'cleanBreaksPer100Carries',
      'defendersBeatenPerCarry',
    ],
  },
  {
    id: 'possessionDiscipline',
    labelJa: 'ボール管理・規律',
    labelEn: 'Possession & Discipline',
    descriptionJa: 'ボール獲得・喪失の差と反則負担を確認します。',
    descriptionEn: 'Net turnover position and disciplinary cost.',
    metricKeys: ['turnoverDifferential', 'penaltiesPerMatch'],
  },
  {
    id: 'defenceRetention',
    labelJa: '守備・ボール保持',
    labelEn: 'Defence & Retention',
    descriptionJa: 'タックル遂行とラック保持の安定性を確認します。',
    descriptionEn: 'Tackle execution and ruck-retention stability.',
    metricKeys: ['tackleSuccess', 'ruckSuccess'],
  },
];

export const RELATIONSHIP_PRESETS = [
  {
    id: 'carryGainResult',
    labelJa: 'キャリー前進効率と試合結果',
    labelEn: 'Carry gain efficiency and result',
    questionJa: '1キャリー当たりの前進量が大きい試合ほど、得失点差は良かったか。',
    questionEn: 'Did matches with greater metres per carry also have a better points differential?',
    xMetric: 'metresPerCarry',
    yMetric: 'pointDiff',
  },
  {
    id: 'cleanBreakResult',
    labelJa: 'クリーンブレイク効率と試合結果',
    labelEn: 'Clean-break efficiency and result',
    questionJa: '100キャリー当たりのクリーンブレイクが多い試合ほど、得失点差は良かったか。',
    questionEn: 'Did matches with more clean breaks per 100 carries also have a better points differential?',
    xMetric: 'cleanBreaksPer100Carries',
    yMetric: 'pointDiff',
  },
  {
    id: 'defendersBeatenResult',
    labelJa: '突破効率と試合結果',
    labelEn: 'Defender-beating efficiency and result',
    questionJa: '1キャリー当たりのディフェンダー突破が多い試合ほど、得失点差は良かったか。',
    questionEn: 'Did matches with more defenders beaten per carry also have a better points differential?',
    xMetric: 'defendersBeatenPerCarry',
    yMetric: 'pointDiff',
  },
  {
    id: 'turnoverResult',
    labelJa: 'ターンオーバー差と試合結果',
    labelEn: 'Turnover differential and result',
    questionJa: 'ターンオーバー差が良い試合ほど、得失点差は良かったか。',
    questionEn: 'Did a better turnover differential accompany a better points differential?',
    xMetric: 'turnoverDifferential',
    yMetric: 'pointDiff',
  },
  {
    id: 'disciplineResult',
    labelJa: '反則と試合結果',
    labelEn: 'Discipline and result',
    questionJa: '反則が少ない試合ほど、得失点差は良かったか。',
    questionEn: 'Did matches with fewer penalties have a better points differential?',
    xMetric: 'penaltiesPerMatch',
    yMetric: 'pointDiff',
  },
  {
    id: 'tackleConcession',
    labelJa: 'タックル成功率と失点',
    labelEn: 'Tackle success and points conceded',
    questionJa: 'タックル成功率が高い試合ほど、失点は少なかったか。',
    questionEn: 'Did matches with higher tackle success concede fewer points?',
    xMetric: 'tackleSuccess',
    yMetric: 'pointsAgainst',
  },
  {
    id: 'ruckTurnovers',
    labelJa: 'ラック成功率とターンオーバー喪失',
    labelEn: 'Ruck success and turnovers conceded',
    questionJa: 'ラック成功率が高い試合ほど、ターンオーバー喪失は少なかったか。',
    questionEn: 'Did matches with higher ruck success concede fewer turnovers?',
    xMetric: 'ruckSuccess',
    yMetric: 'turnoversConceded',
  },
];

export const COMPARISON_METRIC_KEYS = ANALYSIS_METRIC_KEYS;
export const TREND_METRIC_KEYS = ANALYSIS_METRIC_KEYS;

export function getMetricDefinition(metricKey) {
  return METRIC_DEFINITIONS[metricKey] || {
    labelJa: metricKey,
    labelEn: metricKey,
    formulaJa: metricKey,
    formulaEn: metricKey,
    suffix: '',
    decimals: 1,
    type: 'unknown',
  };
}

export function getMetricLabel(metricKey, isJapanese) {
  const definition = getMetricDefinition(metricKey);
  return isJapanese ? definition.labelJa : definition.labelEn;
}

export function getMetricFormula(metricKey, isJapanese) {
  const definition = getMetricDefinition(metricKey);
  return isJapanese ? definition.formulaJa : definition.formulaEn;
}

export function getMetricValue(match, metricKey) {
  if (!match) {
    return null;
  }

  switch (metricKey) {
    case 'pointDiff': {
      const pointsFor = numberOrNull(match.pointsFor);
      const pointsAgainst = numberOrNull(match.pointsAgainst);
      return pointsFor === null || pointsAgainst === null
        ? null
        : pointsFor - pointsAgainst;
    }

    case 'winRate': {
      const result = getTeamResult(match);
      if (result === 'W') {
        return 100;
      }
      if (result === 'L') {
        return 0;
      }
      return null;
    }

    case 'pointsPerMatch':
      return numberOrNull(match.pointsFor);

    case 'triesPerMatch':
      return numberOrNull(match.tries);

    case 'penaltiesPerMatch':
      return numberOrNull(match.penaltiesConceded);

    case 'turnoverDifferential': {
      const won = numberOrNull(match.turnoversWon);
      const conceded = numberOrNull(match.turnoversConceded);
      return won === null || conceded === null ? null : won - conceded;
    }

    case 'metresPerCarry':
      return divideOrNull(match.metres, match.carries);

    case 'defendersBeatenPerCarry':
      return divideOrNull(match.defendersBeaten, match.carries);

    case 'cleanBreaksPer100Carries':
      return divideOrNull(match.cleanBreaks, match.carries, 100);

    case 'triesPer100Metres':
      return divideOrNull(match.tries, match.metres, 100);

    case 'pointsPer100Metres':
      return divideOrNull(match.pointsFor, match.metres, 100);

    case 'tackleSuccess': {
      const tackles = numberOrNull(match.tackles);
      const missedTackles = numberOrNull(match.missedTackles);

      if (tackles === null || missedTackles === null) {
        return null;
      }

      return divideOrNull(tackles, tackles + missedTackles, 100);
    }

    case 'ruckSuccess': {
      const rucksWon = numberOrNull(match.rucksWon);
      const rucksLost = numberOrNull(match.rucksLost);

      if (rucksWon === null || rucksLost === null) {
        return null;
      }

      return divideOrNull(rucksWon, rucksWon + rucksLost, 100);
    }

    default:
      return numberOrNull(match[metricKey]);
  }
}

export function getMetricCoverage(matches, metricKey) {
  const available = matches.reduce(
    (count, match) =>
      getMetricValue(match, metricKey) === null ? count : count + 1,
    0
  );

  return {
    available,
    total: matches.length,
  };
}

const meanMatchMetric = (matches, metricKey) => {
  const values = matches
    .map((match) => getMetricValue(match, metricKey))
    .filter((value) => value !== null);

  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const aggregateRatio = (
  matches,
  numeratorGetter,
  denominatorGetter,
  multiplier = 1
) => {
  let numeratorTotal = 0;
  let denominatorTotal = 0;
  let completeRows = 0;

  matches.forEach((match) => {
    const numerator = numberOrNull(numeratorGetter(match));
    const denominator = numberOrNull(denominatorGetter(match));

    if (numerator === null || denominator === null) {
      return;
    }

    numeratorTotal += numerator;
    denominatorTotal += denominator;
    completeRows += 1;
  });

  if (!completeRows || denominatorTotal === 0) {
    return null;
  }

  return (numeratorTotal / denominatorTotal) * multiplier;
};

export function aggregateMetric(matches, metricKey) {
  switch (metricKey) {
    case 'winRate': {
      const knownResults = matches
        .map((match) => getTeamResult(match))
        .filter((result) => result === 'W' || result === 'L');

      if (!knownResults.length) {
        return null;
      }

      const wins = knownResults.filter((result) => result === 'W').length;
      return (wins / knownResults.length) * 100;
    }

    case 'pointsPer100Metres':
      return aggregateRatio(
        matches,
        (match) => match.pointsFor,
        (match) => match.metres,
        100
      );

    case 'triesPer100Metres':
      return aggregateRatio(
        matches,
        (match) => match.tries,
        (match) => match.metres,
        100
      );

    case 'metresPerCarry':
      return aggregateRatio(
        matches,
        (match) => match.metres,
        (match) => match.carries
      );

    case 'cleanBreaksPer100Carries':
      return aggregateRatio(
        matches,
        (match) => match.cleanBreaks,
        (match) => match.carries,
        100
      );

    case 'defendersBeatenPerCarry':
      return aggregateRatio(
        matches,
        (match) => match.defendersBeaten,
        (match) => match.carries
      );

    case 'tackleSuccess':
      return aggregateRatio(
        matches,
        (match) => match.tackles,
        (match) => {
          const tackles = numberOrNull(match.tackles);
          const missed = numberOrNull(match.missedTackles);
          return tackles === null || missed === null ? null : tackles + missed;
        },
        100
      );

    case 'ruckSuccess':
      return aggregateRatio(
        matches,
        (match) => match.rucksWon,
        (match) => {
          const won = numberOrNull(match.rucksWon);
          const lost = numberOrNull(match.rucksLost);
          return won === null || lost === null ? null : won + lost;
        },
        100
      );

    default:
      return meanMatchMetric(matches, metricKey);
  }
}

export function averageMetric(matches, metricKey) {
  return aggregateMetric(matches, metricKey);
}

export function formatMetricValue(metricKey, value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return '—';
  }

  const definition = getMetricDefinition(metricKey);
  const numericValue = Number(value);
  const formatted = numericValue.toFixed(definition.decimals);

  return `${formatted}${definition.suffix}`;
}

export function compareMatchesChronologically(a, b) {
  const dateDifference = new Date(a.date) - new Date(b.date);

  if (dateDifference !== 0) {
    return dateDifference;
  }

  const aExternalId = Number(a.external?.rugbyComAu);
  const bExternalId = Number(b.external?.rugbyComAu);

  if (
    Number.isFinite(aExternalId) &&
    Number.isFinite(bExternalId) &&
    aExternalId !== bExternalId
  ) {
    return aExternalId - bExternalId;
  }

  return String(a.id).localeCompare(String(b.id));
}

export function getTeamResult(match) {
  return match?.teamResult || match?.result || '';
}

export function groupMatches(matches, keyGetter) {
  const groups = new Map();

  matches.forEach((match) => {
    const key = keyGetter(match);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(match);
  });

  return groups;
}

export function getUniqueValues(matches, key) {
  return [...new Set(matches.map((match) => match[key]).filter(Boolean))];
}
