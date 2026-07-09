import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SkeletonBlock } from '@/components/ui/page-loader';
import { PageHero } from '@/components/PageHero';
import type { Podcast } from '@/types/podcast';
import { getPodcastYouTubeUrl } from '@/types/podcast';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/utils/youtube';
import { ArrowRight, Headphones, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PodcastLibraryProps {
  podcasts: Podcast[];
  loading: boolean;
  isAdmin: boolean;
  onOpenPodcast: (id: string) => void;
  onCreatePodcast: () => void;
}

export const PodcastLibrary = ({
  podcasts,
  loading,
  isAdmin,
  onOpenPodcast,
  onCreatePodcast,
}: PodcastLibraryProps) => {
  const [search, setSearch] = useState('');

  const visiblePodcasts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return podcasts;
    return podcasts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.script?.toLowerCase().includes(q) ?? false)
    );
  }, [podcasts, search]);

  const publishedCount = podcasts.filter((p) => p.is_published).length;
  const featured = visiblePodcasts[0];

  return (
    <div className="space-y-10 md:space-y-14 animate-fade-in">
      <PageHero
        eyebrow="Podcasts"
        title="Listen, learn, and follow along"
        description="Debate conversations and commentary — each episode includes video and an optional script to read alongside."
        actions={
          <>
            {!loading && publishedCount > 0 && (
              <p className="text-sm text-muted-foreground self-center mr-2">
                {publishedCount} {publishedCount === 1 ? 'episode' : 'episodes'}
              </p>
            )}
            {isAdmin && (
              <Button onClick={onCreatePodcast} size="lg" className="gap-2 shrink-0">
                <Plus className="w-5 h-5" />
                New episode
              </Button>
            )}
          </>
        }
      />

      {podcasts.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search episodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : podcasts.length === 0 ? (
        <EmptyLibrary isAdmin={isAdmin} onCreatePodcast={onCreatePodcast} />
      ) : visiblePodcasts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No episodes match &ldquo;{search}&rdquo;
        </div>
      ) : (
        <>
          {featured && !search && (
            <FeaturedPodcastCard podcast={featured} onOpen={() => onOpenPodcast(featured.id)} />
          )}

          <section>
            <h2 className="text-lg font-display font-semibold mb-5 flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              {search ? 'Search results' : 'All episodes'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(search ? visiblePodcasts : visiblePodcasts.slice(featured ? 1 : 0)).map((podcast, index) => (
                <PodcastCard
                  key={podcast.id}
                  podcast={podcast}
                  isAdmin={isAdmin}
                  index={index}
                  onOpen={() => onOpenPodcast(podcast.id)}
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
  onCreatePodcast,
}: {
  isAdmin: boolean;
  onCreatePodcast: () => void;
}) => (
  <div className="text-center py-16 md:py-24 rounded-xl border border-dashed border-border bg-muted/20">
    <Headphones className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
    <h2 className="text-xl font-display font-semibold mb-2">No episodes yet</h2>
    <p className="text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
      {isAdmin
        ? 'Publish your first podcast with a YouTube video and optional script.'
        : 'Check back soon for new debate podcasts and commentary.'}
    </p>
    {isAdmin && (
      <Button onClick={onCreatePodcast} className="gap-2">
        <Plus className="w-4 h-4" />
        Create first episode
      </Button>
    )}
  </div>
);

const FeaturedPodcastCard = ({
  podcast,
  onOpen,
}: {
  podcast: Podcast;
  onOpen: () => void;
}) => {
  const youtubeUrl = getPodcastYouTubeUrl(podcast);
  const videoId = youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : null;

  return (
    <article
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-elevated-lg cursor-pointer transition-all hover:border-primary/30"
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
          <Badge variant="secondary" className="w-fit mb-3">Latest</Badge>
          <h2 className="text-2xl md:text-3xl font-display font-semibold mb-3 group-hover:text-primary transition-colors">
            {podcast.title}
          </h2>
          {podcast.script && (
            <p className="text-muted-foreground line-clamp-3 leading-relaxed mb-5 text-sm">
              {podcast.script}
            </p>
          )}
          <Button variant="outline" className="w-fit gap-2 group-hover:border-primary group-hover:text-primary">
            Listen now <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </article>
  );
};

const PodcastCard = ({
  podcast,
  isAdmin,
  index,
  onOpen,
}: {
  podcast: Podcast;
  isAdmin: boolean;
  index: number;
  onOpen: () => void;
}) => {
  const youtubeUrl = getPodcastYouTubeUrl(podcast);
  const videoId = youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : null;

  return (
    <article
      className={cn(
        'group flex flex-col rounded-xl border border-border bg-card overflow-hidden',
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
            Episode
          </div>
        )}
        {isAdmin && !podcast.is_published && (
          <Badge className="absolute top-3 left-3" variant="outline">Draft</Badge>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {podcast.title}
        </h3>
        {podcast.script ? (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
            {podcast.script}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/60 italic flex-1">Open to watch and listen</p>
        )}
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          Open episode <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </article>
  );
};
