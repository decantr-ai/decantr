import { useState, useEffect, useRef, useCallback } from 'react';
import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';

/* ── mock data generators ── */

interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  source: string;
  message: string;
}

const SOURCES = ['api-server', 'worker-01', 'scheduler', 'cache', 'db-pool', 'auth-svc'];
const MESSAGES: Record<string, string[]> = {
  DEBUG: [
    'GC cycle completed in 12ms',
    'Cache hit ratio: 0.94',
    'Connection pool recycled',
    'Heartbeat sent to cluster',
  ],
  INFO: [
    'Request processed in 45ms',
    'New deployment detected: v2.4.1',
    'Worker registered: us-east-1a',
    'Migration completed successfully',
    'TLS certificate renewed',
  ],
  WARN: [
    'Memory usage exceeds 80% threshold',
    'Slow query detected: 2340ms',
    'Rate limit approaching for /api/v1/users',
    'Connection pool nearing capacity',
  ],
  ERROR: [
    'Failed to connect to replica: timeout',
    'Unhandled promise rejection in handler',
    'Circuit breaker triggered for payment-svc',
  ],
};

function randomEntry(): LogEntry {
  const levels: LogEntry['level'][] = ['DEBUG', 'INFO', 'INFO', 'INFO', 'WARN', 'ERROR'];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const msgs = MESSAGES[level];
  return {
    timestamp: new Date().toISOString().slice(11, 23),
    level,
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    message: msgs[Math.floor(Math.random() * msgs.length)],
  };
}

/* ── metric data ── */

interface MetricData {
  label: string;
  value: number;
  unit: string;
  sparkline: number[];
  status: 'ok' | 'warn' | 'critical';
}

function generateMetrics(): MetricData[] {
  return [
    {
      label: 'CPU',
      value: Math.floor(30 + Math.random() * 50),
      unit: '%',
      sparkline: Array.from({ length: 20 }, () => Math.floor(20 + Math.random() * 60)),
      status: 'ok',
    },
    {
      label: 'MEM',
      value: Math.floor(50 + Math.random() * 35),
      unit: '%',
      sparkline: Array.from({ length: 20 }, () => Math.floor(40 + Math.random() * 45)),
      status: 'warn',
    },
    {
      label: 'DISK',
      value: Math.floor(20 + Math.random() * 15),
      unit: '%',
      sparkline: Array.from({ length: 20 }, () => Math.floor(15 + Math.random() * 25)),
      status: 'ok',
    },
    {
      label: 'NET',
      value: Math.floor(100 + Math.random() * 900),
      unit: 'Mbps',
      sparkline: Array.from({ length: 20 }, () => Math.floor(50 + Math.random() * 950)),
      status: 'ok',
    },
  ];
}

/* ── sparkline renderer ── */

const SPARK_CHARS = ['\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'];

function renderSparkline(data: number[]): string {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return data
    .map((v) => {
      const idx = Math.round(((v - min) / range) * (SPARK_CHARS.length - 1));
      return SPARK_CHARS[idx];
    })
    .join('');
}

/* ── level color mapping ── */

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: 'var(--d-text-muted)',
  INFO: 'var(--d-primary)',
  WARN: 'var(--d-warning)',
  ERROR: 'var(--d-error)',
};

/* ── StatusBar component ── */

function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`d-status-bar ${css('_jcsb')}`}>
      <div className={css('_flex _aic _gap3')}>
        <span style={{ color: 'var(--d-primary)' }}>&#9679;</span>
        <span>TERMINAL-DASHBOARD v2.4.1</span>
        <span style={{ color: 'var(--d-border)' }}>|</span>
        <span>CONNECTED</span>
        <span style={{ color: 'var(--d-border)' }}>|</span>
        <span>us-east-1</span>
      </div>
      <div className={css('_flex _aic _gap3')}>
        <span>PID 4821</span>
        <span style={{ color: 'var(--d-border)' }}>|</span>
        <span>UP 14d 6h 23m</span>
        <span style={{ color: 'var(--d-border)' }}>|</span>
        <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
    </div>
  );
}

/* ── HotkeyBar component ── */

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

/* ── LogPanel component ── */

function LogPanel() {
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    Array.from({ length: 30 }, () => randomEntry())
  );
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setLogs((prev) => [...prev.slice(-200), randomEntry()]);
    }, 800);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    if (!paused && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, paused]);

  return (
    <div className={`d-panel ${css('_flex _col _flex1')}`}>
      <div className={`d-panel-header ${css('_flex _aic _jcsb')}`}>
        <span>LOG STREAM [{logs.length} entries]</span>
        <button
          onClick={() => setPaused((p) => !p)}
          style={{
            background: 'none',
            border: '1px solid var(--d-border)',
            color: paused ? 'var(--d-warning)' : 'var(--d-text-muted)',
            fontFamily: 'var(--d-font-mono)',
            fontSize: '0.7rem',
            padding: '2px 8px',
            cursor: 'pointer',
          }}
        >
          {paused ? '[ PAUSED ]' : '[ LIVE ]'}
        </button>
      </div>
      <pre
        ref={containerRef}
        className={css('_flex1 _p3')}
        style={{
          overflow: 'auto',
          margin: 0,
          fontSize: '0.8rem',
          lineHeight: '1.5',
        }}
      >
        {logs.map((log, i) => (
          <div key={i} className={css('_flex _gap3')} style={{ whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--d-text-muted)', minWidth: '90px' }}>
              {log.timestamp}
            </span>
            <span style={{ color: LEVEL_COLORS[log.level], minWidth: '48px' }}>
              [{log.level.padEnd(5)}]
            </span>
            <span style={{ color: 'var(--d-text-muted)', minWidth: '100px' }}>
              {log.source}
            </span>
            <span style={{ color: 'var(--d-text)' }}>{log.message}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

/* ── MetricsSidebar component ── */

function MetricsSidebar() {
  const [metrics, setMetrics] = useState<MetricData[]>(generateMetrics);

  useEffect(() => {
    const id = setInterval(() => setMetrics(generateMetrics()), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`d-panel ${css('_flex _col')}`} style={{ minWidth: '280px' }}>
      <div className="d-panel-header">SYSTEM METRICS</div>
      <div className={css('_flex _col _gap4 _p3')}>
        {metrics.map((m) => (
          <div key={m.label} className={css('_flex _col _gap1')}>
            <div className={css('_flex _jcsb _aic')}>
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>
                {m.label}
              </span>
              <span
                style={{
                  color:
                    m.status === 'critical'
                      ? 'var(--d-error)'
                      : m.status === 'warn'
                        ? 'var(--d-warning)'
                        : 'var(--d-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {m.value}
                {m.unit}
              </span>
            </div>
            <div
              style={{
                color: 'var(--d-primary)',
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
              className="d-glow"
            >
              {renderSparkline(m.sparkline)}
            </div>
            {/* ASCII bar */}
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--d-text-muted)',
                fontFamily: 'var(--d-font-mono)',
              }}
            >
              [{'\u2588'.repeat(Math.floor(m.value / 5))}
              {'\u2591'.repeat(20 - Math.floor(m.value / 5))}] {m.value}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── CommandInput component ── */

function CommandInput() {
  const [history, setHistory] = useState<string[]>([
    '$ decantr status',
    'Project: terminal-dashboard | Status: healthy | Drift: 0 violations',
    '$ ',
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const cmd = input.trim();
      const responses: Record<string, string> = {
        help: 'Available commands: help, status, clear, uptime, version, metrics',
        status: 'All systems operational. 0 drift violations detected.',
        clear: '',
        uptime: 'System uptime: 14 days, 6 hours, 23 minutes',
        version: 'terminal-dashboard v2.4.1 (decantr v3.1.0)',
        metrics: 'CPU: 42% | MEM: 67% | DISK: 28% | NET: 450 Mbps',
      };

      if (cmd === 'clear') {
        setHistory(['$ ']);
      } else {
        const response = responses[cmd] || `Command not found: ${cmd}. Type "help" for options.`;
        setHistory((prev) => [...prev.slice(0, -1), `$ ${cmd}`, response, '$ ']);
      }
      setInput('');
    },
    [input]
  );

  return (
    <div className={`d-panel ${css('_flex _col')}`} style={{ height: '160px' }}>
      <div className="d-panel-header">TERMINAL</div>
      <div className={css('_flex1 _p3')} style={{ overflow: 'auto', fontSize: '0.8rem' }}>
        {history.slice(0, -1).map((line, i) => (
          <div key={i} style={{ color: line.startsWith('$') ? 'var(--d-primary)' : 'var(--d-text)' }}>
            {line}
          </div>
        ))}
        <form onSubmit={handleSubmit} className={css('_flex _aic _gap1')}>
          <span style={{ color: 'var(--d-primary)' }}>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--d-text)',
              fontFamily: 'var(--d-font-mono)',
              fontSize: '0.8rem',
              padding: 0,
              caretColor: 'var(--d-primary)',
            }}
          />
        </form>
      </div>
    </div>
  );
}

/* ── Page Component ── */

export function HomePage() {
  return (
    <div className={css('_flex _col _hfull')} style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Layout: status -> main-split -> hotkeys */}

      {/* Pattern: status */}
      <StatusBar />

      {/* Pattern: main-split */}
      <div className={css('_flex _flex1')} style={{ overflow: 'hidden' }}>
        {/* Left pane: log stream */}
        <div className={css('_flex _col _flex1')} style={{ minWidth: 0 }}>
          <LogPanel />
          <CommandInput />
        </div>

        {/* Split divider */}
        <div className="d-split-divider" />

        {/* Right pane: metrics sidebar */}
        <MetricsSidebar />
      </div>

      {/* Pattern: hotkeys */}
      <HotkeyBar />
    </div>
  );
}
