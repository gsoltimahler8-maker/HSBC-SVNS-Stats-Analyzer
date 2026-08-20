export function compareMatchesChronologically(a, b) {
  const dateDifference = new Date(a.date) - new Date(b.date);

  if (dateDifference !== 0) {
    return dateDifference;
  }

  const aExternalId = Number(a.external?.rugbyComAu);
  const bExternalId = Number(b.external?.rugbyComAu);

  if (
    Number.isFinite(aExternalId) &&
    Number.isFinite(bExternalId) &&
    aExternalId !== bExternalId
  ) {
    return aExternalId - bExternalId;
  }

  return String(a.id).localeCompare(String(b.id));
}

export function getTeamResult(match) {
  return match?.teamResult || match?.result || '';
}

export function groupMatches(matches, keyGetter) {
  const groups = new Map();

  matches.forEach((match) => {
    const key = keyGetter(match);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(match);
  });

  return groups;
}

export function getUniqueValues(matches, key) {
  return [...new Set(matches.map((match) => match[key]).filter(Boolean))];
}
