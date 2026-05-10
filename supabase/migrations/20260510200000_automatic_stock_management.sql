
-- Fonction automatique pour gérer le stock et la visibilité des produits lors d'une commande
-- Cette fonction s'exécute avec les privilèges administrateur (SECURITY DEFINER)
-- permettant ainsi aux "invités" de mettre à jour le stock indirectement.
CREATE OR REPLACE FUNCTION public.handle_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_user_id UUID;
  v_new_stock INTEGER;
BEGIN
  -- Récupérer les infos du produit
  SELECT title, user_id, stock_quantity INTO v_title, v_user_id, v_new_stock
  FROM public.products
  WHERE id = NEW.product_id;

  IF v_user_id IS NOT NULL THEN
    -- 1. Calculer le nouveau stock
    v_new_stock := GREATEST(0, v_new_stock - NEW.quantity);

    -- 2. Mettre à jour le produit
    UPDATE public.products
    SET 
      stock_quantity = v_new_stock,
      -- Désactiver l'annonce si le stock est épuisé
      is_active = CASE WHEN v_new_stock <= 0 THEN false ELSE is_active END,
      updated_at = now()
    WHERE id = NEW.product_id;

    -- 3. Créer une notification pour le vendeur
    -- Note: La table notifications doit exister
    INSERT INTO public.notifications (user_id, type, message, order_id)
    VALUES (
      v_user_id, 
      'product_sold', 
      '🎉 Votre produit "' || v_title || '" a été commandé ! (Stock restant: ' || v_new_stock || ')',
      NEW.order_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le déclencheur (Trigger) qui s'active à chaque insertion dans order_items
DROP TRIGGER IF EXISTS tr_order_stock_update ON public.order_items;
CREATE TRIGGER tr_order_stock_update
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_stock_on_order();
