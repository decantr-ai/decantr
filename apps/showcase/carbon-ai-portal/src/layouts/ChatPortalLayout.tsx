import { Outlet, Link, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  MessageSquare,
  Plus,
  Settings,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useState } from 'react';

const conversations = [
  { id: '1', title: 'Understanding React patterns', time: '2m ago' },
  { id: '2', title: 'Database schema design', time: '1h ago' },
  { id: '3', title: 'API authentication flow', time: '3h ago' },
  { id: '4', title: 'CSS architecture decisions', time: 'Yesterday' },
  { id: '5', title: 'Deployment pipeline setup', time: 'Yesterday' },
];

export function ChatPortalLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isSettings = location.pathname.startsWith('/settings');

  return (
    <div className={css('_flex _hscreen') + ' carbon-canvas'}>
      {/* Sidebar */}
      <aside
        className={css('_flex _col _shrink0') + ' glass-panel'}
        style={{
          width: sidebarOpen ? '260px' : '0px',
          overflow: 'hidden',
          transition: 'width 0.2s ease',
          borderRight: sidebarOpen ? '1px solid var(--d-border)' : 'none',
        }}
      >
        <div className={css('_flex _col _hfull')} style={{ width: '260px' }}>
          {/* Sidebar header */}
          <div
            className={css('_flex _aic _jcsb _px3 _py3')}
            style={{ borderBottom: '1px solid var(--d-border)' }}
          >
            <Link to="/" className={css('_flex _aic _gap2 _fontsemi _fgtext')}>
              <Sparkles size={18} />
              <span className={css('_textsm')}>Carbon AI</span>
            </Link>
            <button
              className={css('_flex _aic _jcc _p1 _bordernone _bgbg _fgmuted _pointer _rounded _trans') + ' btn-ghost'}
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          {/* New chat button */}
          <div className={css('_px3 _py3')}>
            <Link
              to="/chat"
              className={
                css('_flex _aic _gap2 _wfull _px3 _py2 _textsm _fontsemi _rounded _trans _bordernone') +
                ' btn-secondary hover-lift'
              }
              style={{ textAlign: 'left' }}
            >
              <Plus size={16} />
              New conversation
            </Link>
          </div>

          {/* Conversations list */}
          <div className={css('_flex1 _overauto _px3 _flex _col _gap1')}>
            <span className={css('_textxs _fgmuted _fontsemi _uppercase _px2 _mb1')}>
              Recent
            </span>
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/chat/${conv.id}`}
                className={
                  css('_flex _col _gap0 _px3 _py2 _textsm _rounded _pointer _trans') +
                  ' sidebar-item' +
                  (location.pathname === `/chat/${conv.id}` ? ' active' : '')
                }
              >
                <span className={css('_truncate _fgtext')} style={{ fontSize: '0.8125rem' }}>
                  {conv.title}
                </span>
                <span className={css('_textxs _fgmuted')}>{conv.time}</span>
              </Link>
            ))}
          </div>

          {/* Sidebar footer */}
          <div
            className={css('_flex _col _gap1 _px3 _py3')}
            style={{ borderTop: '1px solid var(--d-border)' }}
          >
            <Link
              to="/settings/profile"
              className={
                css('_flex _aic _gap2 _px3 _py2 _textsm _rounded _pointer _trans') +
                ' sidebar-item' +
                (isSettings ? ' active' : '')
              }
            >
              <Settings size={15} />
              Settings
            </Link>
            <Link
              to="/login"
              className={
                css('_flex _aic _gap2 _px3 _py2 _textsm _rounded _pointer _trans') +
                ' sidebar-item'
              }
            >
              <LogOut size={15} />
              Sign out
            </Link>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className={css('_flex _col _flex1 _minh0 _minw0')}>
        {/* Top bar */}
        <header
          className={css('_flex _aic _gap3 _px4 _py2')}
          style={{
            borderBottom: '1px solid var(--d-border)',
            height: '49px',
          }}
        >
          {!sidebarOpen && (
            <button
              className={css('_flex _aic _jcc _p1 _bordernone _bgbg _fgmuted _pointer _rounded _trans') + ' btn-ghost'}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <PanelLeft size={18} />
            </button>
          )}
          <div className={css('_flex _aic _gap2')}>
            <MessageSquare size={16} className={css('_fgmuted')} />
            <span className={css('_textsm _fontsemi _fgtext')}>
              {isSettings ? 'Settings' : 'Chat'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className={css('_flex1 _overauto _flex _col')}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
