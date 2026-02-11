import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut, Package, Heart, Settings, Shield, ShoppingBag } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const Compte = () => {
    const navigate = useNavigate();
    const { user, signOut, loading, isAdmin } = useAuth();
    const [userData, setUserData] = useState<{ role: string; name: string } | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/connexion");
        } else if (user) {
            setUserData({
                role: isAdmin ? "admin" : "user",
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Utilisateur"
            });
        }
    }, [user, loading, navigate, isAdmin]);

    const handleLogout = async () => {
        await signOut();
        toast.info("Déconnexion réussie");
        navigate("/");
    };

    if (loading || !userData) return <Layout><div className="container py-20 text-center text-muted-foreground">Chargement...</div></Layout>;

    return (
        <Layout>
            <div className="container max-w-4xl py-8 md:py-12">
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold">Mon Compte</h1>
                    <p className="text-muted-foreground">Gérez vos informations et vos annonces.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Sidebar Navigation */}
                    <Card className="md:col-span-1 border-none bg-muted/30">
                        <CardContent className="p-4 space-y-2">
                            <Link to="/favoris">
                                <Button variant="ghost" className="w-full justify-start gap-3">
                                    <Heart className="h-4 w-4" />
                                    Mes Favoris
                                </Button>
                            </Link>
                            <Link to="/mes-annonces">
                                <Button variant="ghost" className="w-full justify-start gap-3">
                                    <ShoppingBag className="h-4 w-4" />
                                    Mes Annonces
                                </Button>
                            </Link>
                            <Link to="/mes-achats">
                                <Button variant="ghost" className="w-full justify-start gap-3">
                                    <Package className="h-4 w-4" />
                                    Mes Achats
                                </Button>
                            </Link>
                            <Link to="/compte">
                                <Button variant="secondary" className="w-full justify-start gap-3">
                                    <Settings className="h-4 w-4" />
                                    Paramètres
                                </Button>
                            </Link>
                            {isAdmin && (
                                <Link to="/admin">
                                    <Button variant="ghost" className="w-full justify-start gap-3 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                        <Shield className="h-4 w-4" />
                                        Espace Admin
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                Déconnexion
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Informations du Profil</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-lg">{userData.name}</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {userData.role === "admin" ? "Administrateur" : "Membre Standard"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 pt-4 border-t">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Statut du compte</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                            <span className="text-sm">Actif</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">
                                        Note : Pour modifier vos informations, veuillez contacter le support.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">Vendre un article ?</h3>
                                        <p className="text-sm text-muted-foreground">Commencez à libérer de l'espace dans votre cuisine dès aujourd'hui.</p>
                                    </div>
                                    <Link to="/vendre">
                                        <Button variant="hero">Publier une annonce</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Compte;
