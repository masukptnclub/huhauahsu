import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isAdmin: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        set({ 
          session, 
          user: session.user,
          isAdmin: profile?.is_admin || false,
          isLoading: false,
          error: null
        });
      } else {
        set({ session: null, user: null, isAdmin: false, isLoading: false, error: null });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        session: null, 
        user: null, 
        isAdmin: false,
        isLoading: false, 
        error: error instanceof Error 
          ? `Authentication initialization failed: ${error.message}` 
          : 'Failed to initialize authentication.' 
      });
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.session.user.id)
          .single();

        set({ 
          session: data.session, 
          user: data.session.user,
          isAdmin: profile?.is_admin || false,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Login failed. Please try again.'
      });
    }
  },

  register: async (email, password, fullName) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            is_admin: false
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        set({ 
          session: data.session, 
          user: data.session.user,
          isAdmin: false,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.'
      });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({ 
        session: null, 
        user: null, 
        isAdmin: false,
        isLoading: false 
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Logout failed. Please try again.'
      });
    }
  },
}));