import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { auth, supabase } from '../lib/supabase';
import { AuthForm } from './AuthForm';
import { LogOut, User as UserIcon } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(!!supabase);

  useEffect(() => {
    // Check if Supabase is connected
    if (!supabase) {
      setSupabaseConnected(false);
      setLoading(false);
      return;
    }

    // Get initial user
    auth.getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show connection prompt if Supabase is not connected
  if (!supabaseConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="bg-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Connect to Supabase
          </h1>
          <p className="text-gray-600 mb-6">
            To use the Client Calling System, please connect to Supabase by clicking the "Connect to Supabase" button in the top right corner of the screen.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>Steps:</strong><br/>
              1. Click "Connect to Supabase\" button<br/>
              2. Set up your Supabase project<br/>
              3. Return here to start using the system
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Connection Status:</strong><br/>
              Frontend: ✅ Ready<br/>
              Backend: ❌ Not Connected<br/>
              Database: ❌ Waiting for Supabase
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* User Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-full">
                <UserIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Welcome back!</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
      
      {children}
    </div>
  );
};