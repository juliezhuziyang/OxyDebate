-- Fix RLS policies for tournament tables - remove auth.users references

-- Update tournament_judges policies
DROP POLICY IF EXISTS "Judges can view their own application" ON public.tournament_judges;
DROP POLICY IF EXISTS "Admins can view all judge applications" ON public.tournament_judges;
DROP POLICY IF EXISTS "Admins can update judge status" ON public.tournament_judges;

-- Create simplified policies for judges
CREATE POLICY "Users can view their own judge application" 
ON public.tournament_judges 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Anyone can view judge applications by email match"
ON public.tournament_judges 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can view all judge applications" 
ON public.tournament_judges 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update judge status" 
ON public.tournament_judges 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update tournament_debaters policies  
DROP POLICY IF EXISTS "Debaters can view their own registration" ON public.tournament_debaters;
DROP POLICY IF EXISTS "Admins can view all debater registrations" ON public.tournament_debaters;

-- Create simplified policies for debaters
CREATE POLICY "Users can view their own debater registration" 
ON public.tournament_debaters 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Anyone can view debater registrations by email match"
ON public.tournament_debaters 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can view all debater registrations" 
ON public.tournament_debaters 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));