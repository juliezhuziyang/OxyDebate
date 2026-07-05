-- Change ownership of views to remove security definer behavior
-- This will ensure views respect RLS policies properly

-- Change ownership to the authenticator role (Supabase's default role for RLS)
ALTER VIEW public.global_rankings OWNER TO authenticator;
ALTER VIEW public.tournament_individual_leaderboard OWNER TO authenticator;  
ALTER VIEW public.tournament_team_leaderboard OWNER TO authenticator;

-- Grant select permissions to authenticated users
GRANT SELECT ON public.global_rankings TO authenticated;
GRANT SELECT ON public.tournament_individual_leaderboard TO authenticated;
GRANT SELECT ON public.tournament_team_leaderboard TO authenticated;

-- Grant select permissions to anonymous users (if needed for public access)
GRANT SELECT ON public.global_rankings TO anon;
GRANT SELECT ON public.tournament_individual_leaderboard TO anon;
GRANT SELECT ON public.tournament_team_leaderboard TO anon;