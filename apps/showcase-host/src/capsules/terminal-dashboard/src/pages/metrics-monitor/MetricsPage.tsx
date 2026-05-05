import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TerminalShell } from '@/components/TerminalShell';

// ── Sparkline helpers ──

const BRAILLE_BASE = 0x2800;
const BRAILLE_DOTS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

function toSparkline(values: number[], width: number = 30): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Normalize to 0-7 (8 vertical positions for braille, 4 rows x 2 columns)
  const normalized = values.map((v) => Math.round(((v - min) / range) * 7));

  // Pack pairs into braille characters
  const chars: string[] = [];
  for (let i = 0; i < Math.min(normalized.length - 1, width * 2); i += 2) {
    const left = normalized[i];
    const right = i + 1 < normalized.length ? normalized[i + 1] : 0;
    const leftRow = Math.min(3, Math.floor(left / 2));
    const leftCol = 0;
    const rightRow = Math.min(3, Math.floor(right / 2));
    const rightCol = 1;
    let code = BRAILLE_BASE;
    code |= BRAILLE_DOTS[leftRow][leftCol];
    code |= BRAILLE_DOTS[rightRow][rightCol];
    chars.push(String.fromCharCode(code));
  }
  return chars.join('');
}

const BLOCK_CHARS = [' ', '░', '▒', '▓', '█'];

function toBlockChart(values: number[], height: number, width: number): string[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const normalized = values.slice(-width).map((v) => ((v - min) / range) * height);

  const lines: string[] = [];
  for (let row = height - 1; row >= 0; row--) {
    let line = '';
    for (let col = 0; col < normalized.length; col++) {
      const val = normalized[col];
      if (val >= row + 1) {
        line += '█';
      } else if (val > row) {
        const frac = val - row;
        const idx = Math.min(4, Math.floor(frac * 4));
        line += BLOCK_CHARS[idx];
      } else {
        line += ' ';
      }
    }
    lines.push(line);
  }
  return lines;
}

function toGauge(value: number, max: number, width: number = 30): string {
  const filled = Math.round((value / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

// ── Data generation ──

function jitter(base: number, range: number): number {
  return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * range));
}

function generateHistory(base: number, range: number, count: number): number[] {
  const vals: number[] = [];
  let current = base;
  for (let i = 0; i < count; i++) {
    current = jitter(current, range);
    vals.push(current);
  }
  return vals;
}

interface MetricState {
  cpu: { current: number; history: number[] };
  memory: { used: number; total: number; history: number[] };
  networkIn: { current: number; history: number[] };
  networkOut: { current: number; history: number[] };
  diskRead: { current: number; history: number[] };
  diskWrite: { current: number; history: number[] };
  diskIops: number;
  diskUtil: number;
}

function initMetrics(): MetricState {
  return {
    cpu: { current: 42, history: generateHistory(42, 15, 60) },
    memory: { used: 6.2, total: 8.0, history: generateHistory(77, 5, 60) },
    networkIn: { current: 12400, history: generateHistory(12400, 4000, 60) },
    networkOut: { current: 8200, history: generateHistory(8200, 3000, 60) },
    diskRead: { current: 45, history: generateHistory(45, 20, 60) },
    diskWrite: { current: 28, history: generateHistory(28, 15, 60) },
    diskIops: 1247,
    diskUtil: 34,
  };
}

export function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricState>(initMetrics);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const newCpu = jitter(prev.cpu.current, 8);
        const newMemUsedPct = jitter((prev.memory.used / prev.memory.total) * 100, 3);
        const newMemUsed = (newMemUsedPct / 100) * prev.memory.total;
        const newNetIn = Math.max(0, prev.networkIn.current + (Math.random() - 0.48) * 3000);
        const newNetOut = Math.max(0, prev.networkOut.current + (Math.random() - 0.48) * 2000);
        const newDiskR = Math.max(0, jitter(prev.diskRead.current, 12));
        const newDiskW = Math.max(0, jitter(prev.diskWrite.current, 10));

        return {
          cpu: {
            current: newCpu,
            history: [...prev.cpu.history.slice(-59), newCpu],
          },
          memory: {
            used: newMemUsed,
            total: prev.memory.total,
            history: [...prev.memory.history.slice(-59), (newMemUsed / prev.memory.total) * 100],
          },
          networkIn: {
            current: newNetIn,
            history: [...prev.networkIn.history.slice(-59), newNetIn],
          },
          networkOut: {
            current: newNetOut,
            history: [...prev.networkOut.history.slice(-59), newNetOut],
          },
          diskRead: {
            current: newDiskR,
            history: [...prev.diskRead.history.slice(-59), newDiskR],
          },
          diskWrite: {
            current: newDiskW,
            history: [...prev.diskWrite.history.slice(-59), newDiskW],
          },
          diskIops: Math.max(0, Math.round(prev.diskIops + (Math.random() - 0.5) * 200)),
          diskUtil: Math.max(0, Math.min(100, Math.round(jitter(prev.diskUtil, 8)))),
        };
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const cpuChart = toBlockChart(metrics.cpu.history, 8, 50);
  const cpuAlert = metrics.cpu.current > 80;
  const memPct = (metrics.memory.used / metrics.memory.total) * 100;
  const memAlert = memPct > 80;

  return (
    <TerminalShell title="METRICS MONITOR">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '0.5rem',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* ── CPU Usage ── */}
        <Link
          to="/app/metrics/cpu"
          className="term-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
            padding: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.25rem',
              flexShrink: 0,
            }}
          >
            <span className="d-label">CPU USAGE</span>
            {cpuAlert && (
              <span className="d-annotation" data-status="warning">
                THRESHOLD
              </span>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem',
              marginBottom: '0.25rem',
              flexShrink: 0,
            }}
          >
            <span
              className="term-glow"
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: cpuAlert ? 'var(--d-warning)' : 'var(--d-primary)',
              }}
            >
              {metrics.cpu.current.toFixed(1)}%
            </span>
            <span className="d-label">of 100%</span>
          </div>
          <div
            className="term-canvas"
            style={{
              flex: 1,
              overflow: 'hidden',
              fontSize: '0.65rem',
              lineHeight: 1.1,
              padding: '0.25rem',
              border: '1px solid var(--d-border)',
              color: cpuAlert ? 'var(--d-warning)' : 'var(--d-primary)',
              minHeight: 0,
            }}
          >
            <pre style={{ margin: 0, fontFamily: 'inherit' }}>
              {cpuChart.join('\n')}
            </pre>
          </div>
          <div
            className="term-sparkline"
            style={{ marginTop: '0.25rem', fontSize: '0.8rem', flexShrink: 0 }}
          >
            {toSparkline(metrics.cpu.history, 30)}
          </div>
        </Link>

        {/* ── Memory Usage ── */}
        <Link
          to="/app/metrics/memory"
          className="term-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
            padding: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.25rem',
              flexShrink: 0,
            }}
          >
            <span className="d-label">MEMORY USAGE</span>
            {memAlert && (
              <span className="d-annotation" data-status="warning">
                THRESHOLD
              </span>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem',
              marginBottom: '0.25rem',
              flexShrink: 0,
            }}
          >
            <span
              className="term-glow"
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: memAlert ? 'var(--d-warning)' : 'var(--d-primary)',
              }}
            >
              {memPct.toFixed(1)}%
            </span>
            <span className="d-label">
              {metrics.memory.used.toFixed(1)} / {metrics.memory.total.toFixed(1)} GB
            </span>
          </div>

          {/* Gauge bar */}
          <div
            style={{
              fontSize: '0.8rem',
              color: memAlert ? 'var(--d-warning)' : 'var(--d-primary)',
              marginBottom: '0.25rem',
              flexShrink: 0,
            }}
          >
            [{toGauge(metrics.memory.used, metrics.memory.total, 40)}]
          </div>

          {/* Breakdown */}
          <div
            className="term-canvas"
            style={{
              flex: 1,
              overflow: 'hidden',
              padding: '0.5rem',
              border: '1px solid var(--d-border)',
              fontSize: '0.75rem',
              lineHeight: 1.8,
              minHeight: 0,
            }}
          >
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>Used:  </span>
              <span style={{ color: 'var(--d-primary)' }}>
                {metrics.memory.used.toFixed(2)} GB
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>Free:  </span>
              <span style={{ color: 'var(--d-primary)' }}>
                {(metrics.memory.total - metrics.memory.used).toFixed(2)} GB
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>Total: </span>
              <span>{metrics.memory.total.toFixed(2)} GB</span>
            </div>
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>Swap:  </span>
              <span>0.48 / 2.00 GB</span>
            </div>
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>Cache: </span>
              <span>1.82 GB</span>
            </div>
          </div>
          <div
            className="term-sparkline"
            style={{ marginTop: '0.25rem', fontSize: '0.8rem', flexShrink: 0 }}
          >
            {toSparkline(metrics.memory.history, 30)}
          </div>
        </Link>

        {/* ── Network I/O ── */}
        <Link
          to="/app/metrics/network"
          className="term-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
            padding: '0.5rem',
          }}
        >
          <div style={{ marginBottom: '0.25rem', flexShrink: 0 }}>
            <span className="d-label">NETWORK I/O</span>
          </div>

          {/* Counters */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              marginBottom: '0.5rem',
              flexShrink: 0,
            }}
          >
            <div>
              <div className="d-label" style={{ marginBottom: '0.125rem' }}>
                ▲ IN
              </div>
              <span
                className="term-glow"
                style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--d-accent)' }}
              >
                {(metrics.networkIn.current / 1024).toFixed(1)} KB/s
              </span>
            </div>
            <div>
              <div className="d-label" style={{ marginBottom: '0.125rem' }}>
                ▼ OUT
              </div>
              <span
                className="term-glow"
                style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--d-secondary)' }}
              >
                {(metrics.networkOut.current / 1024).toFixed(1)} KB/s
              </span>
            </div>
          </div>

          {/* Sparklines */}
          <div
            className="term-canvas"
            style={{
              flex: 1,
              overflow: 'hidden',
              padding: '0.5rem',
              border: '1px solid var(--d-border)',
              fontSize: '0.8rem',
              lineHeight: 1.8,
              minHeight: 0,
            }}
          >
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>IN  </span>
              <span className="term-sparkline" style={{ color: 'var(--d-accent)' }}>
                {toSparkline(metrics.networkIn.history, 35)}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>OUT </span>
              <span className="term-sparkline" style={{ color: 'var(--d-secondary)' }}>
                {toSparkline(metrics.networkOut.history, 35)}
              </span>
            </div>
            <div style={{ marginTop: '0.5rem', color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>
              <div>Total In:  {(metrics.networkIn.history.reduce((a, b) => a + b, 0) / 1024 / 1024).toFixed(1)} MB</div>
              <div>Total Out: {(metrics.networkOut.history.reduce((a, b) => a + b, 0) / 1024 / 1024).toFixed(1)} MB</div>
              <div>Packets:   {Math.round(metrics.networkIn.current / 64)}/s in, {Math.round(metrics.networkOut.current / 64)}/s out</div>
              <div>Errors:    0 dropped, 0 overruns</div>
            </div>
          </div>
        </Link>

        {/* ── Disk I/O ── */}
        <Link
          to="/app/metrics/disk"
          className="term-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
            padding: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.25rem',
              flexShrink: 0,
            }}
          >
            <span className="d-label">DISK I/O</span>
            {metrics.diskUtil > 80 && (
              <span className="d-annotation" data-status="warning">
                HIGH UTIL
              </span>
            )}
          </div>

          {/* Rates */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              marginBottom: '0.5rem',
              flexShrink: 0,
            }}
          >
            <div>
              <div className="d-label" style={{ marginBottom: '0.125rem' }}>
                READ
              </div>
              <span
                className="term-glow"
                style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--d-accent)' }}
              >
                {metrics.diskRead.current.toFixed(1)} MB/s
              </span>
            </div>
            <div>
              <div className="d-label" style={{ marginBottom: '0.125rem' }}>
                WRITE
              </div>
              <span
                className="term-glow"
                style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--d-secondary)' }}
              >
                {metrics.diskWrite.current.toFixed(1)} MB/s
              </span>
            </div>
          </div>

          {/* Detail */}
          <div
            className="term-canvas"
            style={{
              flex: 1,
              overflow: 'hidden',
              padding: '0.5rem',
              border: '1px solid var(--d-border)',
              fontSize: '0.75rem',
              lineHeight: 1.8,
              minHeight: 0,
            }}
          >
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>IOPS:        </span>
              <span style={{ color: 'var(--d-primary)' }}>{metrics.diskIops}</span>
            </div>
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>Utilization: </span>
              <span
                style={{
                  color:
                    metrics.diskUtil > 80 ? 'var(--d-warning)' : 'var(--d-primary)',
                }}
              >
                {metrics.diskUtil}%
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>Latency:     </span>
              <span>{(Math.random() * 2 + 0.5).toFixed(2)}ms avg</span>
            </div>
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>Queue depth: </span>
              <span>{Math.round(Math.random() * 4 + 1)}</span>
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <span style={{ color: 'var(--d-text-muted)' }}>R </span>
              <span className="term-sparkline" style={{ color: 'var(--d-accent)' }}>
                {toSparkline(metrics.diskRead.history, 30)}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--d-text-muted)' }}>W </span>
              <span className="term-sparkline" style={{ color: 'var(--d-secondary)' }}>
                {toSparkline(metrics.diskWrite.history, 30)}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </TerminalShell>
  );
}
