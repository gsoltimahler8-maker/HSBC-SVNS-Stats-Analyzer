import { adaptMatchCollection } from './adapters/canonicalMatchAdapter.js';
import { staticJsonMatchProvider } from './providers/staticJsonMatchProvider.js';

/**
 * Loads match records through a provider boundary and adapts them into the
 * application's canonical match shape.
 *
 * The default provider preserves the current bundled matches.json behavior.
 */
export function loadMatches(provider = staticJsonMatchProvider) {
  if (!provider || typeof provider.loadMatches !== 'function') {
    throw new TypeError('A match provider with loadMatches() is required.');
  }

  const rawMatches = provider.loadMatches();

  return adaptMatchCollection(rawMatches, {
    providerId: provider.id || 'unknown',
  });
}

export const matchData = loadMatches();
