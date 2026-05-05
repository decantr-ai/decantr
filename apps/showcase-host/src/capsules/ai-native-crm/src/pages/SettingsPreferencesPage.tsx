import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';

export function SettingsPreferencesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Settings" description="Manage your account and workspace" />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Appearance</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Theme', options: ['Dark', 'Light', 'System'], default: 'Dark' },
                { label: 'Density', options: ['Compact', 'Comfortable', 'Spacious'], default: 'Comfortable' },
                { label: 'Language', options: ['English', 'Español', 'Français', 'Deutsch'], default: 'English' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.label}</label>
                  <select className="glass-control" defaultValue={s.default} style={{ width: 220 }}>
                    {s.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Notifications</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'New deal assigned', checked: true },
                { label: 'AI recap ready', checked: true },
                { label: 'Meeting reminders (15 min before)', checked: true },
                { label: 'Weekly pipeline digest', checked: false },
                { label: 'Mentions in comments', checked: true },
              ].map(n => (
                <label key={n.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.85rem' }}>{n.label}</span>
                  <input type="checkbox" defaultChecked={n.checked} style={{ accentColor: 'var(--d-accent)' }} />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
