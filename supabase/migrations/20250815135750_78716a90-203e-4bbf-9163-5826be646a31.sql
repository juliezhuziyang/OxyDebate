-- Fix RLS policies for tournament tables to allow admins to view all data

-- Update tournament_judges policies
DROP POLICY IF EXISTS "Judges can view their own application" ON public.tournament_judges;
DROP POLICY IF EXISTS "Admins can view all judge applications" ON public.tournament_judges;
DROP POLICY IF EXISTS "Admins can update judge status" ON public.tournament_judges;

CREATE POLICY "Judges can view their own application" 
ON public.tournament_judges 
FOR SELECT 
USING (
  (user_id = auth.uid()) OR 
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

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

CREATE POLICY "Debaters can view their own registration" 
ON public.tournament_debaters 
FOR SELECT 
USING (
  (user_id = auth.uid()) OR 
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

CREATE POLICY "Admins can view all debater registrations" 
ON public.tournament_debaters 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));