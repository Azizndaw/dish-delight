import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { notifyAdmins } from "@/hooks/useNotifications";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  productId: string;
  productTitle: string;
  onSubmitted?: () => void;
}

const ReviewDialog = ({ open, onOpenChange, orderId, productId, productTitle, onSubmitted }: ReviewDialogProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment")
        .eq("order_id", orderId)
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setExistingId(data.id);
        setRating(data.rating);
        setComment(data.comment || "");
      } else {
        setExistingId(null);
        setRating(0);
        setComment("");
      }
    })();
  }, [open, user, orderId, productId]);

  const handleSubmit = async () => {
    if (!user || rating < 1) {
      toast.error("Veuillez choisir une note");
      return;
    }
    setSubmitting(true);
    try {
      if (existingId) {
        const { error } = await supabase
          .from("reviews")
          .update({ rating, comment: comment.trim() || null })
          .eq("id", existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reviews").insert({
          order_id: orderId,
          product_id: productId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
        });
        if (error) throw error;
      }
      toast.success("Merci pour votre avis !");
      onOpenChange(false);
      onSubmitted?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erreur lors de l'envoi de l'avis");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Votre avis</DialogTitle>
          <DialogDescription>Notez votre achat : {productTitle}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-9 w-9",
                  (hover || rating) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Partagez votre expérience (optionnel)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || rating < 1}>
            {existingId ? "Mettre à jour" : "Envoyer l'avis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
