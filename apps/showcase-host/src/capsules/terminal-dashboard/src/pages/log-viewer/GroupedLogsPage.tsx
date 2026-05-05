import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TerminalShell } from '@/components/TerminalShell';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogEntry {
  id: number;
  timestamp: Date;
  level: LogLevel;
  message: string;
}

interface LogGroup {
  pattern: string;
  level: LogLevel;
  count: number;
  entries: LogEntry[];
  lastSeen: Date;
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  INFO: 'var(--d-primary)',
  WARN: 'var(--d-warning)',
  ERROR: 'var(--d-error)',
  DEBUG: 'var(--d-text-muted)',
};

const LOG_PATTERNS: Array<{ pattern: string; level: LogLevel; messages: string[] }> = [
  {
    pattern: 'GET /api/health',
    level: 'INFO',
    messages: [
      'GET /api/health 200 OK 1ms',
      'GET /api/health 200 OK 2ms',
      'GET /api/health 200 OK 1ms',
      'GET /api/health 200 OK 3ms',
    ],
  },
  {
    pattern: 'GET /api/v1/users',
    level: 'INFO',
    messages: [
      'GET /api/v1/users 200 OK 14ms',
      'GET /api/v1/users?page=2 200 OK 18ms',
      'GET /api/v1/users?active=true 200 OK 11ms',
    ],
  },
  {
    pattern: 'DB Query: SELECT users',
    level: 'INFO',
    messages: [
      'DB Query: SELECT * FROM users WHERE active=true (23 rows, 4ms)',
      'DB Query: SELECT id,name FROM users LIMIT 50 (50 rows, 3ms)',
      'DB Query: SELECT count(*) FROM users (1 row, 1ms)',
    ],
  },
  {
    pattern: 'DB Query: SELECT events',
    level: 'INFO',
    messages: [
      'DB Query: SELECT count(*) FROM events WHERE ts > now()-1h (1 row, 2ms)',
      'DB Query: SELECT * FROM events ORDER BY ts DESC LIMIT 100 (100 rows, 8ms)',
    ],
  },
  {
    pattern: 'Cache HIT',
    level: 'INFO',
    messages: [
      'Cache HIT key="session:usr_29x8k" ttl=1800s',
      'Cache HIT key="config:global" ttl=3600s',
      'Cache HIT key="metrics:cpu:5m" ttl=300s',
      'Cache HIT key="session:usr_f83j" ttl=1800s',
    ],
  },
  {
    pattern: 'Cache MISS',
    level: 'INFO',
    messages: [
      'Cache MISS key="metrics:hist:24h" — fetching from source',
      'Cache MISS key="user:profile:usr_k29x" — fetching from source',
    ],
  },
  {
    pattern: 'POST /api/v1/auth/refresh',
    level: 'INFO',
    messages: [
      'POST /api/v1/auth/refresh 200 OK 8ms',
      'POST /api/v1/auth/refresh 200 OK 6ms',
      'POST /api/v1/auth/refresh 200 OK 12ms',
    ],
  },
  {
    pattern: 'WebSocket connection',
    level: 'INFO',
    messages: [
      'WebSocket connection established client=ws://10.0.1.42:8080',
      'WebSocket connection established client=ws://10.0.1.43:8080',
      'WebSocket ping/pong client=ws://10.0.1.42:8080 latency=2ms',
    ],
  },
  {
    pattern: 'Slow query',
    level: 'WARN',
    messages: [
      'Slow query: SELECT * FROM events JOIN metrics ON... (892ms)',
      'Slow query: SELECT * FROM logs WHERE message LIKE... (1204ms)',
      'Slow query: UPDATE sessions SET last_active=now()... (743ms)',
    ],
  },
  {
    pattern: 'Memory usage threshold',
    level: 'WARN',
    messages: [
      'Memory usage at 78% — threshold=80% consider scaling',
      'Memory usage at 81% — threshold exceeded, alert triggered',
      'Memory usage at 76% — returned below threshold',
    ],
  },
  {
    pattern: 'Rate limit approaching',
    level: 'WARN',
    messages: [
      'Rate limit approaching: api:auth 89/100 requests in window',
      'Rate limit approaching: api:search 145/150 requests in window',
    ],
  },
  {
    pattern: 'Connection pool limit',
    level: 'WARN',
    messages: [
      'Connection pool: 47/50 connections in use — approaching limit',
      'Connection pool: 49/50 connections in use — critical',
      'Connection pool: 42/50 connections in use — recovering',
    ],
  },
  {
    pattern: 'Connection refused: postgres',
    level: 'ERROR',
    messages: [
      'Connection refused: postgres://db-primary:5432 — retrying in 5s',
      'Connection refused: postgres://db-primary:5432 — retrying in 10s',
      'Connection refused: postgres://db-primary:5432 — failover to replica',
    ],
  },
  {
    pattern: 'Auth token validation failed',
    level: 'ERROR',
    messages: [
      'Auth token validation failed: jwt expired sub=usr_83kq2',
      'Auth token validation failed: invalid signature sub=usr_unknown',
    ],
  },
  {
    pattern: 'POST /api/v1/webhooks 502',
    level: 'ERROR',
    messages: [
      'POST /api/v1/webhooks 502 Bad Gateway upstream=hooks.internal:3001',
      'POST /api/v1/webhooks 502 Bad Gateway upstream=hooks.internal:3001 retry=1',
    ],
  },
  {
    pattern: 'Request middleware chain',
    level: 'DEBUG',
    messages: [
      'Middleware chain: cors -> auth -> ratelimit -> handler (3.2ms total)',
      'Middleware chain: cors -> auth -> ratelimit -> handler (2.8ms total)',
      'Middleware chain: cors -> auth -> ratelimit -> handler (4.1ms total)',
    ],
  },
  {
    pattern: 'GC pause',
    level: 'DEBUG',
    messages: [
      'GC pause: 1.2ms collected=14MB heap_after=110MB',
      'GC pause: 0.8ms collected=8MB heap_after=106MB',
      'GC pause: 2.1ms collected=22MB heap_after=98MB',
    ],
  },
  {
    pattern: 'TCP keepalive',
    level: 'DEBUG',
    messages: [
      'TCP keepalive sent to 10.0.1.15:5432 seq=142',
      'TCP keepalive sent to 10.0.1.15:5432 seq=143',
      'TCP keepalive sent to 10.0.1.16:6379 seq=87',
    ],
  },
];

function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

function buildInitialGroups(): LogGroup[] {
  const now = Date.now();
  return LOG_PATTERNS.map((p, idx) => {
    const baseCount = Math.floor(Math.random() * 40) + 5;
    const entries: LogEntry[] = [];
    for (let i = 0; i < Math.min(baseCount, p.messages.length * 3); i++) {
      entries.push({
        id: idx * 1000 + i,
        timestamp: new Date(now - (baseCount - i) * 2000),
        level: p.level,
        message: p.messages[i % p.messages.length],
      });
    }
    return {
      pattern: p.pattern,
      level: p.level,
      count: baseCount,
      entries,
      lastSeen: new Date(now - Math.floor(Math.random() * 30000)),
    };
  });
}

export function GroupedLogsPage() {
  const [groups, setGroups] = useState<LogGroup[]>(() => buildInitialGroups());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);
  const [search, setSearch] = useState('');
  const [activeLevels, setActiveLevels] = useState<Set<LogLevel>>(
    new Set(['INFO', 'WARN', 'ERROR', 'DEBUG']),
  );
  const nextId = useRef(50000);

  const toggleLevel = useCallback((level: LogLevel) => {
    setActiveLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  }, []);

  const toggleGroup = useCallback((pattern: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(pattern)) {
        next.delete(pattern);
      } else {
        next.add(pattern);
      }
      return next;
    });
  }, []);

  // Stream new entries into random groups
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const patternIdx = Math.floor(Math.random() * LOG_PATTERNS.length);
      const p = LOG_PATTERNS[patternIdx];
      const msg = p.messages[Math.floor(Math.random() * p.messages.length)];

      setGroups((prev) =>
        prev.map((g, i) => {
          if (i !== patternIdx) return g;
          const entry: LogEntry = {
            id: nextId.current++,
            timestamp: new Date(),
            level: p.level,
            message: msg,
          };
          return {
            ...g,
            count: g.count + 1,
            lastSeen: new Date(),
            entries: [...g.entries.slice(-49), entry],
          };
        }),
      );
    }, 800);
    return () => clearInterval(interval);
  }, [paused]);

  const filteredGroups = groups
    .filter((g) => activeLevels.has(g.level))
    .filter((g) => !search || g.pattern.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());

  const totalEntries = groups.reduce((sum, g) => sum + g.count, 0);
  const errorGroups = groups.filter((g) => g.level === 'ERROR').length;
  const warnGroups = groups.filter((g) => g.level === 'WARN').length;

  return (
    <TerminalShell title="LOG VIEWER — GROUPED">
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '0.5rem' }}>
        {/* Controls Bar */}
        <div
          className="term-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.4rem 0.75rem',
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          {/* Search */}
          <div className="term-input" style={{ flex: '1 1 200px', minWidth: 160 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="filter groups..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--d-text)',
                font: 'inherit',
                width: '100%',
              }}
              aria-label="Filter log groups"
            />
          </div>

          {/* Level Filters */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['INFO', 'WARN', 'ERROR', 'DEBUG'] as LogLevel[]).map((level) => (
              <button
                key={level}
                className="d-interactive"
                data-variant={activeLevels.has(level) ? 'primary' : 'ghost'}
                onClick={() => toggleLevel(level)}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  color: activeLevels.has(level) ? LEVEL_COLORS[level] : 'var(--d-text-muted)',
                  background: activeLevels.has(level) ? 'var(--d-surface)' : 'transparent',
                  borderColor: activeLevels.has(level) ? LEVEL_COLORS[level] : 'var(--d-border)',
                }}
                aria-pressed={activeLevels.has(level)}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Pause/Resume */}
          <button
            className="d-interactive"
            onClick={() => setPaused((p) => !p)}
            style={{
              padding: '0.2rem 0.5rem',
              fontSize: '0.75rem',
              color: paused ? 'var(--d-warning)' : 'var(--d-primary)',
            }}
          >
            {paused ? '▶ RESUME' : '❚❚ PAUSE'}
          </button>

          {/* Stream view link */}
          <Link
            to="/app/logs"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
          >
            STREAM
          </Link>

          {/* Stats */}
          <div className="d-label" style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
            <span>{filteredGroups.length} groups</span>
            <span>{totalEntries} total</span>
            <span style={{ color: 'var(--d-error)' }}>{errorGroups} error groups</span>
            <span style={{ color: 'var(--d-warning)' }}>{warnGroups} warn groups</span>
          </div>
        </div>

        {/* Grouped Log Stream */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.pattern);
            return (
              <div key={group.pattern} className="term-panel" style={{ padding: 0 }}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.pattern)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.4rem 0.75rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--d-text)',
                    font: 'inherit',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  aria-expanded={isExpanded}
                >
                  <span style={{ color: 'var(--d-text-muted)', width: '1.2rem', flexShrink: 0 }}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <span
                    style={{
                      color: LEVEL_COLORS[group.level],
                      width: '3.5rem',
                      flexShrink: 0,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    [{group.level}]
                  </span>
                  <span style={{ flex: 1, fontSize: '0.8rem' }}>{group.pattern}</span>
                  <span
                    className="d-annotation"
                    data-status={
                      group.level === 'ERROR'
                        ? 'error'
                        : group.level === 'WARN'
                          ? 'warning'
                          : 'info'
                    }
                  >
                    {group.count}x
                  </span>
                  <span
                    className="d-label"
                    style={{ width: '5.5rem', textAlign: 'right', flexShrink: 0 }}
                  >
                    {formatTime(group.lastSeen)}
                  </span>
                </button>

                {/* Expanded Entries */}
                {isExpanded && (
                  <div
                    className="term-canvas"
                    style={{
                      borderTop: '1px solid var(--d-border)',
                      padding: '0.25rem 0.75rem 0.5rem',
                      maxHeight: '200px',
                      overflow: 'auto',
                      fontSize: '0.75rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {group.entries.map((entry) => (
                      <div key={entry.id} style={{ whiteSpace: 'pre' }}>
                        <span style={{ color: 'var(--d-text-muted)' }}>
                          [{formatTime(entry.timestamp)}]
                        </span>{' '}
                        <span style={{ color: LEVEL_COLORS[entry.level] }}>
                          [{entry.level.padEnd(5)}]
                        </span>{' '}
                        <span>{entry.message}</span>
                      </div>
                    ))}
                    {group.count > group.entries.length && (
                      <div style={{ color: 'var(--d-text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                        ... and {group.count - group.entries.length} earlier entries (truncated)
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TerminalShell>
  );
}
