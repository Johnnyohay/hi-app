import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { LargeSecureStore } from '@/lib/secure-session-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** False until real values land in .env — see .env.example. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      // AsyncStorage's web shim touches `window` at import time, which crashes
      // Expo Router's static/server render of web pages. On web, leaving this
      // undefined lets supabase-js fall back to its own SSR-safe storage.
      // Native stores the session encrypted (see lib/secure-session-store.ts)
      // rather than in plain AsyncStorage.
      storage: Platform.OS === 'web' ? undefined : LargeSecureStore,
      autoRefreshToken: true,
      persistSession: true,
      // Web needs this on to pick up the access token Supabase appends to the
      // URL after an email confirmation redirect.
      detectSessionInUrl: Platform.OS === 'web',
      // PKCE protects that same redirect (and any future magic-link/OAuth
      // flow) from a token riding in a URL a malicious app could intercept.
      flowType: 'pkce',
    },
  }
);
