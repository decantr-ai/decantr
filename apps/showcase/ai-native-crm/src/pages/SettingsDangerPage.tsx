import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';
import { AlertOctagon } from 'lucide-react';

export function SettingsDangerPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Settings" description="Manage your account and workspace" />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'rgba(248, 113, 113, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <AlertOctagon size={14} style={{ color: 'var(--d-error)' }} />
              <SectionLabel>Danger zone</SectionLabel>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ padding: '1rem', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: 'var(--d-radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Export all data</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>Download all CRM data as JSON archive.</div>
                  </div>
                  <button className="d-interactive" style={{ fontSize: '0.78rem', flexShrink: 0 }}>Export</button>
                </div>
              </div>

              <div style={{ padding: '1rem', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: 'var(--d-radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Reset AI training</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>Clear personalized AI models. Baseline models remain.</div>
                  </div>
                  <button className="d-interactive" style={{ fontSize: '0.78rem', flexShrink: 0 }}>Reset</button>
                </div>
              </div>

              <div style={{ padding: '1rem', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: 'var(--d-radius-sm)', background: 'rgba(248, 113, 113, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--d-error)' }}>Delete account</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>Permanently delete your account and all data. This cannot be undone.</div>
                  </div>
                  <button className="d-interactive" data-variant="danger" style={{ fontSize: '0.78rem', flexShrink: 0 }}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
