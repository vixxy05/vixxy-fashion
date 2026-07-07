"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { User } from "@/lib/types";
import { useRouter, usePathname } from "next/navigation";
import { authAPI } from "@/lib/api";
import { API_BASE, env } from "@/lib/env";

const TOKEN_KEY = "vixxy_access_token";
const REFRESH_TOKEN_KEY = "vixxy_refresh_token";
const USER_KEY = "vixxy_user";
const INTENDED_PATH_KEY = "vixxy_intended_path";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, fullName: string, password: string, phone?: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  redirectToLogin: () => void;
  redirectAfterLogin: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (savedToken && savedUser) {
        setAccessToken(savedToken);
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        try {
          const { user: currentUser } = await authAPI.getMe();
          setUser(currentUser);
          localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        } catch (error) {
          if (savedRefreshToken) {
            try {
              const response = await fetch(`${API_BASE}/auth/refresh-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: savedRefreshToken }),
              });
              const data = await response.json();
              if (data.success) {
                localStorage.setItem(TOKEN_KEY, data.data.accessToken);
                localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refreshToken);
                setAccessToken(data.data.accessToken);
                const { user: refreshedUser } = await authAPI.getMe();
                setUser(refreshedUser);
                localStorage.setItem(USER_KEY, JSON.stringify(refreshedUser));
              } else {
                logoutLocal();
              }
            } catch {
              logoutLocal();
            }
          } else {
            logoutLocal();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const logoutLocal = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setAccessToken(null);
  };

  const redirectToLogin = useCallback(() => {
    sessionStorage.setItem(INTENDED_PATH_KEY, pathname);
    router.push("/login");
  }, [pathname, router]);

  const redirectAfterLogin = useCallback(() => {
    const intendedPath = sessionStorage.getItem(INTENDED_PATH_KEY);
    if (user?.role?.roleName === "ADMIN" || user?.role?.roleName === "SUPER_ADMIN" || user?.role?.roleName === "STAFF") {
      window.location.href = env.adminUrl;
      return;
    }
    if (intendedPath) {
      sessionStorage.removeItem(INTENDED_PATH_KEY);
      router.push(intendedPath);
    } else {
      router.push("/");
    }
  }, [router, user]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    try {
      const { user: updatedUser } = await authAPI.updateProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { accessToken: newToken, refreshToken, user: newUser } = await authAPI.login(email, password);
      setAccessToken(newToken);
      setUser(newUser);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, []);

  const register = useCallback(
    async (email: string, fullName: string, password: string, phone?: string) => {
      try {
        await authAPI.register(email, password, fullName, phone);
        const loginSuccess = await login(email, password);
        return loginSuccess;
      } catch (error) {
        console.error("Register error:", error);
        return false;
      }
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logoutLocal();
      router.push("/login");
    }
  }, [router]);

  const value = useMemo(
    () => ({ user, accessToken, login, register, updateProfile, logout, redirectToLogin, redirectAfterLogin, loading }),
    [user, accessToken, login, register, updateProfile, logout, redirectToLogin, redirectAfterLogin, loading]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
