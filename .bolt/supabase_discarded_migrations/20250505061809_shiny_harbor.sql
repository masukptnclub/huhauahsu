/*
  # Grant admin access
  
  1. Changes
    - Updates the is_admin flag for a specific user based on their email
    
  2. Security
    - Only affects a single user profile
    - Requires manual email specification
*/

DO $$ 
BEGIN
  UPDATE profiles
  SET is_admin = true
  FROM auth.users
  WHERE profiles.id = auth.users.id
  AND auth.users.email = 'your-email@example.com';  -- Replace with your email
END $$;