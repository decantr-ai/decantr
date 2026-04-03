import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './hooks/useAuth';
import { SidebarAside } from './shells/SidebarAside';
import { SidebarMain } from './shells/SidebarMain';
import { Centered } from './shells/Centered';
import { WorkspacePage } from './pages/workspace/WorkspacePage';
import { ComponentDetailPage } from './pages/workspace/ComponentDetailPage';
import { CatalogPage } from './pages/catalog/CatalogPage';
import { CatalogDetailPage } from './pages/catalog/CatalogDetailPage';
import { InspectorPage } from './pages/inspector/InspectorPage';
import { PreviewPage } from './pages/inspector/PreviewPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { CommandPalette } from './components/CommandPalette';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem('decantr_authenticated') === 'true';
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem('decantr_authenticated') === 'true'
  );
  const [paletteOpen, setPaletteOpen] = useState(false);

  const login = useCallback(() => {
    localStorage.setItem('decantr_authenticated', 'true');
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('decantr_authenticated');
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(v => !v);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <HashRouter>
        <Routes>
          {/* Gateway zone — centered shell */}
          <Route element={<Centered />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* App zone — sidebar-aside shell (workbench-core, workbench-inspector) */}
          <Route element={<AuthGuard><SidebarAside /></AuthGuard>}>
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/workspace/:id" element={<ComponentDetailPage />} />
            <Route path="/inspector" element={<InspectorPage />} />
            <Route path="/preview" element={<PreviewPage />} />
          </Route>

          {/* App zone — sidebar-main shell (workbench-catalog, settings) */}
          <Route element={<AuthGuard><SidebarMain /></AuthGuard>}>
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:id" element={<CatalogDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/workspace" replace />} />
        </Routes>
        {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      </HashRouter>
    </AuthContext.Provider>
  );
}
