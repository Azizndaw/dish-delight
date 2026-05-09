CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
ON public.profiles (phone)
WHERE phone IS NOT NULL AND btrim(phone) <> '';

CREATE INDEX IF NOT EXISTS idx_profiles_phone_lookup
ON public.profiles (phone);

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

  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ''),
    normalized_phone
  )
  ON CONFLICT (user_id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        updated_at = now();

  RETURN NEW;
END;
$function$;