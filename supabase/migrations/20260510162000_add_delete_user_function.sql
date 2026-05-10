
-- Function to allow users to delete their own account
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the ID of the user making the request
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users
  -- This will cascade to public.profiles, public.products, etc. due to ON DELETE CASCADE
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
