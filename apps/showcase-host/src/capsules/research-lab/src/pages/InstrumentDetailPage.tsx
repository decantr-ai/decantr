import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { instruments } from '../data/mock';

const statusDot: Record<string, string> = {
  online: 'active',
  maintenance: 'pending',
  offline: 'error',
};

const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function InstrumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const inst = instruments.find((i) => i.id === id) || instruments[0];

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
      <Link to="/instruments" className={css('_flex _aic _gap1')} style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> Back to Instruments
      </Link>

      {/* Header */}
      <div className="lab-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
          <h1 style={{ fontWeight: 500, fontSize: '1.25rem' }}>{inst.name}</h1>
          <span className={css('_flex _aic _gap2')}>
            <span className="lab-status-dot" data-status={statusDot[inst.status]} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{inst.status}</span>
          </span>
        </div>
        <div className={css('_flex _aic _gap4')}>
          <span style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{inst.model}</span>
          <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
            <MapPin size={13} /> {inst.location}
          </span>
        </div>
      </div>

      {/* Schedule grid */}
      <div className="lab-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Weekly Schedule</h2>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 1, minWidth: 500 }}>
            {/* Header row */}
            <div />
            {days.map((d) => (
              <div key={d} style={{ textAlign: 'center', padding: '0.375rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--d-text-muted)' }}>{d}</div>
            ))}
            {/* Time slots */}
            {hours.map((h) => (
              <>
                <div key={h} style={{ padding: '0.375rem 0.5rem', fontSize: '0.6875rem', color: 'var(--d-text-muted)', textAlign: 'right' }} className="lab-reading">
                  {h}
                </div>
                {days.map((d) => {
                  const isBooked = inst.bookings.some((b) => {
                    const slotStart = b.slot.split('–')[0];
                    return slotStart === h;
                  });
                  return (
                    <div
                      key={`${d}-${h}`}
                      className="lab-slot"
                      data-booked={isBooked ? 'true' : undefined}
                      style={{ minHeight: 28, cursor: 'pointer' }}
                    >
                      {isBooked && (
                        <span style={{ fontSize: '0.625rem' }}>Booked</span>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings table */}
      <div className="lab-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <h2 style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Bookings</h2>
        </div>
        {inst.bookings.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
            No upcoming bookings
          </div>
        ) : (
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">User</th>
                <th className="d-data-header">Date</th>
                <th className="d-data-header">Time Slot</th>
                <th className="d-data-header">Duration</th>
              </tr>
            </thead>
            <tbody>
              {inst.bookings.map((b, i) => (
                <tr key={i} className="d-data-row">
                  <td className="d-data-cell" style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{b.user}</td>
                  <td className="d-data-cell"><span className="lab-reading" style={{ fontSize: '0.8125rem' }}>{b.date}</span></td>
                  <td className="d-data-cell"><span className="lab-reading" style={{ fontSize: '0.8125rem' }}>{b.slot}</span></td>
                  <td className="d-data-cell" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{b.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
