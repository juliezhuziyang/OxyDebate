const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

export function extractYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (YOUTUBE_ID_PATTERN.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.slice(1).split('/')[0];
      return YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtube-nocookie.com')) {
      const v = parsed.searchParams.get('v');
      if (v && YOUTUBE_ID_PATTERN.test(v)) return v;

      const embedMatch = parsed.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/);
      if (embedMatch) return embedMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export function getYouTubeThumbnail(
  videoId: string,
  quality: 'max' | 'hq' | 'mq' | 'default' = 'hq'
): string {
  const map = {
    max: 'maxresdefault',
    hq: 'hqdefault',
    mq: 'mqdefault',
    default: 'default',
  } as const;
  return `https://img.youtube.com/vi/${videoId}/${map[quality]}.jpg`;
}

export function normalizeYouTubeUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? getYouTubeWatchUrl(videoId) : null;
}
