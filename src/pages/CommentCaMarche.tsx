import Layout from "@/components/Layout";
import { Camera, FileText, MessageCircle, Package, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CommentCaMarche = () => {
  const sellerSteps = [
    {
      icon: Camera,
      title: "Photographiez",
      description: "Prenez de belles photos de votre vaisselle sous différents angles. La qualité des photos augmente vos chances de vente.",
    },
    {
      icon: FileText,
      title: "Décrivez",
      description: "Rédigez une description claire : état, dimensions, marque si connue. Fixez un prix attractif (nous recommandons les petits prix).",
    },
    {
      icon: MessageCircle,
      title: "Échangez",
      description: "Les acheteurs intéressés vous contactent directement. Répondez rapidement et arrangez un rendez-vous pour la remise.",
    },
    {
      icon: Package,
      title: "Vendez",
      description: "Remettez l'article en main propre et recevez votre paiement. Simple, rapide et sans frais !",
    },
  ];

  const buyerSteps = [
    {
      icon: Camera,
      title: "Parcourez",
      description: "Explorez notre catalogue de vaisselle d'occasion. Utilisez les filtres pour trouver exactement ce que vous cherchez.",
    },
    {
      icon: FileText,
      title: "Choisissez",
      description: "Comparez les annonces, vérifiez les photos et descriptions. Ajoutez vos favoris pour les retrouver facilement.",
    },
    {
      icon: MessageCircle,
      title: "Contactez",
      description: "Envoyez un message au vendeur via WhatsApp ou notre système de messagerie. Posez vos questions et organisez la rencontre.",
    },
    {
      icon: Package,
      title: "Récupérez",
      description: "Rencontrez le vendeur, vérifiez l'article et payez en main propre. Profitez de votre nouvelle vaisselle !",
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Comment ça marche ?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            VaisselleSeconde facilite l'achat et la vente de vaisselle d'occasion entre particuliers. 
            Voici comment ça fonctionne.
          </p>
        </div>
      </section>

      {/* Seller Steps */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Pour les vendeurs
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Vendez en 4 étapes simples
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {sellerSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-sage text-sm font-bold text-sage-dark">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < sellerSteps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden -translate-y-1/2 lg:block">
                    <ArrowRight className="h-6 w-6 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/vendre">
              <Button variant="hero" size="xl">
                Déposer une annonce gratuite
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Buyer Steps */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-sage/50 px-4 py-1.5 text-sm font-medium text-sage-dark">
              Pour les acheteurs
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Achetez en toute simplicité
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {buyerSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage text-sage-dark">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/catalogue">
              <Button variant="outline" size="xl">
                Parcourir le catalogue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="rounded-2xl border border-border bg-card p-8 text-center md:p-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Vous avez des questions ?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Notre équipe est là pour vous aider. N'hésitez pas à nous contacter.
            </p>
            <div className="mt-6">
              <Link to="/contact">
                <Button variant="hero">Nous contacter</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CommentCaMarche;
