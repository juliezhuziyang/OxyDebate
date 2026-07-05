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
import { YouTubePreview } from './YouTubePreview';
import { DebateGuideForm, type GuideFormValues } from './DebateGuideForm';
import type { DebateGuide } from '@/types/debateGuide';
import { getGuideYouTubeUrl } from '@/types/debateGuide';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/utils/youtube';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Pencil,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface DebateGuidePageProps {
  guide: DebateGuide;
  relatedGuides: DebateGuide[];
  isAdmin: boolean;
  saving?: boolean;
  onBack: () => void;
  onOpenGuide: (id: string) => void;
  onUpdate: (values: GuideFormValues) => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}

export const DebateGuidePage = ({
  guide,
  relatedGuides,
  isAdmin,
  saving = false,
  onBack,
  onOpenGuide,
  onUpdate,
  onTogglePublish,
  onDelete,
}: DebateGuidePageProps) => {
  const [editing, setEditing] = useState(false);
  const youtubeUrl = getGuideYouTubeUrl(guide);

  if (editing && isAdmin) {
    return (
      <DebateGuideForm
        mode="edit"
        initialValues={{
          title: guide.title,
          youtubeUrl: youtubeUrl ?? '',
          description: guide.description ?? '',
          isPublished: guide.is_published,
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
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Debate Guide
        </button>
        <span aria-hidden>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
          {guide.title}
        </span>
      </nav>

      {/* Admin toolbar */}
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl border border-border bg-muted/30">
          {!guide.is_published && <Badge variant="outline">Draft — not public</Badge>}
          <div className="flex flex-wrap gap-2 ml-auto">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onTogglePublish} disabled={saving}>
              {guide.is_published ? 'Unpublish' : 'Publish'}
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
                  <AlertDialogTitle>Delete this guide?</AlertDialogTitle>
                  <AlertDialogDescription>
                    &ldquo;{guide.title}&rdquo; will be permanently removed. This cannot be undone.
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

      {/* Header */}
      <header className="mb-8">
        <p className="text-sm font-medium text-primary mb-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          Learning topic
        </p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-playfair tracking-tight leading-tight">
          {guide.title}
        </h1>
      </header>

      {/* Video */}
      {youtubeUrl ? (
        <YouTubePreview
          url={youtubeUrl}
          title={guide.title}
          showEmbed
          className="mb-8"
        />
      ) : guide.video_path ? (
        <LegacyVideoBlock path={guide.video_path} className="mb-8" />
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 aspect-video flex items-center justify-center mb-8 text-muted-foreground">
          No video linked yet
        </div>
      )}

      {/* Learning notes */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold font-playfair mb-4 flex items-center gap-2">
          Learning notes
        </h2>
        {guide.description ? (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap text-foreground/90">
              {guide.description}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground italic">
            No study notes for this topic yet — watch the video and take your own notes.
          </p>
        )}
      </section>

      {/* Related topics */}
      {relatedGuides.length > 0 && (
        <section className="border-t border-border pt-10">
          <h2 className="text-lg font-semibold mb-5">Keep exploring</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedGuides.map((related) => {
              const relatedUrl = getGuideYouTubeUrl(related);
              const videoId = relatedUrl ? extractYouTubeVideoId(relatedUrl) : null;
              return (
                <button
                  key={related.id}
                  type="button"
                  onClick={() => onOpenGuide(related.id)}
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
                        Lesson
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

const LegacyVideoBlock = ({ path, className }: { path: string; className?: string }) => {
  const { data } = supabase.storage.from('debate-guides').getPublicUrl(path);
  const url = data.publicUrl;

  return (
    <div className={cn('space-y-3', className)}>
      <video controls className="w-full rounded-2xl border border-border shadow-elevated-lg">
        <source src={url} />
      </video>
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4" />
          Open video
        </a>
      </Button>
    </div>
  );
};
