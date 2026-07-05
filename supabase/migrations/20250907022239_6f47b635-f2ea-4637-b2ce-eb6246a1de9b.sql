-- Fix tournament participant data theft vulnerability
-- Restrict public access to tournament_debaters and tournament_judges tables

-- For tournament_debaters table - ensure secure policies only
-- Drop existing policies and recreate them securely
DROP POLICY IF EXISTS "Everyone can view tournament debaters" ON public.tournament_debaters;
DROP POLICY IF EXISTS "Tournament debaters are publicly viewable" ON public.tournament_debaters;
DROP POLICY IF EXISTS "Public can view debater registrations" ON public.tournament_debaters;
DROP POLICY IF EXISTS "Admins can view all debater registrations" ON public.tournament_debaters;
DROP POLICY IF EXISTS "Users can view their own debater registration" ON public.tournament_debaters;
DROP POLICY IF EXISTS "Anyone can register as debater" ON public.tournament_debaters;
DROP POLICY IF EXISTS "Admins can delete tournament debaters" ON public.tournament_debaters;

-- For tournament_judges table - ensure secure policies only  
DROP POLICY IF EXISTS "Everyone can view tournament judges" ON public.tournament_judges;
DROP POLICY IF EXISTS "Tournament judges are publicly viewable" ON public.tournament_judges;
DROP POLICY IF EXISTS "Public can view judge applications" ON public.tournament_judges;
DROP POLICY IF EXISTS "Admins can view all judge applications" ON public.tournament_judges;
DROP POLICY IF EXISTS "Users can view their own judge application" ON public.tournament_judges;
DROP POLICY IF EXISTS "Anyone can apply as judge" ON public.tournament_judges;
DROP POLICY IF EXISTS "Admins can delete tournament judges" ON public.tournament_judges;
DROP POLICY IF EXISTS "Admins can update judge status" ON public.tournament_judges;

-- Create secure policies for tournament_debaters
-- Only admins can view all registrations
CREATE POLICY "Admins can view all debater registrations" 
ON public.tournament_debaters 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can only view their own registration
CREATE POLICY "Users can view their own debater registration" 
ON public.tournament_debaters 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Anyone can register (but not view others)
CREATE POLICY "Anyone can register as debater" 
ON public.tournament_debaters 
FOR INSERT 
WITH CHECK (true);

-- Admins can delete registrations
CREATE POLICY "Admins can delete tournament debaters" 
ON public.tournament_debaters 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create secure policies for tournament_judges
-- Only admins can view all applications
CREATE POLICY "Admins can view all judge applications" 
ON public.tournament_judges 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can only view their own application
CREATE POLICY "Users can view their own judge application" 
ON public.tournament_judges 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Anyone can apply as judge (but not view others)
CREATE POLICY "Anyone can apply as judge" 
ON public.tournament_judges 
FOR INSERT 
WITH CHECK (true);

-- Admins can delete applications
CREATE POLICY "Admins can delete tournament judges" 
ON public.tournament_judges 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update judge status
CREATE POLICY "Admins can update judge status" 
ON public.tournament_judges 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add security documentation
COMMENT ON TABLE public.tournament_debaters IS 'Contains tournament debater registrations. Personal data (names, emails, schools) only accessible to admins and the registrant themselves to prevent data theft.';
COMMENT ON TABLE public.tournament_judges IS 'Contains tournament judge applications. Personal data (names, emails, experience) only accessible to admins and the applicant themselves to prevent data theft.';