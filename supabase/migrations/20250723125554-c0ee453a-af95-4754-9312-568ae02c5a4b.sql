-- Create practice sessions table for tracking user activity
CREATE TABLE public.practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  format TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  score INTEGER,
  feedback TEXT,
  session_type TEXT DEFAULT 'ai' CHECK (session_type IN ('ai', 'global')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Practice sessions policies
CREATE POLICY "Practice sessions are viewable by owner" 
ON public.practice_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own practice sessions" 
ON public.practice_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice sessions" 
ON public.practice_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update profile stats when practice session is completed
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    UPDATE public.profiles 
    SET 
      total_sessions = total_sessions + 1,
      total_practice_time = total_practice_time + NEW.duration_seconds,
      rating = CASE 
        WHEN NEW.score IS NOT NULL THEN GREATEST(rating + (NEW.score - 500) / 10, 100)
        ELSE rating
      END,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update profile stats
CREATE TRIGGER update_profile_stats_trigger
AFTER INSERT OR UPDATE ON public.practice_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats();

-- Create a view for global rankings
CREATE OR REPLACE VIEW public.global_rankings AS
SELECT 
  p.id,
  p.user_id,
  p.display_name,
  p.username,
  p.avatar_url,
  p.rating,
  p.total_sessions,
  p.total_practice_time,
  p.wins,
  p.losses,
  CASE 
    WHEN p.wins + p.losses > 0 THEN ROUND((p.wins::float / (p.wins + p.losses)::float) * 100, 1)
    ELSE 0
  END as win_rate,
  ROW_NUMBER() OVER (ORDER BY p.rating DESC, p.total_sessions DESC) as rank
FROM public.profiles p
WHERE p.total_sessions > 0
ORDER BY p.rating DESC, p.total_sessions DESC;