import { AccountSettings } from '@/components/account-settings';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Settings</h3>

      <section className="d-section" data-density="compact">
        <AccountSettings />
      </section>
    </div>
  );
}
