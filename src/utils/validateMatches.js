import {
  CANONICAL_COVERAGE_LEVELS,
  CANONICAL_DATA_TYPES,
  CANONICAL_GENDERS,
  CANONICAL_NUMERIC_FIELDS,
  CANONICAL_PERCENTAGE_FIELDS,
  CANONICAL_REQUIRED_FIELDS,
  CANONICAL_RESULTS,
} from '../data/schema/canonicalMatchSchema.js';

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
  CANONICAL_REQUIRED_FIELDS.forEach((field) => {
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
  if (!isBlank(match.gender) && !CANONICAL_GENDERS.includes(match.gender)) {
    addIssue(
      issues,
      'error',
      match.id || 'UNKNOWN_MATCH_ID',
      'gender',
      `Invalid gender "${match.gender}". Allowed values: ${CANONICAL_GENDERS.join(', ')}.`
    );
  }

  if (!isBlank(match.result) && !CANONICAL_RESULTS.includes(match.result)) {
    addIssue(
      issues,
      'error',
      match.id || 'UNKNOWN_MATCH_ID',
      'result',
      `Invalid result "${match.result}". Allowed values: ${CANONICAL_RESULTS.join(', ')}.`
    );
  }

  if (
    !isBlank(match.dataCoverageLevel) &&
    !CANONICAL_COVERAGE_LEVELS.includes(match.dataCoverageLevel)
  ) {
    addIssue(
      issues,
      'error',
      match.id || 'UNKNOWN_MATCH_ID',
      'dataCoverageLevel',
      `Invalid dataCoverageLevel "${match.dataCoverageLevel}". Allowed values: ${CANONICAL_COVERAGE_LEVELS.join(', ')}.`
    );
  }

  if (!isBlank(match.dataType) && !CANONICAL_DATA_TYPES.includes(match.dataType)) {
    addIssue(
      issues,
      'error',
      match.id || 'UNKNOWN_MATCH_ID',
      'dataType',
      `Invalid dataType "${match.dataType}". Allowed values: ${CANONICAL_DATA_TYPES.join(', ')}.`
    );
  }
}

function validateCompatibilityFields(match, issues) {
  if (
    !isBlank(match.teamResult) &&
    !isBlank(match.result) &&
    match.teamResult !== match.result
  ) {
    addIssue(
      issues,
      'warning',
      match.id || 'UNKNOWN_MATCH_ID',
      'teamResult',
      'teamResult differs from canonical result. The canonical source of truth is result.'
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
  CANONICAL_NUMERIC_FIELDS.forEach((field) => {
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
  CANONICAL_PERCENTAGE_FIELDS.forEach((field) => {
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

  if (
    match.sourceProvider === 'Sample data' &&
    typeof match.sourceUrl === 'string' &&
    match.sourceUrl.includes('example.com')
  ) {
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
  validateCompatibilityFields(match, issues);
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
