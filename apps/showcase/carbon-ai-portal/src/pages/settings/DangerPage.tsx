import { SettingsSection } from '@/components/SettingsSection';
import { Download, LogOut, Trash2 } from 'lucide-react';

export function DangerPage() {
  return (
    <>
      <SettingsSection title="Export data" description="Download all your conversations and account data.">
        <button className="d-interactive" style={{ fontSize: '0.875rem' }}>
          <Download size={14} /> Request export
        </button>
      </SettingsSection>

      <SettingsSection title="Sign out everywhere" description="Sign out of Carbon on all devices except this one.">
        <button className="d-interactive" style={{ fontSize: '0.875rem' }}>
          <LogOut size={14} /> Sign out all other sessions
        </button>
      </SettingsSection>

      <section
        style={{
          padding: '1.25rem 1.5rem',
          background: 'color-mix(in srgb, var(--d-error) 6%, var(--d-surface))',
          border: '1px solid color-mix(in srgb, var(--d-error) 40%, var(--d-border))',
          borderRadius: 'var(--d-radius)',
        }}
      >
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-error)', marginBottom: '0.375rem' }}>
          Delete account
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
          Permanently delete your account and all associated conversations. This cannot be undone.
        </p>
        <button className="d-interactive" data-variant="danger" style={{ fontSize: '0.875rem' }}>
          <Trash2 size={14} /> Delete account
        </button>
      </section>
    </>
  );
}
