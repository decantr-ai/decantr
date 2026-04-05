import { AlertTriangle, Download, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SettingsNav } from '@/components/SettingsNav';

export function SettingsDangerPage() {
  return (
    <div style={{ maxWidth: 800 }}>
      <PageHeader title="Settings" description="Manage your profile, security, and preferences." />
      <div style={{ marginTop: '1.5rem' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            padding: '1.25rem',
            border: '1px solid color-mix(in srgb, var(--d-warning) 30%, transparent)',
            background: 'color-mix(in srgb, var(--d-warning) 6%, transparent)',
            borderRadius: 'var(--d-radius-lg)',
            display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
          }}>
            <AlertTriangle size={22} style={{ color: 'var(--d-warning)', flexShrink: 0, marginTop: 2 }} aria-hidden />
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Take care in this area
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>
                Actions here affect your account and data permanently. If anything feels unclear, please contact our support team — we are happy to help.
              </div>
            </div>
          </div>

          <section className="hw-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>Export Your Data</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1rem', lineHeight: 1.55 }}>
              Download all your health records, vitals history, and appointment data in a portable format.
            </p>
            <button className="d-interactive" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <Download size={16} /> Request Export
            </button>
          </section>

          <section className="hw-card" style={{ padding: '1.5rem', borderColor: 'color-mix(in srgb, var(--d-error) 30%, transparent)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--d-error)' }}>Delete Account</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1rem', lineHeight: 1.55 }}>
              Permanently delete your account and all associated records. This action cannot be undone. Records may be retained in de-identified form as required by law.
            </p>
            <button className="d-interactive" data-variant="danger" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <Trash2 size={16} /> Delete My Account
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
