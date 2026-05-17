
CREATE OR REPLACE FUNCTION public.handle_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_product RECORD;
  v_order RECORD;
  v_admin RECORD;
BEGIN
  -- Récupérer infos commande
  SELECT * INTO v_order FROM public.orders WHERE id = NEW.order_id;

  -- Diminuer le stock du produit
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE id = NEW.product_id;

    -- Récupérer le produit + vendeur
    SELECT id, title, user_id INTO v_product
    FROM public.products WHERE id = NEW.product_id;

    -- Notifier le vendeur
    IF v_product.user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, message, order_id)
      VALUES (
        v_product.user_id,
        'product_sold',
        '🎉 Votre produit "' || v_product.title || '" a été commandé (x' || NEW.quantity || ') !',
        NEW.order_id
      );
    END IF;
  END IF;

  -- Notifier tous les admins
  FOR v_admin IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, type, message, order_id)
    VALUES (
      v_admin.user_id,
      'new_order_admin',
      '📦 Nouvel article commandé "' || NEW.title || '" (x' || NEW.quantity || ') - Commande #' || substr(NEW.order_id::text, 1, 8),
      NEW.order_id
    );
  END LOOP;

  -- Notifier l'acheteur (si connecté)
  IF v_order.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, message, order_id)
    VALUES (
      v_order.user_id,
      'order_placed',
      '✅ Votre commande contenant "' || NEW.title || '" a bien été enregistrée.',
      NEW.order_id
    );
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS tr_order_stock_update ON public.order_items;
CREATE TRIGGER tr_order_stock_update
AFTER INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.handle_stock_on_order();
