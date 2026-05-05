import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';
import { CommunityPage } from '@/pages/CommunityPage';
import { NewsPage } from '@/pages/NewsPage';
import { HallOfFamePage } from '@/pages/HallOfFamePage';
import { MemberProfilePage } from '@/pages/MemberProfilePage';
import { GamesPage } from '@/pages/GamesPage';
import { JoinGuildPage } from '@/pages/JoinGuildPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SettingsPage } from '@/pages/SettingsPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Gateway zone — centered shell */}
      <Route element={<Centered />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* App zone — sidebar-main shell */}
      <Route element={<SidebarMain />}>
        {/* game-catalog (primary) */}
        <Route path="/games" element={<GamesPage />} />
        <Route path="/join" element={<JoinGuildPage />} />

        {/* gaming-community (auxiliary) */}
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/news" element={<NewsPage />} />
        <Route path="/community/hall-of-fame" element={<HallOfFamePage />} />
        <Route path="/community/members/:id" element={<MemberProfilePage />} />

        {/* settings (auxiliary) */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Default redirect — authenticated users go to games, otherwise login */}
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

function DefaultRedirect() {
  const auth = useAuthProvider();
  return <Navigate to={auth.isAuthenticated ? '/games' : '/login'} replace />;
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
