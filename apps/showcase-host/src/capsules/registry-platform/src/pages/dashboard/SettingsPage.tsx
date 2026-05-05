import AccountSettings from '../../components/AccountSettings';

export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="d-label" data-anchor="">
        Settings
      </div>

      <AccountSettings />
    </div>
  );
}
