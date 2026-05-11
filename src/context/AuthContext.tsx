import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: unknown }>;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signInWithOtp: (phone: string) => Promise<{ error: unknown }>;
  verifyOtp: (phone: string, token: string, fullName?: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: unknown }>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    setIsAdmin(!!data);
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const normalizedPhone = phone ? normalizePhoneNumber(phone) : undefined;

    // Pré-vérification : numéro déjà utilisé ?
    if (normalizedPhone) {
      const { data: phoneTaken } = await supabase.rpc("phone_exists", { _phone: normalizedPhone });
      if (phoneTaken) {
        return {
          error: {
            message: "Ce numéro de téléphone est déjà associé à un compte existant. Veuillez vous connecter ou utiliser un autre numéro.",
          },
        };
      }
    }

    // Pré-vérification : email déjà utilisé ? (Supabase ne le dit pas par défaut pour la sécurité)
    const { data: emailTaken } = await supabase
      .from("profiles")
      .select("user_id")
      .ilike("email", email)
      .maybeSingle();

    if (emailTaken) {
      return {
        error: {
          message: "Cette adresse email est déjà associée à un compte. Veuillez vous connecter ou utiliser une autre adresse.",
        },
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, phone: normalizedPhone },
      },
    });

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("user already")) {
        return {
          error: {
            message: "Cette adresse email est déjà associée à un compte. Veuillez vous connecter ou utiliser une autre adresse.",
          },
        };
      }
      return { error };
    }

    // Save phone to profile after signup
    if (data.user) {
      await supabase.from("profiles").update({
        phone: normalizedPhone,
        email: data.user.email,
      }).eq("user_id", data.user.id);
    }
    return { error: null };
  };

  const signIn = async (identifier: string, password: string) => {
    const isPhone = !identifier.includes("@") && (identifier.startsWith("+") || /^\d+$/.test(identifier));

    if (isPhone) {
      const normalizedPhone = normalizePhoneNumber(identifier);
      const { data: resolvedEmail, error: phoneLookupError } = await supabase.rpc("get_email_for_phone", {
        _phone: normalizedPhone,
      });

      if (phoneLookupError) {
        return { error: phoneLookupError };
      }

      if (!resolvedEmail) {
        return {
          error: {
            message: "Aucun compte n'est associé à ce numéro de téléphone.",
          },
        };
      }

      const { error } = await supabase.auth.signInWithPassword({ email: resolvedEmail, password });
      return { error };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: identifier, password });
    return { error };
  };

  const normalizePhoneNumber = (phone: string) => {
    // Remove all non-digit characters except the leading +
    let cleaned = phone.replace(/[^\d+]/g, "");
    // If it doesn't start with +, and it looks like a Senegalese number (starts with 7 or 3), add +221
    if (!cleaned.startsWith("+")) {
      if (cleaned.startsWith("00")) {
        cleaned = "+" + cleaned.slice(2);
      } else if (cleaned.length === 9) {
        cleaned = "+221" + cleaned;
      }
    }
    return cleaned;
  };

  const signInWithOtp = async (phone: string) => {
    const normalizedPhone = normalizePhoneNumber(phone);
    console.log("Attempting OTP sign-in for:", normalizedPhone);
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
    });
    if (error) console.error("OTP Sign-in Error:", error);
    return { error };
  };

  const verifyOtp = async (phone: string, token: string, fullName?: string) => {
    const normalizedPhone = normalizePhoneNumber(phone);
    console.log("Verifying OTP for:", normalizedPhone);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token,
      type: 'sms',
    });

    if (!error && data.user && fullName) {
      await supabase.from("profiles").update({ full_name: fullName, phone }).eq("user_id", data.user.id);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const deleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;

      // After deletion, we should sign out locally
      await signOut();
      return { error: null };
    } catch (err: unknown) {
      console.error("Error deleting account:", err);
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithOtp, verifyOtp, signOut, deleteAccount, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
