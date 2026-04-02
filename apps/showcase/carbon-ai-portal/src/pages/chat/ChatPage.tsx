import { css } from '@decantr/css';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Paperclip, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { ChatPortalShell } from '@/layouts/ChatPortalShell';
import { Avatar, Button } from '@/components';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const demoMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Can you explain how React Server Components work?',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    role: 'assistant',
    content: `React Server Components (RSC) are a new paradigm that allows components to run on the server. Here are the key concepts:

**Server Components** render on the server and send HTML to the client. They can directly access databases, file systems, and other server-only resources.

\`\`\`tsx
// This runs on the server
async function BlogPost({ id }: { id: string }) {
  const post = await db.posts.find(id);
  return <article>{post.content}</article>;
}
\`\`\`

**Key benefits:**
- Zero bundle size impact for server components
- Direct access to backend resources
- Automatic code splitting
- Streaming and progressive rendering

**Client Components** still work as before, using the \`"use client"\` directive when you need interactivity, state, or browser APIs.`,
    timestamp: '10:31 AM',
  },
  {
    id: '3',
    role: 'user',
    content: 'How does data fetching differ from traditional useEffect patterns?',
    timestamp: '10:33 AM',
  },
  {
    id: '4',
    role: 'assistant',
    content: `Great question. The shift is fundamental:

**Traditional (useEffect):**
\`\`\`tsx
function Posts() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(setPosts);
  }, []);
  return posts.map(p => <Post key={p.id} {...p} />);
}
\`\`\`

**Server Components:**
\`\`\`tsx
async function Posts() {
  const posts = await db.posts.findMany();
  return posts.map(p => <Post key={p.id} {...p} />);
}
\`\`\`

The server component approach eliminates waterfalls, reduces client-side JavaScript, and provides a more natural data-fetching experience. No loading states needed for the initial render since data is available before the component reaches the client.`,
    timestamp: '10:34 AM',
  },
];

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={css('_flex _gap3') + ' carbon-fade-slide'} style={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && <Avatar size="sm" fallback="AI" />}
      <div className={isUser ? 'carbon-bubble-user' : 'carbon-bubble-ai'}>
        <div className={css('_textsm _prewrap _breakword')} style={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </div>
        <div className={css('_flex _aic _jcsb _mt2')}>
          <span className={css('_textxs _fgmuted')}>{message.timestamp}</span>
          {!isUser && (
            <div className={css('_flex _aic _gap1')}>
              <button className={css('_flex _aic _jcc _p1 _rounded _trans') + ' btn-ghost'} title="Copy">
                <Copy size={12} />
              </button>
              <button className={css('_flex _aic _jcc _p1 _rounded _trans') + ' btn-ghost'} title="Good response">
                <ThumbsUp size={12} />
              </button>
              <button className={css('_flex _aic _jcc _p1 _rounded _trans') + ' btn-ghost'} title="Bad response">
                <ThumbsDown size={12} />
              </button>
              <button className={css('_flex _aic _jcc _p1 _rounded _trans') + ' btn-ghost'} title="Regenerate">
                <RotateCcw size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
      {isUser && <Avatar size="sm" />}
    </div>
  );
}

function ChatInput() {
  const [message, setMessage] = useState('');

  return (
    <div className={css('_p4')} style={{ borderTop: '1px solid var(--d-border)' }}>
      <div className={css('_flex _aic _gap3')}>
        <button className={css('_flex _aic _jcc _p2 _rounded _trans _shrink0') + ' btn-ghost'} title="Attach file">
          <Paperclip size={18} />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          className={css('_flex1 _px4 _py3 _textbase _rounded _bgbg _fgtext _bw1') + ' carbon-input'}
          onKeyDown={(e) => { if (e.key === 'Enter' && message.trim()) setMessage(''); }}
        />
        <Button
          variant="primary"
          size="md"
          disabled={!message.trim()}
          onClick={() => setMessage('')}
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}

export function ChatPage() {
  const { id } = useParams();

  return (
    <ChatPortalShell mode="chat">
      <div className={css('_flex1 _overyauto _p6')}>
        <div className={css('_flex _col _gap6')} style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Chat header */}
          <div className={css('_flex _aic _gap3 _pb4')} style={{ borderBottom: '1px solid var(--d-border)' }}>
            <span className={css('_fontsemi _textbase _fgtext')}>
              {id === '1' ? 'Explain quantum computing' : `Conversation ${id}`}
            </span>
          </div>

          {/* Messages */}
          {demoMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>

      <ChatInput />
    </ChatPortalShell>
  );
}
