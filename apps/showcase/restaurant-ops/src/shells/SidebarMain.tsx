import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  UtensilsCrossed, LayoutGrid, ChefHat, BookOpen, Package,
  UserCheck, Heart, BarChart3, ChevronLeft, LogOut, Settings,
  Users, DollarSign,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const navSections = [
  { label: 'Front of House', items: [
    { label: 'Floor Map', icon: LayoutGrid, href: '/floor' },
    { label: 'Reservations', icon: Users, href: '/floor/reservations' },
  ]},
  { label: 'Kitchen', items: [
    { label: 'KDS', icon: ChefHat, href: '/kitchen' },
    { label: 'Stations', icon: ChefHat, href: '/kitchen/stations' },
  ]},
  { label: 'Menu', items: [
    { label: 'Menus', icon: BookOpen, href: '/menus' },
    { label: 'Engineering', icon: BarChart3, href: '/menus/engineering' },
  ]},
  { label: 'Back of House', items: [
    { label: 'Inventory', icon: Package, href: '/inventory' },
    { label: 'Orders', icon: Package, href: '/inventory/orders' },
  ]},
  { label: 'Staff', items: [
    { label: 'My Shift', icon: UserCheck, href: '/shift' },
    { label: 'Tips', icon: DollarSign, href: '/shift/tips' },
  ]},
  { label: 'Guests', items: [
    { label: 'Customers', icon: Heart, href: '/customers' },
    { label: 'Loyalty', icon: Heart, href: '/customers/loyalty' },
  ]},
  { label: 'Management', items: [
    { label: 'Dashboard', icon: BarChart3, href: '/ops' },
    { label: 'Reports', icon: BarChart3, href: '/ops/reports' },
    { label: 'Settings', icon: Settings, href: '/settings/profile' },
  ]},
];

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? 'var(--d-primary)' : 'var(--d-text-muted)',
  fontWeight: isActive ? 600 : 400,
  textDecoration: 'none' as const,
  fontSize: '0.8125rem',
  fontFamily: 'system-ui, sans-serif',
});

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const sidebarWidth = collapsed ? 56 : 224;

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
          style={{ height: 52, padding: '0 0.75rem', borderBottom: '1px solid var(--d-border)' }}>
          {!collapsed && (
            <Link to="/floor" className={css('_flex _aic _gap2')}
              style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
              <UtensilsCrossed size={18} style={{ color: 'var(--d-primary)' }} />
              <span className="bistro-handwritten" style={{ fontSize: '0.9375rem', whiteSpace: 'nowrap' }}>Tavola</span>
            </Link>
          )}
          <button className="d-interactive" data-variant="ghost" onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.25rem', marginLeft: collapsed ? 'auto' : undefined, marginRight: collapsed ? 'auto' : undefined }}
            aria-label={collapsed ? 'Expand' : 'Collapse'}>
            <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : undefined, transition: 'transform 200ms' }} />
          </button>
        </div>

        <nav className={css('_flex _col _gap1')} style={{ padding: '0.375rem', flex: 1, overflowY: 'auto' }}>
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <span className="d-label" style={{
                  padding: '0.5rem 0.625rem 0.25rem',
                  display: 'block',
                  fontSize: '0.6rem',
                }}>{section.label}</span>
              )}
              {section.items.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href} className="d-interactive" data-variant="ghost"
                    style={{
                      justifyContent: collapsed ? 'center' : undefined,
                      padding: '0.3rem 0.625rem',
                      textDecoration: 'none',
                      borderRadius: 'var(--d-radius-sm)',
                      background: active ? 'var(--d-surface-raised)' : undefined,
                      color: active ? 'var(--d-primary)' : undefined,
                      fontWeight: active ? 600 : undefined,
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '0.8125rem',
                      width: '100%',
                    }}>
                    <item.icon size={15} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={css('_flex _aic _gap2')}
          style={{ padding: '0.5rem', borderTop: '1px solid var(--d-border)', justifyContent: collapsed ? 'center' : undefined }}>
          <button className="d-interactive" data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.3rem 0.625rem', width: collapsed ? 'auto' : '100%', justifyContent: collapsed ? 'center' : undefined, fontFamily: 'system-ui, sans-serif', fontSize: '0.8125rem' }}
            aria-label="Sign out">
            <LogOut size={15} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className={css('_flex _col')} style={{ flex: 1, overflow: 'hidden' }}>
        <header className={css('_flex _aic _jcsb _shrink0')}
          style={{ height: 52, padding: '0 1.5rem', borderBottom: '1px solid var(--d-border)', background: 'var(--d-bg)' }}>
          <div className={css('_flex _aic _gap3')}>
            <NavLink to="/floor" style={linkStyle}>Floor</NavLink>
            <NavLink to="/kitchen" style={linkStyle}>Kitchen</NavLink>
            <NavLink to="/menus" style={linkStyle}>Menu</NavLink>
            <NavLink to="/ops" style={linkStyle}>Ops</NavLink>
          </div>
          <div className={css('_flex _aic _gap2')}>
            <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
              Dinner Service
            </span>
            <span className="d-annotation" data-status="success">Live</span>
          </div>
        </header>
        <main className="entrance-fade" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
