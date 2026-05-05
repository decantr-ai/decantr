import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Play, Save } from 'lucide-react';
import { tools } from '@/data/mock';

export function ToolDetailPage() {
  const { id } = useParams();
  const tool = tools.find(t => t.id === id) || tools[0];
  const [testInput, setTestInput] = useState('{\n  "query": "mixture of experts"\n}');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: 'calc(100vh - 48px - 2.5rem)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--d-font-mono)' }}>{tool.name}</h1>
            <span className="mono-inline" style={{ fontSize: '0.62rem' }}>{tool.version}</span>
            <span className="mono-inline" style={{ fontSize: '0.62rem', color: 'var(--d-text-muted)' }}>{tool.category}</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', marginTop: 4 }}>{tool.description}</p>
        </div>
        <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.75rem' }}>
          <Save size={12} /> Save schema
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', flex: 1, minHeight: 0 }}>
        {/* Schema editor */}
        <div className="carbon-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="carbon-panel-header">
            <span>schema.json</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--d-success)' }}>● valid</span>
          </div>
          <textarea
            defaultValue={tool.schema}
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

        {/* Test playground */}
        <div className="carbon-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="carbon-panel-header">
            <span>playground</span>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '2px 8px', fontSize: '0.65rem', border: 'none', color: 'var(--d-accent)' }}>
              <Play size={10} /> Run
            </button>
          </div>
          <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--d-border)' }}>
            <div className="d-label" style={{ marginBottom: 4 }}>request</div>
            <textarea
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: 80,
                background: '#0F0F12',
                border: '1px solid var(--d-border)',
                borderRadius: 3,
                padding: '0.5rem 0.625rem',
                fontFamily: 'var(--d-font-mono)',
                fontSize: '0.75rem',
                color: '#E4E4E7',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1, padding: '0.625rem 0.875rem', overflow: 'auto', background: '#0F0F12' }}>
            <div className="d-label" style={{ marginBottom: 4, color: 'var(--d-accent)' }}>response · 420ms</div>
            <pre style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.75rem', color: '#E4E4E7', margin: 0, lineHeight: 1.6 }}>{JSON.stringify({
              results: [
                { title: 'Mixtral of Experts', url: 'https://arxiv.org/abs/2401.04088', snippet: 'Sparse Mixture of Experts language model...' },
                { title: 'Switch Transformers', url: 'https://arxiv.org/abs/2101.03961', snippet: 'Scaling to Trillion Parameter Models...' },
              ],
              total: 2,
              latency_ms: 420,
            }, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
