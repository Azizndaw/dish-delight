import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Package, TrendingUp, DollarSign, Eye, ShieldCheck, Trash2, Sparkles, ShoppingBag, Clock, Truck, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();

  // Fetch All Products
  const { data: products = [], isLoading: isLoadingProducts } = useProducts({ showInactive: true });

  // Fetch All Orders
  const { data: allOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });

  // Fetch All Users (Profiles)
  const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });

  if (loading || isLoadingProducts || isLoadingOrders || isLoadingProfiles) {
    return <Layout><div className="container py-20 text-center text-muted-foreground">Chargement du tableau de bord...</div></Layout>;
  }

  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const handleHardDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet article DÉFINITIVEMENT ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Erreur lors de la suppression"); return; }
    toast.success("Article supprimé définitivement.");
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Erreur lors de la mise à jour du statut");
      return;
    }

    toast.success(`Statut mis à jour : ${newStatus}`);
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const totalRevenue = allOrders
    .filter(o => o.status === "completed")
    .reduce((acc, order) => acc + order.total_price, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500"><CheckCircle2 className="mr-1 h-3 w-3" />Livré</Badge>;
      case "processing": return <Badge className="bg-blue-500"><Clock className="mr-1 h-3 w-3" />En cours</Badge>;
      case "shipped": return <Badge className="bg-amber-500"><Truck className="mr-1 h-3 w-3" />Expédié</Badge>;
      default: return <Badge variant="secondary">Reçu</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Tableau de Bord Admin</h1>
            <p className="text-muted-foreground">Gestion centrale de VaisselleSeconde.</p>
          </div>
        </div>

        <Tabs defaultValue="stats" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="stats" className="rounded-lg py-2">Statistiques</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg py-2">Annonces</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg py-2">Commandes</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg py-2">Utilisateurs</TabsTrigger>
          </TabsList>

          {/* STATS CONTENT */}
          <TabsContent value="stats" className="space-y-8 animate-fade-up">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-sm bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-primary uppercase tracking-wider">Chiffre d'Affaires</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{formatPrice(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Commandes livrées</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-sage/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-sage-dark uppercase tracking-wider">Total Annonces</CardTitle>
                  <Package className="h-4 w-4 text-sage-dark" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-sage-dark">{products.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Articles en ligne/archives</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-blue-50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Commandes</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-blue-700" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">{allOrders.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Traitées et en cours</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-amber-50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Utilisateurs</CardTitle>
                  <Users className="h-4 w-4 text-amber-700" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-700">{profiles.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Profils enregistrés</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PRODUCTS CONTENT */}
          <TabsContent value="products" className="animate-fade-up">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle>Toutes les Annonces</CardTitle>
                <CardDescription>Gérez la visibilité des articles sur le site.</CardDescription>
              </CardHeader>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 rounded bg-muted overflow-hidden">
                            <img src={product.image} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold line-clamp-1">{product.title}</p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary">{formatPrice(product.price)}</TableCell>
                      <TableCell><Badge variant="outline" className="font-normal">{product.condition}</Badge></TableCell>
                      <TableCell>
                        {product.is_active !== false ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">En ligne</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-500">Inactif / Vendu</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleHardDelete(product.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ORDERS CONTENT */}
          <TabsContent value="orders" className="animate-fade-up">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle>Gestion des Commandes</CardTitle>
                <CardDescription>Suivez et mettez à jour l'expédition des articles.</CardDescription>
              </CardHeader>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{order.full_name}</p>
                          <p className="text-xs text-muted-foreground">{order.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary">{formatPrice(order.total_price)}</TableCell>
                      <TableCell>{getStatusBadge(order.status || "pending")}</TableCell>
                      <TableCell className="text-right">
                        <Select
                          defaultValue={order.status || "pending"}
                          onValueChange={(val) => updateOrderStatus(order.id, val)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs ml-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Reçue</SelectItem>
                            <SelectItem value="processing">En cours</SelectItem>
                            <SelectItem value="shipped">Expédiée</SelectItem>
                            <SelectItem value="completed">Livrée</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* USERS CONTENT */}
          <TabsContent value="users" className="animate-fade-up">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle>Base Utilisateurs</CardTitle>
                <CardDescription>Liste de tous les clients et vendeurs enregistrés.</CardDescription>
              </CardHeader>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-semibold">{profile.full_name || "Nom non renseigné"}</TableCell>
                      <TableCell>{profile.phone || "---"}</TableCell>
                      <TableCell>{profile.location || "---"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
