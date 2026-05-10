
-- Fonction pour permettre aux utilisateurs de supprimer leur propre compte
-- Nettoie d'abord toutes les données liées dans public, puis supprime auth.users
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur authentifié
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  -- Supprimer les items de commande liés aux commandes de l'utilisateur
  DELETE FROM public.order_items
  WHERE order_id IN (
    SELECT id FROM public.orders WHERE user_id = current_user_id
  );

  -- Supprimer les commandes de l'utilisateur
  DELETE FROM public.orders WHERE user_id = current_user_id;

  -- Supprimer les favoris de l'utilisateur
  DELETE FROM public.favorites WHERE user_id = current_user_id;

  -- Supprimer les notifications de l'utilisateur
  DELETE FROM public.notifications WHERE user_id = current_user_id;

  -- Supprimer les visites de l'utilisateur
  DELETE FROM public.site_visits WHERE user_id = current_user_id;

  -- Supprimer les rôles de l'utilisateur
  DELETE FROM public.user_roles WHERE user_id = current_user_id;

  -- Supprimer les produits de l'utilisateur (annonces)
  DELETE FROM public.products WHERE user_id = current_user_id;

  -- Supprimer le profil de l'utilisateur
  DELETE FROM public.profiles WHERE user_id = current_user_id;

  -- Supprimer l'utilisateur de auth.users
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Donner l'accès à la fonction aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
