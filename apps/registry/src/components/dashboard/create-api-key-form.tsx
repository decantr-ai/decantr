'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CopyButton } from '@/components/registry/copy-button';
import { createApiKeyAction } from '@/app/dashboard/api-keys/actions';

const SCOPES = ['read', 'write', 'org:read', 'org:write'];

export function CreateApiKeyForm() {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(['read']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  function toggleScope(scope: string) {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const result = await createApiKeyAction(name.trim(), scopes);

    if ('error' in result && result.error) {
      setError(result.error);
    } else if ('key' in result && result.key) {
      setCreatedKey(result.key);
      setName('');
      setScopes(['read']);
    }
    setLoading(false);
  }

  if (createdKey) {
    return (
      <Card className="border-[var(--success)]/30">
        <h3 className="mb-2 text-sm font-semibold text-[var(--success)]">API Key Created</h3>
        <p className="mb-3 text-xs text-[var(--fg-muted)]">
          Copy this key now. It will not be shown again.
        </p>
        <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-elevated)] p-3">
          <code className="flex-1 break-all font-mono text-xs text-[var(--fg)]">
            {createdKey}
          </code>
          <CopyButton text={createdKey} label="Copy" />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => setCreatedKey(null)}
        >
          Done
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-48">
        <label className="mb-1 block text-xs text-[var(--fg-muted)]">Key Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., CI/CD Pipeline"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-[var(--fg-muted)]">Scopes</label>
        <div className="flex gap-2">
          {SCOPES.map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => toggleScope(scope)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                scopes.includes(scope)
                  ? 'bg-[var(--primary)]/10 text-[var(--primary-light)]'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-surface)] border border-[var(--border)]'
              }`}
            >
              {scope}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading || !name.trim()}>
        {loading ? 'Creating...' : 'Create Key'}
      </Button>

      {error && <p className="w-full text-sm text-[var(--error)]">{error}</p>}
    </form>
  );
}
