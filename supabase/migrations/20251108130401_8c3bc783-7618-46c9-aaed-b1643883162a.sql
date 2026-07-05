-- Add RLS policy to allow everyone to view tournament debater registrations
CREATE POLICY "Everyone can view tournament debater registrations"
ON public.tournament_debaters
FOR SELECT
USING (true);

-- Add RLS policy to allow everyone to view approved judges
CREATE POLICY "Everyone can view approved judges"
ON public.tournament_judges
FOR SELECT
USING (status = 'approved');