/*
  # Set admin privileges for specific user
  
  1. Changes
    - Update profiles table to set is_admin=true for arya@arya.com
    - Update user metadata to reflect admin status
*/

DO $$
BEGIN
  -- Update the profile to set admin privileges
  UPDATE public.profiles
  SET 
    is_admin = true,
    updated_at = now()
  WHERE email = 'arya@arya.com';

  -- Update the user metadata in auth.users
  UPDATE auth.users
  SET 
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('is_admin', true),
    updated_at = now()
  WHERE email = 'arya@arya.com';
END $$;