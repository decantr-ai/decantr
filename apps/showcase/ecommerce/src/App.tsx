import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { TopNavMain } from '@/shells/TopNavMain';
import { MinimalHeader } from '@/shells/MinimalHeader';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';

import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/auth/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from '@/pages/auth/PhoneVerifyPage';

import { ProfileSettingsPage } from '@/pages/settings/ProfileSettingsPage';
import { SecuritySettingsPage } from '@/pages/settings/SecuritySettingsPage';
import { PreferencesSettingsPage } from '@/pages/settings/PreferencesSettingsPage';
import { DangerSettingsPage } from '@/pages/settings/DangerSettingsPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public zone — marketing — top-nav-footer shell */}
      <Route element={<TopNavFooter />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* App zone — storefront (primary) — top-nav-main shell */}
      <Route element={<TopNavMain />}>
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>

      {/* Auxiliary — checkout — minimal-header shell */}
      <Route element={<MinimalHeader />}>
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      {/* Auxiliary — orders — sidebar-main shell */}
      <Route element={<SidebarMain />}>
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/settings/profile" element={<ProfileSettingsPage />} />
        <Route path="/settings/security" element={<SecuritySettingsPage />} />
        <Route path="/settings/preferences" element={<PreferencesSettingsPage />} />
        <Route path="/settings/danger" element={<DangerSettingsPage />} />
      </Route>

      {/* Gateway zone — auth — centered shell */}
      <Route element={<Centered />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/mfa-setup" element={<MfaSetupPage />} />
        <Route path="/mfa-verify" element={<MfaVerifyPage />} />
        <Route path="/phone-verify" element={<PhoneVerifyPage />} />
      </Route>

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
