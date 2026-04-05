import { useCallback, useEffect, useState } from 'react';

const AUTH_KEY = 'decantr_dps_authenticated';

export function useAuth() {
  const [isAuthenticated, setAuth] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem(AUTH_KEY) === 'true'
      : false,
  );

  useEffect(() => {
    function onStorage() {
      setAuth(localStorage.getItem(AUTH_KEY) === 'true');
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback(() => {
    localStorage.setItem(AUTH_KEY, 'true');
    setAuth(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setAuth(false);
  }, []);

  return { isAuthenticated, login, logout };
}
