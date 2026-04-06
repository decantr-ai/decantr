import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  FlaskConical,
  ChevronLeft,
  LogOut,
  TestTubes,
  Microscope,
  Calendar,
  Database,
  BookOpen,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/notebook', icon: BookOpen, label: 'Notebook' },
  { to: '/experiments', icon: TestTubes, label: 'Experiments' },
  { to: '/samples', icon: Microscope, label: 'Samples' },
  { to: '/instruments', icon: Calendar, label: 'Instruments' },
  { to: '/datasets', icon: Database, label: 'Datasets' },
  { to: '/settings/profile', icon: Settings, label: 'Settings' },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const sidebarWidth = collapsed ? 56 : 220;

  return (
    <div className={css('_flex')} style={{ height: '100vh' }}>
      {/* Sidebar */}
      <aside
        className={css('_flex _col _shrink0')}
        style={{
          width: sidebarWidth,
          background: '#fff',
          borderRight: '1px solid var(--d-border)',
          transition: 'width 150ms linear',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div
          className={css('_flex _aic _jcsb _shrink0')}
          style={{ height: 48, padding: '0 0.75rem', borderBottom: '1px solid var(--d-border)' }}
        >
          {!collapsed && (
            <Link
              to="/notebook"
              className={css('_flex _aic _gap2')}
              style={{ textDecoration: 'none', color: 'var(--d-text)' }}
            >
              <FlaskConical size={16} style={{ color: 'var(--d-primary)' }} />
              <span className={css('_fontmedium')} style={{ fontSize: '0.8125rem' }}>Lab</span>
            </Link>
          )}
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.25rem', marginLeft: collapsed ? 'auto' : undefined, marginRight: collapsed ? 'auto' : undefined }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={14}
              style={{ transform: collapsed ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className={css('_flex _col _gap1')} style={{ padding: '0.375rem', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className="d-interactive"
                data-variant="ghost"
                style={{
                  justifyContent: collapsed ? 'center' : undefined,
                  padding: '0.375rem 0.625rem',
                  textDecoration: 'none',
                  borderRadius: 2,
                  background: isActive ? 'color-mix(in srgb, var(--d-primary) 8%, transparent)' : undefined,
                  color: isActive ? 'var(--d-primary)' : undefined,
                }}
              >
                <item.icon size={15} />
                {!collapsed && <span style={{ fontSize: '0.8125rem' }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className={css('_flex _aic _gap2')}
          style={{ padding: '0.375rem', borderTop: '1px solid var(--d-border)', justifyContent: collapsed ? 'center' : undefined }}
        >
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.375rem 0.625rem', width: collapsed ? 'auto' : '100%', justifyContent: collapsed ? 'center' : undefined }}
            aria-label="Sign out"
          >
            <LogOut size={15} />
            {!collapsed && <span style={{ fontSize: '0.8125rem' }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={css('_flex _col')} style={{ flex: 1, overflow: 'hidden' }}>
        <main className="entrance-fade" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
