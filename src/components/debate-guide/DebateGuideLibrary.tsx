import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SkeletonBlock } from '@/components/ui/page-loader';
import type { DebateGuide } from '@/types/debateGuide';
import { getGuideYouTubeUrl } from '@/types/debateGuide';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/utils/youtube';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Plus,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHero } from '@/components/PageHero';

interface DebateGuideLibraryProps {
  guides: DebateGuide[];
  loading: boolean;
  isAdmin: boolean;
  onOpenGuide: (id: string) => void;
  onCreateGuide: () => void;
}

export const DebateGuideLibrary = ({
  guides,
  loading,
  isAdmin,
  onOpenGuide,
  onCreateGuide,
}: DebateGuideLibraryProps) => {
  const [search, setSearch] = useState('');

  const visibleGuides = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        (g.description?.toLowerCase().includes(q) ?? false)
    );
  }, [guides, search]);

  const publishedCount = guides.filter((g) => g.is_published).length;
  const featured = visibleGuides[0];

  return (
    <div className="space-y-10 md:space-y-14 animate-fade-in">
      <PageHero
        eyebrow="Debate Guide Library"
        title="Learn debate, one topic at a time"
        description="Curated video lessons with study notes — built for curious debaters who want to go deeper."
        actions={
          <>
            {!loading && publishedCount > 0 && (
              <p className="text-sm text-muted-foreground self-center mr-2">
                {publishedCount} {publishedCount === 1 ? 'topic' : 'topics'} ready
              </p>
            )}
            {isAdmin && (
              <Button onClick={onCreateGuide} size="lg" className="gap-2 shrink-0">
                <Plus className="w-5 h-5" />
                New guide
              </Button>
            )}
          </>
        }
      />

      {/* Search */}
      {guides.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : guides.length === 0 ? (
        <EmptyLibrary isAdmin={isAdmin} onCreateGuide={onCreateGuide} />
      ) : visibleGuides.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No topics match &ldquo;{search}&rdquo;
        </div>
      ) : (
        <>
          {/* Featured topic */}
          {featured && !search && (
            <FeaturedGuideCard guide={featured} onOpen={() => onOpenGuide(featured.id)} />
          )}

          {/* Topic grid */}
          <section>
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {search ? 'Search results' : 'All topics'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(search ? visibleGuides : visibleGuides.slice(featured ? 1 : 0)).map((guide, index) => (
                <GuideTopicCard
                  key={guide.id}
                  guide={guide}
                  isAdmin={isAdmin}
                  index={index}
                  onOpen={() => onOpenGuide(guide.id)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const EmptyLibrary = ({
  isAdmin,
  onCreateGuide,
}: {
  isAdmin: boolean;
  onCreateGuide: () => void;
}) => (
  <div className="text-center py-16 md:py-24 rounded-2xl border border-dashed border-border bg-muted/20">
    <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
    <h2 className="text-xl font-semibold mb-2">The library is waiting for its first topic</h2>
    <p className="text-muted-foreground max-w-md mx-auto mb-6">
      {isAdmin
        ? 'Create your first guide with a YouTube video and learning notes — it only takes a minute.'
        : 'Check back soon for curated debate lessons and study materials.'}
    </p>
    {isAdmin && (
      <Button onClick={onCreateGuide} className="gap-2">
        <Plus className="w-4 h-4" />
        Create first guide
      </Button>
    )}
  </div>
);

const FeaturedGuideCard = ({
  guide,
  onOpen,
}: {
  guide: DebateGuide;
  onOpen: () => void;
}) => {
  const youtubeUrl = getGuideYouTubeUrl(guide);
  const videoId = youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : null;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-elevated-lg cursor-pointer transition-all hover:border-primary/30"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    >
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-video md:aspect-auto md:min-h-[280px] overflow-hidden bg-muted">
          {videoId ? (
            <img
              src={getYouTubeThumbnail(videoId, 'hq')}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No preview
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:bg-gradient-to-t md:from-black/50" />
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <Badge variant="secondary" className="w-fit mb-3">Featured</Badge>
          <h2 className="text-2xl md:text-3xl font-bold font-playfair mb-3 group-hover:text-primary transition-colors">
            {guide.title}
          </h2>
          {guide.description && (
            <p className="text-muted-foreground line-clamp-3 leading-relaxed mb-5">
              {guide.description}
            </p>
          )}
          <Button variant="outline" className="w-fit gap-2 group-hover:border-primary group-hover:text-primary">
            Start learning <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </article>
  );
};

const GuideTopicCard = ({
  guide,
  isAdmin,
  index,
  onOpen,
}: {
  guide: DebateGuide;
  isAdmin: boolean;
  index: number;
  onOpen: () => void;
}) => {
  const youtubeUrl = getGuideYouTubeUrl(guide);
  const videoId = youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : null;

  return (
    <article
      className={cn(
        'group flex flex-col rounded-2xl border border-border bg-card overflow-hidden',
        'shadow-sm hover:shadow-elevated-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer'
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {videoId ? (
          <img
            src={getYouTubeThumbnail(videoId, 'mq')}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
            Video lesson
          </div>
        )}
        {isAdmin && !guide.is_published && (
          <Badge className="absolute top-3 left-3" variant="outline">Draft</Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {guide.title}
        </h3>
        {guide.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
            {guide.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/60 italic flex-1">Open to watch and learn</p>
        )}
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          Open topic <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </article>
  );
};
