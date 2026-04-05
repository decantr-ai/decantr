import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { TerminalSplitShell } from '@/components/TerminalSplitShell';
import { PipelineCanvas } from '@/components/PipelineCanvas';
import { getPipelineById } from '@/data/mock';

const PALETTE = [
  { type: 'source', label: 'Source' },
  { type: 'filter', label: 'Filter' },
  { type: 'transform', label: 'Transform' },
  { type: 'join', label: 'Join' },
  { type: 'sink', label: 'Sink' },
];

export function PipelineEditorPage() {
  const { id } = useParams<{ id: string }>();
  const pipeline = getPipelineById(id || '');
  const [selected, setSelected] = useState<string>('');

  if (!pipeline) return <Navigate to="/pipelines" replace />;

  const selectedNode = pipeline.nodes.find((n) => n.id === selected);

  return (
    <TerminalSplitShell title={`EDITOR // ${pipeline.name}`}>
      <div style={{ flex: 1, display: 'flex', gap: '0.5rem', minHeight: 0 }}>
        {/* Palette */}
        <aside className="term-panel" style={{ width: 140, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
          <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.375rem' }}>PALETTE</div>
          {PALETTE.map((p) => (
            <div
              key={p.type}
              style={{
                padding: '0.375rem 0.5rem',
                border: '1px dashed var(--d-border)',
                fontSize: '0.75rem',
                color: 'var(--d-text-muted)',
                cursor: 'grab',
                userSelect: 'none',
              }}
            >
              [{p.type[0].toUpperCase()}] {p.label}
            </div>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--d-border)', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
            <Link to={`/pipelines/${pipeline.id}/config`} style={{ color: 'var(--d-accent)' }}>
              config &rarr;
            </Link>
          </div>
        </aside>

        {/* Canvas + inspector */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 0 }}>
          {/* Toolbar */}
          <div className="term-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.75rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
              <Link to="/pipelines" style={{ color: 'var(--d-accent)' }}>&larr; pipelines</Link>
              <span className="term-glow" style={{ color: 'var(--d-primary)', fontWeight: 600 }}>{pipeline.name}</span>
              <span style={{ color: 'var(--d-text-muted)' }}>· {pipeline.nodes.length} nodes · {pipeline.edges.length} edges</span>
            </div>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button className="d-interactive" style={{ padding: '0.25rem 0.625rem', fontSize: '0.7rem', borderRadius: 0 }}>Validate</button>
              <button className="d-interactive" data-variant="primary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.7rem', borderRadius: 0 }}>&gt; Deploy</button>
            </div>
          </div>

          {/* Canvas */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <PipelineCanvas
              nodes={pipeline.nodes}
              edges={pipeline.edges}
              selectedId={selected}
              onSelect={setSelected}
            />
          </div>

          {/* Inspector */}
          {selectedNode && (
            <div className="term-panel" style={{ padding: '0.5rem 0.75rem', flexShrink: 0, maxHeight: '8rem', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <div className="d-label" style={{ color: 'var(--d-accent)' }}>
                  INSPECT // {selectedNode.type} · {selectedNode.label}
                </div>
                <button onClick={() => setSelected('')} style={{ background: 'none', border: 'none', color: 'var(--d-text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
              </div>
              <pre style={{ fontSize: '0.7rem', color: 'var(--d-text)', margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedNode.config || '# no config'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </TerminalSplitShell>
  );
}
