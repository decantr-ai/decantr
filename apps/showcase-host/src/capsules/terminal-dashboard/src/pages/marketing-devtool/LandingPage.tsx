import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { PublicShell } from '@/components/PublicShell';

/* ── Feature data ── */
const FEATURES = [
  {
    icon: '\u2590\u2584\u258C',
    title: 'Split Panes',
    desc: 'Resizable terminal panes with drag handles. Tile horizontally, vertically, or in a custom grid layout.',
  },
  {
    icon: '\u25B6\u2592',
    title: 'Log Streaming',
    desc: 'Real-time log viewer with regex filtering, severity coloring, and auto-scroll. Tail any file or process.',
  },
  {
    icon: '\u2581\u2583\u2585\u2587',
    title: 'ASCII Charts',
    desc: 'Beautiful terminal-native visualizations using braille, block, and box-drawing characters.',
  },
  {
    icon: '\u2588\u2593\u2591',
    title: 'Metrics Monitor',
    desc: 'CPU, memory, disk, and network at a glance. Sparkline history with configurable polling intervals.',
  },
  {
    icon: '{;}',
    title: 'Config Editor',
    desc: 'Edit JSON, YAML, and TOML configs with syntax highlighting, validation, and inline diff preview.',
  },
  {
    icon: 'F1',
    title: 'Keyboard Shortcuts',
    desc: 'Full keyboard navigation with F-keys, Vim bindings, and a searchable command palette.',
  },
];

/* ── Typewriter hook ── */
function useTypewriter(text: string, speed = 60) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setDone(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

/* ── Metrics preview data ── */
const METRICS_ROWS = [
  { label: 'CPU Usage', value: 67, unit: '%', spark: '\u28C0\u28E4\u28F6\u28FF\u28FF\u28F6\u28E4\u28C0\u28E4\u28F6' },
  { label: 'Memory', value: 52, unit: '%', spark: '\u28FF\u28FF\u28F6\u28E4\u28C0\u28E4\u28F6\u28FF\u28FF\u28F6' },
  { label: 'Disk I/O', value: 23, unit: '%', spark: '\u28C0\u28C0\u28E4\u28F6\u28FF\u28FF\u28F6\u28E4\u28C0\u28C0' },
  { label: 'Network', value: 41, unit: '%', spark: '\u28F6\u28FF\u28FF\u28F6\u28E4\u28C0\u28C0\u28E4\u28F6\u28FF' },
  { label: 'Latency', value: 142, unit: 'ms', spark: '\u28E4\u28F6\u28FF\u28FF\u28F6\u28E4\u28C0\u28C0\u28E4\u28F6' },
  { label: 'Requests/s', value: 847, unit: '', spark: '\u28C0\u28E4\u28F6\u28FF\u28FF\u28FF\u28FF\u28F6\u28E4\u28F6' },
];

function makeBar(pct: number, width: number) {
  const filled = Math.round((pct / 100) * width);
  return '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled);
}

const BRAILLE_LEVELS = [' ', '\u2840', '\u28C0', '\u28E0', '\u28E4', '\u28F4', '\u28F6', '\u28FE', '\u28FF'];

function pickBraille(v: number, max: number) {
  const idx = Math.round((v / max) * (BRAILLE_LEVELS.length - 1));
  return BRAILLE_LEVELS[Math.max(0, Math.min(BRAILLE_LEVELS.length - 1, idx))];
}

function MetricsPreview() {
  const barWidth = 20;
  const sparkLen = 10;
  const [latency, setLatency] = useState(142);
  const [latencyHistory, setLatencyHistory] = useState<number[]>(() => {
    const h: number[] = [];
    for (let i = 0; i < sparkLen; i++) h.push(100 + Math.random() * 120);
    return h;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setLatency((prev) => {
        const delta = (Math.random() - 0.48) * 40;
        return Math.max(30, Math.min(380, Math.round(prev + delta)));
      });
      setLatencyHistory((prev) => {
        const next = [...prev.slice(1), 100 + Math.random() * 120];
        return next;
      });
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const BOX_W = 62;
  const top = '\u250C' + '\u2500'.repeat(BOX_W) + '\u2510';
  const bot = '\u2514' + '\u2500'.repeat(BOX_W) + '\u2518';

  function row(label: string, value: number, unit: string, spark: string) {
    const pct = unit === '%' ? value : Math.min(100, (value / 400) * 100);
    const valStr = `${value}${unit}`.padStart(7);
    const lbl = label.padEnd(12);
    const bar = makeBar(pct, barWidth);
    const inner = `  ${lbl}${valStr}  ${bar}  ${spark}  `;
    const pad = BOX_W - inner.length;
    return '\u2502' + inner + ' '.repeat(Math.max(0, pad)) + '\u2502';
  }

  const latencySpark = latencyHistory.map((v) => pickBraille(v, 400)).join('');

  return (
    <pre
      style={{
        fontSize: '0.8125rem',
        lineHeight: 1.7,
        color: 'var(--d-primary)',
        whiteSpace: 'pre',
        margin: 0,
      }}
    >
      {top + '\n'}
      {METRICS_ROWS.filter((m) => m.label !== 'Latency').map((m) =>
        row(m.label, m.value, m.unit, m.spark) + '\n',
      ).join('')}
      <span style={{ color: latency > 250 ? 'var(--d-error)' : latency > 180 ? 'var(--d-secondary)' : 'var(--d-primary)' }}>
        {row('Latency', latency, 'ms', latencySpark)}
      </span>
      {'\n'}
      {METRICS_ROWS.filter((m) => m.label === 'Requests/s').length > 0 &&
        row('Requests/s', 847, '', METRICS_ROWS[5].spark) + '\n'}
      {bot}
    </pre>
  );
}

/* ── Terminal demo lines ── */
const TERMINAL_LINES = [
  { text: '$ decantr status', delay: 0 },
  { text: '\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510', delay: 400 },
  { text: '\u2502 TERMINAL DASHBOARD v1.0             \u2502', delay: 500 },
  { text: '\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524', delay: 600 },
  { text: '\u2502 Status:    \u25CF CONNECTED              \u2502', delay: 800 },
  { text: '\u2502 Uptime:    14d 7h 23m               \u2502', delay: 1000 },
  { text: '\u2502 CPU:       \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591 78%           \u2502', delay: 1200 },
  { text: '\u2502 Memory:    \u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591 52%           \u2502', delay: 1400 },
  { text: '\u2502 Processes: 142 running              \u2502', delay: 1600 },
  { text: '\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518', delay: 1800 },
];

/* ── Terminal Demo component ── */
function TerminalDemo() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERMINAL_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => setVisibleCount(i + 1), line.delay)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="term-canvas"
      style={{
        padding: '1.5rem',
        border: '1px solid var(--d-border)',
        maxWidth: 520,
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.75rem',
          color: 'var(--d-text-muted)',
        }}
      >
        <span>\u25CF</span>
        <span>\u25CF</span>
        <span>\u25CF</span>
        <span style={{ marginLeft: 'auto' }}>bash - 80x24</span>
      </div>
      <pre
        className="term-glow"
        style={{
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          color: 'var(--d-primary)',
          whiteSpace: 'pre',
          overflow: 'hidden',
        }}
      >
        {TERMINAL_LINES.slice(0, visibleCount).map((line, i) => (
          <div key={i}>
            {i === 0 ? (
              <span style={{ color: 'var(--d-accent)' }}>{line.text}</span>
            ) : i === 4 ? (
              <span>
                {'\u2502 Status:    '}
                <span style={{ color: '#00FF00' }}>{'\u25CF'}</span>
                {' CONNECTED              \u2502'}
              </span>
            ) : (
              line.text
            )}
          </div>
        ))}
        {visibleCount < TERMINAL_LINES.length && (
          <span className="term-blink">{'\u2588'}</span>
        )}
      </pre>
    </div>
  );
}

/* ── Landing Page ── */
export function LandingPage() {
  const navigate = useNavigate();
  const headline = 'MONITOR YOUR SYSTEMS';
  const { displayed, done } = useTypewriter(headline, 55);

  function handleViewDemo() {
    localStorage.setItem('decantr_authenticated', 'true');
    navigate('/app');
  }

  return (
    <PublicShell>
      {/* ═══════ HERO ═══════ */}
      <section
        className="d-section"
        style={{
          position: 'relative',
          padding: '5rem 1.5rem',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Radial gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(0,255,0,0.06) 0%, rgba(0,255,255,0.03) 40%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <h1
            className="term-glow term-type"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              lineHeight: 1.1,
              color: 'var(--d-primary)',
              marginBottom: '1.25rem',
              minHeight: '1.2em',
            }}
          >
            {displayed}
            {!done && <span className="term-blink">{'\u2588'}</span>}
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',
              color: 'var(--d-text-muted)',
              maxWidth: 540,
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}
          >
            Real-time terminal dashboard for developers who think in command
            lines. Monitor processes, stream logs, and visualize metrics --
            all from your terminal.
          </p>
          <div
            className={css('_flex _gap4')}
            style={{ justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              to="/register"
              className="d-interactive"
              data-variant="primary"
              style={{
                padding: '0.75rem 1.75rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                borderRadius: 0,
                letterSpacing: '0.04em',
              }}
            >
              Get Started
            </Link>
            <button
              type="button"
              className="d-interactive"
              data-variant="ghost"
              onClick={handleViewDemo}
              style={{
                padding: '0.75rem 1.75rem',
                fontSize: '0.9375rem',
                borderRadius: 0,
                letterSpacing: '0.04em',
                border: '1px solid var(--d-border)',
              }}
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section
        className="d-section"
        style={{
          padding: '4rem 1.5rem',
          maxWidth: 1080,
          margin: '0 auto',
        }}
      >
        <p
          className="d-label"
          style={{
            textAlign: 'center',
            color: 'var(--d-accent)',
            letterSpacing: '0.15em',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '2.5rem',
          }}
        >
          CAPABILITIES
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
          }}
          className="features-grid"
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="term-panel"
              style={{
                padding: '1.5rem',
                borderRadius: 0,
                animation: `featureFadeIn 0.4s ease ${i * 80}ms both`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,255,255,0.08)',
                  border: '1px solid rgba(0,255,255,0.2)',
                  color: 'var(--d-accent)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.02em',
                }}
              >
                {f.icon}
              </div>
              <h4
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--d-text)',
                  marginBottom: '0.375rem',
                }}
              >
                {f.title}
              </h4>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--d-text-muted)',
                  lineHeight: 1.5,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ DEMO TERMINAL ═══════ */}
      <section
        className="d-section"
        style={{
          padding: '4rem 1.5rem',
          borderTop: '1px solid var(--d-border)',
          borderBottom: '1px solid var(--d-border)',
        }}
      >
        <p
          className="d-label"
          style={{
            textAlign: 'center',
            color: 'var(--d-accent)',
            letterSpacing: '0.15em',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '2rem',
          }}
        >
          LIVE TERMINAL PREVIEW
        </p>
        <TerminalDemo />
      </section>

      {/* ═══════ DEMO CHART ═══════ */}
      <section
        className="d-section"
        style={{
          padding: '4rem 1.5rem',
          borderBottom: '1px solid var(--d-border)',
        }}
      >
        <p
          className="d-label"
          style={{
            textAlign: 'center',
            color: 'var(--d-accent)',
            letterSpacing: '0.15em',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '2rem',
          }}
        >
          LIVE METRICS PREVIEW
        </p>
        <div
          className="term-canvas"
          style={{
            maxWidth: 640,
            margin: '0 auto',
            padding: '1.5rem',
            border: '1px solid var(--d-border)',
            overflowX: 'auto',
          }}
        >
          <MetricsPreview />
        </div>
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--d-text-muted)',
            marginTop: '1rem',
          }}
        >
          Updated every 5s {'\u00B7'} Braille sparklines {'\u00B7'} Block bar
          charts {'\u00B7'} Box-drawing tables
        </p>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section
        className="d-section"
        style={{
          position: 'relative',
          padding: '5rem 1.5rem',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(0,255,0,0.05) 0%, rgba(0,255,255,0.04) 50%, rgba(255,176,0,0.03) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <h2
            className="term-glow"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--d-primary)',
              marginBottom: '1rem',
            }}
          >
            Ready to take control?
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--d-text-muted)',
              lineHeight: 1.6,
              maxWidth: 540,
              margin: '0 auto 2rem',
            }}
          >
            Split panes, real-time logs, ASCII charts, and full keyboard
            navigation. Everything you need to monitor your systems without
            leaving the terminal.
          </p>
          <div
            className={css('_flex _gap4')}
            style={{ justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              to="/register"
              className="d-interactive"
              data-variant="primary"
              style={{
                padding: '0.75rem 2rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                borderRadius: 0,
                letterSpacing: '0.04em',
              }}
            >
              Start Monitoring
            </Link>
          </div>
          <p
            style={{
              marginTop: '1.25rem',
              fontSize: '0.75rem',
              color: 'var(--d-text-muted)',
              letterSpacing: '0.02em',
            }}
          >
            Free for personal use. No credit card required.
          </p>
        </div>
      </section>

      {/* ── Responsive + animation styles ── */}
      <style>{`
        @keyframes featureFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </PublicShell>
  );
}
