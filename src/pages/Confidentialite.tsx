import Layout from "@/components/Layout";

const Confidentialite = () => {
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl mb-8">
            Politique de Confidentialité
          </h1>
          
          <div className="prose prose-lg text-muted-foreground">
            <p className="lead">
              Chez VaisselleSeconde, nous accordons une grande importance à la protection 
              de vos données personnelles. Cette politique explique comment nous collectons, 
              utilisons et protégeons vos informations.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              1. Données collectées
            </h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Informations d'inscription : nom, prénom, email, téléphone</li>
              <li>Informations de profil : photo, localisation</li>
              <li>Données d'annonces : photos, descriptions, prix</li>
              <li>Données de navigation : cookies, adresse IP</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              2. Utilisation des données
            </h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gérer votre compte et vos annonces</li>
              <li>Faciliter la mise en relation entre utilisateurs</li>
              <li>Améliorer nos services</li>
              <li>Vous envoyer des notifications pertinentes</li>
              <li>Assurer la sécurité de la plateforme</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              3. Partage des données
            </h2>
            <p>
              Nous ne vendons jamais vos données personnelles. Certaines informations 
              (prénom, ville, annonces) sont visibles publiquement sur la plateforme. 
              Vos coordonnées complètes ne sont partagées qu'avec votre consentement.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              4. Conservation des données
            </h2>
            <p>
              Vos données sont conservées tant que votre compte est actif. Après suppression 
              de votre compte, les données sont effacées dans un délai de 30 jours, sauf 
              obligation légale de conservation.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              5. Vos droits
            </h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, contactez-nous à : privacy@vaisselleseconde.com
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              6. Cookies
            </h2>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience de navigation. 
              Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
              7. Sécurité
            </h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos 
              données contre tout accès non autorisé, modification ou divulgation.
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

export default Confidentialite;
