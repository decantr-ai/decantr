'use client';

import { useState, useCallback } from 'react';
import type { ApiKey } from '@/lib/api';
import { createApiKeyAction, revokeApiKeyAction } from './actions';

interface Props {
  initialKeys: ApiKey[];
  error?: string;
}

export function ApiKeysClient({ initialKeys, error: initialError }: Props) {
  const [keys, setKeys] = useState(initialKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [error, setError] = useState(initialError || '');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setLoading(true);
    setError('');
    const result = await createApiKeyAction(newKeyName, ['read', 'write']);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.key) {
      setNewKeyValue(result.key);
      setShowCreate(false);
      setNewKeyName('');
      // Refresh page
      window.location.reload();
    }
  }

  async function handleRevoke(id: string) {
    const result = await revokeApiKeyAction(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setKeys(keys.filter((k) => k.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">API Keys</h3>
        <button
          className="d-interactive"
          data-variant="primary"
          onClick={() => setShowCreate(!showCreate)}
          style={{ fontSize: '0.875rem' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Generate New Key
        </button>
      </div>

      {/* Newly created key display */}
      {newKeyValue && (
        <div className="d-surface" data-elevation="raised" style={{ borderLeft: '3px solid var(--d-success)' }}>
          <p className="text-sm font-medium mb-2">New API Key Created</p>
          <p className="text-xs mb-2" style={{ color: 'var(--d-text-muted)' }}>Copy this key now. You won&apos;t be able to see it again.</p>
          <code className="text-sm" style={{ fontFamily: 'var(--d-font-mono, monospace)', wordBreak: 'break-all' }}>{newKeyValue}</code>
          <div className="mt-2">
            <CopyButton text={newKeyValue} />
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="flex items-center gap-3">
          <input
            className="d-control"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g., Production)"
            style={{ maxWidth: 300 }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          />
          <button
            className="d-interactive"
            data-variant="primary"
            onClick={handleCreate}
            disabled={loading}
            style={{ fontSize: '0.875rem' }}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      )}

      {error && <div className="d-annotation" data-status="error">{error}</div>}

      {/* Table */}
      <section className="d-section" data-density="compact">
        {keys.length > 0 ? (
          <div className="d-data" role="table">
            <div
              className="grid items-center"
              style={{ gridTemplateColumns: '1.5fr 2fr 1.5fr 1fr 1fr 0.75fr' }}
              role="row"
            >
              <span className="d-data-header" role="columnheader">Name</span>
              <span className="d-data-header" role="columnheader">Key</span>
              <span className="d-data-header" role="columnheader">Scopes</span>
              <span className="d-data-header" role="columnheader">Created</span>
              <span className="d-data-header" role="columnheader">Last Used</span>
              <span className="d-data-header" role="columnheader">Actions</span>
            </div>

            {keys.map((apiKey) => (
              <ApiKeyRow key={apiKey.id} apiKey={apiKey} onRevoke={handleRevoke} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3" style={{ padding: '3rem 0' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>No API keys yet.</p>
            <button
              className="d-interactive"
              data-variant="primary"
              onClick={() => setShowCreate(true)}
              style={{ fontSize: '0.875rem' }}
            >
              Generate Your First Key
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button className="d-interactive" data-variant="ghost" onClick={handleCopy} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function ApiKeyRow({ apiKey, onRevoke }: { apiKey: ApiKey; onRevoke: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const masked = apiKey.id.slice(0, 8) + '...';

  return (
    <div
      className="grid items-center d-data-row"
      style={{ gridTemplateColumns: '1.5fr 2fr 1.5fr 1fr 1fr 0.75fr', padding: 'var(--d-data-py) var(--d-content-gap)' }}
      role="row"
    >
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--d-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
        <span className="text-sm font-medium">{apiKey.name}</span>
      </div>
      <span className="text-sm" style={{ fontFamily: 'var(--d-font-mono, monospace)', color: 'var(--d-text-muted)' }}>
        sk-****...{masked}
      </span>
      <div className="flex items-center gap-1">
        {apiKey.scopes.map((scope) => (
          <span key={scope} className="d-annotation">{scope}</span>
        ))}
      </div>
      <span className="text-xs" style={{ color: 'var(--d-text-muted)' }}>
        {new Date(apiKey.created_at).toLocaleDateString()}
      </span>
      <span className="text-xs" style={{ color: 'var(--d-text-muted)' }}>
        {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : 'Never'}
      </span>
      <div className="flex items-center gap-1">
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={() => {
            navigator.clipboard.writeText(apiKey.id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          style={{ padding: '0.25rem' }}
          aria-label="Copy key"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          )}
        </button>
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={() => onRevoke(apiKey.id)}
          style={{ padding: '0.25rem', color: 'var(--d-error)' }}
          aria-label="Revoke key"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
        </button>
      </div>
    </div>
  );
}
