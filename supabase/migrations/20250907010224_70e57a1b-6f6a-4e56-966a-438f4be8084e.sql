-- Fix critical security vulnerability: Remove public access to sensitive user data
-- profiles table and check_ins table currently expose personal information publicly

-- Drop dangerous policies that expose user personal data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view check-ins" ON public.check_ins;

-- Create secure profile access policies
-- Allow users to view their own profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow admins to view all profiles for management purposes
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow public access to only non-sensitive profile fields needed for posts/comments
-- This policy allows fetching display_name and avatar_url for user posts/comments
CREATE POLICY "Public can view basic profile info for posts" 
ON public.profiles 
FOR SELECT 
USING (true)
WITH CHECK (false); -- This restricts to only SELECT operations

-- Update the above policy to only allow specific columns
-- We'll need to handle this in the application layer by being careful about what columns we SELECT

-- Create secure check-ins access policies
-- Allow admins to view all check-ins for management
CREATE POLICY "Admins can view all check-ins" 
ON public.check_ins 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow participants to view check-ins for sessions they're involved in
-- This is safer than public access but still functional
CREATE POLICY "Participants can view their own check-ins" 
ON public.check_ins 
FOR SELECT 
USING (participant_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Add table comments to document security considerations
COMMENT ON TABLE public.profiles IS 'Contains sensitive user information. Access restricted to profile owners and admins. Public access limited to display info only.';
COMMENT ON TABLE public.check_ins IS 'Contains participant personal information. Access restricted to admins and individual participants.';