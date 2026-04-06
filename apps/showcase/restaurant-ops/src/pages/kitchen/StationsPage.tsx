import { useState } from 'react';
import { css } from '@decantr/css';
import { Flame } from 'lucide-react';
import { tickets, stations, formatTime } from '../../data/mock';

export function StationsPage() {
  const [activeStation, setActiveStation] = useState('All');

  const filtered = activeStation === 'All' ? tickets : tickets.filter(t => t.station === activeStation);

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Station View</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Tickets by kitchen station</p>
      </div>

      {/* Station tabs */}
      <div className={css('_flex _aic _gap2')} style={{ flexWrap: 'wrap' }}>
        {stations.map(s => {
          const count = s === 'All' ? tickets.length : tickets.filter(t => t.station === s).length;
          return (
            <button key={s}
              className="d-interactive"
              data-variant={activeStation === s ? 'primary' : 'ghost'}
              onClick={() => setActiveStation(s)}
              style={{ fontSize: '0.8125rem', padding: '0.3rem 0.75rem' }}>
              {s} <span style={{ opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Station tickets grouped */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
        {filtered.map(ticket => (
          <div key={ticket.id} className="kds-ticket" data-priority={ticket.priority}>
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
              <span className={css('_fontmedium')} style={{ fontSize: '0.8125rem' }}>T{ticket.tableNumber}</span>
              <div className={css('_flex _aic _gap2')}>
                {ticket.priority === 'fire' && <Flame size={12} style={{ color: 'var(--d-error)' }} />}
                <span style={{
                  fontSize: '0.75rem', fontFamily: 'var(--d-font-mono, monospace)', fontWeight: 600,
                  color: ticket.elapsed > 600 ? 'var(--d-error)' : ticket.elapsed > 300 ? 'var(--d-warning)' : 'var(--d-success)',
                }}>{formatTime(ticket.elapsed)}</span>
              </div>
            </div>
            {ticket.items.map((item, i) => (
              <div key={i} style={{ fontSize: '0.8125rem', padding: '0.125rem 0' }}>
                <span className={css('_fontmedium')}>{item.qty}x</span> {item.name}
                {item.mods && <div style={{ fontSize: '0.6875rem', color: 'var(--d-warning)', fontStyle: 'italic' }}>{item.mods}</div>}
              </div>
            ))}
            <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
              {ticket.server} &middot; {ticket.station} &middot; {ticket.status}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bistro-feature-tile" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--d-text-muted)' }}>No tickets at this station.</p>
        </div>
      )}
    </div>
  );
}
