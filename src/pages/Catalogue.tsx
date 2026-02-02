import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { sampleProducts, categories, senegalRegions } from "@/data/products";
import { useState, useEffect } from "react";

const dakarNeighborhoods = [
  "Almadies", "Plateau", "Médina", "Grand Yoff", "Parcelles Assainies",
  "Pikine", "Guédiawaye", "Rufisque", "Mermoz", "Ouakam", "Ngor"
];

const Catalogue = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [allProducts, setAllProducts] = useState(sampleProducts);

  useEffect(() => {
    const userProducts = JSON.parse(localStorage.getItem("userProducts") || "[]");
    const combined = [...userProducts, ...sampleProducts]
      .sort((a, b) => (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0));
    setAllProducts(combined);
  }, []);

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Catalogue
          </h1>
          <p className="mt-2 text-muted-foreground">
            {allProducts.length} articles disponibles
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un article..."
              className="h-11 pl-10 pr-4"
            />
          </div>
          <div className="flex gap-3">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 animate-fade-in rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold">Filtres</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Catégorie</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">État</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les états" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les états</SelectItem>
                    <SelectItem value="neuf">Neuf</SelectItem>
                    <SelectItem value="tres-bon">Très bon état</SelectItem>
                    <SelectItem value="bon">Bon état</SelectItem>
                    <SelectItem value="correct">État correct</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Localisation</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    {senegalRegions.map((region) => (
                      <SelectItem key={region} value={region.toLowerCase()}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dakar Neighborhood Filter (Simulated/Extra) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Quartier (Dakar)</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les quartiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les quartiers</SelectItem>
                    <SelectItem value="plateau">Plateau</SelectItem>
                    <SelectItem value="almadies">Almadies</SelectItem>
                    <SelectItem value="medina">Médina</SelectItem>
                    <SelectItem value="parcelles">Parcelles Assainies</SelectItem>
                    <SelectItem value="ouakam">Ouakam</SelectItem>
                    <SelectItem value="mermoz">Mermoz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">
                  Prix max : {priceRange[0]} FCFA
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={50000}
                  step={500}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="hero">Appliquer les filtres</Button>
              <Button variant="ghost">Réinitialiser</Button>
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" className="bg-primary text-primary-foreground">
            Tous
          </Button>
          {categories.slice(0, 6).map((cat) => (
            <Button key={cat.id} variant="secondary" size="sm">
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
          {allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            Charger plus d'articles
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Catalogue;
