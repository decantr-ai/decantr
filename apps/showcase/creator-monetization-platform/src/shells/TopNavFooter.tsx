import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Palette, Instagram, Twitter } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div className={css('_flex _col studio-canvas')} style={{ minHeight: '100vh' }}>
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          height: 56, padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}
      >
        <Link to="/" className={css('_flex _aic _gap2')} style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
          <Palette size={20} style={{ color: 'var(--d-primary)' }} />
          <span className="serif-display" style={{ fontSize: '1.25rem' }}>Canvas</span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop'}>
          <a href="#/pricing" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Pricing</a>
          <a href="#/about" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>About</a>
          <a href="#/contact" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Contact</a>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          <a href="#/login" className="d-interactive" data-variant="ghost"
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Sign In</a>
          <a href="#/register" className="d-interactive studio-glow" data-variant="primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Start Creating</a>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ borderTop: '1px solid var(--d-border)', padding: '3rem 1.5rem 2rem', marginTop: 'auto', background: 'var(--d-surface)', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          <div>
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
              <Palette size={18} style={{ color: 'var(--d-primary)' }} />
              <span className="serif-display" style={{ fontSize: '1.125rem' }}>Canvas</span>
            </div>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, maxWidth: 260 }}>
              The creator monetization platform that celebrates creative work.
            </p>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Product</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#/pricing" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Pricing</a>
              <a href="#/about" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>About</a>
              <a href="#/contact" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Contact</a>
            </div>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Legal</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#/privacy" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Privacy</a>
              <a href="#/terms" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Terms</a>
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
        <hr className="studio-divider" style={{ margin: '2rem auto 1rem', maxWidth: '72rem' }} />
        <p style={{ color: 'var(--d-text-muted)', textAlign: 'center', fontSize: '0.75rem' }}>
          &copy; 2026 Canvas. Made for creators.
        </p>
      </footer>

      <style>{`@media (max-width: 767px) { .nav-desktop { display: none !important; } }`}</style>
    </div>
  );
}
