import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { instruments } from '../data/mock';

const statusDot: Record<string, string> = {
  online: 'active',
  maintenance: 'pending',
  offline: 'error',
};

export function InstrumentsPage() {
  return (
    <div>
      <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontWeight: 500, fontSize: '1.25rem' }}>Instruments</h1>
      </div>

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '0.75rem' }}>
        {instruments.map((inst) => (
          <Link
            key={inst.id}
            to={`/instruments/${inst.id}`}
            className="lab-panel"
            style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: '1rem', transition: 'border-color 100ms linear' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--d-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--d-border)'; }}
          >
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{inst.name}</h3>
              <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                <span className="lab-status-dot" data-status={statusDot[inst.status]} />
                {inst.status}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '0.375rem' }}>{inst.model}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.625rem' }}>{inst.location}</p>

            {/* Schedule preview */}
            <div style={{ borderTop: '1px solid var(--d-border)', paddingTop: '0.5rem' }}>
              <span className="d-label" style={{ fontSize: '0.625rem' }}>Upcoming Bookings</span>
              {inst.bookings.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>No bookings</p>
              ) : (
                <div className={css('_flex _col _gap1')} style={{ marginTop: '0.375rem' }}>
                  {inst.bookings.slice(0, 2).map((b, i) => (
                    <div key={i} className="lab-slot" data-booked="true">
                      <div className={css('_flex _jcsb')}>
                        <span style={{ fontWeight: 500 }}>{b.slot}</span>
                        <span style={{ color: 'var(--d-text-muted)' }}>{b.date}</span>
                      </div>
                      <span style={{ color: 'var(--d-text-muted)' }}>{b.user}</span>
                    </div>
                  ))}
                  {inst.bookings.length > 2 && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>+{inst.bookings.length - 2} more</span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
