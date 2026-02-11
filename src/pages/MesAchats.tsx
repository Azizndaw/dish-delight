import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ChevronLeft, Package, Clock, Truck, CheckCircle2, Trash2, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { toast } from "sonner";

const MesAchats = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["user-orders", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("orders")
                .select(`
                    *,
                    order_items (*)
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    const handleArchive = (id: string) => {
        // Since we don't have a hidden column in orders yet, we'll simulate it
        toast.success("Achat masqué de votre historique (Simulation)");
        // In a real app, we would update a 'is_hidden' column in the orders table
    };

    if (loading || isLoading) {
        return <Layout><div className="container py-20 text-center text-muted-foreground">Chargement...</div></Layout>;
    }

    if (!user) {
        navigate("/connexion");
        return null;
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed": return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />Livré</Badge>;
            case "processing": return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="mr-1 h-3 w-3" />En cours</Badge>;
            case "shipped": return <Badge className="bg-amber-500 hover:bg-amber-600"><Truck className="mr-1 h-3 w-3" />En cours d'expédition</Badge>;
            default: return <Badge variant="secondary">Reçu</Badge>;
        }
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
                        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Mes Achats</h1>
                        <p className="mt-2 text-muted-foreground">Retrouvez l'historique de vos commandes sur VaisselleSeconde.</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {orders.length === 0 ? (
                        <Card className="border-dashed py-12 text-center">
                            <CardContent className="space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">Vous n'avez pas encore passé de commande</h3>
                                    <p className="text-muted-foreground">Parcourez le catalogue pour trouver votre bonheur.</p>
                                </div>
                                <Link to="/catalogue">
                                    <Button variant="hero">Découvrir le catalogue</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        orders.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium uppercase text-muted-foreground tracking-wider">Commande #{order.id.slice(0, 8)}</p>
                                            <p className="text-sm font-medium">Le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right sm:block hidden">
                                                <p className="text-xs text-muted-foreground">Total</p>
                                                <p className="font-bold text-primary">{formatPrice(order.total_price)}</p>
                                            </div>
                                            {getStatusBadge(order.status || "pending")}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {order.order_items.map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground">Quantité : {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-bold">{formatPrice(item.price)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Adresse de livraison : </span>
                                            <span className="font-medium">{order.address}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="sm:hidden flex justify-between items-center bg-primary/5 p-3 rounded-lg flex-1">
                                                <span className="text-sm font-medium italic">Prix Total</span>
                                                <span className="font-bold text-primary text-lg">{formatPrice(order.total_price)}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-muted-foreground hover:text-destructive gap-2"
                                                onClick={() => handleArchive(order.id)}
                                            >
                                                <EyeOff className="h-4 w-4" />
                                                Masquer
                                            </Button>
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

export default MesAchats;
