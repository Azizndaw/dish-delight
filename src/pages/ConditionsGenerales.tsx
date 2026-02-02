import Layout from "@/components/Layout";

const ConditionsGenerales = () => {
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl mb-8">
            Conditions Générales d'Utilisation
          </h1>
          
          <div className="prose prose-lg text-muted-foreground">
            <p className="lead">
              Bienvenue sur VaisselleSeconde. En utilisant notre plateforme, vous acceptez 
              les présentes conditions générales d'utilisation.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              1. Objet
            </h2>
            <p>
              VaisselleSeconde est une plateforme de mise en relation entre particuliers 
              pour l'achat et la vente de vaisselle d'occasion. Nous ne sommes pas partie 
              aux transactions entre utilisateurs.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              2. Inscription
            </h2>
            <p>
              L'inscription est gratuite et ouverte aux personnes majeures. Vous vous engagez 
              à fournir des informations exactes et à maintenir la confidentialité de vos 
              identifiants de connexion.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              3. Publication d'annonces
            </h2>
            <p>
              Les annonces doivent concerner exclusivement de la vaisselle. Le vendeur garantit 
              être propriétaire des articles proposés. Les annonces doivent être honnêtes et 
              les photos représentatives de l'état réel du produit.
            </p>
            <p>
              Nous nous réservons le droit de supprimer toute annonce ne respectant pas nos règles.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              4. Prix
            </h2>
            <p>
              VaisselleSeconde promeut les petits prix. Nous nous réservons le droit de fixer 
              des prix plafonds par catégorie pour maintenir l'accessibilité de la plateforme.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              5. Transactions
            </h2>
            <p>
              Les transactions s'effectuent directement entre acheteurs et vendeurs, généralement 
              en remise en main propre. VaisselleSeconde ne garantit pas les transactions et 
              n'est pas responsable des litiges entre utilisateurs.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              6. Responsabilités
            </h2>
            <p>
              Les utilisateurs sont responsables du contenu qu'ils publient et des transactions 
              qu'ils effectuent. VaisselleSeconde décline toute responsabilité en cas de litige, 
              d'arnaque ou de produit non conforme.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              7. Modification des CGU
            </h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. 
              Les utilisateurs seront informés des modifications importantes.
            </p>

            <p className="mt-8 text-sm">
              Dernière mise à jour : Février 2026
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConditionsGenerales;
