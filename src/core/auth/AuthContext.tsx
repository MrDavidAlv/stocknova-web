import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "@/core/api/endpoints";
import { STORAGE_KEYS, extractApiError } from "@/core/api/client";
import type { AuthUser, LoginRequest, RegisterRequest, Role } from "@/core/types/api";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  // Sync logout across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.user) {
        setUser(readStoredUser());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const persistAuth = (data: { accessToken: string; refreshToken: string; user: AuthUser }) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = useCallback(async (body: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(body);
      if (!res.success || !res.data) throw new Error(res.errors?.[0] || res.message || "No se pudo iniciar sesión");
      persistAuth(res.data);
    } catch (err) {
      throw new Error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(body);
      if (!res.success || !res.data) throw new Error(res.errors?.[0] || res.message || "No se pudo registrar");
      persistAuth(res.data);
    } catch (err) {
      throw new Error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.user);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isLoading, login, register, logout, hasRole }),
    [user, isLoading, login, register, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
