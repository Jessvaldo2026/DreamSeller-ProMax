// Environment variable validation and configuration
export const ENV = {
  // Supabase (Required)
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Stripe (Required for payments)
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.dreamsellers.org',
  APP_URL: import.meta.env.VITE_APP_URL || 'https://dreamsellers.org',
  
  // Feature flags
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
  NODE_ENV: import.meta.env.NODE_ENV || 'production',
  
  // Optional features
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
} as const;

// Validation function
export function validateEnvironment(): { isValid: boolean; missing: string[] } {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ] as const;
  
  const missing: string[] = [];
  
  for (const key of required) {
    if (!ENV[key]) {
      missing.push(`VITE_${key}`);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

// Runtime validation
const validation = validateEnvironment();
if (!validation.isValid) {
  console.error('❌ Missing required environment variables:', validation.missing);
  console.warn('⚠️ Some environment variables are missing. App may have limited functionality.');
}

// Export individual configs for convenience
export const SUPABASE_CONFIG = {
  url: ENV.SUPABASE_URL,
  anonKey: ENV.SUPABASE_ANON_KEY,
} as const;

export const STRIPE_CONFIG = {
  publicKey: ENV.STRIPE_PUBLIC_KEY,
} as const;

export const API_CONFIG = {
  baseUrl: ENV.API_BASE_URL,
  appUrl: ENV.APP_URL,
} as const;