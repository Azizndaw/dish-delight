-- Ensure unique phone & email in profiles (partial unique indexes)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL AND btrim(phone) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL AND btrim(email) <> '';

-- RPC to check if a phone is already used (callable by anon, returns boolean)
CREATE OR REPLACE FUNCTION public.phone_exists(_phone text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE phone = _phone
      AND phone IS NOT NULL
      AND btrim(phone) <> ''
  )
$$;

GRANT EXECUTE ON FUNCTION public.phone_exists(text) TO anon, authenticated;