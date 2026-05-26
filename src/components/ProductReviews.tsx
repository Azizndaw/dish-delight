import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  productId: string;
}

const Stars = ({ value, size = "h-4 w-4" }: { value: number; size?: string }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={cn(size, n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
      />
    ))}
  </div>
);

const ProductReviews = ({ productId }: Props) => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, user_id")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const userIds = Array.from(new Set((data || []).map((r) => r.user_id)));
      let profiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("public_profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);
        profiles = Object.fromEntries((profs || []).map((p) => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }]));
      }
      return (data || []).map((r) => ({ ...r, profile: profiles[r.user_id] || null }));
    },
  });

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-bold">Avis des acheteurs</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={Math.round(avg)} />
            <span className="text-sm font-semibold">{avg.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviews.length})</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {(r.profile?.full_name || "A").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.profile?.full_name || "Acheteur"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </div>
                <Stars value={r.rating} />
              </div>
              {r.comment && <p className="mt-3 text-sm text-foreground leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
