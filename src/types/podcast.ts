export interface Podcast {
  id: string;
  title: string;
  youtube_url: string;
  script: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by_user_id: string;
}

export function getPodcastYouTubeUrl(podcast: Podcast): string | null {
  const url = podcast.youtube_url?.trim();
  return url || null;
}
