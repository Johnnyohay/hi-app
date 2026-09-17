import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

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
      storage: Platform.OS === 'web' ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Web needs this on to pick up the access token Supabase appends to the
      // URL after a magic-link or OAuth redirect. Native completes OAuth via
      // a deep link instead, handled manually in lib/oauth.ts.
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);
