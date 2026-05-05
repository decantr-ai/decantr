import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Save, Play, GitBranch } from 'lucide-react';
import { prompts } from '@/data/mock';

export function PromptDetailPage() {
  const { id } = useParams();
  const prompt = prompts.find(p => p.id === id) || prompts[0];
  const [selectedVersion, setSelectedVersion] = useState(prompt.versions[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: 'calc(100vh - 48px - 2.5rem)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--d-font-mono)' }}>{prompt.name}</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>{prompt.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem' }}><Play size={12} /> Test</button>
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem' }}><GitBranch size={12} /> Branch</button>
          <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.75rem' }}>
            <Save size={12} /> Commit
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '0.5rem', flex: 1, minHeight: 0 }}>
        {/* Editor */}
        <div className="carbon-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="carbon-panel-header">
            <span>{prompt.name} @ {selectedVersion.version}</span>
            <span style={{ fontSize: '0.65rem' }}>{selectedVersion.tokens} tokens</span>
          </div>
          <textarea
            value={selectedVersion.content}
            readOnly
            spellCheck={false}
            style={{
              flex: 1,
              background: '#0F0F12',
              border: 'none',
              padding: '0.875rem 1rem',
              fontFamily: 'var(--d-font-mono)',
              fontSize: '0.82rem',
              color: '#E4E4E7',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Version timeline */}
        <div className="carbon-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="carbon-panel-header">versions</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {prompt.versions.map((v, i) => (
              <button
                key={v.version}
                onClick={() => setSelectedVersion(v)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.625rem 0.875rem',
                  background: selectedVersion.version === v.version ? 'color-mix(in srgb, var(--d-accent) 10%, transparent)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--d-border)',
                  borderLeft: selectedVersion.version === v.version ? '2px solid var(--d-accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  color: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.78rem', color: i === 0 ? 'var(--d-accent)' : 'var(--d-text)' }}>{v.version}</span>
                  {i === 0 && <span className="neon-bg mono-inline" style={{ fontSize: '0.58rem' }}>HEAD</span>}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', marginBottom: 2 }}>{v.message}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)', display: 'flex', gap: 6 }}>
                  <span>{v.author}</span>
                  <span>·</span>
                  <span>{v.timestamp}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
