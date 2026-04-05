import { AlertTriangle, Download } from 'lucide-react';
import { SettingsLayout } from '@/components/SettingsLayout';

export function DangerSettingsPage() {
  return (
    <SettingsLayout title="Danger zone" description="Actions that affect your account permanently.">
      <section className="ec-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--d-border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Export your data</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
            Download a copy of your orders, addresses, and account info.
          </p>
        </div>
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="d-interactive" style={{ background: 'var(--d-surface)' }}>
            <Download size={14} /> Request export
          </button>
        </div>
      </section>

      <section
        className="ec-card"
        style={{
          padding: 0,
          borderColor: 'color-mix(in srgb, var(--d-error) 30%, var(--d-border))',
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--d-border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={18} style={{ color: 'var(--d-error)', marginTop: '0.125rem', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--d-error)' }}>Delete account</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
              Permanently delete your Vinea account, order history, and saved addresses. This cannot be undone.
            </p>
          </div>
        </div>
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="d-interactive"
            data-variant="danger"
            style={{ background: 'var(--d-error)', color: '#fff', borderColor: 'var(--d-error)' }}
          >
            Delete my account
          </button>
        </div>
      </section>
    </SettingsLayout>
  );
}
