'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createApiKeyAction, revokeApiKeyAction } from './actions';
import { api } from '@/lib/api';
import { useWorkspaceState } from '@/components/workspace-state-provider';

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
      className="d-interactive registry-icon-button"
      data-variant="ghost"
      onClick={handleCopy}
      aria-label="Copy key"
    >
      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
    </button>
  );
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyDisplay[]>([]);
  const workspace = useWorkspaceState();
  const me = workspace.me;
  const [showForm, setShowForm] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [keyTarget, setKeyTarget] = useState<'personal' | 'organization'>('personal');
  const [orgId, setOrgId] = useState('');
  const [scopes, setScopes] = useState<Set<string>>(new Set(['read']));
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreate] = useTransition();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    if (keyTarget === 'organization' && !workspace.capabilities.canUseOrganizationFeatures) {
      setKeyTarget('personal');
    }
  }, [keyTarget, workspace.capabilities.canUseOrganizationFeatures]);

  const loadKeys = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';

      const res = await fetch(`${API_URL}/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setKeys(Array.isArray(data) ? data : data?.items ?? []);
      }

      const firstOrganizationId = workspace.activeOrganization?.id ?? me?.organizations?.[0]?.id;
      if (firstOrganizationId) {
        setOrgId((current) => current || firstOrganizationId);
      }
    } catch {
      // ignore load failures in the empty-state flow
    }
  }, [me?.organizations, workspace.activeOrganization?.id]);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  function toggleScope(scope: string) {
    setScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope);
      else next.add(scope);
      return next;
    });
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
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
      setKeys((prev) => prev.filter((key) => key.id !== id));
    }

    setRevokingId(null);
  }

  const activeKeys = keys.filter((key) => !key.revoked_at);

  return (
    <div className="registry-page-stack">
      <div className="registry-dashboard-head">
        <div className="registry-dashboard-copy">
          <h3 className="registry-dashboard-title">API Keys</h3>
          <p className="registry-dashboard-description">
            Create personal or organization keys, review scopes, and revoke stale credentials without leaving the workspace.
          </p>
        </div>
        <button
          type="button"
          className="d-interactive"
          data-variant="primary"
          onClick={() => {
            setShowForm((open) => !open);
            setError(null);
          }}
        >
          <PlusIcon size={16} />
          Generate New Key
        </button>
      </div>

      {newKeyValue ? (
        <div className="d-surface registry-dashboard-panel">
          <div className="registry-panel-note">
            <div className="flex items-center gap-2">
              <CheckIcon size={14} />
              <span className="text-sm font-semibold">
                Key created. Save it now because it won&apos;t be shown again.
              </span>
            </div>
            <div className="registry-inline-actions">
              <code className="registry-mono-data registry-key-banner-value">{newKeyValue}</code>
              <CopyButton text={newKeyValue} />
              <button
                type="button"
                className="d-interactive"
                data-variant="ghost"
                onClick={() => setNewKeyValue(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showForm ? (
        <form onSubmit={handleCreate} className="d-surface registry-key-form">
          {error ? (
            <span className="d-annotation registry-settings-message" data-status="error">
              {error}
            </span>
          ) : null}

          <div className="registry-form-grid">
            <label className="text-sm font-medium" htmlFor="key-name">
              Name
            </label>
            <input
              id="key-name"
              className="d-control"
              type="text"
              placeholder="My API Key"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="registry-form-grid">
            <label className="text-sm font-medium" htmlFor="key-target">
              Key scope
            </label>
            <select
              id="key-target"
              className="d-control registry-inline-select"
              value={keyTarget}
              onChange={(event) => setKeyTarget(event.target.value as 'personal' | 'organization')}
            >
              <option value="personal">Personal key</option>
              {workspace.capabilities.canUseOrganizationFeatures && me?.organizations.length ? (
                <option value="organization">Organization key</option>
              ) : null}
            </select>
          </div>

          {keyTarget === 'organization' && workspace.capabilities.canUseOrganizationFeatures && me?.organizations.length ? (
            <div className="registry-form-grid">
              <label className="text-sm font-medium" htmlFor="org-id">
                Organization
              </label>
              <select
                id="org-id"
                className="d-control registry-inline-select"
                value={orgId}
                onChange={(event) => setOrgId(event.target.value)}
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
            <div className="registry-key-scope-options">
              <label className="registry-check-option">
                <input
                  type="checkbox"
                  checked={scopes.has('read')}
                  onChange={() => toggleScope('read')}
                />
                Read
              </label>
              <label className="registry-check-option">
                <input
                  type="checkbox"
                  checked={scopes.has('write')}
                  onChange={() => toggleScope('write')}
                />
                Write
              </label>
            </div>
          </div>

          <div className="registry-inline-actions" data-align="end">
            <button
              type="button"
              className="d-interactive"
              data-variant="ghost"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="d-interactive"
              data-variant="primary"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      ) : null}

      {activeKeys.length > 0 ? (
        <section className="d-section" data-density="compact">
          <div className="registry-key-list">
            {activeKeys.map((apiKey) => (
              <div key={apiKey.id} className="d-surface registry-key-card">
                <div className="registry-key-card-header">
                  <div className="registry-key-card-meta">
                    <div className="registry-key-name-row">
                      <span className="registry-empty-state-icon" aria-hidden="true">
                        <KeyIcon size={16} />
                      </span>
                      <span className="registry-key-name">{apiKey.name}</span>
                      {apiKey.org_id ? (
                        <span className="d-annotation" data-status="info">
                          Org
                        </span>
                      ) : null}
                    </div>
                    <span className="registry-key-mask">{maskKey(apiKey.id)}</span>
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
                      className="d-interactive registry-icon-button"
                      data-variant="ghost"
                      data-tone="danger"
                      onClick={() => handleRevoke(apiKey.id)}
                      disabled={revokingId === apiKey.id}
                      aria-label="Revoke key"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="d-surface registry-empty-state" data-density="compact">
          <span className="registry-empty-state-icon">
            <KeyIcon size={48} />
          </span>
          <p className="registry-empty-state-copy">No API keys yet.</p>
          <button
            type="button"
            className="d-interactive"
            data-variant="primary"
            onClick={() => {
              setShowForm(true);
              setError(null);
            }}
          >
            Generate Your First Key
          </button>
        </div>
      )}
    </div>
  );
}
