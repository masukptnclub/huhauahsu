/*
  # Create test users

  Creates an admin user and a regular test user if they don't already exist.
  
  1. Users
    - Admin user with email admin@example.com
    - Regular user with email user@example.com
  
  2. Profiles
    - Admin profile with admin privileges
    - Regular user profile
*/

DO $$
BEGIN
  -- Create admin user if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'ad0f4cd0-5b25-4b50-a5d5-9588ae8b88d0',
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now()
    );
  END IF;

  -- Create regular user if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'user@example.com'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'b50f4cd0-5b25-4b50-a5d5-9588ae8b88d0',
      'authenticated',
      'authenticated',
      'user@example.com',
      crypt('user123', gen_salt('bf')),
      now(),
      now(),
      now()
    );
  END IF;

  -- Create admin profile if not exists
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = 'ad0f4cd0-5b25-4b50-a5d5-9588ae8b88d0'
  ) THEN
    INSERT INTO public.profiles (
      id,
      username,
      full_name,
      is_admin
    ) VALUES (
      'ad0f4cd0-5b25-4b50-a5d5-9588ae8b88d0',
      'admin',
      'System Administrator',
      true
    );
  END IF;

  -- Create user profile if not exists
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = 'b50f4cd0-5b25-4b50-a5d5-9588ae8b88d0'
  ) THEN
    INSERT INTO public.profiles (
      id,
      username,
      full_name,
      is_admin
    ) VALUES (
      'b50f4cd0-5b25-4b50-a5d5-9588ae8b88d0',
      'testuser',
      'Test User',
      false
    );
  END IF;
END $$;