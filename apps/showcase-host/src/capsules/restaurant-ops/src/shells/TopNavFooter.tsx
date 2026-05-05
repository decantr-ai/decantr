import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { UtensilsCrossed, Instagram, Twitter } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div className={css('_flex _col') + ' bistro-wash'} style={{ minHeight: '100vh' }}>
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          height: 52,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
          position: 'sticky', top: 0, zIndex: 10,
        }}
      >
        <Link to="/" className={css('_flex _aic _gap2')} style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
          <UtensilsCrossed size={20} style={{ color: 'var(--d-primary)' }} />
          <span className="bistro-handwritten" style={{ fontSize: '1.125rem' }}>Tavola</span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop'}>
          <a href="#/floor" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Features</a>
          <a href="#" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Pricing</a>
          <a href="#" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>About</a>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          <a href="#/login" className="d-interactive" data-variant="ghost"
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Sign In</a>
          <a href="#/register" className="d-interactive" data-variant="primary"
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Start Free</a>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ borderTop: '1px solid var(--d-border)', padding: '2.5rem 1.5rem', marginTop: 'auto', background: 'var(--d-surface)', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          <div>
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
              <UtensilsCrossed size={18} style={{ color: 'var(--d-primary)' }} />
              <span className="bistro-handwritten" style={{ fontSize: '1rem' }}>Tavola</span>
            </div>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, maxWidth: 260 }}>
              Restaurant operations, simplified. From floor to kitchen to financials.
            </p>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Product</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Floor Management</a>
              <a href="#" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Kitchen Display</a>
              <a href="#" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Menu Engineering</a>
            </div>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Company</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#/register" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Get Started</a>
              <a href="#" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Blog</a>
              <a href="#" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Support</a>
            </div>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Follow</p>
            <div className={css('_flex _aic _gap3')}>
              <a href="#" aria-label="Instagram" style={{ color: 'var(--d-text-muted)' }}><Instagram size={18} /></a>
              <a href="#" aria-label="Twitter" style={{ color: 'var(--d-text-muted)' }}><Twitter size={18} /></a>
            </div>
          </div>
        </div>
        <hr className="bistro-divider" style={{ margin: '2rem auto 1rem', maxWidth: '72rem' }} />
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textAlign: 'center', fontSize: '0.75rem' }}>
          &copy; 2026 Tavola. Hospitality, powered.
        </p>
      </footer>

      <style>{`@media (max-width: 767px) { .nav-desktop { display: none !important; } }`}</style>
    </div>
  );
}
