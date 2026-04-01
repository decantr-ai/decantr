import { useParams } from 'react-router-dom';
import { css } from '@decantr/css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const sampleMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'How do I implement a debounce hook in React?',
    time: '2:14 PM',
  },
  {
    id: '2',
    role: 'assistant',
    content: `Here's a clean implementation of a \`useDebounce\` hook:\n\n\`\`\`typescript\nimport { useState, useEffect } from 'react';\n\nexport function useDebounce<T>(value: T, delay: number): T {\n  const [debounced, setDebounced] = useState(value);\n\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n\n  return debounced;\n}\n\`\`\`\n\nThis hook takes any value and a delay in milliseconds. It returns the debounced value that only updates after the specified delay has passed without any new changes. Perfect for search inputs or API calls triggered by user typing.`,
    time: '2:14 PM',
  },
  {
    id: '3',
    role: 'user',
    content: 'Can you show me how to use it with a search input?',
    time: '2:15 PM',
  },
  {
    id: '4',
    role: 'assistant',
    content: `Sure! Here's how you'd use it in a search component:\n\n\`\`\`tsx\nfunction SearchBar() {\n  const [query, setQuery] = useState('');\n  const debouncedQuery = useDebounce(query, 300);\n\n  useEffect(() => {\n    if (debouncedQuery) {\n      searchAPI(debouncedQuery);\n    }\n  }, [debouncedQuery]);\n\n  return (\n    <input\n      value={query}\n      onChange={(e) => setQuery(e.target.value)}\n      placeholder="Search..."\n    />\n  );\n}\n\`\`\`\n\nThe search API will only be called 300ms after the user stops typing, preventing unnecessary requests.`,
    time: '2:15 PM',
  },
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={css('_flex _col _gap1') + ' carbon-fade-slide'}>
      <div className={isUser ? 'carbon-bubble-user' : 'carbon-bubble-ai'}>
        <p className={css('_textsm _fgtext _prewrap')} style={{ lineHeight: 1.7 }}>
          {msg.content}
        </p>
      </div>
      <span
        className={css('_textxs _fgmuted')}
        style={isUser ? { textAlign: 'right' } : undefined}
      >
        {msg.time}
      </span>
    </div>
  );
}

export function ChatPage() {
  const { id } = useParams();

  return (
    <div className={css('_flex _col _flex1')}>
      {/* Header */}
      <header
        className={css('_flex _aic _jcsb _px6 _py3')}
        style={{ borderBottom: '1px solid var(--d-border)' }}
      >
        <div>
          <h1 className={css('_textsm _fontsemi _fgtext')}>Conversation #{id}</h1>
          <p className={css('_textxs _fgmuted')}>4 messages</p>
        </div>
        <button
          className={css('_textsm _fgmuted _px3 _py1 _rounded _pointer')}
          style={{ border: '1px solid var(--d-border)', background: 'transparent' }}
        >
          Export
        </button>
      </header>

      {/* Messages */}
      <div className={css('_flex1 _overauto _px6 _py6')}>
        <div className={css('_flex _col _gap6')} style={{ maxWidth: 720, margin: '0 auto' }}>
          {sampleMessages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </div>
      </div>

      {/* Input */}
      <div className={css('_p4')} style={{ borderTop: '1px solid var(--d-border)' }}>
        <div className={css('_flex _gap3')} style={{ maxWidth: 720, margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Send a message..."
            className={css('_flex1 _px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
            style={{ background: 'var(--d-surface)', outline: 'none' }}
          />
          <button
            className={css('_bgprimary _fgtext _fontsemi _px5 _py3 _rounded _textsm _pointer')}
            style={{ border: 'none' }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
