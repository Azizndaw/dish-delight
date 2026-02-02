import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Package, TrendingUp, DollarSign, Eye, ShieldCheck, MoreVertical, Trash2, Sparkles } from "lucide-react";
import { sampleProducts, formatPrice } from "@/data/products";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const AdminDashboard = () => {
    const [products, setProducts] = useState(sampleProducts);
    const [stats, setStats] = useState({
        totalVisits: 1240,
        activeUsers: 85,
        totalSales: 450000,
        boostRevenue: 12500
    });

    useEffect(() => {
        const userProducts = JSON.parse(localStorage.getItem("userProducts") || "[]");
        setProducts([...userProducts, ...sampleProducts]);
    }, []);

    const handleDelete = (id: string) => {
        if (confirm("Voulez-vous vraiment supprimer cet article ?")) {
            const updated = products.filter(p => p.id !== id);
            setProducts(updated);
            toast.success("Article supprimé de l'inventaire.");
        }
    };

    const statsCards = [
        { title: "Visites (30 jours)", value: stats.totalVisits, icon: Eye, color: "text-blue-500", trend: "+12%" },
        { title: "Annonces Actives", value: products.length, icon: Package, color: "text-primary", trend: "+5%" },
        { title: "Vendeurs", value: stats.activeUsers, icon: Users, color: "text-sage-dark", trend: "+8%" },
        { title: "Revenu Boost", value: formatPrice(stats.boostRevenue), icon: DollarSign, color: "text-amber-500", trend: "+25%" },
    ];

    return (
        <Layout>
            <div className="container py-8 md:py-12">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">Tableau de Bord Admin</h1>
                        <p className="text-muted-foreground">Bienvenue, Gérant de Dish Delight. Voici l'état de votre site.</p>
                    </div>
                    <Button className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Rapport Complet
                    </Button>
                </div>

                {/* KPI Grid */}
                <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">{stat.title}</CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-green-600 mt-1 font-medium">{stat.trend} par rapport au mois dernier</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Section */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Recent Products Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Dernières Annonces</CardTitle>
                                <Button variant="ghost" size="sm" className="text-xs">Voir tout</Button>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Article</TableHead>
                                        <TableHead>Prix</TableHead>
                                        <TableHead>État</TableHead>
                                        <TableHead>Boost</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.slice(0, 8).map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.title}</TableCell>
                                            <TableCell>{formatPrice(product.price)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{product.condition}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {product.isBoosted ? (
                                                    <Badge className="bg-amber-500"><Sparkles className="h-3 w-3 mr-1" /> Oui</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">Non</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>

                    {/* Quick Actions & Tips */}
                    <div className="space-y-6">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-lg">Conseils de Croissance</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-4 text-muted-foreground">
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">1</div>
                                    <p>Boostez votre SEO en ajoutant des descriptions plus longues aux catégories.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">2</div>
                                    <p>Relancez les vendeurs qui n'ont pas vendu leurs marmites après 15 jours.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">3</div>
                                    <p>Partagez les nouvelles théières sur votre statut WhatsApp Admin.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Sécurité et Accès</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-green-500" />
                                        Base de données connectée
                                    </span>
                                    <Badge variant="outline">OK</Badge>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[10px] text-muted-foreground mb-4">
                                        Pour des statistiques de connexion plus avancées (temps réel), l'intégration de <strong>Google Analytics</strong> est recommandée.
                                    </p>
                                    <Button variant="outline" className="w-full text-xs" onClick={() => window.open('https://analytics.google.com', '_blank')}>
                                        Ouvrir Analytics
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
