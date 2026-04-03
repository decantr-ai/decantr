import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Tag } from 'lucide-react';
import { changelogEntries } from '../data/mock';

function VersionBadge({ type }: { type: 'major' | 'minor' | 'patch' }) {
  const colors: Record<string, { bg: string; color: string }> = {
    major: { bg: 'color-mix(in srgb, var(--d-accent) 15%, transparent)', color: 'var(--d-accent)' },
    minor: { bg: 'color-mix(in srgb, var(--d-primary) 15%, transparent)', color: 'var(--d-primary)' },
    patch: { bg: 'color-mix(in srgb, var(--d-text-muted) 15%, transparent)', color: 'var(--d-text-muted)' },
  };
  const c = colors[type];
  return (
    <span className="d-annotation" style={{ background: c.bg, color: c.color }}>
      {type}
    </span>
  );
}

export function ChangelogPage() {
  return (
    <div className="entrance-fade" style={{ maxWidth: '48rem', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className={css('_flex _center')} style={{ marginBottom: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--d-radius-lg)', background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} style={{ color: 'var(--d-accent)' }} />
          </div>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Changelog</h1>
        <p style={{ color: 'var(--d-text-muted)', maxWidth: '28rem', margin: '0 auto' }}>
          Track the evolution of Knowledge Base. Every improvement, fix, and new feature documented here.
        </p>
      </div>

      <div className={css('_flex _col')} style={{ gap: '2rem' }}>
        {changelogEntries.map((entry) => (
          <div key={entry.id} className="paper-celebration paper-fade">
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
              <VersionBadge type={entry.type} />
              <span className={css('_fontsemi')} style={{ fontSize: '0.875rem' }}>
                <Tag size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                v{entry.version}
              </span>
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>
                {formatDate(entry.date)}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <Link
                to={`/changelog/${entry.id}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--d-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit'; }}
              >
                {entry.title}
              </Link>
            </h2>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              {entry.summary}
            </p>
            {entry.highlights.length > 0 && (
              <ul style={{ margin: '0 0 0.75rem 0', padding: 0, listStyle: 'none' }}>
                {entry.highlights.map((h, i) => (
                  <li key={i} className={css('_flex _aic _gap2 _textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--d-primary)', flexShrink: 0 }} />
                    {h}
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={`/changelog/${entry.id}`}
              className={css('_flex _aic _gap1 _textsm')}
              style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}
            >
              Read full release notes <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
