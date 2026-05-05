import { css } from '@decantr/css';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { articles } from '../data/mock';
import { useState } from 'react';

export function DocDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articles[slug] : null;
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!article) {
    return <Navigate to="/docs" replace />;
  }

  return (
    <>
      {/* Empty list column placeholder for three-column shell */}
      <div
        className={css('_flex _col _shrink0')}
        style={{ width: 320, borderRight: '1px solid var(--d-border)', overflow: 'hidden' }}
      >
        <div
          className={css('_flex _aic _shrink0')}
          style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}
        >
          <span className={css('_textsm _fontmedium')}>Table of Contents</span>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {article.toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => { e.preventDefault(); setActiveSection(item.id); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); }}
              className="d-interactive"
              data-variant="ghost"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.375rem 0.75rem',
                paddingLeft: `${0.75 + (item.level - 2) * 0.75}rem`,
                borderRadius: 'var(--d-radius-sm)',
                fontSize: '0.8125rem',
                textDecoration: 'none',
                fontWeight: activeSection === item.id ? 600 : 400,
                color: activeSection === item.id ? 'var(--d-primary)' : 'var(--d-text-muted)',
                borderLeft: activeSection === item.id ? '2px solid var(--d-primary)' : '2px solid transparent',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--d-border)' }}>
          <Link
            to="/docs"
            className="d-interactive"
            data-variant="ghost"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', textDecoration: 'none' }}
          >
            Back to Docs
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className={css('_flex _col')} style={{ flex: 1, overflow: 'hidden' }}>
        <div className={css('_flex _aic _shrink0')} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--d-border)' }}>
          <nav className={css('_flex _aic _gap1')}>
            <Link to="/docs" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.75rem' }}>Docs</Link>
            <ChevronRight size={10} style={{ color: 'var(--d-text-muted)' }} />
            <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>{article.category}</span>
            <ChevronRight size={10} style={{ color: 'var(--d-text-muted)' }} />
            <span style={{ color: 'var(--d-text)', fontSize: '0.75rem', fontWeight: 600 }}>{article.title}</span>
          </nav>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <article className="paper-prose paper-fade" style={{ maxWidth: 680, margin: '0 auto' }}>
            <h1>{article.title}</h1>
            <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
              Last updated {article.lastUpdated} &middot; {article.readTime} read
            </p>
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }} />
          </article>
        </div>
      </div>
    </>
  );
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, (_m, t) => `<h3 id="${slugify(t)}">${t}</h3>`)
    .replace(/^## (.+)$/gm, (_m, t) => `<h2 id="${slugify(t)}">${t}</h2>`)
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\| (.+) \|$/gm, (row) => {
      const cells = row.split('|').filter(Boolean).map((c) => c.trim());
      return '<tr>' + cells.map((c) => `<td style="padding:0.5rem 1rem;border-bottom:1px solid var(--d-border)">${c}</td>`).join('') + '</tr>';
    })
    .replace(/^- \[([x ])\] (.+)$/gm, (_m, checked, text) =>
      `<li style="list-style:none"><input type="checkbox" ${checked === 'x' ? 'checked' : ''} disabled /> ${text}</li>`)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/^(?!<[huplboti])((?!^\s*$).+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
