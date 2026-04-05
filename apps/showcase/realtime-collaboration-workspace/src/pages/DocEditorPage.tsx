import { useParams } from 'react-router-dom';
import { GripVertical, Bold, Italic, Link2, MessageSquare, AtSign, MoreHorizontal, History } from 'lucide-react';
import { documents, collaborators, revisions } from '../data/mock';

export function DocEditorPage() {
  const { id } = useParams();
  const doc = (id && documents[id]) || documents.roadmap;
  const active = collaborators.filter(c => c.status === 'active');

  const renderBlock = (block: typeof doc.blocks[number], i: number) => {
    const cursorsHere = active
      .map((c, idx) => ({ c, idx }))
      .filter(({ c }) => c.cursor?.line === i + 1);

    const content = block.content;
    switch (block.type) {
      case 'h1':
        return <h1 key={block.id}>{content}{cursorsHere.map(({ c }) => <InlineCursor key={c.id} color={c.color} name={c.name} />)}</h1>;
      case 'h2':
        return <h2 key={block.id}>{content}{cursorsHere.map(({ c }) => <InlineCursor key={c.id} color={c.color} name={c.name} />)}</h2>;
      case 'h3':
        return <h3 key={block.id}>{content}</h3>;
      case 'ul':
        return (
          <ul key={block.id}>
            {(block.items || []).map((item, j) => <li key={j}>{item}</li>)}
          </ul>
        );
      case 'quote':
        return <blockquote key={block.id}>{content}</blockquote>;
      case 'p':
      default:
        return <p key={block.id}>{content}{cursorsHere.map(({ c }) => <InlineCursor key={c.id} color={c.color} name={c.name} />)}</p>;
    }
  };

  return (
    <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '2.5rem 3rem 5rem', position: 'relative' }}>
      {/* Doc header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{doc.icon}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.5rem' }}>
          <span>Updated {doc.updatedAt} by {doc.updatedBy}</span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--d-success)' }} />
            Saved
          </span>
        </div>
      </div>

      {/* Block toolbar sample */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="block-toolbar">
          <button title="Bold"><Bold size={14} /></button>
          <button title="Italic"><Italic size={14} /></button>
          <button title="Link"><Link2 size={14} /></button>
          <div style={{ width: 1, height: 18, background: 'var(--d-border)', margin: '0 0.25rem' }} />
          <button title="Comment"><MessageSquare size={14} /></button>
          <button title="Mention"><AtSign size={14} /></button>
          <button title="More"><MoreHorizontal size={14} /></button>
        </div>
        <span className="slash-hint">Type <span className="kbd">/</span> to insert</span>
      </div>

      {/* Prose body — editor-like with block handles */}
      <article className="paper-prose" style={{ position: 'relative' }}>
        {doc.blocks.map((block, i) => (
          <div key={block.id} className="doc-block">
            <span className="doc-block-handle" aria-hidden="true"><GripVertical size={14} /></span>
            {renderBlock(block, i)}
          </div>
        ))}
      </article>

      {/* Version history teaser */}
      <section style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <History size={13} /> Recent revisions
        </h3>
        <div className="paper-card" style={{ padding: '0.5rem' }}>
          {revisions.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderTop: i === 0 ? 'none' : '1px solid var(--d-border)' }}>
              <span className="presence-avatar presence-avatar-sm" style={{ background: r.color }}>{r.initials}</span>
              <div style={{ flex: 1, fontSize: '0.8125rem' }}>
                <div><span style={{ fontWeight: 500 }}>{r.author}</span> <span style={{ color: 'var(--d-text-muted)' }}>— {r.summary}</span></div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{r.timestamp}</div>
              </div>
              {r.current && <span className="chip chip-primary">Current</span>}
              {!r.current && (
                <button style={{ fontSize: '0.75rem', color: 'var(--d-primary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem' }}>Restore</button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InlineCursor({ color, name }: { color: string; name: string }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 0 }}>
      <span
        style={{
          display: 'inline-block',
          position: 'absolute',
          top: '-0.1em',
          left: '2px',
          width: 2,
          height: '1.2em',
          background: color,
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: '-1.45em',
          left: '2px',
          fontSize: '0.625rem',
          fontWeight: 500,
          color: '#fff',
          background: color,
          padding: '0.0625rem 0.375rem',
          borderRadius: '3px 3px 3px 0',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {name.split(' ')[0]}
      </span>
    </span>
  );
}
