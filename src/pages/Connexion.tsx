import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, MessageCircle, Mail, Phone as PhoneIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhoneInput } from "@/components/ui/phone-input";

const Connexion = () => {
    const navigate = useNavigate();
    const { signIn, signUp, signInWithOtp, verifyOtp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone");
    const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) {
            toast.error("Veuillez entrer votre numéro de téléphone.");
            return;
        }

        setIsLoading(true);
        const { error } = await signInWithOtp(phone);
        setIsLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            setPhoneStep("otp");
            toast.success("Code envoyé sur WhatsApp !");
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            toast.error("Veuillez entrer le code de vérification.");
            return;
        }

        setIsLoading(true);
        const { error } = await verifyOtp(phone, otp, !isLogin ? fullName : undefined);
        setIsLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Connexion réussie !");
            navigate("/");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (authMethod === "phone") {
            if (phoneStep === "phone") return handleSendOtp(e);
            return handleVerifyOtp(e);
        }

        setIsLoading(true);

        if (isLogin) {
            const { error } = await signIn(email, password);
            setIsLoading(false);
            if (error) {
                toast.error(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : error.message);
            } else {
                toast.success("Connexion réussie !");
                navigate("/");
            }
        } else {
            const { error } = await signUp(email, password, fullName, phone);
            setIsLoading(false);
            if (error) {
                toast.error(error.message);
            } else {
                setShowEmailConfirmation(true);
            }
        }
    };

    return (
        <Layout>
            <div className="container max-w-md py-12 md:py-20">
                <Link
                    to="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Retour à l'accueil
                </Link>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-medium animate-fade-up">
                    <div className="mb-8 text-center">
                        <h1 className="font-display text-2xl font-bold">
                            {isLogin ? "Bon retour !" : "Créer un compte"}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {isLogin
                                ? "Connectez-vous pour gérer vos annonces et favoris."
                                : "Rejoignez-nous ! Le compte est obligatoire pour vendre vos articles."}
                        </p>
                    </div>

                    <Tabs defaultValue="email" className="w-full" onValueChange={(v) => setAuthMethod(v as "email" | "phone")}>
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </TabsTrigger>
                            <TabsTrigger value="phone" className="flex items-center gap-2">
                                <PhoneIcon className="h-4 w-4" />
                                Téléphone
                            </TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom complet</Label>
                                    <Input id="name" placeholder="Moussa Diop" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                </div>
                            )}

                            <TabsContent value="email" className="space-y-4 mt-0">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="moussa@exemple.com" required={authMethod === "email"} value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Mot de passe</Label>
                                    </div>
                                    <Input id="password" type="password" required={authMethod === "email"} value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                            </TabsContent>

                            <TabsContent value="phone" className="space-y-4 mt-0">
                                {phoneStep === "phone" ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Numéro de téléphone</Label>
                                            <PhoneInput
                                                value={phone}
                                                onChange={setPhone}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <Alert className="bg-primary/5 border-primary/20">
                                            <MessageCircle className="h-4 w-4 text-primary" />
                                            <AlertDescription className="text-xs text-muted-foreground ml-2">
                                                Le code d'activation vous sera envoyé directement sur **WhatsApp** pour éviter les frais de SMS.
                                            </AlertDescription>
                                        </Alert>
                                    </>
                                ) : (
                                    <div className="space-y-4 flex flex-col items-center">
                                        <Label htmlFor="otp">Code de vérification</Label>
                                        <InputOTP
                                            maxLength={6}
                                            value={otp}
                                            onChange={(v) => setOtp(v)}
                                            render={({ slots }) => (
                                                <InputOTPGroup>
                                                    {slots.map((slot, index) => (
                                                        <InputOTPSlot key={index} index={index} {...slot} />
                                                    ))}
                                                </InputOTPGroup>
                                            )}
                                        />
                                        <p className="text-xs text-muted-foreground text-center">
                                            Entrez le code à 6 chiffres reçu sur WhatsApp au **{phone}**.
                                        </p>
                                        <Button variant="ghost" size="sm" onClick={() => setPhoneStep("phone")} className="text-xs">
                                            Changer de numéro
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                {isLoading ? "Traitement..." : (
                                    authMethod === "phone"
                                        ? (phoneStep === "phone" ? "Recevoir le code" : "Vérifier le code")
                                        : (isLogin ? "Se connecter" : "S'inscrire")
                                )}
                            </Button>
                        </form>
                    </Tabs>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">
                            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                        </span>{" "}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setPhoneStep("phone");
                            }}
                            className="font-semibold text-primary hover:underline"
                        >
                            {isLogin ? "S'inscrire" : "Se connecter"}
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Connexion;
