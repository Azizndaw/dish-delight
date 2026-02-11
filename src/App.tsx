import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Catalogue from "./pages/Catalogue";
import Vendre from "./pages/Vendre";
import DetailsProduit from "./pages/DetailsProduit";
import Panier from "./pages/Panier";
import Commande from "./pages/Commande";
import Connexion from "./pages/Connexion";
import Favoris from "./pages/Favoris";
import CommentCaMarche from "./pages/CommentCaMarche";
import APropos from "./pages/APropos";
import Contact from "./pages/Contact";
import ConditionsGenerales from "./pages/ConditionsGenerales";
import Confidentialite from "./pages/Confidentialite";
import AdminDashboard from "./pages/AdminDashboard";
import Compte from "./pages/Compte";
import MesAnnonces from "./pages/MesAnnonces";
import ModifierAnnonce from "./pages/ModifierAnnonce";
import MesAchats from "./pages/MesAchats";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
