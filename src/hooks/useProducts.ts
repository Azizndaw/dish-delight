import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DBProduct {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  condition: string;
  location: string;
  whatsapp: string | null;
  image_url: string | null;
  images: string[] | null;
  is_boosted: boolean | null;
  is_lot: boolean | null;
  is_active: boolean | null;
  created_at: string;
}

// Convert DB product to the Product format used by ProductCard
export const toProduct = (p: DBProduct) => {
  const images = p.images && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : []);
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    location: p.location,
    image: images[0] || "https://images.unsplash.com/photo-1621327017866-6fb07e6c96ca?q=80&w=800",
    images: images,
    condition: p.condition as any,
    isLot: p.is_lot ?? false,
    isBoosted: p.is_boosted ?? false,
    category: p.category,
    whatsapp: p.whatsapp ?? undefined,
    description: p.description ?? undefined,
    createdAt: p.created_at,
    userId: p.user_id,
    stockQuantity: (p as any).stock_quantity ?? 1,
  };
};

export const useProducts = (options?: { category?: string; search?: string; location?: string; condition?: string; maxPrice?: number; userId?: string; showInactive?: boolean }) => {
  return useQuery({
    queryKey: ["products", options],
    queryFn: async () => {
      let query = supabase.from("products").select("*");

      if (!options?.showInactive) {
        query = query.eq("is_active", true);
      }

      query = query.order("is_boosted", { ascending: false }).order("created_at", { ascending: false });

      if (options?.userId) {
        query = query.eq("user_id", options.userId);
      }
      if (options?.category && options.category !== "all") {
        query = query.eq("category", options.category);
      }
      if (options?.search) {
        const searchTerm = `%${options.search}%`;
        query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`);
      }
      if (options?.location && options.location !== "all") {
        query = query.ilike("location", `%${options.location}%`);
      }
      if (options?.condition && options.condition !== "all") {
        query = query.eq("condition", options.condition);
      }
      if (options?.maxPrice && options.maxPrice < 50000) {
        query = query.lte("price", options.maxPrice);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data) return [];

      return (data as DBProduct[]).map(toProduct);
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (data) return toProduct(data as DBProduct);
      return null;
    },
  });
};
