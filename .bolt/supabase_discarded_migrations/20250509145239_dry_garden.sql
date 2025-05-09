-- Drop existing tables and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.user_answers CASCADE;
DROP TABLE IF EXISTS public.user_tryouts CASCADE;
DROP TABLE IF EXISTS public.tryout_sessions CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.subtests CASCADE;
DROP TABLE IF EXISTS public.packages CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamptz DEFAULT now(),
  username text UNIQUE,
  full_name text,
  avatar_url text,
  email text,
  is_admin boolean DEFAULT false
);

-- Create packages table
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  active boolean DEFAULT true
);

-- Create subtests table
CREATE TABLE public.subtests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  duration integer NOT NULL,
  "order" integer NOT NULL
);

-- Create questions table
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  subtest_id uuid NOT NULL REFERENCES subtests(id) ON DELETE CASCADE,
  text text NOT NULL,
  type text NOT NULL CHECK (type IN ('MC', 'SA')),
  options jsonb,
  correct_answer text NOT NULL
);

-- Create tryout sessions table
CREATE TABLE public.tryout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  name text NOT NULL
);

-- Create user tryouts table
CREATE TABLE public.user_tryouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES tryout_sessions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'scored')),
  final_score numeric
);

-- Create user answers table
CREATE TABLE public.user_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_tryout_id uuid NOT NULL REFERENCES user_tryouts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text text,
  is_flagged boolean DEFAULT false
);

-- Create indexes
CREATE INDEX profiles_username_idx ON public.profiles(username);
CREATE INDEX profiles_email_idx ON public.profiles(email);

-- Create trigger function for new users
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

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tryouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles
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

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Packages
CREATE POLICY "Users can read active packages"
  ON packages FOR SELECT
  TO authenticated
  USING (active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can manage packages"
  ON packages FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Subtests
CREATE POLICY "Users can read subtests of active packages"
  ON subtests FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM packages 
    WHERE packages.id = subtests.package_id 
    AND (packages.active = true OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    ))
  ));

CREATE POLICY "Admins can manage subtests"
  ON subtests FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Questions
CREATE POLICY "Users can read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Tryout Sessions
CREATE POLICY "Users can read active sessions"
  ON tryout_sessions FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can manage sessions"
  ON tryout_sessions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- User Tryouts
CREATE POLICY "Users can manage own tryouts"
  ON user_tryouts FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- User Answers
CREATE POLICY "Users can manage own answers"
  ON user_answers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tryouts
      WHERE user_tryouts.id = user_answers.user_tryout_id
      AND (user_tryouts.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ))
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