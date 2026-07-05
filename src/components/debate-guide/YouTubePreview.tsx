import { cn } from '@/lib/utils';
import {
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  getYouTubeWatchUrl,
  isValidYouTubeUrl,
} from '@/utils/youtube';
import { ExternalLink, Play, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YouTubePreviewProps {
  url: string;
  title?: string;
  showEmbed?: boolean;
  showOpenButton?: boolean;
  className?: string;
  thumbnailClassName?: string;
}

export const YouTubePreview = ({
  url,
  title = 'Video preview',
  showEmbed = false,
  showOpenButton = true,
  className,
  thumbnailClassName,
}: YouTubePreviewProps) => {
  const videoId = extractYouTubeVideoId(url);
  const isValid = isValidYouTubeUrl(url);

  if (!url.trim()) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 aspect-video text-center p-6',
          className
        )}
      >
        <Youtube className="w-10 h-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">Paste a YouTube link to see a preview</p>
      </div>
    );
  }

  if (!isValid || !videoId) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 aspect-video text-center p-6',
          className
        )}
      >
        <Youtube className="w-10 h-10 text-destructive/60 mb-3" />
        <p className="text-sm text-destructive">That doesn&apos;t look like a valid YouTube URL</p>
      </div>
    );
  }

  const watchUrl = getYouTubeWatchUrl(videoId);

  if (showEmbed) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="relative rounded-2xl overflow-hidden shadow-elevated-lg aspect-video bg-black">
          <iframe
            src={getYouTubeEmbedUrl(videoId)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
        {showOpenButton && (
          <Button variant="outline" className="gap-2" asChild>
            <a href={watchUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Open on YouTube
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'group relative block rounded-2xl overflow-hidden aspect-video shadow-elevated-lg',
          thumbnailClassName
        )}
      >
        <img
          src={getYouTubeThumbnail(videoId, 'hq')}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
            <Play className="w-7 h-7 ml-1 fill-current" />
          </span>
        </div>
      </a>
      {showOpenButton && (
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href={watchUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
            Open on YouTube
          </a>
        </Button>
      )}
    </div>
  );
};
