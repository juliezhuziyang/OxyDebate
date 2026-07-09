import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { YouTubePreview } from '@/components/debate-guide/YouTubePreview';
import { isValidYouTubeUrl, normalizeYouTubeUrl } from '@/utils/youtube';
import { ArrowLeft, Headphones, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PodcastFormValues {
  title: string;
  youtubeUrl: string;
  script: string;
  isPublished: boolean;
}

interface PodcastFormProps {
  initialValues?: Partial<PodcastFormValues>;
  submitLabel?: string;
  saving?: boolean;
  onSubmit: (values: PodcastFormValues) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

export const PodcastForm = ({
  initialValues,
  submitLabel,
  saving = false,
  onSubmit,
  onCancel,
  mode = 'create',
}: PodcastFormProps) => {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialValues?.youtubeUrl ?? '');
  const [script, setScript] = useState(initialValues?.script ?? '');
  const [isPublished, setIsPublished] = useState(initialValues?.isPublished ?? true);

  const canSubmit = title.trim().length > 0 && isValidYouTubeUrl(youtubeUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const normalized = normalizeYouTubeUrl(youtubeUrl);
    if (!normalized) return;
    onSubmit({
      title: title.trim(),
      youtubeUrl: normalized,
      script: script.trim(),
      isPublished,
    });
  };

  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to library
      </button>

      <div className="mb-8">
        <p className="editorial-eyebrow mb-2">
          {mode === 'create' ? 'New episode' : 'Edit episode'}
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
          {mode === 'create' ? 'Publish a podcast episode' : 'Update this episode'}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
          Add a title, paste a YouTube link, and optional script or show notes for listeners.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="podcast-title">Title *</Label>
              <Input
                id="podcast-title"
                placeholder="e.g. Round recap — East Asia WSDC"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="podcast-youtube">YouTube URL *</Label>
              <Input
                id="podcast-youtube"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Supports youtube.com, youtu.be, and Shorts links
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="podcast-script">
                Script
                <span className="text-muted-foreground font-normal ml-1">(optional)</span>
              </Label>
              <Textarea
                id="podcast-script"
                placeholder="Episode script, transcript, timestamps, or show notes..."
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={8}
                className="text-base leading-relaxed resize-y min-h-[180px] font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div>
                <Label htmlFor="podcast-publish" className="font-medium">Publish immediately</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Drafts are only visible to admins
                </p>
              </div>
              <Switch id="podcast-publish" checked={isPublished} onCheckedChange={setIsPublished} />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={!canSubmit || saving} className="gap-2 min-w-[140px]">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  submitLabel ?? (mode === 'create' ? 'Publish episode' : 'Save changes')
                )}
              </Button>
              <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Headphones className="w-4 h-4" />
                Live preview
              </div>
              <div className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-5">
                <div>
                  <p className="editorial-eyebrow text-[0.65rem] mb-1">Episode</p>
                  <h2 className={cn('text-xl md:text-2xl font-display font-semibold', !title && 'text-muted-foreground/50')}>
                    {title || 'Your episode title'}
                  </h2>
                </div>

                <YouTubePreview url={youtubeUrl} title={title || 'Podcast preview'} />

                {(script || !title) && (
                  <div>
                    <p className="editorial-eyebrow text-[0.65rem] mb-2">Script</p>
                    <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', !script && 'text-muted-foreground/50 italic')}>
                      {script || 'Script and show notes will appear here for listeners.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
