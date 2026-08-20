export const CANONICAL_MATCH_SCHEMA_VERSION = 'v1.1-canonical-match-1';

export const CANONICAL_GENDERS = Object.freeze(['Women', 'Men']);
export const CANONICAL_RESULTS = Object.freeze(['W', 'L', 'D', 'NC']);
export const CANONICAL_COVERAGE_LEVELS = Object.freeze([
  'full_match_stats',
  'limited_data',
  'results_only',
  'unknown',
]);
export const CANONICAL_DATA_TYPES = Object.freeze(['real', 'sample']);
export const CANONICAL_EXTERNAL_ID_FIELDS = Object.freeze([
  'rugbyComAu',
  'svns',
  'rugbyPass',
]);

export const CANONICAL_REQUIRED_FIELDS = Object.freeze([
  'id',
  'season',
  'tournament',
  'date',
  'gender',
  'stage',
  'team',
  'opponent',
  'result',
  'pointsFor',
  'pointsAgainst',
  'sourceProvider',
  'sourceUrl',
  'fetchedAt',
  'dataCoverageLevel',
  'dataCoverageSource',
  'statDefinitionVersion',
]);

export const CANONICAL_NULLABLE_STAT_FIELDS = Object.freeze([
  'tries',
  'metres',
  'carries',
  'passes',
  'offloads',
  'cleanBreaks',
  'defendersBeaten',
  'tackles',
  'missedTackles',
  'turnoversWon',
  'turnoversConceded',
  'rucksWon',
  'rucksLost',
  'possession',
  'territory',
  'penaltiesConceded',
  'yellowCards',
  'redCards',
]);

export const CANONICAL_NUMERIC_FIELDS = Object.freeze([
  'pointsFor',
  'pointsAgainst',
  ...CANONICAL_NULLABLE_STAT_FIELDS,
]);

export const CANONICAL_PERCENTAGE_FIELDS = Object.freeze([
  'possession',
  'territory',
]);

/**
 * Compatibility-only fields still present in the current dataset/UI.
 * They are not the preferred source of truth for new provider adapters.
 */
export const CANONICAL_COMPATIBILITY_FIELDS = Object.freeze([
  'teamResult',
  'matchResult',
  'winner',
  'loser',
  'dataType',
]);

/**
 * Machine-readable data dictionary for the canonical team-match record.
 * Derived analytics metrics are deliberately excluded because they belong
 * to the Derived Metrics Engine rather than the raw/canonical match record.
 */
export const CANONICAL_MATCH_FIELDS = Object.freeze({
  id: {
    type: 'string',
    unit: null,
    nullable: false,
    required: true,
    kind: 'identity',
    description: 'Application-level unique team-match record ID.',
  },
  external: {
    type: 'object',
    unit: null,
    nullable: false,
    required: false,
    kind: 'identity',
    description: 'Provider/external match identifiers.',
  },
  season: {
    type: 'string',
    unit: null,
    nullable: false,
    required: true,
    kind: 'competition',
    description: 'Season label, normally YYYY-YY.',
  },
  tournament: {
    type: 'string',
    unit: null,
    nullable: false,
    required: true,
    kind: 'competition',
    description: 'Tournament/event name used by the application.',
  },
  date: {
    type: 'string',
    unit: 'ISO date',
    nullable: false,
    required: true,
    kind: 'competition',
    description: 'Match date in YYYY-MM-DD format.',
  },
  gender: {
    type: 'enum',
    unit: null,
    nullable: false,
    required: true,
    kind: 'competition',
    values: CANONICAL_GENDERS,
    description: 'Competition category.',
  },
  stage: {
    type: 'string',
    unit: null,
    nullable: false,
    required: true,
    kind: 'competition',
    description: 'Tournament stage/round label.',
  },
  team: {
    type: 'string',
    unit: null,
    nullable: false,
    required: true,
    kind: 'team',
    description: 'Team represented by this record.',
  },
  opponent: {
    type: 'string',
    unit: null,
    nullable: false,
    required: true,
    kind: 'team',
    description: 'Opponent of the represented team.',
  },
  result: {
    type: 'enum',
    unit: null,
    nullable: false,
    required: true,
    kind: 'result',
    values: CANONICAL_RESULTS,
    description: 'Result from the represented team perspective.',
  },
  pointsFor: {
    type: 'number',
    unit: 'points',
    nullable: false,
    required: true,
    kind: 'raw-stat',
    description: 'Points scored by the represented team.',
  },
  pointsAgainst: {
    type: 'number',
    unit: 'points',
    nullable: false,
    required: true,
    kind: 'raw-stat',
    description: 'Points conceded by the represented team.',
  },
  tries: statField('count', 'Tries scored.'),
  metres: statField('metres', 'Metres gained.'),
  carries: statField('count', 'Carries.'),
  passes: statField('count', 'Passes.'),
  offloads: statField('count', 'Offloads.'),
  cleanBreaks: statField('count', 'Clean breaks.'),
  defendersBeaten: statField('count', 'Defenders beaten.'),
  tackles: statField('count', 'Completed tackles as represented by the source definition.'),
  missedTackles: statField('count', 'Missed tackles.'),
  turnoversWon: statField('count', 'Turnovers won.'),
  turnoversConceded: statField('count', 'Turnovers conceded.'),
  rucksWon: statField('count', 'Rucks won.'),
  rucksLost: statField('count', 'Rucks lost.'),
  possession: statField('percentage points', 'Possession percentage, stored on a 0-100 scale.'),
  territory: statField('percentage points', 'Territory percentage, stored on a 0-100 scale.'),
  penaltiesConceded: statField('count', 'Penalties conceded.'),
  yellowCards: statField('count', 'Yellow cards.'),
  redCards: statField('count', 'Red cards.'),
  sourceProvider: {
    type: 'string',
    unit: null,
    nullable: false,
    required: true,
    kind: 'provenance',
    description: 'Primary source/provider label for this record.',
  },
  sourceUrl: {
    type: 'string',
    unit: 'URL',
    nullable: false,
    required: true,
    kind: 'provenance',
    description: 'Traceable source URL.',
  },
  fetchedAt: {
    type: 'string',
    unit: 'ISO datetime',
    nullable: false,
    required: true,
    kind: 'provenance',
    description: 'Date/time the source record was collected or verified.',
  },
  dataCoverageLevel: {
    type: 'enum',
    unit: null,
    nullable: false,
    required: true,
    kind: 'coverage',
    values: CANONICAL_COVERAGE_LEVELS,
    description: 'Coverage classification for the record.',
  },
  dataCoverageSource: {
    type: 'string',
    unit: null,
    nullable: false,
    required: true,
    kind: 'coverage',
    description: 'Human-readable explanation/source for coverage classification.',
  },
  statDefinitionVersion: {
    type: 'string',
    unit: null,
    nullable: false,
    required: true,
    kind: 'provenance',
    description: 'Version identifier for source stat definitions/mapping.',
  },
  dataType: {
    type: 'enum',
    unit: null,
    nullable: true,
    required: false,
    kind: 'compatibility',
    values: CANONICAL_DATA_TYPES,
    description: 'Current real/sample compatibility flag; optional until dataset migration is complete.',
  },
  teamResult: compatibilityField('Legacy result alias. Canonical source of truth is result.'),
  matchResult: compatibilityField('Presentation-oriented result label retained for compatibility.'),
  winner: compatibilityField('Presentation-oriented winner field retained for compatibility.'),
  loser: compatibilityField('Presentation-oriented loser field retained for compatibility.'),
});

function statField(unit, description) {
  return {
    type: 'number',
    unit,
    nullable: true,
    required: false,
    kind: 'raw-stat',
    description,
  };
}

function compatibilityField(description) {
  return {
    type: 'string',
    unit: null,
    nullable: true,
    required: false,
    kind: 'compatibility',
    description,
  };
}
