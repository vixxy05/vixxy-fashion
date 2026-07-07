import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE, STORE_URL } from '../config/env';
const TOKEN_KEY = 'admin_access_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';
const USER_KEY = 'admin_user';

interface Role {
  id: number;
  roleName: string;
  description?: string;
}

interface User {
  id: number;
  email: string;
  phone?: string;
  username?: string;
  fullName: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'banned';
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: string;
  roleId: number;
  role?: Role;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logoutLocal = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setAccessToken(null);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Refresh failed');

    localStorage.setItem(TOKEN_KEY, data.data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refreshToken);
    return data.data.accessToken;
  }, []);

  const getMe = useCallback(async (currentToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const newToken = await refreshAccessToken();
          const retryResponse = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${newToken}` },
          });
          if (!retryResponse.ok) throw new Error('Unauthorized');
          const retryData = await retryResponse.json();
          return retryData.data.user;
        }
        throw new Error('Unauthorized');
      }

      const data = await response.json();
      return data.data.user;
    } catch {
      return null;
    }
  }, [refreshAccessToken]);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (savedToken && savedUser) {
        setAccessToken(savedToken);
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        const currentUser = await getMe(savedToken);
        if (currentUser) {
          const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'STAFF'];
          if (!allowedRoles.includes(currentUser.role?.roleName)) {
            logoutLocal();
            window.location.href = STORE_URL;
            return;
          }
          setUser(currentUser);
          localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        } else {
          logoutLocal();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [getMe, logoutLocal]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const { tokens, user: newUser } = data.data;
      const { accessToken: newToken, refreshToken } = tokens;

      const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'STAFF'];
      if (!allowedRoles.includes(newUser.role?.roleName)) {
        throw new Error('Not authorized');
      }

      setAccessToken(newToken);
      setUser(newUser);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logoutLocal();
      window.location.href = `${STORE_URL}/login`;
    }
  }, [logoutLocal]);

  const value = useMemo(
    () => ({ user, accessToken, login, logout, loading }),
    [user, accessToken, login, logout, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
