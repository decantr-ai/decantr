import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Zap, Instagram, Twitter } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div className={css('_flex _col dopamine-wash')} style={{ minHeight: '100vh' }}>
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
        <Link to="/" className={css('_flex _aic _gap2')} style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
          <Zap size={22} style={{ color: 'var(--d-primary)', fill: 'var(--d-primary)' }} />
          <span className="display-heading gradient-pink-violet" style={{ fontSize: '1.25rem' }}>Pulse</span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop'}>
          <a href="#/events" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Events</a>
          <a href="#/feed" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Community</a>
          <a href="#/members" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Members</a>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          <a href="#/login" className="d-interactive" data-variant="ghost"
            style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Sign In</a>
          <a href="#/register" className="d-interactive cta-glossy"
            style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Join Free</a>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ borderTop: '1px solid var(--d-border)', padding: '3rem 1.5rem 2rem', marginTop: 'auto', background: 'var(--d-surface)', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          <div>
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
              <Zap size={18} style={{ color: 'var(--d-primary)', fill: 'var(--d-primary)' }} />
              <span className="display-heading gradient-pink-violet" style={{ fontSize: '1.125rem' }}>Pulse</span>
            </div>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, maxWidth: 260 }}>
              The event community hub for people who come alive at night.
            </p>
          </div>
          <div>
            <p className="display-label" style={{ marginBottom: '0.75rem' }}>Discover</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#/events" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>All Events</a>
              <a href="#/feed" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Community Feed</a>
              <a href="#/members" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Members</a>
            </div>
          </div>
          <div>
            <p className="display-label" style={{ marginBottom: '0.75rem' }}>Organize</p>
            <div className={css('_flex _col _gap2')}>
              <a href="#/organizer" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Host an Event</a>
              <a href="#/organizer/analytics" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Analytics</a>
              <a href="#/register" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Become an Organizer</a>
            </div>
          </div>
          <div>
            <p className="display-label" style={{ marginBottom: '0.75rem' }}>Follow</p>
            <div className={css('_flex _aic _gap3')}>
              <a href="#" aria-label="Instagram" style={{ color: 'var(--d-text-muted)' }}><Instagram size={18} /></a>
              <a href="#" aria-label="Twitter" style={{ color: 'var(--d-text-muted)' }}><Twitter size={18} /></a>
            </div>
          </div>
        </div>
        <hr className="dopamine-divider" style={{ margin: '2rem auto 1rem', maxWidth: '72rem' }} />
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textAlign: 'center', fontSize: '0.75rem' }}>
          &copy; 2026 Pulse. Find your people.
        </p>
      </footer>

      <style>{`@media (max-width: 767px) { .nav-desktop { display: none !important; } }`}</style>
    </div>
  );
}
