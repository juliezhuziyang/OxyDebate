import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { YouTubePreview } from '@/components/debate-guide/YouTubePreview';
import { PodcastForm, type PodcastFormValues } from './PodcastForm';
import type { Podcast } from '@/types/podcast';
import { getPodcastYouTubeUrl } from '@/types/podcast';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/utils/youtube';
import { ArrowLeft, ArrowRight, Headphones, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PodcastPageProps {
  podcast: Podcast;
  relatedPodcasts: Podcast[];
  isAdmin: boolean;
  saving?: boolean;
  onBack: () => void;
  onOpenPodcast: (id: string) => void;
  onUpdate: (values: PodcastFormValues) => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}

export const PodcastPage = ({
  podcast,
  relatedPodcasts,
  isAdmin,
  saving = false,
  onBack,
  onOpenPodcast,
  onUpdate,
  onTogglePublish,
  onDelete,
}: PodcastPageProps) => {
  const [editing, setEditing] = useState(false);
  const youtubeUrl = getPodcastYouTubeUrl(podcast);

  if (editing && isAdmin) {
    return (
      <PodcastForm
        mode="edit"
        initialValues={{
          title: podcast.title,
          youtubeUrl: youtubeUrl ?? '',
          script: podcast.script ?? '',
          isPublished: podcast.is_published,
        }}
        saving={saving}
        submitLabel="Save changes"
        onSubmit={(values) => {
          onUpdate(values);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Podcasts
        </button>
        <span aria-hidden>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
          {podcast.title}
        </span>
      </nav>

      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl border border-border bg-muted/30">
          {!podcast.is_published && <Badge variant="outline">Draft — not public</Badge>}
          <div className="flex flex-wrap gap-2 ml-auto">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onTogglePublish} disabled={saving}>
              {podcast.is_published ? 'Unpublish' : 'Publish'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this episode?</AlertDialogTitle>
                  <AlertDialogDescription>
                    &ldquo;{podcast.title}&rdquo; will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <header className="mb-8">
        <p className="editorial-eyebrow mb-2 flex items-center gap-1.5">
          <Headphones className="w-4 h-4" />
          Podcast episode
        </p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold tracking-tight leading-tight">
          {podcast.title}
        </h1>
      </header>

      {youtubeUrl ? (
        <YouTubePreview url={youtubeUrl} title={podcast.title} showEmbed className="mb-8" />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 aspect-video flex items-center justify-center mb-8 text-muted-foreground">
          No video linked yet
        </div>
      )}

      <section className="mb-12">
        <h2 className="text-xl font-display font-semibold mb-4">Script</h2>
        {podcast.script ? (
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap text-foreground/90 font-mono text-sm">
              {podcast.script}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground italic">
            No script provided for this episode.
          </p>
        )}
      </section>

      {relatedPodcasts.length > 0 && (
        <section className="border-t border-border pt-10">
          <h2 className="text-lg font-display font-semibold mb-5">More episodes</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedPodcasts.map((related) => {
              const relatedUrl = getPodcastYouTubeUrl(related);
              const videoId = relatedUrl ? extractYouTubeVideoId(relatedUrl) : null;
              return (
                <button
                  key={related.id}
                  type="button"
                  onClick={() => onOpenPodcast(related.id)}
                  className={cn(
                    'group flex gap-4 rounded-xl border border-border bg-card p-3 text-left',
                    'hover:border-primary/30 hover:shadow-md transition-all'
                  )}
                >
                  <div className="w-28 shrink-0 rounded-lg overflow-hidden aspect-video bg-muted">
                    {videoId ? (
                      <img
                        src={getYouTubeThumbnail(videoId, 'mq')}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        Episode
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <p className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {related.title}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-2 group-hover:text-primary">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
