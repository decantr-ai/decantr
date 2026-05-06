import { css } from '@decantr/css';
import { Save, Eye, ArrowLeft, Bold, Italic, Link as LinkIcon, List, Image, Code } from 'lucide-react';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { drafts } from '../data/mock';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const draft = drafts.find((d) => d.id === id) ?? drafts[0];

  const [title, setTitle] = useState(draft.title);
  const [body, setBody] = useState(
    `${draft.excerpt}\n\nThis is the full body of the draft. In a production environment, this would contain the complete markdown content of the article.\n\nThe editor supports markdown formatting, live preview, and auto-save functionality.`
  );

  return (
    <div className="entrance-fade" style={{ maxWidth: '56rem' }}>
      {/* Breadcrumb */}
      <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
        <Link
          to="/drafts"
          className={css('_flex _aic _gap1')}
          style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}
        >
          <ArrowLeft size={14} />
          Drafts
        </Link>
        <span style={{ color: 'var(--d-border)' }}>/</span>
        <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Edit</span>
      </div>

      {/* Header */}
      <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1.5rem' }}>
        <div className={css('_flex _aic _gap3')}>
          <span className="d-annotation" data-status={draft.status === 'review' ? 'warning' : draft.status === 'scheduled' ? 'success' : undefined}>
            {draft.status}
          </span>
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            {draft.wordCount} words
          </span>
        </div>
        <div className={css('_flex _gap2')} style={{ fontFamily: 'system-ui, sans-serif' }}>
          <button className="d-interactive" data-variant="ghost">
            <Eye size={16} />
            Preview
          </button>
          <button className="d-interactive" data-variant="primary">
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          fontSize: '1.75rem',
          fontWeight: 600,
          fontFamily: "'Georgia', serif",
          background: 'transparent',
          marginBottom: '1.5rem',
          lineHeight: 1.2,
          color: 'var(--d-text)',
        }}
        placeholder="Article title..."
      />

      {/* Toolbar */}
      <div
        className={css('_flex _aic _gap1')}
        style={{
          padding: '0.5rem',
          borderTop: '1px solid var(--d-border)',
          borderBottom: '1px solid var(--d-border)',
          marginBottom: '1.5rem',
        }}
      >
        {[Bold, Italic, LinkIcon, List, Image, Code].map((Icon, i) => (
          <button
            key={i}
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem', border: 'none' }}
            type="button"
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* Editor area */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        style={{
          width: '100%',
          minHeight: '24rem',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontFamily: "'Georgia', serif",
          fontSize: '1.0625rem',
          lineHeight: 1.8,
          background: 'transparent',
          color: 'var(--d-text)',
        }}
        placeholder="Start writing..."
      />
    </div>
  );
}
