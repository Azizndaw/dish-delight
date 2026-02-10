import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { categories, senegalRegions } from "@/data/products";
import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";

const Catalogue = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [location, setLocation] = useState("all");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState("recent");

  const { data: products = [], isLoading } = useProducts({ category, search, location, condition, maxPrice });

  const sorted = [...products].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0; // default: already sorted by boosted + recent from hook
  });

  const resetFilters = () => {
    setCategory("all");
    setCondition("all");
    setLocation("all");
    setMaxPrice(50000);
    setSearch("");
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Catalogue</h1>
          <p className="mt-2 text-muted-foreground">{sorted.length} articles disponibles</p>
        </div>

        {/* Search and Sort */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un article..."
              className="h-11 pl-10 pr-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Catégorie</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">État</label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les états</SelectItem>
                    <SelectItem value="Neuf">Neuf</SelectItem>
                    <SelectItem value="Très bon état">Très bon état</SelectItem>
                    <SelectItem value="Bon état">Bon état</SelectItem>
                    <SelectItem value="État correct">État correct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Région</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    {senegalRegions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">Prix max : {maxPrice.toLocaleString()} FCFA</label>
                <Slider value={[maxPrice]} onValueChange={([v]) => setMaxPrice(v)} max={50000} step={500} className="mt-2" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" onClick={resetFilters}>Réinitialiser</Button>
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" className={category === "all" ? "bg-primary text-primary-foreground" : ""} onClick={() => setCategory("all")}>
            Tous
          </Button>
          {categories.slice(0, 6).map((cat) => (
            <Button key={cat.id} variant="secondary" size="sm" className={category === cat.id ? "bg-primary text-primary-foreground" : ""} onClick={() => setCategory(cat.id)}>
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">Chargement...</div>
        ) : sorted.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">Aucun article trouvé.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Catalogue;
