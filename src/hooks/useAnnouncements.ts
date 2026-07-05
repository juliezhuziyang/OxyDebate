import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import type { Announcement } from '@/types/announcement';

export function useAnnouncements(options?: { adminView?: boolean }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const adminView = options?.adminView ?? isAdmin;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      let query = (supabase as any)
        .from('announcements')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false });

      if (!adminView) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAnnouncements((data || []) as Announcement[]);
    } catch {
      toast({ title: 'Error', description: 'Failed to load announcements', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [adminView, toast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const ext = file.name.split('.').pop();
      const path = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from('announcements')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('announcements').getPublicUrl(path);
      return data.publicUrl;
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const createAnnouncement = async (
    title: string,
    content: string,
    publish: boolean
  ): Promise<Announcement | null> => {
    if (!user) return null;
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        content: content.trim(),
        is_published: publish,
        created_by_user_id: user.id,
      };
      if (publish) payload.published_at = new Date().toISOString();

      const { data, error } = await (supabase as any)
        .from('announcements')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;

      toast({ title: publish ? 'Announcement published' : 'Draft saved' });
      await fetchAnnouncements();
      return data as Announcement;
    } catch (e: any) {
      toast({ title: 'Failed to save', description: e.message, variant: 'destructive' });
      return null;
    }
  };

  const updateAnnouncement = async (
    id: string,
    title: string,
    content: string,
    publish?: boolean
  ): Promise<boolean> => {
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        content: content.trim(),
      };
      if (publish !== undefined) {
        payload.is_published = publish;
        if (publish) payload.published_at = new Date().toISOString();
      }

      const { error } = await (supabase as any)
        .from('announcements')
        .update(payload)
        .eq('id', id);
      if (error) throw error;

      toast({ title: 'Announcement updated' });
      await fetchAnnouncements();
      return true;
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
      return false;
    }
  };

  const deleteAnnouncement = async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any).from('announcements').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Announcement deleted' });
      await fetchAnnouncements();
      return true;
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
      return false;
    }
  };

  return {
    announcements,
    loading,
    isAdmin,
    fetchAnnouncements,
    uploadImage,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
}

/** Public fetch for landing page teaser (published only). */
export function usePublishedAnnouncements() {
  return useAnnouncements({ adminView: false });
}
