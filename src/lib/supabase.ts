// src/lib/supabase.ts
import { createClient, type SupabaseClient, type Session, type Subscription } from '@supabase/supabase-js';

// Load from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.includes('supabase.co') || url.includes('localhost');
  } catch {
    return false;
  }
};

const hasValidCredentials =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  isValidUrl(SUPABASE_URL) &&
  !SUPABASE_URL.includes('placeholder') &&
  !SUPABASE_ANON_KEY.includes('placeholder');

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

// Create real Supabase client or mock version
export const supabase: SupabaseClient = hasValidCredentials
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseOptions)
  : ({
      auth: {
        getSession: () =>
          Promise.resolve({ data: { session: null as Session | null }, error: null }),
        onAuthStateChange: () => ({
          data: {
            subscription: {
              unsubscribe: () => {
                console.log('Mock unsubscribe called.');
              }
            } as unknown as Subscription
          }
        }),
        signInWithPassword: () =>
          Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null })
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null })
      })
    } as unknown as SupabaseClient);

