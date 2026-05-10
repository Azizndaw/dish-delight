
-- Guest Checkout: Allow anyone to create orders
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Guest Checkout: Allow anyone to create order items
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Guest Checkout: Users can view own orders OR guest can view orders with no user_id
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view their own orders" ON public.orders;
CREATE POLICY "Anyone can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Guest Checkout: Allow viewing order items for confirmation page
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Also update orders table to allow NULL user_id
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
