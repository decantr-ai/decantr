import { css } from '@decantr/css';
import { Plus, Key } from 'lucide-react';
import { ApiKeyRow } from '@/components/ApiKeyRow';
import { API_KEYS } from '@/data/mock';

export function ApiKeysPage() {
  return (
    <div className={css('_flex _col _gap6')}>
      {/* Header row */}
      <div className={css('_flex _aic _jcsb')}>
        <h3 className={css('_textlg _fontsemi')}>API Keys</h3>
        <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.875rem' }}>
          <Plus size={16} />
          Generate New Key
        </button>
      </div>

      {/* Table */}
      <section className="d-section" data-density="compact">
        {API_KEYS.length > 0 ? (
          <div className="d-data" role="table">
            {/* Header row */}
            <div
              className={css('_grid _aic')}
              style={{ gridTemplateColumns: '1.5fr 2fr 1.5fr 1fr 1fr 0.75fr' }}
              role="row"
            >
              <span className="d-data-header" role="columnheader">Name</span>
              <span className="d-data-header" role="columnheader">Key</span>
              <span className="d-data-header" role="columnheader">Scopes</span>
              <span className="d-data-header" role="columnheader">Created</span>
              <span className="d-data-header" role="columnheader">Last Used</span>
              <span className="d-data-header" role="columnheader">Actions</span>
            </div>

            {/* Data rows */}
            {API_KEYS.map((apiKey) => (
              <ApiKeyRow key={apiKey.id} apiKey={apiKey} />
            ))}
          </div>
        ) : (
          <div className={css('_flex _col _aic _jcc _gap3')} style={{ padding: '3rem 0' }}>
            <Key size={48} style={{ color: 'var(--d-text-muted)', opacity: 0.5 }} />
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
              No API keys yet.
            </p>
            <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.875rem' }}>
              Generate Your First Key
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
