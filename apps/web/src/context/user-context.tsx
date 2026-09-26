"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";

interface UserContextType {
  user: any;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log("Fetching user context from /auth/me...");
      const data = await api.get("/auth/me");
      setUser(data);
    } catch (e: any) {
      console.error("Failed to fetch user context:", e.message);
      setError(e.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUser]);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, isLoading, error, refreshUser: fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
