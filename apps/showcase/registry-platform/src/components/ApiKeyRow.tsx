import { useState, useCallback } from 'react';
import type { ApiKey } from '../data/mock';

interface ApiKeyRowProps {
  apiKey: ApiKey;
  onRevoke?: (id: string) => void;
}

export default function ApiKeyRow({ apiKey, onRevoke }: ApiKeyRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(apiKey.fullKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [apiKey.fullKey]);

  const handleRevoke = useCallback(() => {
    onRevoke?.(apiKey.id);
  }, [onRevoke, apiKey.id]);

  return (
    <div
      className="d-data-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        gap: '1rem',
        transition: 'background 0.15s ease',
      }}
    >
      {/* Left: icon + name + masked key */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 0', minWidth: 0 }}>
        <span
          style={{
            fontSize: '1.125rem',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--d-radius)',
            background: 'var(--d-surface)',
            flexShrink: 0,
          }}
        >
          {'\uD83D\uDD11'}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--d-text)' }}>{apiKey.name}</div>
          <div
            style={{
              fontFamily: 'var(--d-font-mono, ui-monospace, monospace)',
              fontSize: '0.75rem',
              color: 'var(--d-text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {apiKey.maskedKey}
          </div>
        </div>
      </div>

      {/* Middle: scope badges */}
      <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
        {apiKey.scopes.map((scope) => (
          <span key={scope} className="d-annotation" style={{ textTransform: 'capitalize' }}>
            {scope}
          </span>
        ))}
      </div>

      {/* Right: last used + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', whiteSpace: 'nowrap', marginRight: '0.25rem' }}>
          {apiKey.lastUsed}
        </span>
        <button
          type="button"
          className="d-interactive"
          data-variant="ghost"
          onClick={handleCopy}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          type="button"
          className="d-interactive"
          data-variant="danger"
          onClick={handleRevoke}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
        >
          Revoke
        </button>
      </div>
    </div>
  );
}
