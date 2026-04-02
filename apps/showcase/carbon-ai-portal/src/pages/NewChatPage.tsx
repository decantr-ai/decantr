import { css } from '@decantr/css';
import { Button } from '../components/Button';
import {
  MessageSquare,
  Code2,
  FileText,
  Lightbulb,
  ArrowUp,
  Paperclip,
} from 'lucide-react';

const suggestions = [
  { icon: <Code2 size={16} />, text: 'Help me write a React component' },
  { icon: <FileText size={16} />, text: 'Summarize this document' },
  { icon: <Lightbulb size={16} />, text: 'Explain a concept in simple terms' },
  { icon: <MessageSquare size={16} />, text: 'Debug my code' },
];

export function NewChatPage() {
  return (
    <div className={css('_flex _col _flex1 _aic _jcc _p6')}>
      {/* Empty state */}
      <div className={css('_flex _col _aic _gap6 _textc')} style={{ maxWidth: '560px' }}>
        <div
          className={css('_flex _aic _jcc _roundedfull')}
          style={{
            width: '72px',
            height: '72px',
            background: 'rgba(124,147,176,0.1)',
            color: 'var(--d-primary)',
          }}
        >
          <MessageSquare size={32} />
        </div>
        <div className={css('_flex _col _gap2')}>
          <h1 className={css('_heading2 _fgtext')}>How can I help?</h1>
          <p className={css('_fgmuted')}>
            Start a new conversation or pick a suggestion below.
          </p>
        </div>

        {/* Suggestion grid */}
        <div className={css('_grid _gc1 _md:gc2 _gap3 _wfull')}>
          {suggestions.map((s) => (
            <button
              key={s.text}
              className={
                css('_flex _aic _gap3 _p4 _textsm _textl _rounded _pointer _trans _bordernone _fgmuted') +
                ' carbon-card hover-lift'
              }
            >
              <span style={{ color: 'var(--d-primary)', flexShrink: 0 }}>{s.icon}</span>
              {s.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar - anchored at bottom */}
      <div
        className={css('_wfull _mt8')}
        style={{ maxWidth: '680px' }}
      >
        <form
          className={css('_flex _aic _gap2 _p2 _rounded') + ' carbon-card'}
          onSubmit={(e) => e.preventDefault()}
          style={{ border: '1px solid var(--d-border)' }}
        >
          <button
            type="button"
            className={css('_flex _aic _jcc _p2 _rounded _bordernone _trans _pointer') + ' btn-ghost'}
            aria-label="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder="Ask anything..."
            className={css('_flex1 _textbase _bordernone')}
            style={{
              background: 'transparent',
              outline: 'none',
              boxShadow: 'none',
            }}
          />
          <Button variant="primary" size="sm" icon={<ArrowUp size={16} />} type="submit">
            Send
          </Button>
        </form>
        <p className={css('_textxs _fgmuted _textc _mt2')}>
          Carbon AI may produce inaccurate information. Verify important facts.
        </p>
      </div>
    </div>
  );
}
