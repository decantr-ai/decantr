'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { revokeApiKeyAction } from '@/app/dashboard/api-keys/actions';
import type { ApiKey } from '@/lib/api';

export function ApiKeyList({ keys }: { keys: ApiKey[] }) {
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function handleRevoke(id: string) {
    if (!confirm('Are you sure? This API key will stop working immediately.')) return;
    setRevokingId(id);
    await revokeApiKeyAction(id);
    setRevokingId(null);
  }

  if (keys.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] p-12 text-center">
        <p className="text-[var(--fg-muted)]">No API keys yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {keys.map((key) => (
        <div
          key={key.id}
          className={`flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 ${key.revoked_at ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{key.name}</span>
            <div className="flex gap-1">
              {key.scopes.map((scope) => (
                <Badge key={scope} variant="default">{scope}</Badge>
              ))}
            </div>
            {key.revoked_at && <Badge variant="error">Revoked</Badge>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--fg-muted)]">
              {key.last_used_at
                ? `Last used ${new Date(key.last_used_at).toLocaleDateString()}`
                : 'Never used'}
            </span>
            <span className="text-xs text-[var(--fg-dim)]">
              Created {new Date(key.created_at).toLocaleDateString()}
            </span>
            {!key.revoked_at && (
              <Button
                variant="danger"
                size="sm"
                disabled={revokingId === key.id}
                onClick={() => handleRevoke(key.id)}
              >
                {revokingId === key.id ? 'Revoking...' : 'Revoke'}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
