import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, ChevronLeft, Upload, Save, X, Sparkles, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { categories, senegalRegions } from "@/data/products";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useProduct } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const ModifierAnnonce = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { data: product, isLoading: isLoadingProduct } = useProduct(id || "");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [description, setDescription] = useState("");
    const [isBoosted, setIsBoosted] = useState(false);
    const [isLot, setIsLot] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (product) {
            setTitle(product.title);
            setCategory(product.category);
            setCondition(product.condition);
            setPrice(product.price.toString());
            setLocation(product.location);
            setWhatsapp(product.whatsapp || "");
            setDescription(product.description || "");
            setIsBoosted(product.isBoosted);
            setIsLot(product.isLot);
            if (product.image) {
                setImagePreviews([product.image]);
            }
        }
    }, [product]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const newFiles = Array.from(files);
        setImageFiles(newFiles);
        newFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) setImagePreviews([ev.target!.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = () => {
        setImageFiles([]);
        setImagePreviews([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id) return;
        setIsSubmitting(true);

        try {
            let imageUrl = product?.image || null;

            if (imageFiles.length > 0) {
                const file = imageFiles[0];
                const ext = file.name.split(".").pop();
                const path = `${user.id}/${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
                imageUrl = urlData.publicUrl;
            }

            const { error } = await supabase.from("products").update({
                title,
                category,
                condition,
                price: parseInt(price),
                location,
                whatsapp,
                description,
                image_url: imageUrl,
                is_boosted: isBoosted,
                is_lot: isLot,
            }).eq("id", id).eq("user_id", user.id);

            if (error) throw error;

            toast.success("Annonce modifiée !");
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product", id] });
            navigate("/mes-annonces");
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la modification.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingProduct) {
        return <Layout><div className="container py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-4 text-muted-foreground">Chargement de l'annonce...</p></div></Layout>;
    }

    return (
        <Layout>
            <div className="container max-w-2xl py-8 md:py-12">
                <Link to="/mes-annonces" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    Retour à mes annonces
                </Link>

                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Modifier l'annonce</h1>
                    <p className="mt-2 text-muted-foreground">Mettez à jour les informations de votre article.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 animate-fade-up">
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Camera className="h-4 w-4 text-primary" />
                            Photo actuelle ou nouvelle
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {imagePreviews.map((image, index) => (
                                <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-border">
                                    <img src={image} alt="Aperçu" className="h-full w-full object-cover" />
                                    <button type="button" onClick={removeImage} className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {imagePreviews.length === 0 && (
                                <div onClick={() => fileInputRef.current?.click()} className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50 hover:border-primary/50">
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground">Changer photo</span>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <label htmlFor="title" className="text-sm font-medium text-foreground">Titre</label>
                            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Catégorie</label>
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                                <SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">État</label>
                            <Select value={condition} onValueChange={setCondition} required>
                                <SelectTrigger><SelectValue placeholder="État" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Neuf">Neuf</SelectItem>
                                    <SelectItem value="Très bon état">Très bon état</SelectItem>
                                    <SelectItem value="Bon état">Bon état</SelectItem>
                                    <SelectItem value="État correct">État correct</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="price" className="text-sm font-medium text-foreground">Prix (FCFA)</label>
                            <Input id="price" type="number" required value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Région</label>
                            <Select value={location.toLowerCase()} onValueChange={(v) => setLocation(v.charAt(0).toUpperCase() + v.slice(1))} required>
                                <SelectTrigger><SelectValue placeholder="Région" /></SelectTrigger>
                                <SelectContent>{senegalRegions.map((r) => (<SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label htmlFor="whatsapp" className="text-sm font-medium text-foreground">WhatsApp</label>
                            <Input id="whatsapp" placeholder="77 000 00 00" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label htmlFor="description" className="text-sm font-medium text-foreground">Description</label>
                            <Textarea id="description" className="min-h-[120px]" required value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="flex items-center space-x-2 sm:col-span-2 py-2">
                            <input
                                type="checkbox"
                                id="isLot"
                                checked={isLot}
                                onChange={(e) => setIsLot(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="isLot" className="text-sm font-medium text-foreground">
                                C'est un lot d'articles (plusieurs pièces)
                            </label>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base gap-2" disabled={isSubmitting}>
                        {isSubmitting ? "Enregistrement..." : (<>Enregistrer les modifications <Save className="h-4 w-4" /></>)}
                    </Button>
                </form>
            </div>
        </Layout>
    );
};

export default ModifierAnnonce;
