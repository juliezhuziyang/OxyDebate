export interface DebateGuide {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  video_path: string | null;
  text_path: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by_user_id: string;
}

export function getGuideYouTubeUrl(guide: DebateGuide): string | null {
  if (guide.youtube_url?.trim()) return guide.youtube_url.trim();
  if (guide.video_path?.includes('youtube.com') || guide.video_path?.includes('youtu.be')) {
    return guide.video_path;
  }
  return null;
}
