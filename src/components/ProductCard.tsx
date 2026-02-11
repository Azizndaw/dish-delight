import { Heart, MapPin, Sparkles, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface Product {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  condition: "Neuf" | "Très bon état" | "Bon état" | "État correct";
  isLot?: boolean;
  isBoosted?: boolean;
  category: string;
  whatsapp?: string;
  description?: string;
  userId?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isLiked = isFavorite(product.id);

  const conditionColors: Record<string, string> = {
    "Neuf": "bg-sage text-sage-dark",
    "Très bon état": "bg-secondary text-secondary-foreground",
    "Bon état": "bg-muted text-muted-foreground",
    "État correct": "bg-muted text-muted-foreground",
  };

  return (
    <Link to={`/produit/${product.id}`}>
      <Card className="group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:shadow-hover hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.isBoosted && (
            <Badge className="absolute left-3 top-3 z-10 bg-amber-500 text-white border-none gap-1 py-1 shadow-sm">
              <Sparkles className="h-3 w-3" />
              À la une
            </Badge>
          )}
          {product.isLot && (
            <Badge className={`absolute left-3 ${product.isBoosted ? 'top-10' : 'top-3'} bg-primary text-primary-foreground`}>
              Lot
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!user) {
                toast.info("Connectez-vous pour ajouter des favoris");
                navigate("/connexion");
                return;
              }
              toggleFavorite.mutate(product.id);
            }}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isLiked ? "fill-primary text-primary" : "text-muted-foreground"
                }`}
            />
          </Button>
        </div>
        <CardContent className="p-3 sm:p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {product.title}
            </h3>
          </div>
          <p className="mb-2 font-display text-base sm:text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={conditionColors[product.condition]}>
              {product.condition}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {product.location}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              className="flex-1 gap-2 text-[10px] sm:text-xs h-8 sm:h-9"
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
              Panier
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
