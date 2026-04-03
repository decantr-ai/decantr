import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { TerminalShell } from '@/components/TerminalShell';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogEntry {
  id: number;
  timestamp: Date;
  level: LogLevel;
  message: string;
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  INFO: 'var(--d-primary)',
  WARN: 'var(--d-warning)',
  ERROR: 'var(--d-error)',
  DEBUG: 'var(--d-text-muted)',
};

const LOG_TEMPLATES: Array<{ level: LogLevel; message: string }> = [
  { level: 'INFO', message: 'GET /api/health 200 OK 2ms' },
  { level: 'INFO', message: 'GET /api/v1/users 200 OK 14ms' },
  { level: 'INFO', message: 'POST /api/v1/auth/refresh 200 OK 8ms' },
  { level: 'INFO', message: 'GET /api/v1/metrics/cpu 200 OK 3ms' },
  { level: 'INFO', message: 'GET /api/v1/config 200 OK 5ms' },
  { level: 'INFO', message: 'WebSocket connection established client=ws://10.0.1.42:8080' },
  { level: 'INFO', message: 'Cache HIT key="session:usr_29x8k" ttl=1800s' },
  { level: 'INFO', message: 'Cache HIT key="config:global" ttl=3600s' },
  { level: 'INFO', message: 'Cache MISS key="metrics:hist:24h" — fetching from source' },
  { level: 'INFO', message: 'DB Query: SELECT * FROM users WHERE active=true (23 rows, 4ms)' },
  { level: 'INFO', message: 'DB Query: SELECT count(*) FROM events WHERE ts > now()-1h (1 row, 2ms)' },
  { level: 'INFO', message: 'Deployment deploy_7f3a started — image=app:v2.14.1 replicas=3' },
  { level: 'INFO', message: 'Deployment deploy_7f3a rolling update 1/3 complete' },
  { level: 'INFO', message: 'Deployment deploy_7f3a rolling update 2/3 complete' },
  { level: 'INFO', message: 'Deployment deploy_7f3a completed successfully in 42s' },
  { level: 'INFO', message: 'TLS certificate renewed for *.decantr.ai expires=2027-03-15' },
  { level: 'INFO', message: 'Background job cron:cleanup completed — removed 847 stale sessions' },
  { level: 'INFO', message: 'Rate limiter reset bucket=api:global tokens=1000' },
  { level: 'WARN', message: 'Slow query: SELECT * FROM events JOIN metrics ON... (892ms)' },
  { level: 'WARN', message: 'Memory usage at 78% — threshold=80% consider scaling' },
  { level: 'WARN', message: 'Rate limit approaching: api:auth 89/100 requests in window' },
  { level: 'WARN', message: 'Certificate for internal.decantr.local expires in 14 days' },
  { level: 'WARN', message: 'Connection pool: 47/50 connections in use — approaching limit' },
  { level: 'WARN', message: 'Retry attempt 2/3 for upstream service registry.internal:9090' },
  { level: 'WARN', message: 'Disk usage at 82% on /var/log — rotate logs soon' },
  { level: 'WARN', message: 'Deprecated API call: GET /api/v0/status — migrate to v1' },
  { level: 'ERROR', message: 'Connection refused: postgres://db-primary:5432 — retrying in 5s' },
  { level: 'ERROR', message: 'Auth token validation failed: jwt expired sub=usr_83kq2' },
  { level: 'ERROR', message: 'Unhandled rejection in worker pid=2847: ENOMEM cannot allocate' },
  { level: 'ERROR', message: 'POST /api/v1/webhooks 502 Bad Gateway upstream=hooks.internal:3001' },
  { level: 'ERROR', message: 'DNS resolution failed for metrics-collector.internal — NXDOMAIN' },
  { level: 'DEBUG', message: 'Request headers: Accept=application/json X-Request-Id=req_8f2k' },
  { level: 'DEBUG', message: 'Session validated: usr_29x8k scope=["read","write"] exp=1735689600' },
  { level: 'DEBUG', message: 'Cache eviction: LRU removed 12 entries, freed 2.4MB' },
  { level: 'DEBUG', message: 'Goroutine count: 847 heap_alloc=124MB sys=256MB' },
  { level: 'DEBUG', message: 'TCP keepalive sent to 10.0.1.15:5432 seq=142' },
  { level: 'DEBUG', message: 'Config reload triggered: checksum=sha256:a8f3e..changed=["rate_limits"]' },
  { level: 'DEBUG', message: 'Middleware chain: cors -> auth -> ratelimit -> handler (3.2ms total)' },
  { level: 'DEBUG', message: 'GC pause: 1.2ms collected=14MB heap_after=110MB' },
];

function pickRandom(): { level: LogLevel; message: string } {
  return LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
}

function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

function generateInitialLogs(count: number): LogEntry[] {
  const now = Date.now();
  const entries: LogEntry[] = [];
  for (let i = 0; i < count; i++) {
    const template = pickRandom();
    entries.push({
      id: i,
      timestamp: new Date(now - (count - i) * 500),
      level: template.level,
      message: template.message,
    });
  }
  return entries;
}

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>(() => generateInitialLogs(100));
  const [paused, setPaused] = useState(false);
  const [search, setSearch] = useState('');
  const [activeLevels, setActiveLevels] = useState<Set<LogLevel>>(
    new Set(['INFO', 'WARN', 'ERROR', 'DEBUG']),
  );
  const [autoScroll, setAutoScroll] = useState(true);
  const nextId = useRef(100);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

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

  // Stream new logs
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const template = pickRandom();
      const entry: LogEntry = {
        id: nextId.current++,
        timestamp: new Date(),
        level: template.level,
        message: template.message,
      };
      setLogs((prev) => [...prev.slice(-999), entry]);
    }, 500);
    return () => clearInterval(interval);
  }, [paused]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && !userScrolledUp.current && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = useCallback(() => {
    const el = logContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    userScrolledUp.current = !atBottom;
    setAutoScroll(atBottom);
  }, []);

  const filteredLogs = logs.filter((entry) => {
    if (!activeLevels.has(entry.level)) return false;
    if (search && !entry.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const errorCount = logs.filter((e) => e.level === 'ERROR').length;
  const warnCount = logs.filter((e) => e.level === 'WARN').length;
  const rate = paused ? '0.0' : '2.0';

  return (
    <TerminalShell title="LOG VIEWER">
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
              placeholder="grep pattern..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--d-text)',
                font: 'inherit',
                width: '100%',
              }}
              aria-label="Search logs"
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

          {/* Grouped view link */}
          <Link
            to="/app/logs/grouped"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
          >
            GROUPED
          </Link>

          {/* Stats */}
          <div className="d-label" style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
            <span>{filteredLogs.length} entries</span>
            <span style={{ color: 'var(--d-error)' }}>{errorCount} errors</span>
            <span style={{ color: 'var(--d-warning)' }}>{warnCount} warnings</span>
            <span>{rate}/s</span>
          </div>
        </div>

        {/* Log Stream */}
        <div
          ref={logContainerRef}
          onScroll={handleScroll}
          className="term-canvas"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '0.5rem',
            fontSize: '0.8rem',
            lineHeight: 1.5,
            minHeight: 0,
            border: '1px solid var(--d-border)',
          }}
        >
          {filteredLogs.map((entry) => (
            <div key={entry.id} style={{ whiteSpace: 'pre', fontFamily: 'inherit' }}>
              <span style={{ color: 'var(--d-text-muted)' }}>
                [{formatTime(entry.timestamp)}]
              </span>{' '}
              <span
                style={{
                  color: LEVEL_COLORS[entry.level],
                  fontWeight: entry.level === 'ERROR' ? 700 : 400,
                }}
              >
                [{entry.level.padEnd(5)}]
              </span>{' '}
              <span
                style={{
                  color:
                    entry.level === 'ERROR'
                      ? 'var(--d-error)'
                      : entry.level === 'WARN'
                        ? 'var(--d-warning)'
                        : 'var(--d-text)',
                }}
              >
                {entry.message}
              </span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        {!autoScroll && (
          <div
            style={{
              position: 'relative',
              marginTop: '-2rem',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              className="d-annotation"
              data-status="warning"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={() => {
                userScrolledUp.current = false;
                setAutoScroll(true);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  userScrolledUp.current = false;
                  setAutoScroll(true);
                }
              }}
            >
              ⏸ PAUSED — scroll locked • click to resume
            </span>
          </div>
        )}
      </div>
    </TerminalShell>
  );
}
