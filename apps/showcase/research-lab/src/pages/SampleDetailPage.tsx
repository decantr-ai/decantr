import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { samples } from '../data/mock';

const statusMap: Record<string, { label: string; dot: string }> = {
  available: { label: 'Available', dot: 'active' },
  'in-use': { label: 'In Use', dot: 'pending' },
  expired: { label: 'Expired', dot: 'error' },
  quarantined: { label: 'Quarantined', dot: 'error' },
};

export function SampleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sample = samples.find((s) => s.id === id) || samples[0];
  const st = statusMap[sample.status];

  const daysUntilExpiry = Math.max(0, Math.round((new Date(sample.expiresAt).getTime() - Date.now()) / 86400000));

  return (
    <div style={{ maxWidth: '52rem', margin: '0 auto' }}>
      <Link to="/samples" className={css('_flex _aic _gap1')} style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> Back to Samples
      </Link>

      {/* Header */}
      <div className="lab-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
          <h1 style={{ fontWeight: 500, fontSize: '1.25rem' }}>{sample.name}</h1>
          <span className={css('_flex _aic _gap2')}>
            <span className="lab-status-dot" data-status={st.dot} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{st.label}</span>
          </span>
        </div>

        <div className="lab-barcode" style={{ marginBottom: '1rem', fontSize: '1rem', letterSpacing: '0.2em' }}>
          {sample.barcode}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <span className="d-label">Type</span>
            <p style={{ fontSize: '0.875rem', marginTop: '0.125rem' }}>{sample.type}</p>
          </div>
          <div>
            <span className="d-label">Location</span>
            <p className={css('_flex _aic _gap1')} style={{ fontSize: '0.875rem', marginTop: '0.125rem' }}>
              <MapPin size={13} style={{ color: 'var(--d-text-muted)' }} /> {sample.location}
            </p>
          </div>
          <div>
            <span className="d-label">Expires</span>
            <p className="lab-reading" style={{ fontSize: '0.875rem', marginTop: '0.125rem' }}>
              {sample.expiresAt}
              {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                <span className={css('_flex _aic _gap1')} style={{ display: 'inline-flex', marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--d-warning)' }}>
                  <AlertTriangle size={11} /> {daysUntilExpiry}d
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Chain of Custody */}
      <div className="lab-panel" style={{ padding: '1rem' }}>
        <h2 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Chain of Custody</h2>
        <div className={css('_flex _col')}>
          {sample.custodyChain.map((entry, i) => (
            <div
              key={i}
              className="lab-protocol"
              data-step={i + 1}
              style={{ marginBottom: i < sample.custodyChain.length - 1 ? '0.75rem' : 0 }}
            >
              <div className={css('_flex _aic _jcsb')}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{entry.action}</span>
                <span className="lab-reading" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{entry.when}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{entry.who}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
