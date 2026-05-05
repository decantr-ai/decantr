import { useRef, useState, KeyboardEvent, useEffect } from 'react';
import { Paperclip, ArrowUp, AtSign } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'Message Carbon…' }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const hasContent = value.trim().length > 0;

  return (
    <div
      style={{
        borderTop: '1px solid var(--d-border)',
        padding: '1rem 1.5rem 1.25rem',
        background: 'var(--d-bg)',
        flexShrink: 0,
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div
          className="carbon-glass"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '0.5rem',
            padding: '0.625rem 0.625rem 0.625rem 0.875rem',
            borderRadius: 'var(--d-radius-lg)',
            border: '1px solid var(--d-border)',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <button
            type="button"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem', border: 'none', flexShrink: 0 }}
            aria-label="Attach file"
          >
            <Paperclip size={16} style={{ color: 'var(--d-text-muted)' }} />
          </button>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            style={{
              flex: 1,
              resize: 'none',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--d-text)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
              padding: '0.375rem 0',
              maxHeight: 200,
              fontFamily: 'inherit',
            }}
          />
          <button
            type="button"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem', border: 'none', flexShrink: 0 }}
            aria-label="Mention"
          >
            <AtSign size={16} style={{ color: 'var(--d-text-muted)' }} />
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!hasContent || disabled}
            className="d-interactive"
            data-variant={hasContent ? 'primary' : 'ghost'}
            style={{
              padding: '0.4375rem',
              border: hasContent ? undefined : 'none',
              flexShrink: 0,
              borderRadius: 'var(--d-radius-sm)',
            }}
            aria-label="Send message"
          >
            <ArrowUp size={16} />
          </button>
        </div>
        <p
          style={{
            fontSize: '0.6875rem',
            color: 'var(--d-text-muted)',
            textAlign: 'center',
            marginTop: '0.5rem',
          }}
        >
          Enter to send, Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
