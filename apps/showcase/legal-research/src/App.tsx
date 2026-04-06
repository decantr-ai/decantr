import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavFooter } from './shells/TopNavFooter';
import { Centered } from './shells/Centered';
import { SidebarAside } from './shells/SidebarAside';
import { SidebarMain } from './shells/SidebarMain';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { MfaSetupPage } from './pages/MfaSetupPage';
import { MfaVerifyPage } from './pages/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/PhoneVerifyPage';
import { ResearchSearchPage } from './pages/ResearchSearchPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { ResearchMemoPage } from './pages/ResearchMemoPage';
import { ContractsPage } from './pages/ContractsPage';
import { ContractDetailPage } from './pages/ContractDetailPage';
import { ContractComparePage } from './pages/ContractComparePage';
import { MattersPage } from './pages/MattersPage';
import { MatterDetailPage } from './pages/MatterDetailPage';
import { CitationsPage } from './pages/CitationsPage';
import { CitationCheckPage } from './pages/CitationCheckPage';
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
    return <Navigate to="/research" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public zone — top-nav-footer shell (marketing-legal) */}
        <Route element={<TopNavFooter />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Gateway zone — centered shell (auth-full) */}
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

        {/* App zone (primary) — sidebar-aside shell (research-workspace) */}
        <Route
          element={
            <AuthGuard>
              <SidebarAside />
            </AuthGuard>
          }
        >
          <Route path="/research" element={<ResearchSearchPage />} />
          <Route path="/research/cases/:id" element={<CaseDetailPage />} />
          <Route path="/research/memo" element={<ResearchMemoPage />} />
        </Route>

        {/* App zone (auxiliary) — sidebar-main shell (contract-center) */}
        <Route
          element={
            <AuthGuard>
              <SidebarMain />
            </AuthGuard>
          }
        >
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/contracts/:id" element={<ContractDetailPage />} />
          <Route path="/contracts/compare" element={<ContractComparePage />} />
        </Route>

        {/* App zone (auxiliary) — sidebar-main shell (matter-management) */}
        <Route
          element={
            <AuthGuard>
              <SidebarMain />
            </AuthGuard>
          }
        >
          <Route path="/matters" element={<MattersPage />} />
          <Route path="/matters/:id" element={<MatterDetailPage />} />
        </Route>

        {/* App zone (auxiliary) — sidebar-main shell (citation-tools) */}
        <Route
          element={
            <AuthGuard>
              <SidebarMain />
            </AuthGuard>
          }
        >
          <Route path="/citations" element={<CitationsPage />} />
          <Route path="/citations/check" element={<CitationCheckPage />} />
        </Route>

        {/* App zone (auxiliary) — sidebar-aside shell (settings-full) */}
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
