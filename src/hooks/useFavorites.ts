import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map(f => f.product_id);
    },
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Non connecté");
      
      const isFav = favoritesQuery.data?.includes(productId);
      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw error;
        return { added: false };
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        return { added: true };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(result.added ? "Ajouté aux favoris" : "Retiré des favoris");
    },
    onError: () => {
      toast.error("Connectez-vous pour ajouter des favoris");
    },
  });

  const isFavorite = (productId: string) => favoritesQuery.data?.includes(productId) ?? false;

  return { favorites: favoritesQuery.data ?? [], isFavorite, toggleFavorite, isLoading: favoritesQuery.isLoading };
};
