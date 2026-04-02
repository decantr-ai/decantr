import { css } from '@decantr/css';
import { useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import {
  ArrowUp,
  Paperclip,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  User,
  Bot,
} from 'lucide-react';

const sampleMessages = [
  {
    role: 'user' as const,
    content: 'Can you explain how React context works with TypeScript? I want to create a theme provider.',
  },
  {
    role: 'assistant' as const,
    content: `React Context with TypeScript involves creating a typed context, a provider component, and a custom hook for consumption. Here is a clean pattern:

First, define your context type and create the context:

\`\`\`typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);
\`\`\`

Then create a provider component that manages the state:

\`\`\`typescript
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
\`\`\`

Finally, create a typed hook that throws if used outside the provider:

\`\`\`typescript
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
\`\`\`

This pattern gives you full type safety, clear error messages, and a clean API for consumers.`,
  },
  {
    role: 'user' as const,
    content: 'Great. How do I persist the theme preference in localStorage?',
  },
  {
    role: 'assistant' as const,
    content: `Add a \`useEffect\` to the provider that reads from localStorage on mount and writes on change:

\`\`\`typescript
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' ? stored : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
\`\`\`

Key details: the lazy initializer in \`useState\` reads from localStorage only once. The effect syncs both localStorage and the DOM class on every change. This avoids flash-of-wrong-theme on page load.`,
  },
];

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';

  return (
    <div className={css('_flex _gap3 _mb4') + ' carbon-fade-slide'}>
      <div
        className={css('_flex _aic _jcc _shrink0 _roundedfull')}
        style={{
          width: '32px',
          height: '32px',
          background: isUser ? 'rgba(124,147,176,0.15)' : 'var(--d-surface-raised)',
          color: isUser ? 'var(--d-primary)' : 'var(--d-text-muted)',
          alignSelf: 'flex-start',
        }}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className={css('_flex _col _gap2 _flex1 _minw0')}>
        <span className={css('_textxs _fontsemi')} style={{ color: isUser ? 'var(--d-primary)' : 'var(--d-text-muted)' }}>
          {isUser ? 'You' : 'Carbon AI'}
        </span>
        <div
          className={
            isUser ? css('_textsm _fgtext') + ' carbon-bubble-user' : css('_textsm _fgtext') + ' carbon-bubble-ai'
          }
          style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, maxWidth: '100%' }}
        >
          {content}
        </div>
        {!isUser && (
          <div className={css('_flex _aic _gap1')}>
            <button className={css('_flex _aic _jcc _p1 _rounded _bordernone _trans _pointer _fgmuted') + ' btn-ghost'} aria-label="Copy">
              <Copy size={14} />
            </button>
            <button className={css('_flex _aic _jcc _p1 _rounded _bordernone _trans _pointer _fgmuted') + ' btn-ghost'} aria-label="Like">
              <ThumbsUp size={14} />
            </button>
            <button className={css('_flex _aic _jcc _p1 _rounded _bordernone _trans _pointer _fgmuted') + ' btn-ghost'} aria-label="Dislike">
              <ThumbsDown size={14} />
            </button>
            <button className={css('_flex _aic _jcc _p1 _rounded _bordernone _trans _pointer _fgmuted') + ' btn-ghost'} aria-label="Regenerate">
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className={css('_flex _col _flex1')}>
      {/* Chat header */}
      <div
        className={css('_flex _aic _jcsb _px6 _py2')}
        style={{ borderBottom: '1px solid var(--d-border)' }}
      >
        <span className={css('_textsm _fontsemi _fgtext')}>Conversation #{id}</span>
        <span className={css('_textxs _fgmuted')}>4 messages</span>
      </div>

      {/* Messages area */}
      <div className={css('_flex1 _overauto _px6 _py6')}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {sampleMessages.map((msg, i) => (
            <MessageBubble key={i} role={msg.role} content={msg.content} />
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div
        className={css('_px6 _py3')}
        style={{ borderTop: '1px solid var(--d-border)' }}
      >
        <form
          className={css('_flex _aic _gap2 _p2 _rounded') + ' carbon-card'}
          onSubmit={(e) => e.preventDefault()}
          style={{ maxWidth: '760px', margin: '0 auto', border: '1px solid var(--d-border)' }}
        >
          <button
            type="button"
            className={css('_flex _aic _jcc _p2 _rounded _bordernone _trans _pointer') + ' btn-ghost'}
            aria-label="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder="Type a follow-up..."
            className={css('_flex1 _textbase _bordernone')}
            style={{ background: 'transparent', outline: 'none', boxShadow: 'none' }}
          />
          <Button variant="primary" size="sm" icon={<ArrowUp size={16} />} type="submit">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
