import { css } from '@decantr/css';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Settings,
  User,
  Shield,
  Sliders,
  AlertTriangle,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Cpu,
} from 'lucide-react';
import { useState } from 'react';

const conversations = [
  { id: '1', title: 'Project architecture review' },
  { id: '2', title: 'Debug API integration' },
  { id: '3', title: 'CSS layout assistance' },
  { id: '4', title: 'Database schema design' },
];

const settingsLinks = [
  { to: '/settings/profile', label: 'Profile', icon: User },
  { to: '/settings/security', label: 'Security', icon: Shield },
  { to: '/settings/preferences', label: 'Preferences', icon: Sliders },
  { to: '/settings/account', label: 'Danger Zone', icon: AlertTriangle },
];

export function ChatPortalShell() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isSettings = location.pathname.startsWith('/settings');

  return (
    <div className={css('_flex _hscreen _overhidden') + ' carbon-canvas'}>
      {/* Sidebar */}
      <aside
        className={css('_flex _col _shrink0') + ' carbon-glass'}
        style={{
          width: collapsed ? 0 : 260,
          borderRight: collapsed ? 'none' : '1px solid var(--d-border)',
          overflow: 'hidden',
          transition: 'width 0.2s ease',
        }}
      >
        {/* Sidebar header */}
        <div className={css('_flex _aic _jcsb _px4 _py3')} style={{ borderBottom: '1px solid var(--d-border)' }}>
          <Link to="/" className={css('_flex _aic _gap2 _fontsemi _textsm _fgtext')}>
            <Cpu size={18} strokeWidth={1.5} />
            Carbon AI
          </Link>
          <button
            className={css('_flex _aic _jcc _p1 _rounded _trans') + ' btn-ghost'}
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* New chat button */}
        <div className={css('_p3')}>
          <Link to="/chat" className={css('_wfull')}>
            <button
              className={css('_flex _aic _gap2 _wfull _px3 _py2 _textsm _rounded _trans _pointer _fontsemi') + ' btn-secondary'}
            >
              <Plus size={16} />
              New conversation
            </button>
          </Link>
        </div>

        {/* Conversations or settings nav */}
        <div className={css('_flex1 _overyauto _px3 _flex _col _gap1')}>
          {isSettings ? (
            <>
              <div className={css('_textxs _fgmuted _fontmedium _uppercase _px2 _py2')}>Settings</div>
              {settingsLinks.map((link) => {
                const Icon = link.icon;
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={
                      css('_flex _aic _gap3 _px3 _py2 _textsm _rounded _trans') +
                      (active ? ' ' + css('_bgsurface _fgtext _fontsemi') : ' ' + css('_fgmuted'))
                    }
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </>
          ) : (
            <>
              <div className={css('_textxs _fgmuted _fontmedium _uppercase _px2 _py2')}>Conversations</div>
              {conversations.map((conv) => {
                const active = location.pathname === `/chat/${conv.id}`;
                return (
                  <Link
                    key={conv.id}
                    to={`/chat/${conv.id}`}
                    className={
                      css('_flex _aic _gap3 _px3 _py2 _textsm _rounded _truncate _trans') +
                      (active ? ' ' + css('_bgsurface _fgtext') : ' ' + css('_fgmuted'))
                    }
                  >
                    <MessageSquare size={14} className={css('_shrink0')} />
                    <span className={css('_truncate')}>{conv.title}</span>
                  </Link>
                );
              })}
            </>
          )}
        </div>

        {/* Sidebar footer */}
        <div className={css('_p3 _flex _col _gap1')} style={{ borderTop: '1px solid var(--d-border)' }}>
          <Link
            to="/settings/profile"
            className={css('_flex _aic _gap3 _px3 _py2 _textsm _fgmuted _rounded _trans')}
          >
            <Settings size={16} />
            Settings
          </Link>
          <Link
            to="/login"
            className={css('_flex _aic _gap3 _px3 _py2 _textsm _fgmuted _rounded _trans')}
          >
            <LogOut size={16} />
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className={css('_flex _col _flex1 _minh0 _minw0')}>
        {/* Topbar when sidebar collapsed */}
        {collapsed && (
          <div className={css('_flex _aic _px4 _py2')} style={{ borderBottom: '1px solid var(--d-border)' }}>
            <button
              className={css('_flex _aic _jcc _p1 _rounded _trans') + ' btn-ghost'}
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
            >
              <PanelLeft size={16} />
            </button>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}
