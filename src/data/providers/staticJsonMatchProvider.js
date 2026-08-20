import matches from '../matches.json';

export const STATIC_JSON_MATCH_PROVIDER_ID = 'static-json';

/**
 * Current production match-data provider.
 *
 * The provider owns source access only. It deliberately does not expose
 * analytics or UI concerns. Future providers can implement the same
 * synchronous loadMatches() boundary while the current static client
 * architecture remains in place.
 */
export const staticJsonMatchProvider = Object.freeze({
  id: STATIC_JSON_MATCH_PROVIDER_ID,

  loadMatches() {
    return matches;
  },
});
