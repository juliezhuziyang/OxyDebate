-- Fix global_rankings: use profile stats (visible to all authenticated users) and list everyone.
-- Previous version joined practice_sessions with RLS, so each user only saw their own row.
DROP VIEW IF EXISTS public.global_rankings CASCADE;

CREATE VIEW public.global_rankings
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.wins,
  p.losses,
  COALESCE(p.total_sessions, 0) AS total_sessions,
  COALESCE(p.total_practice_time, 0) AS total_practice_time,
  CASE
    WHEN (p.wins + p.losses) > 0 THEN round(((p.wins::numeric / (p.wins + p.losses)::numeric) * 100)::numeric, 1)
    ELSE 0::numeric
  END AS win_rate,
  row_number() OVER (
    ORDER BY
      COALESCE(p.total_sessions, 0) DESC,
      COALESCE(p.total_practice_time, 0) DESC,
      COALESCE(p.wins, 0) DESC,
      COALESCE(p.display_name, p.username, '') ASC
  ) AS rank
FROM public.profiles p
ORDER BY rank;

GRANT SELECT ON public.global_rankings TO authenticated;
GRANT SELECT ON public.global_rankings TO anon;
