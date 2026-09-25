import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

/**
 * Providers Supabase Auth supports out of the box. Each one still needs to be
 * enabled in the Supabase dashboard with real OAuth client credentials from
 * that provider before sign-in actually works — see setup steps.
 */
export type OAuthProviderId = 'google' | 'azure';

export const oauthProviders: { id: OAuthProviderId; label: string }[] = [
  { id: 'google', label: 'Google' },
  { id: 'azure', label: 'Microsoft' },
];

// Lets the OAuth browser tab close itself and hand control back to the app
// once the provider redirects to our deep link.
WebBrowser.maybeCompleteAuthSession();

export async function signInWithProvider(
  provider: OAuthProviderId,
  options?: { hostedDomain?: string }
): Promise<{ error: string | null }> {
  const redirectTo = Linking.createURL('/sign-in');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
      // Nudges Google to only list accounts on the school's Workspace domain,
      // when the provider is Google and one is known.
      queryParams:
        provider === 'google' && options?.hostedDomain ? { hd: options.hostedDomain } : undefined,
    },
  });

  if (error) return { error: error.message };
  // Web already redirected the whole page — nothing left to do here.
  if (Platform.OS === 'web') return { error: null };

  if (!data?.url) return { error: 'Could not start sign-in.' };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) return { error: null };

  // PKCE (the client's flowType — see lib/supabase.ts) returns an authorization
  // code as a query param, not tokens in the URL fragment, so it has to be
  // exchanged for a session rather than handed straight to setSession.
  const code = new URL(result.url).searchParams.get('code');
  if (!code) return { error: 'Sign-in did not complete.' };

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
  return { error: sessionError?.message ?? null };
}
