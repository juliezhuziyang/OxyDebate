-- Fix user profile data harvesting vulnerability
-- Remove public access and restrict to authenticated users only

-- Drop the overly permissive policy that allows anyone to view profiles
DROP POLICY IF EXISTS "Public can view basic profile display info" ON public.profiles;

-- Add a more secure policy that only allows authenticated users to view basic profile info
-- This maintains app functionality while preventing data harvesting by unauthenticated users
CREATE POLICY "Authenticated users can view basic profile display info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- The remaining secure policies are:
-- 1. "Admins can view all profiles" - admin access ✅
-- 2. "Users can view their own profile" - self access ✅  
-- 3. "Users can insert their own profile" - profile creation ✅
-- 4. "Users can update their own profile" - profile management ✅
-- 5. NEW: "Authenticated users can view basic profile display info" - authenticated access only ✅

-- Add comment to document the security consideration
COMMENT ON TABLE public.profiles IS 'Contains user profile information. Basic info visible to authenticated users only to prevent data harvesting while maintaining app functionality.';