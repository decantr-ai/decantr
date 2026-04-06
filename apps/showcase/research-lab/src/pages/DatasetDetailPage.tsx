import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { datasets } from '../data/mock';

export function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ds = datasets.find((d) => d.id === id) || datasets[0];

  return (
    <div style={{ maxWidth: '52rem', margin: '0 auto' }}>
      <Link to="/datasets" className={css('_flex _aic _gap1')} style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> Back to Datasets
      </Link>

      {/* Header */}
      <div className="lab-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
          <h1 style={{ fontWeight: 500, fontSize: '1.25rem' }}>{ds.name}</h1>
          <button className="d-interactive" data-variant="primary" style={{ borderRadius: 2, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            <Download size={14} /> Export
          </button>
        </div>
        <div className={css('_flex _aic _gap3')} style={{ flexWrap: 'wrap' }}>
          <span className="lab-chip">{ds.format}</span>
          <span className="lab-chip">{ds.size}</span>
          <span className="lab-quality" data-level={ds.quality}>{ds.quality} quality</span>
          <span className="lab-reading" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{ds.records.toLocaleString()} records</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>Experiment: {ds.experiment}</span>
        </div>
      </div>

      {/* Schema tree */}
      <div className="lab-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Schema</h2>
        <div className={css('_flex _col')}>
          {ds.columns.map((col, i) => (
            <div
              key={col.name}
              className={css('_flex _aic _jcsb')}
              style={{
                padding: '0.5rem 0.75rem',
                borderBottom: i < ds.columns.length - 1 ? '1px solid var(--d-border)' : undefined,
              }}
            >
              <div className={css('_flex _aic _gap3')}>
                <span className="lab-reading" style={{ fontWeight: 500, fontSize: '0.8125rem', minWidth: 160 }}>{col.name}</span>
                <span className="lab-chip" data-color="cyan">{col.type}</span>
              </div>
              <div className={css('_flex _aic _gap2')}>
                {col.nullable && <span className="d-annotation" data-status="warning">nullable</span>}
                {!col.nullable && <span className="d-annotation" data-status="success">required</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data preview (simulated) */}
      <div className="lab-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <h2 style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Data Preview</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="d-data">
            <thead>
              <tr>
                {ds.columns.map((col) => (
                  <th key={col.name} className="d-data-header">{col.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((row) => (
                <tr key={row} className="d-data-row">
                  {ds.columns.map((col) => (
                    <td key={col.name} className="d-data-cell">
                      <span className="lab-reading" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                        {col.type === 'string' ? `sample_${row + 1}` :
                         col.type === 'float64' ? (Math.random() * 100).toFixed(3) :
                         col.type === 'int32' ? String(row + 1) :
                         col.type === 'boolean' ? (row % 2 === 0 ? 'true' : 'false') :
                         col.type === 'datetime' ? `2026-04-0${row + 1}` :
                         '—'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
