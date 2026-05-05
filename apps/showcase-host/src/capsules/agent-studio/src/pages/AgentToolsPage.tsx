import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { tools } from '@/data/mock';

export function AgentToolsPage() {
  const [selectedTool, setSelectedTool] = useState(tools[0]);
  const [attached, setAttached] = useState(new Set(['web-search', 'pdf-extract', 'vector-search']));

  return (
    <div>
      <PageHeader title="Agent Tools" description="Wire tools available to this agent" />
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '0.75rem', height: 'calc(100vh - 48px - 5rem)' }}>
        {/* Tool list */}
        <div className="carbon-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="carbon-panel-header">
            <span>available ({tools.length})</span>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '2px 6px', fontSize: '0.65rem', border: 'none' }}>
              <Plus size={11} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.25rem' }}>
            {tools.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTool(t)}
                className="tree-row"
                data-active={selectedTool.id === t.id ? 'true' : undefined}
                style={{ width: '100%', border: 'none', background: 'transparent', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={attached.has(t.id)}
                    onChange={e => {
                      const s = new Set(attached);
                      if (e.target.checked) s.add(t.id); else s.delete(t.id);
                      setAttached(s);
                    }}
                    style={{ accentColor: 'var(--d-accent)' }}
                    onClick={e => e.stopPropagation()}
                  />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
                </div>
                <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{t.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Schema editor */}
        <div className="carbon-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="carbon-panel-header">
            <span>{selectedTool.name}.schema</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="mono-inline" style={{ fontSize: '0.62rem' }}>{selectedTool.version}</span>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '2px 6px', fontSize: '0.65rem', border: 'none' }}>
                <Trash2 size={10} />
              </button>
            </div>
          </div>
          <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--d-border)', fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>
            {selectedTool.description}
          </div>
          <textarea
            defaultValue={selectedTool.schema}
            spellCheck={false}
            style={{
              flex: 1,
              background: '#0F0F12',
              border: 'none',
              padding: '0.875rem 1rem',
              fontFamily: 'var(--d-font-mono)',
              fontSize: '0.78rem',
              color: '#E4E4E7',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.6,
            }}
          />
        </div>
      </div>
    </div>
  );
}
