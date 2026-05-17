import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import { useAnalytics } from "./hooks/useAnalytics";

// Lazy-load secondary routes to speed up initial load
const Catalogue = lazy(() => import("./pages/Catalogue"));
const Vendre = lazy(() => import("./pages/Vendre"));
const DetailsProduit = lazy(() => import("./pages/DetailsProduit"));
const Panier = lazy(() => import("./pages/Panier"));
const Commande = lazy(() => import("./pages/Commande"));
const Connexion = lazy(() => import("./pages/Connexion"));
const Favoris = lazy(() => import("./pages/Favoris"));
const CommentCaMarche = lazy(() => import("./pages/CommentCaMarche"));
const APropos = lazy(() => import("./pages/APropos"));
const Contact = lazy(() => import("./pages/Contact"));
const ConditionsGenerales = lazy(() => import("./pages/ConditionsGenerales"));
const Confidentialite = lazy(() => import("./pages/Confidentialite"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Compte = lazy(() => import("./pages/Compte"));
const MesAnnonces = lazy(() => import("./pages/MesAnnonces"));
const ModifierAnnonce = lazy(() => import("./pages/ModifierAnnonce"));
const MesAchats = lazy(() => import("./pages/MesAchats"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — évite de re-fetcher en boucle
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const AppContent = () => {
  useAnalytics();
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/vendre" element={<Vendre />} />
        <Route path="/produit/:id" element={<DetailsProduit />} />
        <Route path="/panier" element={<Panier />} />
        <Route path="/commande" element={<Commande />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/favoris" element={<Favoris />} />
        <Route path="/comment-ca-marche" element={<CommentCaMarche />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/conditions-generales" element={<ConditionsGenerales />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/compte" element={<Compte />} />
        <Route path="/mes-annonces" element={<MesAnnonces />} />
        <Route path="/modifier-annonce/:id" element={<ModifierAnnonce />} />
        <Route path="/mes-achats" element={<MesAchats />} />
        <Route path="/notifications" element={<Notifications />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
