import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  to: string;
}

export function SidebarMainShell({
  children,
  title,
  navItems,
}: {
  children: React.ReactNode;
  title: string;
  navItems: NavItem[];
}) {
  const location = useLocation();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        height: 'calc(100vh - 48px)',
        background: '#000',
        color: 'var(--d-text)',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          borderRight: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
          padding: '0.75rem 0.5rem',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        <div
          className="d-label term-glow"
          style={{
            padding: '0 0.5rem 0.75rem',
            color: 'var(--d-primary)',
            borderBottom: '1px solid var(--d-border)',
            marginBottom: '0.5rem',
          }}
        >
          {title}
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.375rem 0.5rem',
                  fontSize: '0.8125rem',
                  color: active ? 'var(--d-bg)' : 'var(--d-text-muted)',
                  background: active ? 'var(--d-primary)' : 'transparent',
                  borderLeft: active ? 'none' : '2px solid transparent',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {active ? '> ' : '  '}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--d-border)',
            fontSize: '0.7rem',
            color: 'var(--d-text-muted)',
            padding: '0.75rem 0.5rem 0',
          }}
        >
          <div>esc to exit</div>
          <Link to="/pipelines" style={{ color: 'var(--d-accent)', display: 'block', marginTop: '0.25rem' }}>
            &larr; back to pipelines
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ overflowY: 'auto', padding: '1rem 1.25rem', minHeight: 0 }}>
        {children}
      </main>
    </div>
  );
}
