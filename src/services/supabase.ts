import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or fallback with safe check for both browser/Vite and Node runtime
const g = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (g.process?.env || {});
const envSupabaseUrl = env?.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;
let isConfigured = false;

if (envSupabaseUrl && envSupabaseAnonKey && !envSupabaseUrl.includes('YOUR_SUPABASE')) {
  try {
    supabaseInstance = createClient(envSupabaseUrl, envSupabaseAnonKey);
    isConfigured = true;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    isConfigured = false;
  }
}

export const isSupabaseConfigured = () => isConfigured;
export const getSupabase = () => supabaseInstance;

/**
 * Safe Auth helper
 */
export const authService = {
  async signUp(email: string, password: string, displayName: string) {
    if (!supabaseInstance) {
      return { data: null, error: new Error('Supabase is not configured. Running in local guest mode.') };
    }
    return await supabaseInstance.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });
  },

  async signIn(email: string, password: string) {
    if (!supabaseInstance) {
      return { data: null, error: new Error('Supabase is not configured. Running in local guest mode.') };
    }
    return await supabaseInstance.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signOut() {
    if (!supabaseInstance) return;
    await supabaseInstance.auth.signOut();
  },

  async getCurrentUser() {
    if (!supabaseInstance) return null;
    const { data } = await supabaseInstance.auth.getUser();
    return data?.user || null;
  }
};
