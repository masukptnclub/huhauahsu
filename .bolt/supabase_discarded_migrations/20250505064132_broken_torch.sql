/*
  # Fix Authentication Schema

  1. Changes
    - Create users table to match Supabase auth schema
    - Update profiles table foreign key to reference auth.users instead of public.users
    - Add missing indexes and constraints

  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users
*/

-- Create users table to match Supabase auth schema
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing foreign key constraint from profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add new foreign key constraint referencing auth.users
ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Add policy for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);