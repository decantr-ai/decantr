import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavFooter } from './shells/TopNavFooter';
import { TopNavMain } from './shells/TopNavMain';
import { SidebarMain } from './shells/SidebarMain';
import { MinimalHeader } from './shells/MinimalHeader';
import { Centered } from './shells/Centered';

// Public (marketing/about/contact/legal)
import { HomePage } from './pages/HomePage';
import { PricingPage } from './pages/PricingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { TermsPage } from './pages/legal/TermsPage';
import { CookiesPage } from './pages/legal/CookiesPage';

// Auth (gateway)
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { MfaSetupPage } from './pages/auth/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/auth/PhoneVerifyPage';

// Creator (sidebar-main)
import { DashboardHomePage } from './pages/dashboard/DashboardHomePage';
import { EarningsPage } from './pages/dashboard/EarningsPage';
import { PayoutsPage } from './pages/dashboard/PayoutsPage';
import { ContentListPage } from './pages/dashboard/ContentListPage';
import { ContentNewPage } from './pages/dashboard/ContentNewPage';
import { ContentEditPage } from './pages/dashboard/ContentEditPage';
import { SubscribersPage } from './pages/dashboard/SubscribersPage';
import { SubscriberDetailPage } from './pages/dashboard/SubscriberDetailPage';
import { TiersPage } from './pages/dashboard/TiersPage';

// Settings (sidebar-main)
import { SettingsProfilePage } from './pages/settings/SettingsProfilePage';
import { SettingsSecurityPage } from './pages/settings/SettingsSecurityPage';
import { SettingsPreferencesPage } from './pages/settings/SettingsPreferencesPage';
import { SettingsDangerPage } from './pages/settings/SettingsDangerPage';

// Fan side (top-nav-main)
import { LibraryPage } from './pages/fan/LibraryPage';
import { SubscriptionsPage } from './pages/fan/SubscriptionsPage';
import { CreatorProfilePage } from './pages/fan/CreatorProfilePage';
import { PostPage } from './pages/fan/PostPage';

// Checkout (minimal-header)
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { PurchasePage } from './pages/checkout/PurchasePage';
import { CheckoutSuccessPage } from './pages/checkout/CheckoutSuccessPage';

import { useAuth } from './hooks/useAuth';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public zone — top-nav-footer */}
        <Route element={<TopNavFooter />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
        </Route>

        {/* Gateway zone — centered */}
        <Route element={<GuestGuard><Centered /></GuestGuard>}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/mfa-setup" element={<MfaSetupPage />} />
          <Route path="/mfa-verify" element={<MfaVerifyPage />} />
          <Route path="/phone-verify" element={<PhoneVerifyPage />} />
        </Route>

        {/* Creator App zone — sidebar-main (dashboard + settings) */}
        <Route element={<AuthGuard><SidebarMain /></AuthGuard>}>
          <Route path="/dashboard" element={<DashboardHomePage />} />
          <Route path="/dashboard/earnings" element={<EarningsPage />} />
          <Route path="/dashboard/content" element={<ContentListPage />} />
          <Route path="/dashboard/content/new" element={<ContentNewPage />} />
          <Route path="/dashboard/content/:id/edit" element={<ContentEditPage />} />
          <Route path="/dashboard/subscribers" element={<SubscribersPage />} />
          <Route path="/dashboard/subscribers/:id" element={<SubscriberDetailPage />} />
          <Route path="/dashboard/tiers" element={<TiersPage />} />
          <Route path="/settings/profile" element={<SettingsProfilePage />} />
          <Route path="/settings/security" element={<SettingsSecurityPage />} />
          <Route path="/settings/preferences" element={<SettingsPreferencesPage />} />
          <Route path="/settings/account" element={<SettingsDangerPage />} />
          <Route path="/settings/payouts" element={<PayoutsPage />} />
        </Route>

        {/* Fan App zone — top-nav-main (storefront + library) */}
        <Route element={<AuthGuard><TopNavMain /></AuthGuard>}>
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/creator/:username" element={<CreatorProfilePage />} />
          <Route path="/creator/:username/post/:id" element={<PostPage />} />
        </Route>

        {/* Checkout zone — minimal-header */}
        <Route element={<AuthGuard><MinimalHeader /></AuthGuard>}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/purchase" element={<PurchasePage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
