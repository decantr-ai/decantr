import { css } from '@decantr/css';
import { FileText, Clock, Plus } from 'lucide-react';
import { drafts } from '../data/mock';

const statusColors: Record<string, string> = {
  draft: '',
  review: 'warning',
  scheduled: 'success',
};

export function DraftsPage() {
  return (
    <div className="entrance-fade" style={{ maxWidth: '56rem' }}>
      <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem', fontFamily: "'Georgia', serif" }}>Drafts</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            {drafts.length} drafts in progress
          </p>
        </div>
        <button className="d-interactive" data-variant="primary" style={{ fontFamily: 'system-ui, sans-serif' }}>
          <Plus size={16} />
          New Draft
        </button>
      </div>

      <table className="d-data">
        <thead>
          <tr>
            <th className="d-data-header">Title</th>
            <th className="d-data-header">Status</th>
            <th className="d-data-header">Words</th>
            <th className="d-data-header">Updated</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((draft) => (
            <tr key={draft.id} className="d-data-row" style={{ cursor: 'pointer' }} onClick={() => window.location.hash = `/drafts/${draft.id}`}>
              <td className="d-data-cell">
                <div className={css('_flex _aic _gap3')}>
                  <FileText size={16} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
                  <div>
                    <p className={css('_fontsemi _textsm')} style={{ fontFamily: 'system-ui, sans-serif' }}>{draft.title}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{draft.excerpt}</p>
                  </div>
                </div>
              </td>
              <td className="d-data-cell">
                <span className="d-annotation" data-status={statusColors[draft.status] || undefined}>
                  {draft.status}
                </span>
              </td>
              <td className="d-data-cell">
                <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
                  {draft.wordCount.toLocaleString()}
                </span>
              </td>
              <td className="d-data-cell">
                <span className={css('_flex _aic _gap1 _textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
                  <Clock size={12} />
                  {draft.updatedAt}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
