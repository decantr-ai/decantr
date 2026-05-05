import { css } from '@decantr/css';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, FileText, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { docsTree, articles, flattenTree, type DocNode } from '../data/mock';

function TreeItem({ node, depth = 0, selectedSlug, onSelect }: { node: DocNode; depth?: number; selectedSlug: string | null; onSelect: (slug: string) => void }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.slug === selectedSlug;

  return (
    <div>
      <button
        className="d-interactive"
        data-variant="ghost"
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          else onSelect(node.slug);
        }}
        style={{
          width: '100%',
          padding: '0.375rem 0.75rem',
          paddingLeft: `${0.75 + depth * 0.75}rem`,
          borderRadius: 'var(--d-radius-sm)',
          textAlign: 'left',
          fontSize: '0.8125rem',
          fontWeight: isSelected ? 600 : 400,
          background: isSelected ? 'color-mix(in srgb, var(--d-primary) 10%, transparent)' : undefined,
          color: isSelected ? 'var(--d-primary)' : 'var(--d-text)',
          justifyContent: 'flex-start',
          gap: '0.375rem',
        }}
      >
        {hasChildren ? (
          <ChevronRight size={12} style={{ transform: expanded ? 'rotate(90deg)' : undefined, transition: 'transform 150ms', flexShrink: 0 }} />
        ) : (
          <FileText size={12} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
        )}
        {hasChildren ? <FolderOpen size={12} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} /> : null}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.title}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} selectedSlug={selectedSlug} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DocsPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>('installation');
  const navigate = useNavigate();
  const allArticles = flattenTree(docsTree).filter((n) => !n.children);
  const selectedArticle = selectedSlug ? articles[selectedSlug] : null;

  return (
    <>
      {/* Nav tree (rendered via portal-like approach -- actually we render inline) */}
      {/* List column */}
      <div
        className={css('_flex _col _shrink0')}
        style={{
          width: 320,
          borderRight: '1px solid var(--d-border)',
          overflow: 'hidden',
        }}
      >
        <div
          className={css('_flex _aic _jcsb _shrink0')}
          style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}
        >
          <span className={css('_textsm _fontmedium')}>Articles</span>
          <span className="d-annotation">{allArticles.length}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {allArticles.map((node) => {
            const article = articles[node.slug];
            if (!article) return null;
            const isActive = selectedSlug === node.slug;
            return (
              <button
                key={node.slug}
                className="d-interactive"
                data-variant="ghost"
                onClick={() => setSelectedSlug(node.slug)}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.25rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 0,
                  borderBottom: '1px solid var(--d-border)',
                  background: isActive ? 'color-mix(in srgb, var(--d-primary) 6%, transparent)' : undefined,
                  textAlign: 'left',
                }}
              >
                <span className={css('_textsm')} style={{ fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--d-primary)' : 'var(--d-text)' }}>
                  {article.title}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                  {article.excerpt}
                </span>
                <div className={css('_flex _aic _gap2')} style={{ marginTop: '0.125rem' }}>
                  <span className="d-annotation">{article.category}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{article.readTime}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail column */}
      <div className={css('_flex _col')} style={{ flex: 1, overflow: 'hidden' }}>
        {selectedArticle ? (
          <>
            <div
              className={css('_flex _aic _jcsb _shrink0')}
              style={{ padding: '0 1.5rem 1rem', borderBottom: '1px solid var(--d-border)', paddingTop: '1rem' }}
            >
              <div>
                <nav className={css('_flex _aic _gap1')} style={{ marginBottom: '0.5rem' }}>
                  <Link to="/docs" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.75rem' }}>Docs</Link>
                  <ChevronRight size={10} style={{ color: 'var(--d-text-muted)' }} />
                  <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>{selectedArticle.category}</span>
                  <ChevronRight size={10} style={{ color: 'var(--d-text-muted)' }} />
                  <span style={{ color: 'var(--d-text)', fontSize: '0.75rem', fontWeight: 600 }}>{selectedArticle.title}</span>
                </nav>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{selectedArticle.title}</h1>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
                  Last updated {selectedArticle.lastUpdated} &middot; {selectedArticle.readTime} read
                </p>
              </div>
              <button
                className="d-interactive"
                data-variant="primary"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', flexShrink: 0 }}
                onClick={() => navigate(`/docs/${selectedArticle.slug}`)}
              >
                Read Full Article
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              <div className="paper-prose paper-fade" dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedArticle.content) }} />
            </div>
          </>
        ) : (
          <div className={css('_flex _center')} style={{ flex: 1, color: 'var(--d-text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Select an article to preview</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* Simple markdown-to-HTML for showcase */
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
