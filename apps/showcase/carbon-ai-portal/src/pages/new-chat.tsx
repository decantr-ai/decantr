import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatPortalShell } from '../shells/chat-portal';
import { recentConversations } from '../mock-data';

function ChatSidebar() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ padding: '1rem' }}>
        <Link
          to="/chat/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.5rem',
            fontSize: 13,
            fontWeight: 600,
            color: '#18181B',
            background: 'var(--d-primary)',
            borderRadius: 'var(--d-radius)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + New Chat
        </Link>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 0.5rem' }}>
        <div
          style={{
            padding: '0.5rem 0.75rem',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--d-text-muted)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
          }}
        >
          Recent
        </div>
        {recentConversations.map((conv) => (
          <div
            key={conv.id}
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--d-radius-sm)',
              cursor: 'pointer',
              marginBottom: '0.125rem',
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: 'var(--d-text)',
                whiteSpace: 'nowrap' as const,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {conv.topic}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--d-text-muted)',
                marginTop: '0.125rem',
              }}
            >
              {conv.lastActive}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--d-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--d-radius-full)',
            background: 'var(--d-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: '#18181B',
          }}
        >
          U
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--d-text)' }}>
            User
          </div>
          <div style={{ fontSize: 11, color: 'var(--d-text-muted)' }}>
            Free Plan
          </div>
        </div>
      </div>
    </div>
  );
}

export function NewChatPage() {
  const [inputValue, setInputValue] = useState('');

  return (
    <ChatPortalShell sidebar={<ChatSidebar />}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Empty state */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' as const }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--d-radius-full)',
                background: 'var(--d-surface)',
                border: '1px solid var(--d-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: 24,
                color: 'var(--d-primary)',
              }}
            >
              C
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: 'var(--d-text)',
                marginBottom: '0.5rem',
              }}
            >
              Start a new conversation
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--d-text-muted)',
                maxWidth: 360,
              }}
            >
              Ask anything about your codebase, debug issues, or get help with
              best practices.
            </p>
          </div>
        </div>

        {/* Input bar */}
        <div
          style={{
            borderTop: '1px solid var(--d-border)',
            padding: '1rem 2rem',
            background: 'var(--d-surface)',
          }}
        >
          <div
            style={{
              maxWidth: 720,
              margin: '0 auto',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Send a message..."
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                fontSize: 14,
                color: 'var(--d-text)',
                background: 'var(--d-surface-raised)',
                border: '1px solid var(--d-border)',
                borderRadius: 'var(--d-radius)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: 14,
                fontWeight: 600,
                color: '#18181B',
                background: 'var(--d-primary)',
                border: 'none',
                borderRadius: 'var(--d-radius)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </ChatPortalShell>
  );
}
