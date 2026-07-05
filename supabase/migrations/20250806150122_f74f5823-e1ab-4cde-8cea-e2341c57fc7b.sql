-- Create function to increment total sessions for all participants when a result is declared
CREATE OR REPLACE FUNCTION public.increment_total_sessions_for_participants(participant_user_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Increment total_sessions for all participants
  UPDATE public.profiles 
  SET total_sessions = total_sessions + 1,
      updated_at = now()
  WHERE user_id = ANY(participant_user_ids);
END;
$function$;

-- Drop and recreate the global_rankings view to fix win rate calculation
DROP VIEW IF EXISTS public.global_rankings;

CREATE VIEW public.global_rankings AS
SELECT 
  p.id,
  p.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.rating,
  p.wins,
  p.losses,
  p.total_sessions,
  p.total_practice_time,
  CASE 
    WHEN (p.wins + p.losses) > 0 THEN 
      ROUND((p.wins::numeric / (p.wins + p.losses)::numeric) * 100, 1)
    ELSE 0 
  END as win_rate,
  ROW_NUMBER() OVER (ORDER BY p.rating DESC, p.wins DESC) as rank
FROM public.profiles p
ORDER BY p.rating DESC, p.wins DESC;