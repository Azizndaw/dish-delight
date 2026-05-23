import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Package, DollarSign, Trash2, ShoppingBag, Clock, Truck, CheckCircle2,
  Search, Eye, EyeOff, Sparkles, AlertTriangle, MapPin, Phone,
  Calendar, BarChart3, Ban, TrendingUp, Globe, Wallet, MessageCircle
} from "lucide-react";
import { formatPrice } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Product } from "@/components/ProductCard";

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  title: string;
}

interface Order {
  id: string;
  user_id: string | null;
  created_at: string;
  full_name: string;
  phone: string;
  address: string;
  total_price: number;
  payment_method: string;
  status: string;
  commission_amount?: number;
  order_items?: OrderItem[];
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  created_at: string;
  avatar_url?: string | null;
}

interface AdminProduct {
  id: string;
  user_id: string;
  title: string;
  category: string;
  condition: string;
  location: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
  is_boosted: boolean;
  stock_quantity?: number;
  created_at: string;
}

interface Visit {
  id: string;
  user_id?: string | null;
  page_path: string;
  created_at: string;
}

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch All Products (including inactive for admin)
  const { data: rawProducts = [], isLoading: isLoadingProducts } = useQuery<AdminProduct[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AdminProduct[];
    },
    enabled: !!isAdmin,
  });

  // Fetch All Orders
  const { data: allOrders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!isAdmin,
  });

  // Fetch All Users (Profiles)
  const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!isAdmin,
  });

  // Fetch sellers info for the selected order
  const { data: orderSellers = [] } = useQuery<{
    productId: string;
    productTitle: string;
    sellerName: string | null;
    sellerPhone: string | null;
    sellerWhatsapp: string | null;
  }[]>({
    queryKey: ["admin-order-sellers", selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.order_items?.length) return [];
      const productIds = selectedOrder.order_items
        .map((it) => it.product_id)
        .filter((id): id is string => !!id);
      if (productIds.length === 0) return [];

      const { data: prods } = await supabase
        .from("products")
        .select("id, title, whatsapp, user_id")
        .in("id", productIds);
      if (!prods || prods.length === 0) return [];

      const userIds = prods.map((p) => p.user_id);
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", userIds);

      return prods.map((p) => {
        const prof = profs?.find((pr) => pr.user_id === p.user_id);
        return {
          productId: p.id,
          productTitle: p.title,
          sellerName: prof?.full_name || null,
          sellerPhone: prof?.phone || null,
          sellerWhatsapp: p.whatsapp || prof?.phone || null,
        };
      });
    },
    enabled: !!isAdmin && !!selectedOrder,
  });

  // Fetch Site Visits (paginated to bypass 1000-row default limit)
  const { data: rawVisits = [], isLoading: isLoadingVisits } = useQuery<Visit[]>({
    queryKey: ["admin-visits"],
    queryFn: async () => {
      const pageSize = 1000;
      let all: Visit[] = [];
      let from = 0;
      // Only fetch last 30 days to keep things light but accurate
      const since = new Date();
      since.setDate(since.getDate() - 30);
      while (true) {
        const { data, error } = await supabase
          .from("site_visits")
          .select("*")
          .gte("created_at", since.toISOString())
          .order("created_at", { ascending: false })
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all = all.concat(data as Visit[]);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
    enabled: !!isAdmin,
    refetchInterval: 30000,
  });

  // True total visits count (not capped by 1000-row limit)
  const { data: totalVisitsCount = 0 } = useQuery<number>({
    queryKey: ["admin-visits-total-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("site_visits")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: !!isAdmin,
    refetchInterval: 30000,
  });

  // Filtered data
  const filteredProducts = useMemo(() => {
    let filtered = rawProducts;
    if (productSearch) {
      const s = productSearch.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
    }
    if (productStatusFilter === "active") filtered = filtered.filter((p) => p.is_active);
    else if (productStatusFilter === "inactive") filtered = filtered.filter((p) => !p.is_active);
    else if (productStatusFilter === "boosted") filtered = filtered.filter((p) => p.is_boosted);
    else if (productStatusFilter === "boost_pending") filtered = filtered.filter((p) => p.is_boosted && !p.is_active);
    return filtered;
  }, [rawProducts, productSearch, productStatusFilter]);

  const filteredOrders = useMemo(() => {
    let filtered = allOrders;
    if (orderSearch) {
      const s = orderSearch.toLowerCase();
      filtered = filtered.filter((o) => o.full_name.toLowerCase().includes(s) || o.id.includes(s));
    }
    if (orderStatusFilter !== "all") filtered = filtered.filter((o) => o.status === orderStatusFilter);
    return filtered;
  }, [allOrders, orderSearch, orderStatusFilter]);

  const filteredProfiles = useMemo(() => {
    const list = !userSearch
      ? [...profiles]
      : profiles.filter((p) => {
          const s = userSearch.toLowerCase();
          return (p.full_name || "").toLowerCase().includes(s) || (p.phone || "").includes(s) || (p.location || "").toLowerCase().includes(s);
        });
    return list.sort((a, b) => {
      const da = allOrders.filter((o) => o.status === "completed" && (o.user_id === a.user_id || (a.phone && o.phone === a.phone))).length;
      const db = allOrders.filter((o) => o.status === "completed" && (o.user_id === b.user_id || (b.phone && o.phone === b.phone))).length;
      return db - da;
    });
  }, [profiles, userSearch, allOrders]);

  // Format visits for chart (last 7 days)
  const visitsByDay = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    });

    const counts = rawVisits.reduce((acc: Record<string, number>, visit: Visit) => {
      const day = new Date(visit.created_at).toLocaleDateString('fr-FR', { weekday: 'short' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return last7Days.map(day => ({
      name: day,
      visites: counts[day] || 0
    }));
  }, [rawVisits]);

  const maxDailyVisits = useMemo(
    () => Math.max(...visitsByDay.map((day) => day.visites), 1),
    [visitsByDay]
  );

  // Top Pages
  const topPages = useMemo(() => {
    const counts = rawVisits.reduce((acc: Record<string, number>, visit: Visit) => {
      acc[visit.page_path] = (acc[visit.page_path] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([path, count]): { path: string, count: number } => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [rawVisits]);

  if (loading || isLoadingProducts || isLoadingOrders || isLoadingProfiles || isLoadingVisits) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <div className="mb-8 space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full max-w-md rounded-lg" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </Layout>
    );
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

  const validateBoost = async (product: AdminProduct) => {
    const { error } = await supabase.from("products").update({ is_active: true }).eq("id", product.id);
    if (error) { toast.error("Erreur lors de la validation"); return; }
    try {
      await createNotification(
        product.user_id,
        "boost_validated",
        `✅ Paiement reçu ! Votre annonce boostée "${product.title}" est maintenant en ligne et mise en avant.`
      );
    } catch (e) { console.error(e); }
    toast.success("Boost validé, annonce publiée");
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
    const order = allOrders.find((o) => o.id === orderId);
    const previousStatus = order?.status;

    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) { toast.error("Erreur"); return; }

    // --- Stock handling for cancellations ---
    if (newStatus === "cancelled" && previousStatus !== "cancelled") {
      if (order && order.order_items) {
        for (const item of order.order_items) {
          if (item.product_id) {
            const { data: product } = await supabase.from("products").select("stock_quantity").eq("id", item.product_id).single();
            if (product) {
              const p = product as unknown as AdminProduct;
              const newStock = (p.stock_quantity || 0) + item.quantity;
              await supabase.from("products").update({ stock_quantity: newStock, is_active: true }).eq("id", item.product_id);
            }
          }
        }
      }
    }

    // Notify Buyer
    try {
      let buyerUserId: string | null = order?.user_id || null;

      // Si commande invité, tenter de retrouver un compte via le téléphone
      if (!buyerUserId && order?.phone) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("phone", order.phone)
          .maybeSingle();
        if (prof?.user_id) buyerUserId = prof.user_id;
      }

      if (buyerUserId) {
        let statusText = newStatus;
        if (newStatus === "processing") statusText = "en cours de traitement";
        else if (newStatus === "shipped") statusText = "expédiée";
        else if (newStatus === "completed") statusText = "livrée";
        else if (newStatus === "cancelled") statusText = "annulée";
        else if (newStatus === "pending") statusText = "en attente";
        else if (newStatus === "confirmed") statusText = "confirmée";
        else if (newStatus === "preparing") statusText = "en préparation";

        await createNotification(
          buyerUserId,
          "order_status",
          `📦 Votre commande #${orderId.slice(0, 8)} est maintenant ${statusText}.`,
          orderId
        );

        if (newStatus === "completed" && previousStatus !== "completed") {
          await createNotification(
            buyerUserId,
            "review_request",
            `⭐ Votre commande est livrée ! Donnez votre avis depuis "Mes achats".`,
            orderId
          );
        }
      }
    } catch (notifyErr) {
      console.error("Error notifying buyer:", notifyErr);
    }


    toast.success(`Statut → ${newStatus}`);
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    // Also invalidate products so stock counts update
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  };

  // Stats
  const completedOrders = allOrders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((acc: number, o) => acc + o.total_price, 0);
  const totalCommissionRevenue = completedOrders.reduce((acc: number, o) => acc + (o.commission_amount || 0), 0);
  const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
  const activeProducts = rawProducts.filter((p) => p.is_active).length;
  const inactiveProducts = rawProducts.length - activeProducts;
  const boostedProducts = rawProducts.filter((p) => p.is_boosted).length;
  const BOOST_PRICE = 500; // Average price in FCFA
  const estimatedBoostRevenue = boostedProducts * BOOST_PRICE;

  // Analytics Helpers
  const totalVisits = totalVisitsCount;

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
  const getUserProductCount = (userId: string) => rawProducts.filter((p) => p.user_id === userId).length;
  const getUserOrderCount = (userId: string, phone?: string | null) =>
    allOrders.filter((o) => o.user_id === userId || (phone && o.phone && o.phone === phone)).length;
  const getUserDeliveredCount = (userId: string, phone?: string | null) =>
    allOrders.filter((o) => o.status === "completed" && (o.user_id === userId || (phone && o.phone && o.phone === phone))).length;
  const maxDelivered = useMemo(
    () => Math.max(0, ...profiles.map((p) => getUserDeliveredCount(p.user_id, p.phone))),
    [profiles, allOrders]
  );

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Tableau de Bord Admin</h1>
          <p className="text-muted-foreground">Gestion centrale de Vide Vaisselle.</p>
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
                  <p className="text-xs text-muted-foreground mt-1">{completedOrders.length} commandes livrées</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-purple-50 dark:bg-purple-900/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Commissions Marché (10%)</CardTitle>
                  <Wallet className="h-4 w-4 text-purple-700" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">{formatPrice(totalCommissionRevenue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Revenu net de la plateforme</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-amber-50 dark:bg-amber-900/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Revenu Boosts (Est.)</CardTitle>
                  <Sparkles className="h-4 w-4 text-amber-700" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-700">{formatPrice(estimatedBoostRevenue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Sur {boostedProducts} annonces boostées</p>
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

              <Card className="border-none shadow-sm bg-purple-50 dark:bg-purple-950/20 col-span-full lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Visites Totales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-700" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">{totalVisits}</div>
                  <p className="text-xs text-muted-foreground mt-1">Sur toute la période</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Analytics Chart */}
              <Card className="border-none shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Fréquentation (7 derniers jours)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full rounded-xl border bg-muted/20 px-3 py-4">
                    <div className="flex h-full items-end justify-between gap-2">
                      {visitsByDay.map((day) => {
                        const barHeight = `${Math.max((day.visites / maxDailyVisits) * 100, day.visites > 0 ? 12 : 4)}%`;

                        return (
                          <div key={day.name} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
                            <div className="flex min-h-6 items-end justify-center text-xs font-semibold text-foreground">
                              {day.visites}
                            </div>
                            <div className="relative flex-1 rounded-md bg-muted/60">
                              <div
                                className="absolute inset-x-0 bottom-0 rounded-md bg-primary/80 transition-all"
                                style={{ height: barHeight }}
                                title={`${day.name} : ${day.visites} visite${day.visites > 1 ? "s" : ""}`}
                              />
                            </div>
                            <div className="text-center text-xs text-muted-foreground">{day.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Pages */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Pages les plus visitées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPages.map((page, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <span className="text-sm truncate font-medium">{page.path === '/' ? 'Accueil' : page.path}</span>
                        </div>
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px]">
                          {page.count} vues
                        </Badge>
                      </div>
                    ))}
                    {topPages.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-4">Aucune donnée de visite.</p>
                    )}
                  </div>
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
                    {allOrders.slice(0, 5).map((order) => (
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
                  <SelectItem value="boost_pending">⏳ Boosts à valider ({rawProducts.filter(p => p.is_boosted && !p.is_active).length})</SelectItem>
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
                  ) : filteredProducts.map((product) => (
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
                          {product.is_boosted && !product.is_active && <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">⏳ Boost à valider</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {product.is_boosted && !product.is_active && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50" title="Valider le Boost (paiement reçu)" onClick={() => validateBoost(product)}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
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
                  ) : filteredOrders.map((order) => (
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
                  ) : filteredProfiles.map((profile) => (
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
                    {selectedOrder.order_items.map((item) => (
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

              {orderSellers.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Coordonnées du/des vendeur(s)</p>
                  <div className="space-y-2">
                    {orderSellers.map((s) => {
                      const wa = (s.sellerWhatsapp || "").replace(/[^\d]/g, "");
                      const waUrl = wa
                        ? `https://wa.me/${wa.startsWith("221") ? wa : "221" + wa}?text=${encodeURIComponent(`Bonjour, une commande vient d'être passée pour votre article "${s.productTitle}" (commande #${selectedOrder.id.slice(0, 8)}) sur Vide Vaisselle.`)}`
                        : null;
                      return (
                        <div key={s.productId} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{s.productTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {s.sellerName || "Vendeur"}{s.sellerPhone ? ` · ${s.sellerPhone}` : ""}
                            </p>
                          </div>
                          {waUrl && (
                            <a href={waUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-1.5 h-8">
                                <MessageCircle className="h-3.5 w-3.5" />
                                WhatsApp
                              </Button>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
