import { useState, useRef, useEffect } from 'react';
import { css } from '@decantr/css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      'Welcome to Carbon AI. I can help you analyze data, generate reports, and answer questions about your datasets. What would you like to explore?',
    timestamp: new Date(2026, 3, 1, 9, 0),
  },
];

const SAMPLE_PROMPTS = [
  'Show me revenue trends for Q1',
  'Compare user growth across regions',
  'What are the top performing products?',
  'Generate a churn risk report',
];

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulated AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(userMsg.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  }

  return (
    <div className={css('_flex _col _hfull')}>
      {/* Header */}
      <header
        className={css('_flex _aic _jcsb _px6 _shrink0') + ' lum-glass'}
        style={{
          height: 64,
          borderRadius: 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className={css('_flex _aic _gap3')}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#22c55e',
            }}
          />
          <h1 className={css('_fontsemi _textlg')}>AI Chat</h1>
          <span className={css('_textsm _fgmuted')}>Carbon Engine v4.0</span>
        </div>
        <div className={css('_flex _gap2')}>
          <button
            className={css('_px3 _py1 _rounded _textsm _fontmedium')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--d-border)',
              color: 'var(--d-text-muted)',
            }}
          >
            New Chat
          </button>
          <button
            className={css('_px3 _py1 _rounded _textsm _fontmedium')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--d-border)',
              color: 'var(--d-text-muted)',
            }}
          >
            Export
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className={css('_flex1 _overyauto _px6 _py6 _flex _col _gap6')}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={css('_flex _gap4')}
            style={{ maxWidth: 720 }}
          >
            {/* Avatar */}
            <div
              className={css('_shrink0 _flex _aic _jcc _roundedfull _fontsemi _textsm')}
              style={{
                width: 36,
                height: 36,
                background:
                  msg.role === 'assistant'
                    ? 'var(--d-primary)'
                    : 'var(--d-surface-raised)',
                color: msg.role === 'assistant' ? '#fff' : 'var(--d-text)',
              }}
            >
              {msg.role === 'assistant' ? 'C' : 'U'}
            </div>

            {/* Content */}
            <div className={css('_flex _col _gap1 _flex1')}>
              <div className={css('_flex _aic _gap2')}>
                <span className={css('_fontmedium _textsm')}>
                  {msg.role === 'assistant' ? 'Carbon AI' : 'You'}
                </span>
                <span className={css('_textxs _fgmuted')}>
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div
                className={
                  css('_textbase _p4 _rounded') +
                  (msg.role === 'assistant' ? ' carbon-glass' : '')
                }
                style={{
                  background:
                    msg.role === 'user'
                      ? 'var(--d-surface-raised)'
                      : undefined,
                  lineHeight: 1.7,
                }}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Sample prompts (show if only initial message) */}
      {messages.length <= 1 && (
        <div className={css('_px6 _pb4')}>
          <p className={css('_textsm _fgmuted _mb3')}>Try asking:</p>
          <div className={css('_flex _wrap _gap2')}>
            {SAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className={css('_px3 _py2 _rounded _textsm')}
                style={{
                  background: 'var(--d-surface)',
                  border: '1px solid var(--d-border)',
                  color: 'var(--d-text-muted)',
                  transition: 'border-color 0.15s',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className={css('_px6 _py4 _shrink0')}
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className={css('_flex _gap3')}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Carbon AI anything about your data..."
            className={css('_flex1 _px4 _py3 _rounded _textbase')}
            style={{
              background: 'var(--d-surface)',
              border: '1px solid var(--d-border)',
              color: 'var(--d-text)',
              outline: 'none',
            }}
            aria-label="Chat message input"
          />
          <button
            type="submit"
            className={css('_px6 _py3 _rounded _fontmedium')}
            style={{
              background: 'var(--d-primary)',
              border: 'none',
              color: '#fff',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function getSimulatedResponse(query: string): string {
  const lower = query.toLowerCase();
  if (lower.includes('revenue') || lower.includes('trend')) {
    return 'Based on Q1 data, total revenue reached $4.2M — up 18% from last quarter. The strongest growth came from the Enterprise segment (+24%), while SMB held steady at +8%. I can break this down by product line or region if you like.';
  }
  if (lower.includes('user') || lower.includes('growth')) {
    return 'User growth across regions for the past 90 days: North America +12%, EMEA +22%, APAC +31%. APAC is the fastest growing region, driven primarily by expansion in Japan and Australia. Would you like a detailed cohort analysis?';
  }
  if (lower.includes('product') || lower.includes('top')) {
    return 'Top 5 performing products by revenue: 1) Carbon Pro ($1.8M), 2) Carbon Teams ($1.1M), 3) Carbon Analytics ($680K), 4) Carbon API ($420K), 5) Carbon Starter ($200K). Pro accounts for 43% of total revenue.';
  }
  if (lower.includes('churn') || lower.includes('risk')) {
    return 'Churn risk analysis: 847 accounts flagged as at-risk (8.4% of active base). Primary indicators: decreased login frequency (62%), support ticket escalation (23%), and contract renewal approaching without engagement (15%). Shall I generate the full report?';
  }
  return `I've analyzed your query: "${query}". Based on the available data, I can see several interesting patterns. Would you like me to create a visualization, export this as a report, or dig deeper into a specific dimension?`;
}
