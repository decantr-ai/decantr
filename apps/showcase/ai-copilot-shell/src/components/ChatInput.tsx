import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({ onSend, placeholder = 'Type a message...' }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue('');
  };

  return (
    <div
      style={{
        borderTop: '1px solid var(--d-border)',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.5rem',
      }}
    >
      <button
        className="d-interactive"
        data-variant="ghost"
        style={{ padding: '0.375rem', border: 'none', flexShrink: 0 }}
        aria-label="Attach file"
      >
        <Paperclip size={18} />
      </button>
      <textarea
        className="d-control carbon-input"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={placeholder}
        rows={1}
        style={{
          flex: 1,
          resize: 'none',
          minHeight: '2.5rem',
          maxHeight: '8rem',
          fontSize: '0.9375rem',
        }}
      />
      <button
        onClick={handleSend}
        className="d-interactive"
        data-variant={value.trim() ? 'primary' : undefined}
        style={{ padding: '0.375rem 0.625rem', border: 'none', flexShrink: 0 }}
        aria-label="Send message"
      >
        <Send size={18} />
        <span style={{ fontSize: '0.8125rem' }}>Send</span>
      </button>
    </div>
  );
}
