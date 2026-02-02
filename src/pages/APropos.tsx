import Layout from "@/components/Layout";
import { Leaf, Heart, Users, Target } from "lucide-react";

const APropos = () => {
  const values = [
    {
      icon: Leaf,
      title: "Éco-responsabilité",
      description: "Nous croyons en la seconde vie des objets. Chaque assiette revendue, c'est une de moins produite.",
    },
    {
      icon: Heart,
      title: "Accessibilité",
      description: "La vaisselle de qualité ne devrait pas être un luxe. Nous rendons possible l'accès à tous.",
    },
    {
      icon: Users,
      title: "Communauté",
      description: "Nous construisons une communauté de passionnés qui partagent les mêmes valeurs.",
    },
    {
      icon: Target,
      title: "Simplicité",
      description: "Une plateforme intuitive où vendre et acheter ne prend que quelques minutes.",
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              À propos de VaisselleSeconde
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Nous sommes nés d'une conviction simple : la vaisselle inutilisée mérite 
              une seconde vie. Plutôt que de laisser des assiettes, bols et tasses 
              s'accumuler dans les placards, pourquoi ne pas les partager ?
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">
              Notre histoire
            </h2>
            <div className="prose prose-lg text-muted-foreground">
              <p>
                VaisselleSeconde est né d'un constat simple : chaque année, des milliers 
                de pièces de vaisselle en parfait état finissent oubliées dans des cartons 
                ou pire, à la poubelle.
              </p>
              <p className="mt-4">
                Parallèlement, de nombreuses personnes — étudiants qui s'installent, jeunes 
                couples qui démarrent, familles à budget serré — peinent à s'équiper 
                sans se ruiner.
              </p>
              <p className="mt-4">
                Notre mission ? Créer le pont entre ces deux mondes. Une plateforme 
                nationale où chacun peut facilement vendre ce qu'il n'utilise plus et 
                acheter à petit prix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Nos valeurs
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ce qui nous guide au quotidien
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div 
                key={value.title}
                className="rounded-2xl border border-border/50 bg-card p-6 text-center transition-all hover:shadow-medium"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <value.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Notre impact
            </h2>
            <p className="mt-4 text-muted-foreground">
              Ensemble, nous faisons la différence
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="font-display text-4xl font-bold text-primary">15 000+</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Utilisateurs actifs sur la plateforme
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="font-display text-4xl font-bold text-primary">50 000+</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Articles vendus depuis le lancement
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="font-display text-4xl font-bold text-primary">25 tonnes</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  De vaisselle sauvée de la poubelle
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default APropos;
