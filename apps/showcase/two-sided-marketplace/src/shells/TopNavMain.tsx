import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Home, Heart, MessageCircle, Search, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function TopNavMain() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const keys: string[] = [];
    let timer: ReturnType<typeof setTimeout>;
    function handle(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keys.push(e.key);
      clearTimeout(timer);
      timer = setTimeout(() => { keys.length = 0; }, 500);
      const c = keys.join(' ');
      if (c === 'g b') { navigate('/browse'); keys.length = 0; }
      if (c === 'g s') { navigate('/seller'); keys.length = 0; }
      if (c === 'g m') { navigate('/messages'); keys.length = 0; }
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [navigate]);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--d-bg)' }}>
      <header className="nm-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)', fontWeight: 700, fontSize: '1.05rem' }}>
            <Home size={20} style={{ color: 'var(--d-primary)' }} />
            Nestable
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <NavLink to="/browse" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.875rem' }}>Browse</NavLink>
            <NavLink to="/bookings" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.875rem' }}>Trips</NavLink>
            <NavLink to="/seller" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.875rem' }}>Host</NavLink>
          </nav>
        </div>

        <div style={{ flex: 1, maxWidth: 420, margin: '0 2rem', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input
            className="nm-input"
            placeholder="Where to? Try Tahoe, Paris, beach…"
            style={{ paddingLeft: 36 }}
            onKeyDown={e => { if (e.key === 'Enter') navigate('/search'); }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <NavLink to="/favorites" className="d-interactive" data-variant="ghost" aria-label="Favorites" style={{ padding: '0.5rem' }}>
            <Heart size={18} />
          </NavLink>
          <NavLink to="/messages" className="d-interactive" data-variant="ghost" aria-label="Messages" style={{ padding: '0.5rem', position: 'relative' }}>
            <MessageCircle size={18} />
            <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: 9999, background: 'var(--d-accent)' }} />
          </NavLink>
          <div style={{ position: 'relative' }}>
            <button
              className="d-interactive"
              data-variant="ghost"
              aria-label="Account"
              style={{ padding: '0.35rem', border: 'none' }}
              onClick={() => setMenuOpen(o => !o)}
            >
              <div className="nm-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                {user?.avatar ?? 'G'}
              </div>
            </button>
            {menuOpen && (
              <div
                onMouseLeave={() => setMenuOpen(false)}
                className="d-surface"
                style={{ position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)', padding: '0.5rem', minWidth: 200, zIndex: 60, borderRadius: 'var(--d-radius-lg)', boxShadow: 'var(--d-shadow-lg)' }}
              >
                <MenuItem to="/settings/profile" icon={<User size={14} />}>Profile</MenuItem>
                <MenuItem to="/bookings" icon={<LayoutDashboard size={14} />}>Your trips</MenuItem>
                <MenuItem to="/seller" icon={<LayoutDashboard size={14} />}>Host dashboard</MenuItem>
                <div style={{ borderTop: '1px solid var(--d-border)', margin: '0.25rem 0' }} />
                <button
                  className="d-interactive"
                  data-variant="ghost"
                  onClick={() => { logout(); navigate('/login'); }}
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', fontSize: '0.85rem' }}
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="entrance-fade" style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}

function MenuItem({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="d-interactive"
      data-variant="ghost"
      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', fontSize: '0.85rem', textDecoration: 'none' }}
    >
      {icon} {children}
    </Link>
  );
}
