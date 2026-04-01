/**
 * Placeholder pages for terminal-dashboard showcase.
 * Each stub renders the route name so we can verify routing works.
 */

function Stub({ title, section }: { title: string; section: string }) {
  return (
    <div
      style={{
        padding: '48px',
        textAlign: 'center',
        color: 'var(--d-text-muted)',
        fontFamily: 'var(--d-font-mono)',
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 8,
          color: 'var(--d-text)',
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 13 }}>Section: {section}</p>
    </div>
  );
}

// terminal-home section
export function HomePage() {
  return <Stub title="Terminal Home" section="terminal-home" />;
}

// log-viewer section
export function LogsPage() {
  return <Stub title="Log Viewer" section="log-viewer" />;
}

export function GroupedLogsPage() {
  return <Stub title="Grouped Logs" section="log-viewer" />;
}

// metrics-monitor section
export function MetricsPage() {
  return <Stub title="Metrics Monitor" section="metrics-monitor" />;
}

export function MetricDetailPage() {
  return <Stub title="Metric Detail" section="metrics-monitor" />;
}

// config-editor section
export function ConfigPage() {
  return <Stub title="Config Editor" section="config-editor" />;
}

export function ConfigDiffPage() {
  return <Stub title="Config Diff" section="config-editor" />;
}

// marketing-devtool section
export function LandingPage() {
  return <Stub title="Terminal Dashboard" section="marketing-devtool" />;
}

export function DocsPage() {
  return <Stub title="Documentation" section="marketing-devtool" />;
}

// auth-full section
export function LoginPage() {
  return <Stub title="Login" section="auth-full" />;
}

export function RegisterPage() {
  return <Stub title="Register" section="auth-full" />;
}

// legal section
export function PrivacyPage() {
  return <Stub title="Privacy Policy" section="legal" />;
}

export function TermsPage() {
  return <Stub title="Terms of Service" section="legal" />;
}

export function CookiesPage() {
  return <Stub title="Cookie Policy" section="legal" />;
}
