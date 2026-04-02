import { css } from '@decantr/css';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MessageSquare, Plus, PanelLeft, Bell, Settings,
  User, LogOut, Shield, Palette, AlertTriangle,
} from 'lucide-react';
import { Avatar } from '@/components';

interface Conversation {
  id: string;
  title: string;
  preview: string;
  date: string;
}

const demoConversations: Conversation[] = [
  { id: '1', title: 'Explain quantum computing', preview: 'Quantum computing uses qubits...', date: 'Today' },
  { id: '2', title: 'Write a Python script', preview: 'Here is a script that...', date: 'Today' },
  { id: '3', title: 'Debug React component', preview: 'The issue is with your useEffect...', date: 'Yesterday' },
  { id: '4', title: 'API architecture review', preview: 'Your REST API could benefit from...', date: 'Yesterday' },
  { id: '5', title: 'SQL query optimization', preview: 'Adding an index on the...', date: '2 days ago' },
];

const settingsNav = [
  { to: '/settings/profile', icon: User, label: 'Profile' },
  { to: '/settings/security', icon: Shield, label: 'Security' },
  { to: '/settings/preferences', icon: Palette, label: 'Preferences' },
  { to: '/settings/account', icon: AlertTriangle, label: 'Danger Zone' },
];

export function ChatPortalShell({
  children,
  mode = 'chat',
}: {
  children: React.ReactNode;
  mode?: 'chat' | 'settings';
}) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={css('_grid _hscreen') + ' carbon-canvas'}
      style={{
        gridTemplateColumns: collapsed ? '64px 1fr' : '280px 1fr',
        gridTemplateRows: '52px 1fr',
        transition: 'grid-template-columns 0.15s ease',
      }}
    >
      {/* Sidebar */}
      <aside
        className={css('_flex _col _overhidden') + ' carbon-glass'}
        style={{ gridRow: '1 / 3', borderRight: '1px solid var(--d-border)' }}
      >
        {/* Sidebar header */}
        <div className={css('_flex _aic _jcsb _px3 _py3')} style={{ borderBottom: '1px solid var(--d-border)', minHeight: '52px' }}>
          {!collapsed && (
            <span className={css('_fontsemi _textbase _fgtext')}>
              {mode === 'settings' ? 'Settings' : 'Conversations'}
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={css('_flex _aic _jcc _p1 _rounded _trans') + ' btn-ghost'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft size={18} />
          </button>
        </div>

        {/* Sidebar content */}
        <nav className={css('_flex _col _gap1 _p2 _flex1 _overyauto')}>
          {mode === 'settings' ? (
            settingsNav.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={css('_flex _aic _gap3 _px3 _py2 _textsm') + ' conv-item' + (isActive ? ' active' : '')}
                >
                  <item.icon size={18} className={css(isActive ? '_fgprimary' : '_fgmuted')} />
                  {!collapsed && (
                    <span className={css(isActive ? '_fgtext _fontmedium' : '_fgmuted')}>{item.label}</span>
                  )}
                </Link>
              );
            })
          ) : (
            demoConversations.map((conv) => {
              const isActive = location.pathname === `/chat/${conv.id}`;
              return (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className={css('_flex _col _gap1 _px3 _py2 _textsm') + ' conv-item' + (isActive ? ' active' : '')}
                >
                  {collapsed ? (
                    <MessageSquare size={18} className={css(isActive ? '_fgprimary' : '_fgmuted')} />
                  ) : (
                    <>
                      <span className={css('_truncate _fgtext _fontmedium')}>{conv.title}</span>
                      <span className={css('_truncate _textxs _fgmuted')}>{conv.preview}</span>
                    </>
                  )}
                </Link>
              );
            })
          )}
        </nav>

        {/* Sidebar footer */}
        <div className={css('_p2')} style={{ borderTop: '1px solid var(--d-border)' }}>
          {mode === 'chat' ? (
            <Link
              to="/chat"
              className={css('_flex _aic _jcc _gap2 _wfull _py2 _rounded _textsm _fontmedium') + ' btn-outline'}
            >
              <Plus size={16} />
              {!collapsed && 'New Chat'}
            </Link>
          ) : (
            <Link
              to="/chat"
              className={css('_flex _aic _jcc _gap2 _wfull _py2 _rounded _textsm _fontmedium') + ' btn-ghost'}
            >
              <MessageSquare size={16} />
              {!collapsed && 'Back to Chat'}
            </Link>
          )}
        </div>
      </aside>

      {/* Header */}
      <header
        className={css('_flex _aic _jcsb _px6 _py3')}
        style={{ borderBottom: '1px solid var(--d-border)', background: 'var(--d-bg)' }}
      >
        <span className={css('_fontsemi _textlg _fgtext')}>
          {mode === 'settings' ? 'Account Settings' : 'Chat'}
        </span>
        <div className={css('_flex _aic _gap2')}>
          <Link to="/settings/profile" className={css('_flex _aic _jcc _p2 _rounded _trans') + ' btn-ghost'}>
            <Settings size={18} />
          </Link>
          <button className={css('_flex _aic _jcc _p2 _rounded _trans') + ' btn-ghost'}>
            <Bell size={18} />
          </button>
          <Avatar size="sm" />
        </div>
      </header>

      {/* Body */}
      <main className={css('_flex _col _overhidden')}>
        {children}
      </main>
    </div>
  );
}
