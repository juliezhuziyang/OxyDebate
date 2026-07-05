import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SafeHTML } from '@/components/SafeHTML';
import { SkeletonBlock } from '@/components/ui/page-loader';
import { Megaphone } from 'lucide-react';
import { formatAnnouncementDateShort } from '@/utils/announcementContent';

interface TournamentAnnouncement {
  id: string;
  title: string;
  content: string;
  file_attachments: unknown;
  created_at: string;
}

export const TournamentAnnouncementsPublic = () => {
  const [announcements, setAnnouncements] = useState<TournamentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('tournament_announcements')
          .select('id, title, content, file_attachments, created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setAnnouncements(data || []);
      } catch {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <SkeletonBlock key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-muted/20">
        <Megaphone className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">No tournament announcements to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {announcements.map((a) => (
        <article
          key={a.id}
          className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
        >
          <time className="text-sm text-muted-foreground">
            {formatAnnouncementDateShort(a.created_at)}
          </time>
          <h3 className="text-xl font-semibold font-playfair mt-1 mb-4">{a.title}</h3>
          <SafeHTML content={a.content} className="prose-article text-base" />
          {a.file_attachments && Array.isArray(a.file_attachments) && a.file_attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              {(a.file_attachments as { url: string; name: string; type?: string }[]).map(
                (file, index) => (
                  <div key={index}>
                    {file.type?.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="max-w-full h-auto rounded-lg border max-h-72 object-contain"
                      />
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline text-sm"
                      >
                        {file.name}
                      </a>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
};
