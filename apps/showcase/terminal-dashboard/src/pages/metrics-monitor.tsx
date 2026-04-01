import { useState, useEffect } from 'react';
import { css } from '@decantr/css';
import { useNavigate, useParams } from 'react-router-dom';

/* ── types ── */

interface MetricSeries {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  threshold: number;
  history: number[];
  status: 'ok' | 'warn' | 'critical';
}

/* ── sparkline characters ── */

const SPARK = ['\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'];
const BRAILLE_TOP = ['\u2840', '\u2844', '\u2846', '\u2847'];
const BRAILLE_BOT = ['\u2800', '\u2801', '\u2803', '\u2807'];

function sparkline(data: number[]): string {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return data
    .map((v) => {
      const idx = Math.round(((v - min) / range) * (SPARK.length - 1));
      return SPARK[idx];
    })
    .join('');
}

function brailleChart(data: number[], width: number = 40, height: number = 8): string[] {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Normalize data to height
  const normalized = data.slice(-width).map((v) => Math.round(((v - min) / range) * height));

  const lines: string[] = [];
  for (let row = height; row >= 0; row -= 2) {
    let line = '';
    for (let col = 0; col < Math.min(normalized.length, width); col++) {
      const topFilled = normalized[col] >= row;
      const botFilled = normalized[col] >= row - 1;
      if (topFilled) {
        line += BRAILLE_TOP[Math.min(3, normalized[col] - row + 1)];
      } else if (botFilled) {
        line += BRAILLE_BOT[Math.min(3, normalized[col] - (row - 1) + 1)];
      } else {
        line += '\u2800'; // blank braille
      }
    }
    lines.push(line);
  }
  return lines;
}

/* ── ASCII bar chart ── */

function asciiBar(value: number, max: number, width: number = 20): string {
  const filled = Math.round((value / max) * width);
  return '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled);
}

/* ── mock data generator ── */

function generateMetrics(): MetricSeries[] {
  return [
    {
      id: 'cpu',
      label: 'CPU Usage',
      value: Math.floor(25 + Math.random() * 55),
      unit: '%',
      min: 0,
      max: 100,
      threshold: 80,
      history: Array.from({ length: 60 }, () => Math.floor(20 + Math.random() * 60)),
      status: 'ok',
    },
    {
      id: 'memory',
      label: 'Memory',
      value: Math.floor(55 + Math.random() * 30),
      unit: '%',
      min: 0,
      max: 100,
      threshold: 85,
      history: Array.from({ length: 60 }, () => Math.floor(45 + Math.random() * 40)),
      status: 'warn',
    },
    {
      id: 'disk-io',
      label: 'Disk I/O',
      value: Math.floor(10 + Math.random() * 40),
      unit: 'MB/s',
      min: 0,
      max: 200,
      threshold: 150,
      history: Array.from({ length: 60 }, () => Math.floor(5 + Math.random() * 80)),
      status: 'ok',
    },
    {
      id: 'network',
      label: 'Network',
      value: Math.floor(200 + Math.random() * 600),
      unit: 'Mbps',
      min: 0,
      max: 1000,
      threshold: 800,
      history: Array.from({ length: 60 }, () => Math.floor(100 + Math.random() * 700)),
      status: 'ok',
    },
    {
      id: 'requests',
      label: 'Req/sec',
      value: Math.floor(800 + Math.random() * 400),
      unit: 'rps',
      min: 0,
      max: 2000,
      threshold: 1500,
      history: Array.from({ length: 60 }, () => Math.floor(600 + Math.random() * 800)),
      status: 'ok',
    },
    {
      id: 'latency',
      label: 'P99 Latency',
      value: Math.floor(20 + Math.random() * 80),
      unit: 'ms',
      min: 0,
      max: 500,
      threshold: 200,
      history: Array.from({ length: 60 }, () => Math.floor(15 + Math.random() * 120)),
      status: 'ok',
    },
    {
      id: 'errors',
      label: 'Error Rate',
      value: parseFloat((Math.random() * 2).toFixed(2)),
      unit: '%',
      min: 0,
      max: 10,
      threshold: 5,
      history: Array.from({ length: 60 }, () => parseFloat((Math.random() * 3).toFixed(2))),
      status: 'ok',
    },
    {
      id: 'connections',
      label: 'DB Conns',
      value: Math.floor(20 + Math.random() * 30),
      unit: '/50',
      min: 0,
      max: 50,
      threshold: 45,
      history: Array.from({ length: 60 }, () => Math.floor(15 + Math.random() * 35)),
      status: 'ok',
    },
  ];
}

function updateMetric(m: MetricSeries): MetricSeries {
  const delta = (Math.random() - 0.5) * (m.max * 0.1);
  const newVal = Math.max(m.min, Math.min(m.max, m.value + delta));
  const value = m.unit === '%' || m.id === 'errors' ? parseFloat(newVal.toFixed(2)) : Math.floor(newVal);
  const newHistory = [...m.history.slice(-59), value];
  const status: MetricSeries['status'] =
    value > m.threshold ? 'critical' : value > m.threshold * 0.8 ? 'warn' : 'ok';
  return { ...m, value, history: newHistory, status };
}

/* ── status color helper ── */

function statusColor(s: MetricSeries['status']): string {
  switch (s) {
    case 'critical':
      return 'var(--d-error)';
    case 'warn':
      return 'var(--d-warning)';
    default:
      return 'var(--d-primary)';
  }
}

/* ── StatusBar ── */

function StatusBar({ metrics }: { metrics: MetricSeries[] }) {
  const [time, setTime] = useState(new Date());
  const alerts = metrics.filter((m) => m.status !== 'ok').length;

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`d-status-bar ${css('_jcsb')}`}>
      <div className={css('_flex _aic _gap3')}>
        <span style={{ color: alerts > 0 ? 'var(--d-warning)' : 'var(--d-primary)' }}>&#9679;</span>
        <span>METRICS MONITOR</span>
        <span style={{ color: 'var(--d-border)' }}>|</span>
        <span>{metrics.length} metrics</span>
        {alerts > 0 && (
          <>
            <span style={{ color: 'var(--d-border)' }}>|</span>
            <span style={{ color: 'var(--d-warning)' }}>{alerts} ALERT{alerts > 1 ? 'S' : ''}</span>
          </>
        )}
      </div>
      <div className={css('_flex _aic _gap3')}>
        <span>REFRESH: 2s</span>
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

/* ── MetricGauge (single metric card) ── */

function MetricGauge({ metric, onClick }: { metric: MetricSeries; onClick?: () => void }) {
  const color = statusColor(metric.status);

  return (
    <div
      className={`d-panel ${css('_flex _col _gap3 _p3')}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header */}
      <div className={css('_flex _jcsb _aic')}>
        <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
          {metric.label}
        </span>
        <span
          style={{
            color,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
          }}
        >
          [{metric.status.toUpperCase()}]
        </span>
      </div>

      {/* Value */}
      <div className={css('_flex _aic _gap1')}>
        <span className="d-glow" style={{ color, fontSize: '1.5rem', fontWeight: 600 }}>
          {metric.value}
        </span>
        <span style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>{metric.unit}</span>
      </div>

      {/* Sparkline */}
      <div
        style={{
          color,
          fontSize: '0.6rem',
          letterSpacing: '0.02em',
          lineHeight: 1,
          overflow: 'hidden',
        }}
      >
        {sparkline(metric.history)}
      </div>

      {/* Bar gauge */}
      <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
        [{asciiBar(metric.value, metric.max)}] {((metric.value / metric.max) * 100).toFixed(0)}%
      </div>

      {/* Threshold indicator */}
      <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
        threshold: {metric.threshold}
        {metric.unit} | min: {Math.min(...metric.history).toFixed(metric.id === 'errors' ? 2 : 0)} | max:{' '}
        {Math.max(...metric.history).toFixed(metric.id === 'errors' ? 2 : 0)}
      </div>
    </div>
  );
}

/* ── Process Table ── */

function ProcessTable() {
  const processes = [
    { pid: 4821, name: 'api-server', cpu: '12.4%', mem: '256MB', status: 'running', uptime: '14d 6h' },
    { pid: 4822, name: 'worker-01', cpu: '8.2%', mem: '128MB', status: 'running', uptime: '14d 6h' },
    { pid: 4823, name: 'worker-02', cpu: '6.7%', mem: '112MB', status: 'running', uptime: '14d 6h' },
    { pid: 4824, name: 'scheduler', cpu: '2.1%', mem: '64MB', status: 'running', uptime: '14d 6h' },
    { pid: 4825, name: 'cache-layer', cpu: '4.5%', mem: '512MB', status: 'running', uptime: '14d 6h' },
    { pid: 4826, name: 'db-pool', cpu: '15.8%', mem: '1024MB', status: 'warn', uptime: '14d 6h' },
    { pid: 4827, name: 'auth-svc', cpu: '3.2%', mem: '96MB', status: 'running', uptime: '7d 12h' },
    { pid: 4828, name: 'gateway', cpu: '9.1%', mem: '192MB', status: 'running', uptime: '14d 6h' },
  ];

  return (
    <div className="d-panel" style={{ overflow: 'auto' }}>
      <div className="d-panel-header">PROCESS TABLE</div>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.75rem',
          fontFamily: 'var(--d-font-mono)',
        }}
      >
        <thead>
          <tr style={{ color: 'var(--d-text-muted)', textAlign: 'left' }}>
            <th style={{ padding: 'var(--d-gap-2) var(--d-gap-3)', borderBottom: '1px solid var(--d-border)' }}>PID</th>
            <th style={{ padding: 'var(--d-gap-2) var(--d-gap-3)', borderBottom: '1px solid var(--d-border)' }}>NAME</th>
            <th style={{ padding: 'var(--d-gap-2) var(--d-gap-3)', borderBottom: '1px solid var(--d-border)' }}>CPU</th>
            <th style={{ padding: 'var(--d-gap-2) var(--d-gap-3)', borderBottom: '1px solid var(--d-border)' }}>MEM</th>
            <th style={{ padding: 'var(--d-gap-2) var(--d-gap-3)', borderBottom: '1px solid var(--d-border)' }}>STATUS</th>
            <th style={{ padding: 'var(--d-gap-2) var(--d-gap-3)', borderBottom: '1px solid var(--d-border)' }}>UPTIME</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p) => (
            <tr key={p.pid}>
              <td style={{ padding: 'var(--d-gap-1) var(--d-gap-3)', color: 'var(--d-text-muted)' }}>{p.pid}</td>
              <td style={{ padding: 'var(--d-gap-1) var(--d-gap-3)', color: 'var(--d-primary)' }}>{p.name}</td>
              <td style={{ padding: 'var(--d-gap-1) var(--d-gap-3)' }}>{p.cpu}</td>
              <td style={{ padding: 'var(--d-gap-1) var(--d-gap-3)' }}>{p.mem}</td>
              <td
                style={{
                  padding: 'var(--d-gap-1) var(--d-gap-3)',
                  color: p.status === 'warn' ? 'var(--d-warning)' : 'var(--d-primary)',
                }}
              >
                {p.status}
              </td>
              <td style={{ padding: 'var(--d-gap-1) var(--d-gap-3)', color: 'var(--d-text-muted)' }}>{p.uptime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── MetricsPage (quad-split layout) ── */

export function MetricsPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricSeries[]>(generateMetrics);

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((prev) => prev.map(updateMetric));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={css('_flex _col _hfull')} style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Layout: status -> quad-split -> hotkeys */}

      {/* Pattern: status */}
      <StatusBar metrics={metrics} />

      {/* Pattern: quad-split */}
      <div className={css('_flex _flex1')} style={{ overflow: 'hidden' }}>
        {/* Left half: metric gauges grid */}
        <div className={css('_flex1 _p4')} style={{ overflow: 'auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--d-gap-4)',
            }}
          >
            {metrics.map((m) => (
              <MetricGauge
                key={m.id}
                metric={m}
                onClick={() => navigate(`/app/metrics/${m.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Split divider */}
        <div className="d-split-divider" />

        {/* Right half: process table + ASCII chart */}
        <div className={css('_flex _col _flex1 _gap4 _p4')} style={{ overflow: 'auto' }}>
          {/* ASCII chart for CPU */}
          <div className="d-panel">
            <div className="d-panel-header">CPU HISTORY (60s)</div>
            <pre
              className={`${css('_p3')} d-glow`}
              style={{
                margin: 0,
                fontSize: '0.65rem',
                lineHeight: 1.2,
                color: 'var(--d-primary)',
              }}
            >
              {brailleChart(metrics[0]?.history || [], 50, 8).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </pre>
          </div>

          {/* Process table */}
          <ProcessTable />
        </div>
      </div>

      {/* Pattern: hotkeys */}
      <HotkeyBar />
    </div>
  );
}

/* ── MetricDetailPage ── */

export function MetricDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricSeries[]>(generateMetrics);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => prev.map(updateMetric));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const metric = metrics.find((m) => m.id === id);

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!metric) {
    return (
      <div className={css('_flex _col _hfull')} style={{ minHeight: 'calc(100vh - 48px)' }}>
        <div className={`d-status-bar ${css('_jcsb')}`}>
          <div className={css('_flex _aic _gap3')}>
            <span style={{ color: 'var(--d-error)' }}>&#9679;</span>
            <span>METRIC NOT FOUND: {id}</span>
          </div>
        </div>
        <div className={css('_flex1 _flex _aic _jcc')}>
          <div style={{ color: 'var(--d-text-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Metric "{id}" not found</div>
            <button
              onClick={() => navigate('/app/metrics')}
              style={{
                background: 'none',
                border: '1px solid var(--d-border)',
                color: 'var(--d-primary)',
                fontFamily: 'var(--d-font-mono)',
                padding: '4px 12px',
                cursor: 'pointer',
              }}
            >
              Back to Metrics
            </button>
          </div>
        </div>
        <HotkeyBar />
      </div>
    );
  }

  const color = statusColor(metric.status);
  const avg = (metric.history.reduce((a, b) => a + b, 0) / metric.history.length).toFixed(
    metric.id === 'errors' ? 2 : 0
  );

  return (
    <div className={css('_flex _col _hfull')} style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Layout: status -> detailed-chart -> metric-detail -> hotkeys */}

      {/* Pattern: status */}
      <div className={`d-status-bar ${css('_jcsb')}`}>
        <div className={css('_flex _aic _gap3')}>
          <span style={{ color }}>&#9679;</span>
          <span>METRIC DETAIL</span>
          <span style={{ color: 'var(--d-border)' }}>|</span>
          <span style={{ color }}>{metric.label.toUpperCase()}</span>
          <span style={{ color: 'var(--d-border)' }}>|</span>
          <span>[{metric.status.toUpperCase()}]</span>
        </div>
        <div className={css('_flex _aic _gap3')}>
          <button
            onClick={() => navigate('/app/metrics')}
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
            BACK
          </button>
          <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
      </div>

      {/* Pattern: detailed-chart */}
      <div className={`d-panel ${css('_flex _col')}`} style={{ flex: '0 0 auto' }}>
        <div className="d-panel-header">
          {metric.label.toUpperCase()} - 60 SECOND HISTORY
        </div>
        <pre
          className={`${css('_p4')} d-glow`}
          style={{
            margin: 0,
            fontSize: '0.7rem',
            lineHeight: 1.3,
            color,
          }}
        >
          {brailleChart(metric.history, 60, 10).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </pre>
        <div
          className={css('_flex _jcsb _p3')}
          style={{ borderTop: '1px solid var(--d-border)', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}
        >
          <span>-60s</span>
          <span>-45s</span>
          <span>-30s</span>
          <span>-15s</span>
          <span>now</span>
        </div>
      </div>

      {/* Pattern: metric-detail */}
      <div className={css('_flex _flex1 _gap4 _p4')} style={{ overflow: 'auto' }}>
        {/* Stats panel */}
        <div className={`d-panel ${css('_flex _col _flex1')}`}>
          <div className="d-panel-header">STATISTICS</div>
          <div className={css('_flex _col _gap4 _p4')}>
            {/* Current value large display */}
            <div className={css('_flex _col _aic _gap1')}>
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>CURRENT</span>
              <span className="d-glow" style={{ color, fontSize: '2.5rem', fontWeight: 600 }}>
                {metric.value}
              </span>
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>{metric.unit}</span>
            </div>

            {/* Stats grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--d-gap-3)',
                fontSize: '0.8rem',
              }}
            >
              {[
                { label: 'MIN', value: Math.min(...metric.history).toFixed(metric.id === 'errors' ? 2 : 0) },
                { label: 'MAX', value: Math.max(...metric.history).toFixed(metric.id === 'errors' ? 2 : 0) },
                { label: 'AVG', value: avg },
                { label: 'THRESHOLD', value: `${metric.threshold}` },
              ].map((stat) => (
                <div key={stat.label} className="d-box" style={{ padding: 'var(--d-gap-3)' }}>
                  <div style={{ color: 'var(--d-text-muted)', fontSize: '0.65rem', marginBottom: '4px' }}>
                    {stat.label}
                  </div>
                  <div style={{ color: 'var(--d-text)', fontWeight: 600 }}>
                    {stat.value}
                    {metric.unit}
                  </div>
                </div>
              ))}
            </div>

            {/* Bar gauge */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginBottom: '4px' }}>
                CAPACITY GAUGE
              </div>
              <div style={{ fontSize: '0.8rem', color, fontFamily: 'var(--d-font-mono)' }}>
                [{asciiBar(metric.value, metric.max, 30)}] {((metric.value / metric.max) * 100).toFixed(1)}%
              </div>
            </div>

            {/* Sparkline */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginBottom: '4px' }}>
                SPARKLINE (60s)
              </div>
              <div className="d-glow" style={{ color, fontSize: '0.7rem', letterSpacing: '0.02em' }}>
                {sparkline(metric.history)}
              </div>
            </div>
          </div>
        </div>

        {/* Alert history / thresholds panel */}
        <div className={`d-panel ${css('_flex _col _flex1')}`}>
          <div className="d-panel-header">ALERTS & THRESHOLDS</div>
          <div className={css('_flex _col _gap4 _p4')}>
            {/* Threshold config */}
            <div className="d-box" style={{ padding: 'var(--d-gap-3)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginBottom: '8px' }}>
                THRESHOLD CONFIGURATION
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                <div className={css('_flex _jcsb')} style={{ marginBottom: '4px' }}>
                  <span style={{ color: 'var(--d-text-muted)' }}>Warning:</span>
                  <span style={{ color: 'var(--d-warning)' }}>{(metric.threshold * 0.8).toFixed(0)}{metric.unit}</span>
                </div>
                <div className={css('_flex _jcsb')} style={{ marginBottom: '4px' }}>
                  <span style={{ color: 'var(--d-text-muted)' }}>Critical:</span>
                  <span style={{ color: 'var(--d-error)' }}>{metric.threshold}{metric.unit}</span>
                </div>
                <div className={css('_flex _jcsb')}>
                  <span style={{ color: 'var(--d-text-muted)' }}>Current Status:</span>
                  <span style={{ color }}>[{metric.status.toUpperCase()}]</span>
                </div>
              </div>
            </div>

            {/* Recent alerts (simulated) */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginBottom: '8px' }}>
                RECENT EVENTS
              </div>
              {[
                { time: '14:23:01', msg: 'Threshold check passed', level: 'ok' as const },
                { time: '14:22:01', msg: 'Threshold check passed', level: 'ok' as const },
                { time: '14:21:15', msg: 'Warning threshold breached', level: 'warn' as const },
                { time: '14:20:01', msg: 'Threshold check passed', level: 'ok' as const },
                { time: '14:19:01', msg: 'Threshold check passed', level: 'ok' as const },
                { time: '14:15:42', msg: 'Critical threshold breached', level: 'critical' as const },
                { time: '14:14:01', msg: 'Warning threshold breached', level: 'warn' as const },
              ].map((evt, i) => (
                <div
                  key={i}
                  className={css('_flex _aic _gap3')}
                  style={{ fontSize: '0.75rem', lineHeight: '1.8' }}
                >
                  <span style={{ color: 'var(--d-text-muted)', minWidth: '70px' }}>{evt.time}</span>
                  <span
                    style={{
                      color:
                        evt.level === 'critical'
                          ? 'var(--d-error)'
                          : evt.level === 'warn'
                            ? 'var(--d-warning)'
                            : 'var(--d-text-muted)',
                    }}
                  >
                    {evt.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pattern: hotkeys */}
      <HotkeyBar />
    </div>
  );
}
