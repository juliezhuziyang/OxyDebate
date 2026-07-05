import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRoles = async () => {
      if (!user) {
        setRoles([]);
        return;
      }
      setLoading(true);
      try {
        const sb = supabase as any;
        const { data, error } = await sb
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        if (error) throw error;
        setRoles(((data || []) as any[]).map((r: any) => r.role));
      } catch (e) {
        // fail silently
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, [user]);

  const isAdmin = roles.includes('admin');
  const isTournamentAdmin = roles.includes('tournament_admin');

  return { roles, isAdmin, isTournamentAdmin, loading };
};
