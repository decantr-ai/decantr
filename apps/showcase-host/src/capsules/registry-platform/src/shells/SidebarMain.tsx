import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  to: string;
  icon: string;
}

interface Props {
  onThemeToggle: () => void;
  themeMode: 'dark' | 'light';
  onLogout: () => void;
  navItems: NavItem[];
  sectionLabel: string;
  brandText?: string;
}

export default function SidebarMain({ onThemeToggle, themeMode, onLogout, navItems, sectionLabel, brandText = 'decantr' }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarWidth = collapsed ? 64 : 240;

  // Build breadcrumb from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarWidth,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
          transition: 'width 0.2s ease',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {/* Brand row — 52px */}
        <div style={{
          height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1rem', borderBottom: '1px solid var(--d-border)', flexShrink: 0,
        }}>
          {!collapsed && (
            <span className="lum-brand" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--d-text)', whiteSpace: 'nowrap' }}>
              {brandText}<span className="brand-dot">.</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.25rem 0.375rem', fontSize: '0.75rem', border: 'none', marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0 }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {!collapsed && (
            <span className="d-label" data-anchor="" style={{ marginTop: '0.5rem' }}>
              {sectionLabel}
            </span>
          )}
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className="d-interactive"
              data-variant="ghost"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
                background: isActive ? 'var(--d-surface-raised)' : 'transparent',
                color: isActive ? 'var(--d-text)' : 'var(--d-text-muted)',
                borderRadius: 'var(--d-radius-sm)',
                border: 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
                transition: 'background 0.15s ease, color 0.15s ease',
              })}
            >
              <span style={{ fontSize: '1rem', width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid var(--d-border)',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: 'var(--d-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.625rem', color: '#fff', fontWeight: 600, flexShrink: 0,
          }}>YO</div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--d-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>You</div>
              <button
                onClick={onLogout}
                style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header — 52px */}
        <header style={{
          height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', borderBottom: '1px solid var(--d-border)', background: 'var(--d-bg)', flexShrink: 0,
        }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
            {breadcrumbItems.map((item, i) => (
              <span key={item.path} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {i > 0 && <span style={{ color: 'var(--d-text-muted)' }}>/</span>}
                <span
                  onClick={() => navigate(item.path)}
                  style={{
                    color: i === breadcrumbItems.length - 1 ? 'var(--d-text)' : 'var(--d-text-muted)',
                    fontWeight: i === breadcrumbItems.length - 1 ? 500 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </span>
              </span>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onThemeToggle}
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.375rem 0.5rem', fontSize: '0.875rem', border: 'none' }}
              aria-label="Toggle theme"
            >
              {themeMode === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Body — scrollable */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div className="entrance-fade">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
