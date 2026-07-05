-- Create tables for tournament system
CREATE TABLE public.tournament_debaters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  school TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  partner_email TEXT NOT NULL,
  team_name TEXT NOT NULL,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.tournament_judges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  judge_experience TEXT NOT NULL,
  debate_experience TEXT NOT NULL,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.tournament_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by_user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'debaters', 'judges', 'team', 'all'
  target_team_name TEXT, -- for team-specific announcements
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournament_debaters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debaters
CREATE POLICY "Anyone can register as debater" 
ON public.tournament_debaters 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Debaters can view their own registration" 
ON public.tournament_debaters 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all debater registrations" 
ON public.tournament_debaters 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for judges
CREATE POLICY "Anyone can apply as judge" 
ON public.tournament_judges 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Judges can view their own application" 
ON public.tournament_judges 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all judge applications" 
ON public.tournament_judges 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update judge status" 
ON public.tournament_judges 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for announcements
CREATE POLICY "Admins can create announcements" 
ON public.tournament_announcements 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND created_by_user_id = auth.uid());

CREATE POLICY "Everyone can view announcements" 
ON public.tournament_announcements 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can update announcements" 
ON public.tournament_announcements 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete announcements" 
ON public.tournament_announcements 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_tournament_debaters_updated_at
BEFORE UPDATE ON public.tournament_debaters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournament_judges_updated_at
BEFORE UPDATE ON public.tournament_judges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournament_announcements_updated_at
BEFORE UPDATE ON public.tournament_announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();