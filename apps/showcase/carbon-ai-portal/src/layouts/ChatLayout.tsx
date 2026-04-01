import { Outlet, Link, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';

const conversations = [
  { id: '1', title: 'React performance tips', date: 'Today' },
  { id: '2', title: 'Database schema design', date: 'Today' },
  { id: '3', title: 'API error handling', date: 'Yesterday' },
  { id: '4', title: 'Docker compose setup', date: 'Yesterday' },
  { id: '5', title: 'CI/CD pipeline config', date: 'Last week' },
];

const settingsLinks = [
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/security', label: 'Security' },
  { to: '/settings/preferences', label: 'Preferences' },
  { to: '/settings/account', label: 'Account' },
];

export function ChatLayout() {
  const { pathname } = useLocation();
  const isSettings = pathname.startsWith('/settings');

  return (
    <div className={css('_flex') + ' carbon-canvas'} style={{ height: '100vh' }}>
      {/* Sidebar */}
      <aside
        className={css('_flex _col _shrink0')}
        style={{
          width: 260,
          borderRight: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
        }}
      >
        {/* Sidebar header */}
        <div className={css('_flex _aic _jcsb _p4')} style={{ borderBottom: '1px solid var(--d-border)' }}>
          <Link to="/" className={css('_fontsemi _fgtext _textsm')} style={{ textDecoration: 'none' }}>
            Carbon AI
          </Link>
          <Link
            to="/chat"
            className={css('_textsm _fgmuted _px3 _py1 _rounded')}
            style={{ textDecoration: 'none', border: '1px solid var(--d-border)' }}
          >
            + New
          </Link>
        </div>

        {/* Conversation list / settings nav */}
        <nav className={css('_flex _col _flex1 _overauto _p3 _gap1')}>
          {isSettings ? (
            <>
              <span className={css('_textxs _fgmuted _fontmedium _uppercase _px3 _py2')}>Settings</span>
              {settingsLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={css(
                    '_textsm _px3 _py2 _rounded',
                    pathname === link.to ? '_bgprimary _fgtext' : '_fgmuted',
                  )}
                  style={{ textDecoration: 'none', transition: 'background 0.15s ease' }}
                >
                  {link.label}
                </Link>
              ))}
              <div className={css('_flex1')} />
              <Link
                to="/chat"
                className={css('_textsm _fgmuted _px3 _py2')}
                style={{ textDecoration: 'none' }}
              >
                &larr; Back to Chat
              </Link>
            </>
          ) : (
            <>
              {conversations.map((c) => (
                <Link
                  key={c.id}
                  to={`/chat/${c.id}`}
                  className={css(
                    '_textsm _px3 _py2 _rounded _truncate',
                    pathname === `/chat/${c.id}` ? '_bgprimary _fgtext' : '_fgmuted',
                  )}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {c.title}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Sidebar footer */}
        <div className={css('_p3 _flex _col _gap1')} style={{ borderTop: '1px solid var(--d-border)' }}>
          <Link
            to="/settings/profile"
            className={css('_textsm _fgmuted _px3 _py2 _rounded')}
            style={{ textDecoration: 'none' }}
          >
            Settings
          </Link>
          <Link
            to="/login"
            className={css('_textsm _fgmuted _px3 _py2 _rounded')}
            style={{ textDecoration: 'none' }}
          >
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className={css('_flex1 _flex _col _minh0 _minw0')}>
        <Outlet />
      </main>
    </div>
  );
}
