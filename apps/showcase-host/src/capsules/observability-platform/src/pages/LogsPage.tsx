import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { logs } from '@/data/mock';
import { Search, Filter } from 'lucide-react';

const levels = ['all', 'error', 'warn', 'info', 'debug'] as const;

export function LogsPage() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<(typeof levels)[number]>('all');

  const filtered = logs.filter(l => {
    if (level !== 'all' && l.level !== level) return false;
    if (query && !l.message.toLowerCase().includes(query.toLowerCase()) && !l.service.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: logs.length,
    error: logs.filter(l => l.level === 'error').length,
    warn: logs.filter(l => l.level === 'warn').length,
    info: logs.filter(l => l.level === 'info').length,
    debug: logs.filter(l => l.level === 'debug').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Log Explorer</h1>
        <div className="fin-badge"><span className="fin-status-dot" data-health="healthy" /> Streaming</div>
      </div>

      {/* Filter Bar */}
      <div className="fin-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
            <input
              className="fin-input"
              style={{ paddingLeft: 28 }}
              placeholder='service:orders-api level:error "connection pool"'
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
            <Filter size={12} /> Filters
          </button>
          <button className="d-interactive" data-variant="primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Run</button>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {levels.map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className="fin-badge"
              data-level={l === 'all' ? undefined : l}
              style={{
                cursor: 'pointer',
                borderColor: level === l ? 'var(--d-primary)' : undefined,
                color: level === l ? 'var(--d-primary)' : undefined,
              }}
            >
              {l} ({counts[l]})
            </button>
          ))}
        </div>
      </div>

      {/* Log stream */}
      <div className="fin-surface" style={{ padding: '0.25rem 0' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>No logs match your filters.</div>
        ) : filtered.map(log => (
          <NavLink key={log.id} to={`/logs/${log.id}`} style={{ textDecoration: 'none' }}>
            <div className="fin-log-line" data-level={log.level}>
              <span className="fin-log-ts">{log.timestamp}</span>
              <span className="fin-log-level" data-level={log.level}>{log.level}</span>
              <span className="fin-log-msg"><span style={{ color: 'var(--d-primary)' }}>[{log.service}]</span> {log.message}</span>
            </div>
          </NavLink>
        ))}
      </div>

      <div style={{ fontSize: '0.7rem', fontFamily: 'ui-monospace, monospace', color: 'var(--d-text-muted)', textAlign: 'center' }}>
        {filtered.length} entries · last 60s
      </div>
    </div>
  );
}
