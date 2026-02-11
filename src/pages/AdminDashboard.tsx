import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Users, Package, DollarSign, Trash2, ShoppingBag, Clock, Truck, CheckCircle2,
  Search, Eye, EyeOff, Sparkles, SparklesIcon, AlertTriangle, MapPin, Phone,
  Calendar, ChevronDown, BarChart3, ArrowUpRight, ArrowDownRight, Ban
} from "lucide-react";
import { formatPrice } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { useState, useMemo } from "react";

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();

  // Search & filter states
  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  // Dialog states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fetch All Products (including inactive for admin)
  const { data: rawProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });

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

  // Filtered data
  const filteredProducts = useMemo(() => {
    let filtered = rawProducts;
    if (productSearch) {
      const s = productSearch.toLowerCase();
      filtered = filtered.filter((p: any) => p.title.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
    }
    if (productStatusFilter === "active") filtered = filtered.filter((p: any) => p.is_active);
    else if (productStatusFilter === "inactive") filtered = filtered.filter((p: any) => !p.is_active);
    else if (productStatusFilter === "boosted") filtered = filtered.filter((p: any) => p.is_boosted);
    return filtered;
  }, [rawProducts, productSearch, productStatusFilter]);

  const filteredOrders = useMemo(() => {
    let filtered = allOrders;
    if (orderSearch) {
      const s = orderSearch.toLowerCase();
      filtered = filtered.filter((o: any) => o.full_name.toLowerCase().includes(s) || o.id.includes(s));
    }
    if (orderStatusFilter !== "all") filtered = filtered.filter((o: any) => o.status === orderStatusFilter);
    return filtered;
  }, [allOrders, orderSearch, orderStatusFilter]);

  const filteredProfiles = useMemo(() => {
    if (!userSearch) return profiles;
    const s = userSearch.toLowerCase();
    return profiles.filter((p: any) => (p.full_name || "").toLowerCase().includes(s) || (p.phone || "").includes(s) || (p.location || "").toLowerCase().includes(s));
  }, [profiles, userSearch]);

  if (loading || isLoadingProducts || isLoadingOrders || isLoadingProfiles) {
    return <Layout><div className="container py-20 text-center text-muted-foreground">Chargement du tableau de bord...</div></Layout>;
  }

  if (!user || !isAdmin) return <Navigate to="/" replace />;

  // Actions
  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: !currentActive }).eq("id", id);
    if (error) { toast.error("Erreur"); return; }
    toast.success(currentActive ? "Annonce désactivée" : "Annonce réactivée");
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const toggleBoost = async (id: string, currentBoosted: boolean) => {
    const { error } = await supabase.from("products").update({ is_boosted: !currentBoosted }).eq("id", id);
    if (error) { toast.error("Erreur"); return; }
    toast.success(currentBoosted ? "Boost retiré" : "Annonce boostée !");
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const handleHardDelete = async (id: string) => {
    if (!confirm("Supprimer cet article DÉFINITIVEMENT ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Erreur lors de la suppression"); return; }
    toast.success("Article supprimé.");
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) { toast.error("Erreur"); return; }
    toast.success(`Statut → ${newStatus}`);
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  // Stats
  const totalRevenue = allOrders.filter((o: any) => o.status === "completed").reduce((acc: number, o: any) => acc + o.total_price, 0);
  const pendingOrders = allOrders.filter((o: any) => o.status === "pending").length;
  const activeProducts = rawProducts.filter((p: any) => p.is_active).length;
  const inactiveProducts = rawProducts.length - activeProducts;
  const boostedProducts = rawProducts.filter((p: any) => p.is_boosted).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500 text-white"><CheckCircle2 className="mr-1 h-3 w-3" />Livré</Badge>;
      case "processing": return <Badge className="bg-blue-500 text-white"><Clock className="mr-1 h-3 w-3" />En cours</Badge>;
      case "shipped": return <Badge className="bg-amber-500 text-white"><Truck className="mr-1 h-3 w-3" />Expédié</Badge>;
      case "cancelled": return <Badge variant="destructive"><Ban className="mr-1 h-3 w-3" />Annulée</Badge>;
      default: return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Reçue</Badge>;
    }
  };

  // Get user's product count
  const getUserProductCount = (userId: string) => rawProducts.filter((p: any) => p.user_id === userId).length;
  const getUserOrderCount = (userId: string) => allOrders.filter((o: any) => o.user_id === userId).length;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Tableau de Bord Admin</h1>
          <p className="text-muted-foreground">Gestion centrale de VaisselleSeconde.</p>
        </div>

        <Tabs defaultValue="stats" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="stats" className="rounded-lg py-2">📊 Statistiques</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg py-2">📦 Annonces ({rawProducts.length})</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg py-2">🛒 Commandes ({allOrders.length})</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg py-2">👥 Utilisateurs ({profiles.length})</TabsTrigger>
          </TabsList>

          {/* ==================== STATS ==================== */}
          <TabsContent value="stats" className="space-y-8 animate-fade-up">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-sm bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-primary uppercase tracking-wider">Chiffre d'Affaires</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">{allOrders.filter((o: any) => o.status === "completed").length} commandes livrées</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-amber-50 dark:bg-amber-950/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Commandes en attente</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-700" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-700">{pendingOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">À traiter rapidement</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-green-50 dark:bg-green-950/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-green-700 uppercase tracking-wider">Annonces actives</CardTitle>
                  <Package className="h-4 w-4 text-green-700" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{activeProducts}</div>
                  <p className="text-xs text-muted-foreground mt-1">{inactiveProducts} inactives · {boostedProducts} boostées</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-blue-50 dark:bg-blue-950/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Utilisateurs</CardTitle>
                  <Users className="h-4 w-4 text-blue-700" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{profiles.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Inscrits sur la plateforme</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent orders */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Dernières Commandes</CardTitle>
              </CardHeader>
              <CardContent>
                {allOrders.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">Aucune commande pour le moment.</p>
                ) : (
                  <div className="space-y-3">
                    {allOrders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.status)}
                          <div>
                            <p className="font-medium text-sm">{order.full_name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
                          </div>
                        </div>
                        <span className="font-bold text-primary text-sm">{formatPrice(order.total_price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== PRODUCTS ==================== */}
          <TabsContent value="products" className="animate-fade-up space-y-4">
            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher une annonce..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={productStatusFilter} onValueChange={setProductStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous ({rawProducts.length})</SelectItem>
                  <SelectItem value="active">Actifs ({activeProducts})</SelectItem>
                  <SelectItem value="inactive">Inactifs ({inactiveProducts})</SelectItem>
                  <SelectItem value="boosted">Boostés ({boostedProducts})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead className="hidden md:table-cell">Lieu</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun résultat</TableCell></TableRow>
                  ) : filteredProducts.map((product: any) => (
                    <TableRow key={product.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
                            <img src={product.image_url || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm line-clamp-1">{product.title}</p>
                            <p className="text-xs text-muted-foreground">{product.category} · {product.condition}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary text-sm">{formatPrice(product.price)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{product.location}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.is_active ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">En ligne</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Inactif</Badge>
                          )}
                          {product.is_boosted && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">⭐ Boosté</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={product.is_active ? "Désactiver" : "Réactiver"} onClick={() => toggleActive(product.id, !!product.is_active)}>
                            {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={product.is_boosted ? "Retirer boost" : "Booster"} onClick={() => toggleBoost(product.id, !!product.is_boosted)}>
                            <Sparkles className={`h-4 w-4 ${product.is_boosted ? "text-amber-500" : ""}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleHardDelete(product.id)}>
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

          {/* ==================== ORDERS ==================== */}
          <TabsContent value="orders" className="animate-fade-up space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher par client ou n° commande..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">Reçue</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="shipped">Expédiée</SelectItem>
                  <SelectItem value="completed">Livrée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden md:table-cell">Adresse</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune commande</TableCell></TableRow>
                  ) : filteredOrders.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <TableCell className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm">{order.full_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{order.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">{order.address}</TableCell>
                      <TableCell className="font-bold text-primary text-sm">{formatPrice(order.total_price)}</TableCell>
                      <TableCell>{getStatusBadge(order.status || "pending")}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Select defaultValue={order.status || "pending"} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                          <SelectTrigger className="w-[130px] h-8 text-xs ml-auto"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Reçue</SelectItem>
                            <SelectItem value="processing">En cours</SelectItem>
                            <SelectItem value="shipped">Expédiée</SelectItem>
                            <SelectItem value="completed">Livrée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ==================== USERS ==================== */}
          <TabsContent value="users" className="animate-fade-up space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un utilisateur..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9" />
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Localisation</TableHead>
                    <TableHead className="hidden md:table-cell">Annonces</TableHead>
                    <TableHead className="hidden md:table-cell">Commandes</TableHead>
                    <TableHead>Inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun utilisateur trouvé</TableCell></TableRow>
                  ) : filteredProfiles.map((profile: any) => (
                    <TableRow key={profile.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {(profile.full_name || "?")[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-sm">{profile.full_name || "Non renseigné"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{profile.phone || <span className="text-muted-foreground">---</span>}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {profile.location ? <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.location}</span> : "---"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">{getUserProductCount(profile.user_id)} annonces</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">{getUserOrderCount(profile.user_id)} commandes</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(profile.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ==================== ORDER DETAIL DIALOG ==================== */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Commande #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription>Détails complets de la commande</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Client</p>
                  <p className="font-semibold">{selectedOrder.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Téléphone</p>
                  <p className="font-semibold">{selectedOrder.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Adresse de livraison</p>
                  <p className="font-semibold">{selectedOrder.address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Méthode de paiement</p>
                  <p className="font-semibold capitalize">{selectedOrder.payment_method === "cod" ? "À la livraison" : selectedOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Articles commandés</p>
                {selectedOrder.order_items?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-2 rounded bg-muted/30">
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-sm text-primary">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun article détaillé.</p>
                )}
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(selectedOrder.total_price)}</span>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Changer le statut</p>
                <Select defaultValue={selectedOrder.status || "pending"} onValueChange={(val) => { updateOrderStatus(selectedOrder.id, val); setSelectedOrder({ ...selectedOrder, status: val }); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Reçue</SelectItem>
                    <SelectItem value="processing">En cours</SelectItem>
                    <SelectItem value="shipped">Expédiée</SelectItem>
                    <SelectItem value="completed">Livrée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;
