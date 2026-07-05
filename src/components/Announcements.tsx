import { AnnouncementTeaser } from '@/components/announcements/AnnouncementFeed';
import { usePublishedAnnouncements } from '@/hooks/useAnnouncements';

/** Landing-page announcements teaser — links to full /announcements feed. */
export const Announcements = () => {
  const { announcements, loading } = usePublishedAnnouncements();
  return <AnnouncementTeaser announcements={announcements} loading={loading} />;
};
