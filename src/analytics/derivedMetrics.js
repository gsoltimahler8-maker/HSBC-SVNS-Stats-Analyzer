import { getTeamResult } from './matchCollections.js';

const isPresent = (value) =>
  value !== null && value !== undefined && value !== '';

export const numberOrNull = (value) => {
  if (!isPresent(value)) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const divideOrNull = (numerator, denominator, multiplier = 1) => {
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
