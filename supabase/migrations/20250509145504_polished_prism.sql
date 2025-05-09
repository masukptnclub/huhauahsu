/*
  # Initial Database Schema Setup

  1. Tables
    - profiles
      - User profile information and authentication
      - Linked to auth.users
    - packages
      - Test packages containing multiple subtests
    - subtests
      - Individual test sections within packages
    - questions
      - Questions for each subtest
    - tryout_sessions
      - Scheduled tryout sessions
    - user_tryouts
      - User's tryout attempts
    - user_answers
      - User's answers for each question

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for admin users

  3. Relationships
    - Foreign key constraints between tables
    - Cascading deletes where appropriate
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  updated_at timestamptz,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  email text UNIQUE NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  active boolean DEFAULT true
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active packages"
  ON packages
  FOR SELECT
  TO authenticated
  USING (active = true OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage packages"
  ON packages
  FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create subtests table
CREATE TABLE IF NOT EXISTS subtests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  package_id uuid REFERENCES packages ON DELETE CASCADE NOT NULL,
  duration integer NOT NULL,
  "order" integer NOT NULL
);

ALTER TABLE subtests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subtests of active packages"
  ON subtests
  FOR SELECT
  TO authenticated
  USING (
    (SELECT active FROM packages WHERE id = package_id) 
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage subtests"
  ON subtests
  FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  subtest_id uuid REFERENCES subtests ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  type text CHECK (type IN ('MC', 'SA')) NOT NULL,
  options jsonb,
  correct_answer text NOT NULL
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions of active packages"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    (SELECT active FROM packages WHERE id = (SELECT package_id FROM subtests WHERE id = subtest_id))
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage questions"
  ON questions
  FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create tryout sessions table
CREATE TABLE IF NOT EXISTS tryout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  package_id uuid REFERENCES packages ON DELETE CASCADE NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  name text NOT NULL
);

ALTER TABLE tryout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active sessions"
  ON tryout_sessions
  FOR SELECT
  TO authenticated
  USING (is_active = true OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage sessions"
  ON tryout_sessions
  FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create user tryouts table
CREATE TABLE IF NOT EXISTS user_tryouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  package_id uuid REFERENCES packages ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES tryout_sessions ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('not_started', 'in_progress', 'completed', 'scored')) DEFAULT 'not_started',
  final_score integer
);

ALTER TABLE user_tryouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tryouts"
  ON user_tryouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create own tryouts"
  ON user_tryouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tryouts"
  ON user_tryouts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user answers table
CREATE TABLE IF NOT EXISTS user_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_tryout_id uuid REFERENCES user_tryouts ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES questions ON DELETE CASCADE NOT NULL,
  answer_text text,
  is_flagged boolean DEFAULT false
);

ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own answers"
  ON user_answers
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM user_tryouts WHERE id = user_tryout_id)
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(active);
CREATE INDEX IF NOT EXISTS idx_subtests_package_id ON subtests(package_id);
CREATE INDEX IF NOT EXISTS idx_questions_subtest_id ON questions(subtest_id);
CREATE INDEX IF NOT EXISTS idx_tryout_sessions_package_id ON tryout_sessions(package_id);
CREATE INDEX IF NOT EXISTS idx_tryout_sessions_dates ON tryout_sessions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_tryouts_user_id ON user_tryouts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tryouts_session_id ON user_tryouts(session_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_tryout_id ON user_answers(user_tryout_id);