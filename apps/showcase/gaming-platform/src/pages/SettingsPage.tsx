import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [email, setEmail] = useState('warrior@guild.gg');
  const [notifications, setNotifications] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [showOnline, setShowOnline] = useState(true);

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)', maxWidth: '40rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Settings</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Configure your guild profile and preferences.</p>
      </div>

      <form role="form" onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
        {/* Profile Section */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Profile
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginTop: '-0.75rem' }}>Your public gaming identity.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Display Name</label>
              <input className="d-control" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Email</label>
              <input className="d-control" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Bio</label>
              <textarea className="d-control" placeholder="Tell the guild about yourself..." style={{ minHeight: '6rem', resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Notifications</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginTop: '-0.75rem' }}>Control what alerts you receive.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ToggleRow label="Push Notifications" description="Receive browser push notifications." checked={notifications} onChange={setNotifications} />
            <ToggleRow label="Match Alerts" description="Get notified when a match starts." checked={matchAlerts} onChange={setMatchAlerts} />
          </div>
        </div>

        {/* Privacy Section */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Privacy</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginTop: '-0.75rem' }}>Control your visibility.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ToggleRow label="Show Online Status" description="Let other players see when you're online." checked={showOnline} onChange={setShowOnline} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="d-interactive" data-variant="ghost" type="button">Cancel</button>
          <button className="d-interactive" data-variant="primary" type="submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 'var(--d-radius-full)',
          background: checked ? 'var(--d-primary)' : 'var(--d-border)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 150ms ease',
          flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute',
          top: 2,
          left: checked ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 150ms ease',
        }} />
      </button>
    </div>
  );
}
