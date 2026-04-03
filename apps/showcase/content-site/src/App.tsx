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
    return <Navigate to="/articles" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public zone — top-nav-footer shell (marketing-content) */}
        <Route element={<TopNavFooter />}>
          <Route path="/" element={<HomePage />} />
        </Route>

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

        {/* App zone (primary) — top-nav-main shell (content-reader) */}
        <Route
          element={
            <AuthGuard>
              <TopNavMain />
            </AuthGuard>
          }
        >
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Route>

        {/* App zone (auxiliary) — sidebar-main shell (content-author, settings) */}
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

        {/* App zone (auxiliary) — minimal-header shell (content-newsletter) */}
        <Route
          element={
            <AuthGuard>
              <MinimalHeader />
            </AuthGuard>
          }
        >
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/newsletter" element={<NewsletterArchivePage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
