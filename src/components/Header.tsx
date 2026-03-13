import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Search, Heart, User, ShoppingCart, LogOut, Shield, Bell } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import NotificationBell from "@/components/NotificationBell";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();



  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/catalogue", label: "Catalogue" },
    { href: "/comment-ca-marche", label: "Comment ça marche" },
    { href: "/a-propos", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="font-display text-xl font-bold text-primary-foreground">V</span>
          </div>
          <span className="font-display text-lg font-bold text-foreground sm:text-xl">
            Vide Placard
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${isActive(link.href) ? "text-primary" : "text-muted-foreground"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/catalogue" className="hidden md:flex">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/favoris" className="hidden md:flex">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="icon" title="Espace Admin" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                    <Shield className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <NotificationBell />
              <Link to="/compte">
                <Button variant="ghost" size="icon" title="Mon Profil">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Se déconnecter" className="hidden md:flex">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/connexion" className="flex">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Link to="/panier">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/vendre" className="hidden md:flex">
            <Button variant="hero" size="default">
              Vendre
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="animate-fade-in border-t border-border/40 bg-background md:hidden absolute top-16 left-0 right-0 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="container flex flex-col py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium transition-colors hover:bg-muted ${isActive(link.href) ? "text-primary" : "text-muted-foreground"}`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/favoris"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:bg-muted ${isActive('/favoris') ? "text-primary" : "text-muted-foreground"}`}
            >
              Favoris
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Espace Admin
                  </Link>
                )}
                <Link
                  to="/notifications"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </span>
                </Link>
                <Link
                  to="/compte"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted font-display"
                >
                  Mon Profil
                </Link>
                <Link
                  to="/mes-annonces"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Mes Annonces
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-3 text-left text-sm font-medium text-destructive hover:bg-muted"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/connexion"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted font-display"
              >
                Se connecter / S'inscrire
              </Link>
            )}
            <div className="mt-4 px-4 pb-4">
              <Link to="/vendre" onClick={() => setIsMenuOpen(false)}>
                <Button variant="hero" className="w-full">
                  Vendre ma vaisselle
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
