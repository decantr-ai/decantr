import { createContext, useContext, useState, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  register: (email: string, password: string, name: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'decantr_mtp_authenticated';

const mockUser: User = {
  id: 'u1',
  name: 'Sarah Chen',
  email: 'sarah@acmecorp.io',
  avatar: 'SC',
  role: 'Owner',
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

export function useAuthProvider(): AuthContextValue {
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
