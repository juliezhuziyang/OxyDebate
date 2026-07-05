import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { YouTubePreview } from './YouTubePreview';
import { isValidYouTubeUrl, normalizeYouTubeUrl } from '@/utils/youtube';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GuideFormValues {
  title: string;
  youtubeUrl: string;
  description: string;
  isPublished: boolean;
}

interface DebateGuideFormProps {
  initialValues?: Partial<GuideFormValues>;
  submitLabel?: string;
  saving?: boolean;
  onSubmit: (values: GuideFormValues) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

export const DebateGuideForm = ({
  initialValues,
  submitLabel,
  saving = false,
  onSubmit,
  onCancel,
  mode = 'create',
}: DebateGuideFormProps) => {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialValues?.youtubeUrl ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
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
      description: description.trim(),
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
        <p className="text-sm font-medium text-primary mb-2">
          {mode === 'create' ? 'New guide' : 'Edit guide'}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold font-playfair tracking-tight">
          {mode === 'create' ? 'Create a learning topic' : 'Update this topic'}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Add a title, paste a YouTube link, and optional study notes. Learners will get their own dedicated page.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="guide-title">Title *</Label>
              <Input
                id="guide-title"
                placeholder="e.g. How to structure a rebuttal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide-youtube">YouTube URL *</Label>
              <Input
                id="guide-youtube"
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
              <Label htmlFor="guide-description">
                Learning notes
                <span className="text-muted-foreground font-normal ml-1">(optional)</span>
              </Label>
              <Textarea
                id="guide-description"
                placeholder="Key takeaways, vocabulary, debate tips, or questions to think about while watching..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="text-base leading-relaxed resize-y min-h-[140px]"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div>
                <Label htmlFor="guide-publish" className="font-medium">Publish immediately</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Drafts are only visible to admins
                </p>
              </div>
              <Switch id="guide-publish" checked={isPublished} onCheckedChange={setIsPublished} />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={!canSubmit || saving} className="gap-2 min-w-[140px]">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  submitLabel ?? (mode === 'create' ? 'Create guide' : 'Save changes')
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
                <BookOpen className="w-4 h-4" />
                Live preview
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Topic</p>
                  <h2 className={cn('text-xl md:text-2xl font-semibold font-playfair', !title && 'text-muted-foreground/50')}>
                    {title || 'Your guide title'}
                  </h2>
                </div>

                <YouTubePreview url={youtubeUrl} title={title || 'Guide preview'} />

                {(description || !title) && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Learning notes</p>
                    <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', !description && 'text-muted-foreground/50 italic')}>
                      {description || 'Notes will appear here to help learners study alongside the video.'}
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
