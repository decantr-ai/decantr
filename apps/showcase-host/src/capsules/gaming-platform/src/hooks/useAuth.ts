import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  level: number;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  register: (email: string, password: string, name: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'decantr_authenticated';

const mockUser: User = {
  id: 'u1',
  name: 'NightBlade',
  avatar: 'NB',
  rank: 3,
  level: 42,
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  register: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthProvider() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );

  const login = useCallback((_email: string, _password: string) => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsAuthenticated(true);
  }, []);

  const register = useCallback((_email: string, _password: string, _name: string) => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return {
    user: isAuthenticated ? mockUser : null,
    isAuthenticated,
    login,
    register,
    logout,
  };
}

export { type User, type AuthContextValue };

// Helper to create the provider element — used in App.tsx
export function createAuthProvider(children: ReactNode) {
  return { children };
}
