/*
  # Fix Admin User Configuration

  This migration properly sets up the admin user with the correct permissions
  by using Supabase's built-in auth functions.
*/

-- First, create the admin user using Supabase's auth.users() function
SELECT auth.create_user(
  uid := gen_random_uuid(),
  email := 'admin@tryout-utbk.com',
  password := 'Admin123!',
  email_confirmed := true,
  raw_app_meta_data := '{"provider":"email","providers":["email"]}',
  raw_user_meta_data := '{"full_name":"Admin User"}'
);

-- Then ensure the admin user has the correct profile settings
UPDATE profiles 
SET 
  is_admin = true,
  username = 'admin',
  full_name = 'Admin User',
  updated_at = now()
WHERE email = 'admin@tryout-utbk.com';