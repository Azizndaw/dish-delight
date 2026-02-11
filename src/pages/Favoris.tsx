import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";

const Favoris = () => {
  const { user } = useAuth();
  const { favorites, isLoading: favsLoading, toggleFavorite } = useFavorites();
  const { data: allProducts = [] } = useProducts();

  const favoriteProducts = allProducts.filter((p) => favorites.includes(p.id));

  if (!user) {
    return (
      <Layout>
        <div className="container py-12 md:py-20 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">Vos Favoris</h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">Connectez-vous pour voir vos favoris.</p>
          <div className="mt-10">
            <Link to="/connexion"><Button variant="hero">Se connecter</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="font-display text-3xl font-bold mb-8">Vos Favoris</h1>
        {favsLoading ? (
          <div className="py-20 text-center text-muted-foreground">Chargement...</div>
        ) : favoriteProducts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground max-w-md mx-auto">Aucun favori pour le moment.</p>
            <div className="mt-10">
              <Link to="/catalogue"><Button variant="hero" className="gap-2"><ShoppingBag className="h-4 w-4" />Parcourir le catalogue</Button></Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="space-y-3">
                <ProductCard product={product} />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-destructive hover:bg-destructive/10"
                  onClick={() => toggleFavorite.mutate(product.id)}
                >
                  <Heart className="h-4 w-4 fill-current" />
                  Retirer
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favoris;
