import { css } from '@decantr/css';
import { AlertTriangle, Download } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';

export function SettingsDangerPage() {
  return (
    <div>
      <PageHeader title="Account" subtitle="Export your data or delete your account." />
      <div className={css('_flex _col _gap3')} style={{ maxWidth: 640 }}>
        <div className="studio-card" style={{ padding: '1.5rem' }}>
          <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
            <Download size={16} style={{ color: 'var(--d-primary)' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>Export your data</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif', marginBottom: '0.875rem' }}>
            Download all your posts, subscribers, and earnings history as JSON.
          </p>
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem' }}>Request export</button>
        </div>

        <div className="studio-card" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
            <AlertTriangle size={16} style={{ color: 'var(--d-error)' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-error)', fontFamily: 'system-ui, sans-serif' }}>Delete account</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif', marginBottom: '0.875rem', lineHeight: 1.55 }}>
            This permanently deletes your account, content, subscribers, and revenue history. Your subscribers will be refunded pro-rata. This cannot be undone.
          </p>
          <button className="d-interactive" data-variant="danger" style={{ fontSize: '0.8125rem', color: 'var(--d-error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            Delete my account
          </button>
        </div>
      </div>
    </div>
  );
}
