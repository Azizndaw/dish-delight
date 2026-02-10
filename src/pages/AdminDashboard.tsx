import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Package, TrendingUp, DollarSign, Eye, ShieldCheck, Trash2, Sparkles } from "lucide-react";
import { formatPrice } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const { data: products = [] } = useProducts();
  const queryClient = useQueryClient();

  if (loading) return <Layout><div className="container py-20 text-center text-muted-foreground">Chargement...</div></Layout>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);
    if (error) { toast.error("Erreur"); return; }
    toast.success("Article désactivé.");
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Tableau de Bord Admin</h1>
          <p className="text-muted-foreground">Gérez les annonces de VaisselleSeconde.</p>
        </div>

        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Annonces</CardTitle><Package className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{products.length}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Toutes les Annonces</CardTitle></CardHeader>
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
              {products.slice(0, 20).map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell><Badge variant="outline">{product.condition}</Badge></TableCell>
                  <TableCell>
                    {product.isBoosted ? <Badge className="bg-amber-500"><Sparkles className="h-3 w-3 mr-1" /> Oui</Badge> : <span className="text-muted-foreground text-xs">Non</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
