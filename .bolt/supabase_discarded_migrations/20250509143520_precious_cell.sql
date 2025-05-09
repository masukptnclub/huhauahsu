/*
  # Create initial users and profiles

  1. New Users
    - Admin user with email admin@example.com
    - Test user with email user@example.com

  2. Security
    - Both users have email confirmation enabled
    - Admin user has admin privileges
    - Regular user has standard privileges
*/

-- First, ensure the trigger function exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    avatar_url,
    is_admin,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create admin user if not exists
DO $$
BEGIN
  -- Delete existing users first to avoid conflicts
  DELETE FROM auth.users WHERE email IN ('admin@example.com', 'user@example.com');
  
  -- Create admin user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
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
    jsonb_build_object(
      'full_name', 'System Administrator',
      'is_admin', true
    ),
    now(),
    now()
  );

  -- Create regular user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
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
    jsonb_build_object(
      'full_name', 'Test User',
      'is_admin', false
    ),
    now(),
    now()
  );
END $$;