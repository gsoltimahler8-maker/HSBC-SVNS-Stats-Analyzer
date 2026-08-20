import {
  CANONICAL_EXTERNAL_ID_FIELDS,
  CANONICAL_NULLABLE_STAT_FIELDS,
} from '../schema/canonicalMatchSchema.js';

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function normalizeExternalIds(external) {
  const source = isRecord(external) ? external : {};
  const normalized = { ...source };

  CANONICAL_EXTERNAL_ID_FIELDS.forEach((field) => {
    if (normalized[field] === undefined || normalized[field] === '') {
      normalized[field] = null;
    }
  });

  return normalized;
}

function normalizeNullableStats(record) {
  const normalized = { ...record };

  CANONICAL_NULLABLE_STAT_FIELDS.forEach((field) => {
    if (normalized[field] === undefined || normalized[field] === '') {
      normalized[field] = null;
    }
  });

  return normalized;
}

/**
 * Adapts one provider record into the application's canonical team-match shape.
 *
 * v1.1-07 establishes two non-destructive normalization rules:
 * - known external-ID keys are always present and use null when unavailable;
 * - known nullable raw-stat fields are always present and use null when unavailable.
 *
 * Existing fields are otherwise preserved so the public application keeps the
 * same behavior. Provider-specific renaming/mapping belongs in provider-specific
 * adapters before records reach this canonical boundary.
 */
export function adaptMatchRecord(rawMatch, context = {}) {
  if (!isRecord(rawMatch)) {
    const providerLabel = context.providerId
      ? ` from provider "${context.providerId}"`
      : '';

    throw new TypeError(`Invalid match record${providerLabel}.`);
  }

  const normalized = normalizeNullableStats(rawMatch);

  return {
    ...normalized,
    external: normalizeExternalIds(rawMatch.external),
  };
}

/**
 * Converts a provider collection into canonical application records.
 */
export function adaptMatchCollection(rawMatches, context = {}) {
  if (!Array.isArray(rawMatches)) {
    const providerLabel = context.providerId
      ? ` from provider "${context.providerId}"`
      : '';

    throw new TypeError(`Match provider returned a non-array value${providerLabel}.`);
  }

  return rawMatches.map((rawMatch) => adaptMatchRecord(rawMatch, context));
}
