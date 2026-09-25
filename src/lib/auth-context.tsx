import type { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { oauthProviders, signInWithProvider as startOAuth, type OAuthProviderId } from '@/lib/oauth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export { oauthProviders };
export type { OAuthProviderId };

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithProvider: (provider: OAuthProviderId) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signInWithPassword(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { error: 'Backend not connected yet. See setup steps.' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUpWithPassword(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      return { error: 'Backend not connected yet. See setup steps.' };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message ?? null };
  }

  async function signInWithProvider(provider: OAuthProviderId) {
    if (!isSupabaseConfigured) {
      return { error: 'Backend not connected yet. See setup steps.' };
    }
    return startOAuth(provider);
  }

  async function signOut() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    router.replace('/sign-in');
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        signInWithPassword,
        signUpWithPassword,
        signInWithProvider,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
