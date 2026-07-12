export const VIDEO_TYPE_PRIORITY = Object.freeze({
  full_match: 1,
  extended_highlights: 2,
  highlights: 3,
  analysis: 4,
  short_clip: 5,
  external_page: 6,
  unknown: 7,
});

export function getVideoAvailability(videos = []) {
  if (!videos.length) {
    return 'not_checked';
  }

  if (videos.some((video) => video.availability === 'available')) {
    return 'available';
  }

  if (videos.some((video) => video.availability === 'login_required')) {
    return 'login_required';
  }

  if (videos.some((video) => video.availability === 'geo_restricted')) {
    return 'geo_restricted';
  }

  if (videos.every((video) => video.availability === 'removed')) {
    return 'removed';
  }

  if (videos.every((video) => video.availability === 'not_available')) {
    return 'not_available';
  }

  if (videos.some((video) => video.availability === 'broken_link')) {
    return 'broken_link';
  }

  return videos[0]?.availability || 'unknown';
}

export function sortVideos(videos = []) {
  return [...videos].sort((a, b) => {
    const aPriority = VIDEO_TYPE_PRIORITY[a.videoType] || 99;
    const bPriority = VIDEO_TYPE_PRIORITY[b.videoType] || 99;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return String(a.id || '').localeCompare(String(b.id || ''));
  });
}

export function getYouTubeVideoId(videoUrl) {
  if (!videoUrl) {
    return null;
  }

  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || null;
    }

    if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'music.youtube.com'
    ) {
      if (url.pathname === '/watch') {
        return url.searchParams.get('v');
      }

      const pathParts = url.pathname.split('/').filter(Boolean);

      if (
        ['embed', 'shorts', 'live'].includes(pathParts[0]) &&
        pathParts[1]
      ) {
        return pathParts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeEmbedUrl(video) {
  if (
    !video ||
    video.embedAllowed === false ||
    video.availability !== 'available'
  ) {
    return null;
  }

  const videoId = getYouTubeVideoId(video.videoUrl);

  if (!videoId) {
    return null;
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}
