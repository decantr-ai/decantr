import { css } from '@decantr/css';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Copy, Check, ChevronRight, Code } from 'lucide-react';
import { useState } from 'react';
import { apiEndpoints, type ApiEndpoint } from '../data/mock';

function MethodBadge({ method }: { method: string }) {
  const cls: Record<string, string> = {
    GET: 'paper-method-get',
    POST: 'paper-method-post',
    PUT: 'paper-method-put',
    DELETE: 'paper-method-delete',
    PATCH: 'paper-method-patch',
  };
  return (
    <span
      className={cls[method] || ''}
      style={{ padding: '0.125rem 0.375rem', borderRadius: 'var(--d-radius-sm)', fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.02em' }}
    >
      {method}
    </span>
  );
}

export function ApiRefPage() {
  const [selectedId, setSelectedId] = useState(apiEndpoints[0].id);
  const navigate = useNavigate();
  const selected = apiEndpoints.find((e) => e.id === selectedId) || apiEndpoints[0];
  const groups = [...new Set(apiEndpoints.map((e) => e.group))];

  return (
    <>
      {/* List column */}
      <div
        className={css('_flex _col _shrink0')}
        style={{ width: 320, borderRight: '1px solid var(--d-border)', overflow: 'hidden' }}
      >
        <div
          className={css('_flex _aic _jcsb _shrink0')}
          style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}
        >
          <span className={css('_textsm _fontmedium')}>Endpoints</span>
          <span className="d-annotation">{apiEndpoints.length}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {groups.map((group) => (
            <div key={group}>
              <div className="d-label" style={{ padding: '0.75rem 1rem 0.25rem', borderLeft: '2px solid var(--d-accent)', marginLeft: '0.5rem' }}>
                {group}
              </div>
              {apiEndpoints.filter((e) => e.group === group).map((ep) => {
                const isActive = ep.id === selectedId;
                return (
                  <button
                    key={ep.id}
                    className="d-interactive"
                    data-variant="ghost"
                    onClick={() => setSelectedId(ep.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: 0,
                      borderBottom: '1px solid var(--d-border)',
                      background: isActive ? 'color-mix(in srgb, var(--d-primary) 6%, transparent)' : undefined,
                      textAlign: 'left',
                    }}
                  >
                    <MethodBadge method={ep.method} />
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--d-primary)' : 'var(--d-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ep.path}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className={css('_flex _col')} style={{ flex: 1, overflow: 'hidden' }}>
        <div
          className={css('_flex _aic _jcsb _shrink0')}
          style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--d-border)' }}
        >
          <div className={css('_flex _aic _gap2')}>
            <MethodBadge method={selected.method} />
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '1rem', fontWeight: 600 }}>{selected.path}</span>
          </div>
          <button
            className="d-interactive"
            data-variant="primary"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            onClick={() => navigate(`/api/${selected.id}`)}
          >
            <Play size={14} />
            Try It Out
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <EndpointDetail endpoint={selected} />
        </div>
      </div>
    </>
  );
}

function EndpointDetail({ endpoint }: { endpoint: ApiEndpoint }) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'curl' | 'js' | 'python'>('curl');

  const snippets = {
    curl: `curl -X ${endpoint.method} "https://api.example.com${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`,
    js: `const response = await fetch("https://api.example.com${endpoint.path}", {
  method: "${endpoint.method}",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json",
  },
});
const data = await response.json();`,
    python: `import requests

response = requests.${endpoint.method.toLowerCase()}(
    "https://api.example.com${endpoint.path}",
    headers={"Authorization": "Bearer YOUR_TOKEN"},
)
data = response.json()`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="paper-fade">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{endpoint.title}</h2>
      <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>{endpoint.description}</p>

      {/* Parameters */}
      {endpoint.parameters.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 className={css('_fontmedium')} style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Parameters</h3>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Name</th>
                <th className="d-data-header">Type</th>
                <th className="d-data-header">Required</th>
                <th className="d-data-header">Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoint.parameters.map((p) => (
                <tr key={p.name} className="d-data-row">
                  <td className="d-data-cell" style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem', fontWeight: 500 }}>{p.name}</td>
                  <td className="d-data-cell"><span className="d-annotation">{p.type}</span></td>
                  <td className="d-data-cell">
                    {p.required ? (
                      <span style={{ color: 'var(--d-error)', fontWeight: 600, fontSize: '0.8125rem' }}>Required</span>
                    ) : (
                      <span style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>Optional</span>
                    )}
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Response */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 className={css('_fontmedium')} style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Response</h3>
        <div className="paper-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className={css('_flex _aic _jcsb')} style={{ padding: '0.5rem 0.75rem', background: 'var(--d-surface-raised)', borderBottom: '1px solid var(--d-border)' }}>
            <span className="d-annotation" data-status="success">200 OK</span>
          </div>
          <pre style={{ padding: '1rem', fontSize: '0.8125rem', lineHeight: 1.6, fontFamily: 'ui-monospace, monospace', overflow: 'auto', margin: 0, background: 'var(--d-surface-raised)' }}>
            <code>{endpoint.responseExample}</code>
          </pre>
        </div>
      </div>

      {/* Code snippets */}
      <div>
        <h3 className={css('_fontmedium')} style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Code Snippets</h3>
        <div className="paper-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className={css('_flex _aic _jcsb')} style={{ padding: '0.375rem 0.75rem', background: 'var(--d-surface-raised)', borderBottom: '1px solid var(--d-border)' }}>
            <div className={css('_flex _gap1')}>
              {(['curl', 'js', 'python'] as const).map((t) => (
                <button
                  key={t}
                  className="d-interactive"
                  data-variant={tab === t ? undefined : 'ghost'}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    background: tab === t ? 'var(--d-primary)' : undefined,
                    color: tab === t ? '#fff' : undefined,
                    borderColor: tab === t ? 'var(--d-primary)' : undefined,
                  }}
                >
                  {t === 'js' ? 'JavaScript' : t === 'python' ? 'Python' : 'cURL'}
                </button>
              ))}
            </div>
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={handleCopy}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre style={{ padding: '1rem', fontSize: '0.8125rem', lineHeight: 1.6, fontFamily: 'ui-monospace, monospace', overflow: 'auto', margin: 0, background: 'var(--d-surface-raised)' }}>
            <code>{snippets[tab]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
