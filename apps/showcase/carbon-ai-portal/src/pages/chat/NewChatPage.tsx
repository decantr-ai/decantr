import { css } from '@decantr/css';
import { Send, Paperclip, MessageSquare, Code2, FileText, Lightbulb } from 'lucide-react';

const suggestions = [
  { icon: Code2, label: 'Help me debug a React component' },
  { icon: FileText, label: 'Summarize this document' },
  { icon: Lightbulb, label: 'Brainstorm product ideas' },
  { icon: MessageSquare, label: 'Explain a technical concept' },
];

export function NewChatPage() {
  return (
    <div className={css('_flex _col _flex1 _aic _jcc _p6')}>
      <div className={css('_flex _col _aic _textc') + ' carbon-fade-slide'} style={{ maxWidth: 600, width: '100%' }}>
        {/* Empty thread illustration */}
        <div
          className={css('_flex _aic _jcc _roundedfull _mb6')}
          style={{
            width: 64,
            height: 64,
            background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))',
          }}
        >
          <MessageSquare size={28} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 className={css('_heading2')}>How can I help you today?</h1>
        <p className={css('_textsm _fgmuted _mt2')}>
          Start a conversation or choose a suggestion below.
        </p>

        {/* Suggestions */}
        <div className={css('_grid _gc1 _sm:gc2 _gap3 _mt8 _wfull')}>
          {suggestions.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                className={css('_flex _aic _gap3 _px4 _py3 _textsm _textl _rounded _trans _pointer') + ' carbon-card'}
                style={{ cursor: 'pointer' }}
              >
                <Icon size={16} style={{ color: 'var(--d-primary)', flexShrink: 0 }} />
                <span className={css('_fgmuted')}>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input */}
        <div className={css('_wfull _mt8')}>
          <div className={css('_flex _aic _gap3 _p3 _rounded') + ' carbon-card'}>
            <button className={css('_flex _aic _jcc _p2 _rounded _fgmuted _trans _pointer') + ' btn-ghost'} aria-label="Attach file">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              placeholder="Send a message..."
              className={css('_flex1 _textbase')}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--d-text)',
              }}
            />
            <button
              className={css('_flex _aic _jcc _p2 _roundedfull _trans _pointer') + ' btn-primary'}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
