import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavFooter } from './shells/TopNavFooter';
import { SidebarMain } from './shells/SidebarMain';
import { Centered } from './shells/Centered';
import { SidebarAside } from './shells/SidebarAside';

import { HomePage } from './pages/HomePage';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { MfaSetupPage } from './pages/auth/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/auth/PhoneVerifyPage';

import { FloorPage } from './pages/floor/FloorPage';
import { ReservationsPage } from './pages/floor/ReservationsPage';
import { NewReservationPage } from './pages/floor/NewReservationPage';

import { KitchenPage } from './pages/kitchen/KitchenPage';
import { StationsPage } from './pages/kitchen/StationsPage';

import { MenusPage } from './pages/menus/MenusPage';
import { MenuDetailPage } from './pages/menus/MenuDetailPage';
import { MenuEngineeringPage } from './pages/menus/MenuEngineeringPage';

import { InventoryPage } from './pages/inventory/InventoryPage';
import { IngredientDetailPage } from './pages/inventory/IngredientDetailPage';
import { OrdersPage } from './pages/inventory/OrdersPage';

import { ShiftPage } from './pages/shift/ShiftPage';
import { TipsPage } from './pages/shift/TipsPage';

import { CustomersPage } from './pages/customers/CustomersPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';
import { LoyaltyProgramPage } from './pages/customers/LoyaltyProgramPage';

import { DashboardPage } from './pages/ops/DashboardPage';
import { ReportsPage } from './pages/ops/ReportsPage';

import { SettingsProfilePage } from './pages/settings/SettingsProfilePage';
import { SettingsSecurityPage } from './pages/settings/SettingsSecurityPage';
import { SettingsPreferencesPage } from './pages/settings/SettingsPreferencesPage';
import { SettingsDangerPage } from './pages/settings/SettingsDangerPage';

import { useAuth } from './hooks/useAuth';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/floor" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public zone — top-nav-footer (marketing-restaurant) */}
        <Route element={<TopNavFooter />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Gateway zone — centered (auth-full) */}
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

        {/* App zone — sidebar-main (all operational sections + settings) */}
        <Route element={<AuthGuard><SidebarMain /></AuthGuard>}>
          {/* restaurant-floor */}
          <Route path="/floor" element={<FloorPage />} />
          <Route path="/floor/reservations" element={<ReservationsPage />} />
          <Route path="/floor/reservations/new" element={<NewReservationPage />} />

          {/* kitchen-display */}
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/kitchen/stations" element={<StationsPage />} />

          {/* menu-management */}
          <Route path="/menus" element={<MenusPage />} />
          <Route path="/menus/engineering" element={<MenuEngineeringPage />} />
          <Route path="/menus/:id" element={<MenuDetailPage />} />

          {/* inventory-supplies */}
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/orders" element={<OrdersPage />} />
          <Route path="/inventory/:id" element={<IngredientDetailPage />} />

          {/* server-station */}
          <Route path="/shift" element={<ShiftPage />} />
          <Route path="/shift/tips" element={<TipsPage />} />

          {/* customer-loyalty */}
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/loyalty" element={<LoyaltyProgramPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />

          {/* daily-operations */}
          <Route path="/ops" element={<DashboardPage />} />
          <Route path="/ops/reports" element={<ReportsPage />} />

          {/* settings-full (with sidebar-aside nested) */}
          <Route element={<SidebarAside />}>
            <Route path="/settings/profile" element={<SettingsProfilePage />} />
            <Route path="/settings/security" element={<SettingsSecurityPage />} />
            <Route path="/settings/preferences" element={<SettingsPreferencesPage />} />
            <Route path="/settings/danger" element={<SettingsDangerPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
