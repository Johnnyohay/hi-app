import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { defaultSchool, isSchoolEmail } from '@/constants/schools';
import { oauthProviders, signInWithProvider as startOAuth, type OAuthProviderId } from '@/lib/oauth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export { oauthProviders };
export type { OAuthProviderId };

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  authError: string | null;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithProvider: (provider: OAuthProviderId) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

  // Runs on every sign-in, however it happened (magic link or any OAuth
  // provider) — the one place that enforces "only this school's emails."
  function applySession(nextSession: Session | null) {
    const email = nextSession?.user.email;
    if (nextSession && email && !isSchoolEmail(defaultSchool, email)) {
      setAuthError(`Use your ${defaultSchool.name} email to sign in.`);
      void supabase.auth.signOut();
      setSession(null);
      return;
    }
    setAuthError(null);
    setSession(nextSession);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signInWithPassword(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { error: 'Backend not connected yet — see setup steps.' };
    }
    if (!isSchoolEmail(defaultSchool, email)) {
      return { error: `Use your ${defaultSchool.name} email to sign in.` };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUpWithPassword(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { error: 'Backend not connected yet — see setup steps.' };
    }
    if (!isSchoolEmail(defaultSchool, email)) {
      return { error: `Use your ${defaultSchool.name} email to sign in.` };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }

  async function signInWithProvider(provider: OAuthProviderId) {
    if (!isSupabaseConfigured) {
      return { error: 'Backend not connected yet — see setup steps.' };
    }
    return startOAuth(provider, { hostedDomain: defaultSchool.emailDomains[0] });
  }

  async function signOut() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        authError,
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
