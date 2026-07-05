-- Cascade delete speaker scores when a team is deleted
-- 1) One-time cleanup of orphaned speaker scores
DELETE FROM public.tournament_speaker_scores tss
WHERE NOT EXISTS (
  SELECT 1 FROM public.tournament_debaters td
  WHERE td.team_name = tss.team_name
);

-- 2) Create a SECURITY DEFINER function to delete related data
CREATE OR REPLACE FUNCTION public.cascade_delete_team_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all speaker scores for the team being removed
  DELETE FROM public.tournament_speaker_scores
  WHERE team_name = OLD.team_name;

  RETURN OLD;
END;
$$;

-- 3) Attach trigger to tournament_debaters table
DROP TRIGGER IF EXISTS trg_cascade_delete_team_data ON public.tournament_debaters;
CREATE TRIGGER trg_cascade_delete_team_data
BEFORE DELETE ON public.tournament_debaters
FOR EACH ROW
EXECUTE FUNCTION public.cascade_delete_team_data();

-- 4) Ensure views are valid (no-op if already present)
-- Recreate views to be safe so deleted teams are excluded from rankings
DROP VIEW IF EXISTS public.tournament_individual_leaderboard CASCADE;
CREATE VIEW public.tournament_individual_leaderboard 
WITH (security_invoker = true) AS
SELECT 
  tss.speaker_name,
  tss.team_name,
  AVG(tss.speaker_score) as avg_score,
  COUNT(tss.id) as rounds_spoken,
  RANK() OVER (ORDER BY AVG(tss.speaker_score) DESC) as individual_rank
FROM public.tournament_speaker_scores tss
INNER JOIN public.tournament_debaters td ON tss.team_name = td.team_name
GROUP BY tss.speaker_name, tss.team_name
ORDER BY avg_score DESC;

DROP VIEW IF EXISTS public.tournament_team_leaderboard CASCADE;
CREATE VIEW public.tournament_team_leaderboard 
WITH (security_invoker = true) AS
SELECT 
  td.team_name,
  td.name AS captain_name,
  td.partner_name,
  COALESCE(match_results.wins, 0) AS wins,
  COALESCE(match_results.losses, 0) AS losses,
  COALESCE(avg_scores.avg_team_score, 0) AS avg_team_score,
  RANK() OVER (ORDER BY COALESCE(match_results.wins, 0) DESC, COALESCE(avg_scores.avg_team_score, 0) DESC) as team_rank
FROM public.tournament_debaters td
LEFT JOIN (
  SELECT 
    team_name,
    SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN is_winner THEN 0 ELSE 1 END) as losses
  FROM (
    SELECT 
      prop_team_name as team_name,
      CASE WHEN winner_team = 'prop' THEN true ELSE false END as is_winner
    FROM public.tournament_matches
    WHERE winner_team IS NOT NULL
    UNION ALL
    SELECT 
      opp_team_name as team_name,
      CASE WHEN winner_team = 'opp' THEN true ELSE false END as is_winner
    FROM public.tournament_matches
    WHERE winner_team IS NOT NULL
  ) all_matches
  GROUP BY team_name
) match_results ON td.team_name = match_results.team_name
LEFT JOIN (
  SELECT 
    team_name,
    AVG(speaker_score) as avg_team_score
  FROM public.tournament_speaker_scores
  GROUP BY team_name
) avg_scores ON td.team_name = avg_scores.team_name
ORDER BY team_rank;

-- 5) Permissions
GRANT SELECT ON public.tournament_individual_leaderboard TO authenticated, anon;
GRANT SELECT ON public.tournament_team_leaderboard TO authenticated, anon;