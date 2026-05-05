import { createContext, useContext, useState, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  team: string;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  register: (email: string, password: string, name: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'esports_hq_authenticated';

const mockUser: User = {
  id: 'u1',
  name: 'Coach Viper',
  avatar: 'CV',
  role: 'Head Coach',
  team: 'Shadow Legion',
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
