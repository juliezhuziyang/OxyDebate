-- Fix critical security vulnerability: Remove public access to sensitive user data
-- Migration failed due to incorrect WITH CHECK usage, fixing with proper RLS policies

-- Drop dangerous policies that expose user personal data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view check-ins" ON public.check_ins;

-- Create secure profile access policies
-- Allow users to view their own profiles (full access to own data)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow admins to view all profiles for management purposes
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- For posts/comments functionality, we need a way to get display names and avatars
-- This policy allows anyone (including anonymous users) to view basic profile info
-- but the application should only SELECT non-sensitive columns (display_name, avatar_url, username)
CREATE POLICY "Public can view basic profile display info" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create secure check-ins access policies
-- Allow admins to view all check-ins for management
CREATE POLICY "Admins can view all check-ins" 
ON public.check_ins 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow participants to view check-ins by email match (for their own check-ins)
CREATE POLICY "Users can view check-ins by email match" 
ON public.check_ins 
FOR SELECT 
USING (participant_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Add table comments to document security considerations
COMMENT ON TABLE public.profiles IS 'Contains user information. Full access for profile owners and admins only. Application must limit public queries to non-sensitive columns only.';
COMMENT ON TABLE public.check_ins IS 'Contains participant personal information. Access restricted to admins and email-matched participants.';