/*
  # Setup Admin User Configuration
  
  1. Changes
    - Add RLS policies for admin access
    - Set up admin user configuration
  
  2. Security
    - Enable RLS policies for admin users
    - Ensure proper access control
*/

-- Add admin-specific RLS policies
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'email'::text) = 'admin@tryout-utbk.com'::text)
WITH CHECK ((auth.jwt() ->> 'email'::text) = 'admin@tryout-utbk.com'::text);

-- Update admin user's profile
UPDATE public.profiles 
SET 
  is_admin = true,
  username = 'admin',
  full_name = 'System Administrator'
WHERE email = 'admin@tryout-utbk.com';

-- Ensure admin policies for packages
CREATE POLICY "Admins can manage all packages"
ON public.packages
FOR ALL
TO authenticated
USING ((SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid()));

-- Ensure admin policies for subtests
CREATE POLICY "Admins can manage all subtests"
ON public.subtests
FOR ALL
TO authenticated
USING ((SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid()));

-- Ensure admin policies for questions
CREATE POLICY "Admins can manage all questions"
ON public.questions
FOR ALL
TO authenticated
USING ((SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid()));

-- Ensure admin policies for tryout sessions
CREATE POLICY "Admins can manage all sessions"
ON public.tryout_sessions
FOR ALL
TO authenticated
USING ((SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid()));

-- Ensure admin policies for user tryouts
CREATE POLICY "Admins can manage all user tryouts"
ON public.user_tryouts
FOR ALL
TO authenticated
USING ((SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid()));

-- Ensure admin policies for user answers
CREATE POLICY "Admins can manage all user answers"
ON public.user_answers
FOR ALL
TO authenticated
USING ((SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid()));