import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ShoppingBag, ShoppingCart, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { initialCart } from '@/data/mock';

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
      if (c === 'g h') { navigate('/'); keys.length = 0; }
      if (c === 'g s') { navigate('/shop'); keys.length = 0; }
      if (c === 'g c') { navigate('/cart'); keys.length = 0; }
      if (c === 'g o') { navigate('/orders'); keys.length = 0; }
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [navigate]);

  const cartCount = initialCart.reduce((a, i) => a + i.quantity, 0);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--d-bg)' }}>
      <header className="ec-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)', fontWeight: 700, fontSize: '1.05rem' }}>
            <ShoppingBag size={20} style={{ color: 'var(--d-primary)' }} />
            Vinea
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <NavLink to="/shop" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.875rem' }}>Shop</NavLink>
            <NavLink to="/orders" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.875rem' }}>Orders</NavLink>
          </nav>
        </div>

        <div style={{ flex: 1, maxWidth: 420, margin: '0 2rem', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input
            className="ec-input"
            placeholder="Search products…"
            style={{ paddingLeft: 36, background: 'var(--d-surface-muted)', border: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <NavLink to="/cart" className="d-interactive" data-variant="ghost" aria-label="Cart" style={{ padding: '0.5rem', position: 'relative' }}>
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--d-accent)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, minWidth: 16, height: 16, borderRadius: 9999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                {cartCount}
              </span>
            )}
          </NavLink>
          <div style={{ position: 'relative' }}>
            <button
              className="d-interactive"
              data-variant="ghost"
              aria-label="Account"
              style={{ padding: '0.35rem', border: 'none' }}
              onClick={() => setMenuOpen(o => !o)}
            >
              <div style={{ width: 28, height: 28, borderRadius: 9999, background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
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
                <MenuItem to="/orders" icon={<ShoppingBag size={14} />}>Orders</MenuItem>
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
