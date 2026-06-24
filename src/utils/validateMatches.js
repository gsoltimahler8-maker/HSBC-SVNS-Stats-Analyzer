const REQUIRED_FIELDS = [
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
];

const NUMERIC_FIELDS = [
  'pointsFor',
  'pointsAgainst',
  'tries',
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
];

const PERCENTAGE_FIELDS = ['possession', 'territory'];

const ALLOWED_GENDERS = ['Women', 'Men'];
const ALLOWED_RESULTS = ['W', 'L', 'D', 'NC'];
const ALLOWED_COVERAGE_LEVELS = [
  'full_match_stats',
  'limited_data',
  'results_only',
  'unknown',
];

function isBlank(value) {
  return value === undefined || value === null || value === '';
}

function isValidIsoDate(value) {
  if (typeof value !== 'string') return false;

  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateOnlyPattern.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime());
}

function isValidIsoDateTime(value) {
  if (typeof value !== 'string') return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function addIssue(issues, severity, matchId, field, message) {
  issues.push({
    severity,
    matchId,
    field,
    message,
  });
}

function validateRequiredFields(match, issues) {
  REQUIRED_FIELDS.forEach((field) => {
    if (isBlank(match[field])) {
      addIssue(
        issues,
        'error',
        match.id || 'UNKNOWN_MATCH_ID',
        field,
        `Required field "${field}" is missing.`
      );
    }
  });
}

function validateExternalIds(match, issues) {
  if (!match.external || typeof match.external !== 'object') {
    addIssue(
      issues,
      'warning',
      match.id || 'UNKNOWN_MATCH_ID',
      'external',
      'External ID object is missing. This is allowed temporarily, but should be added before real-data import.'
    );
    return;
  }

  const hasAnyExternalId =
    !isBlank(match.external.rugbyComAu) ||
    !isBlank(match.external.svns) ||
    !isBlank(match.external.rugbyPass);

  if (!hasAnyExternalId) {
    addIssue(
      issues,
      'warning',
      match.id || 'UNKNOWN_MATCH_ID',
      'external',
      'No external match IDs are available.'
    );
  }
}

function validateEnums(match, issues) {
  if (!isBlank(match.gender) && !ALLOWED_GENDERS.includes(match.gender)) {
    addIssue(
      issues,
      'error',
      match.id || 'UNKNOWN_MATCH_ID',
      'gender',
      `Invalid gender "${match.gender}". Allowed values: ${ALLOWED_GENDERS.join(', ')}.`
    );
  }

  if (!isBlank(match.result) && !ALLOWED_RESULTS.includes(match.result)) {
    addIssue(
      issues,
      'error',
      match.id || 'UNKNOWN_MATCH_ID',
      'result',
      `Invalid result "${match.result}". Allowed values: ${ALLOWED_RESULTS.join(', ')}.`
    );
  }

  if (
    !isBlank(match.dataCoverageLevel) &&
    !ALLOWED_COVERAGE_LEVELS.includes(match.dataCoverageLevel)
  ) {
    addIssue(
      issues,
      'error',
      match.id || 'UNKNOWN_MATCH_ID',
      'dataCoverageLevel',
      `Invalid dataCoverageLevel "${match.dataCoverageLevel}". Allowed values: ${ALLOWED_COVERAGE_LEVELS.join(', ')}.`
    );
  }
}

function validateDates(match, issues) {
  if (!isBlank(match.date) && !isValidIsoDate(match.date)) {
    addIssue(
      issues,
      'error',
      match.id || 'UNKNOWN_MATCH_ID',
      'date',
      'Match date must use YYYY-MM-DD format.'
    );
  }

  if (!isBlank(match.fetchedAt) && !isValidIsoDateTime(match.fetchedAt)) {
    addIssue(
      issues,
      'error',
      match.id || 'UNKNOWN_MATCH_ID',
      'fetchedAt',
      'fetchedAt must be a valid ISO datetime string.'
    );
  }
}

function validateNumericFields(match, issues) {
  NUMERIC_FIELDS.forEach((field) => {
    const value = match[field];

    if (value === null || value === undefined) return;

    if (typeof value !== 'number' || Number.isNaN(value)) {
      addIssue(
        issues,
        'error',
        match.id || 'UNKNOWN_MATCH_ID',
        field,
        `Field "${field}" must be a number or null.`
      );
      return;
    }

    if (value < 0) {
      addIssue(
        issues,
        'error',
        match.id || 'UNKNOWN_MATCH_ID',
        field,
        `Field "${field}" cannot be negative.`
      );
    }
  });
}

function validatePercentageFields(match, issues) {
  PERCENTAGE_FIELDS.forEach((field) => {
    const value = match[field];

    if (value === null || value === undefined) return;

    if (typeof value === 'number' && (value < 0 || value > 100)) {
      addIssue(
        issues,
        'error',
        match.id || 'UNKNOWN_MATCH_ID',
        field,
        `Field "${field}" must be between 0 and 100.`
      );
    }
  });
}

function validateTeamAndOpponent(match, issues) {
  if (!isBlank(match.team) && !isBlank(match.opponent) && match.team === match.opponent) {
    addIssue(
      issues,
      'error',
      match.id || 'UNKNOWN_MATCH_ID',
      'opponent',
      'team and opponent must not be the same.'
    );
  }
}

function validateSourceFields(match, issues) {
  if (!isBlank(match.sourceUrl) && typeof match.sourceUrl === 'string') {
    const looksLikeUrl =
      match.sourceUrl.startsWith('http://') || match.sourceUrl.startsWith('https://');

    if (!looksLikeUrl) {
      addIssue(
        issues,
        'warning',
        match.id || 'UNKNOWN_MATCH_ID',
        'sourceUrl',
        'sourceUrl should start with http:// or https://.'
      );
    }
  }

  if (match.sourceProvider === 'Sample data' && match.sourceUrl.includes('example.com')) {
    addIssue(
      issues,
      'warning',
      match.id || 'UNKNOWN_MATCH_ID',
      'sourceUrl',
      'This record still uses an example.com sample URL.'
    );
  }
}

function validateDuplicateIds(matches, issues) {
  const seen = new Map();

  matches.forEach((match, index) => {
    const id = match.id;

    if (isBlank(id)) return;

    if (seen.has(id)) {
      addIssue(
        issues,
        'error',
        id,
        'id',
        `Duplicate match id "${id}" found at indexes ${seen.get(id)} and ${index}.`
      );
    } else {
      seen.set(id, index);
    }
  });
}

export function validateMatch(match) {
  const issues = [];

  if (!match || typeof match !== 'object') {
    addIssue(
      issues,
      'error',
      'UNKNOWN_MATCH_ID',
      'match',
      'Match record must be an object.'
    );

    return {
      valid: false,
      errors: issues.filter((issue) => issue.severity === 'error'),
      warnings: issues.filter((issue) => issue.severity === 'warning'),
      issues,
    };
  }

  validateRequiredFields(match, issues);
  validateExternalIds(match, issues);
  validateEnums(match, issues);
  validateDates(match, issues);
  validateNumericFields(match, issues);
  validatePercentageFields(match, issues);
  validateTeamAndOpponent(match, issues);
  validateSourceFields(match, issues);

  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    issues,
  };
}

export function validateMatches(matches) {
  const issues = [];

  if (!Array.isArray(matches)) {
    addIssue(
      issues,
      'error',
      'UNKNOWN_MATCH_ID',
      'matches',
      'Input must be an array of match records.'
    );

    return {
      valid: false,
      totalMatches: 0,
      errorCount: 1,
      warningCount: 0,
      errors: issues,
      warnings: [],
      issues,
    };
  }

  validateDuplicateIds(matches, issues);

  matches.forEach((match) => {
    const result = validateMatch(match);
    issues.push(...result.issues);
  });

  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');

  return {
    valid: errors.length === 0,
    totalMatches: matches.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
    issues,
  };
}

export function summarizeValidation(result) {
  if (!result) {
    return 'No validation result.';
  }

  if (result.valid) {
    if (result.warningCount > 0) {
      return `Validation passed with ${result.warningCount} warning(s).`;
    }

    return 'Validation passed with no errors or warnings.';
  }

  return `Validation failed with ${result.errorCount} error(s) and ${result.warningCount} warning(s).`;
}
