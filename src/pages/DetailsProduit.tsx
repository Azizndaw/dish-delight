import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, MessageCircle, MapPin, Share2, ShieldCheck, Truck, ShoppingCart, Pencil, Trash2, ZoomIn, X } from "lucide-react";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

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
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted group cursor-zoom-in font-display">
              <div
                className="h-full w-full transition-transform duration-500 ease-out"
                style={{
                  transform: isZoomed ? "scale(1.5)" : "scale(1)",
                  cursor: isZoomed ? "zoom-out" : "zoom-in"
                }}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={product.images && product.images.length > 0 ? product.images[currentImageIndex] : product.image}
                  alt={product.title}
                  className="h-full w-full object-cover animate-fade-in"
                />
              </div>

              {/* Zoom Hint Icon */}
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn className="h-4 w-4" />
              </div>

              {product.images && product.images.length > 1 && (
                <>
                  {/* Arrows */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : product.images!.length - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50 z-10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev < product.images!.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100 z-10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  {/* Counter Badge */}
                  <div className="absolute bottom-4 right-4 rounded-lg bg-black/50 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white z-10 font-display">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${currentImageIndex === index
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img src={img} alt={`${product.title} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
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

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
          >
            <X className="h-6 w-6" />
          </button>

          <img
            src={product.images && product.images.length > 0 ? product.images[currentImageIndex] : product.image}
            alt={product.title}
            className="h-auto max-h-[85vh] max-w-[95vw] object-contain animate-in zoom-in-95 duration-300 shadow-2xl"
          />

          {product.images && product.images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : product.images!.length - 1))}
                className="absolute left-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev < product.images!.length - 1 ? prev + 1 : 0))}
                className="absolute right-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
                {currentImageIndex + 1} / {product.images.length}
              </div>
            </>
          )}
        </div>
      )}
    </Layout>
  );
};

export default DetailsProduit;
