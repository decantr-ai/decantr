import { PageHeader } from '@/components/PageHeader';
import { AlertTriangle, Trash2 } from 'lucide-react';

export function SettingsDangerPage() {
  return (
    <div style={{ maxWidth: 640 }}>
      <PageHeader title="Danger Zone" description="Destructive actions cannot be undone" />

      <div className="carbon-panel" style={{ marginBottom: '0.75rem', borderColor: 'color-mix(in srgb, var(--d-warning) 40%, var(--d-border))' }}>
        <div className="carbon-panel-header" style={{ color: 'var(--d-warning)' }}>
          <AlertTriangle size={12} style={{ marginRight: 6 }} /> export data
        </div>
        <div style={{ padding: '0.875rem 1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 500, marginBottom: 2 }}>Export workspace</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>
              Download all agents, prompts, tools, and eval results as JSON.
            </div>
          </div>
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.78rem' }}>Export</button>
        </div>
      </div>

      <div className="carbon-panel" style={{ borderColor: 'color-mix(in srgb, var(--d-error) 40%, var(--d-border))' }}>
        <div className="carbon-panel-header" style={{ color: 'var(--d-error)' }}>
          <AlertTriangle size={12} style={{ marginRight: 6 }} /> delete account
        </div>
        <div style={{ padding: '0.875rem 1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 500, marginBottom: 2 }}>Permanently delete this account</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>
              All agents, prompts, tools, evals, and traces will be lost.
            </div>
          </div>
          <button className="d-interactive" data-variant="danger" style={{ fontSize: '0.78rem' }}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
