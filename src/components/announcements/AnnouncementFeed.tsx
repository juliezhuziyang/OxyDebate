import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SkeletonBlock } from '@/components/ui/page-loader';
import type { Announcement } from '@/types/announcement';
import {
  formatAnnouncementDateShort,
  getAnnouncementPreview,
  getDisplayContent,
} from '@/utils/announcementContent';
import { ArrowRight, Bell, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { PageHero } from '@/components/PageHero';

interface AnnouncementFeedProps {
  announcements: Announcement[];
  loading: boolean;
  isAdmin: boolean;
  onCreateClick?: () => void;
}

export const AnnouncementFeed = ({
  announcements,
  loading,
  isAdmin,
  onCreateClick,
}: AnnouncementFeedProps) => {
  const [search, setSearch] = useState('');
  const published = announcements.filter((a) => a.is_published);
  const featured = published[0];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = isAdmin
      ? announcements
      : announcements.filter((a) => a.is_published);
    if (!q) return list;
    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        getAnnouncementPreview(getDisplayContent(a)).toLowerCase().includes(q)
    );
  }, [announcements, isAdmin, search]);

  return (
    <div className="space-y-10 md:space-y-12 animate-fade-in">
      <PageHero
        eyebrow="Community updates"
        title="Announcements"
        description="News, updates, and important information from the Oxymorona Debate team — written for you to read, not skim."
        actions={
          isAdmin && onCreateClick ? (
            <Button onClick={onCreateClick} className="gap-2">
              <Plus className="w-4 h-4" />
              New announcement
            </Button>
          ) : undefined
        }
      />

      {published.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyFeed isAdmin={isAdmin} onCreateClick={onCreateClick} hasSearch={!!search.trim()} />
      ) : (
        <>
          {featured && !search && (
            <FeaturedPost announcement={featured} />
          )}

          <section aria-label="All announcements">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              {search ? 'Search results' : 'Latest updates'}
            </h2>
            <div className="space-y-4">
              {(search ? filtered : filtered.slice(featured ? 1 : 0)).map((a, index) => (
                <FeedItem key={a.id} announcement={a} isAdmin={isAdmin} index={index} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const EmptyFeed = ({
  isAdmin,
  onCreateClick,
  hasSearch,
}: {
  isAdmin: boolean;
  onCreateClick?: () => void;
  hasSearch: boolean;
}) => (
  <div className="text-center py-16 md:py-24 rounded-2xl border border-dashed border-border bg-muted/20">
    <Bell className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
    <h2 className="text-xl font-semibold mb-2">
      {hasSearch ? 'No matching announcements' : 'No announcements yet'}
    </h2>
    <p className="text-muted-foreground max-w-md mx-auto mb-6">
      {hasSearch
        ? 'Try a different search term.'
        : isAdmin
          ? 'Publish your first update to keep the community informed.'
          : 'Check back soon for news and updates from the team.'}
    </p>
    {isAdmin && onCreateClick && !hasSearch && (
      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="w-4 h-4" />
        Create announcement
      </Button>
    )}
  </div>
);

const FeaturedPost = ({ announcement }: { announcement: Announcement }) => (
  <Link
    to={`/announcements/${announcement.id}`}
    className="group block rounded-2xl border border-border bg-card overflow-hidden shadow-elevated-lg hover:border-primary/30 transition-all"
  >
    <div className="p-6 md:p-8">
      <Badge variant="secondary" className="mb-3">
        Latest
      </Badge>
      <time className="text-sm text-muted-foreground block mb-2">
        {formatAnnouncementDateShort(announcement.published_at)}
      </time>
      <h2 className="text-2xl md:text-3xl font-bold font-playfair mb-3 group-hover:text-primary transition-colors">
        {announcement.title}
      </h2>
      <p className="text-muted-foreground leading-relaxed line-clamp-3 max-w-3xl">
        {getAnnouncementPreview(getDisplayContent(announcement), 220)}
      </p>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-5">
        Read full announcement <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </div>
  </Link>
);

const FeedItem = ({
  announcement,
  isAdmin,
  index,
}: {
  announcement: Announcement;
  isAdmin: boolean;
  index: number;
}) => (
  <Link
    to={`/announcements/${announcement.id}`}
    className={cn(
      'group block rounded-2xl border border-border bg-card p-5 md:p-6',
      'hover:border-primary/30 hover:shadow-md transition-all duration-200'
    )}
    style={{ animationDelay: `${index * 0.04}s` }}
  >
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
      <time className="text-sm text-muted-foreground shrink-0">
        {formatAnnouncementDateShort(announcement.published_at)}
      </time>
      {isAdmin && !announcement.is_published && (
        <Badge variant="outline" className="w-fit">Draft</Badge>
      )}
    </div>
    <h3 className="text-xl font-semibold font-playfair mb-2 group-hover:text-primary transition-colors">
      {announcement.title}
    </h3>
    <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-2">
      {getAnnouncementPreview(getDisplayContent(announcement))}
    </p>
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-4 opacity-80 group-hover:opacity-100">
      Read more <ArrowRight className="w-3.5 h-3.5" />
    </span>
  </Link>
);

/** Compact teaser for the landing page */
export const AnnouncementTeaser = ({
  announcements,
  loading,
}: {
  announcements: Announcement[];
  loading: boolean;
}) => {
  const latest = announcements.filter((a) => a.is_published).slice(0, 3);

  return (
    <section id="announcements" className="container mx-auto px-4 py-16 md:py-24 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="editorial-eyebrow mb-2">Stay informed</p>
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Latest announcements</h2>
        </div>
        <Button variant="outline" asChild className="gap-2 shrink-0">
          <Link to="/announcements">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : latest.length === 0 ? (
        <p className="text-muted-foreground text-sm">No announcements yet. Check back soon.</p>
      ) : (
        <div className="space-y-3">
          {latest.map((a) => (
            <Link
              key={a.id}
              to={`/announcements/${a.id}`}
              className="group block border border-border bg-card p-4 md:p-5 hover:border-primary/30 transition-all"
            >
              <time className="text-xs text-muted-foreground">
                {formatAnnouncementDateShort(a.published_at)}
              </time>
              <h3 className="font-semibold mt-1 group-hover:text-primary transition-colors">
                {a.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {getAnnouncementPreview(getDisplayContent(a))}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
