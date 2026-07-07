'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types';
import { authAPI } from '@/lib/api';
import { API_BASE } from '@/lib/env';
import { getDashboardPath, type UserRole } from '@/lib/routes';

const TOKEN_KEY = "vixxy_access_token";
const REFRESH_TOKEN_KEY = "vixxy_refresh_token";
const USER_KEY = "vixxy_user";
const INTENDED_PATH_KEY = "vixxy_intended_path";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, fullName: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
  getProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  redirectToLogin: (pathname: string) => void;
  redirectAfterLogin: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: true,

      setLoading: (loading: boolean) => set({ loading }),

      login: async (email: string, password: string) => {
        try {
          const { accessToken: newToken, refreshToken: newRefreshToken, user: newUser } = await authAPI.login(email, password);
          set({
            accessToken: newToken,
            refreshToken: newRefreshToken,
            user: newUser,
          });
          return true;
        } catch (error) {
          console.error("Login error:", error);
          return false;
        }
      },

      register: async (email: string, fullName: string, password: string, phone?: string) => {
        try {
          await authAPI.register(email, password, fullName, phone);
          const loginSuccess = await get().login(email, password);
          return loginSuccess;
        } catch (error) {
          console.error("Register error:", error);
          return false;
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },

      refreshAuthToken: async () => {
        const { refreshToken: currentRefreshToken } = get();
        if (!currentRefreshToken) return false;
        
        try {
          const response = await fetch(`${API_BASE}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
          });
          const data = await response.json();
          
          if (data.success) {
            set({
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            });
            return true;
          }
          
          await get().logout();
          return false;
        } catch (error) {
          console.error("Refresh token error:", error);
          await get().logout();
          return false;
        }
      },

      getProfile: async () => {
    try {
      const result = await authAPI.getMe();
      set({ user: result.user });
    } catch (error) {
      console.error("Get profile error:", error);
      const refreshSuccess = await get().refreshAuthToken();
      if (refreshSuccess) {
        const result = await authAPI.getMe();
        set({ user: result.user });
      }
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (profileData: Partial<User>) => {
    try {
      const result = await authAPI.updateProfile(profileData);
      set({ user: result.user });
      return result.user;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

      redirectToLogin: (pathname: string) => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(INTENDED_PATH_KEY, pathname);
          window.location.href = '/login';
        }
      },

      redirectAfterLogin: () => {
        const { user } = get();
        if (typeof window !== 'undefined') {
          const intendedPath = sessionStorage.getItem(INTENDED_PATH_KEY);
          
          // If user came from a specific page, redirect there first
          if (intendedPath) {
            sessionStorage.removeItem(INTENDED_PATH_KEY);
            window.location.href = intendedPath;
            return;
          }
          
          // Otherwise redirect to role-specific dashboard
          if (user?.role?.roleName) {
            const dashboardPath = getDashboardPath(user.role.roleName as 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN');
            window.location.href = dashboardPath;
          }
        }
      },
    }),
    {
      name: 'vixxy-auth-storage',
      version: 2, // Increment this to clear old storage
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // If we have a token, try to get the profile, otherwise set loading to false
          if (state.accessToken) {
            state.getProfile();
          } else {
            state.setLoading(false);
          }
        }
      },
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Clear old state if version < 2
          return undefined;
        }
        return persistedState;
      },
    }
  )
);
