-- Drop existing tables and functions to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with correct schema
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamptz DEFAULT now(),
  username text UNIQUE,
  full_name text,
  avatar_url text,
  email text,
  is_admin boolean DEFAULT false
);

-- Create indexes
CREATE INDEX profiles_username_idx ON public.profiles(username);
CREATE INDEX profiles_email_idx ON public.profiles(email);

-- Create trigger function
CREATE FUNCTION public.handle_new_user()
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
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    (auth.uid() = id AND is_admin IS NOT DISTINCT FROM is_admin) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins have full access"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create test users
DO $$
BEGIN
  -- Delete existing test users
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
      'username', 'admin',
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
      'username', 'testuser',
      'is_admin', false
    ),
    now(),
    now()
  );
END $$;