'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createApiKeyAction, revokeApiKeyAction } from './actions';
import { api, type MeResponse } from '@/lib/api';

interface ApiKeyDisplay {
  id: string;
  name: string;
  scopes: string[];
  org_id?: string | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function maskKey(id: string): string {
  const tail = id.slice(-4);
  return `sk-****-${tail}`;
}

/* ── Icons ── */

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}
function KeyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
      <path d="m21 2-9.6 9.6" /><circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
  );
}
function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button
      type="button"
      className="d-interactive"
      data-variant="ghost"
      onClick={handleCopy}
      style={{ padding: '0.25rem' }}
      aria-label="Copy key"
    >
      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
    </button>
  );
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyDisplay[]>([]);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [keyTarget, setKeyTarget] = useState<'personal' | 'organization'>('personal');
  const [orgId, setOrgId] = useState('');
  const [scopes, setScopes] = useState<Set<string>>(new Set(['read']));
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreate] = useTransition();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      const res = await fetch(`${API_URL}/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(Array.isArray(data) ? data : data?.items ?? []);
      }
      const profile = await api.getMe(token).catch(() => null);
      setMe(profile);
      const firstOrganizationId = profile?.organizations?.[0]?.id;
      if (firstOrganizationId) {
        setOrgId((current) => current || firstOrganizationId);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  function toggleScope(scope: string) {
    setScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope);
      else next.add(scope);
      return next;
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNewKeyValue(null);
    if (!name.trim()) {
      setError('Key name is required.');
      return;
    }
    startCreate(async () => {
      const result = await createApiKeyAction(
        name.trim(),
        Array.from(scopes),
        keyTarget === 'organization' ? orgId : null,
      );
      if ('error' in result && result.error) {
        setError(result.error);
      } else if ('key' in result && result.key) {
        setNewKeyValue(result.key);
        setName('');
        setKeyTarget('personal');
        setShowForm(false);
        await loadKeys();
      }
    });
  }

  async function handleRevoke(id: string) {
    setRevokingId(id);
    const result = await revokeApiKeyAction(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
    setRevokingId(null);
  }

  const activeKeys = keys.filter((k) => !k.revoked_at);

  return (
    <div className="registry-page-stack">
      {/* Header row */}
      <div className="registry-inline-actions" style={{ justifyContent: 'space-between' }}>
        <h3 className="text-lg font-semibold">API Keys</h3>
        <button
          className="d-interactive"
          data-variant="primary"
          style={{ fontSize: '0.875rem' }}
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
          }}
        >
          <PlusIcon size={16} />
          Generate New Key
        </button>
      </div>

      {/* Newly created key banner */}
      {newKeyValue && (
        <div
          className="d-surface"
          style={{
            borderColor: 'var(--d-success)',
            background: 'color-mix(in srgb, var(--d-success) 8%, var(--d-surface))',
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CheckIcon size={14} />
              <span className="text-sm font-semibold">Key created — save it now, it won&apos;t be shown again</span>
            </div>
            <div className="registry-inline-actions">
              <code
                style={{
                  fontFamily: 'var(--d-font-mono, monospace)',
                  fontSize: '0.8125rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--d-bg)',
                  borderRadius: 'var(--d-radius-sm)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {newKeyValue}
              </code>
              <CopyButton text={newKeyValue} />
              <button
                type="button"
                className="d-interactive"
                data-variant="ghost"
                onClick={() => setNewKeyValue(null)}
                style={{ fontSize: '0.75rem' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline create form — toggled by header button */}
      {showForm && (
        <form onSubmit={handleCreate} className="d-surface">
          <div className="registry-surface-stack">
            {error && (
              <span className="d-annotation" data-status="error">
                {error}
              </span>
            )}
            <div className="registry-form-grid">
              <label className="text-sm font-medium" htmlFor="key-name">Name</label>
              <input
                id="key-name"
                className="d-control"
                type="text"
                placeholder="My API Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="registry-form-grid">
              <label className="text-sm font-medium" htmlFor="key-target">Key Scope</label>
              <select
                id="key-target"
                className="d-control"
                value={keyTarget}
                onChange={(e) => setKeyTarget(e.target.value as 'personal' | 'organization')}
              >
                <option value="personal">Personal key</option>
                {me?.entitlements?.org_collaboration && me.organizations.length > 0 ? (
                  <option value="organization">Organization key</option>
                ) : null}
              </select>
            </div>
            {keyTarget === 'organization' && me?.organizations.length ? (
              <div className="registry-form-grid">
                <label className="text-sm font-medium" htmlFor="org-id">Organization</label>
                <select
                  id="org-id"
                  className="d-control"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                >
                  {me.organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="registry-form-grid">
              <span className="text-sm font-medium">Scopes</span>
              <div className="registry-inline-actions">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={scopes.has('read')} onChange={() => toggleScope('read')} />
                  Read
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={scopes.has('write')} onChange={() => toggleScope('write')} />
                  Write
                </label>
              </div>
            </div>
            <div className="registry-inline-actions" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="d-interactive"
                data-variant="ghost"
                onClick={() => { setShowForm(false); setError(null); }}
                style={{ fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="d-interactive"
                data-variant="primary"
                disabled={isCreating}
                style={{ fontSize: '0.875rem' }}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Table */}
      <section className="d-section" data-density="compact">
        {activeKeys.length > 0 ? (
          <div className="registry-key-list">
            {activeKeys.map((apiKey) => (
              <div key={apiKey.id} className="d-surface registry-key-card">
                <div className="registry-key-card-header">
                  <div className="registry-key-card-meta">
                    <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                      <span style={{ color: 'var(--d-accent)', flexShrink: 0 }}>
                        <KeyIcon size={16} />
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {apiKey.name}
                        {apiKey.org_id ? (
                          <span className="d-annotation" data-status="info" style={{ marginLeft: '0.5rem' }}>
                            Org
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--d-font-mono, monospace)',
                        color: 'var(--d-text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {maskKey(apiKey.id)}
                    </span>
                  </div>

                  <div className="registry-key-card-scopes">
                    {apiKey.scopes.map((scope) => (
                      <span key={scope} className="d-annotation">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="registry-key-card-footer">
                  <div className="registry-key-card-dates">
                    <span>Created {formatDate(apiKey.created_at)}</span>
                    <span>Last used {formatDate(apiKey.last_used_at)}</span>
                  </div>

                  <div className="registry-inline-actions">
                    <CopyButton text={maskKey(apiKey.id)} />
                    <button
                      type="button"
                      className="d-interactive"
                      data-variant="ghost"
                      onClick={() => handleRevoke(apiKey.id)}
                      disabled={revokingId === apiKey.id}
                      style={{ padding: '0.25rem', color: 'var(--d-error)' }}
                      aria-label="Revoke key"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-3"
            style={{ padding: '3rem 0' }}
          >
            <span style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
              <KeyIcon size={48} />
            </span>
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
              No API keys yet.
            </p>
            <button
              className="d-interactive"
              data-variant="primary"
              style={{ fontSize: '0.875rem' }}
              onClick={() => { setShowForm(true); setError(null); }}
            >
              Generate Your First Key
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
