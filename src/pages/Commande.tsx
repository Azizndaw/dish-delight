import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/data/products";
import { ChevronLeft, CheckCircle2, Truck, Wallet, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Commande = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Connectez-vous pour passer une commande.");
      navigate("/connexion");
      return;
    }
    setIsSubmitting(true);

    try {
      const { data: order, error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        full_name: fullName,
        phone,
        address,
        payment_method: paymentMethod,
        total_price: totalPrice,
      }).select().single();

      if (orderError) throw orderError;

      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id.length === 36 ? item.id : null, // only UUID product IDs
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) throw itemsError;

      clearCart();
      setIsSuccess(true);
      toast.success("Commande enregistrée !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="container py-20 text-center animate-fade-in">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-primary">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold">Merci pour votre commande !</h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Nous vous contacterons par WhatsApp pour confirmer la livraison.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/catalogue"><Button variant="hero">Retour au catalogue</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Votre panier est vide</h1>
          <Link to="/catalogue" className="mt-4 inline-block text-primary underline">Retour au catalogue</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <Link to="/panier" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Retour au panier
        </Link>

        <h1 className="font-display text-3xl font-bold mb-8">Finaliser ma commande</h1>

        <div className="grid gap-8 lg:grid-cols-5">
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8 animate-fade-up">
            <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-4">
                <MapPin className="h-5 w-5 text-primary" />
                Informations de livraison
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Nom complet</Label>
                  <Input id="fullname" placeholder="Moussa Diop" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" placeholder="77 123 45 67" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" placeholder="Mermoz, près de la Boulangerie" required value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-4">
                <Wallet className="h-5 w-5 text-primary" />
                Mode de paiement
              </h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-4 pt-2">
                <div className="flex items-center space-x-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <p className="font-medium">Paiement à la livraison</p>
                    <p className="text-xs text-muted-foreground">Payez en espèces dès réception.</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="mobile_money" id="mobile_money" />
                  <Label htmlFor="mobile_money" className="flex-1 cursor-pointer">
                    <p className="font-medium">Wave / Orange Money</p>
                    <p className="text-xs text-muted-foreground">Un agent vous contactera.</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-4">
                <Truck className="h-5 w-5 text-primary" />
                Livraison (Tiak-Tiak)
              </h2>
              <div className="flex items-center space-x-3 rounded-lg border border-border p-4 bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Livraison standard à Dakar</p>
                  <p className="text-xs text-muted-foreground">1 500 – 3 000 FCFA selon votre quartier.</p>
                </div>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full h-14 text-lg font-bold" disabled={isSubmitting}>
              {isSubmitting ? "Traitement..." : "Confirmer ma commande"}
            </Button>
          </form>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold mb-6">Récapitulatif</h2>
              <div className="max-h-[300px] overflow-auto space-y-4 mb-6 pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                      <p className="font-bold text-primary mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-6 border-t border-border">
                <div className="flex justify-between text-muted-foreground"><span>Sous-total</span><span>{formatPrice(totalPrice)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Livraison</span><span className="font-medium">À payer au livreur</span></div>
                <div className="flex justify-between font-bold text-xl pt-2"><span>Total</span><span className="text-primary">{formatPrice(totalPrice)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Commande;
