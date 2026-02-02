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
      description: "Donnez une seconde vie à votre vaisselle et réduisez le gaspillage. Ensemble pour un Sénégal plus vert.",
    },
    {
      icon: ShoppingBag,
      title: "Petits prix",
      description: "Vaisselle de qualité à prix accessible. Parfait pour les étudiants, familles et petits budgets.",
    },
    {
      icon: Users,
      title: "Communauté locale",
      description: "Achetez et vendez près de chez vous. Remise en main propre ou livraison locale.",
    },
    {
      icon: Shield,
      title: "Simple & fiable",
      description: "Contact direct via WhatsApp. Échanges faciles entre vendeurs et acheteurs.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="container relative z-10 py-12 md:py-20 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-sage/30 px-4 py-1.5 text-sm font-medium text-sage-dark">
                <Sparkles className="h-4 w-4" />
                <span>La marketplace sénégalaise</span>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl text-balance">
                Vaisselle d'occasion à{" "}
                <span className="text-primary">petits prix</span>
              </h1>
              <p className="max-w-xl text-base md:text-lg text-muted-foreground">
                Achetez et vendez votre vaisselle d'occasion partout au Sénégal. 
                Bols, marmites, théières... tout pour équiper votre cuisine à moindre coût.
              </p>
              
              {/* Search Bar */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Rechercher (bol, marmite, théière...)"
                    className="h-12 pl-10 pr-4 bg-background border-border text-base"
                  />
                </div>
                <Button variant="hero" size="lg" className="text-base">
                  Rechercher
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div>
                  <p className="font-display text-2xl md:text-3xl font-bold text-foreground">1 500+</p>
                  <p className="text-sm text-muted-foreground">Annonces actives</p>
                </div>
                <div>
                  <p className="font-display text-2xl md:text-3xl font-bold text-foreground">8 000+</p>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                </div>
                <div>
                  <p className="font-display text-2xl md:text-3xl font-bold text-foreground">14</p>
                  <p className="text-sm text-muted-foreground">Régions</p>
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
      <section className="relative overflow-hidden bg-primary py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--terracotta-light)/0.3),transparent_70%)]" />
        <div className="container relative z-10 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
            Prêt à vendre votre vaisselle ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80">
            Publiez gratuitement votre annonce en quelques minutes. 
            Contact direct via WhatsApp avec les acheteurs.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/vendre">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base">
                Déposer une annonce gratuite
              </Button>
            </Link>
            <Link to="/comment-ca-marche">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground text-base"
              >
                Comment ça marche ?
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
