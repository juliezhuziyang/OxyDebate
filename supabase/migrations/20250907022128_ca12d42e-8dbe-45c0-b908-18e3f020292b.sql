-- Fix tournament participant data theft vulnerability
-- Restrict public access to tournament_debaters and tournament_judges tables

-- First, check and remove any overly permissive policies that allow public read access
-- These tables should only be readable by admins and the participants themselves

-- For tournament_debaters table
-- Drop any policies that allow public viewing (if they exist)
DROP POLICY IF EXISTS "Everyone can view tournament debaters" ON public.tournament_debaters;
DROP POLICY IF EXISTS "Tournament debaters are publicly viewable" ON public.tournament_debaters;
DROP POLICY IF EXISTS "Public can view debater registrations" ON public.tournament_debaters;

-- For tournament_judges table  
-- Drop any policies that allow public viewing (if they exist)
DROP POLICY IF EXISTS "Everyone can view tournament judges" ON public.tournament_judges;
DROP POLICY IF EXISTS "Tournament judges are publicly viewable" ON public.tournament_judges;
DROP POLICY IF EXISTS "Public can view judge applications" ON public.tournament_judges;

-- Ensure the secure policies are in place for tournament_debaters
-- Policy for admins to view all (should already exist but ensure it's correct)
CREATE POLICY IF NOT EXISTS "Admins can view all debater registrations" 
ON public.tournament_debaters 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy for users to view only their own registration
CREATE POLICY IF NOT EXISTS "Users can view their own debater registration" 
ON public.tournament_debaters 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Policy to allow anyone to register (INSERT only)
CREATE POLICY IF NOT EXISTS "Anyone can register as debater" 
ON public.tournament_debaters 
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Ensure the secure policies are in place for tournament_judges
-- Policy for admins to view all applications
CREATE POLICY IF NOT EXISTS "Admins can view all judge applications" 
ON public.tournament_judges 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy for users to view only their own application
CREATE POLICY IF NOT EXISTS "Users can view their own judge application" 
ON public.tournament_judges 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Policy to allow anyone to apply as judge (INSERT only)
CREATE POLICY IF NOT EXISTS "Anyone can apply as judge" 
ON public.tournament_judges 
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Admin policies for management (should exist but ensure they're correct)
CREATE POLICY IF NOT EXISTS "Admins can delete tournament debaters" 
ON public.tournament_debaters 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY IF NOT EXISTS "Admins can delete tournament judges" 
ON public.tournament_judges 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY IF NOT EXISTS "Admins can update judge status" 
ON public.tournament_judges 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add security documentation
COMMENT ON TABLE public.tournament_debaters IS 'Contains tournament debater registrations. Personal data (names, emails, schools) only accessible to admins and the registrant themselves to prevent data theft.';
COMMENT ON TABLE public.tournament_judges IS 'Contains tournament judge applications. Personal data (names, emails, experience) only accessible to admins and the applicant themselves to prevent data theft.';