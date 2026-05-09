CREATE OR REPLACE FUNCTION public.get_email_for_phone(_phone text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM public.profiles
  WHERE phone = _phone
    AND email IS NOT NULL
    AND btrim(email) <> ''
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_email_for_phone(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_for_phone(text) TO anon, authenticated;