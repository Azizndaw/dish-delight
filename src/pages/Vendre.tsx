import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, ChevronLeft, Upload, Send, X, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { categories, senegalRegions } from "@/data/products";
import { useState, useRef } from "react";
import { toast } from "sonner";

const Vendre = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [isBoosted, setIsBoosted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (images.length + files.length > 5) {
        toast.error("Vous pouvez ajouter un maximum de 5 photos.");
        return;
      }

      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newProduct = {
      id: Date.now().toString(),
      title,
      price: parseInt(price),
      location: location.charAt(0).toUpperCase() + location.slice(1),
      image: images[0] || "https://images.unsplash.com/photo-1621327017866-6fb07e6c96ca?q=80&w=800",
      condition: condition === "neuf" ? "Neuf" : condition === "tres-bon" ? "Très bon état" : condition === "bon" ? "Bon état" : "État correct",
      category,
      whatsapp,
      description,
      isBoosted,
      isUserProduct: true
    };

    // Enregistrement dans localStorage
    const existingProducts = JSON.parse(localStorage.getItem("userProducts") || "[]");
    localStorage.setItem("userProducts", JSON.stringify([newProduct, ...existingProducts]));

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Votre annonce a été publiée avec succès !");
      navigate("/catalogue");
    }, 1500);
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-8 md:py-12">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Vendre un article
          </h1>
          <p className="mt-2 text-muted-foreground">
            Remplissez ce formulaire pour publier votre annonce gratuitement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-up">
          {/* Photos Upload */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              Photos de l'article (max 5)
            </label>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {images.map((image, index) => (
                <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-border">
                  <img src={image} alt="Aperçu" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50 hover:border-primary/50"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Ajouter</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground italic">
              * Les belles photos vendent 3x plus vite !
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Title */}
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Titre de l'annonce
              </label>
              <Input
                id="title"
                placeholder="Ex: Lot de 6 assiettes décorées"
                required
                className="h-11"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Catégorie</label>
              <Select onValueChange={setCategory} required>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">État</label>
              <Select onValueChange={setCondition} required>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="État de l'article" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neuf">Neuf</SelectItem>
                  <SelectItem value="tres-bon">Très bon état</SelectItem>
                  <SelectItem value="bon">Bon état</SelectItem>
                  <SelectItem value="correct">État correct</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium text-foreground">
                Prix (FCFA)
              </label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  placeholder="Ex: 5000"
                  required
                  className="h-11 pr-16"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  FCFA
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Localisation (Région)</label>
              <Select onValueChange={setLocation} required>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choisir une région" />
                </SelectTrigger>
                <SelectContent>
                  {senegalRegions.map((region) => (
                    <SelectItem key={region} value={region.toLowerCase()}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="whatsapp" className="text-sm font-medium text-foreground">
                Numéro WhatsApp (pour le contact)
              </label>
              <div className="relative">
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="77 000 00 00"
                  required
                  className="h-11 pl-12"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm border-r pr-2 border-border font-medium text-muted-foreground">
                  +221
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Votre numéro sera utilisé uniquement pour que les acheteurs puissent vous contacter.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description détaillée
              </label>
              <Textarea
                id="description"
                placeholder="Décrivez l'état exact, les dimensions, la matière, etc."
                className="min-h-[120px] resize-none"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Boost Option */}
            <div className="sm:col-span-2 rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground">Booster mon annonce (Optionnel)</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Votre annonce restera en haut de la page d'accueil pendant 3 jours.
                    Augmentez vos chances de vendre rapidement !
                  </p>
                  <label className="mt-3 flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                      onChange={(e) => setIsBoosted(e.target.checked)}
                    />
                    <span className="text-sm font-semibold text-primary">Activer le Boost pour 500 FCFA</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-12 text-base gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Publication en cours..."
              ) : (
                <>
                  Publier l'annonce
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              En publiant, vous acceptez nos <Link to="/conditions-generales" className="underline">Conditions Générales</Link>.
            </p>
          </div>
        </form>
      </div>
    </Layout >
  );
};

export default Vendre;
