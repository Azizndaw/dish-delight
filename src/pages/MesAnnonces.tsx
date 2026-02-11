import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles, ChevronLeft, Package, Clock, ShieldCheck, Pencil, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/data/products";

const MesAnnonces = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const queryClient = useQueryClient();

    const { data: products = [], isLoading } = useProducts({
        userId: user?.id,
        showInactive: true
    });

    if (loading || isLoading) {
        return <Layout><div className="container py-20 text-center text-muted-foreground">Chargement...</div></Layout>;
    }

    if (!user) {
        navigate("/connexion");
        return null;
    }

    const handleMarkAsSold = async (id: string) => {
        if (!confirm("Marquer cet article comme vendu ? Il ne sera plus visible dans le catalogue.")) return;

        const { error } = await supabase
            .from("products")
            .update({ is_active: false })
            .eq("id", id);

        if (error) {
            toast.error("Erreur lors de la mise à jour");
            return;
        }

        toast.success("Article marqué comme vendu");
        queryClient.invalidateQueries({ queryKey: ["products"] });
    };

    const handleHardDelete = async (id: string) => {
        if (!confirm("SUPPRESSION INFINITIVE : Êtes-vous sûr ? Cette action est irréversible.")) return;

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {
            toast.error("Erreur l'ors de la suppression définitive");
            return;
        }

        toast.success("Annonce supprimée définitivement");
        queryClient.invalidateQueries({ queryKey: ["products"] });
    };

    const handleReactivate = async (id: string) => {
        const { error } = await supabase
            .from("products")
            .update({ is_active: true })
            .eq("id", id);

        if (error) {
            toast.error("Erreur lors de la réactivation");
            return;
        }

        toast.success("Annonce réactivée !");
        queryClient.invalidateQueries({ queryKey: ["products"] });
    };

    const handleBoost = async (id: string) => {
        const { error } = await supabase
            .from("products")
            .update({ is_boosted: true })
            .eq("id", id);

        if (error) {
            toast.error("Erreur lors du boost");
            return;
        }

        toast.success("Annonce boostée ! (Simulation)");
        queryClient.invalidateQueries({ queryKey: ["products"] });
    };

    return (
        <Layout>
            <div className="container max-w-5xl py-8 md:py-12">
                <Link to="/compte" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    Retour au profil
                </Link>

                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Mes Annonces</h1>
                        <p className="mt-2 text-muted-foreground">Gérez vos articles en vente sur VaisselleSeconde.</p>
                    </div>
                    <Link to="/vendre">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nouvelle annonce
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    {products.length === 0 ? (
                        <Card className="border-dashed py-12 text-center">
                            <CardContent className="space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">Aucune annonce pour le moment</h3>
                                    <p className="text-muted-foreground">Commencez par publier votre premier article.</p>
                                </div>
                                <Link to="/vendre">
                                    <Button variant="outline">Vendre un article</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        products.map((product) => (
                            <Card key={product.id} className={`overflow-hidden transition-all hover:shadow-md ${!product.is_active ? 'opacity-60 grayscale' : ''}`}>
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Image wrapper */}
                                        <div className="relative aspect-square w-full bg-muted sm:w-48">
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="h-full w-full object-cover"
                                            />
                                            {product.isBoosted && (
                                                <Badge className="absolute left-2 top-2 bg-amber-500 hover:bg-amber-600">
                                                    <Sparkles className="mr-1 h-3 w-3" />
                                                    Boosté
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Content wrapper */}
                                        <div className="flex flex-1 flex-col justify-between p-6">
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-display text-xl font-bold">{product.title}</h3>
                                                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                Publié le {new Date(product.createdAt).toLocaleDateString()}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <ShieldCheck className="h-3 w-3" />
                                                                {product.condition}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-display text-lg font-bold text-primary">{formatPrice(product.price)}</p>
                                                        {!product.is_active && <Badge variant="secondary" className="bg-gray-200 text-gray-700">Inactif / Vendu</Badge>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                                                {/* Options communes */}
                                                <Link to={`/modifier-annonce/${product.id}`}>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        <Pencil className="h-4 w-4" />
                                                        Modifier
                                                    </Button>
                                                </Link>

                                                {product.is_active ? (
                                                    <>
                                                        {!product.isBoosted && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                                onClick={() => handleBoost(product.id)}
                                                            >
                                                                <Sparkles className="h-4 w-4" />
                                                                Booster
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-2 text-green-600 hover:bg-green-50 hover:text-green-700 border border-green-200"
                                                            onClick={() => handleMarkAsSold(product.id)}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Vendu
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                        onClick={() => handleReactivate(product.id)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Réactiver
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => handleHardDelete(product.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MesAnnonces;
