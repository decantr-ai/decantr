import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Paperclip, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { AIBadge } from '@/components/AIBadge';

const ghostSuggestions: Record<string, string> = {
  'Hi': "Jordan — following up on our conversation yesterday. I pulled together the data residency one-pager we discussed.",
  'Thanks': ' for making time today. Attaching the proposal we walked through — ready for your team to review.',
  'Quick': ' question: would Thursday at 2pm work for the security review? I can loop in our CISO directly.',
};

export function ComposePage() {
  const [to, setTo] = useState('jordan@northwind.io');
  const [subject, setSubject] = useState('Re: Contract redlines — data residency');
  const [body, setBody] = useState('');
  const [ghost, setGhost] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const lastWord = body.split(/\s+/).pop() ?? '';
    if (body.trim().length > 0 && lastWord.length >= 2) {
      const match = Object.keys(ghostSuggestions).find(k => k.toLowerCase().startsWith(lastWord.toLowerCase()) && k.toLowerCase() !== lastWord.toLowerCase());
      if (match) {
        setGhost(match.slice(lastWord.length) + ghostSuggestions[match]);
        return;
      }
    }
    setGhost('');
  }, [body]);

  function acceptGhost() {
    if (ghost) {
      setBody(body + ghost);
      setGhost('');
      textareaRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab' && ghost) {
      e.preventDefault();
      acceptGhost();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 860 }}>
      <PageHeader
        title="Compose"
        description="AI-powered email composer with ghost text suggestions"
        actions={<AIBadge>Ghost text on</AIBadge>}
      />

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.625rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)', width: 60 }}>To</label>
            <input className="crm-inline-input" value={to} onChange={e => setTo(e.target.value)} style={{ fontSize: '0.875rem' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.625rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)', width: 60 }}>Subject</label>
            <input className="crm-inline-input" value={subject} onChange={e => setSubject(e.target.value)} style={{ fontSize: '0.875rem', fontWeight: 500 }} />
          </div>

          {/* Body with ghost text overlay */}
          <div style={{ position: 'relative', minHeight: 280 }}>
            <div
              aria-hidden
              style={{
                position: 'absolute', inset: 0, padding: '0.75rem',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                fontSize: '0.9rem', lineHeight: 1.6, fontFamily: 'inherit', pointerEvents: 'none',
              }}
            >
              <span style={{ color: 'transparent' }}>{body}</span>
              <span className="crm-ghost-text">{ghost}</span>
            </div>
            <textarea
              ref={textareaRef}
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Start typing… (press Tab to accept AI suggestion)"
              style={{
                position: 'relative', background: 'transparent', border: 'none', outline: 'none',
                width: '100%', minHeight: 280, resize: 'vertical', color: 'var(--d-text)',
                padding: '0.75rem', fontSize: '0.9rem', lineHeight: 1.6, fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.625rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.78rem' }}>
                <Paperclip size={13} /> Attach
              </button>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.78rem' }}>
                <Wand2 size={13} /> AI Rewrite
              </button>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.78rem' }}>
                <Sparkles size={13} /> Personalize
              </button>
            </div>
            <button className="crm-button-accent" style={{ fontSize: '0.82rem', padding: '0.5rem 1.125rem' }}>
              <Send size={14} /> Send
            </button>
          </div>
        </div>
      </div>

      {ghost && (
        <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
          Press <kbd style={{
            padding: '0.125rem 0.375rem', fontFamily: 'var(--d-font-mono)',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--d-radius-sm)', fontSize: '0.7rem',
          }}>Tab</kbd> to accept AI suggestion
        </div>
      )}
    </div>
  );
}
