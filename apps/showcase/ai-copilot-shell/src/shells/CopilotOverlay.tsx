import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Sparkles, X, Send, Paperclip, ArrowDown,
  LayoutDashboard, Settings, Bot, LogOut, User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { copilotMessages } from '@/data/mock';
import type { CopilotMessage } from '@/data/mock';

export function CopilotOverlay() {
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [messages, setMessages] = useState<CopilotMessage[]>(copilotMessages);
  const [inputValue, setInputValue] = useState('');
  const location = useLocation();
  const { logout } = useAuth();

  // Cmd+K toggle
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCopilotOpen(v => !v);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const aiMsg: CopilotMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: 'I can see you\'re working in the current workspace. Let me analyze the context and provide a relevant suggestion. Give me a moment to review the relevant files and patterns.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      context: 'Workspace',
    };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputValue('');
  };

  const currentPage = location.pathname.split('/').filter(Boolean);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: copilotOpen ? '1fr 360px' : '1fr',
        gridTemplateRows: '56px 1fr',
        height: '100vh',
        transition: 'grid-template-columns 200ms ease',
      }}
    >
      {/* Header — spans both columns */}
      <header
        style={{
          gridColumn: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/workspace" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)' }}>
            <Sparkles size={18} style={{ color: 'var(--d-accent)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Copilot Shell</span>
          </Link>
          <span style={{ color: 'var(--d-border)' }}>|</span>
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            {[
              { icon: LayoutDashboard, label: 'Workspace', href: '/workspace' },
              { icon: Bot, label: 'Copilot Config', href: '/copilot/config' },
              { icon: Settings, label: 'Settings', href: '/settings' },
            ].map(item => {
              const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="d-interactive"
                  data-variant="ghost"
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8125rem',
                    color: active ? 'var(--d-text)' : 'var(--d-text-muted)',
                    background: active ? 'var(--d-surface)' : undefined,
                    borderRadius: 'var(--d-radius-sm)',
                    textDecoration: 'none',
                    border: 'none',
                  }}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCopilotOpen(v => !v)}
            className="d-interactive"
            data-variant={copilotOpen ? 'primary' : undefined}
            style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem' }}
            aria-label="Toggle copilot"
          >
            <Sparkles size={14} />
            <span style={{ fontSize: '0.75rem' }}>
              {copilotOpen ? 'Close' : 'Ask AI'}
            </span>
            <kbd style={{
              fontSize: '0.625rem',
              padding: '0.0625rem 0.25rem',
              borderRadius: 'var(--d-radius-sm)',
              background: copilotOpen ? 'rgba(255,255,255,0.15)' : 'var(--d-surface)',
              marginLeft: '0.25rem',
            }}>
              {"\u2318"}K
            </kbd>
          </button>
          <div style={{
            width: 28, height: 28, borderRadius: 'var(--d-radius-full)',
            background: 'var(--d-surface-raised)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600,
          }}>
            <User size={14} />
          </div>
          <button
            onClick={logout}
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.25rem', border: 'none' }}
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Body — main workspace content */}
      <main
        className="entrance-fade"
        style={{
          overflowY: 'auto',
          padding: '1.5rem',
        }}
      >
        {/* Breadcrumb */}
        {currentPage.length > 0 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
            {currentPage.map((seg, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: '0 0.375rem', opacity: 0.5 }}>/</span>}
                <span style={i === currentPage.length - 1 ? { color: 'var(--d-text)' } : undefined}>
                  {seg.charAt(0).toUpperCase() + seg.slice(1)}
                </span>
              </span>
            ))}
          </div>
        )}
        <Outlet />
      </main>

      {/* Copilot panel */}
      {copilotOpen && (
        <aside
          className="carbon-fade-slide"
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--d-border)',
            background: 'var(--d-surface-raised)',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Copilot header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--d-border)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--d-accent)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Copilot</span>
              <span className="d-annotation" data-status="success" style={{ fontSize: '0.625rem' }}>Active</span>
            </div>
            <button
              onClick={() => setCopilotOpen(false)}
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.25rem', border: 'none' }}
              aria-label="Close copilot"
            >
              <X size={14} />
            </button>
          </div>

          {/* Context breadcrumbs */}
          <div
            style={{
              padding: '0.5rem 1rem',
              borderBottom: '1px solid var(--d-border)',
              fontSize: '0.6875rem',
              color: 'var(--d-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              flexShrink: 0,
            }}
          >
            <span className="d-label">Context:</span>
            <span className="d-annotation">
              {currentPage[currentPage.length - 1]
                ? currentPage[currentPage.length - 1].charAt(0).toUpperCase() + currentPage[currentPage.length - 1].slice(1)
                : 'Workspace'}
            </span>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={msg.role === 'assistant' ? 'carbon-bubble-ai' : 'carbon-bubble-user'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: msg.role === 'assistant' ? 'var(--d-accent)' : 'var(--d-text)' }}>
                    {msg.role === 'assistant' ? 'Copilot' : 'You'}
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)' }}>{msg.timestamp}</span>
                  {msg.context && (
                    <span className="d-annotation" style={{ fontSize: '0.5625rem', marginLeft: 'auto' }}>{msg.context}</span>
                  )}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              borderTop: '1px solid var(--d-border)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.5rem',
              flexShrink: 0,
            }}
          >
            <button
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.375rem', border: 'none', flexShrink: 0 }}
              aria-label="Attach file"
            >
              <Paperclip size={16} />
            </button>
            <textarea
              className="d-control carbon-input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask the copilot..."
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                minHeight: '2rem',
                maxHeight: '6rem',
                fontSize: '0.875rem',
                fontFamily: "'Geist Mono', ui-monospace, monospace",
              }}
            />
            <button
              onClick={handleSend}
              className="d-interactive"
              data-variant={inputValue.trim() ? 'primary' : undefined}
              style={{ padding: '0.375rem', border: 'none', flexShrink: 0 }}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </aside>
      )}

      {/* Floating "Ask AI" pill when copilot is closed */}
      {!copilotOpen && (
        <button
          onClick={() => setCopilotOpen(true)}
          className="d-interactive"
          data-variant="primary"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--d-radius-full)',
            boxShadow: 'var(--d-shadow-lg)',
            zIndex: 50,
            fontSize: '0.875rem',
            border: 'none',
          }}
        >
          <Sparkles size={16} />
          Ask AI
        </button>
      )}
    </div>
  );
}
