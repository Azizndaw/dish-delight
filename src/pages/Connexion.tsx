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
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLogin && password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas.");
            return;
        }

        setIsLoading(true);

        const identifier = authMethod === "email" ? email : phone;

        if (isLogin) {
            const { error } = await signIn(identifier, password);
            setIsLoading(false);
            if (error) {
                toast.error(error.message === "Invalid login credentials" ? "Identifiants incorrects." : error.message);
            } else {
                toast.success("Connexion réussie !");
                navigate("/");
            }
        } else {
            const { error } = await signUp(identifier, password, fullName, authMethod === "phone" ? phone : undefined);
            setIsLoading(false);
            if (error) {
                toast.error(error.message);
            } else {
                if (authMethod === "email") {
                    toast.success("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
                    setShowEmailConfirmation(true);
                } else {
                    toast.success("Compte créé avec succès !");
                    navigate("/");
                }
            }
        }
    };

    if (showEmailConfirmation) {
        return (
            <Layout>
                <div className="container max-w-md py-20 text-center animate-fade-in">
                    <div className="rounded-2xl border border-border bg-card p-10 shadow-medium">
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                            </div>
                        </div>
                        <h1 className="font-display text-2xl font-bold">Vérifiez votre email</h1>
                        <p className="mt-4 text-muted-foreground">
                            Un email de confirmation a été envoyé à <span className="font-semibold text-foreground">{email}</span>.
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Cliquez sur le lien dans l'email pour activer votre compte. Vérifiez aussi vos spams.
                        </p>
                        <Button variant="outline" className="mt-8" onClick={() => { setShowEmailConfirmation(false); setIsLogin(true); }}>
                            Retour à la connexion
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

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
                            </TabsContent>

                            <TabsContent value="phone" className="space-y-4 mt-0">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Numéro de téléphone</Label>
                                    <PhoneInput
                                        value={phone}
                                        onChange={setPhone}
                                        disabled={isLoading}
                                    />
                                </div>
                            </TabsContent>

                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>

                            {!isLogin && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                    <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </div>
                            )}

                            <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                {isLoading ? "Traitement..." : (isLogin ? "Se connecter" : "S'inscrire")}
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
