import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { reservations } from '../../data/mock';

const statusColor = (s: string) =>
  s === 'confirmed' ? 'success' : s === 'pending' ? 'warning' : s === 'seated' ? 'info' : 'error';

export function ReservationsPage() {
  const today = reservations.filter(r => r.date === '2026-04-06');
  const tomorrow = reservations.filter(r => r.date === '2026-04-07');

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Reservations</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Manage tonight and upcoming bookings</p>
        </div>
        <Link to="/floor/reservations/new" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
          <Plus size={14} /> New Reservation
        </Link>
      </div>

      {/* Calendar preview */}
      <div className="bistro-warm-card" style={{ cursor: 'default' }}>
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
          <Calendar size={16} style={{ color: 'var(--d-primary)' }} />
          <span className={css('_fontmedium')}>Tonight — April 6</span>
          <span className="d-annotation">{today.length} bookings</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '0.375rem' }}>
          {['5:00','5:30','6:00','6:30','7:00','7:30','8:00','8:30','9:00','9:30'].map(t => {
            const hasRes = today.some(r => r.time.replace(' PM','').replace(' AM','') === t.replace(':00',':00').replace(':30',':30'));
            return (
              <div key={t} style={{
                padding: '0.375rem',
                borderRadius: 'var(--d-radius-sm)',
                background: hasRes ? 'color-mix(in srgb, var(--d-primary) 12%, transparent)' : 'var(--d-surface-raised)',
                border: `1px solid ${hasRes ? 'var(--d-primary)' : 'var(--d-border)'}`,
                textAlign: 'center',
                fontSize: '0.6875rem',
                fontWeight: hasRes ? 600 : 400,
                color: hasRes ? 'var(--d-primary)' : 'var(--d-text-muted)',
              }}>{t}</div>
            );
          })}
        </div>
      </div>

      {/* Reservation list — today */}
      <div>
        <span className="d-label" style={{ marginBottom: '0.5rem', display: 'block', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>Tonight</span>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Time</th>
              <th className="d-data-header">Guest</th>
              <th className="d-data-header">Party</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">Notes</th>
            </tr>
          </thead>
          <tbody>
            {today.map(r => (
              <tr key={r.id} className="d-data-row">
                <td className="d-data-cell" style={{ fontWeight: 500 }}>{r.time}</td>
                <td className="d-data-cell">{r.guestName}</td>
                <td className="d-data-cell">{r.partySize}</td>
                <td className="d-data-cell">
                  <span className="d-annotation" data-status={statusColor(r.status)}>{r.status}</span>
                </td>
                <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>{r.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tomorrow */}
      <div>
        <span className="d-label" style={{ marginBottom: '0.5rem', display: 'block', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>Tomorrow</span>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Time</th>
              <th className="d-data-header">Guest</th>
              <th className="d-data-header">Party</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">Notes</th>
            </tr>
          </thead>
          <tbody>
            {tomorrow.map(r => (
              <tr key={r.id} className="d-data-row">
                <td className="d-data-cell" style={{ fontWeight: 500 }}>{r.time}</td>
                <td className="d-data-cell">{r.guestName}</td>
                <td className="d-data-cell">{r.partySize}</td>
                <td className="d-data-cell">
                  <span className="d-annotation" data-status={statusColor(r.status)}>{r.status}</span>
                </td>
                <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>{r.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
