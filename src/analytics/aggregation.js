import {
  getMetricValue,
  numberOrNull,
} from './derivedMetrics.js';
import { getTeamResult } from './matchCollections.js';

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

    if (numerator === null || denominator === null || denominator === 0) {
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
