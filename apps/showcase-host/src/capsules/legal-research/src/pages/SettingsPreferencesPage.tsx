import { preferenceFields } from '../data/mock';
import { AccountSettings } from '../components/AccountSettings';

export function SettingsPreferencesPage() {
  return <AccountSettings title="Preferences" description="Configure citation format, jurisdiction defaults, and notification settings." fields={preferenceFields} />;
}
