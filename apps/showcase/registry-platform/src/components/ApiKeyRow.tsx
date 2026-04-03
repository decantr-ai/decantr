import { css } from '@decantr/css';
import { useState, useCallback } from 'react';
import { Key, Copy, Check, Trash2 } from 'lucide-react';
import type { ApiKey } from '@/data/mock';

interface Props {
  apiKey: ApiKey;
}

export function ApiKeyRow({ apiKey }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [apiKey.key]);

  return (
    <div
      className={css('_flex _aic _gap3') + ' d-data-row'}
      style={{ padding: 'var(--d-data-py) var(--d-content-gap)' }}
    >
      {/* Key icon + name + masked value */}
      <div className={css('_flex _aic _gap3')} style={{ flex: 1, minWidth: 0 }}>
        <Key size={16} style={{ color: 'var(--d-accent)', flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div className={css('_fontmedium _textsm')}>{apiKey.name}</div>
          <div
            className={css('_textsm')}
            style={{
              fontFamily: 'var(--d-font-mono, monospace)',
              color: 'var(--d-text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {apiKey.key}
          </div>
        </div>
      </div>

      {/* Scope badges */}
      <div className={css('_flex _aic _gap1')}>
        {apiKey.scopes.map((scope) => (
          <span key={scope} className="d-annotation">{scope}</span>
        ))}
      </div>

      {/* Dates */}
      <div className={css('_flex _col')} style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', flexShrink: 0 }}>
        <span>Created: {apiKey.createdAt}</span>
        <span>Last used: {apiKey.lastUsed}</span>
      </div>

      {/* Actions */}
      <div className={css('_flex _aic _gap1')}>
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={handleCopy}
          style={{ padding: '0.25rem' }}
          aria-label="Copy key"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <button
          className="d-interactive"
          data-variant="ghost"
          style={{ padding: '0.25rem', color: 'var(--d-error)' }}
          aria-label="Revoke key"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
