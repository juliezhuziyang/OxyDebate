-- Recreate views with explicit security invoker to fix security definer issues
-- Security invoker ensures the view uses the permissions of the calling user, not the view creator

-- Drop existing views and recreate with security invoker
DROP VIEW IF EXISTS public.global_rankings CASCADE;
DROP VIEW IF EXISTS public.tournament_individual_leaderboard CASCADE; 
DROP VIEW IF EXISTS public.tournament_team_leaderboard CASCADE;

-- Recreate global_rankings view with security invoker
CREATE VIEW public.global_rankings 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  username,
  display_name,
  avatar_url,
  rating,
  wins,
  losses,
  total_sessions,
  total_practice_time,
  CASE
    WHEN ((wins + losses) > 0) THEN round((((wins)::numeric / ((wins + losses))::numeric) * (100)::numeric), 1)
    ELSE (0)::numeric
  END AS win_rate,
  row_number() OVER (ORDER BY rating DESC, wins DESC) AS rank
FROM profiles p
ORDER BY rating DESC, wins DESC;

-- Recreate tournament_individual_leaderboard view with security invoker
CREATE VIEW public.tournament_individual_leaderboard 
WITH (security_invoker = true) AS
SELECT 
  speaker_name,
  team_name,
  avg(speaker_score) AS avg_score,
  count(*) AS rounds_spoken,
  row_number() OVER (ORDER BY (avg(speaker_score)) DESC) AS individual_rank
FROM tournament_speaker_scores
GROUP BY speaker_name, team_name
ORDER BY (avg(speaker_score)) DESC;

-- Recreate tournament_team_leaderboard view with security invoker
CREATE VIEW public.tournament_team_leaderboard 
WITH (security_invoker = true) AS
SELECT 
  td.team_name,
  td.name AS captain_name,
  td.partner_name,
  COALESCE(wins.win_count, (0)::bigint) AS wins,
  COALESCE(losses.loss_count, (0)::bigint) AS losses,
  COALESCE(avg_scores.avg_team_score, (0)::numeric) AS avg_team_score,
  row_number() OVER (ORDER BY COALESCE(wins.win_count, (0)::bigint) DESC, COALESCE(avg_scores.avg_team_score, (0)::numeric) DESC) AS team_rank
FROM tournament_debaters td
LEFT JOIN (
  SELECT
    CASE
      WHEN (tournament_matches.winner_team = 'prop'::text) THEN tournament_matches.prop_team_name
      WHEN (tournament_matches.winner_team = 'opp'::text) THEN tournament_matches.opp_team_name
      ELSE NULL::text
    END AS team_name,
    count(*) AS win_count
  FROM tournament_matches
  WHERE (tournament_matches.winner_team IS NOT NULL)
  GROUP BY
    CASE
      WHEN (tournament_matches.winner_team = 'prop'::text) THEN tournament_matches.prop_team_name
      WHEN (tournament_matches.winner_team = 'opp'::text) THEN tournament_matches.opp_team_name
      ELSE NULL::text
    END
) wins ON (td.team_name = wins.team_name)
LEFT JOIN (
  SELECT
    CASE
      WHEN (tournament_matches.winner_team = 'opp'::text) THEN tournament_matches.prop_team_name
      WHEN (tournament_matches.winner_team = 'prop'::text) THEN tournament_matches.opp_team_name
      ELSE NULL::text
    END AS team_name,
    count(*) AS loss_count
  FROM tournament_matches
  WHERE (tournament_matches.winner_team IS NOT NULL)
  GROUP BY
    CASE
      WHEN (tournament_matches.winner_team = 'opp'::text) THEN tournament_matches.prop_team_name
      WHEN (tournament_matches.winner_team = 'prop'::text) THEN tournament_matches.opp_team_name
      ELSE NULL::text
    END
) losses ON (td.team_name = losses.team_name)
LEFT JOIN (
  SELECT 
    tournament_speaker_scores.team_name,
    avg(tournament_speaker_scores.speaker_score) AS avg_team_score
  FROM tournament_speaker_scores
  GROUP BY tournament_speaker_scores.team_name
) avg_scores ON (td.team_name = avg_scores.team_name);