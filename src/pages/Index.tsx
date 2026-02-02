import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Leaf, ShoppingBag, Users, Shield, ArrowRight, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import FeatureCard from "@/components/FeatureCard";
import { sampleProducts, categories } from "@/data/products";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const features = [
    {
      icon: Leaf,
      title: "Éco-responsable",
      description: "Donnez une seconde vie à votre vaisselle et réduisez le gaspillage en participant à l'économie circulaire.",
    },
    {
      icon: ShoppingBag,
      title: "Petits prix",
      description: "Trouvez de la vaisselle de qualité à prix mini. Idéal pour les étudiants et les petits budgets.",
    },
    {
      icon: Users,
      title: "Communauté locale",
      description: "Achetez et vendez près de chez vous. Favorisez les échanges locaux et la remise en main propre.",
    },
    {
      icon: Shield,
      title: "Fiable & sécurisé",
      description: "Profils vérifiés, modération des annonces et contact direct entre acheteurs et vendeurs.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="container relative z-10 py-16 md:py-24 lg:py-32">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-sage/30 px-4 py-1.5 text-sm font-medium text-sage-dark">
                <Sparkles className="h-4 w-4" />
                <span>La marketplace éco-responsable</span>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                Votre vaisselle d'occasion à{" "}
                <span className="text-primary">petits prix</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Achetez et vendez de la vaisselle d'occasion partout en France. 
                Donnez une seconde vie à vos assiettes, tasses et couverts tout en faisant des économies.
              </p>
              
              {/* Search Bar */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Rechercher de la vaisselle..."
                    className="h-12 pl-10 pr-4 bg-background border-border"
                  />
                </div>
                <Button variant="hero" size="lg">
                  Rechercher
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-4">
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">2 500+</p>
                  <p className="text-sm text-muted-foreground">Annonces actives</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">15 000+</p>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">98%</p>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-up" style={{ animationDelay: "200ms" }}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-hover">
                <img
                  src={heroImage}
                  alt="Collection de vaisselle d'occasion"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-card p-4 shadow-medium animate-float md:-bottom-8 md:-left-8">
                <p className="font-display text-lg font-bold text-primary">-70%</p>
                <p className="text-xs text-muted-foreground">vs neuf</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Parcourir par catégorie
            </h2>
            <p className="mt-3 text-muted-foreground">
              Trouvez exactement ce que vous cherchez
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/catalogue?category=${category.id}`}
                className="group flex flex-col items-center rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 hover:shadow-medium hover:-translate-y-1 hover:border-primary/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="mb-2 font-medium text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </span>
                <span className="text-xs text-muted-foreground">{category.count} articles</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Dernières annonces
              </h2>
              <p className="mt-2 text-muted-foreground">
                Découvrez les nouveaux articles ajoutés
              </p>
            </div>
            <Link to="/catalogue">
              <Button variant="outline" className="gap-2">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sampleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Pourquoi VaisselleSeconde ?
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Une plateforme simple, fiable et éco-responsable pour acheter et vendre 
              votre vaisselle d'occasion.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--terracotta-light)/0.3),transparent_70%)]" />
        <div className="container relative z-10 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Prêt à vendre votre vaisselle ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Publiez gratuitement votre annonce en quelques minutes et donnez une seconde vie 
            à votre vaisselle inutilisée.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/vendre">
              <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                Déposer une annonce gratuite
              </Button>
            </Link>
            <Link to="/comment-ca-marche">
              <Button 
                variant="outline" 
                size="xl" 
                className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
