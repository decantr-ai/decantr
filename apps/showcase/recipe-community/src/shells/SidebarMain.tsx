import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import { ChefHat, BookOpen, Plus, ChevronLeft, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { label: 'New Recipe', icon: Plus, href: '/recipes/create' },
  { label: 'My Recipes', icon: BookOpen, href: '/my-recipes' },
  { label: 'Settings', icon: Settings, href: '/settings/profile' },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div className={css('_flex')} style={{ height: '100vh' }}>
      <aside
        className={css('_flex _col _shrink0')}
        style={{
          width: sidebarWidth,
          background: 'var(--d-surface)',
          borderRight: '1px solid var(--d-border)',
          transition: 'width 200ms ease',
          overflow: 'hidden',
        }}
      >
        <div className={css('_flex _aic _jcsb _shrink0')}
          style={{ height: 52, padding: '0 1rem', borderBottom: '1px solid var(--d-border)' }}>
          {!collapsed && (
            <Link to="/my-recipes" className={css('_flex _aic _gap2')}
              style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
              <ChefHat size={18} style={{ color: 'var(--d-primary)' }} />
              <span className="serif-display" style={{ fontSize: '0.9375rem', whiteSpace: 'nowrap' }}>Gather</span>
            </Link>
          )}
          <button className="d-interactive" data-variant="ghost" onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.25rem', marginLeft: collapsed ? 'auto' : undefined, marginRight: collapsed ? 'auto' : undefined }}
            aria-label={collapsed ? 'Expand' : 'Collapse'}>
            <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : undefined, transition: 'transform 200ms' }} />
          </button>
        </div>

        <nav className={css('_flex _col _gap1')} style={{ padding: '0.5rem', flex: 1 }}>
          <span className="d-label" style={{ padding: '0.375rem 0.75rem', marginBottom: '0.25rem',
            display: collapsed ? 'none' : undefined, borderLeft: '2px solid var(--d-accent)', marginLeft: '0.25rem' }}>Kitchen</span>
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} className="d-interactive" data-variant="ghost"
                style={{
                  justifyContent: collapsed ? 'center' : undefined,
                  padding: '0.375rem 0.75rem',
                  textDecoration: 'none',
                  borderRadius: 'var(--d-radius-sm)',
                  background: active ? 'var(--d-surface-raised)' : undefined,
                  color: active ? 'var(--d-primary)' : undefined,
                  fontWeight: active ? 600 : undefined,
                  fontFamily: 'system-ui, sans-serif',
                }}>
                <item.icon size={16} />
                {!collapsed && <span className={css('_textsm')}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={css('_flex _aic _gap2')}
          style={{ padding: '0.5rem', borderTop: '1px solid var(--d-border)', justifyContent: collapsed ? 'center' : undefined }}>
          <button className="d-interactive" data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.375rem 0.75rem', width: collapsed ? 'auto' : '100%', justifyContent: collapsed ? 'center' : undefined, fontFamily: 'system-ui, sans-serif' }}
            aria-label="Sign out">
            <LogOut size={16} />
            {!collapsed && <span className={css('_textsm')}>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className={css('_flex _col')} style={{ flex: 1, overflow: 'hidden' }}>
        <header className={css('_flex _aic _jcsb _shrink0')}
          style={{ height: 52, padding: '0 1.5rem', borderBottom: '1px solid var(--d-border)', background: 'var(--d-bg)' }}>
          <div className={css('_flex _aic _gap2')}>
            <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>My Kitchen</span>
          </div>
          <Link to="/recipes" className={css('_textsm')}
            style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>
            ← Back to Browse
          </Link>
        </header>
        <main className="entrance-fade" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
