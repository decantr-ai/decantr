import { css } from '@decantr/css';
import { Shield, Clock } from 'lucide-react';
import { useState } from 'react';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { ModerationQueueItem } from '@/components/ModerationQueueItem';
import { MODERATION_ITEMS } from '@/data/mock';
import type { ModerationItem } from '@/data/mock';

export function ModerationQueuePage() {
  const [items, setItems] = useState<ModerationItem[]>(MODERATION_ITEMS);
  const [query, setQuery] = useState('');

  const pendingCount = items.filter((i) => i.status === 'pending').length;

  const filtered = items.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.content.name.toLowerCase().includes(q) ||
      item.content.type.toLowerCase().includes(q) ||
      item.submitter.name.toLowerCase().includes(q)
    );
  });

  function handleApprove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleReject(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="d-section" data-density="compact">
      <div className={css('_flex _col _gap5')}>
        {/* Header */}
        <div className={css('_flex _aic _jcsb _wrap _gap3')}>
          <div className={css('_flex _aic _gap3')}>
            <Shield size={20} style={{ color: 'var(--d-accent)' }} />
            <h1 className={css('_fontbold')} style={{ margin: 0, fontSize: '1.25rem', color: 'var(--d-text)' }}>
              Moderation Queue
            </h1>
          </div>
          <span className="d-annotation" data-status="warning">
            <Clock size={12} />
            {pendingCount} pending
          </span>
        </div>

        {/* Search + filter */}
        <SearchFilterBar
          onSearch={setQuery}
          resultCount={filtered.length}
        />

        {/* Queue items */}
        <div className={css('_flex _col _gap3')}>
          {filtered.map((item) => (
            <ModerationQueueItem
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
          {filtered.length === 0 && (
            <div
              className="d-surface"
              style={{ textAlign: 'center', padding: '2rem', color: 'var(--d-text-muted)' }}
            >
              No items in the moderation queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
