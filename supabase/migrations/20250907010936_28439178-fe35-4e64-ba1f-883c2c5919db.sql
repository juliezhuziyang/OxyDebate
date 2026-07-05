-- Fix tournament judge information exposure vulnerability
-- Remove public access to sensitive judge application data

-- Drop the dangerous policy that allows anyone to view all judge applications
DROP POLICY IF EXISTS "Anyone can view judge applications by email match" ON public.tournament_judges;

-- The remaining secure policies are:
-- 1. "Admins can view all judge applications" - only admins can see all data ✅
-- 2. "Users can view their own judge application" - users can only see their own application ✅  
-- 3. "Anyone can apply as judge" - allows new applications (insert only) ✅
-- 4. "Admins can update judge status" - admin management capability ✅
-- 5. "Admins can delete tournament judges" - admin management capability ✅

-- Add comment to document security consideration
COMMENT ON TABLE public.tournament_judges IS 'Contains sensitive judge application information. Access restricted to admins for management and individual applicants for their own data only.';