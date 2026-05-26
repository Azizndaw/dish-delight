
-- ============= PROFILES: hide email/phone from public =============
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public-safe profile view (no email / no phone)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT user_id, full_name, avatar_url, location, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- RPC for signup email pre-check (replaces direct profiles read)
CREATE OR REPLACE FUNCTION public.email_exists(_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE lower(email) = lower(_email)
      AND email IS NOT NULL
      AND btrim(email) <> ''
  )
$$;
REVOKE EXECUTE ON FUNCTION public.email_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_exists(text) TO anon, authenticated;

-- ============= ORDERS: prevent user_id spoofing =============
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

-- ============= ORDER_ITEMS: caller must own the order =============
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Order owners can create order items"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND (
        (auth.uid() IS NOT NULL AND o.user_id = auth.uid())
        OR (auth.uid() IS NULL AND o.user_id IS NULL)
      )
  )
);

-- ============= NOTIFICATIONS: restrict who can insert =============
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications or admins any"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
);

-- SECURITY DEFINER RPC so any authenticated user can broadcast to admins (e.g. new review)
CREATE OR REPLACE FUNCTION public.notify_admins(
  _type text, _message text, _order_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  FOR r IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, type, message, order_id)
    VALUES (r.user_id, _type, _message, _order_id);
  END LOOP;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_admins(text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.notify_admins(text, text, uuid) TO authenticated;

-- ============= SITE_VISITS: block user_id spoofing =============
DROP POLICY IF EXISTS "Allow anyone to insert visits" ON public.site_visits;
CREATE POLICY "Insert visits with matching user_id"
ON public.site_visits FOR INSERT
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- ============= Revoke EXECUTE on internal trigger functions =============
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_stock_on_order() FROM PUBLIC, anon, authenticated;
