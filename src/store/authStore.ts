import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => void;
  login: (email: string, password: string) => Promise<{ data: any; error: Error | null; }>;
  register: (email: string, password: string, fullName: string) => Promise<{ data: any; error: Error | null; }>;
  logout: () => void;
}

// Mock admin credentials - in a real app, this would be handled securely
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  isLoading: false,
  error: null,

  initialize: () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      set({ user, isAdmin: user.isAdmin, isLoading: false });
    } else {
      set({ user: null, isAdmin: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // Mock authentication
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser = {
          id: '1',
          email: ADMIN_EMAIL,
          isAdmin: true
        };
        localStorage.setItem('user', JSON.stringify(adminUser));
        set({ user: adminUser, isAdmin: true, isLoading: false });
        return { data: adminUser, error: null };
      }

      // Mock regular user authentication
      const user = {
        id: '2',
        email,
        isAdmin: false
      };
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAdmin: false, isLoading: false });
      return { data: user, error: null };
    } catch (error) {
      set({ isLoading: false });
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Login failed')
      };
    }
  },

  register: async (email: string, password: string, fullName: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Mock user registration
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        isAdmin: false
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAdmin: false, isLoading: false });
      return { data: user, error: null };
    } catch (error) {
      set({ isLoading: false });
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Registration failed')
      };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAdmin: false });
  },
}));