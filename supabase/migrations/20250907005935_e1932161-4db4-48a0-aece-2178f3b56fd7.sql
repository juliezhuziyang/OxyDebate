-- Fix critical security vulnerability: Remove public access to tournament_debaters table
-- This table contains sensitive personal information (emails, names, schools) that should not be publicly accessible

-- Drop the dangerous policy that allows anyone to view all debater registrations
DROP POLICY IF EXISTS "Anyone can view debater registrations by email match" ON public.tournament_debaters;

-- The remaining policies are secure:
-- 1. "Admins can view all debater registrations" - only admins can see all data
-- 2. "Users can view their own debater registration" - users can only see their own registration
-- 3. "Anyone can register as debater" - allows new registrations (insert only)
-- 4. "Admins can delete tournament debaters" - admin management capability

-- Add a comment to document the security consideration
COMMENT ON TABLE public.tournament_debaters IS 'Contains sensitive personal information. Access restricted to admins and individual users for their own data only.';