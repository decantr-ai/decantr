import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { TopNavMain } from '@/shells/TopNavMain';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';

// Marketing
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';

// Listing browser
import { BrowsePage } from '@/pages/BrowsePage';
import { SearchPage } from '@/pages/SearchPage';
import { ListingDetailPage } from '@/pages/ListingDetailPage';

// Buyer dashboard
import { BookingsPage } from '@/pages/buyer/BookingsPage';
import { FavoritesPage } from '@/pages/buyer/FavoritesPage';
import { BuyerMessagesPage } from '@/pages/buyer/BuyerMessagesPage';

// Seller dashboard
import { SellerOverviewPage } from '@/pages/seller/SellerOverviewPage';
import { SellerListingsPage } from '@/pages/seller/SellerListingsPage';
import { SellerListingEditPage } from '@/pages/seller/SellerListingEditPage';
import { SellerAnalyticsPage } from '@/pages/seller/SellerAnalyticsPage';
import { SellerReviewsPage } from '@/pages/seller/SellerReviewsPage';

// Messaging
import { MessagesPage } from '@/pages/messages/MessagesPage';
import { ThreadPage } from '@/pages/messages/ThreadPage';

// Reviews
import { WriteReviewPage } from '@/pages/reviews/WriteReviewPage';

// Auth
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/auth/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from '@/pages/auth/PhoneVerifyPage';

// Settings
import { ProfileSettingsPage } from '@/pages/settings/ProfileSettingsPage';
import { SecuritySettingsPage } from '@/pages/settings/SecuritySettingsPage';
import { PreferencesSettingsPage } from '@/pages/settings/PreferencesSettingsPage';
import { DangerSettingsPage } from '@/pages/settings/DangerSettingsPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public — marketing — top-nav-footer shell */}
      <Route element={<TopNavFooter />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Primary — listing browser + settings — top-nav-main shell */}
      <Route element={<TopNavMain />}>
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/settings/profile" element={<ProfileSettingsPage />} />
        <Route path="/settings/security" element={<SecuritySettingsPage />} />
        <Route path="/settings/preferences" element={<PreferencesSettingsPage />} />
        <Route path="/settings/danger" element={<DangerSettingsPage />} />
      </Route>

      {/* Auxiliary — dashboards / messaging / reviews — sidebar-main shell */}
      <Route element={<SidebarMain />}>
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/buyer/messages" element={<BuyerMessagesPage />} />
        <Route path="/seller" element={<SellerOverviewPage />} />
        <Route path="/seller/listings" element={<SellerListingsPage />} />
        <Route path="/seller/listings/:id/edit" element={<SellerListingEditPage />} />
        <Route path="/seller/analytics" element={<SellerAnalyticsPage />} />
        <Route path="/seller/reviews" element={<SellerReviewsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:id" element={<ThreadPage />} />
        <Route path="/reviews/write" element={<WriteReviewPage />} />
      </Route>

      {/* Gateway — auth — centered shell */}
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
