import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { useToast } from '@/hooks/use-toast';
import { PageLoader } from '@/components/ui/page-loader';
import { PodcastLibrary } from '@/components/podcasts/PodcastLibrary';
import { PodcastPage } from '@/components/podcasts/PodcastPage';
import { PodcastForm, type PodcastFormValues } from '@/components/podcasts/PodcastForm';
import type { Podcast } from '@/types/podcast';

interface PodcastsProps {
  podcastId: string | null;
  onNavigatePodcast: (id: string | null) => void;
}

export const Podcasts = ({ podcastId, onNavigatePodcast }: PodcastsProps) => {
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const { toast } = useToast();

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPodcasts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPodcasts((data || []) as Podcast[]);
    } catch {
      toast({ title: 'Error', description: 'Failed to load podcasts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  const activePodcast = podcastId && podcastId !== 'new'
    ? podcasts.find((p) => p.id === podcastId)
    : null;

  const visiblePodcasts = isAdmin
    ? podcasts
    : podcasts.filter((p) => p.is_published);

  const createPodcast = async (values: PodcastFormValues) => {
    if (!user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .insert({
          title: values.title,
          youtube_url: values.youtubeUrl,
          script: values.script || null,
          is_published: values.isPublished,
          created_by_user_id: user.id,
        })
        .select()
        .single();
      if (error) throw error;

      toast({
        title: values.isPublished ? 'Episode published' : 'Draft saved',
      });
      await fetchPodcasts();
      onNavigatePodcast(data.id);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Failed to create', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updatePodcast = async (id: string, values: PodcastFormValues) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('podcasts')
        .update({
          title: values.title,
          youtube_url: values.youtubeUrl,
          script: values.script || null,
          is_published: values.isPublished,
        })
        .eq('id', id);
      if (error) throw error;

      toast({ title: 'Episode updated' });
      await fetchPodcasts();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Update failed', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (podcast: Podcast) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('podcasts')
        .update({ is_published: !podcast.is_published })
        .eq('id', podcast.id);
      if (error) throw error;
      toast({ title: podcast.is_published ? 'Unpublished' : 'Published' });
      await fetchPodcasts();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Failed', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deletePodcast = async (id: string) => {
    try {
      const { error } = await supabase.from('podcasts').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Episode deleted' });
      onNavigatePodcast(null);
      await fetchPodcasts();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Delete failed', description: message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (podcastId === 'new' && !isAdmin) {
      onNavigatePodcast(null);
    }
  }, [podcastId, isAdmin, onNavigatePodcast]);

  useEffect(() => {
    if (podcastId && podcastId !== 'new' && !loading) {
      const podcast = podcasts.find((p) => p.id === podcastId);
      if (podcast && !isAdmin && !podcast.is_published) {
        onNavigatePodcast(null);
      }
    }
  }, [podcastId, podcasts, loading, isAdmin, onNavigatePodcast]);

  if (loading && podcasts.length === 0) {
    return <PageLoader label="Loading podcasts..." />;
  }

  if (podcastId === 'new') {
    if (!isAdmin) return null;
    return (
      <PodcastForm
        mode="create"
        saving={saving}
        onSubmit={createPodcast}
        onCancel={() => onNavigatePodcast(null)}
      />
    );
  }

  if (podcastId && activePodcast) {
    if (!isAdmin && !activePodcast.is_published) return null;

    const related = visiblePodcasts
      .filter((p) => p.id !== activePodcast.id)
      .slice(0, 4);

    return (
      <PodcastPage
        podcast={activePodcast}
        relatedPodcasts={related}
        isAdmin={isAdmin}
        saving={saving}
        onBack={() => onNavigatePodcast(null)}
        onOpenPodcast={onNavigatePodcast}
        onUpdate={(values) => updatePodcast(activePodcast.id, values)}
        onTogglePublish={() => togglePublish(activePodcast)}
        onDelete={() => deletePodcast(activePodcast.id)}
      />
    );
  }

  if (podcastId && !activePodcast && !loading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">This episode could not be found.</p>
        <button
          type="button"
          onClick={() => onNavigatePodcast(null)}
          className="text-primary hover:underline text-sm"
        >
          Back to library
        </button>
      </div>
    );
  }

  return (
    <PodcastLibrary
      podcasts={visiblePodcasts}
      loading={loading}
      isAdmin={isAdmin}
      onOpenPodcast={onNavigatePodcast}
      onCreatePodcast={() => onNavigatePodcast('new')}
    />
  );
};
