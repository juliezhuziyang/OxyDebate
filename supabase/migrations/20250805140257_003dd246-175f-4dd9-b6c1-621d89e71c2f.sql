-- Add recording_url column to practice_matches table
ALTER TABLE public.practice_matches 
ADD COLUMN recording_url text;