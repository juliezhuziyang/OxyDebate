-- Fix tournament leaderboard views to only show active teams
-- This ensures deleted teams don't show up in rankings

-- Drop and recreate tournament_individual_leaderboard with team existence check
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
-- Only include speakers whose teams still exist
INNER JOIN public.tournament_debaters td ON tss.team_name = td.team_name
GROUP BY tss.speaker_name, tss.team_name
ORDER BY avg_score DESC;

-- Drop and recreate tournament_team_leaderboard with proper joins
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

-- Grant permissions
GRANT SELECT ON public.tournament_individual_leaderboard TO authenticated;
GRANT SELECT ON public.tournament_individual_leaderboard TO anon;
GRANT SELECT ON public.tournament_team_leaderboard TO authenticated;
GRANT SELECT ON public.tournament_team_leaderboard TO anon;