import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOtp: (phone: string) => Promise<{ error: any }>;
  verifyOtp: (phone: string, token: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
    const isPhone = !email.includes("@") && (email.startsWith("+") || /^\d+$/.test(email));
    const normalizedPhone = phone ? normalizePhoneNumber(phone) : (isPhone ? normalizePhoneNumber(email) : undefined);

    const signUpData: any = {
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, phone: normalizedPhone },
      },
    };

    if (isPhone) {
      signUpData.phone = normalizedPhone;
    } else {
      signUpData.email = email;
    }

    const { data, error } = await supabase.auth.signUp(signUpData);

    // Save phone to profile after signup
    if (!error && data.user && normalizedPhone) {
      await supabase.from("profiles").update({ phone: normalizedPhone }).eq("user_id", data.user.id);
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const isPhone = !email.includes("@") && (email.startsWith("+") || /^\d+$/.test(email));

    if (isPhone) {
      const normalizedPhone = normalizePhoneNumber(email);
      const { error } = await supabase.auth.signInWithPassword({ phone: normalizedPhone, password });
      return { error };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
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

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithOtp, verifyOtp, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
