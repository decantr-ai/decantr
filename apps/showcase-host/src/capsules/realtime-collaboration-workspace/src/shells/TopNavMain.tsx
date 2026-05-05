import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function TopNavMain() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ height: 52, padding: '0 1.5rem', borderBottom: '1px solid var(--d-border)', background: 'var(--d-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)' }}>
          <Sparkles size={18} style={{ color: 'var(--d-primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Lumen</span>
        </Link>
      </header>
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
