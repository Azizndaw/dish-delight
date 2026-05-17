import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice, deliveryZones } from "@/data/products";
import { ChevronLeft, CheckCircle2, Truck, Wallet, MapPin, MessageCircle, ShoppingBag, ArrowRight, Printer } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PhoneInput } from "@/components/ui/phone-input";

interface Order {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  payment_method: string;
  total_price: number;
}

const Commande = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ order: Order, items: { title: string, price: number, quantity: number }[] } | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedZone, setSelectedZone] = useState("");

  const deliveryFee = deliveryZones.find(z => z.id === selectedZone)?.price || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZone) {
      toast.error("Veuillez choisir une zone de livraison.");
      return;
    }

    setIsSubmitting(true);

    try {
      // The user check is removed to allow Guest Checkout.
      // We only link the order to a user_id if they are logged in.

      const { data: order, error: orderError } = await supabase.from("orders").insert({
        user_id: user?.id || null,
        full_name: fullName,
        phone,
        address,
        payment_method: paymentMethod,
        total_price: totalPrice + deliveryFee,
      }).select().single();

      if (orderError) throw orderError;

      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id.length === 36 ? item.id : null,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) throw itemsError;

      // Notifications (vendeur / admins / acheteur) sont envoyées
      // automatiquement par le trigger DB `tr_order_stock_update`.

      // Récupérer les coordonnées des vendeurs pour les afficher
      const productIds = cart.map((i) => i.id).filter((id) => id.length === 36);
      let sellers: SellerInfo[] = [];
      if (productIds.length > 0) {
        const { data: prods } = await supabase
          .from("products")
          .select("id, title, whatsapp, user_id")
          .in("id", productIds);

        if (prods && prods.length > 0) {
          const userIds = prods.map((p) => p.user_id);
          const { data: profs } = await supabase
            .from("profiles")
            .select("user_id, full_name, phone")
            .in("user_id", userIds);

          sellers = prods.map((p) => {
            const prof = profs?.find((pr) => pr.user_id === p.user_id);
            return {
              productId: p.id,
              productTitle: p.title,
              sellerName: prof?.full_name || null,
              sellerPhone: prof?.phone || null,
              sellerWhatsapp: p.whatsapp || prof?.phone || null,
            };
          });
        }
      }

      setSuccessData({ order, items: cart, sellers });
      clearCart();
      setIsSuccess(true);
      toast.success("Commande enregistrée !");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la commande.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && successData) {
    const { order, items, sellers } = successData;
    const whatsappMessage = `Bonjour, je viens de passer une commande sur Vide Vaisselle !%0A%0A🆔 *Commande:* %23${order.id.slice(0, 8)}%0A👤 *Client:* ${order.full_name}%0A📍 *Adresse:* ${order.address}%0A💰 *Total:* ${formatPrice(order.total_price)}%0A%0A*Articles:*%0A${items.map(i => `%E2%80%A2 ${i.title} (x${i.quantity})`).join('%0A')}`;
    // TODO: Replace with actual admin WhatsApp number
    const cleanPhone = order.phone.replace(/[^\d]/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('221') ? cleanPhone : '221' + cleanPhone}?text=${whatsappMessage}`;

    return (
      <Layout>
        <div className="container max-w-2xl py-12 md:py-20 animate-fade-in">
          <div className="text-center mb-10">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold">Merci pour votre commande !</h1>
            <p className="mt-2 text-muted-foreground">Votre commande a été enregistrée sous le numéro <span className="font-mono font-bold text-foreground">#{order.id.slice(0, 8)}</span></p>
          </div>

          <Card className="border-none shadow-xl bg-card overflow-hidden">
            <div className="bg-primary px-6 py-4 text-primary-foreground flex justify-between items-center">
              <span className="font-bold tracking-wider uppercase text-sm">Récapitulatif / Facture</span>
              <Printer className="h-4 w-4 opacity-70 cursor-pointer hover:opacity-100" onClick={() => window.print()} />
            </div>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mb-1">Livré à</p>
                  <p className="font-semibold">{order.full_name}</p>
                  <p className="text-muted-foreground">{order.address}</p>
                  <p className="text-muted-foreground">{order.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mb-1">Détails</p>
                  <p><span className="text-muted-foreground">Date :</span> {new Date().toLocaleDateString('fr-FR')}</p>
                  <p><span className="text-muted-foreground">Paiement :</span> {order.payment_method === 'cod' ? 'À la livraison' : 'Mobile Money'}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-[10px] font-bold">{item.quantity}</span>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {sellers.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mb-3">Contacter le(s) vendeur(s)</p>
                    <div className="space-y-2">
                      {sellers.map((s) => {
                        const wa = (s.sellerWhatsapp || "").replace(/[^\d]/g, "");
                        const waUrl = wa
                          ? `https://wa.me/${wa.startsWith("221") ? wa : "221" + wa}?text=${encodeURIComponent(`Bonjour, je viens de commander "${s.productTitle}" sur Vide Vaisselle (commande #${order.id.slice(0, 8)}).`)}`
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
                </>
              )}

              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Sous-total</span>
                  <span>{formatPrice(items.reduce((acc, i) => acc + (i.price * i.quantity), 0))}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Frais de livraison</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold">Total Payé</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(order.total_price)}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-12 gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Recevoir ma facture sur WhatsApp
                  </Button>
                </a>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/mes-achats" className="w-full">
                    <Button variant="outline" className="w-full gap-2 h-11 text-xs">
                      <ShoppingBag className="h-4 w-4" />
                      Suivre ma commande
                    </Button>
                  </Link>
                  <Link to="/catalogue" className="w-full">
                    <Button variant="ghost" className="w-full gap-2 h-11 text-xs">
                      Continuer mes achats
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-xs text-muted-foreground italic">
            Une confirmation a été envoyée dans votre historique d'achats. <br />
            Merci de faire confiance à Vide Vaisselle !
          </p>
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
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    placeholder="77 123 45 67"
                    disabled={isSubmitting}
                  />
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
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="zone">Zone de livraison</Label>
                  <Select onValueChange={setSelectedZone} required>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choisir votre quartier/zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryZones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} ({formatPrice(zone.price)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedZone && (
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4 bg-muted/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Frais de livraison : {formatPrice(deliveryFee)}</p>
                      <p className="text-xs text-muted-foreground">Livraison rapide par Tiak-Tiak.</p>
                    </div>
                  </div>
                )}
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
                <div className="flex justify-between text-muted-foreground"><span>Livraison</span><span>{selectedZone ? formatPrice(deliveryFee) : "Choisir une zone"}</span></div>
                <div className="flex justify-between font-bold text-xl pt-2"><span>Total</span><span className="text-primary">{formatPrice(totalPrice + deliveryFee)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Commande;
