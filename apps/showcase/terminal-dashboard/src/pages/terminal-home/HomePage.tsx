import { useState, useEffect, useRef, useCallback } from 'react';
import { css } from '@decantr/css';
import { TerminalShell } from '@/components/TerminalShell';
import { SplitPane } from '@/components/SplitPane';

/* ── Braille sparkline rendering ── */
const BRAILLE_CHARS = ['\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'];

function sparkline(data: number[], max: number): string {
  return data
    .map((v) => {
      const idx = Math.round((v / max) * (BRAILLE_CHARS.length - 1));
      return BRAILLE_CHARS[Math.max(0, Math.min(idx, BRAILLE_CHARS.length - 1))];
    })
    .join('');
}

/* ── ASCII gauge ── */
function gauge(value: number, width = 20): string {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${String(value).padStart(3)}%`;
}

/* ── Mock data generators ── */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function drift(current: number, min: number, max: number, volatility: number): number {
  return clamp(current + randomBetween(-volatility, volatility), min, max);
}

const LOG_LEVELS = ['INFO', 'INFO', 'INFO', 'INFO', 'WARN', 'ERROR', 'INFO', 'DEBUG'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const LOG_MESSAGES: Record<LogLevel, string[]> = {
  INFO: [
    'Request completed in 42ms — GET /api/v1/health',
    'Worker pool scaled to 8 threads',
    'Cache hit ratio: 94.2%',
    'Connection pool recycled — 12 idle connections closed',
    'Scheduled job cron:cleanup completed successfully',
    'TLS certificate renewal check passed',
    'Metrics snapshot written to /var/log/metrics/1712150400.json',
    'Auth token refreshed for service-account@internal',
    'Database migration 047_add_index applied in 320ms',
    'Websocket connections: 847 active, 12 pending',
    'Rate limiter reset for bucket api:public — 1000 tokens restored',
    'Healthcheck passed: all 6 upstream services responding',
  ],
  WARN: [
    'Memory usage exceeded 80% threshold — 3.2GB / 4.0GB',
    'Slow query detected: SELECT * FROM events WHERE ts > ? — 2340ms',
    'Connection pool nearing capacity: 47/50 active',
    'Disk I/O latency spike: 45ms avg (threshold: 20ms)',
    'Retry attempt 2/3 for upstream service registry-api',
    'Certificate expires in 14 days — auto-renewal scheduled',
  ],
  ERROR: [
    'Connection refused: redis://cache-primary:6379 — failover to replica',
    'Request timeout after 30000ms — POST /api/v1/batch/process',
    'OOM kill: worker-7 exceeded 512MB limit',
    'TLS handshake failed: certificate chain incomplete',
    'Deadlock detected in transaction pool — auto-resolved',
  ],
  DEBUG: [
    'GC pause: 12ms (minor collection)',
    'DNS resolution: api.upstream.internal → 10.0.3.47 (2ms)',
    'Decompressed payload: 1.2MB → 340KB (gzip)',
    'Session store: 2,847 active sessions, 142 expired',
  ],
};

interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
}

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  status: string;
}

const INITIAL_PROCESSES: ProcessInfo[] = [
  { pid: 1, name: 'systemd', cpu: 0.1, mem: 0.3, status: 'running' },
  { pid: 847, name: 'node /app/server.js', cpu: 24.3, mem: 12.8, status: 'running' },
  { pid: 848, name: 'node /app/worker.js', cpu: 18.7, mem: 8.4, status: 'running' },
  { pid: 312, name: 'postgres', cpu: 8.2, mem: 22.1, status: 'running' },
  { pid: 315, name: 'postgres: wal writer', cpu: 2.1, mem: 3.2, status: 'running' },
  { pid: 501, name: 'redis-server *:6379', cpu: 3.4, mem: 5.6, status: 'running' },
  { pid: 620, name: 'nginx: master', cpu: 0.8, mem: 1.2, status: 'running' },
  { pid: 621, name: 'nginx: worker', cpu: 5.6, mem: 2.1, status: 'running' },
  { pid: 730, name: 'prometheus', cpu: 6.1, mem: 9.4, status: 'running' },
  { pid: 780, name: 'grafana-server', cpu: 2.3, mem: 4.7, status: 'running' },
  { pid: 900, name: 'cron', cpu: 0.0, mem: 0.1, status: 'sleeping' },
  { pid: 955, name: 'vector (log shipper)', cpu: 1.9, mem: 3.3, status: 'running' },
];

function formatTimestamp(): string {
  const now = new Date();
  return (
    String(now.getHours()).padStart(2, '0') +
    ':' +
    String(now.getMinutes()).padStart(2, '0') +
    ':' +
    String(now.getSeconds()).padStart(2, '0') +
    '.' +
    String(now.getMilliseconds()).padStart(3, '0')
  );
}

function levelColor(level: LogLevel): string {
  switch (level) {
    case 'ERROR':
      return 'var(--d-error)';
    case 'WARN':
      return 'var(--d-warning)';
    case 'DEBUG':
      return 'var(--d-info)';
    default:
      return 'var(--d-primary)';
  }
}

/* ── Left Pane: System Overview ── */
function SystemOverview({
  metrics,
  processes,
}: {
  metrics: { cpu: number; mem: number; disk: number; net: number; cpuHistory: number[]; memHistory: number[]; netHistory: number[] };
  processes: ProcessInfo[];
}) {
  return (
    <div className={css('_flex _col _gap4')} style={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div className="d-label" style={{ borderBottom: '1px solid var(--d-border)', paddingBottom: '0.25rem' }}>
        SYSTEM OVERVIEW
      </div>

      {/* Gauges */}
      <div className="term-panel" style={{ padding: '0.75rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem', color: 'var(--d-accent)' }}>
          RESOURCE UTILIZATION
        </div>
        <pre className="term-glow" style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
          {`CPU    ${gauge(metrics.cpu)}\nMEMORY ${gauge(metrics.mem)}\nDISK   ${gauge(metrics.disk)}\nNET IO ${gauge(metrics.net)}`}
        </pre>
      </div>

      {/* Sparklines */}
      <div className="term-panel" style={{ padding: '0.75rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem', color: 'var(--d-accent)' }}>
          60s HISTORY
        </div>
        <div style={{ fontSize: '0.8rem', lineHeight: 1.8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--d-text-muted)' }}>CPU</span>
            <span className="term-sparkline" style={{ color: 'var(--d-primary)', letterSpacing: '1px' }}>
              {sparkline(metrics.cpuHistory, 100)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--d-text-muted)' }}>MEM</span>
            <span className="term-sparkline" style={{ color: 'var(--d-warning)', letterSpacing: '1px' }}>
              {sparkline(metrics.memHistory, 100)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--d-text-muted)' }}>NET</span>
            <span className="term-sparkline" style={{ color: 'var(--d-accent)', letterSpacing: '1px' }}>
              {sparkline(metrics.netHistory, 100)}
            </span>
          </div>
        </div>
      </div>

      {/* Uptime / Stats */}
      <div className="term-panel" style={{ padding: '0.75rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem', color: 'var(--d-accent)' }}>
          SYSTEM INFO
        </div>
        <pre style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
          {`Uptime     47d 13h 22m\nLoad Avg   2.41  1.87  1.63\nProcesses  ${processes.length} active\nThreads    128\nOpen FDs   2,847 / 65,536\nTCP Conns  847 established`}
        </pre>
      </div>

      {/* Process Table */}
      <div className="term-panel" style={{ padding: '0.75rem', flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem', color: 'var(--d-accent)' }}>
          TOP PROCESSES
        </div>
        <table className="d-data term-table" style={{ fontSize: '0.7rem' }}>
          <thead>
            <tr>
              <th className="d-data-header" style={{ width: '3rem' }}>PID</th>
              <th className="d-data-header">COMMAND</th>
              <th className="d-data-header" style={{ width: '3.5rem', textAlign: 'right' }}>CPU%</th>
              <th className="d-data-header" style={{ width: '3.5rem', textAlign: 'right' }}>MEM%</th>
              <th className="d-data-header" style={{ width: '4.5rem' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr key={p.pid} className="d-data-row">
                <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{p.pid}</td>
                <td className="d-data-cell" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </td>
                <td className="d-data-cell" style={{ textAlign: 'right', color: p.cpu > 15 ? 'var(--d-warning)' : 'var(--d-text)' }}>
                  {p.cpu.toFixed(1)}
                </td>
                <td className="d-data-cell" style={{ textAlign: 'right', color: p.mem > 15 ? 'var(--d-warning)' : 'var(--d-text)' }}>
                  {p.mem.toFixed(1)}
                </td>
                <td className="d-data-cell">
                  <span
                    className="d-annotation"
                    data-status={p.status === 'running' ? 'success' : 'info'}
                    style={{ fontSize: '0.6rem' }}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Right Pane: Log Stream + Command Input ── */
function LogStream({
  logs,
  onCommand,
}: {
  logs: LogEntry[];
  onCommand: (cmd: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;
      setCommandHistory((prev) => [trimmed, ...prev]);
      setHistoryIdx(-1);
      onCommand(trimmed);
      setInput('');
    },
    [input, onCommand],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHistoryIdx((prev) => {
          const next = Math.min(prev + 1, commandHistory.length - 1);
          if (commandHistory[next]) setInput(commandHistory[next]);
          return next;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHistoryIdx((prev) => {
          const next = prev - 1;
          if (next < 0) {
            setInput('');
            return -1;
          }
          if (commandHistory[next]) setInput(commandHistory[next]);
          return next;
        });
      }
    },
    [commandHistory],
  );

  return (
    <div className={css('_flex _col')} style={{ height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--d-border)',
          paddingBottom: '0.25rem',
          marginBottom: '0.5rem',
          flexShrink: 0,
        }}
      >
        <span className="d-label">LIVE LOG STREAM</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
          {logs.length} entries
        </span>
      </div>

      {/* Log Lines */}
      <div
        ref={scrollRef}
        className="term-canvas"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0.5rem',
          fontSize: '0.72rem',
          lineHeight: 1.5,
          fontFamily: 'inherit',
          minHeight: 0,
          border: '1px solid var(--d-border)',
        }}
      >
        {logs.map((entry) => (
          <div key={entry.id} style={{ display: 'flex', gap: '0.5rem', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--d-text-muted)', flexShrink: 0 }}>{entry.timestamp}</span>
            <span
              style={{
                color: levelColor(entry.level),
                fontWeight: 600,
                width: '3.2rem',
                flexShrink: 0,
                textAlign: 'center',
              }}
            >
              [{entry.level.padEnd(5)}]
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', color: entry.level === 'ERROR' ? 'var(--d-error)' : 'var(--d-text)' }}>
              {entry.message}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.25rem', color: 'var(--d-text-muted)' }}>
          <span className="term-blink">_</span>
        </div>
      </div>

      {/* Command Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.5rem',
          flexShrink: 0,
        }}
      >
        <span className="term-glow" style={{ color: 'var(--d-primary)', flexShrink: 0, fontSize: '0.8rem' }}>
          {'> '}
        </span>
        <input
          className="term-input d-control"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type a command..."
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1,
            background: 'transparent',
            border: '1px solid var(--d-border)',
            borderRadius: 0,
            padding: '0.3rem 0.5rem',
            fontSize: '0.8rem',
          }}
        />
      </form>
    </div>
  );
}

/* ── Page Component ── */
export function HomePage() {
  const logIdRef = useRef(0);

  const [metrics, setMetrics] = useState({
    cpu: 47,
    mem: 62,
    disk: 71,
    net: 23,
    cpuHistory: Array.from({ length: 30 }, () => randomBetween(30, 70)),
    memHistory: Array.from({ length: 30 }, () => randomBetween(50, 75)),
    netHistory: Array.from({ length: 30 }, () => randomBetween(10, 50)),
  });

  const [processes, setProcesses] = useState<ProcessInfo[]>(INITIAL_PROCESSES);

  const generateLog = useCallback((): LogEntry => {
    const level = LOG_LEVELS[randomBetween(0, LOG_LEVELS.length - 1)];
    const messages = LOG_MESSAGES[level];
    logIdRef.current += 1;
    return {
      id: logIdRef.current,
      timestamp: formatTimestamp(),
      level,
      message: messages[randomBetween(0, messages.length - 1)],
    };
  }, []);

  const [logs, setLogs] = useState<LogEntry[]>(() =>
    Array.from({ length: 40 }, () => {
      logIdRef.current += 1;
      const level = LOG_LEVELS[randomBetween(0, LOG_LEVELS.length - 1)];
      const messages = LOG_MESSAGES[level];
      return {
        id: logIdRef.current,
        timestamp: formatTimestamp(),
        level,
        message: messages[randomBetween(0, messages.length - 1)],
      };
    }),
  );

  // Real-time log streaming
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const next = [...prev, generateLog()];
        if (next.length > 200) return next.slice(-200);
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [generateLog]);

  // Real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const cpu = drift(prev.cpu, 15, 95, 5);
        const mem = drift(prev.mem, 40, 90, 3);
        const net = drift(prev.net, 5, 80, 8);
        return {
          cpu,
          mem: mem,
          disk: drift(prev.disk, 60, 85, 1),
          net,
          cpuHistory: [...prev.cpuHistory.slice(-29), cpu],
          memHistory: [...prev.memHistory.slice(-29), mem],
          netHistory: [...prev.netHistory.slice(-29), net],
        };
      });

      setProcesses((prev) =>
        prev.map((p) => ({
          ...p,
          cpu: Math.max(0, +(p.cpu + (Math.random() - 0.5) * 4).toFixed(1)),
          mem: Math.max(0, +(p.mem + (Math.random() - 0.5) * 1.5).toFixed(1)),
        })),
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCommand = useCallback(
    (cmd: string) => {
      logIdRef.current += 1;
      const response: LogEntry = {
        id: logIdRef.current,
        timestamp: formatTimestamp(),
        level: 'INFO',
        message: `$ ${cmd} — command dispatched`,
      };
      setLogs((prev) => [...prev, response]);
    },
    [],
  );

  return (
    <TerminalShell title="SYSTEM MONITOR">
      <SplitPane
        left={<SystemOverview metrics={metrics} processes={processes} />}
        right={<LogStream logs={logs} onCommand={handleCommand} />}
        direction="horizontal"
        initialRatio={0.42}
      />
    </TerminalShell>
  );
}
