import { css } from '@decantr/css';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronRight, Tag, ArrowLeft, Sparkles } from 'lucide-react';
import { changelogEntries } from '../data/mock';

export function ChangelogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const entry = changelogEntries.find((e) => e.id === id);

  if (!entry) {
    return <Navigate to="/changelog" replace />;
  }

  return (
    <div className="entrance-fade" style={{ maxWidth: '42rem', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <nav className={css('_flex _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <Link to="/changelog" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.75rem' }}>Changelog</Link>
        <ChevronRight size={10} style={{ color: 'var(--d-text-muted)' }} />
        <span style={{ color: 'var(--d-text)', fontSize: '0.75rem', fontWeight: 600 }}>v{entry.version}</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div className={css('_flex _center')} style={{ marginBottom: '1rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--d-radius-lg)', background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={28} style={{ color: 'var(--d-accent)' }} />
          </div>
        </div>
        <div className={css('_flex _center _gap2')} style={{ marginBottom: '0.75rem' }}>
          <span className="d-annotation" data-status={entry.type === 'major' ? 'warning' : 'info'}>
            <Tag size={10} />
            v{entry.version}
          </span>
          <span style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>
            {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>{entry.title}</h1>
        <p style={{ color: 'var(--d-text-muted)', maxWidth: '32rem', margin: '0 auto' }}>{entry.summary}</p>
      </div>

      {/* Highlights */}
      {entry.highlights.length > 0 && (
        <div className="paper-card" style={{ padding: 'var(--d-surface-p)', marginBottom: '2rem' }}>
          <h3 className={css('_fontmedium')} style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Highlights</h3>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {entry.highlights.map((h, i) => (
              <li key={i} className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--d-accent)', flexShrink: 0 }} />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content */}
      <article className="paper-prose paper-fade" dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.content) }} />

      {/* Back */}
      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)' }}>
        <Link
          to="/changelog"
          className={css('_flex _aic _gap1 _textsm')}
          style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}
        >
          <ArrowLeft size={14} />
          Back to Changelog
        </Link>
      </div>
    </div>
  );
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/^(?!<[huplbo])((?!^\s*$).+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}
