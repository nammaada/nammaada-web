"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { checkIsAdminSessionAction } from "@/actions/check-admin-session";

export type CustomerProfile = {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
};

type CustomerAuthContextValue = {
  user: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

function extractProfile(user: User | null): CustomerProfile | null {
  if (!user) return null;
  const meta = user.user_metadata || {};
  const fullName =
    typeof meta.full_name === "string" && meta.full_name.trim().length > 0
      ? meta.full_name.trim()
      : typeof meta.name === "string" && meta.name.trim().length > 0
      ? meta.name.trim()
      : user.email?.split("@")[0] || "Customer";

  const phone = typeof meta.phone === "string" ? meta.phone : user.phone || "";
  const avatarUrl =
    typeof meta.avatar_url === "string"
      ? meta.avatar_url
      : typeof meta.picture === "string"
      ? meta.picture
      : null;

  return {
    fullName,
    email: user.email || "",
    phone,
    avatarUrl,
  };
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Resolve a raw Supabase user: if it's an admin session, treat as null on storefront
  const resolveUser = useCallback(async (rawUser: User | null): Promise<User | null> => {
    if (!rawUser) return null;
    try {
      const isAdmin = await checkIsAdminSessionAction();
      return isAdmin ? null : rawUser;
    } catch {
      return rawUser;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      const resolved = await resolveUser(error || !data?.user ? null : data.user);
      setUser(resolved);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [supabase, resolveUser]);

  useEffect(() => {
    let isMounted = true;

    // Listen to real-time auth changes (handles initial session, sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      const resolved = await resolveUser(session?.user ?? null);
      if (isMounted) {
        setUser(resolved);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, resolveUser]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Hard refresh/redirect to update server components & clean cookies
      window.location.href = "/";
    } catch (err) {
      console.error("Sign out error:", err);
      setUser(null);
    }
  }, [supabase]);

  const profile = useMemo(() => extractProfile(user), [user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signOut,
      refresh,
    }),
    [user, profile, loading, signOut, refresh]
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}
