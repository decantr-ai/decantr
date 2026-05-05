import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  to: string;
}

export function SidebarAsideShell({
  children,
  navItems,
  aside,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  aside: React.ReactNode;
}) {
  const location = useLocation();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr 260px',
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
          XFORM
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: '0.375rem 0.5rem',
                  fontSize: '0.8125rem',
                  color: active ? 'var(--d-bg)' : 'var(--d-text-muted)',
                  background: active ? 'var(--d-primary)' : 'transparent',
                }}
              >
                {active ? '> ' : '  '}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ overflow: 'auto', padding: '0.75rem', minHeight: 0 }}>
        {children}
      </main>

      {/* Aside */}
      <aside
        style={{
          borderLeft: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
          padding: '0.75rem',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {aside}
      </aside>
    </div>
  );
}
