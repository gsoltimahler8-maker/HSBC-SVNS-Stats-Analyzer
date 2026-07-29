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
  pointsFor: {
    labelJa: '得点',
    labelEn: 'Points For',
    formulaJa: '試合で獲得した得点',
    formulaEn: 'Points scored in the match',
    suffix: '',
    decimals: 1,
    type: 'raw',
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
  tries: {
    labelJa: 'トライ',
    labelEn: 'Tries',
    formulaJa: '試合で獲得したトライ数',
    formulaEn: 'Tries scored in the match',
    suffix: '',
    decimals: 1,
    type: 'raw',
  },
  pointDiff: {
    labelJa: '得失点差',
    labelEn: 'Point Differential',
    formulaJa: '得点 − 失点',
    formulaEn: 'Points For − Points Against',
    suffix: '',
    decimals: 1,
    type: 'calculated',
  },
  penaltiesConceded: {
    labelJa: '反則数',
    labelEn: 'Penalties Conceded',
    formulaJa: '試合で科されたペナルティ数',
    formulaEn: 'Penalties conceded in the match',
    suffix: '',
    decimals: 1,
    type: 'raw',
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
  metresPerCarry: {
    labelJa: '1キャリー当たりメートル',
    labelEn: 'Metres per Carry',
    formulaJa: '獲得メートル ÷ キャリー',
    formulaEn: 'Metres ÷ Carries',
    suffix: '',
    decimals: 2,
    type: 'calculated',
  },
  defendersBeatenPerCarry: {
    labelJa: '1キャリー当たり突破',
    labelEn: 'Defenders Beaten per Carry',
    formulaJa: 'ディフェンダー突破 ÷ キャリー',
    formulaEn: 'Defenders Beaten ÷ Carries',
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
  triesPer100Metres: {
    labelJa: '100m当たりトライ',
    labelEn: 'Tries per 100 Metres',
    formulaJa: 'トライ ÷ 獲得メートル × 100',
    formulaEn: 'Tries ÷ Metres × 100',
    suffix: '',
    decimals: 2,
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
  metresPerTry: {
    labelJa: '1トライ当たりメートル',
    labelEn: 'Metres per Try',
    formulaJa: '獲得メートル ÷ トライ',
    formulaEn: 'Metres ÷ Tries',
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
};

export const OVERVIEW_METRIC_KEYS = [
  'pointDiff',
  'penaltiesConceded',
  'turnoverDifferential',
  'metresPerCarry',
  'tackleSuccess',
];

export const COMPARISON_METRIC_KEYS = [
  'pointDiff',
  'penaltiesConceded',
  'turnoverDifferential',
  'metresPerCarry',
  'defendersBeatenPerCarry',
  'cleanBreaksPer100Carries',
  'triesPer100Metres',
  'pointsPer100Metres',
  'metresPerTry',
  'tackleSuccess',
  'ruckSuccess',
];

export const RELATIONSHIP_METRIC_KEYS = [
  'pointDiff',
  'pointsFor',
  'pointsAgainst',
  'tries',
  'penaltiesConceded',
  'turnoverDifferential',
  'metresPerCarry',
  'defendersBeatenPerCarry',
  'cleanBreaksPer100Carries',
  'triesPer100Metres',
  'pointsPer100Metres',
  'metresPerTry',
  'tackleSuccess',
  'ruckSuccess',
];

export const TREND_METRIC_KEYS = [
  'pointDiff',
  'pointsFor',
  'pointsAgainst',
  'tries',
  'penaltiesConceded',
  'turnoverDifferential',
  'metresPerCarry',
  'defendersBeatenPerCarry',
  'cleanBreaksPer100Carries',
  'triesPer100Metres',
  'pointsPer100Metres',
  'tackleSuccess',
  'ruckSuccess',
];

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

    case 'metresPerTry':
      return divideOrNull(match.metres, match.tries);

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

export function averageMetric(matches, metricKey) {
  const values = matches
    .map((match) => getMetricValue(match, metricKey))
    .filter((value) => value !== null);

  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
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
