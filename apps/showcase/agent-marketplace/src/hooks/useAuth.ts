import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AUTH_KEY = 'agent-marketplace-auth';

interface AuthState {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
}

export function useAuth() {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch { /* ignore */ }
    }
    return { isAuthenticated: false, user: null };
  });

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  }, [state]);

  const login = useCallback(async (email: string, _password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setState({ isAuthenticated: true, user: { email, name: 'Operator' } });
    navigate('/agents');
  }, [navigate]);

  const logout = useCallback(() => {
    setState({ isAuthenticated: false, user: null });
    localStorage.removeItem(AUTH_KEY);
    navigate('/login');
  }, [navigate]);

  return { ...state, login, logout };
}
