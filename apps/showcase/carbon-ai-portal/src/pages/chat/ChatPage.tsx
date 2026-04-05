import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Edit3, Download, GitBranch, MoreHorizontal } from 'lucide-react';
import { ChatThread } from '@/components/ChatThread';
import { ChatInput } from '@/components/ChatInput';
import {
  conversationMessages,
  conversations,
  defaultMessages,
  streamResponse,
  type Message,
} from '@/data/mock';

export function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const conversation = conversations.find((c) => c.id === id);
  const seed = (id && conversationMessages[id]) || defaultMessages;

  const [messages, setMessages] = useState<Message[]>(seed);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [titleEditing, setTitleEditing] = useState(false);
  const [title, setTitle] = useState(conversation?.title || 'New conversation');
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setMessages((id && conversationMessages[id]) || defaultMessages);
    setTitle(conversation?.title || 'New conversation');
    return () => {
      cancelRef.current?.();
    };
  }, [id, conversation?.title]);

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

  return (
    <>
      {/* chat-header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.625rem 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          flexShrink: 0,
          minHeight: 52,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          {titleEditing ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setTitleEditing(false);
              }}
              className="carbon-input"
              style={{ maxWidth: 400, fontSize: '0.9375rem', fontWeight: 600, padding: '0.25rem 0.5rem' }}
            />
          ) : (
            <button
              onClick={() => setTitleEditing(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--d-text)',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--d-radius-sm)',
                maxWidth: 560,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
              <Edit3 size={12} style={{ color: 'var(--d-text-muted)', flexShrink: 0, opacity: 0.6 }} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <HeaderIconBtn icon={<GitBranch size={14} />} label="Branch" />
          <HeaderIconBtn icon={<Download size={14} />} label="Export" />
          <HeaderIconBtn icon={<MoreHorizontal size={14} />} label="More" />
        </div>
      </div>

      <ChatThread messages={messages} streaming={streaming} streamingText={streamingText} />
      <ChatInput onSend={handleSend} disabled={streaming} />
    </>
  );
}

function HeaderIconBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      className="d-interactive"
      data-variant="ghost"
      style={{ padding: '0.375rem 0.5rem', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
