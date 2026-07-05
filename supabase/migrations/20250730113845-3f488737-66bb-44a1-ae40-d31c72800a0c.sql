-- Add new columns to practice_matches for speaker assignments and results
ALTER TABLE public.practice_matches 
ADD COLUMN IF NOT EXISTS prop_speakers TEXT[],
ADD COLUMN IF NOT EXISTS opp_speakers TEXT[],
ADD COLUMN IF NOT EXISTS result TEXT; -- 'prop_wins', 'opp_wins', 'tie'

-- Add comment to explain the arrays structure
COMMENT ON COLUMN public.practice_matches.prop_speakers IS 'Array of proposition speakers in order: [1st speaker, 2nd speaker, 3rd speaker, 4th speaker]';
COMMENT ON COLUMN public.practice_matches.opp_speakers IS 'Array of opposition speakers in order: [1st speaker, 2nd speaker, 3rd speaker, 4th speaker]';