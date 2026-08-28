import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { onUnauthorized } from '../api/client';
import { tokenStorage } from '../lib/tokenStorage';
import type { User } from '../types';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  // A stored token is not treated as proof of a valid session. Restore the
  // authenticated user from the backend before rendering protected routes.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!tokenStorage.get()) {
        setIsInitializing(false);
        return;
      }

      try {
        const currentUser = await authApi.me();
        if (!cancelled) setUser(currentUser);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  useEffect(() => {
    return onUnauthorized(clearSession);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    queryClient.clear();
    tokenStorage.set(response.token);
    setUser(response.user);
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      if (tokenStorage.get()) await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && tokenStorage.get()),
      isInitializing,
      login,
      logout,
    }),
    [user, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
