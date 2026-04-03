import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TerminalShell } from '@/components/TerminalShell';

// ── Chart helpers ──

const BLOCK_CHARS = [' ', '░', '▒', '▓', '█'];

function toBlockChart(values: number[], height: number, width: number): string[] {
  const sliced = values.slice(-width);
  const min = Math.min(...sliced);
  const max = Math.max(...sliced);
  const range = max - min || 1;
  const normalized = sliced.map((v) => ((v - min) / range) * height);

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
  const normalized = values.map((v) => Math.round(((v - min) / range) * 7));

  const chars: string[] = [];
  for (let i = 0; i < Math.min(normalized.length - 1, width * 2); i += 2) {
    const left = normalized[i];
    const right = i + 1 < normalized.length ? normalized[i + 1] : 0;
    const leftRow = Math.min(3, Math.floor(left / 2));
    const rightRow = Math.min(3, Math.floor(right / 2));
    let code = BRAILLE_BASE;
    code |= BRAILLE_DOTS[leftRow][0];
    code |= BRAILLE_DOTS[rightRow][1];
    chars.push(String.fromCharCode(code));
  }
  return chars.join('');
}

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

function computeStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avg = sum / sorted.length;
  const p95Idx = Math.floor(sorted.length * 0.95);
  const p99Idx = Math.floor(sorted.length * 0.99);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg,
    p95: sorted[p95Idx],
    p99: sorted[p99Idx],
    current: sorted[sorted.length - 1],
  };
}

// ── Metric definitions ──

interface MetricDef {
  name: string;
  unit: string;
  baseValue: number;
  jitterRange: number;
  subMetrics: Array<{
    label: string;
    baseValue: number;
    jitterRange: number;
    unit: string;
    color: string;
  }>;
  description: string;
  thresholdWarn: number;
  thresholdCrit: number;
}

const METRIC_DEFS: Record<string, MetricDef> = {
  cpu: {
    name: 'CPU Usage',
    unit: '%',
    baseValue: 42,
    jitterRange: 15,
    subMetrics: [
      { label: 'User', baseValue: 28, jitterRange: 10, unit: '%', color: 'var(--d-primary)' },
      { label: 'System', baseValue: 10, jitterRange: 5, unit: '%', color: 'var(--d-accent)' },
      { label: 'IOWait', baseValue: 3, jitterRange: 3, unit: '%', color: 'var(--d-secondary)' },
      { label: 'Steal', baseValue: 0.5, jitterRange: 0.5, unit: '%', color: 'var(--d-text-muted)' },
      { label: 'Load Avg (1m)', baseValue: 1.42, jitterRange: 0.4, unit: '', color: 'var(--d-primary)' },
      { label: 'Load Avg (5m)', baseValue: 1.28, jitterRange: 0.2, unit: '', color: 'var(--d-accent)' },
    ],
    description: 'Aggregate CPU utilization across all cores (4 vCPU, AMD EPYC 7R13)',
    thresholdWarn: 80,
    thresholdCrit: 95,
  },
  memory: {
    name: 'Memory Usage',
    unit: '%',
    baseValue: 77,
    jitterRange: 5,
    subMetrics: [
      { label: 'Heap Used', baseValue: 4.8, jitterRange: 0.5, unit: 'GB', color: 'var(--d-primary)' },
      { label: 'Heap Total', baseValue: 6.2, jitterRange: 0.3, unit: 'GB', color: 'var(--d-accent)' },
      { label: 'RSS', baseValue: 6.8, jitterRange: 0.2, unit: 'GB', color: 'var(--d-secondary)' },
      { label: 'Swap Used', baseValue: 0.48, jitterRange: 0.1, unit: 'GB', color: 'var(--d-text-muted)' },
      { label: 'Cache', baseValue: 1.82, jitterRange: 0.2, unit: 'GB', color: 'var(--d-primary)' },
      { label: 'Buffers', baseValue: 0.34, jitterRange: 0.05, unit: 'GB', color: 'var(--d-accent)' },
    ],
    description: 'Physical memory utilization (8 GB total, 2 GB swap)',
    thresholdWarn: 80,
    thresholdCrit: 95,
  },
  network: {
    name: 'Network I/O',
    unit: 'KB/s',
    baseValue: 12.4,
    jitterRange: 4,
    subMetrics: [
      { label: 'Bytes In', baseValue: 12400, jitterRange: 4000, unit: 'B/s', color: 'var(--d-accent)' },
      { label: 'Bytes Out', baseValue: 8200, jitterRange: 3000, unit: 'B/s', color: 'var(--d-secondary)' },
      { label: 'Packets In', baseValue: 194, jitterRange: 60, unit: '/s', color: 'var(--d-primary)' },
      { label: 'Packets Out', baseValue: 128, jitterRange: 40, unit: '/s', color: 'var(--d-primary)' },
      { label: 'TCP Conns', baseValue: 247, jitterRange: 30, unit: '', color: 'var(--d-accent)' },
      { label: 'Retransmits', baseValue: 0.3, jitterRange: 0.5, unit: '/s', color: 'var(--d-error)' },
    ],
    description: 'Network throughput on eth0 (1 Gbps link, MTU 1500)',
    thresholdWarn: 80,
    thresholdCrit: 95,
  },
  disk: {
    name: 'Disk I/O',
    unit: 'MB/s',
    baseValue: 45,
    jitterRange: 20,
    subMetrics: [
      { label: 'Read Rate', baseValue: 45, jitterRange: 20, unit: 'MB/s', color: 'var(--d-accent)' },
      { label: 'Write Rate', baseValue: 28, jitterRange: 15, unit: 'MB/s', color: 'var(--d-secondary)' },
      { label: 'IOPS', baseValue: 1247, jitterRange: 200, unit: '', color: 'var(--d-primary)' },
      { label: 'Queue Depth', baseValue: 2.4, jitterRange: 1.5, unit: '', color: 'var(--d-text-muted)' },
      { label: 'Avg Latency', baseValue: 1.2, jitterRange: 0.8, unit: 'ms', color: 'var(--d-primary)' },
      { label: 'Utilization', baseValue: 34, jitterRange: 12, unit: '%', color: 'var(--d-warning)' },
    ],
    description: 'Block device I/O for /dev/nvme0n1 (500 GB NVMe SSD, ext4)',
    thresholdWarn: 80,
    thresholdCrit: 95,
  },
};

interface MetricDetailState {
  history: number[];
  subMetricHistories: number[][];
}

export function MetricDetailPage() {
  const { id } = useParams<{ id: string }>();
  const metricId = id ?? 'cpu';
  const def = METRIC_DEFS[metricId] ?? METRIC_DEFS.cpu;

  const [state, setState] = useState<MetricDetailState>(() => ({
    history: generateHistory(def.baseValue, def.jitterRange, 60),
    subMetricHistories: def.subMetrics.map((sm) =>
      generateHistory(sm.baseValue, sm.jitterRange, 60),
    ),
  }));

  useEffect(() => {
    // Reset state when metric ID changes
    setState({
      history: generateHistory(def.baseValue, def.jitterRange, 60),
      subMetricHistories: def.subMetrics.map((sm) =>
        generateHistory(sm.baseValue, sm.jitterRange, 60),
      ),
    });
  }, [metricId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const lastMain = prev.history[prev.history.length - 1];
        const newMain = jitter(lastMain, def.jitterRange * 0.5);
        return {
          history: [...prev.history.slice(-59), newMain],
          subMetricHistories: prev.subMetricHistories.map((hist, i) => {
            const last = hist[hist.length - 1];
            const sm = def.subMetrics[i];
            const newVal = Math.max(0, last + (Math.random() - 0.5) * sm.jitterRange * 0.5);
            return [...hist.slice(-59), newVal];
          }),
        };
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [metricId, def]);

  const mainStats = computeStats(state.history);
  const chart = toBlockChart(state.history, 14, 70);
  const isWarn = mainStats.current > def.thresholdWarn;
  const isCrit = mainStats.current > def.thresholdCrit;

  const chartColor = isCrit
    ? 'var(--d-error)'
    : isWarn
      ? 'var(--d-warning)'
      : 'var(--d-primary)';

  return (
    <TerminalShell title={`METRICS — ${def.name.toUpperCase()}`}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '0.5rem' }}>
        {/* Header */}
        <div
          className="term-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.4rem 0.75rem',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/app/metrics"
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              ← BACK TO OVERVIEW
            </Link>
            <span className="d-label">{def.description}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isWarn && (
              <span
                className="d-annotation"
                data-status={isCrit ? 'error' : 'warning'}
              >
                {isCrit ? 'CRITICAL' : 'WARNING'}: {mainStats.current.toFixed(1)}{def.unit} &gt; {isCrit ? def.thresholdCrit : def.thresholdWarn}{def.unit}
              </span>
            )}
            <span
              className="term-glow"
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: chartColor,
              }}
            >
              {mainStats.current.toFixed(1)}{def.unit}
            </span>
          </div>
        </div>

        {/* Large ASCII Chart */}
        <div
          className="term-panel"
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
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
            <span className="d-label">HISTORICAL — LAST 60 SAMPLES</span>
            <span className="d-label" style={{ color: chartColor }}>
              {toSparkline(state.history, 20)}
            </span>
          </div>

          {/* Y-axis labels + chart */}
          <div
            className="term-canvas"
            style={{
              flex: 1,
              overflow: 'hidden',
              border: '1px solid var(--d-border)',
              padding: '0.25rem 0.5rem',
              display: 'flex',
              minHeight: 0,
            }}
          >
            {/* Y-axis */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingRight: '0.5rem',
                fontSize: '0.6rem',
                color: 'var(--d-text-muted)',
                flexShrink: 0,
                lineHeight: 1.1,
              }}
            >
              <span>{mainStats.max.toFixed(1)}</span>
              <span>{((mainStats.max + mainStats.min) / 2).toFixed(1)}</span>
              <span>{mainStats.min.toFixed(1)}</span>
            </div>

            {/* Chart area */}
            <div
              style={{
                flex: 1,
                overflow: 'hidden',
                borderLeft: '1px solid var(--d-border)',
                paddingLeft: '0.25rem',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: 'inherit',
                  fontSize: '0.6rem',
                  lineHeight: 1.1,
                  color: chartColor,
                }}
              >
                {chart.join('\n')}
              </pre>
            </div>
          </div>

          {/* X-axis */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.6rem',
              color: 'var(--d-text-muted)',
              marginTop: '0.125rem',
              paddingLeft: '3rem',
              flexShrink: 0,
            }}
          >
            <span>-90s</span>
            <span>-60s</span>
            <span>-30s</span>
            <span>now</span>
          </div>
        </div>

        {/* Stats + Sub-metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            flexShrink: 0,
          }}
        >
          {/* Stats Table */}
          <div className="term-panel" style={{ padding: '0.5rem' }}>
            <div className="d-label" style={{ marginBottom: '0.25rem' }}>
              STATISTICS
            </div>
            <table className="term-table" style={{ width: '100%', fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th className="d-data-header" style={{ textAlign: 'left' }}>Stat</th>
                  <th className="d-data-header" style={{ textAlign: 'right' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Current', value: mainStats.current, highlight: true },
                  { label: 'Minimum', value: mainStats.min, highlight: false },
                  { label: 'Maximum', value: mainStats.max, highlight: false },
                  { label: 'Average', value: mainStats.avg, highlight: false },
                  { label: 'P95', value: mainStats.p95, highlight: false },
                  { label: 'P99', value: mainStats.p99, highlight: false },
                ].map((row) => (
                  <tr key={row.label} className="d-data-row">
                    <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>
                      {row.label}
                    </td>
                    <td
                      className="d-data-cell"
                      style={{
                        textAlign: 'right',
                        color: row.highlight ? chartColor : 'var(--d-text)',
                        fontWeight: row.highlight ? 700 : 400,
                      }}
                    >
                      {row.value.toFixed(2)} {def.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sub-metrics */}
          <div className="term-panel" style={{ padding: '0.5rem' }}>
            <div className="d-label" style={{ marginBottom: '0.25rem' }}>
              SUB-METRICS
            </div>
            <table className="term-table" style={{ width: '100%', fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th className="d-data-header" style={{ textAlign: 'left' }}>Metric</th>
                  <th className="d-data-header" style={{ textAlign: 'right' }}>Value</th>
                  <th className="d-data-header" style={{ textAlign: 'right' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {def.subMetrics.map((sm, idx) => {
                  const hist = state.subMetricHistories[idx];
                  const current = hist[hist.length - 1];
                  return (
                    <tr key={sm.label} className="d-data-row">
                      <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>
                        {sm.label}
                      </td>
                      <td
                        className="d-data-cell"
                        style={{ textAlign: 'right', color: sm.color }}
                      >
                        {current.toFixed(2)} {sm.unit}
                      </td>
                      <td
                        className="d-data-cell term-sparkline"
                        style={{ textAlign: 'right', color: sm.color, fontSize: '0.7rem' }}
                      >
                        {toSparkline(hist, 12)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}
