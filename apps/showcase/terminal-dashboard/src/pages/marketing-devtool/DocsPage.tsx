import { useState, useEffect } from 'react';
import { css } from '@decantr/css';
import { PublicShell } from '@/components/PublicShell';

/* ── TOC sections ── */
const TOC = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'installation', label: 'Installation' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts' },
  { id: 'api-reference', label: 'API Reference' },
];

/* ── Keyboard shortcuts data ── */
const SHORTCUTS = [
  { key: 'F1', action: 'Toggle help overlay' },
  { key: 'F2', action: 'Open command palette' },
  { key: 'F3', action: 'Search logs' },
  { key: 'F4', action: 'Toggle split pane' },
  { key: 'F5', action: 'Refresh metrics' },
  { key: 'F6', action: 'Cycle focus between panes' },
  { key: 'F7', action: 'Open config editor' },
  { key: 'F8', action: 'Toggle log streaming' },
  { key: 'F9', action: 'Snapshot current view' },
  { key: 'F10', action: 'Toggle fullscreen' },
  { key: 'F11', action: 'Toggle scanlines effect' },
  { key: 'F12', action: 'Open dev inspector' },
  { key: 'Ctrl+K', action: 'Quick search' },
  { key: 'Ctrl+L', action: 'Clear terminal' },
  { key: 'Ctrl+\\', action: 'Split pane vertically' },
  { key: 'Ctrl+-', action: 'Split pane horizontally' },
  { key: 'Ctrl+W', action: 'Close active pane' },
  { key: 'Ctrl+Tab', action: 'Next pane' },
];

/* ── API endpoints data ── */
const API_ENDPOINTS = [
  { method: 'GET', path: '/api/metrics', desc: 'Retrieve all system metrics (CPU, memory, disk, network)' },
  { method: 'GET', path: '/api/metrics/:id', desc: 'Retrieve a single metric by ID with historical data' },
  { method: 'GET', path: '/api/logs', desc: 'Stream or query log entries with filtering support' },
  { method: 'GET', path: '/api/logs/groups', desc: 'List log groups with aggregated severity counts' },
  { method: 'GET', path: '/api/config', desc: 'Read the current dashboard configuration object' },
  { method: 'PUT', path: '/api/config', desc: 'Update the dashboard configuration (requires auth)' },
  { method: 'GET', path: '/api/config/diff', desc: 'Compare current config against a previous version' },
  { method: 'GET', path: '/api/status', desc: 'Health check endpoint returning uptime and version' },
  { method: 'POST', path: '/api/auth/login', desc: 'Authenticate and receive a session token' },
  { method: 'POST', path: '/api/auth/logout', desc: 'Invalidate the current session token' },
];

/* ── Code block component ── */
function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div
      className="term-panel"
      style={{ borderRadius: 0, overflow: 'hidden', marginBottom: '1.5rem' }}
    >
      {label && (
        <div
          style={{
            padding: '0.5rem 1rem',
            borderBottom: '1px solid var(--d-border)',
            fontSize: '0.6875rem',
            color: 'var(--d-text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      )}
      <pre
        className="term-glow"
        style={{
          padding: '1rem',
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          color: 'var(--d-primary)',
          overflowX: 'auto',
          whiteSpace: 'pre',
          background: 'var(--d-bg)',
        }}
      >
        {children}
      </pre>
    </div>
  );
}

/* ── Section heading ── */
function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      style={{
        fontSize: '1.125rem',
        fontWeight: 700,
        color: 'var(--d-primary)',
        letterSpacing: '0.04em',
        marginBottom: '1rem',
        paddingTop: '2rem',
        borderBottom: '1px solid var(--d-border)',
        paddingBottom: '0.5rem',
      }}
    >
      {children}
    </h2>
  );
}

/* ── Active section tracker ── */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/* ── Docs Page ── */
export function DocsPage() {
  const activeSection = useActiveSection(TOC.map((t) => t.id));

  return (
    <PublicShell>
      <div
        style={{
          display: 'flex',
          maxWidth: 1080,
          margin: '0 auto',
          padding: '0 1.5rem',
          gap: '2.5rem',
        }}
        className="docs-layout"
      >
        {/* ── Sidebar ── */}
        <aside
          className="docs-sidebar"
          style={{
            width: 200,
            flexShrink: 0,
            position: 'sticky',
            top: 112,
            alignSelf: 'flex-start',
            paddingTop: '2rem',
          }}
        >
          <p
            className="d-label"
            style={{
              fontSize: '0.6875rem',
              color: 'var(--d-accent)',
              letterSpacing: '0.15em',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            ON THIS PAGE
          </p>
          <nav
            className={css('_flex _col')}
            style={{ gap: '0.125rem' }}
          >
            {TOC.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                style={{
                  display: 'block',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.8125rem',
                  color:
                    activeSection === item.id
                      ? 'var(--d-primary)'
                      : 'var(--d-text-muted)',
                  borderLeft:
                    activeSection === item.id
                      ? '2px solid var(--d-primary)'
                      : '2px solid transparent',
                  textDecoration: 'none',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            paddingTop: '2rem',
            paddingBottom: '4rem',
          }}
        >
          <h1
            className="term-glow"
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--d-primary)',
              letterSpacing: '0.06em',
              marginBottom: '0.5rem',
            }}
          >
            DOCUMENTATION
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--d-text-muted)',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}
          >
            Everything you need to install, configure, and operate Terminal
            Dashboard.
          </p>

          {/* ── Getting Started ── */}
          <SectionHeading id="getting-started">Getting Started</SectionHeading>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--d-text-muted)',
              lineHeight: 1.7,
              marginBottom: '1rem',
            }}
          >
            Terminal Dashboard is a real-time system monitoring tool built for
            developers who prefer the command line. It runs as a local web
            server and renders everything in a monospace, phosphor-green
            terminal aesthetic. You can monitor CPU, memory, and network
            metrics, stream live logs with regex filtering, and manage
            configuration files -- all from a single browser tab that looks
            and feels like a terminal.
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--d-text-muted)',
              lineHeight: 1.7,
              marginBottom: '1.5rem',
            }}
          >
            The dashboard supports split panes, keyboard-driven navigation,
            and ASCII-art visualizations. No mouse required. Every action is
            accessible via F-key shortcuts or the command palette (F2).
          </p>

          {/* ── Installation ── */}
          <SectionHeading id="installation">Installation</SectionHeading>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--d-text-muted)',
              lineHeight: 1.7,
              marginBottom: '1rem',
            }}
          >
            Install Terminal Dashboard globally via npm, then start the server
            with a single command.
          </p>
          <CodeBlock label="shell">{`$ npm install -g terminal-dashboard

$ terminal-dashboard start
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 Terminal Dashboard v1.0.0          \u2502
\u2502 Listening on http://localhost:3100 \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`}</CodeBlock>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--d-text-muted)',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            Alternatively, run it with npx without a global install:
          </p>
          <CodeBlock label="shell">{`$ npx terminal-dashboard start --port 3100`}</CodeBlock>

          {/* ── Configuration ── */}
          <SectionHeading id="configuration">Configuration</SectionHeading>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--d-text-muted)',
              lineHeight: 1.7,
              marginBottom: '1rem',
            }}
          >
            Create a <code style={{ color: 'var(--d-accent)' }}>dashboard.config.json</code> file
            in your project root. All fields are optional and fall back to
            sensible defaults.
          </p>
          <CodeBlock label="dashboard.config.json">{`{
  "port": 3100,
  "theme": "phosphor-green",
  "refreshInterval": 5000,
  "logs": {
    "sources": ["/var/log/syslog", "./app.log"],
    "maxLines": 10000,
    "severityColors": {
      "error": "#FF0000",
      "warn": "#FFB000",
      "info": "#00FF00",
      "debug": "#00AAAA"
    }
  },
  "metrics": {
    "enabled": ["cpu", "memory", "disk", "network"],
    "history": 3600,
    "sparklineWidth": 40
  },
  "panes": {
    "defaultLayout": "split-horizontal",
    "maxPanes": 6,
    "borderStyle": "single"
  },
  "auth": {
    "enabled": true,
    "sessionTimeout": 86400
  }
}`}</CodeBlock>

          {/* ── Keyboard Shortcuts ── */}
          <SectionHeading id="keyboard-shortcuts">
            Keyboard Shortcuts
          </SectionHeading>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--d-text-muted)',
              lineHeight: 1.7,
              marginBottom: '1rem',
            }}
          >
            Terminal Dashboard is fully keyboard-driven. Press{' '}
            <span className="term-hotkey" style={{ borderRadius: 0 }}>F1</span>{' '}
            at any time to see the full shortcut overlay.
          </p>
          <div
            className="term-table"
            style={{
              overflowX: 'auto',
              marginBottom: '1.5rem',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8125rem',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.625rem 1rem',
                      color: 'var(--d-accent)',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.75rem',
                      borderBottom: '1px solid var(--d-border)',
                    }}
                  >
                    KEY
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.625rem 1rem',
                      color: 'var(--d-accent)',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.75rem',
                      borderBottom: '1px solid var(--d-border)',
                    }}
                  >
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {SHORTCUTS.map((s) => (
                  <tr key={s.key}>
                    <td
                      style={{
                        padding: '0.5rem 1rem',
                        borderBottom: '1px solid var(--d-border)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        className="term-hotkey"
                        style={{
                          borderRadius: 0,
                          fontSize: '0.75rem',
                        }}
                      >
                        {s.key}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '0.5rem 1rem',
                        borderBottom: '1px solid var(--d-border)',
                        color: 'var(--d-text-muted)',
                      }}
                    >
                      {s.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── API Reference ── */}
          <SectionHeading id="api-reference">API Reference</SectionHeading>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--d-text-muted)',
              lineHeight: 1.7,
              marginBottom: '1rem',
            }}
          >
            Terminal Dashboard exposes a local REST API for programmatic access
            to metrics, logs, and configuration. All endpoints return JSON. Auth
            endpoints require no token; all others require a valid session token
            in the <code style={{ color: 'var(--d-accent)' }}>Authorization</code> header.
          </p>
          <div
            className="term-table"
            style={{
              overflowX: 'auto',
              marginBottom: '1.5rem',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8125rem',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.625rem 1rem',
                      color: 'var(--d-accent)',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.75rem',
                      borderBottom: '1px solid var(--d-border)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    METHOD
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.625rem 1rem',
                      color: 'var(--d-accent)',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.75rem',
                      borderBottom: '1px solid var(--d-border)',
                    }}
                  >
                    ENDPOINT
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.625rem 1rem',
                      color: 'var(--d-accent)',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.75rem',
                      borderBottom: '1px solid var(--d-border)',
                    }}
                  >
                    DESCRIPTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {API_ENDPOINTS.map((ep) => (
                  <tr key={`${ep.method}-${ep.path}`}>
                    <td
                      style={{
                        padding: '0.5rem 1rem',
                        borderBottom: '1px solid var(--d-border)',
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        color:
                          ep.method === 'GET'
                            ? 'var(--d-primary)'
                            : ep.method === 'PUT'
                              ? 'var(--d-secondary)'
                              : 'var(--d-accent)',
                      }}
                    >
                      {ep.method}
                    </td>
                    <td
                      style={{
                        padding: '0.5rem 1rem',
                        borderBottom: '1px solid var(--d-border)',
                        color: 'var(--d-text)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <code>{ep.path}</code>
                    </td>
                    <td
                      style={{
                        padding: '0.5rem 1rem',
                        borderBottom: '1px solid var(--d-border)',
                        color: 'var(--d-text-muted)',
                      }}
                    >
                      {ep.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CodeBlock label="example request">{`$ curl -s http://localhost:3100/api/metrics | jq .
{
  "cpu": {
    "usage": 78.2,
    "cores": 8,
    "load": [2.1, 1.8, 1.5]
  },
  "memory": {
    "used": 6841,
    "total": 16384,
    "percent": 41.7
  },
  "disk": {
    "used": 187400,
    "total": 512000,
    "percent": 36.6
  },
  "network": {
    "rx_bytes": 1482035,
    "tx_bytes": 893201,
    "connections": 42
  }
}`}</CodeBlock>
        </main>
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .docs-sidebar {
            display: none !important;
          }
          .docs-layout {
            padding: 0 1rem !important;
          }
        }
      `}</style>
    </PublicShell>
  );
}
