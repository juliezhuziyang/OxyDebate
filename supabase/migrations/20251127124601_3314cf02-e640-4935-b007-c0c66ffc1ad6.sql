-- Update RLS policies for tournament_announcements to allow tournament_admin
DROP POLICY IF EXISTS "Admins can create announcements" ON public.tournament_announcements;
CREATE POLICY "Admins can create announcements"
ON public.tournament_announcements
FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role))
  AND created_by_user_id = auth.uid()
);

DROP POLICY IF EXISTS "Admins can update announcements" ON public.tournament_announcements;
CREATE POLICY "Admins can update announcements"
ON public.tournament_announcements
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete announcements" ON public.tournament_announcements;
CREATE POLICY "Admins can delete announcements"
ON public.tournament_announcements
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role));

-- Update RLS policies for tournament_matches
DROP POLICY IF EXISTS "Admins can manage tournament matches" ON public.tournament_matches;
CREATE POLICY "Admins can manage tournament matches"
ON public.tournament_matches
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role));

-- Update RLS policies for tournament_rounds
DROP POLICY IF EXISTS "Admins can manage tournament rounds" ON public.tournament_rounds;
CREATE POLICY "Admins can manage tournament rounds"
ON public.tournament_rounds
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role));

-- Update RLS policies for tournament_speaker_scores
DROP POLICY IF EXISTS "Admins can manage tournament speaker scores" ON public.tournament_speaker_scores;
CREATE POLICY "Admins can manage tournament speaker scores"
ON public.tournament_speaker_scores
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role));

-- Update RLS policies for tournament_judges
DROP POLICY IF EXISTS "Admins can update judge status" ON public.tournament_judges;
CREATE POLICY "Admins can update judge status"
ON public.tournament_judges
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete tournament judges" ON public.tournament_judges;
CREATE POLICY "Admins can delete tournament judges"
ON public.tournament_judges
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role));

-- Update RLS policies for tournament_debaters
DROP POLICY IF EXISTS "Admins can delete tournament debaters" ON public.tournament_debaters;
CREATE POLICY "Admins can delete tournament debaters"
ON public.tournament_debaters
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role));

-- Update RLS policies for tournament_settings
DROP POLICY IF EXISTS "Only admins can update tournament settings" ON public.tournament_settings;
CREATE POLICY "Only admins can update tournament settings"
ON public.tournament_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role));

DROP POLICY IF EXISTS "Only admins can insert tournament settings" ON public.tournament_settings;
CREATE POLICY "Only admins can insert tournament settings"
ON public.tournament_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role));

-- Grant tournament_admin role to the specified user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'tournament_admin'::app_role
FROM auth.users
WHERE email = '202860148@stu.scls-sh.org'
ON CONFLICT (user_id, role) DO NOTHING;