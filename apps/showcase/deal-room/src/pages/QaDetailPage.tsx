import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { qaThreads } from '@/data/mock';

const mockReplies = [
  { id: 'r-1', author: 'Victoria Ashworth', avatar: 'VA', content: 'This is a critical area. I have requested the management team to provide detailed revenue breakdowns by contract type, with specific recognition timing for each category.', time: '2026-04-04 10:15' },
  { id: 'r-2', author: 'Robert Chen', avatar: 'RC', content: 'Thank you. Can we also get the deferred revenue schedule and any changes in recognition methodology over the past 3 years?', time: '2026-04-04 11:30' },
  { id: 'r-3', author: 'Victoria Ashworth', avatar: 'VA', content: 'Management has confirmed they will provide the full schedule by end of week. They have been consistent with ASC 606 adoption since 2023.', time: '2026-04-04 14:22' },
];

export function QaDetailPage() {
  const { id } = useParams();
  const thread = qaThreads.find(q => q.id === id) || qaThreads[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <NavLink to="/qa" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Q&A
      </NavLink>

      <PageHeader
        title={thread.subject}
        description={`${thread.category} · Asked by ${thread.askedBy}`}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="d-annotation" data-status={thread.status === 'open' ? 'warning' : thread.status === 'answered' ? 'success' : undefined}>{thread.status}</span>
            <span className="d-annotation" data-status={thread.priority === 'high' ? 'error' : thread.priority === 'medium' ? 'warning' : 'info'}>{thread.priority}</span>
          </div>
        }
      />

      {/* Replies */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mockReplies.map((reply, i) => (
          <div key={reply.id} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="dr-monogram" style={{ width: 28, height: 28, fontSize: '0.55rem' }}>{reply.avatar}</div>
              {i < mockReplies.length - 1 && <div className="dr-thread-line" style={{ flex: 1, minHeight: 20 }} />}
            </div>
            <div className="dr-card" style={{ padding: '1rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--d-font-display)' }}>{reply.author}</span>
                <span className="mono-data" style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>{reply.time}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--d-text)', lineHeight: 1.6 }}>{reply.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply input */}
      <div className="dr-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
        <textarea
          className="d-control"
          placeholder="Write a reply..."
          rows={2}
          style={{ resize: 'vertical', flex: 1 }}
        />
        <button className="d-interactive" data-variant="primary" style={{ flexShrink: 0, fontSize: '0.8rem' }}>
          <Send size={14} /> Reply
        </button>
      </div>
    </div>
  );
}
