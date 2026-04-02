import { css } from '@decantr/css';
import { useState } from 'react';
import { Send, Paperclip, Zap, Code, FileText, Lightbulb } from 'lucide-react';
import { ChatPortalShell } from '@/layouts/ChatPortalShell';
import { Button } from '@/components';

const suggestions = [
  { icon: Code, label: 'Write code', description: 'Generate, debug, or review code in any language' },
  { icon: FileText, label: 'Analyze text', description: 'Summarize, translate, or extract insights from documents' },
  { icon: Lightbulb, label: 'Brainstorm ideas', description: 'Get creative suggestions and explore concepts' },
  { icon: Zap, label: 'Automate tasks', description: 'Create scripts, workflows, and integrations' },
];

export function NewChatPage() {
  const [message, setMessage] = useState('');

  return (
    <ChatPortalShell mode="chat">
      <div className={css('_flex1 _flex _col _aic _jcc _p6')}>
        <div className={css('_flex _col _aic _gap6 _textc')} style={{ maxWidth: '600px' }}>
          {/* Empty thread illustration */}
          <div
            className={css('_flex _aic _jcc _roundedfull')}
            style={{
              width: '64px',
              height: '64px',
              background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)',
            }}
          >
            <Zap size={28} className={css('_fgprimary')} />
          </div>

          <div className={css('_flex _col _gap2')}>
            <h1 className={css('_text2xl _fontsemi _fgtext')}>How can I help you today?</h1>
            <p className={css('_textbase _fgmuted')}>
              Start a conversation with Carbon AI. Ask questions, write code, analyze data, or brainstorm ideas.
            </p>
          </div>

          {/* Suggestions grid */}
          <div className={css('_grid _gap3 _wfull')} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                className={css('_flex _col _aic _gap2 _p4 _textc _rounded _trans') + ' carbon-card card-hover'}
                onClick={() => setMessage(suggestion.label.toLowerCase() + ': ')}
              >
                <suggestion.icon size={20} className={css('_fgprimary')} />
                <span className={css('_textsm _fontmedium _fgtext')}>{suggestion.label}</span>
                <span className={css('_textxs _fgmuted')}>{suggestion.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className={css('_p4')} style={{ borderTop: '1px solid var(--d-border)' }}>
        <div className={css('_flex _aic _gap3')}>
          <button className={css('_flex _aic _jcc _p2 _rounded _trans _shrink0') + ' btn-ghost'} title="Attach file">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message..."
            className={css('_flex1 _px4 _py3 _textbase _rounded _bgbg _fgtext _bw1') + ' carbon-input'}
          />
          <Button variant="primary" size="md" disabled={!message.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </ChatPortalShell>
  );
}
