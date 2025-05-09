-- Update the trigger function to properly handle admin status
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
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles to ensure admin status is properly set
UPDATE public.profiles
SET is_admin = COALESCE((
  SELECT (raw_user_meta_data->>'is_admin')::boolean
  FROM auth.users
  WHERE users.id = profiles.id
), false);

-- Add policy to ensure admins can only be created by other admins
CREATE POLICY "Only admins can set admin status"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = id AND OLD.is_admin = NEW.is_admin) OR -- Users can't change their own admin status
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    ) -- Only admins can change other users' admin status
  );