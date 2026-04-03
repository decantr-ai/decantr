import { useState, useCallback } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem('decantr_authenticated') === 'true'
  );

  const login = useCallback(() => {
    localStorage.setItem('decantr_authenticated', 'true');
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('decantr_authenticated');
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout };
}
