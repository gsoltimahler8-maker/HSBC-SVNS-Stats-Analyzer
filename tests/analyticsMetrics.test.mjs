import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ANALYSIS_METRIC_KEYS,
  METRIC_CATEGORIES,
  METRIC_DEFINITIONS,
  RELATIONSHIP_PRESETS,
  aggregateMetric,
  compareMatchesChronologically,
  formatMetricValue,
  getMetricCoverage,
  getMetricValue,
  getTeamResult,
  getUniqueValues,
  groupMatches,
} from '../src/utils/analyticsMetrics.js';

const assertClose = (actual, expected, epsilon = 1e-12) => {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`
  );
};

const winMatch = {
  id: 'm1',
  date: '2026-01-01',
  tournament: 'Alpha SVNS',
  opponent: 'Fiji',
  result: 'W',
  pointsFor: 28,
  pointsAgainst: 14,
  tries: 4,
  metres: 200,
  carries: 20,
  cleanBreaks: 4,
  defendersBeaten: 6,
  turnoversWon: 3,
  turnoversConceded: 1,
  penaltiesConceded: 2,
  tackles: 18,
  missedTackles: 2,
  rucksWon: 9,
  rucksLost: 1,
  external: { rugbyComAu: '20' },
};

const lossMatch = {
  id: 'm2',
  date: '2026-01-02',
  tournament: 'Alpha SVNS',
  opponent: 'Australia',
  teamResult: 'L',
  pointsFor: 7,
  pointsAgainst: 21,
  tries: 1,
  metres: 50,
  carries: 20,
  cleanBreaks: 1,
  defendersBeaten: 2,
  turnoversWon: 1,
  turnoversConceded: 3,
  penaltiesConceded: 4,
  tackles: 8,
  missedTackles: 2,
  rucksWon: 4,
  rucksLost: 1,
  external: { rugbyComAu: '30' },
};

test('the 13 public analysis metrics remain the configured core set', () => {
  assert.equal(ANALYSIS_METRIC_KEYS.length, 13);
  assert.equal(new Set(ANALYSIS_METRIC_KEYS).size, 13);

  const categoryKeys = METRIC_CATEGORIES.flatMap((category) => category.metricKeys);
  assert.deepEqual(categoryKeys, ANALYSIS_METRIC_KEYS);

  for (const key of ANALYSIS_METRIC_KEYS) {
    assert.ok(METRIC_DEFINITIONS[key], `missing definition for ${key}`);
  }
});

test('derived metric formulas preserve current match-level behavior', () => {
  assert.equal(getMetricValue(winMatch, 'pointDiff'), 14);
  assert.equal(getMetricValue(winMatch, 'winRate'), 100);
  assert.equal(getMetricValue(lossMatch, 'winRate'), 0);
  assert.equal(getMetricValue(winMatch, 'pointsPerMatch'), 28);
  assert.equal(getMetricValue(winMatch, 'triesPerMatch'), 4);
  assertClose(getMetricValue(winMatch, 'pointsPer100Metres'), 14);
  assertClose(getMetricValue(winMatch, 'triesPer100Metres'), 2);
  assertClose(getMetricValue(winMatch, 'metresPerCarry'), 10);
  assertClose(getMetricValue(winMatch, 'cleanBreaksPer100Carries'), 20);
  assertClose(getMetricValue(winMatch, 'defendersBeatenPerCarry'), 0.3);
  assert.equal(getMetricValue(winMatch, 'turnoverDifferential'), 2);
  assert.equal(getMetricValue(winMatch, 'penaltiesPerMatch'), 2);
  assertClose(getMetricValue(winMatch, 'tackleSuccess'), 90);
  assertClose(getMetricValue(winMatch, 'ruckSuccess'), 90);
});

test('missing inputs and zero denominators remain null rather than zero', () => {
  assert.equal(
    getMetricValue({ ...winMatch, metres: null }, 'metresPerCarry'),
    null
  );
  assert.equal(
    getMetricValue({ ...winMatch, carries: 0 }, 'metresPerCarry'),
    null
  );
  assert.equal(
    getMetricValue({ ...winMatch, tackles: null }, 'tackleSuccess'),
    null
  );
  assert.equal(
    getMetricValue({ ...winMatch, tackles: 0, missedTackles: 0 }, 'tackleSuccess'),
    null
  );
});

test('ratio aggregation uses pooled numerator and denominator', () => {
  const rows = [
    { metres: 200, carries: 20 },
    { metres: 50, carries: 10 },
  ];
  const pooled = aggregateMetric(rows, 'metresPerCarry');
  const meanOfMatchRatios = (10 + 5) / 2;

  assertClose(pooled, 250 / 30);
  assert.notEqual(pooled, meanOfMatchRatios);
});

test('zero-denominator rows are excluded from pooled aggregation', () => {
  const result = aggregateMetric(
    [
      { metres: 100, carries: 10 },
      { metres: 50, carries: 0 },
    ],
    'metresPerCarry'
  );

  assert.equal(result, 10);
});

test('win rate excludes results other than W/L from its denominator', () => {
  assert.equal(
    aggregateMetric(
      [{ result: 'W' }, { result: 'L' }, { result: 'D' }, { result: 'NC' }],
      'winRate'
    ),
    50
  );
});

test('coverage excludes matches whose metric cannot be calculated', () => {
  const coverage = getMetricCoverage(
    [winMatch, { ...lossMatch, carries: 0 }],
    'metresPerCarry'
  );

  assert.deepEqual(coverage, { available: 1, total: 2 });
});

test('comparison grouping primitives support tournament, opponent and result', () => {
  const matches = [winMatch, lossMatch, { ...winMatch, id: 'm3', opponent: 'Fiji' }];

  assert.equal(groupMatches(matches, (match) => match.tournament).size, 1);
  assert.equal(groupMatches(matches, (match) => match.opponent).get('Fiji').length, 2);
  assert.equal(groupMatches(matches, (match) => getTeamResult(match)).get('W').length, 2);
  assert.deepEqual(getUniqueValues(matches, 'opponent'), ['Fiji', 'Australia']);
});

test('chronological comparison uses date, external ID and record ID tie-breakers', () => {
  const matches = [
    { id: 'b', date: '2026-01-02', external: { rugbyComAu: '2' } },
    { id: 'c', date: '2026-01-01', external: { rugbyComAu: '3' } },
    { id: 'a', date: '2026-01-01', external: { rugbyComAu: '1' } },
  ];

  matches.sort(compareMatchesChronologically);
  assert.deepEqual(matches.map((match) => match.id), ['a', 'c', 'b']);
});

test('relationship presets reference defined metrics and remain uniquely identified', () => {
  assert.equal(RELATIONSHIP_PRESETS.length, 7);
  assert.equal(
    new Set(RELATIONSHIP_PRESETS.map((preset) => preset.id)).size,
    RELATIONSHIP_PRESETS.length
  );

  for (const preset of RELATIONSHIP_PRESETS) {
    assert.ok(METRIC_DEFINITIONS[preset.xMetric], `unknown x metric ${preset.xMetric}`);
    assert.ok(METRIC_DEFINITIONS[preset.yMetric], `unknown y metric ${preset.yMetric}`);
  }
});

test('display formatting rounds only at presentation time', () => {
  assert.equal(formatMetricValue('metresPerCarry', 6.255), '6.25');
  assert.equal(formatMetricValue('tackleSuccess', 90), '90.0%');
  assert.equal(formatMetricValue('pointDiff', null), '—');
});
