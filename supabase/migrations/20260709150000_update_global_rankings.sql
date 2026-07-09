-- Rank by practice sessions (AI + global from practice_sessions), tie-break on practice time; drop rating from leaderboard
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
  COALESCE(ps.total_sessions, 0)::integer AS total_sessions,
  COALESCE(ps.total_practice_time, 0)::integer AS total_practice_time,
  CASE
    WHEN (p.wins + p.losses) > 0 THEN round(((p.wins::numeric / (p.wins + p.losses)::numeric) * 100)::numeric, 1)
    ELSE 0::numeric
  END AS win_rate,
  row_number() OVER (
    ORDER BY
      COALESCE(ps.total_sessions, 0) DESC,
      COALESCE(ps.total_practice_time, 0) DESC,
      p.wins DESC,
      p.display_name ASC NULLS LAST
  ) AS rank
FROM public.profiles p
INNER JOIN (
  SELECT
    user_id,
    COUNT(*)::integer AS total_sessions,
    COALESCE(SUM(duration_seconds), 0)::integer AS total_practice_time
  FROM public.practice_sessions
  WHERE completed = true
  GROUP BY user_id
) ps ON ps.user_id = p.user_id
ORDER BY rank;

GRANT SELECT ON public.global_rankings TO authenticated;
GRANT SELECT ON public.global_rankings TO anon;

-- Keep profile totals in sync; stop mutating rating on practice completion
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    UPDATE public.profiles
    SET
      total_sessions = (
        SELECT COUNT(*)::integer
        FROM public.practice_sessions
        WHERE user_id = NEW.user_id AND completed = true
      ),
      total_practice_time = (
        SELECT COALESCE(SUM(duration_seconds), 0)::integer
        FROM public.practice_sessions
        WHERE user_id = NEW.user_id AND completed = true
      ),
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Backfill profile session totals from practice_sessions (includes AI + global)
UPDATE public.profiles p
SET
  total_sessions = COALESCE(ps.total_sessions, 0),
  total_practice_time = COALESCE(ps.total_practice_time, 0),
  updated_at = now()
FROM (
  SELECT
    user_id,
    COUNT(*)::integer AS total_sessions,
    COALESCE(SUM(duration_seconds), 0)::integer AS total_practice_time
  FROM public.practice_sessions
  WHERE completed = true
  GROUP BY user_id
) ps
WHERE p.user_id = ps.user_id;
