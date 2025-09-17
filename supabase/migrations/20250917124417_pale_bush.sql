/*
  # Create Profile on User Signup

  1. Function
    - Creates a trigger function to automatically create profile when user confirms email
    - Extracts user metadata (full_name) and creates profile record
    - Handles role assignment and department defaults

  2. Trigger
    - Fires when a user record is updated (email confirmation)
    - Only creates profile if email_confirmed_at changes from null to a timestamp
    - Prevents duplicate profile creation
*/

-- Function to create profile on email confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only create profile when email is confirmed (email_confirmed_at changes from null to timestamp)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      department,
      employee_id,
      student_id
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', 'Unknown User'),
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
      COALESCE(NEW.raw_user_meta_data->>'department', 'Management Science'),
      NEW.raw_user_meta_data->>'employee_id',
      NEW.raw_user_meta_data->>'student_id'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();