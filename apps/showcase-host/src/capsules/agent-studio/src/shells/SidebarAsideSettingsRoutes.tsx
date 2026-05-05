import { Routes, Route } from 'react-router-dom';
import { SidebarAside } from './SidebarAside';
import { SettingsProfilePage } from '@/pages/settings/SettingsProfilePage';
import { SettingsSecurityPage } from '@/pages/settings/SettingsSecurityPage';
import { SettingsPreferencesPage } from '@/pages/settings/SettingsPreferencesPage';
import { SettingsDangerPage } from '@/pages/settings/SettingsDangerPage';
import { SettingsNav } from '@/components/SettingsNav';

export function SidebarAsideSettingsRoutes() {
  return (
    <Routes>
      <Route element={<SidebarAside aside={<SettingsNav />} asideTitle="Settings" asideWidth={220} />}>
        <Route path="profile" element={<SettingsProfilePage />} />
        <Route path="security" element={<SettingsSecurityPage />} />
        <Route path="preferences" element={<SettingsPreferencesPage />} />
        <Route path="danger" element={<SettingsDangerPage />} />
      </Route>
    </Routes>
  );
}
