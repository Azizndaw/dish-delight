-- ============================================
-- 1. Fonction automatique pour gérer le stock et la visibilité
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Diminuer le stock du produit
  UPDATE public.products
  SET 
    stock_quantity = GREATEST(0, stock_quantity - NEW.quantity),
    -- 2. Désactiver si le stock atteint 0
    is_active = CASE 
      WHEN (stock_quantity - NEW.quantity) <= 0 THEN false 
      ELSE is_active 
    END
  WHERE id = NEW.product_id;

  -- 3. Créer une notification pour le vendeur
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le déclencheur (Trigger)
DROP TRIGGER IF EXISTS tr_order_stock_update ON public.order_items;

CREATE TRIGGER tr_order_stock_update
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_stock_on_order();

-- ============================================
-- 2. Nettoyage des données de test
-- ============================================

-- Vider toutes les notifications de test
TRUNCATE TABLE public.notifications;

-- Vider l'historique des visites du site
TRUNCATE TABLE public.site_visits;

-- Optionnel : Si vous voulez aussi vider les commandes de test (décommentez les lignes ci-dessous)
-- TRUNCATE TABLE public.order_items CASCADE;
-- TRUNCATE TABLE public.orders CASCADE;