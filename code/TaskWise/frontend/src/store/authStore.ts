import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';
import { User, AuthResponse } from '../types';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
          
          localStorage.setItem('token', data.data.token);
          set({ user: data.data.user, token: data.data.token, loading: false });
          toast.success('Login successful!');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.response?.data?.error || 'Login failed');
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ loading: true });
          const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
          
          localStorage.setItem('token', data.data.token);
          set({ user: data.data.user, token: data.data.token, loading: false });
          toast.success('Registration successful!');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.response?.data?.error || 'Registration failed');
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },

      fetchCurrentUser: async () => {
        try {
          const { data } = await api.get<AuthResponse>('/auth/me');
          set({ user: data.data.user });
        } catch (error) {
          console.error('Failed to fetch current user:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user })
    }
  )
);
