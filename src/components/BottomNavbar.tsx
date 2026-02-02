import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const BottomNavbar = () => {
    const location = useLocation();
    const { totalItems } = useCart();

    const navItems = [
        { icon: Home, label: "Accueil", href: "/" },
        { icon: Search, label: "Catalogue", href: "/catalogue" },
        { icon: PlusCircle, label: "Vendre", href: "/vendre", primary: true },
        { icon: Heart, label: "Favoris", href: "/favoris" },
        { icon: ShoppingCart, label: "Panier", href: "/panier", badge: totalItems },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-border/40 bg-background/95 p-2 pb-safe backdrop-blur md:hidden">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    to={item.href}
                    className={`relative flex flex-col items-center gap-1 p-2 transition-colors ${isActive(item.href) ? "text-primary" : "text-muted-foreground"
                        }`}
                >
                    <div className={`${item.primary ? "rounded-full bg-primary p-2 text-primary-foreground -mt-8 shadow-lg ring-4 ring-background" : ""}`}>
                        <item.icon className={item.primary ? "h-6 w-6" : "h-5 w-5"} />
                    </div>
                    <span className="text-[10px] font-medium">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {item.badge}
                        </span>
                    )}
                </Link>
            ))}
        </nav>
    );
};

export default BottomNavbar;
