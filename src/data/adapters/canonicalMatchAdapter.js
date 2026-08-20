const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Adapts one provider record into the application's canonical match shape.
 *
 * v1.1-06 intentionally preserves every existing field so that the public
 * application behaves exactly as before. Field-by-field canonicalisation,
 * type/nullability rules and schema reconciliation belong to v1.1-07.
 */
export function adaptMatchRecord(rawMatch, context = {}) {
  if (!isRecord(rawMatch)) {
    const providerLabel = context.providerId
      ? ` from provider "${context.providerId}"`
      : '';

    throw new TypeError(`Invalid match record${providerLabel}.`);
  }

  return {
    ...rawMatch,
    external: isRecord(rawMatch.external) ? { ...rawMatch.external } : {},
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
