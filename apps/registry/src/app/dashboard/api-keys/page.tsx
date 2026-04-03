'use client';

import { useEffect, useState, useTransition } from 'react';
import { createApiKeyAction, revokeApiKeyAction } from './actions';

interface ApiKeyDisplay {
  id: string;
  name: string;
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

function maskKey(key: string): string {
  if (key.length <= 8) return key;
  return key.slice(0, 3) + '****...' + key.slice(-4);
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyDisplay[]>([]);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<Set<string>>(new Set(['read']));
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreate] = useTransition();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Load keys on mount
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
        // Silently fail, keys stay empty
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
        // Reload keys
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
          // Ignore refresh error
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
  const revokedKeys = keys.filter((k) => !!k.revoked_at);

  return (
    <div className="d-section max-w-4xl" data-density="compact">
      <h1 className="d-label border-l-2 border-d-accent pl-2 text-lg mb-6">
        API Keys
      </h1>

      {/* Create Form */}
      <form
        onSubmit={handleCreate}
        className="d-surface rounded-lg p-5 mb-6"
      >
        {error && (
          <div
            className="d-annotation px-3 py-2 rounded text-sm mb-4"
            data-status="error"
          >
            {error}
          </div>
        )}

        {newKeyValue && (
          <div
            className="d-annotation px-3 py-2 rounded text-sm mb-4 flex items-center gap-2"
            data-status="success"
          >
            <span className="font-medium">New key created:</span>
            <code className="font-mono text-xs bg-d-bg px-2 py-0.5 rounded select-all">
              {newKeyValue}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(newKeyValue)}
              className="d-interactive py-1 px-2 text-xs rounded shrink-0"
              data-variant="ghost"
            >
              Copy
            </button>
            <span className="text-xs text-d-muted ml-auto">
              Save this key -- it won't be shown again.
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <label
              htmlFor="key-name"
              className="text-sm font-medium text-d-text"
            >
              Key Name
            </label>
            <input
              id="key-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My API Key"
              className="d-control w-full rounded-md py-2 px-3 text-sm"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm text-d-text cursor-pointer">
              <input
                type="checkbox"
                checked={scopes.has('read')}
                onChange={() => toggleScope('read')}
                className="d-control rounded"
              />
              Read
            </label>
            <label className="flex items-center gap-1.5 text-sm text-d-text cursor-pointer">
              <input
                type="checkbox"
                checked={scopes.has('write')}
                onChange={() => toggleScope('write')}
                className="d-control rounded"
              />
              Write
            </label>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="d-interactive py-2 px-4 text-sm rounded-md disabled:opacity-50 shrink-0"
            data-variant="primary"
          >
            {isCreating ? 'Creating...' : 'Create Key'}
          </button>
        </div>
      </form>

      {/* Active Keys */}
      {activeKeys.length === 0 && revokedKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-d-muted mb-3"
          >
            <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
          <p className="text-sm text-d-muted">
            No API keys yet. Create one above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {activeKeys.map((key) => (
            <div
              key={key.id}
              className="d-data-row flex items-center gap-4 py-3 px-4 rounded-md"
            >
              {/* Key icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-d-muted shrink-0"
              >
                <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>

              {/* Key info */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-d-text truncate">
                  {key.name}
                </span>
                <span className="text-xs font-mono text-d-muted">
                  {maskKey(key.id)}
                </span>
              </div>

              {/* Scopes */}
              <div className="hidden sm:flex items-center gap-1.5">
                {key.scopes.map((scope) => (
                  <span key={scope} className="d-annotation text-xs">
                    {scope}
                  </span>
                ))}
              </div>

              {/* Dates */}
              <div className="hidden md:flex flex-col text-xs text-d-muted text-right shrink-0">
                <span>Created {formatDate(key.created_at)}</span>
                <span>Used {formatDate(key.last_used_at)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(key.id)}
                  className="d-interactive py-1 px-2 text-xs rounded"
                  data-variant="ghost"
                  title="Copy key ID"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleRevoke(key.id)}
                  disabled={revokingId === key.id}
                  className="d-interactive py-1 px-2 text-xs rounded disabled:opacity-50"
                  data-variant="danger"
                  title="Revoke key"
                >
                  {revokingId === key.id ? '...' : 'Revoke'}
                </button>
              </div>
            </div>
          ))}

          {/* Revoked Keys */}
          {revokedKeys.length > 0 && (
            <>
              <div className="lum-divider my-4" />
              <h3 className="text-xs font-medium text-d-muted uppercase tracking-wider mb-2">
                Revoked
              </h3>
              {revokedKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center gap-4 py-2 px-4 opacity-50"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-d-muted shrink-0"
                  >
                    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                  <span className="text-sm text-d-muted line-through truncate">
                    {key.name}
                  </span>
                  <span className="text-xs text-d-muted ml-auto">
                    Revoked {formatDate(key.revoked_at)}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
