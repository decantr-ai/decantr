import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Landmark, Search, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { css } from '@decantr/css';

const navLinks = [
  { to: '/engage', label: 'Engage', match: (p: string) => p.startsWith('/engage') },
  { to: '/budget', label: 'Budget', match: (p: string) => p.startsWith('/budget') },
  { to: '/meetings', label: 'Meetings', match: (p: string) => p.startsWith('/meetings') },
  { to: '/requests', label: 'Requests', match: (p: string) => p.startsWith('/requests') },
  { to: '/settings/profile', label: 'Settings', match: (p: string) => p.startsWith('/settings') },
];

export function TopNavMain() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className={css('_flex _col')} style={{ height: '100vh' }}>
      {/* Skip Nav */}
      <a href="#main-content" className="sr-only" style={{ position: 'absolute', top: 0, left: 0, zIndex: 100, background: 'var(--d-primary)', color: '#fff', padding: '0.5rem 1rem' }}>
        Skip to main content
      </a>

      {/* Header */}
      <header
        className="gov-nav"
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--d-bg)',
          flexShrink: 0,
        }}
      >
        <NavLink
          to="/engage"
          style={{
            fontWeight: 700,
            fontSize: '1.0625rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none',
            color: 'var(--d-text)',
          }}
        >
          <div style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--d-primary)', borderRadius: 2,
          }}>
            <Landmark size={18} color="#fff" />
          </div>
          CivicPlatform
        </NavLink>

        {/* Center nav */}
        <nav className={css('_flex _aic _gap6')} style={{ fontSize: '0.875rem' }} aria-label="Primary navigation">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={() => ({
                textDecoration: 'none',
                fontWeight: link.match(location.pathname) ? 600 : 500,
                color: link.match(location.pathname) ? 'var(--d-primary)' : 'var(--d-text)',
                transition: 'color 0.15s ease',
                borderBottom: link.match(location.pathname) ? '2px solid var(--d-primary)' : '2px solid transparent',
                paddingBottom: 2,
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right */}
        <div className={css('_flex _aic _gap2')}>
          <button
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem 0.625rem', fontSize: '0.875rem', border: 'none' }}
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          {user && (
            <div className={css('_flex _aic _gap2')}>
              <div className={css('_flex _aic _gap2')} style={{ fontSize: '0.875rem' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 2,
                  background: 'var(--d-primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 600,
                }}>
                  {user.avatar}
                </div>
              </div>
              <button
                className="d-interactive"
                data-variant="ghost"
                onClick={handleLogout}
                style={{ padding: '0.375rem', border: 'none' }}
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
          {!user && (
            <NavLink
              to="/login"
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.375rem 0.625rem', fontSize: '0.875rem', textDecoration: 'none', border: 'none' }}
            >
              <User size={16} />
            </NavLink>
          )}
        </div>
      </header>

      {/* Body */}
      <main
        id="main-content"
        className="entrance-fade"
        key={location.pathname}
        style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
