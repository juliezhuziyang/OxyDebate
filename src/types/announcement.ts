export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
  created_by_user_id?: string;
}
