import { css } from '@decantr/css';

const suggestions = [
  'Help me refactor this React component',
  'Explain how WebSocket connections work',
  'Write a PostgreSQL migration for user roles',
  'Debug this TypeScript type error',
];

export function NewChatPage() {
  return (
    <div className={css('_flex _col _flex1')}>
      {/* Empty thread state */}
      <div className={css('_flex1 _flex _col _aic _jcc _gap6 _px6')}>
        <div
          className={css('_flex _aic _jcc _fontsemi _fgprimary _text3xl')}
          style={{
            width: 80,
            height: 80,
            borderRadius: 'var(--d-radius-xl)',
            background: 'var(--d-surface)',
            border: '1px solid var(--d-border)',
          }}
        >
          C
        </div>
        <div className={css('_textc')}>
          <h1 className={css('_heading2 _fgtext')} style={{ marginBottom: 'var(--d-gap-2)' }}>
            How can I help?
          </h1>
          <p className={css('_textsm _fgmuted')}>
            Ask me anything about code, architecture, or debugging.
          </p>
        </div>
        <div className={css('_grid _gc1 _sm:gc2 _gap3')} style={{ maxWidth: 520, width: '100%' }}>
          {suggestions.map((s) => (
            <button
              key={s}
              className={css('_textl _textsm _fgmuted _px4 _py3 _rounded _pointer') + ' carbon-glass'}
              style={{ border: '1px solid var(--d-border)', background: 'var(--d-surface)', cursor: 'pointer' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Anchored input */}
      <div className={css('_p4')} style={{ borderTop: '1px solid var(--d-border)' }}>
        <div className={css('_flex _gap3')} style={{ maxWidth: 720, margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Send a message..."
            className={css('_flex1 _px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
            style={{ background: 'var(--d-surface)', outline: 'none' }}
          />
          <button
            className={css('_bgprimary _fgtext _fontsemi _px5 _py3 _rounded _textsm _pointer')}
            style={{ border: 'none' }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
