CREATE OR REPLACE FUNCTION public.handle_stock_on_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Diminuer le stock du produit (sans désactiver l'annonce)
  UPDATE public.products
  SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
  WHERE id = NEW.product_id;

  -- Notification au vendeur
  INSERT INTO public.notifications (user_id, type, message, order_id)
  SELECT 
    p.user_id, 
    'product_sold', 
    '🎉 Votre produit "' || p.title || '" a été vendu !',
    NEW.order_id
  FROM public.products p
  WHERE p.id = NEW.product_id;

  RETURN NEW;
END;
$function$;