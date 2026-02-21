import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sampleProducts } from "@/data/products";

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
  is_boosted: boolean | null;
  is_lot: boolean | null;
  is_active: boolean | null;
  created_at: string;
}

// Convert DB product to the Product format used by ProductCard
export const toProduct = (p: DBProduct) => ({
  id: p.id,
  title: p.title,
  price: p.price,
  location: p.location,
  image: p.image_url || "https://images.unsplash.com/photo-1621327017866-6fb07e6c96ca?q=80&w=800",
  condition: p.condition as any,
  isLot: p.is_lot ?? false,
  isBoosted: p.is_boosted ?? false,
  category: p.category,
  whatsapp: p.whatsapp ?? undefined,
  description: p.description ?? undefined,
  createdAt: p.created_at,
  userId: p.user_id,
});

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

      // If no DB products yet, return sample products
      if (!data || data.length === 0) {
        let filtered = [...sampleProducts];
        if (options?.category && options.category !== "all") {
          filtered = filtered.filter(p => p.category === options.category);
        }
        if (options?.search) {
          const s = options.search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          filtered = filtered.filter(p => {
            const title = (p.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const desc = (p.description || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const cat = (p.category || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return title.includes(s) || desc.includes(s) || cat.includes(s);
          });
        }

        // Ensure boosted products appear first even in sample data
        filtered = filtered.sort((a, b) => {
          if (a.isBoosted && !b.isBoosted) return -1;
          if (!a.isBoosted && b.isBoosted) return 1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

        if (options?.maxPrice && options.maxPrice < 50000) {
          filtered = filtered.filter(p => p.price <= options.maxPrice!);
        }
        return filtered;
      }

      return (data as DBProduct[]).map(toProduct);
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      // First try DB
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

      if (data) return toProduct(data as DBProduct);

      // Fallback to sample products
      const sample = sampleProducts.find(p => p.id === id);
      if (sample) return sample;

      return null;
    },
  });
};
