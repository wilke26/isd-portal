import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { onUnauthorized } from '../api/client';
import { tokenStorage } from '../lib/tokenStorage';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** true während der App-Start prüft, ob bereits ein Token vorliegt. */
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Beim App-Start: Token evtl. vorhanden, aber User-Objekt noch nicht bekannt.
  // Für den MVP reicht "Token vorhanden = eingeloggt"; der User wird erst nach
  // einem echten Login gesetzt. Optional später: GET /auth/me nachrüsten, um
  // den User-State auch nach einem Seiten-Reload wiederherzustellen.
  useEffect(() => {
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    return onUnauthorized(() => {
      tokenStorage.clear();
      setUser(null);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    tokenStorage.set(response.token);
    setUser(response.user);
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(tokenStorage.get()),
      isInitializing,
      login,
      logout,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, isInitializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth muss innerhalb von <AuthProvider> verwendet werden');
  }
  return ctx;
}
