import { create } from 'zustand';
import { getToken, setToken, removeToken } from '../utils/storage';
import { apiFetch } from '../utils/api';
import { router } from 'expo-router';

interface User {
  userId: string;
  email: string;
  name?: string;
  business?: string;
  industry?: string;
  tags?: string[];
  role?: 'user' | 'employee' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: async (token: string, user: User) => {
    await setToken(token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await removeToken();
    set({ user: null, token: null, isAuthenticated: false });
    router.replace('/auth');
  },

  checkAuth: async () => {
    try {
      const token = await getToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const response = await apiFetch<User>('me', 'GET', undefined, token);
      if (response.success && response.data) {
        set({ token, user: response.data, isAuthenticated: true, isLoading: false });
      } else {
        await removeToken();
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  updateUser: async (updates: Partial<User>) => {
    const { token } = get();
    if (!token) return;

    const response = await apiFetch<User>('me', 'PUT', updates, token);
    if (response.success && response.data) {
      set({ user: response.data });
    } else {
      throw new Error(response.error || 'Failed to update user');
    }
  },
}));


