import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { TopNavMain } from '@/shells/TopNavMain';

// Public
import { MarketingHomePage } from '@/pages/MarketingHomePage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { CookiesPage } from '@/pages/CookiesPage';

// Auth
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/MfaVerifyPage';

// App (owner/manager)
import { DashboardPage } from '@/pages/DashboardPage';
import { PropertiesPage } from '@/pages/PropertiesPage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { PropertyCreatePage } from '@/pages/PropertyCreatePage';
import { PropertyUnitsPage } from '@/pages/PropertyUnitsPage';
import { PropertyUnitDetailPage } from '@/pages/PropertyUnitDetailPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { TenantsPage } from '@/pages/TenantsPage';
import { TenantDetailPage } from '@/pages/TenantDetailPage';
import { FinancialsOverviewPage } from '@/pages/FinancialsOverviewPage';
import { FinancialsRentRollPage } from '@/pages/FinancialsRentRollPage';
import { FinancialsExpensesPage } from '@/pages/FinancialsExpensesPage';
import { MaintenanceBoardPage } from '@/pages/MaintenanceBoardPage';
import { MaintenanceTicketPage } from '@/pages/MaintenanceTicketPage';
import { SettingsProfilePage } from '@/pages/SettingsProfilePage';
import { SettingsSecurityPage } from '@/pages/SettingsSecurityPage';
import { SettingsPreferencesPage } from '@/pages/SettingsPreferencesPage';
import { SettingsAccountPage } from '@/pages/SettingsAccountPage';

// Tenant portal
import { TenantPortalHomePage } from '@/pages/TenantPortalHomePage';
import { TenantPortalMaintenancePage } from '@/pages/TenantPortalMaintenancePage';
import { TenantPortalDocumentsPage } from '@/pages/TenantPortalDocumentsPage';
import { TenantPortalPaymentsPage } from '@/pages/TenantPortalPaymentsPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public — top-nav-footer */}
      <Route element={<TopNavFooter />}>
        <Route path="/" element={<MarketingHomePage />} />
        <Route path="/pricing" element={<MarketingHomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
      </Route>

      {/* Gateway — auth */}
      <Route element={<Centered />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/mfa-setup" element={<MfaSetupPage />} />
        <Route path="/mfa-verify" element={<MfaVerifyPage />} />
      </Route>

      {/* App — sidebar-main (owner/manager) */}
      <Route element={<SidebarMain />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/new" element={<PropertyCreatePage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/properties/:id/units" element={<PropertyUnitsPage />} />
        <Route path="/properties/:id/units/:unitId" element={<PropertyUnitDetailPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/tenants/:id" element={<TenantDetailPage />} />
        <Route path="/financials" element={<FinancialsOverviewPage />} />
        <Route path="/financials/rent-roll" element={<FinancialsRentRollPage />} />
        <Route path="/financials/expenses" element={<FinancialsExpensesPage />} />
        <Route path="/maintenance" element={<MaintenanceBoardPage />} />
        <Route path="/maintenance/:id" element={<MaintenanceTicketPage />} />
        <Route path="/settings/profile" element={<SettingsProfilePage />} />
        <Route path="/settings/security" element={<SettingsSecurityPage />} />
        <Route path="/settings/preferences" element={<SettingsPreferencesPage />} />
        <Route path="/settings/account" element={<SettingsAccountPage />} />
      </Route>

      {/* Tenant portal — top-nav-main */}
      <Route element={<TopNavMain />}>
        <Route path="/tenant-portal" element={<TenantPortalHomePage />} />
        <Route path="/tenant-portal/payments" element={<TenantPortalPaymentsPage />} />
        <Route path="/tenant-portal/maintenance" element={<TenantPortalMaintenancePage />} />
        <Route path="/tenant-portal/documents" element={<TenantPortalDocumentsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthContext.Provider>
  );
}
