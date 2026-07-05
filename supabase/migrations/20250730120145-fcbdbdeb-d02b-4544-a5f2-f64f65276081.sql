-- Add timer fields to practice_matches table
ALTER TABLE public.practice_matches 
ADD COLUMN timer_duration_seconds INTEGER DEFAULT 0,
ADD COLUMN timer_remaining_seconds INTEGER DEFAULT 0,
ADD COLUMN timer_is_running BOOLEAN DEFAULT false,
ADD COLUMN timer_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();