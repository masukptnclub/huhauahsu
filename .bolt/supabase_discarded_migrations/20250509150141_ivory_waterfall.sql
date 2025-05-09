/*
  # Create Admin User

  1. Changes
    - Create admin user with proper authentication
    - Set admin privileges in profiles table
    - Ensure email confirmation

  Note: This migration creates a default admin user with credentials:
    - Email: admin@tryout-utbk.com
    - Password: Admin123!
*/

-- First create the admin user with proper auth setup
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@tryout-utbk.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    false,
    encode(gen_random_bytes(32), 'hex')
  )
  RETURNING id INTO new_user_id;

  -- Update the profile to set admin privileges
  UPDATE profiles
  SET 
    is_admin = true,
    username = 'admin',
    full_name = 'Admin User'
  WHERE id = new_user_id;

  -- Ensure email is confirmed in auth.users
  UPDATE auth.users
  SET email_confirmed_at = now(),
      updated_at = now()
  WHERE id = new_user_id;
END $$;