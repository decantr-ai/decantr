import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Zap, Search, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? 'var(--d-primary)' : 'var(--d-text-muted)',
  fontWeight: isActive ? 700 : 500,
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontFamily: 'system-ui, sans-serif',
});

export function TopNavMain() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className={css('_flex _col')} style={{ height: '100vh' }}>
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          height: 56,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'rgba(26, 0, 24, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}
      >
        <Link to="/events" className={css('_flex _aic _gap2')} style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
          <Zap size={20} style={{ color: 'var(--d-primary)', fill: 'var(--d-primary)' }} />
          <span className="display-heading gradient-pink-violet" style={{ fontSize: '1.125rem' }}>Pulse</span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop'}>
          <NavLink to="/events" style={linkStyle}>Events</NavLink>
          <NavLink to="/feed" style={linkStyle}>Feed</NavLink>
          <NavLink to="/members" style={linkStyle}>Members</NavLink>
          <NavLink to="/organizer" style={linkStyle}>Organizer</NavLink>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.4rem' }} aria-label="Search">
            <Search size={16} />
          </button>
          <Link to="/organizer" className="d-interactive" data-variant="ghost"
            style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}
            aria-label="Dashboard">
            <LayoutDashboard size={14} /> Host
          </Link>
          <button className="d-interactive" data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.4rem' }} aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="dopamine-wash-soft" style={{ flex: 1, overflowY: 'auto' }}>
        <div className={css('_flex _col _gap4')} style={{ padding: '1.5rem' }}>
          <Outlet />
        </div>
      </main>

      <style>{`@media (max-width: 767px) { .nav-desktop { display: none !important; } }`}</style>
    </div>
  );
}
