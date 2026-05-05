import { profileFields } from '../data/mock';
import { AccountSettings } from '../components/AccountSettings';

export function SettingsProfilePage() {
  return <AccountSettings title="Profile" description="Manage your personal information and bar credentials." fields={profileFields} />;
}
