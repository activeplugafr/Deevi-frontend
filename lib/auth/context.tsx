"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authApi } from "@/lib/api";
import type { AuthResponse, AuthUser, Role, SignupInput } from "@/lib/types";
import {
  clearSession,
  getSession,
  setSession,
  onSessionChange,
} from "./session";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  role: Role | null;
  isAdmin: boolean;
  isArtisan: boolean;
  isCustomer: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (input: SignupInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthState | null>(null);

/** The user's primary role, used for routing and navigation. */
export function primaryRole(user: AuthUser | null): Role | null {
  if (!user) return null;
  const roles = user.roles ?? [];
  if (roles.includes("ADMIN") || user.adminRole) return "ADMIN";
  if (roles.includes("ARTISAN")) return "ARTISAN";
  if (roles.includes("CUSTOMER")) return "CUSTOMER";
  return null;
}

function applySession(res: AuthResponse) {
  if (res.session?.accessToken) {
    setSession({
      accessToken: res.session.accessToken,
      refreshToken: res.session.refreshToken,
      expiresAt: res.session.expiresAt,
    });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const bootstrapped = useRef(false);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    if (!getSession()?.accessToken) {
      setUser(null);
      setStatus("anonymous");
      return null;
    }
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus("authenticated");
      return me;
    } catch {
      // Token invalid/expired and refresh failed — treat as signed out.
      clearSession();
      setUser(null);
      setStatus("anonymous");
      return null;
    }
  }, []);

  // Restore session on first mount.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    void refreshUser();
  }, [refreshUser]);

  // Keep tabs in sync when the session is cleared elsewhere.
  useEffect(() => {
    return onSessionChange(() => {
      if (!getSession()) {
        setUser(null);
        setStatus("anonymous");
      }
    });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      applySession(res);
      const me = res.user ?? (await authApi.me());
      setUser(me);
      setStatus("authenticated");
      return me;
    },
    [],
  );

  const signup = useCallback(async (input: SignupInput) => {
    const res = await authApi.signup(input);
    applySession(res);
    if (res.session?.accessToken) {
      setUser(res.user);
      setStatus("authenticated");
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* best-effort; we clear locally regardless */
    }
    clearSession();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const role = primaryRole(user);

  const value = useMemo<AuthState>(
    () => ({
      user,
      status,
      role,
      isAdmin: role === "ADMIN",
      isArtisan: role === "ARTISAN",
      isCustomer: role === "CUSTOMER",
      login,
      signup,
      logout,
      refreshUser,
    }),
    [user, status, role, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/** Where a role's app lives. */
export function homePathFor(role: Role | null): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "ARTISAN":
      return "/artisan";
    case "CUSTOMER":
      return "/home";
    default:
      return "/login";
  }
}
