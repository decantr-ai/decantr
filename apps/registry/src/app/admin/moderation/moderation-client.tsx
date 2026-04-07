'use client';

import { useState } from 'react';
import type { ModerationQueueItem } from '@/lib/api';
import { ModerationCard } from './moderation-card';

const STATUS_TABS = ['pending', 'approved', 'rejected'] as const;

interface Props {
  initialItems: ModerationQueueItem[];
  error?: string;
}

export function ModerationClient({ initialItems, error: initialError }: Props) {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [items, setItems] = useState(initialItems);
  const [error] = useState(initialError || '');

  const filtered = items.filter((item) => item.status === activeTab);

  function handleUpdated(id: string, newStatus: 'approved' | 'rejected') {
    setItems(items.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    ));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--d-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <h3 className="text-lg font-semibold">Moderation Queue</h3>
      </div>

      {error && <div className="d-annotation" data-status="error">{error}</div>}

      {/* Status tabs */}
      <div className="flex items-center gap-2">
        {STATUS_TABS.map((tab) => {
          const count = items.filter((i) => i.status === tab).length;
          return (
            <button
              key={tab}
              className="d-interactive"
              data-variant={activeTab === tab ? 'primary' : 'ghost'}
              onClick={() => setActiveTab(tab)}
              style={{ borderRadius: 'var(--d-radius-full)', fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {count > 0 && (
                <span className="d-annotation" style={{ marginLeft: '0.25rem' }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Queue items */}
      <div className="flex flex-col gap-4 lum-stagger">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <ModerationCard key={item.id} item={item} onUpdated={handleUpdated} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-3" style={{ padding: '3rem 0' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
              No {activeTab} items in the queue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
