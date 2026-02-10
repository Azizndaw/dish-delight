import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Connexion = () => {
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (isLogin) {
            const { error } = await signIn(email, password);
            setIsLoading(false);
            if (error) {
                toast.error(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : error.message);
            } else {
                toast.success("Connexion réussie !");
                navigate("/");
            }
        } else {
            const { error } = await signUp(email, password, fullName);
            setIsLoading(false);
            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
            }
        }
    };

    return (
        <Layout>
            <div className="container max-w-md py-12 md:py-20">
                <Link
                    to="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Retour à l'accueil
                </Link>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-medium animate-fade-up">
                    <div className="mb-8 text-center">
                        <h1 className="font-display text-2xl font-bold">
                            {isLogin ? "Bon retour !" : "Créer un compte"}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {isLogin
                                ? "Connectez-vous pour gérer vos annonces et favoris."
                                : "Rejoignez la plus grande communauté de vente de vaisselle."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input id="name" placeholder="Moussa Diop" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="moussa@exemple.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Mot de passe</Label>
                            </div>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                            {isLoading ? "Traitement..." : (isLogin ? "Se connecter" : "S'inscrire")}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">
                            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                        </span>{" "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-semibold text-primary hover:underline"
                        >
                            {isLogin ? "S'inscrire" : "Se connecter"}
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Connexion;
