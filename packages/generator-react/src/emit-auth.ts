import type { IRAppNode, GeneratedFile } from '@decantr/generator-core';

// AUTO: Auth feature detection helper
export function hasAuth(app: IRAppNode): boolean {
  return app.features.includes('auth');
}

/** Emit src/contexts/AuthContext.tsx — React context with mock auth */
function emitAuthContext(): GeneratedFile {
  const content = `import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

// AUTO: Auth user type — extend with your own fields as needed
interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'decantr_auth_user';

const AuthContext = createContext<AuthContextValue | null>(null);

// AUTO: Module-level default props hoisted outside component (Vercel best practice)
const DEFAULT_CHILDREN: React.ReactNode = null;

export function AuthProvider({ children = DEFAULT_CHILDREN }: { children?: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // AUTO: Restore persisted auth state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // AUTO: Ignore malformed storage data
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    // TODO: Replace with real authentication API call
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: AuthUser = { id: '1', email, name: email.split('@')[0] };
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const isAuthenticated = user !== null;

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }), [user, isAuthenticated, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
`;

  return { path: 'src/contexts/AuthContext.tsx', content };
}

/** Emit src/pages/LoginPage.tsx — Login form with shadcn components */
function emitLoginPage(): GeneratedFile {
  const content = `import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';

// AUTO: Module-level initial form state (Vercel best practice — hoist non-primitive defaults)
const INITIAL_FORM_STATE = { email: '', password: '', remember: false };

export default function LoginPage() {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  }, [form.email, form.password, login, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={form.remember}
                onCheckedChange={checked => setForm(prev => ({ ...prev, remember: checked === true }))}
              />
              <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
`;

  return { path: 'src/pages/LoginPage.tsx', content };
}

/** Emit src/components/ProtectedRoute.tsx — redirect to /login if not authenticated */
function emitProtectedRoute(): GeneratedFile {
  const content = `import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// AUTO: Module-level loading spinner (same as App.tsx, keeps ProtectedRoute self-contained)
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full w-full p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
`;

  return { path: 'src/components/ProtectedRoute.tsx', content };
}

/** Emit all auth-related files when features includes "auth" */
export function emitAuth(app: IRAppNode): GeneratedFile[] {
  if (!hasAuth(app)) {
    return [];
  }

  return [
    emitAuthContext(),
    emitLoginPage(),
    emitProtectedRoute(),
  ];
}
