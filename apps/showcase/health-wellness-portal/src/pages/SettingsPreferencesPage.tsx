import { PageHeader } from '@/components/PageHeader';
import { SettingsNav } from '@/components/SettingsNav';
import { SectionLabel } from '@/components/SectionLabel';

export function SettingsPreferencesPage() {
  return (
    <div style={{ maxWidth: 800 }}>
      <PageHeader title="Settings" description="Manage your profile, security, and preferences." />
      <div style={{ marginTop: '1.5rem' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="hw-card" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Appearance</SectionLabel>
            <ToggleRow title="Theme" description="Evergreen uses light mode for daytime readability." value="Light (default)" />
            <ToggleRow title="Reduce motion" description="Gentler animations throughout the portal." toggle defaultOn />
            <ToggleRow title="Larger text" description="Increase base text size by 12%." toggle />
          </section>

          <section className="hw-card" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Notifications</SectionLabel>
            <ToggleRow title="Appointment reminders" description="Email and text 24 hours before your visit." toggle defaultOn />
            <ToggleRow title="Refill alerts" description="Notify me two weeks before I need a refill." toggle defaultOn />
            <ToggleRow title="Lab results available" description="Let me know when new results post." toggle defaultOn />
            <ToggleRow title="Wellness tips" description="Monthly newsletter with care tips." toggle />
          </section>

          <section className="hw-card" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Language &amp; Region</SectionLabel>
            <ToggleRow title="Language" description="The language for portal content." value="English (US)" />
            <ToggleRow title="Time zone" description="Used for appointment times and reminders." value="Pacific Time (US & Canada)" />
          </section>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  title, description, toggle, defaultOn, value,
}: {
  title: string; description: string; toggle?: boolean; defaultOn?: boolean; value?: string;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: '1rem', padding: '0.875rem 0', borderBottom: '1px solid var(--d-border)',
    }}>
      <div>
        <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>{description}</div>
      </div>
      {toggle ? (
        <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, flexShrink: 0 }}>
          <input type="checkbox" defaultChecked={defaultOn} style={{ opacity: 0, width: 0, height: 0 }} aria-label={title} />
          <span style={{
            position: 'absolute', inset: 0,
            background: defaultOn ? 'var(--d-primary)' : 'var(--d-border)',
            borderRadius: 12, cursor: 'pointer',
            transition: 'background 150ms ease',
          }}>
            <span style={{
              position: 'absolute', top: 2, left: defaultOn ? 22 : 2,
              width: 20, height: 20, background: '#fff', borderRadius: '50%',
              transition: 'left 150ms ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </span>
        </label>
      ) : (
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--d-text-muted)' }}>{value}</span>
      )}
    </div>
  );
}
