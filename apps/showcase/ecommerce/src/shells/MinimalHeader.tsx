import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag, Lock } from 'lucide-react';

export function MinimalHeader() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--d-bg)' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        padding: '0 1.5rem',
        borderBottom: '1px solid var(--d-border)',
        background: 'var(--d-surface)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)', fontWeight: 700 }}>
          <ShoppingBag size={20} style={{ color: 'var(--d-primary)' }} />
          Vinea
        </Link>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
          <Lock size={14} /> Secure checkout
        </div>
      </header>
      <main className="entrance-fade" style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
