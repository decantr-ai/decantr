import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Play, Save, Copy, Send, RefreshCw } from 'lucide-react';
import { agents } from '@/data/mock';

export function AgentDetailPage() {
  const { id } = useParams();
  const agent = agents.find(a => a.id === id) || agents[0];
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt);
  const [userInput, setUserInput] = useState('Summarize recent advances in mixture-of-experts architectures');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: 'calc(100vh - 48px - 2.5rem)' }}>
      {/* Header strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span className="status-dot" data-status={agent.status} />
          <h1 style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--d-font-mono)' }}>{agent.name}</h1>
          <span className="mono-inline" style={{ fontSize: '0.68rem' }}>{agent.version}</span>
          <span className="mono-inline" style={{ fontSize: '0.68rem' }}>{agent.model}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem' }}>
            <Save size={12} /> Save
          </button>
          <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.75rem' }}>
            <Play size={12} /> Run
          </button>
        </div>
      </div>

      {/* Three pane IDE layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', flex: 1, minHeight: 0 }}>
        {/* Editor pane */}
        <div className="carbon-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="carbon-panel-header">
            <span>system.prompt</span>
            <span style={{ fontSize: '0.65rem' }}>{systemPrompt.length} chars · ~{Math.floor(systemPrompt.length / 4)} tokens</span>
          </div>
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
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
          <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.5rem 0.875rem', fontSize: '0.7rem', fontFamily: 'var(--d-font-mono)', color: 'var(--d-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>UTF-8 · LF · markdown</span>
            <span>Ln {systemPrompt.split('\n').length}, Col 1</span>
          </div>
        </div>

        {/* Live preview pane */}
        <div className="carbon-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="carbon-panel-header">
            <span>live.preview</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '2px 6px', fontSize: '0.65rem', border: 'none' }}>
                <RefreshCw size={10} />
              </button>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '2px 6px', fontSize: '0.65rem', border: 'none' }}>
                <Copy size={10} />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem 1rem', background: '#0F0F12' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div className="d-label" style={{ marginBottom: 4 }}>user</div>
              <div className="mono-code" style={{ padding: '0.625rem 0.75rem', background: '#18181B' }}>{userInput}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div className="d-label" style={{ marginBottom: 4, color: 'var(--d-accent)' }}>assistant</div>
              <div className="mono-code" style={{ padding: '0.625rem 0.75rem', background: '#18181B', borderColor: 'color-mix(in srgb, var(--d-accent) 25%, var(--d-border))' }}>
                {`## Summary\nMoE architectures route tokens through specialized expert networks, activating only a sparse subset per forward pass.\n\n## Key Findings\n1. Switch Transformer [1] demonstrated 7x speedup\n2. Mixtral 8x7B [2] achieves GPT-3.5 performance at 13B active params\n3. DeepSeekMoE [3] introduces fine-grained expert segmentation\n\n## Evidence`}
                <span className="neon-accent" style={{ animation: 'cursor-blink 1.1s step-end infinite' }}>▌</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', fontSize: '0.68rem', fontFamily: 'var(--d-font-mono)', color: 'var(--d-text-muted)', paddingTop: '0.625rem', borderTop: '1px solid var(--d-border)' }}>
              <span>tokens: 2148</span>
              <span>latency: 3420ms</span>
              <span>cost: $0.0421</span>
              <Link to="/traces/trc-9f2a3b1c" className="neon-accent" style={{ marginLeft: 'auto', textDecoration: 'none' }}>
                view trace →
              </Link>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.5rem', display: 'flex', gap: 6 }}>
            <input
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="Test input..."
              className="d-control"
              style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.78rem', flex: 1, padding: '0.375rem 0.625rem' }}
            />
            <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', padding: '0.375rem 0.625rem', fontSize: '0.72rem' }}>
              <Send size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
