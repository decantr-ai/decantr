import { PageHeader } from '@/components/PageHeader';

export function SettingsPreferencesPage() {
  return (
    <div style={{ maxWidth: 640 }}>
      <PageHeader title="Preferences" description="Theme, language, and notifications" />
      <div className="carbon-panel" style={{ marginBottom: '0.75rem' }}>
        <div className="carbon-panel-header">appearance</div>
        <div style={{ padding: '1rem 1.125rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>Theme</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>Carbon-neon (dark)</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.72rem' }}>Light</button>
              <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.72rem', background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a' }}>Dark</button>
              <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.72rem' }}>System</button>
            </div>
          </div>
          <Setting label="Editor font size" value="14px" />
          <Setting label="Line height" value="1.6" />
          <Setting label="Tab size" value="2" />
        </div>
      </div>

      <div className="carbon-panel" style={{ marginBottom: '0.75rem' }}>
        <div className="carbon-panel-header">language</div>
        <div style={{ padding: '1rem 1.125rem' }}>
          <select defaultValue="en-US" className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.8rem' }}>
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>

      <div className="carbon-panel">
        <div className="carbon-panel-header">notifications</div>
        <div style={{ padding: '1rem 1.125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Toggle label="Email on eval regression" defaultChecked />
          <Toggle label="Email on agent error spike" defaultChecked />
          <Toggle label="Slack on deploy" defaultChecked />
          <Toggle label="Weekly usage digest" />
        </div>
      </div>
    </div>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontSize: '0.82rem' }}>{label}</div>
      <span className="mono-inline" style={{ fontSize: '0.72rem' }}>{value}</span>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', padding: '0.25rem 0' }}>
      <input type="checkbox" defaultChecked={defaultChecked} style={{ accentColor: 'var(--d-accent)' }} />
      <span>{label}</span>
    </label>
  );
}
