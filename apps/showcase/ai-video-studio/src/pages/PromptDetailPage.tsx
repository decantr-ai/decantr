import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, Film, Copy, RotateCcw } from 'lucide-react';
import { prompts } from '@/data/mock';

export function PromptDetailPage() {
  const { id } = useParams();
  const prompt = prompts.find(p => p.id === id) || prompts[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <NavLink to="/prompts" className="d-interactive" data-variant="ghost" style={{ padding: '4px', border: 'none' }}><ArrowLeft size={16} /></NavLink>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{prompt.title}</h1>
        <span className="cinema-slate">{prompt.scene}</span>
        <span className="d-annotation" data-status={prompt.status === 'active' ? 'success' : 'warning'}>{prompt.status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--d-gap-6)' }}>
        {/* Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="d-surface" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>PROMPT EDITOR</div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button className="d-interactive" data-variant="ghost" style={{ padding: '4px 8px', fontSize: '0.7rem' }}><Copy size={12} /> Copy</button>
                <button className="d-interactive" data-variant="ghost" style={{ padding: '4px 8px', fontSize: '0.7rem' }}><RotateCcw size={12} /> Revert</button>
              </div>
            </div>
            <textarea
              className="d-control"
              defaultValue={prompt.text}
              style={{ minHeight: 180, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', lineHeight: 1.7, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
              <span>v{prompt.version} &middot; {prompt.tokens} tokens</span>
              <span>Last edited: {prompt.updatedAt}</span>
            </div>
          </div>
          <button className="d-interactive" data-variant="primary" style={{ alignSelf: 'flex-end', padding: '6px 16px', fontSize: '0.8rem' }}>
            Generate Preview
          </button>
        </div>

        {/* Reference strip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>STORYBOARD REFERENCE</div>
          {[1, 2, 3].map(i => (
            <div key={i} className="cinema-frame d-surface" data-ratio="16:9" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <Film size={24} style={{ color: 'var(--d-text-muted)', opacity: 0.4 }} />
            </div>
          ))}
          <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
            Storyboard thumbnails from previous versions
          </div>
        </div>
      </div>
    </div>
  );
}
