import { getYouTubeVideoId } from './videoUtils.js';

export const ALLOWED_VIDEO_PROVIDERS = Object.freeze([
  'YouTube',
  'Vimeo',
  'World Rugby',
  'Rugby Australia',
  'RugbyPass',
  'Other',
]);

export const ALLOWED_VIDEO_TYPES = Object.freeze([
  'full_match',
  'extended_highlights',
  'highlights',
  'analysis',
  'short_clip',
  'external_page',
  'unknown',
]);

export const ALLOWED_VIDEO_AVAILABILITY = Object.freeze([
  'available',
  'not_available',
  'not_checked',
  'geo_restricted',
  'login_required',
  'removed',
  'broken_link',
  'unknown',
]);

export const ALLOWED_VIDEO_DATA_TYPES = Object.freeze(['real', 'sample']);

const REQUIRED_FIELDS = Object.freeze([
  'id',
  'matchId',
  'videoProvider',
  'videoType',
  'availability',
  'checkedAt',
  'dataType',
]);

function isBlank(value) {
  return value === undefined || value === null || value === '';
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isValidIsoDateTime(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function parseHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function normalizeUrlKey(value, provider) {
  const parsed = parseHttpUrl(value);

  if (!parsed) {
    return null;
  }

  if (provider === 'YouTube') {
    const youtubeId = getYouTubeVideoId(value);

    if (youtubeId) {
      return `youtube:${youtubeId}`;
    }
  }

  parsed.hash = '';
  parsed.hostname = parsed.hostname.toLowerCase();

  if (parsed.pathname !== '/') {
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  }

  return parsed.toString();
}

function addIssue(issues, severity, videoId, field, message) {
  issues.push({
    severity,
    videoId: videoId || 'UNKNOWN_VIDEO_ID',
    field,
    message,
  });
}

function validateRequiredFields(video, issues) {
  REQUIRED_FIELDS.forEach((field) => {
    if (isBlank(video[field])) {
      addIssue(
        issues,
        'error',
        video.id,
        field,
        `Required field "${field}" is missing.`
      );
    }
  });
}

function validateEnums(video, issues) {
  if (
    !isBlank(video.videoProvider) &&
    !ALLOWED_VIDEO_PROVIDERS.includes(video.videoProvider)
  ) {
    addIssue(
      issues,
      'error',
      video.id,
      'videoProvider',
      `Invalid videoProvider "${video.videoProvider}". Allowed values: ${ALLOWED_VIDEO_PROVIDERS.join(', ')}.`
    );
  }

  if (
    !isBlank(video.videoType) &&
    !ALLOWED_VIDEO_TYPES.includes(video.videoType)
  ) {
    addIssue(
      issues,
      'error',
      video.id,
      'videoType',
      `Invalid videoType "${video.videoType}". Allowed values: ${ALLOWED_VIDEO_TYPES.join(', ')}.`
    );
  }

  if (
    !isBlank(video.availability) &&
    !ALLOWED_VIDEO_AVAILABILITY.includes(video.availability)
  ) {
    addIssue(
      issues,
      'error',
      video.id,
      'availability',
      `Invalid availability "${video.availability}". Allowed values: ${ALLOWED_VIDEO_AVAILABILITY.join(', ')}.`
    );
  }

  if (
    !isBlank(video.dataType) &&
    !ALLOWED_VIDEO_DATA_TYPES.includes(video.dataType)
  ) {
    addIssue(
      issues,
      'error',
      video.id,
      'dataType',
      `Invalid dataType "${video.dataType}". Allowed values: ${ALLOWED_VIDEO_DATA_TYPES.join(', ')}.`
    );
  }
}

function validateDates(video, issues) {
  if (!isBlank(video.checkedAt) && !isValidIsoDateTime(video.checkedAt)) {
    addIssue(
      issues,
      'error',
      video.id,
      'checkedAt',
      'checkedAt must be a valid ISO datetime string.'
    );
  }

  if (!isBlank(video.publishedAt) && !isValidIsoDateTime(video.publishedAt)) {
    addIssue(
      issues,
      'error',
      video.id,
      'publishedAt',
      'publishedAt must be null or a valid ISO datetime string.'
    );
  }
}

function validateUrls(video, issues) {
  const videoUrl = parseHttpUrl(video.videoUrl);
  const sourcePageUrl = parseHttpUrl(video.sourcePageUrl);

  if (!isBlank(video.videoUrl) && !videoUrl) {
    addIssue(
      issues,
      'error',
      video.id,
      'videoUrl',
      'videoUrl must be a valid http:// or https:// URL.'
    );
  }

  if (!isBlank(video.sourcePageUrl) && !sourcePageUrl) {
    addIssue(
      issues,
      'error',
      video.id,
      'sourcePageUrl',
      'sourcePageUrl must be a valid http:// or https:// URL.'
    );
  }

  if (
    video.videoProvider === 'YouTube' &&
    !isBlank(video.videoUrl) &&
    !getYouTubeVideoId(video.videoUrl)
  ) {
    addIssue(
      issues,
      'error',
      video.id,
      'videoUrl',
      'YouTube records must use a supported YouTube watch, youtu.be, embed, shorts, or live URL.'
    );
  }
}

function validateAvailabilityConsistency(video, issues) {
  if (video.availability === 'available' && isBlank(video.videoUrl)) {
    addIssue(
      issues,
      'error',
      video.id,
      'videoUrl',
      'An available video must have a videoUrl.'
    );
  }

  if (video.availability === 'not_available' && !isBlank(video.videoUrl)) {
    addIssue(
      issues,
      'error',
      video.id,
      'videoUrl',
      'A not_available record must not have a videoUrl.'
    );
  }

  if (video.embedAllowed === true && video.availability !== 'available') {
    addIssue(
      issues,
      'warning',
      video.id,
      'embedAllowed',
      'embedAllowed is true, but availability is not available.'
    );
  }
}

function validateOptionalFieldTypes(video, issues) {
  if (
    video.durationSeconds !== null &&
    video.durationSeconds !== undefined &&
    (!Number.isInteger(video.durationSeconds) || video.durationSeconds < 0)
  ) {
    addIssue(
      issues,
      'error',
      video.id,
      'durationSeconds',
      'durationSeconds must be a non-negative integer or null.'
    );
  }

  if (
    video.embedAllowed !== null &&
    video.embedAllowed !== undefined &&
    typeof video.embedAllowed !== 'boolean'
  ) {
    addIssue(
      issues,
      'error',
      video.id,
      'embedAllowed',
      'embedAllowed must be true, false, or null.'
    );
  }

  if (
    video.geoRestriction !== null &&
    video.geoRestriction !== undefined &&
    (!Array.isArray(video.geoRestriction) ||
      video.geoRestriction.some(
        (countryCode) => typeof countryCode !== 'string' || !countryCode.trim()
      ))
  ) {
    addIssue(
      issues,
      'error',
      video.id,
      'geoRestriction',
      'geoRestriction must be null or an array of non-empty country or region codes.'
    );
  }

  if (
    !isBlank(video.language) &&
    (typeof video.language !== 'string' ||
      !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(video.language))
  ) {
    addIssue(
      issues,
      'warning',
      video.id,
      'language',
      'language should use a code such as ja, en, or en-AU.'
    );
  }

  if (!isBlank(video.title) && typeof video.title !== 'string') {
    addIssue(
      issues,
      'error',
      video.id,
      'title',
      'title must be a string or null.'
    );
  }

  if (isBlank(video.title) && video.availability === 'available') {
    addIssue(
      issues,
      'warning',
      video.id,
      'title',
      'An available video should have a display title.'
    );
  }
}

function validateDuplicateIds(videos, issues) {
  const seen = new Map();

  videos.forEach((video, index) => {
    if (!isPlainObject(video) || isBlank(video.id)) {
      return;
    }

    if (seen.has(video.id)) {
      addIssue(
        issues,
        'error',
        video.id,
        'id',
        `Duplicate video id "${video.id}" found at indexes ${seen.get(video.id)} and ${index}.`
      );
      return;
    }

    seen.set(video.id, index);
  });
}

function validateDuplicateUrls(videos, issues) {
  const seen = new Map();

  videos.forEach((video, index) => {
    if (!isPlainObject(video) || isBlank(video.videoUrl)) {
      return;
    }

    const key = normalizeUrlKey(video.videoUrl, video.videoProvider);

    if (!key) {
      return;
    }

    if (seen.has(key)) {
      const first = seen.get(key);
      addIssue(
        issues,
        'error',
        video.id,
        'videoUrl',
        `Duplicate video URL found at indexes ${first.index} (${first.id}) and ${index} (${video.id || 'UNKNOWN_VIDEO_ID'}).`
      );
      return;
    }

    seen.set(key, {
      index,
      id: video.id || 'UNKNOWN_VIDEO_ID',
    });
  });
}

function validateMatchReferences(videos, matches, issues) {
  const matchById = new Map(
    matches
      .filter(isPlainObject)
      .filter((match) => !isBlank(match.id))
      .map((match) => [match.id, match])
  );

  videos.forEach((video) => {
    if (!isPlainObject(video) || isBlank(video.matchId)) {
      return;
    }

    const match = matchById.get(video.matchId);

    if (!match) {
      addIssue(
        issues,
        'error',
        video.id,
        'matchId',
        `matchId "${video.matchId}" does not exist in matches.json.`
      );
      return;
    }

    if (!isBlank(video.externalMatchId) && isPlainObject(match.external)) {
      const externalIds = Object.values(match.external)
        .filter((value) => !isBlank(value))
        .map(String);

      if (
        externalIds.length > 0 &&
        !externalIds.includes(String(video.externalMatchId))
      ) {
        addIssue(
          issues,
          'warning',
          video.id,
          'externalMatchId',
          `externalMatchId "${video.externalMatchId}" does not match the referenced match external IDs: ${externalIds.join(', ')}.`
        );
      }
    }
  });
}

export function validateVideo(video) {
  const issues = [];

  if (!isPlainObject(video)) {
    addIssue(
      issues,
      'error',
      'UNKNOWN_VIDEO_ID',
      'video',
      'Video record must be an object.'
    );

    return {
      valid: false,
      errorCount: 1,
      warningCount: 0,
      errors: issues,
      warnings: [],
      issues,
    };
  }

  validateRequiredFields(video, issues);
  validateEnums(video, issues);
  validateDates(video, issues);
  validateUrls(video, issues);
  validateAvailabilityConsistency(video, issues);
  validateOptionalFieldTypes(video, issues);

  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');

  return {
    valid: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
    issues,
  };
}

export function validateVideos(videos, matches = []) {
  const issues = [];

  if (!Array.isArray(videos)) {
    addIssue(
      issues,
      'error',
      'UNKNOWN_VIDEO_ID',
      'videos',
      'videos.json must contain an array of video records.'
    );
  }

  if (!Array.isArray(matches)) {
    addIssue(
      issues,
      'error',
      'UNKNOWN_VIDEO_ID',
      'matches',
      'matches.json must contain an array of match records.'
    );
  }

  if (!Array.isArray(videos) || !Array.isArray(matches)) {
    const errors = issues.filter((issue) => issue.severity === 'error');

    return {
      valid: false,
      totalVideos: Array.isArray(videos) ? videos.length : 0,
      totalMatches: Array.isArray(matches) ? matches.length : 0,
      errorCount: errors.length,
      warningCount: 0,
      errors,
      warnings: [],
      issues,
    };
  }

  validateDuplicateIds(videos, issues);
  validateDuplicateUrls(videos, issues);
  validateMatchReferences(videos, matches, issues);

  videos.forEach((video) => {
    const result = validateVideo(video);
    issues.push(...result.issues);
  });

  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');

  return {
    valid: errors.length === 0,
    totalVideos: videos.length,
    totalMatches: matches.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
    issues,
  };
}

export function summarizeVideoValidation(result) {
  if (!result) {
    return 'No video validation result.';
  }

  const recordSummary = `${result.totalVideos ?? 0} video record(s), ${result.totalMatches ?? 0} match record(s)`;

  if (result.valid) {
    if (result.warningCount > 0) {
      return `Video validation passed: ${recordSummary}, ${result.warningCount} warning(s).`;
    }

    return `Video validation passed: ${recordSummary}, no errors or warnings.`;
  }

  return `Video validation failed: ${recordSummary}, ${result.errorCount} error(s), ${result.warningCount} warning(s).`;
}
