import { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  org: string;
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
  name: 'Morgan Rivera',
  email: 'morgan@brightgoods.shop',
  avatar: 'MR',
  role: 'Store Admin',
  org: 'Brightgoods',
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
