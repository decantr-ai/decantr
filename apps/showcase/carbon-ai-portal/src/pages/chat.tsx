import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatPortalShell } from '../shells/chat-portal';
import { chatMessages, recentConversations } from '../mock-data';

function ChatSidebar() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* New chat button */}
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

      {/* Conversation list */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0 0.5rem',
        }}
      >
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
              background:
                conv.id === 'conv-1' ? 'var(--d-surface-raised)' : 'transparent',
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

      {/* User avatar at bottom */}
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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--d-text)' }}>
            User
          </div>
          <div style={{ fontSize: 11, color: 'var(--d-text-muted)' }}>
            Free Plan
          </div>
        </div>
        <Link
          to="/login"
          style={{
            fontSize: 11,
            color: 'var(--d-text-muted)',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--d-radius-sm)',
            border: '1px solid var(--d-border)',
          }}
        >
          Sign out
        </Link>
      </div>
    </div>
  );
}

function renderMessageContent(content: string) {
  // Split by code blocks and render them with dark background
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      // Strip the ``` markers and optional language tag
      const inner = part.slice(3, -3);
      const newlineIndex = inner.indexOf('\n');
      const code = newlineIndex >= 0 ? inner.slice(newlineIndex + 1) : inner;
      return (
        <pre
          key={i}
          style={{
            background: 'var(--d-bg)',
            border: '1px solid var(--d-border)',
            borderRadius: 'var(--d-radius-sm)',
            padding: '0.75rem 1rem',
            margin: '0.75rem 0',
            fontSize: 12.5,
            lineHeight: 1.5,
            overflow: 'auto',
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
          }}
        >
          <code>{code}</code>
        </pre>
      );
    }
    // Render inline code and bold
    const segments = part.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {segments.map((seg, j) => {
          if (seg.startsWith('`') && seg.endsWith('`')) {
            return (
              <code
                key={j}
                style={{
                  background: 'var(--d-bg)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: 'var(--d-radius-sm)',
                  fontSize: '0.85em',
                  fontFamily:
                    "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                }}
              >
                {seg.slice(1, -1)}
              </code>
            );
          }
          if (seg.startsWith('**') && seg.endsWith('**')) {
            return (
              <strong key={j} style={{ fontWeight: 600 }}>
                {seg.slice(2, -2)}
              </strong>
            );
          }
          // Preserve newlines
          return seg.split('\n').map((line, k, arr) => (
            <React.Fragment key={`${j}-${k}`}>
              {line}
              {k < arr.length - 1 && <br />}
            </React.Fragment>
          ));
        })}
      </span>
    );
  });
}

export function ChatPage() {
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
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '2rem',
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent:
                    msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '0.875rem 1.125rem',
                    borderRadius: 'var(--d-radius-lg)',
                    background:
                      msg.role === 'user'
                        ? 'var(--d-primary)'
                        : 'var(--d-surface)',
                    color:
                      msg.role === 'user' ? '#18181B' : 'var(--d-text)',
                    fontSize: 14,
                    lineHeight: 1.65,
                    border:
                      msg.role === 'assistant'
                        ? '1px solid var(--d-border)'
                        : 'none',
                  }}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}
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
