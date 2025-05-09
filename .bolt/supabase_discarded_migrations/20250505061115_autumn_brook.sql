/*
  # Initial Schema Setup for Try Out UTBK

  1. Tables
   - `profiles`: User profiles linked to auth.users
   - `packages`: Try-out packages/tests
   - `subtests`: Subtests within packages (like sections of UTBK)
   - `questions`: Questions with multiple choice or short answer types
   - `tryout_sessions`: Sessions when try-outs are available
   - `user_tryouts`: Records of users taking try-outs
   - `user_answers`: Individual user answers to questions

  2. Security
   - Enable RLS on all tables
   - Set up policies for admin access
   - Set up policies for user access to their own data
*/

-- Create profile table that extends auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE
);

-- Create packages table (try-out packages)
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- Create subtests table (sections within packages)
CREATE TABLE IF NOT EXISTS subtests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL, -- in seconds
  "order" INTEGER NOT NULL -- for ordering subtests
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  subtest_id UUID NOT NULL REFERENCES subtests(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MC', 'SA')), -- Multiple Choice or Short Answer
  options JSONB, -- for MC: [{id: 'A', text: 'option text'}, ...]
  correct_answer TEXT NOT NULL -- for MC: 'A', for SA: the correct text
);

-- Create tryout sessions table (periods when try-outs are available)
CREATE TABLE IF NOT EXISTS tryout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  name TEXT NOT NULL
);

-- Create user tryouts table (records of users taking try-outs)
CREATE TABLE IF NOT EXISTS user_tryouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES tryout_sessions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'scored')),
  final_score NUMERIC
);

-- Create user answers table (individual answers to questions)
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_tryout_id UUID NOT NULL REFERENCES user_tryouts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  is_flagged BOOLEAN DEFAULT FALSE
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tryouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can do anything with profiles"
  ON profiles FOR ALL TO authenticated
  USING (is_admin = TRUE OR id = auth.uid());

CREATE POLICY "Admins can do anything with packages"
  ON packages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can do anything with subtests"
  ON subtests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can do anything with questions"
  ON questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can do anything with tryout_sessions"
  ON tryout_sessions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can access all user_tryouts"
  ON user_tryouts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can access all user_answers"
  ON user_answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Create policies for user access
CREATE POLICY "Users can read active packages"
  ON packages FOR SELECT TO authenticated
  USING (active = TRUE OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Users can read active tryout_sessions"
  ON tryout_sessions FOR SELECT TO authenticated
  USING (is_active = TRUE OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Users can read their own tryouts"
  ON user_tryouts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Users can insert their own tryouts"
  ON user_tryouts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR 
              EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Users can update their own tryouts"
  ON user_tryouts FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Users can read their own answers"
  ON user_answers FOR SELECT TO authenticated
  USING ((EXISTS (SELECT 1 FROM user_tryouts WHERE id = user_tryout_id AND user_id = auth.uid())) OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Users can insert their own answers"
  ON user_answers FOR INSERT TO authenticated
  WITH CHECK ((EXISTS (SELECT 1 FROM user_tryouts WHERE id = user_tryout_id AND user_id = auth.uid())) OR 
              EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Users can update their own answers"
  ON user_answers FOR UPDATE TO authenticated
  USING ((EXISTS (SELECT 1 FROM user_tryouts WHERE id = user_tryout_id AND user_id = auth.uid())) OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, is_admin)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', FALSE);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();