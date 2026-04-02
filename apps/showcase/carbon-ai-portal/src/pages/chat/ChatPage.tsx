import { css } from '@decantr/css';
import { useParams } from 'react-router-dom';
import { Send, Paperclip, Bot, User } from 'lucide-react';
import { Avatar } from '@/components';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Can you help me refactor this React component to use proper TypeScript types?',
    time: '2:30 PM',
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Of course! I\'d be happy to help you refactor your React component with proper TypeScript types. Could you share the component code? Here are a few things I\'ll look for:\n\n1. **Props interface definition** -- Ensuring all props have explicit types\n2. **Event handler types** -- Using React.ChangeEvent, React.MouseEvent, etc.\n3. **State types** -- Proper typing for useState hooks\n4. **Return type** -- Explicit JSX.Element or ReactNode return types\n\nPlease paste the component and I\'ll provide a fully typed version.',
    time: '2:30 PM',
  },
  {
    id: '3',
    role: 'user',
    content: 'Here it is:\n\n```tsx\nfunction UserCard({ user, onSelect }) {\n  const [expanded, setExpanded] = useState(false);\n  return (\n    <div onClick={() => onSelect(user)}>\n      <h3>{user.name}</h3>\n      {expanded && <p>{user.bio}</p>}\n    </div>\n  );\n}\n```',
    time: '2:31 PM',
  },
  {
    id: '4',
    role: 'assistant',
    content: 'Here\'s the refactored version with proper TypeScript types:\n\n```tsx\ninterface User {\n  id: string;\n  name: string;\n  bio: string;\n}\n\ninterface UserCardProps {\n  user: User;\n  onSelect: (user: User) => void;\n}\n\nfunction UserCard({ user, onSelect }: UserCardProps) {\n  const [expanded, setExpanded] = useState<boolean>(false);\n  \n  return (\n    <div\n      role="button"\n      tabIndex={0}\n      onClick={() => onSelect(user)}\n      onKeyDown={(e: React.KeyboardEvent) => {\n        if (e.key === \'Enter\') onSelect(user);\n      }}\n    >\n      <h3>{user.name}</h3>\n      {expanded && <p>{user.bio}</p>}\n    </div>\n  );\n}\n```\n\nKey improvements:\n- Added `User` interface for the data model\n- Created explicit `UserCardProps` interface\n- Added keyboard accessibility with `onKeyDown`\n- Typed the `useState` hook explicitly',
    time: '2:32 PM',
  },
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={css('_flex _gap3 _mb4') + ' carbon-fade-slide'} style={{ flexDirection: isUser ? 'row-reverse' : 'row' }}>
      <div className={css('_shrink0 _mt1')}>
        {isUser ? (
          <Avatar name="You" size="sm" />
        ) : (
          <div
            className={css('_flex _aic _jcc _roundedfull')}
            style={{ width: 32, height: 32, background: 'color-mix(in srgb, var(--d-primary) 20%, var(--d-surface))' }}
          >
            <Bot size={16} style={{ color: 'var(--d-primary)' }} />
          </div>
        )}
      </div>
      <div className={isUser ? 'carbon-bubble-user' : 'carbon-bubble-ai'}>
        <div
          className={css('_textsm _prewrap _breakword')}
          style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
        >
          {msg.content}
        </div>
        <div className={css('_textxs _fgmuted _mt2')} style={{ opacity: 0.6 }}>{msg.time}</div>
      </div>
    </div>
  );
}

export function ChatPage() {
  const { id } = useParams();

  return (
    <div className={css('_flex _col _flex1 _minh0')}>
      {/* Chat header */}
      <div
        className={css('_flex _aic _jcsb _px6 _py3')}
        style={{ borderBottom: '1px solid var(--d-border)' }}
      >
        <div className={css('_flex _aic _gap3')}>
          <Bot size={18} style={{ color: 'var(--d-primary)' }} />
          <div>
            <div className={css('_fontsemi _textsm')}>Conversation #{id}</div>
            <div className={css('_textxs _fgmuted')}>Carbon AI Assistant</div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className={css('_flex1 _overyauto _px6 _py6')}>
        <div style={{ maxWidth: 768, marginInline: 'auto' }}>
          {mockMessages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className={css('_px6 _py4')} style={{ borderTop: '1px solid var(--d-border)' }}>
        <div style={{ maxWidth: 768, marginInline: 'auto' }}>
          <div className={css('_flex _aic _gap3 _p3 _rounded') + ' carbon-card'}>
            <button className={css('_flex _aic _jcc _p2 _rounded _fgmuted _trans _pointer') + ' btn-ghost'} aria-label="Attach file">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              placeholder="Send a message..."
              className={css('_flex1 _textbase')}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--d-text)',
              }}
            />
            <button
              className={css('_flex _aic _jcc _p2 _roundedfull _trans _pointer') + ' btn-primary'}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
          <p className={css('_textxs _fgmuted _textc _mt2')} style={{ opacity: 0.5 }}>
            Carbon AI can make mistakes. Review important information.
          </p>
        </div>
      </div>
    </div>
  );
}
