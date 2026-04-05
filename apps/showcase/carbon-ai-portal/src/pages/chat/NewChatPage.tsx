import { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ChatThread } from '@/components/ChatThread';
import { ChatInput } from '@/components/ChatInput';
import { streamResponse, suggestedPrompts, type Message } from '@/data/mock';

export function NewChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const cancelRef = useRef<(() => void) | null>(null);

  const handleSend = (text: string) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((m) => [...m, userMsg]);
    setStreaming(true);
    setStreamingText('');

    cancelRef.current = streamResponse(
      text,
      (token) => setStreamingText((prev) => prev + token),
      () => {
        setStreamingText((final) => {
          const aiMsg: Message = {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: final,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: 'carbon-4',
          };
          setMessages((m) => [...m, aiMsg]);
          setStreaming(false);
          return '';
        });
      },
    );
  };

  if (messages.length === 0 && !streaming) {
    return (
      <>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem',
            overflowY: 'auto',
          }}
        >
          <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'color-mix(in srgb, var(--d-primary) 18%, var(--d-surface-raised))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                border: '1px solid color-mix(in srgb, var(--d-primary) 28%, var(--d-border))',
              }}
            >
              <Sparkles size={22} style={{ color: 'var(--d-accent)' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              How can I help today?
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--d-text-muted)', marginBottom: '2rem' }}>
              Ask a question, paste some code, or describe what you are working on.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.625rem',
                textAlign: 'left',
              }}
            >
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="carbon-card"
                  style={{
                    padding: '0.875rem 1rem',
                    background: 'var(--d-surface)',
                    border: '1px solid var(--d-border)',
                    color: 'var(--d-text)',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: 'var(--d-radius)',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ChatInput onSend={handleSend} disabled={streaming} />
      </>
    );
  }

  return (
    <>
      <ChatThread messages={messages} streaming={streaming} streamingText={streamingText} />
      <ChatInput onSend={handleSend} disabled={streaming} />
    </>
  );
}
