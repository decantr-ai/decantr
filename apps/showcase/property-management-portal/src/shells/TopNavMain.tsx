import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Wrench, FileText, CreditCard, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const tenantNav = [
  { to: '/tenant-portal', label: 'Home', icon: Home, exact: true },
  { to: '/tenant-portal/payments', label: 'Payments', icon: CreditCard, exact: false },
  { to: '/tenant-portal/maintenance', label: 'Maintenance', icon: Wrench, exact: false },
  { to: '/tenant-portal/documents', label: 'Documents', icon: FileText, exact: false },
];

export function TopNavMain() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--d-bg)' }}>
      <header className="pm-topnav" style={{ height: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/tenant-portal" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-primary)', fontWeight: 700 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 'var(--d-radius-sm)',
              background: 'linear-gradient(135deg, var(--d-primary), var(--d-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={15} color="#fff" />
            </div>
            Cornerstone
          </Link>
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            {tenantNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                style={({ isActive }) => ({
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  color: isActive ? 'var(--d-primary)' : 'var(--d-text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  borderRadius: 'var(--d-radius-sm)',
                  position: 'relative',
                })}
                data-active={
                  (item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)) ? 'true' : undefined
                }
              >
                <item.icon size={14} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {user && (
              <div className="pm-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                {user.avatar}
              </div>
            )}
            <button className="d-interactive" data-variant="ghost" onClick={handleLogout} aria-label="Sign out" style={{ padding: '0.4rem', border: 'none' }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>
      <main className="pm-fade-in" style={{ flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }} key={location.pathname}>
        <Outlet />
      </main>
    </div>
  );
}
