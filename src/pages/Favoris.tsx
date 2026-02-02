import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Heart, ChevronLeft, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const Favoris = () => {
    return (
        <Layout>
            <div className="container py-12 md:py-20 text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Heart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="font-display text-3xl font-bold">Vos Favoris</h1>
                <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                    Vous n'avez pas encore d'articles en favoris. Parcourez le catalogue et cliquez sur le cœur pour les enregistrer ici.
                </p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link to="/catalogue">
                        <Button variant="hero" className="gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Parcourir le catalogue
                        </Button>
                    </Link>
                    <Link to="/">
                        <Button variant="outline">Retour à l'accueil</Button>
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default Favoris;
