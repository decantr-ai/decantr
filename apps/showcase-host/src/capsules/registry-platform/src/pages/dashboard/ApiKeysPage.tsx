import { useState, useCallback } from 'react';
import ApiKeyRow from '../../components/ApiKeyRow';
import { apiKeys as initialKeys } from '../../data/mock';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(initialKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const handleRevoke = useCallback((id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }, []);

  const handleCreate = useCallback(() => {
    if (!newKeyName.trim()) return;
    const id = String(Date.now());
    setKeys((prev) => [
      ...prev,
      {
        id,
        name: newKeyName.trim(),
        maskedKey: `sk-****...${id.slice(-4)}`,
        fullKey: `sk-new-${id}`,
        scopes: ['read'],
        createdAt: new Date().toISOString().split('T')[0] ?? '',
        lastUsed: 'never',
      },
    ]);
    setNewKeyName('');
    setShowCreate(false);
  }, [newKeyName]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="d-label" data-anchor="">
        API Keys
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>API Keys</h2>
        <button
          type="button"
          className="d-interactive"
          data-variant="primary"
          onClick={() => setShowCreate((v) => !v)}
          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
        >
          New API Key
        </button>
      </div>

      {showCreate && (
        <div
          className="d-surface"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
          }}
        >
          <input
            type="text"
            className="d-control"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Staging)"
            style={{ flex: 1, maxWidth: '320px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
          <button
            type="button"
            className="d-interactive"
            data-variant="primary"
            onClick={handleCreate}
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
          >
            Create
          </button>
          <button
            type="button"
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setShowCreate(false)}
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
          >
            Cancel
          </button>
        </div>
      )}

      <div
        className="d-surface"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {keys.map((key) => (
          <ApiKeyRow key={key.id} apiKey={key} onRevoke={handleRevoke} />
        ))}
        {keys.length === 0 && (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--d-text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No API keys yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
