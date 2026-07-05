-- Create tournament leaderboard tables

-- Tournament rounds table
CREATE TABLE public.tournament_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_number INTEGER NOT NULL,
  round_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tournament matches table (tracks team vs team results)
CREATE TABLE public.tournament_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES tournament_rounds(id) ON DELETE CASCADE,
  prop_team_name TEXT NOT NULL,
  opp_team_name TEXT NOT NULL,
  winner_team TEXT, -- 'prop' or 'opp' or null for no result yet
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tournament speaker scores table
CREATE TABLE public.tournament_speaker_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES tournament_matches(id) ON DELETE CASCADE,
  speaker_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  speaker_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tournament team stats view (calculated from matches and scores)
CREATE VIEW public.tournament_team_leaderboard AS
SELECT 
  td.team_name,
  td.name as captain_name,
  td.partner_name,
  COALESCE(wins.win_count, 0) as wins,
  COALESCE(losses.loss_count, 0) as losses,
  COALESCE(avg_scores.avg_team_score, 0) as avg_team_score,
  -- Primary ranking: wins (descending), secondary: avg score (descending)
  ROW_NUMBER() OVER (
    ORDER BY COALESCE(wins.win_count, 0) DESC, 
             COALESCE(avg_scores.avg_team_score, 0) DESC
  ) as team_rank
FROM public.tournament_debaters td
LEFT JOIN (
  SELECT 
    CASE 
      WHEN winner_team = 'prop' THEN prop_team_name 
      WHEN winner_team = 'opp' THEN opp_team_name 
    END as team_name,
    COUNT(*) as win_count
  FROM public.tournament_matches 
  WHERE winner_team IS NOT NULL
  GROUP BY team_name
) wins ON td.team_name = wins.team_name
LEFT JOIN (
  SELECT 
    CASE 
      WHEN winner_team = 'opp' THEN prop_team_name 
      WHEN winner_team = 'prop' THEN opp_team_name 
    END as team_name,
    COUNT(*) as loss_count
  FROM public.tournament_matches 
  WHERE winner_team IS NOT NULL
  GROUP BY team_name
) losses ON td.team_name = losses.team_name
LEFT JOIN (
  SELECT 
    team_name,
    AVG(speaker_score) as avg_team_score
  FROM public.tournament_speaker_scores
  GROUP BY team_name
) avg_scores ON td.team_name = avg_scores.team_name;

-- Tournament individual leaderboard view
CREATE VIEW public.tournament_individual_leaderboard AS
SELECT 
  speaker_name,
  team_name,
  AVG(speaker_score) as avg_score,
  COUNT(*) as rounds_spoken,
  ROW_NUMBER() OVER (ORDER BY AVG(speaker_score) DESC) as individual_rank
FROM public.tournament_speaker_scores
GROUP BY speaker_name, team_name
ORDER BY avg_score DESC;

-- Enable RLS on new tables
ALTER TABLE public.tournament_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_speaker_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournament_rounds
CREATE POLICY "Everyone can view tournament rounds" 
ON public.tournament_rounds 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage tournament rounds" 
ON public.tournament_rounds 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tournament_matches
CREATE POLICY "Everyone can view tournament matches" 
ON public.tournament_matches 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage tournament matches" 
ON public.tournament_matches 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tournament_speaker_scores
CREATE POLICY "Everyone can view tournament speaker scores" 
ON public.tournament_speaker_scores 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage tournament speaker scores" 
ON public.tournament_speaker_scores 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create update trigger for timestamps
CREATE TRIGGER update_tournament_rounds_updated_at
BEFORE UPDATE ON public.tournament_rounds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournament_matches_updated_at
BEFORE UPDATE ON public.tournament_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournament_speaker_scores_updated_at
BEFORE UPDATE ON public.tournament_speaker_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();