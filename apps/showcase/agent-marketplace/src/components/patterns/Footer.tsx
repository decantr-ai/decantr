import { css } from '@decantr/css';

const footerLinks = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Documentation', href: '#' },
];

export function Footer() {
  return (
    <footer
      className={css('_px6')}
      style={{ borderTop: '1px solid var(--d-border)' }}
    >
      <div
        className={css('_flex _row _aic _jcsb _wrap _gap4') + ' footer-inner'}
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'var(--d-section-py, 1.5rem) 0',
        }}
      >
        {/* Left: Brand + copyright */}
        <div className={css('_flex _row _aic _gap2')}>
          <span
            className={css('_fontsemi') + ' mono-data'}
            style={{ color: 'var(--d-accent)' }}
          >
            AgentMKT
          </span>
          <span className={css('_textsm _fgmuted')}>
            &copy; {new Date().getFullYear()}
          </span>
        </div>

        {/* Right: Links */}
        <div className={css('_flex _row _gap4 _aic')}>
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={css('_textsm _fgmuted')}
              style={{ textDecoration: 'none' }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 639px) {
          .footer-inner {
            flex-direction: column !important;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
