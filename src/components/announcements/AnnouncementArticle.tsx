import { Link } from 'react-router-dom';
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
import { SafeHTML } from '@/components/SafeHTML';
import type { Announcement } from '@/types/announcement';
import {
  formatAnnouncementDate,
  formatAnnouncementDateShort,
  getAnnouncementPreview,
  getDisplayContent,
} from '@/utils/announcementContent';
import { ArrowLeft, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnnouncementArticleProps {
  announcement: Announcement;
  related: Announcement[];
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const AnnouncementArticle = ({
  announcement,
  related,
  isAdmin,
  onEdit,
  onDelete,
}: AnnouncementArticleProps) => {
  const displayContent = getDisplayContent(announcement);

  return (
    <article className="animate-fade-in">
      {/* Back navigation */}
      <Link
        to="/announcements"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Announcements
      </Link>

      {/* Admin toolbar */}
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl border border-border bg-muted/30">
          {!announcement.is_published && (
            <Badge variant="outline">Draft — not public</Badge>
          )}
          <div className="flex flex-wrap gap-2 ml-auto">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this announcement?</AlertDialogTitle>
                  <AlertDialogDescription>
                    &ldquo;{announcement.title}&rdquo; will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Article header */}
      <header className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
        <time
          dateTime={announcement.published_at ?? announcement.created_at}
          className="text-sm font-medium text-primary uppercase tracking-wider"
        >
          {formatAnnouncementDate(announcement.published_at ?? announcement.created_at)}
        </time>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-playfair tracking-tight leading-tight mt-4 mb-0">
          {announcement.title}
        </h1>
        <div className="w-16 h-1 bg-primary/30 rounded-full mx-auto mt-8" />
      </header>

      {/* Article body — optimized for long-form reading */}
      <div className="max-w-[42rem] mx-auto px-0 sm:px-2">
        <SafeHTML
          content={displayContent}
          className="prose-article"
        />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <aside className="max-w-3xl mx-auto mt-16 pt-10 border-t border-border">
          <h2 className="text-lg font-semibold mb-5">More announcements</h2>
          <div className="space-y-3">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/announcements/${item.id}`}
                className={cn(
                  'group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2',
                  'rounded-xl border border-border bg-card p-4',
                  'hover:border-primary/30 hover:shadow-sm transition-all'
                )}
              >
                <div className="min-w-0">
                  <time className="text-xs text-muted-foreground">
                    {formatAnnouncementDateShort(item.published_at)}
                  </time>
                  <p className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {getAnnouncementPreview(getDisplayContent(item), 100)}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
              </Link>
            ))}
          </div>
        </aside>
      )}
    </article>
  );
};
