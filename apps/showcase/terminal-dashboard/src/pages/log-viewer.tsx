import { useState, useEffect, useRef } from 'react';
import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';

/* ── types ── */

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  source: string;
  message: string;
}

/* ── mock data ── */

const SOURCES = ['api-server', 'worker-01', 'worker-02', 'scheduler', 'cache-layer', 'db-pool', 'auth-svc', 'gateway'];

const MESSAGES: Record<string, string[]> = {
  DEBUG: [
    'GC cycle completed in 12ms',
    'Cache hit ratio: 0.94',
    'Connection pool recycled (idle: 3)',
    'Heartbeat sent to cluster node-02',
    'Trace span closed: req-a82f',
    'DNS resolution cached for api.internal',
  ],
  INFO: [
    'Request processed: GET /api/v1/users (45ms)',
    'New deployment detected: v2.4.1-rc.3',
    'Worker registered: us-east-1a (capacity: 8)',
    'Migration 0042_add_index completed in 120ms',
    'TLS certificate renewed (expires: 2026-07-01)',
    'Batch job completed: 1,420 records processed',
    'Health check passed: all 6 services healthy',
  ],
  WARN: [
    'Memory usage exceeds 80% threshold (82.4%)',
    'Slow query detected: SELECT * FROM orders (2340ms)',
    'Rate limit approaching: /api/v1/users (890/1000 req/min)',
    'Connection pool nearing capacity (47/50)',
    'Disk I/O latency spike: 45ms avg (threshold: 30ms)',
    'Retry #2 for failed webhook delivery to partner-api',
  ],
  ERROR: [
    'Failed to connect to replica db-read-02: timeout after 5000ms',
    'Unhandled promise rejection in /api/v1/payments handler',
    'Circuit breaker OPEN for payment-svc (failures: 5/5)',
    'SSL handshake failed: certificate expired for cdn.partner.io',
    'OOM kill: worker-03 exceeded 2GB memory limit',
  ],
};

let logCounter = 0;

function randomLog(): LogEntry {
  const levels: LogEntry['level'][] = ['DEBUG', 'DEBUG', 'INFO', 'INFO', 'INFO', 'INFO', 'WARN', 'WARN', 'ERROR'];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const msgs = MESSAGES[level];
  return {
    id: ++logCounter,
    timestamp: new Date().toISOString().slice(11, 23),
    level,
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    message: msgs[Math.floor(Math.random() * msgs.length)],
  };
}

/* ── colors ── */

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: 'var(--d-text-muted)',
  INFO: 'var(--d-primary)',
  WARN: 'var(--d-warning)',
  ERROR: 'var(--d-error)',
};

/* ── StatusBar ── */

function StatusBar({ logCount, errorCount, warnCount }: { logCount: number; errorCount: number; warnCount: number }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`d-status-bar ${css('_jcsb')}`}>
      <div className={css('_flex _aic _gap3')}>
        <span style={{ color: 'var(--d-primary)' }}>&#9679;</span>
        <span>LOG VIEWER</span>
        <span style={{ color: 'var(--d-border)' }}>|</span>
        <span>STREAMING</span>
        <span style={{ color: 'var(--d-border)' }}>|</span>
        <span>{logCount} entries</span>
      </div>
      <div className={css('_flex _aic _gap3')}>
        <span style={{ color: 'var(--d-error)' }}>{errorCount} ERR</span>
        <span style={{ color: 'var(--d-warning)' }}>{warnCount} WARN</span>
        <span style={{ color: 'var(--d-border)' }}>|</span>
        <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
    </div>
  );
}

/* ── HotkeyBar ── */

function HotkeyBar() {
  const navigate = useNavigate();

  const hotkeys = [
    { key: 'F1', label: 'Home', action: () => navigate('/app') },
    { key: 'F2', label: 'Config', action: () => navigate('/app/config') },
    { key: 'F3', label: 'Logs', action: () => navigate('/app/logs') },
    { key: 'F4', label: 'Metrics', action: () => navigate('/app/metrics') },
    { key: 'F10', label: 'Quit', action: () => navigate('/login') },
  ];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const hk = hotkeys.find((h) => h.key === e.key);
      if (hk) {
        e.preventDefault();
        hk.action();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="d-hotkey-bar">
      {hotkeys.map((h) => (
        <button
          key={h.key}
          onClick={h.action}
          className={css('_flex _aic')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <kbd>{h.key}</kbd>
          <span>{h.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── FilterBar ── */

function FilterBar({
  filters,
  onToggle,
  search,
  onSearchChange,
  paused,
  onTogglePause,
  onExport,
  onClear,
}: {
  filters: Record<string, boolean>;
  onToggle: (level: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  paused: boolean;
  onTogglePause: () => void;
  onExport: () => void;
  onClear: () => void;
}) {
  return (
    <div
      className={css('_flex _aic _gap4 _p3')}
      style={{ borderBottom: '1px solid var(--d-border)' }}
    >
      {/* Search */}
      <div className={css('_flex _aic _gap1 _flex1')}>
        <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>/</span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search logs..."
          spellCheck={false}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--d-text)',
            fontFamily: 'var(--d-font-mono)',
            fontSize: '0.8rem',
            padding: 0,
          }}
        />
      </div>

      {/* Level filters */}
      <div className={css('_flex _aic _gap3')}>
        {(['DEBUG', 'INFO', 'WARN', 'ERROR'] as const).map((level) => (
          <button
            key={level}
            onClick={() => onToggle(level)}
            style={{
              background: 'none',
              border: '1px solid',
              borderColor: filters[level] ? LEVEL_COLORS[level] : 'var(--d-border)',
              color: filters[level] ? LEVEL_COLORS[level] : 'var(--d-text-muted)',
              fontFamily: 'var(--d-font-mono)',
              fontSize: '0.7rem',
              padding: '2px 6px',
              cursor: 'pointer',
              opacity: filters[level] ? 1 : 0.4,
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className={css('_flex _aic _gap3')}>
        <button
          onClick={onTogglePause}
          style={{
            background: 'none',
            border: '1px solid var(--d-border)',
            color: paused ? 'var(--d-warning)' : 'var(--d-primary)',
            fontFamily: 'var(--d-font-mono)',
            fontSize: '0.7rem',
            padding: '2px 8px',
            cursor: 'pointer',
          }}
        >
          {paused ? '[ PAUSED ]' : '[ LIVE ]'}
        </button>
        <button
          onClick={onExport}
          style={{
            background: 'none',
            border: '1px solid var(--d-border)',
            color: 'var(--d-text-muted)',
            fontFamily: 'var(--d-font-mono)',
            fontSize: '0.7rem',
            padding: '2px 8px',
            cursor: 'pointer',
          }}
        >
          EXPORT
        </button>
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: '1px solid var(--d-border)',
            color: 'var(--d-text-muted)',
            fontFamily: 'var(--d-font-mono)',
            fontSize: '0.7rem',
            padding: '2px 8px',
            cursor: 'pointer',
          }}
        >
          CLEAR
        </button>
      </div>
    </div>
  );
}

/* ── LogStream ── */

function LogStream({ logs, search }: { logs: LogEntry[]; search: string }) {
  const containerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  function highlightSearch(text: string): React.ReactNode {
    if (!search) return text;
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ background: 'var(--d-accent)', color: 'var(--d-bg)' }}>
          {text.slice(idx, idx + search.length)}
        </span>
        {text.slice(idx + search.length)}
      </>
    );
  }

  return (
    <pre
      ref={containerRef}
      className={css('_flex1 _p3')}
      style={{
        overflow: 'auto',
        margin: 0,
        fontSize: '0.8rem',
        lineHeight: '1.6',
      }}
    >
      {logs.length === 0 && (
        <div style={{ color: 'var(--d-text-muted)', textAlign: 'center', padding: '2rem' }}>
          No log entries match your filters.
        </div>
      )}
      {logs.map((log) => (
        <div key={log.id} className={css('_flex _gap3')} style={{ whiteSpace: 'nowrap' }}>
          <span style={{ color: 'var(--d-text-muted)', minWidth: '90px' }}>
            {log.timestamp}
          </span>
          <span style={{ color: LEVEL_COLORS[log.level], minWidth: '56px', fontWeight: 600 }}>
            [{log.level.padEnd(5)}]
          </span>
          <span
            style={{
              color: 'var(--d-text-muted)',
              minWidth: '110px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {log.source}
          </span>
          <span style={{ color: 'var(--d-text)' }}>{highlightSearch(log.message)}</span>
        </div>
      ))}
    </pre>
  );
}

/* ── Level Summary ── */

function LevelSummary({ logs }: { logs: LogEntry[] }) {
  const counts = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0 };
  logs.forEach((l) => counts[l.level]++);

  return (
    <div
      className={css('_flex _aic _gap4 _p3')}
      style={{ borderBottom: '1px solid var(--d-border)', fontSize: '0.75rem' }}
    >
      {(['DEBUG', 'INFO', 'WARN', 'ERROR'] as const).map((level) => (
        <div key={level} className={css('_flex _aic _gap1')}>
          <span style={{ color: LEVEL_COLORS[level] }}>{'\u25A0'}</span>
          <span style={{ color: 'var(--d-text-muted)' }}>{level}:</span>
          <span style={{ color: LEVEL_COLORS[level], fontWeight: 600 }}>{counts[level]}</span>
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <span style={{ color: 'var(--d-text-muted)' }}>
        TOTAL: {logs.length}
      </span>
    </div>
  );
}

/* ── Logs Page (main export) ── */

export function LogsPage() {
  const [allLogs, setAllLogs] = useState<LogEntry[]>(() =>
    Array.from({ length: 50 }, () => randomLog())
  );
  const [paused, setPaused] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, boolean>>({
    DEBUG: true,
    INFO: true,
    WARN: true,
    ERROR: true,
  });

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setAllLogs((prev) => [...prev.slice(-500), randomLog()]);
    }, 600);
    return () => clearInterval(id);
  }, [paused]);

  const filteredLogs = allLogs.filter((log) => {
    if (!filters[log.level]) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) &&
        !log.source.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const errorCount = allLogs.filter((l) => l.level === 'ERROR').length;
  const warnCount = allLogs.filter((l) => l.level === 'WARN').length;

  function handleExport() {
    const text = filteredLogs
      .map((l) => `${l.timestamp} [${l.level}] ${l.source} ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    setAllLogs([]);
  }

  function handleToggleFilter(level: string) {
    setFilters((prev) => ({ ...prev, [level]: !prev[level] }));
  }

  return (
    <div className={css('_flex _col _hfull')} style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Layout: status -> log-stream -> hotkeys */}

      {/* Pattern: status */}
      <StatusBar logCount={allLogs.length} errorCount={errorCount} warnCount={warnCount} />

      {/* Pattern: log-stream (filtered preset) */}
      <div className={`d-panel ${css('_flex _col _flex1')}`} style={{ overflow: 'hidden' }}>
        <FilterBar
          filters={filters}
          onToggle={handleToggleFilter}
          search={search}
          onSearchChange={setSearch}
          paused={paused}
          onTogglePause={() => setPaused((p) => !p)}
          onExport={handleExport}
          onClear={handleClear}
        />
        <LevelSummary logs={allLogs} />
        <LogStream logs={filteredLogs} search={search} />
      </div>

      {/* Pattern: hotkeys */}
      <HotkeyBar />
    </div>
  );
}

/* ── Grouped Logs Page ── */

export function GroupedLogsPage() {
  const navigate = useNavigate();
  const [allLogs, setAllLogs] = useState<LogEntry[]>(() =>
    Array.from({ length: 80 }, () => randomLog())
  );

  useEffect(() => {
    const id = setInterval(() => {
      setAllLogs((prev) => [...prev.slice(-300), randomLog()]);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Group by source
  const grouped = allLogs.reduce<Record<string, LogEntry[]>>((acc, log) => {
    if (!acc[log.source]) acc[log.source] = [];
    acc[log.source].push(log);
    return acc;
  }, {});

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={css('_flex _col _hfull')} style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Pattern: status */}
      <div className={`d-status-bar ${css('_jcsb')}`}>
        <div className={css('_flex _aic _gap3')}>
          <span style={{ color: 'var(--d-primary)' }}>&#9679;</span>
          <span>GROUPED LOGS</span>
          <span style={{ color: 'var(--d-border)' }}>|</span>
          <span>{Object.keys(grouped).length} sources</span>
          <span style={{ color: 'var(--d-border)' }}>|</span>
          <span>{allLogs.length} entries</span>
        </div>
        <div className={css('_flex _aic _gap3')}>
          <button
            onClick={() => navigate('/app/logs')}
            style={{
              background: 'none',
              border: '1px solid var(--d-border)',
              color: 'var(--d-text-muted)',
              fontFamily: 'var(--d-font-mono)',
              fontSize: '0.7rem',
              padding: '2px 8px',
              cursor: 'pointer',
            }}
          >
            STREAM VIEW
          </button>
          <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
      </div>

      {/* Pattern: grouped-logs */}
      <div className={css('_flex1 _p4')} style={{ overflow: 'auto' }}>
        <div className={css('_flex _col _gap4')}>
          {Object.entries(grouped)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([source, entries]) => {
              const errorCount = entries.filter((e) => e.level === 'ERROR').length;
              const warnCount = entries.filter((e) => e.level === 'WARN').length;

              return (
                <details key={source} open className="d-panel">
                  <summary
                    className={`d-panel-header ${css('_flex _aic _jcsb')}`}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div className={css('_flex _aic _gap3')}>
                      <span style={{ color: 'var(--d-primary)' }}>{source}</span>
                      <span style={{ color: 'var(--d-text-muted)' }}>({entries.length} entries)</span>
                    </div>
                    <div className={css('_flex _aic _gap3')}>
                      {errorCount > 0 && (
                        <span style={{ color: 'var(--d-error)' }}>{errorCount} ERR</span>
                      )}
                      {warnCount > 0 && (
                        <span style={{ color: 'var(--d-warning)' }}>{warnCount} WARN</span>
                      )}
                    </div>
                  </summary>
                  <div className={css('_p3')} style={{ fontSize: '0.8rem' }}>
                    {entries.slice(-15).map((log) => (
                      <div key={log.id} className={css('_flex _gap3')} style={{ lineHeight: '1.6' }}>
                        <span style={{ color: 'var(--d-text-muted)', minWidth: '90px' }}>
                          {log.timestamp}
                        </span>
                        <span style={{ color: LEVEL_COLORS[log.level], minWidth: '56px' }}>
                          [{log.level.padEnd(5)}]
                        </span>
                        <span style={{ color: 'var(--d-text)' }}>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
        </div>
      </div>

      {/* Pattern: hotkeys */}
      <div className="d-hotkey-bar">
        {[
          { key: 'F1', label: 'Home', route: '/app' },
          { key: 'F2', label: 'Config', route: '/app/config' },
          { key: 'F3', label: 'Logs', route: '/app/logs' },
          { key: 'F4', label: 'Metrics', route: '/app/metrics' },
          { key: 'F10', label: 'Quit', route: '/login' },
        ].map((h) => (
          <button
            key={h.key}
            onClick={() => navigate(h.route)}
            className={css('_flex _aic')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <kbd>{h.key}</kbd>
            <span>{h.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
