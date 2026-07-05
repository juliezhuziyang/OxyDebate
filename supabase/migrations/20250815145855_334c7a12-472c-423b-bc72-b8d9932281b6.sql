-- Add file attachments support to tournament announcements
ALTER TABLE public.tournament_announcements 
ADD COLUMN file_attachments jsonb DEFAULT '[]'::jsonb;

-- Add individual messaging target
ALTER TABLE public.tournament_announcements 
ADD COLUMN target_individual_email text;

-- Create index for better performance on file queries
CREATE INDEX idx_tournament_announcements_target_individual ON public.tournament_announcements(target_individual_email);
CREATE INDEX idx_tournament_announcements_file_attachments ON public.tournament_announcements USING gin(file_attachments);