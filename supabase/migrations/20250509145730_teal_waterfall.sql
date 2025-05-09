/*
  # Create Admin User

  1. Changes
    - Insert an admin user into the auth.users table
    - Set admin privileges in the profiles table
*/

-- Create admin user in auth.users
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
  confirmed_at
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
  now()
);

-- Set admin privileges in profiles
UPDATE profiles
SET is_admin = true
WHERE email = 'admin@tryout-utbk.com';