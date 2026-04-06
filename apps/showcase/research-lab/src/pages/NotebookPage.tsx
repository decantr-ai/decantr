import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Plus, Clock, Tag } from 'lucide-react';
import { notebookTree, notebookEntries } from '../data/mock';
import type { NotebookNode } from '../data/mock';
import { useState } from 'react';

function TreeNode({ node, depth = 0 }: { node: NotebookNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={css('_flex _aic _gap2')}
        style={{
          padding: '0.25rem 0.5rem',
          paddingLeft: `${depth * 1 + 0.5}rem`,
          cursor: hasChildren ? 'pointer' : undefined,
          fontSize: '0.8125rem',
          color: hasChildren ? 'var(--d-text)' : 'var(--d-text-muted)',
          fontWeight: hasChildren ? 500 : 400,
          borderRadius: 2,
          transition: 'background 100ms linear',
        }}
        onClick={() => hasChildren && setExpanded(!expanded)}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--d-surface-raised)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        {hasChildren && (
          <span style={{ fontSize: '0.625rem', transition: 'transform 100ms', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
        )}
        {!hasChildren ? (
          <Link to={`/notebook/${node.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
            {node.title}
          </Link>
        ) : (
          <span>{node.title}</span>
        )}
      </div>
      {hasChildren && expanded && node.children!.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function NotebookPage() {
  return (
    <div className={css('_flex')} style={{ height: '100%', margin: '-1.5rem' }}>
      {/* Page tree sidebar */}
      <div
        className={css('_flex _col _shrink0')}
        style={{ width: 240, borderRight: '1px solid var(--d-border)', background: '#fff' }}
      >
        <div className={css('_flex _aic _jcsb _shrink0')} style={{ padding: '0.75rem', borderBottom: '1px solid var(--d-border)' }}>
          <span className="d-label">Pages</span>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.125rem' }} aria-label="New page">
            <Plus size={14} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.375rem 0' }}>
          {notebookTree.map((node) => (
            <TreeNode key={node.id} node={node} />
          ))}
        </div>
      </div>

      {/* Entry list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontWeight: 500, fontSize: '1.25rem' }}>Lab Notebook</h1>
          <button className="d-interactive" data-variant="primary" style={{ borderRadius: 2, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            <Plus size={14} /> New Entry
          </button>
        </div>

        <div className={css('_flex _col _gap3')}>
          {notebookEntries.map((entry) => (
            <Link
              key={entry.id}
              to={`/notebook/${entry.id}`}
              className="lab-panel"
              data-interactive
              style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: '1rem 1.25rem', transition: 'border-color 100ms linear' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--d-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--d-border)'; }}
            >
              <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.375rem' }}>
                <h3 style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{entry.title}</h3>
                <div className={css('_flex _aic _gap1')} style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>
                  <Clock size={12} />
                  {entry.date}
                </div>
              </div>
              <p style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                {entry.excerpt}
              </p>
              <div className={css('_flex _aic _gap2')} style={{ flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{entry.author}</span>
                {entry.tags.map((tag) => (
                  <span key={tag} className={css('_flex _aic _gap1')} style={{ fontSize: '0.6875rem', color: 'var(--d-primary)' }}>
                    <Tag size={10} />{tag}
                  </span>
                ))}
                {entry.protocols.length > 0 && (
                  <span className="d-annotation" data-status="info" style={{ fontSize: '0.6875rem' }}>
                    {entry.protocols.length} protocol steps
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
