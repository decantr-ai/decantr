import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { SettingsNav } from '@/components/SettingsNav';

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 0' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        style={{
          width: 40,
          height: 22,
          borderRadius: 'var(--d-radius-full)',
          background: value ? 'var(--d-accent)' : 'var(--d-surface-raised)',
          border: '1px solid var(--d-border)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 250ms ease',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: 2,
          left: value ? 20 : 2,
          transition: 'left 250ms ease',
        }} />
      </button>
    </div>
  );
}

export function SettingsPreferencesPage() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [language, setLanguage] = useState('en');
  const [emailProduct, setEmailProduct] = useState(true);
  const [emailBilling, setEmailBilling] = useState(true);
  const [emailSecurity, setEmailSecurity] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [slackAlerts, setSlackAlerts] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '42rem' }}>
      <PageHeader title="Settings" description="Manage your profile, security, and workspace." />
      <SettingsNav />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Appearance */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Appearance</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Theme</label>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {(['dark', 'light', 'system'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className="d-interactive"
                    data-variant={theme === t ? 'primary' : 'ghost'}
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', textTransform: 'capitalize', flex: 1, justifyContent: 'center' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Language</label>
              <select className="d-control" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Notifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ToggleRow label="Product updates" description="New features, changelog highlights, and roadmap updates" value={emailProduct} onChange={setEmailProduct} />
            <ToggleRow label="Billing notifications" description="Invoices, failed payments, and plan changes" value={emailBilling} onChange={setEmailBilling} />
            <ToggleRow label="Security alerts" description="New logins, password changes, and suspicious activity" value={emailSecurity} onChange={setEmailSecurity} />
            <ToggleRow label="Marketing email" description="Tips, tutorials, and occasional promotions" value={emailMarketing} onChange={setEmailMarketing} />
            <ToggleRow label="Slack alerts" description="Send alerts to your connected Slack workspace" value={slackAlerts} onChange={setSlackAlerts} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="sd-button-accent" type="button" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Save preferences</button>
        </div>
      </div>
    </div>
  );
}
