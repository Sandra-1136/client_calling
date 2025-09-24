import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl.startsWith('https://') && 
         supabaseUrl.includes('.supabase.co') &&
         supabaseAnonKey.length > 20;
};

// Test connection function
const testSupabaseConnection = async (client: any) => {
  if (!client) return false;
  
  try {
    const { data, error } = await client.from('clients').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

// Create a placeholder client if environment variables are missing
const createSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase environment variables not found or invalid. Please connect to Supabase.');
    console.warn('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
    // Return a mock client that won't cause errors
    return null;
  }
  
  try {
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'client-calling-system',
        },
      },
    });
    
    // Test connection on creation
    testSupabaseConnection(client).then(connected => {
      if (connected) {
        console.log('✅ Supabase connection successful');
      } else {
        console.warn('⚠️ Supabase connection test failed - check database setup');
      }
    });
    
    return client;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
};

export const supabase = createSupabaseClient();

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    try {
      return await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('Sign up failed:', error);
      throw new Error('Failed to sign up. Please check your internet connection and try again.');
    }
  },

  signIn: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    try {
      return await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } catch (error) {
      console.error('Sign in failed:', error);
      throw new Error('Failed to sign in. Please check your credentials and internet connection.');
    }
  },

  signOut: async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    try {
      return await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  },

  getCurrentUser: async () => {
    if (!supabase) {
      return null;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
      console.error('Failed to set up auth state change listener:', error);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
};