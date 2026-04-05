'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { createApiKeyAction, revokeApiKeyAction } from './actions';

interface ApiKeyDisplay {
  id: string;
  name: string;
  key?: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function maskKey(id: string): string {
  if (id.length <= 8) return id;
  return id.slice(0, 4) + '…' + id.slice(-4);
}

/* ── Icons ── */

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function KeyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
      <path d="m21 2-9.6 9.6" />
      <circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
  );
}

function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
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
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<Set<string>>(new Set(['read']));
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreate] = useTransition();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token ?? '';
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1'}/api-keys`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setKeys(Array.isArray(data) ? data : data?.items ?? []);
        }
      } catch {
        // silently fail
      }
    }
    load();
  }, []);

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
      const result = await createApiKeyAction(name.trim(), Array.from(scopes));
      if ('error' in result && result.error) {
        setError(result.error);
      } else if ('key' in result && result.key) {
        setNewKeyValue(result.key);
        setName('');
        try {
          const { createBrowserClient } = await import('@supabase/ssr');
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const token = session?.access_token ?? '';
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1'}/api-keys`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.ok) {
            const data = await res.json();
            setKeys(Array.isArray(data) ? data : data?.items ?? []);
          }
        } catch {
          // ignore
        }
      }
    });
  }

  async function handleRevoke(id: string) {
    setRevokingId(id);
    const result = await revokeApiKeyAction(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setKeys((prev) =>
        prev.map((k) =>
          k.id === id ? { ...k, revoked_at: new Date().toISOString() } : k
        )
      );
    }
    setRevokingId(null);
  }

  const activeKeys = keys.filter((k) => !k.revoked_at);

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">API Keys</h3>
      </div>

      {/* Create form */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{
            paddingLeft: '0.75rem',
            borderLeft: '2px solid var(--d-accent)',
          }}
        >
          Create New Key
        </span>

        <form onSubmit={handleCreate} className="d-surface">
          {error && (
            <div
              className="d-annotation"
              data-status="error"
              style={{ marginBottom: '1rem', display: 'block' }}
            >
              {error}
            </div>
          )}

          {newKeyValue && (
            <div
              className="d-annotation"
              data-status="success"
              style={{
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontWeight: 600 }}>New key:</span>
              <code
                style={{
                  fontFamily: 'var(--d-font-mono, monospace)',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.5rem',
                  background: 'var(--d-bg)',
                  borderRadius: 'var(--d-radius-sm)',
                }}
              >
                {newKeyValue}
              </code>
              <span
                className="text-xs"
                style={{ color: 'var(--d-text-muted)' }}
              >
                Save this — it won&apos;t be shown again.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex flex-col gap-1 flex-1">
              <label
                className="text-sm font-semibold"
                htmlFor="key-name"
              >
                Name
              </label>
              <input
                id="key-name"
                className="d-control"
                type="text"
                placeholder="My API Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <label
                className="flex items-center gap-1.5 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={scopes.has('read')}
                  onChange={() => toggleScope('read')}
                />
                Read
              </label>
              <label
                className="flex items-center gap-1.5 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={scopes.has('write')}
                  onChange={() => toggleScope('write')}
                />
                Write
              </label>
            </div>

            <button
              type="submit"
              className="d-interactive"
              data-variant="primary"
              disabled={isCreating}
              style={{
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <PlusIcon size={16} />
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </section>

      {/* List */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{
            paddingLeft: '0.75rem',
            borderLeft: '2px solid var(--d-accent)',
          }}
        >
          Active Keys ({activeKeys.length})
        </span>

        {activeKeys.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '3rem 0',
            }}
          >
            <span style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
              <KeyIcon size={48} />
            </span>
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
              No API keys yet.
            </p>
          </div>
        ) : (
          <div className="d-data">
            {activeKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="d-data-row flex items-center gap-3"
                style={{
                  padding: 'var(--d-data-py) var(--d-content-gap)',
                }}
              >
                <div
                  className="flex items-center gap-3"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <span style={{ color: 'var(--d-accent)', flexShrink: 0 }}>
                    <KeyIcon size={16} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="font-medium text-sm">{apiKey.name}</div>
                    <div
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
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {apiKey.scopes.map((scope) => (
                    <span key={scope} className="d-annotation">
                      {scope}
                    </span>
                  ))}
                </div>

                <div
                  className="flex flex-col"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--d-text-muted)',
                    flexShrink: 0,
                  }}
                >
                  <span>Created: {formatDate(apiKey.created_at)}</span>
                  <span>Last used: {formatDate(apiKey.last_used_at)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <CopyButton text={apiKey.id} />
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
