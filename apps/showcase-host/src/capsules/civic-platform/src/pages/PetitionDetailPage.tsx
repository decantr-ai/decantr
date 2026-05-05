import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft, ThumbsUp, ThumbsDown, Minus, MessageSquare, Share2, Flag } from 'lucide-react';
import { petitions } from '@/data/mock';

export function PetitionDetailPage() {
  const { id } = useParams();
  const petition = petitions.find(p => p.id === id) || petitions[0];
  const pct = Math.min(100, Math.round((petition.signatures / petition.goal) * 100));
  const totalVotes = petition.votes.yes + petition.votes.no + petition.votes.abstain;

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: 800 }}>
      {/* Back link */}
      <Link to="/engage/petitions" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--d-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Petitions
      </Link>

      {/* Hero */}
      <div>
        <div className={css('_flex _gap2 _aic _mb2')}>
          <span className="gov-badge" style={{
            background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)',
            color: 'var(--d-primary)', fontSize: '0.75rem', padding: '0.125rem 0.625rem',
          }}>{petition.category}</span>
          <span className="d-annotation" data-status={petition.status === 'active' ? 'success' : 'info'}>
            {petition.status}
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{petition.title}</h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
          Started by <strong>{petition.author}</strong> on {petition.createdAt}
        </div>
        <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>{petition.description}</p>

        {/* Signature progress */}
        <div className="d-surface gov-card" style={{ padding: '1.25rem' }}>
          <div className={css('_flex _jcsb _aic')} style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{petition.signatures.toLocaleString()}</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>of {petition.goal.toLocaleString()} signatures</span>
          </div>
          <div style={{ height: 10, background: 'var(--d-surface-raised)', borderRadius: 2, overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: pct >= 100 ? 'var(--d-success)' : 'var(--d-primary)',
              borderRadius: 2,
              transition: 'width 1s ease',
            }} />
          </div>
          <div className={css('_flex _gap3')}>
            <button className="d-interactive" data-variant="primary" style={{ flex: 1, justifyContent: 'center' }}>
              Sign This Petition
            </button>
            <button className="d-interactive" data-variant="ghost" aria-label="Share">
              <Share2 size={16} />
            </button>
            <button className="d-interactive" data-variant="ghost" aria-label="Report">
              <Flag size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Votes */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          VOTING BREAKDOWN
        </div>
        <div className="d-surface gov-card" style={{ padding: '1.25rem' }}>
          <div className={css('_flex _gap4 _wrap')}>
            {[
              { label: 'Yes', count: petition.votes.yes, icon: ThumbsUp, color: 'var(--d-success)' },
              { label: 'No', count: petition.votes.no, icon: ThumbsDown, color: 'var(--d-error)' },
              { label: 'Abstain', count: petition.votes.abstain, icon: Minus, color: 'var(--d-text-muted)' },
            ].map(v => (
              <div key={v.label} className={css('_flex _col _aic')} style={{ flex: 1, minWidth: 80 }}>
                <v.icon size={20} style={{ color: v.color, marginBottom: '0.375rem' }} aria-hidden />
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{v.count}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{v.label}</div>
              </div>
            ))}
          </div>
          {/* Stacked bar */}
          {totalVotes > 0 && (
            <div className={css('_flex')} style={{ height: 8, borderRadius: 2, overflow: 'hidden', marginTop: '1rem' }}>
              <div style={{ width: `${(petition.votes.yes / totalVotes) * 100}%`, background: 'var(--d-success)' }} />
              <div style={{ width: `${(petition.votes.no / totalVotes) * 100}%`, background: 'var(--d-error)' }} />
              <div style={{ width: `${(petition.votes.abstain / totalVotes) * 100}%`, background: 'var(--d-border)' }} />
            </div>
          )}
          <div className={css('_flex _gap3 _jcc')} style={{ marginTop: '0.75rem' }}>
            <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem' }}>
              <ThumbsUp size={14} /> Vote Yes
            </button>
            <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem' }}>
              <ThumbsDown size={14} /> Vote No
            </button>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          COMMENTS ({petition.comments.length})
        </div>
        <div className={css('_flex _col _gap3')}>
          {petition.comments.map((c, i) => (
            <div
              key={c.id}
              className="d-surface gov-card"
              style={{
                padding: '1rem',
                opacity: 0,
                animation: `decantr-entrance 0.3s ease forwards`,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className={css('_flex _jcsb _aic')} style={{ marginBottom: '0.5rem' }}>
                <div className={css('_flex _aic _gap2')}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 2,
                    background: 'var(--d-primary)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 600,
                  }}>
                    {c.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.author}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{c.date}</span>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{c.text}</p>
            </div>
          ))}
          {petition.comments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--d-text-muted)' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem' }}>No comments yet. Be the first to share your thoughts.</p>
            </div>
          )}
          {/* Add comment */}
          <div className="d-surface gov-card" style={{ padding: '1rem' }}>
            <textarea className="d-control gov-input" placeholder="Add a comment..." rows={3} style={{ marginBottom: '0.75rem', minHeight: '4rem' }} />
            <div className={css('_flex _jcfe')}>
              <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8125rem' }}>
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
