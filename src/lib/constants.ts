import { ENV, API_CONFIG } from './env';

export const APP_NAME = 'DreamSeller Pro';
export const SUPPORT_EMAIL = 'support@dreamsellers.org';
export const DOMAIN = 'dreamsellers.org';
export const API_BASE_URL = API_CONFIG.baseUrl;
export const STRIPE_PUBLIC_KEY = ENV.STRIPE_PUBLIC_KEY;
export const SUPABASE_URL = ENV.SUPABASE_URL;
export const SUPABASE_ANON_KEY = ENV.SUPABASE_ANON_KEY;