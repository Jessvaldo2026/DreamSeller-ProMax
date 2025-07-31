import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './env';

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.includes('supabase.co') || url.includes('localhost');
  } catch {
    return false;
  }
};

const hasValidCredentials =
  SUPABASE_CONFIG.url &&
  SUPABASE_CONFIG.anonKey &&
  isValidUrl(SUPABASE_CONFIG.url) &&
  !SUPABASE_CONFIG.url.includes('placeholder') &&
  !SUPABASE_CONFIG.anonKey.includes('placeholder');

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase not properly configured. Using mock client for development.');
}

const supabaseOptions = {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: typeof window !== 'undefined'
  },
  global: {
    headers: {
      'X-Client-Info': 'dreamseller-pro@1.0.0'
    }
  }
};

// Create real or mock Supabase client
export const supabase: SupabaseClient = hasValidCredentials
  ? createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, supabaseOptions)
  : ({
      auth: {
        getSession: () =>
          Promise.resolve({ data: { session: null as Session | null }, error: null }),
        onAuthStateChange: (
          _event: string,
          _session: Session | null
        ) => ({
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        }),
        signInWithPassword: () =>
          Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null })
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null })
      })
    } as unknown as SupabaseClient);
