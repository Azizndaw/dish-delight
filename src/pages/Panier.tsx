import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import { Minus, Plus, Trash2, ChevronLeft, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const Panier = () => {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    if (cart.length === 0) {
        return (
            <Layout>
                <div className="container py-20 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                        </div>
                    </div>
                    <h1 className="font-display text-2xl font-bold">Votre panier est vide</h1>
                    <p className="mt-2 text-muted-foreground">
                        Découvrez notre vaisselle d'occasion et faites de bonnes affaires !
                    </p>
                    <Link to="/catalogue" className="mt-8 inline-block">
                        <Button variant="hero" size="lg">
                            Voir le catalogue
                        </Button>
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container py-8 md:py-12">
                <Link
                    to="/catalogue"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Continuer mes achats
                </Link>

                <h1 className="font-display text-3xl font-bold mb-8">Mon Panier ({totalItems})</h1>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 rounded-xl border border-border p-4 bg-card animate-fade-up"
                            >
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                </div>

                                <div className="flex flex-1 flex-col justify-between">
                                    <div className="flex justify-between gap-2">
                                        <div>
                                            <h3 className="font-medium text-foreground line-clamp-1">{item.title}</h3>
                                            <p className="text-xs text-muted-foreground">{item.location}</p>
                                        </div>
                                        <p className="font-bold text-primary">{formatPrice(item.price)}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10 h-8 w-8"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-border bg-card p-6 sticky top-24">
                            <h2 className="font-display text-xl font-bold mb-4">Résumé</h2>

                            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-border">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sous-total</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Frais de livraison</span>
                                    <span className="text-sage-dark font-medium">Calculés à l'étape suivante</span>
                                </div>
                            </div>

                            <div className="flex justify-between font-bold text-lg mb-6">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(totalPrice)}</span>
                            </div>

                            <Link to="/commande">
                                <Button className="w-full h-12 text-base" variant="hero">
                                    Passer la commande
                                </Button>
                            </Link>

                            <p className="mt-4 text-center text-xs text-muted-foreground">
                                Paiement à la livraison ou via Mobile Money.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Panier;
