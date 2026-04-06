import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavFooter } from './shells/TopNavFooter';
import { Centered } from './shells/Centered';
import { SidebarMain } from './shells/SidebarMain';
import { SidebarAside } from './shells/SidebarAside';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { MfaSetupPage } from './pages/MfaSetupPage';
import { MfaVerifyPage } from './pages/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/PhoneVerifyPage';
import { NotebookPage } from './pages/NotebookPage';
import { EntryDetailPage } from './pages/EntryDetailPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { ExperimentDetailPage } from './pages/ExperimentDetailPage';
import { SamplesPage } from './pages/SamplesPage';
import { SampleDetailPage } from './pages/SampleDetailPage';
import { InstrumentsPage } from './pages/InstrumentsPage';
import { InstrumentDetailPage } from './pages/InstrumentDetailPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { DatasetDetailPage } from './pages/DatasetDetailPage';
import { SettingsProfilePage } from './pages/SettingsProfilePage';
import { SettingsSecurityPage } from './pages/SettingsSecurityPage';
import { SettingsPreferencesPage } from './pages/SettingsPreferencesPage';
import { SettingsDangerPage } from './pages/SettingsDangerPage';
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
    return <Navigate to="/notebook" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public zone — top-nav-footer shell (marketing) */}
        <Route element={<TopNavFooter />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Gateway zone — centered shell (auth) */}
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
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/mfa-setup" element={<MfaSetupPage />} />
          <Route path="/mfa-verify" element={<MfaVerifyPage />} />
          <Route path="/phone-verify" element={<PhoneVerifyPage />} />
        </Route>

        {/* Primary zone — sidebar-aside shell (lab-notebook) */}
        <Route
          element={
            <AuthGuard>
              <SidebarAside />
            </AuthGuard>
          }
        >
          <Route path="/notebook" element={<NotebookPage />} />
          <Route path="/notebook/:id" element={<EntryDetailPage />} />
        </Route>

        {/* Auxiliary zone — sidebar-main shell (experiment-tracker) */}
        <Route
          element={
            <AuthGuard>
              <SidebarMain />
            </AuthGuard>
          }
        >
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/experiments/:id" element={<ExperimentDetailPage />} />
        </Route>

        {/* Auxiliary zone — sidebar-main shell (sample-inventory) */}
        <Route
          element={
            <AuthGuard>
              <SidebarMain />
            </AuthGuard>
          }
        >
          <Route path="/samples" element={<SamplesPage />} />
          <Route path="/samples/:id" element={<SampleDetailPage />} />
        </Route>

        {/* Auxiliary zone — sidebar-main shell (instrument-booking) */}
        <Route
          element={
            <AuthGuard>
              <SidebarMain />
            </AuthGuard>
          }
        >
          <Route path="/instruments" element={<InstrumentsPage />} />
          <Route path="/instruments/:id" element={<InstrumentDetailPage />} />
        </Route>

        {/* Auxiliary zone — sidebar-main shell (data-repository) */}
        <Route
          element={
            <AuthGuard>
              <SidebarMain />
            </AuthGuard>
          }
        >
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/datasets/:id" element={<DatasetDetailPage />} />
        </Route>

        {/* Auxiliary zone — sidebar-aside shell (settings) */}
        <Route
          element={
            <AuthGuard>
              <SidebarAside />
            </AuthGuard>
          }
        >
          <Route path="/settings/profile" element={<SettingsProfilePage />} />
          <Route path="/settings/security" element={<SettingsSecurityPage />} />
          <Route path="/settings/preferences" element={<SettingsPreferencesPage />} />
          <Route path="/settings/danger" element={<SettingsDangerPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
