import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavFooter } from './shells/TopNavFooter';
import { TopNavMain } from './shells/TopNavMain';
import { SidebarMain } from './shells/SidebarMain';
import { MinimalHeader } from './shells/MinimalHeader';
import { Centered } from './shells/Centered';
import { HomePage } from './pages/HomePage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DraftsPage } from './pages/DraftsPage';
import { EditorPage } from './pages/EditorPage';
import { PublishedPage } from './pages/PublishedPage';
import { SubscribePage } from './pages/SubscribePage';
import { NewsletterArchivePage } from './pages/NewsletterArchivePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuth } from './hooks/useAuth';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/drafts" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/drafts" replace />} />

        {/* Gateway zone — centered shell (auth-flow) */}
        <Route
          element={
            <GuestGuard>
              <Centered />
            </GuestGuard>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* App zone — sidebar-main shell (content-author, settings) */}
        <Route
          element={
            <AuthGuard>
              <SidebarMain />
            </AuthGuard>
          }
        >
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/drafts/:id" element={<EditorPage />} />
          <Route path="/published" element={<PublishedPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/drafts" replace />} />
      </Routes>
    </HashRouter>
  );
}
