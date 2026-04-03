import { css } from '@decantr/css';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Play, Copy, Check, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { apiEndpoints } from '../data/mock';

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
      style={{ padding: '0.125rem 0.375rem', borderRadius: 'var(--d-radius-sm)', fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}
    >
      {method}
    </span>
  );
}

export function ApiEndpointPage() {
  const { endpoint: epId } = useParams<{ endpoint: string }>();
  const endpoint = apiEndpoints.find((e) => e.id === epId);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!endpoint) {
    return <Navigate to="/api" replace />;
  }

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setResponse(endpoint.responseExample);
      setSending(false);
    }, 800);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* List column with back nav */}
      <div
        className={css('_flex _col _shrink0')}
        style={{ width: 320, borderRight: '1px solid var(--d-border)', overflow: 'hidden' }}
      >
        <div className={css('_flex _aic _shrink0')} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <Link
            to="/api"
            className={css('_flex _aic _gap1 _textsm')}
            style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}
          >
            <ArrowLeft size={14} />
            All Endpoints
          </Link>
        </div>

        {/* Request builder */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <h3 className={css('_fontmedium _textsm')} style={{ marginBottom: '1rem' }}>Request Builder</h3>

          {/* Auth */}
          <div className={css('_flex _col _gap2')} style={{ marginBottom: '1.5rem' }}>
            <label className={css('_textsm _fontmedium')}>Authorization</label>
            <select className="d-control" style={{ fontSize: '0.8125rem' }} defaultValue="bearer">
              <option value="none">None</option>
              <option value="bearer">Bearer Token</option>
              <option value="apikey">API Key</option>
            </select>
            <input className="d-control" placeholder="Enter token..." style={{ fontSize: '0.8125rem' }} defaultValue="sk_test_demo_token" />
          </div>

          {/* Parameters */}
          {endpoint.parameters.length > 0 && (
            <div className={css('_flex _col _gap2')} style={{ marginBottom: '1.5rem' }}>
              <label className={css('_textsm _fontmedium')}>Parameters</label>
              {endpoint.parameters.map((p) => (
                <div key={p.name} className={css('_flex _col _gap1')}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                    {p.name}{p.required && <span style={{ color: 'var(--d-error)' }}> *</span>}
                  </label>
                  <input
                    className="d-control"
                    placeholder={p.description}
                    style={{ fontSize: '0.8125rem' }}
                    defaultValue={p.required ? 'example-value' : ''}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            className="d-interactive"
            data-variant="primary"
            onClick={handleSend}
            disabled={sending}
            style={{ width: '100%', justifyContent: 'center', padding: '0.5rem 1rem' }}
          >
            {sending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
            {sending ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>

      {/* Detail */}
      <div className={css('_flex _col')} style={{ flex: 1, overflow: 'hidden' }}>
        <div
          className={css('_flex _aic _jcsb _shrink0')}
          style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--d-border)' }}
        >
          <div className={css('_flex _aic _gap2')}>
            <MethodBadge method={endpoint.method} />
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '1rem', fontWeight: 600 }}>{endpoint.path}</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div className="paper-fade">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{endpoint.title}</h2>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>{endpoint.description}</p>

            {/* Parameters table */}
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
                          {p.required
                            ? <span style={{ color: 'var(--d-error)', fontWeight: 600, fontSize: '0.8125rem' }}>Required</span>
                            : <span style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>Optional</span>
                          }
                        </td>
                        <td className="d-data-cell" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Response */}
            <div>
              <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
                <h3 className={css('_fontmedium')} style={{ fontSize: '0.9375rem' }}>
                  {response ? 'Response' : 'Expected Response'}
                </h3>
                {response && (
                  <button
                    className="d-interactive"
                    data-variant="ghost"
                    onClick={() => handleCopy(response)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <div className="paper-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className={css('_flex _aic')} style={{ padding: '0.5rem 0.75rem', background: 'var(--d-surface-raised)', borderBottom: '1px solid var(--d-border)' }}>
                  <span className="d-annotation" data-status={response ? 'success' : 'info'}>
                    {response ? '200 OK' : 'Awaiting request'}
                  </span>
                </div>
                <pre style={{ padding: '1rem', fontSize: '0.8125rem', lineHeight: 1.6, fontFamily: 'ui-monospace, monospace', overflow: 'auto', margin: 0, background: 'var(--d-surface-raised)' }}>
                  <code>{response || endpoint.responseExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
