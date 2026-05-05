import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, Tag, ArrowRight } from 'lucide-react';
import { workspaceItems } from '@/data/mock';
import { ChatThread } from '@/components/ChatThread';
import { ChatInput } from '@/components/ChatInput';
import type { CopilotMessage } from '@/data/mock';

const recentMessages: CopilotMessage[] = [
  {
    id: 'ws-1',
    role: 'assistant',
    content: 'Welcome back. You have **3 active projects** and **2 tasks** due today. Here\'s a quick summary:\n\n- API Gateway Refactor — middleware chain PR ready for review\n- Design System v3 — token migration 80% complete\n- User Onboarding — wireframes approved, dev starting today\n\nWhat would you like to focus on?',
    timestamp: '9:00 AM',
    context: 'Workspace',
  },
];

export function WorkspacePage() {
  const [messages, setMessages] = useState<CopilotMessage[]>(recentMessages);

  const handleSend = (content: string) => {
    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const aiMsg: CopilotMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: 'I\'ll look into that for you. Based on your workspace context, here are some relevant insights...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      context: 'Workspace',
    };
    setMessages(prev => [...prev, userMsg, aiMsg]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Workspace</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
            Your active projects and conversations
          </p>
        </div>
        <button
          className="d-interactive"
          data-variant="primary"
          style={{ border: 'none', fontSize: '0.8125rem' }}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Projects grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {workspaceItems.map(item => (
          <Link
            key={item.id}
            to={`/workspace/${item.id}`}
            className="d-surface carbon-card"
            data-interactive
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.title}</h3>
              <span
                className="d-annotation"
                data-status={item.status === 'active' ? 'success' : item.status === 'draft' ? 'warning' : undefined}
              >
                {item.status}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>
              {item.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {item.tags.map(tag => (
                  <span key={tag} className="d-annotation" style={{ fontSize: '0.625rem' }}>
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
                <Clock size={12} />
                {item.updatedAt}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Inline chat thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 300 }}>
        <h2 className="d-label" style={{
          borderLeft: '2px solid var(--d-accent)',
          paddingLeft: '0.5rem',
          marginBottom: '0.75rem',
        }}>
          RECENT ACTIVITY
        </h2>
        <div className="d-surface carbon-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ChatThread messages={messages} />
          <ChatInput onSend={handleSend} placeholder="Ask about your workspace..." />
        </div>
      </div>
    </div>
  );
}
