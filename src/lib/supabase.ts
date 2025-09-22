import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a placeholder client if environment variables are missing
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found. Please connect to Supabase.');
    // Return a mock client that won't cause errors
    return null;
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Please connect to Supabase first');
    }
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  signIn: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Please connect to Supabase first');
    }
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  signOut: async () => {
    if (!supabase) {
      throw new Error('Please connect to Supabase first');
    }
    return await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    if (!supabase) {
      return null;
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },
};