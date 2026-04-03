import { useRef, useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import type { CopilotMessage } from '@/data/mock';

interface ChatThreadProps {
  messages: CopilotMessage[];
  showScrollButton?: boolean;
}

export function ChatThread({ messages, showScrollButton = true }: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setShowScroll(scrollHeight - scrollTop - clientHeight > 100);
  };

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem 0',
        position: 'relative',
      }}
    >
      {messages.map((msg, i) => (
        <div
          key={msg.id}
          className={`${msg.role === 'assistant' ? 'carbon-bubble-ai' : 'carbon-bubble-user'} carbon-fade-slide`}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: msg.role === 'assistant' ? 'var(--d-accent)' : 'var(--d-text)',
            }}>
              {msg.role === 'assistant' ? 'Copilot' : 'You'}
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)' }}>{msg.timestamp}</span>
            {msg.context && (
              <span className="d-annotation" style={{ fontSize: '0.5625rem', marginLeft: 'auto' }}>{msg.context}</span>
            )}
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.content}</div>
        </div>
      ))}

      {/* Typing indicator */}
      <div
        className="carbon-bubble-ai"
        style={{ opacity: 0.6, display: 'none' }}
      >
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: 'var(--d-text-muted)',
                animation: 'decantr-pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
      </div>

      <div ref={endRef} />

      {showScrollButton && showScroll && (
        <button
          onClick={scrollToBottom}
          className="d-interactive"
          style={{
            position: 'sticky',
            bottom: 8,
            alignSelf: 'center',
            padding: '0.375rem',
            borderRadius: 'var(--d-radius-full)',
            boxShadow: 'var(--d-shadow-md)',
            background: 'var(--d-surface-raised)',
          }}
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={16} />
        </button>
      )}
    </div>
  );
}
