import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, MessageCircle, MapPin, Share2, ShieldCheck, Truck, ShoppingCart, Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useProduct } from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const DetailsProduit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: product, isLoading } = useProduct(id || "");

  const isOwner = user?.id === product?.userId;

  if (isLoading) {
    return <Layout><div className="container py-20 text-center text-muted-foreground">Chargement...</div></Layout>;
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Produit non trouvé</h1>
          <Link to="/catalogue" className="mt-4 inline-block text-primary underline">Retour au catalogue</Link>
        </div>
      </Layout>
    );
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Bonjour, je suis intéressé par "${product.title}" sur VaisselleSeconde.`);
    const phoneNumber = product.whatsapp || "770000000";
    window.open(`https://wa.me/221${phoneNumber.replace(/\s/g, '')}?text=${message}`, "_blank");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié !");
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cette annonce définitivement ?")) return;

    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    toast.success("Annonce supprimée");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    navigate("/mes-annonces");
  };

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Link to="/catalogue" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Retour au catalogue
          </Link>

          {isOwner && (
            <div className="flex gap-3">
              <Link to={`/modifier-annonce/${product.id}`}>
                <Button variant="outline" className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleDelete} className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-4">
                <Badge variant="secondary" className="mb-2">{product.condition}</Badge>
                <Button variant="ghost" size="icon" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">{product.title}</h1>
              <p className="mt-4 font-display text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{product.location}</span>
            </div>

            <div className="space-y-4 border-y border-border py-6">
              <p className="text-muted-foreground leading-relaxed">
                {product.description || `Magnifique ${product.title.toLowerCase()} en excellent état.`}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div className="text-xs"><p className="font-semibold">Achat sécurisé</p><p className="text-muted-foreground">Paiement à la remise</p></div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div className="text-xs"><p className="font-semibold">Livraison possible</p><p className="text-muted-foreground">Via Tiak-Tiak</p></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={() => addToCart(product)} variant="hero" className="w-full h-12 md:h-14 text-base md:text-lg gap-3">
                <ShoppingCart className="h-5 w-5" />
                Ajouter au panier
              </Button>
              <Button onClick={handleWhatsApp} variant="outline" className="w-full h-12 md:h-14 text-base md:text-lg gap-3 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
                <MessageCircle className="h-5 w-5" />
                Commander sur WhatsApp
              </Button>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <h4 className="font-semibold text-xs md:text-sm mb-2">Conseils de sécurité</h4>
              <ul className="text-[11px] md:text-xs space-y-2 text-muted-foreground">
                <li>• Privilégiez les lieux publics pour la remise.</li>
                <li>• Vérifiez l'article avant de payer.</li>
                <li>• Ne payez pas à l'avance sans avoir vu l'article.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DetailsProduit;
