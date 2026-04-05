import { useEffect, useRef } from 'react';
import { Sparkles, User as UserIcon } from 'lucide-react';
import type { Message } from '@/data/mock';

interface ChatThreadProps {
  messages: Message[];
  streaming?: boolean;
  streamingText?: string;
}

export function ChatThread({ messages, streaming, streamingText }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, streamingText]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {messages.map((msg) => (
          <MessageRow key={msg.id} message={msg} />
        ))}
        {streaming && (
          <MessageRow
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingText || '',
              timestamp: 'now',
              model: 'carbon-4',
            }}
            isStreaming
          />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MessageRow({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === 'user';
  return (
    <div
      className="carbon-fade-slide"
      style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      {!isUser && <Avatar role="assistant" />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: isUser ? 'flex-end' : 'flex-start', minWidth: 0 }}>
        <div
          className={isUser ? 'carbon-bubble-user' : 'carbon-bubble-ai'}
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {message.content}
          {isStreaming && (
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 14,
                marginLeft: 3,
                background: 'var(--d-primary)',
                verticalAlign: 'text-bottom',
                animation: 'carbon-typing 1s ease-in-out infinite',
              }}
            />
          )}
          {isStreaming && !message.content && (
            <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
              <span className="carbon-typing-dot" />
              <span className="carbon-typing-dot" />
              <span className="carbon-typing-dot" />
            </span>
          )}
        </div>
        <div
          className="mono-data"
          style={{
            fontSize: '0.6875rem',
            color: 'var(--d-text-muted)',
            padding: '0 0.25rem',
          }}
        >
          {message.timestamp}
          {message.model && !isUser && <span> · {message.model}</span>}
        </div>
      </div>
      {isUser && <Avatar role="user" />}
    </div>
  );
}

function Avatar({ role }: { role: 'user' | 'assistant' }) {
  const isUser = role === 'user';
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: isUser
          ? 'color-mix(in srgb, var(--d-primary) 30%, var(--d-surface-raised))'
          : 'var(--d-surface-raised)',
        border: '1px solid var(--d-border)',
        color: isUser ? 'var(--d-text)' : 'var(--d-accent)',
      }}
    >
      {isUser ? <UserIcon size={14} /> : <Sparkles size={14} />}
    </div>
  );
}
