import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Menu, Moon, Search, Sun, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { css } from '@decantr/css';
import { useAuth, useUi } from '../App';

const PUBLIC_LINKS = [
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/transparency', label: 'Transparency' },
  { to: '/', label: 'Pricing' },
];

const FOOTER_GROUPS = [
  {
    title: 'Platform',
    links: [
      { label: 'Marketplace', href: '#/marketplace' },
      { label: 'Pricing', href: '#/' },
      { label: 'Transparency', href: '#/transparency' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#/' },
      { label: 'API reference', href: '#/' },
      { label: 'Status', href: '#/' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#/' },
      { label: 'Careers', href: '#/' },
      { label: 'Contact', href: '#/register' },
    ],
  },
];

export function TopNavFooter() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { openPalette, themeMode, toggleTheme } = useUi();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="shell-public" data-menu-open={menuOpen} data-theme="carbon-neon">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="shell-public__header carbon-glass">
        <Link className="shell-public__brand" to="/">
          <span className="shell-public__brand-mark">
            <Zap size={16} />
          </span>
          <span className="shell-public__brand-copy">
            <strong>AgentOps</strong>
          </span>
        </Link>

        <nav className="shell-public__nav" aria-label="Public navigation">
          {PUBLIC_LINKS.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) => `shell-public__nav-link${isActive ? ' is-active' : ''}`}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="shell-public__actions">
          <button type="button" className="d-interactive command-trigger" data-variant="ghost" onClick={openPalette}>
            <Search size={14} />
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
          <button type="button" className="d-interactive icon-button theme-toggle" data-variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {isAuthenticated ? (
            <button type="button" className="d-interactive" data-variant="primary" onClick={() => navigate('/agents')}>
              Dashboard
            </button>
          ) : (
            <>
              <button type="button" className="d-interactive" data-variant="ghost" onClick={() => navigate('/login')}>
                <LogIn size={14} />
                Log in
              </button>
              <button type="button" className="d-interactive" data-variant="primary" onClick={() => navigate('/register')}>
                Deploy agent
              </button>
            </>
          )}
          <button type="button" className="d-interactive icon-button shell-public__mobile-toggle" data-variant="ghost" onClick={() => setMenuOpen((current) => !current)} aria-label="Toggle navigation">
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      <div className="shell-public__mobile-panel carbon-glass">
        {PUBLIC_LINKS.map((link) => (
          <button key={link.to} type="button" className="d-interactive shell-public__mobile-link" data-variant="ghost" onClick={() => navigate(link.to)}>
            {link.label}
          </button>
        ))}
        {!isAuthenticated ? (
          <>
            <button type="button" className="d-interactive shell-public__mobile-link" data-variant="ghost" onClick={() => navigate('/login')}>
              Log in
            </button>
            <button type="button" className="d-interactive shell-public__mobile-link" data-variant="primary" onClick={() => navigate('/register')}>
              Deploy agent
            </button>
          </>
        ) : (
          <button type="button" className="d-interactive shell-public__mobile-link" data-variant="primary" onClick={() => navigate('/agents')}>
            Dashboard
          </button>
        )}
      </div>

      <main id="main-content" className="shell-public__body">
        <Outlet />
      </main>

      <footer className="shell-public__footer">
        <div className="shell-public__footer-inner">
          <div className={css('_flex _col _gap3')}>
            <div className="shell-public__brand">
              <span className="shell-public__brand-mark">
                <Zap size={16} />
              </span>
              <span className="shell-public__brand-copy">
                <strong>AgentOps</strong>
                <span className={css('_textxs _fgmuted')}>
                  Decantr showcase
                </span>
              </span>
            </div>
            <p className="shell-public__footer-copy">
              Deploy, monitor, and refine autonomous agent swarms with marketplace discovery and model transparency in one authored system.
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title} className="shell-public__footer-group">
              <span className="d-label">{group.title}</span>
              {group.links.map((link) => (
                <a key={link.label} className="shell-public__footer-link" href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="shell-public__footer-legal">© 2026 AgentOps. Built as a Decantr showcase workspace.</div>
      </footer>
    </div>
  );
}
