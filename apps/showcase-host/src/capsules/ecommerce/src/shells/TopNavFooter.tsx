import { Outlet, NavLink, Link } from 'react-router-dom';
import { ShoppingBag, Instagram, Twitter, Mail } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--d-bg)' }}>
      <header className="ec-nav">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)', fontWeight: 700, fontSize: '1.05rem' }}>
          <ShoppingBag size={20} style={{ color: 'var(--d-primary)' }} />
          Vinea
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <NavLink to="/shop" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.875rem' }}>Shop</NavLink>
          <NavLink to="/orders" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.875rem' }}>Orders</NavLink>
          <NavLink to="/login" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.875rem' }}>Sign in</NavLink>
          <Link to="/shop" className="ec-button-primary">Shop now</Link>
        </nav>
      </header>

      <main className="entrance-fade" style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ borderTop: '1px solid var(--d-border)', padding: '3rem 2rem 2rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <ShoppingBag size={18} style={{ color: 'var(--d-primary)' }} />
              Vinea
            </div>
            <p style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem', maxWidth: 280 }}>
              Curated goods, made with care. Shipping worldwide since 2019.
            </p>
          </div>
          <FooterCol title="Shop" links={[['New', '/shop'], ['Bestsellers', '/shop'], ['Apparel', '/shop'], ['Home', '/shop']]} />
          <FooterCol title="Support" links={[['Orders', '/orders'], ['Sign in', '/login'], ['Help', '/'], ['Returns', '/']]} />
          <div>
            <div className="d-label" style={{ marginBottom: '0.5rem' }}>Follow</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href="#" className="d-interactive" data-variant="ghost" aria-label="Instagram" style={{ padding: '0.5rem' }}><Instagram size={16} /></a>
              <a href="#" className="d-interactive" data-variant="ghost" aria-label="Twitter" style={{ padding: '0.5rem' }}><Twitter size={16} /></a>
              <a href="#" className="d-interactive" data-variant="ghost" aria-label="Email" style={{ padding: '0.5rem' }}><Mail size={16} /></a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '2.5rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
          <span>© 2026 Vinea. All rights reserved.</span>
          <span>Crafted with Decantr</span>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="d-label" style={{ marginBottom: '0.5rem' }}>{title}</div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
