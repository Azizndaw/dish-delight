ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.user_id
  AND (p.email IS NULL OR btrim(p.email) = '');

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique
ON public.profiles (email)
WHERE email IS NOT NULL AND btrim(email) <> '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  normalized_phone text;
BEGIN
  normalized_phone := NULLIF(COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone), '');

  INSERT INTO public.profiles (user_id, full_name, phone, email)
  VALUES (
    NEW.id,
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ''),
    normalized_phone,
    NULLIF(NEW.email, '')
  )
  ON CONFLICT (user_id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        updated_at = now();

  RETURN NEW;
END;
$function$;