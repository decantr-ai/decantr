import { css } from '@decantr/css';
import { useParams } from 'react-router-dom';
import { Send, Paperclip, BarChart3 } from 'lucide-react';
import { Button, Avatar, Badge } from '@/components';

const agentMap: Record<string, { name: string; category: string; status: string; color: string }> = {
  'code-reviewer': { name: 'Code Reviewer', category: 'Code', status: 'online', color: '#6366f1' },
  'data-analyst': { name: 'Data Analyst', category: 'Data', status: 'online', color: '#06b6d4' },
  'content-writer': { name: 'Content Writer', category: 'Writing', status: 'busy', color: '#f59e0b' },
  'devops-pilot': { name: 'DevOps Pilot', category: 'DevOps', status: 'offline', color: '#ef4444' },
  'security-scanner': { name: 'Security Scanner', category: 'Security', status: 'online', color: '#10b981' },
  'api-architect': { name: 'API Architect', category: 'Code', status: 'online', color: '#8b5cf6' },
};

const messages = [
  {
    role: 'user' as const,
    content: 'Review this pull request for security issues and suggest fixes.',
    time: '10:24 AM',
  },
  {
    role: 'agent' as const,
    content: `I've completed the security review of your pull request. Here are my findings:

**Finding 1 -- SQL Injection in user query**
The query builder concatenates user input directly. This should use parameterized queries.

\`\`\`ts
// Before (vulnerable)
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// After (safe)
const query = db.select().from(users).where(eq(users.id, userId));
\`\`\`

**Finding 2 -- Missing rate limiting on auth endpoint**
The \`/api/auth/login\` endpoint has no rate limiting, making it vulnerable to brute-force attacks. Add middleware:

\`\`\`ts
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));
\`\`\`

**Finding 3 -- Exposed stack traces in production**
Error handler returns full stack traces. Wrap with environment check to return generic messages in production.

Overall severity: **Medium**. Two of three issues are straightforward fixes.`,
    time: '10:24 AM',
  },
  {
    role: 'user' as const,
    content: 'Can you also check the authentication middleware?',
    time: '10:26 AM',
  },
  {
    role: 'agent' as const,
    content: `Analyzed the authentication middleware. The implementation is mostly solid, but I found two areas to address:

1. **Token expiry not validated** -- The JWT verification checks signature but not the \`exp\` claim. Add explicit expiry validation.

\`\`\`ts
const decoded = jwt.verify(token, secret, { algorithms: ['HS256'], maxAge: '1h' });
\`\`\`

2. **Session fixation risk** -- After successful login, the session ID is not regenerated. Call \`req.session.regenerate()\` post-authentication.

The CORS configuration and CSRF protection look correctly implemented.`,
    time: '10:27 AM',
  },
];

function renderContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const code = part.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
      return (
        <pre key={i} className="carbon-code" style={{ margin: '8px 0', overflowX: 'auto' }}>
          <code>{code}</code>
        </pre>
      );
    }
    // Handle bold markdown
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={i}>
        {boldParts.map((bp, j) => {
          if (bp.startsWith('**') && bp.endsWith('**')) {
            return <strong key={j}>{bp.slice(2, -2)}</strong>;
          }
          // Handle inline code
          const inlineParts = bp.split(/(`[^`]+`)/g);
          return inlineParts.map((ip, k) => {
            if (ip.startsWith('`') && ip.endsWith('`')) {
              return (
                <code
                  key={`${j}-${k}`}
                  style={{
                    background: 'color-mix(in srgb, var(--d-muted) 20%, var(--d-surface))',
                    padding: '1px 5px',
                    borderRadius: 4,
                    fontSize: '0.9em',
                  }}
                >
                  {ip.slice(1, -1)}
                </code>
              );
            }
            return ip;
          });
        })}
      </span>
    );
  });
}

export function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const agent = agentMap[id ?? ''] ?? { name: 'Unknown Agent', category: 'Code', status: 'offline', color: '#666' };

  return (
    <div className={css('_flex _row _flex1 _minh0')}>
      {/* Main chat area */}
      <div className={css('_flex _col _flex1 _minh0')}>
        {/* Chat header */}
        <div
          className={css('_flex _row _aic _jcsb _px4 _py3 _shrink0')}
          style={{ borderBottom: '1px solid color-mix(in srgb, var(--d-muted) 15%, var(--d-surface))' }}
        >
          <div className={css('_flex _row _aic _gap3')}>
            <div
              className={css('_flex _aic _jcc _roundedfull _shrink0 _fontsemi')}
              style={{ width: 32, height: 32, background: agent.color, color: '#fff', fontSize: 13 }}
            >
              {agent.name.charAt(0)}
            </div>
            <span className={css('_fontsemi')}>{agent.name}</span>
            <span className={`status-pulse status-pulse-${agent.status}`} />
            <Badge>{agent.category}</Badge>
          </div>
          <Button variant="ghost" size="sm">
            <BarChart3 size={14} />
            View metrics
          </Button>
        </div>

        {/* Messages area */}
        <div className={css('_flex _col _flex1 _overyauto _py4 _px4')}>
          <div style={{ maxWidth: 768, width: '100%', margin: '0 auto' }} className={css('_flex _col _gap4')}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={css('_flex _row _gap3') + (msg.role === 'user' ? ' carbon-bubble-user' : ' carbon-bubble-ai')}
              >
                <div className={css('_shrink0 _mt1')}>
                  {msg.role === 'user' ? (
                    <Avatar name="You" size="sm" />
                  ) : (
                    <div
                      className={css('_flex _aic _jcc _roundedfull _fontsemi')}
                      style={{ width: 28, height: 28, background: agent.color, color: '#fff', fontSize: 11 }}
                    >
                      {agent.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={css('_flex _col _flex1 _minh0')}>
                  <div className={css('_flex _row _aic _gap2 _mb1')}>
                    <span className={css('_textsm _fontsemi')}>{msg.role === 'user' ? 'You' : agent.name}</span>
                    <span className={css('_textxs _fgmuted')}>{msg.time}</span>
                  </div>
                  <div className={css('_textsm _prewrap _breakword')} style={{ lineHeight: 1.65 }}>
                    {renderContent(msg.content)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div
          className={css('_shrink0 _px4 _py3')}
          style={{ borderTop: '1px solid color-mix(in srgb, var(--d-muted) 15%, var(--d-surface))' }}
        >
          <div style={{ maxWidth: 768, margin: '0 auto' }}>
            <div className={css('_flex _aic _gap3 _p3 _rounded') + ' carbon-card'}>
              <button
                className={css('_flex _aic _jcc _p2 _rounded _fgmuted _trans _pointer') + ' btn-ghost'}
                aria-label="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <input
                type="text"
                placeholder="Send a message..."
                className={css('_flex1 _textbase')}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--d-text)' }}
              />
              <button
                className={css('_flex _aic _jcc _p2 _roundedfull _trans _pointer') + ' btn-primary'}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className={css('_textxs _fgmuted _mt2')} style={{ textAlign: 'center' }}>
              Agents may produce inaccurate information. Verify critical outputs independently.
            </p>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div
        className={css('_flex _col _shrink0 _p4 _gap4 _overyauto')}
        style={{
          width: 240,
          borderLeft: '1px solid color-mix(in srgb, var(--d-muted) 15%, var(--d-surface))',
        }}
      >
        {/* Agent identity */}
        <div className={css('_flex _col _aic _gap2')}>
          <div
            className={css('_flex _aic _jcc _roundedfull _fontbold')}
            style={{ width: 48, height: 48, background: agent.color, color: '#fff', fontSize: 18 }}
          >
            {agent.name.charAt(0)}
          </div>
          <span className={css('_fontsemi')}>{agent.name}</span>
          <div className={css('_flex _row _aic _gap2')}>
            <span className={`status-pulse status-pulse-${agent.status}`} />
            <span className={css('_textxs _fgmuted')} style={{ textTransform: 'capitalize' }}>
              {agent.status}
            </span>
          </div>
        </div>

        <div className="carbon-divider" />

        {/* Stats */}
        <div className={css('_flex _col _gap3')}>
          {[
            { label: 'Uptime', value: '99.8%' },
            { label: 'Avg response', value: '1.2s' },
            { label: 'Success rate', value: '97.3%' },
          ].map((stat) => (
            <div key={stat.label} className={css('_flex _jcsb _aic')}>
              <span className={css('_textxs _fgmuted')}>{stat.label}</span>
              <span className={css('_textsm _fontsemi') + ' metric-value'}>{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="carbon-divider" />

        {/* Configuration */}
        <div className={css('_flex _col _gap3')}>
          <span className={css('_textxs _fgmuted _fontsemi')} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Configuration
          </span>
          {[
            { label: 'Model', value: 'Claude 4 Sonnet' },
            { label: 'Temperature', value: '0.3' },
            { label: 'Max tokens', value: '4096' },
          ].map((cfg) => (
            <div key={cfg.label} className={css('_flex _jcsb _aic')}>
              <span className={css('_textxs _fgmuted')}>{cfg.label}</span>
              <span className={css('_textxs') + ' metric-value'}>{cfg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
