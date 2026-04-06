import { useState } from 'react';
import { ScrimCalendar } from '@/components/ScrimCalendar';
import { scrims } from '@/data/mock';

export function ScrimsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filtered = scrims.filter(s => !statusFilter || s.status === statusFilter);
  const statuses = [...new Set(scrims.map(s => s.status))];

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Scrim Calendar</h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
            {scrims.length} scrims scheduled. {scrims.filter(s => s.status === 'live').length} live now.
          </p>
        </div>
        <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8rem' }}>
          + Schedule Scrim
        </button>
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className="d-interactive"
          data-variant={!statusFilter ? 'primary' : 'ghost'}
          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
          onClick={() => setStatusFilter('')}
        >
          All
        </button>
        {statuses.map(s => (
          <button
            key={s}
            className="d-interactive"
            data-variant={statusFilter === s ? 'primary' : 'ghost'}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', textTransform: 'capitalize' }}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Data table view */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)', overflow: 'auto' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Opponent</th>
              <th className="d-data-header">Game</th>
              <th className="d-data-header">Map</th>
              <th className="d-data-header">Date</th>
              <th className="d-data-header">Time</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">Score</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(scrim => (
              <tr key={scrim.id} className="d-data-row">
                <td className="d-data-cell" style={{ fontWeight: 500 }}>{scrim.opponent}</td>
                <td className="d-data-cell">{scrim.game}</td>
                <td className="d-data-cell">{scrim.map}</td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>{scrim.date}</td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>{scrim.time}</td>
                <td className="d-data-cell">
                  <span
                    className="d-annotation"
                    data-status={scrim.status === 'live' ? 'success' : scrim.status === 'cancelled' ? 'error' : scrim.status === 'completed' ? 'info' : undefined}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {scrim.status === 'live' && '● '}{scrim.status}
                  </span>
                </td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, monospace)', fontWeight: 600 }}>
                  {scrim.score ? (
                    <span style={{ color: scrim.score.us > scrim.score.them ? 'var(--d-success)' : 'var(--d-error)' }}>
                      {scrim.score.us}-{scrim.score.them}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calendar view */}
      <ScrimCalendar scrims={filtered} />
    </div>
  );
}
