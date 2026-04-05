import { useState } from 'react';
import { Play, Copy } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { apiEndpoints } from '@/data/mock';

export function ApiDocsPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [response, setResponse] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const endpoint = apiEndpoints[selectedIdx];
  const categories = Array.from(new Set(apiEndpoints.map(e => e.category)));

  function runRequest() {
    setRunning(true);
    setResponse(null);
    setTimeout(() => {
      const mockResponses: Record<string, string> = {
        'GET /v1/organizations': `{
  "data": [
    { "id": "org-1", "name": "Acme Corp", "plan": "enterprise", "members": 42 },
    { "id": "org-2", "name": "Globex Industries", "plan": "pro", "members": 18 }
  ],
  "has_more": false
}`,
        'POST /v1/organizations': `{
  "id": "org-6",
  "name": "New Org",
  "slug": "new-org",
  "plan": "starter",
  "created_at": "2026-04-05T14:32:01Z"
}`,
      };
      const key = `${endpoint.method} ${endpoint.path}`;
      setResponse(mockResponses[key] || `{
  "id": "${endpoint.path.includes(':id') ? 'mock_7f3a8b1e' : 'new_9b1e3c5d'}",
  "status": "success",
  "timestamp": "${new Date().toISOString()}"
}`);
      setRunning(false);
    }, 600);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="API Reference"
        description="REST API v1 · Base URL: https://api.tenantly.dev"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '1rem' }}>
        {/* Endpoint list */}
        <div className="d-surface" style={{ padding: '0.5rem', alignSelf: 'start' }}>
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: '0.5rem' }}>
              <div className="d-label" style={{ padding: '0.5rem 0.5rem' }}>{cat}</div>
              {apiEndpoints.map((e, i) => e.category === cat && (
                <button
                  key={i}
                  onClick={() => { setSelectedIdx(i); setResponse(null); }}
                  className="d-interactive"
                  data-variant="ghost"
                  data-active={i === selectedIdx ? 'true' : undefined}
                  style={{
                    width: '100%', padding: '0.375rem 0.5rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.75rem', border: 'none', justifyContent: 'flex-start',
                    borderRadius: 'var(--d-radius-sm)',
                    background: i === selectedIdx ? 'color-mix(in srgb, var(--d-primary) 10%, transparent)' : undefined,
                  }}
                >
                  <span className="lp-method" data-method={e.method}>{e.method}</span>
                  <span className="mono-data" style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.path}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Explorer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
          <div className="d-surface" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="lp-method" data-method={endpoint.method}>{endpoint.method}</span>
              <span className="mono-data" style={{ fontSize: '0.875rem', color: 'var(--d-text)' }}>{endpoint.path}</span>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{endpoint.title}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{endpoint.description}</p>
          </div>

          {/* Try it */}
          <div className="d-surface" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 className="d-label">Try it out</h3>
              <button
                onClick={runRequest}
                disabled={running}
                className="lp-button-primary"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
              >
                <Play size={12} /> {running ? 'Running...' : 'Send request'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Headers</div>
                <pre className="lp-code">{`Authorization: Bearer sk_live_••••7f3a
Content-Type: application/json`}</pre>
              </div>

              {(endpoint.method === 'POST' || endpoint.method === 'PATCH') && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Body</div>
                  <pre className="lp-code">{`{
  "name": "Acme Corp",
  "slug": "acme"
}`}</pre>
                </div>
              )}

              {response !== null && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Response</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="d-annotation" data-status="success" style={{ fontSize: '0.65rem' }}>200 OK · 142ms</span>
                      <button className="d-interactive" data-variant="ghost" style={{ padding: '0.2rem', border: 'none', fontSize: '0.7rem' }}>
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>
                  <pre className="lp-code" style={{ maxHeight: 220, overflowY: 'auto' }}>{response}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
