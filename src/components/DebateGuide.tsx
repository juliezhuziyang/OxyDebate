import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { useToast } from '@/hooks/use-toast';
import { PageLoader } from '@/components/ui/page-loader';
import { DebateGuideLibrary } from '@/components/debate-guide/DebateGuideLibrary';
import { DebateGuidePage } from '@/components/debate-guide/DebateGuidePage';
import { DebateGuideForm, type GuideFormValues } from '@/components/debate-guide/DebateGuideForm';
import type { DebateGuide } from '@/types/debateGuide';

interface DebateGuideProps {
  guideId: string | null;
  onNavigateGuide: (id: string | null) => void;
}

export const DebateGuide = ({ guideId, onNavigateGuide }: DebateGuideProps) => {
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const { toast } = useToast();

  const [guides, setGuides] = useState<DebateGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchGuides = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('debate_lessons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setGuides((data || []) as DebateGuide[]);
    } catch {
      toast({ title: 'Error', description: 'Failed to load guides', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const activeGuide = guideId && guideId !== 'new'
    ? guides.find((g) => g.id === guideId)
    : null;

  const visibleGuides = isAdmin
    ? guides
    : guides.filter((g) => g.is_published);

  const createGuide = async (values: GuideFormValues) => {
    if (!user) return;
    setSaving(true);
    try {
      const { data, error } = await (supabase as any)
        .from('debate_lessons')
        .insert({
          title: values.title,
          description: values.description || null,
          youtube_url: values.youtubeUrl,
          is_published: values.isPublished,
          created_by_user_id: user.id,
        })
        .select()
        .single();
      if (error) throw error;

      toast({
        title: values.isPublished ? 'Guide published' : 'Draft saved',
        description: 'Your learning topic is ready.',
      });
      await fetchGuides();
      onNavigateGuide(data.id);
    } catch (e: any) {
      toast({ title: 'Failed to create', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateGuide = async (id: string, values: GuideFormValues) => {
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('debate_lessons')
        .update({
          title: values.title,
          description: values.description || null,
          youtube_url: values.youtubeUrl,
          is_published: values.isPublished,
        })
        .eq('id', id);
      if (error) throw error;

      toast({ title: 'Guide updated' });
      await fetchGuides();
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (guide: DebateGuide) => {
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('debate_lessons')
        .update({ is_published: !guide.is_published })
        .eq('id', guide.id);
      if (error) throw error;
      toast({ title: guide.is_published ? 'Unpublished' : 'Published' });
      await fetchGuides();
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteGuide = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('debate_lessons')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Guide deleted' });
      onNavigateGuide(null);
      await fetchGuides();
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (guideId === 'new' && !isAdmin) {
      onNavigateGuide(null);
    }
  }, [guideId, isAdmin, onNavigateGuide]);

  useEffect(() => {
    if (guideId && guideId !== 'new' && !loading) {
      const guide = guides.find((g) => g.id === guideId);
      if (guide && !isAdmin && !guide.is_published) {
        onNavigateGuide(null);
      }
    }
  }, [guideId, guides, loading, isAdmin, onNavigateGuide]);

  if (loading && guides.length === 0) {
    return <PageLoader label="Loading guides..." />;
  }

  // Admin: create new guide
  if (guideId === 'new') {
    if (!isAdmin) return null;
    return (
      <DebateGuideForm
        mode="create"
        saving={saving}
        onSubmit={createGuide}
        onCancel={() => onNavigateGuide(null)}
      />
    );
  }

  // Individual guide page
  if (guideId && activeGuide) {
    if (!isAdmin && !activeGuide.is_published) return null;

    const related = visibleGuides
      .filter((g) => g.id !== activeGuide.id)
      .slice(0, 4);

    return (
      <DebateGuidePage
        guide={activeGuide}
        relatedGuides={related}
        isAdmin={isAdmin}
        saving={saving}
        onBack={() => onNavigateGuide(null)}
        onOpenGuide={onNavigateGuide}
        onUpdate={(values) => updateGuide(activeGuide.id, values)}
        onTogglePublish={() => togglePublish(activeGuide)}
        onDelete={() => deleteGuide(activeGuide.id)}
      />
    );
  }

  // Guide ID in URL but not found yet (or invalid)
  if (guideId && !activeGuide && !loading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">This guide could not be found.</p>
        <button
          type="button"
          onClick={() => onNavigateGuide(null)}
          className="text-primary hover:underline text-sm"
        >
          Back to library
        </button>
      </div>
    );
  }

  // Library index
  return (
    <DebateGuideLibrary
      guides={visibleGuides}
      loading={loading}
      isAdmin={isAdmin}
      onOpenGuide={onNavigateGuide}
      onCreateGuide={() => onNavigateGuide('new')}
    />
  );
};
