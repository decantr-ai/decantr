import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchFilterBar } from '../../components/SearchFilterBar';
import ModerationQueueItem from '../../components/ModerationQueueItem';
import { moderationQueue, type ModerationItem } from '../../data/mock';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function ModerationQueuePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(moderationQueue);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState('relevance');

  const filteredItems = useMemo(() => {
    let result = items;

    if (statusFilter !== 'all') {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.content.name.toLowerCase().includes(q) ||
          item.content.description.toLowerCase().includes(q) ||
          item.submitter.name.toLowerCase().includes(q),
      );
    }

    return result;
  }, [items, statusFilter, searchQuery]);

  const handleApprove = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved' as const } : item)),
    );
  }, []);

  const handleReject = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'rejected' as const } : item)),
    );
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="d-label" data-anchor="">
        Moderation Queue
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeType={statusFilter}
        onTypeChange={(t) => setStatusFilter(t as StatusFilter)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 'var(--d-gap-2)' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => {
          const isActive = statusFilter === status;
          const count = status === 'all' ? items.length : items.filter((i) => i.status === status).length;
          return (
            <button
              key={status}
              type="button"
              className="d-interactive"
              data-variant={isActive ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter(status)}
              style={{
                borderRadius: 'var(--d-radius-full)',
                fontSize: '0.8125rem',
                padding: '0.375rem 0.875rem',
                fontWeight: isActive ? 600 : 400,
                textTransform: 'capitalize',
              }}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-4)' }}>
        {filteredItems.map((item) => (
          <ModerationQueueItem
            key={item.id}
            item={item}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewDetail={(id) => navigate(`/admin/moderation/${id}`)}
          />
        ))}
        {filteredItems.length === 0 && (
          <div
            className="d-surface"
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--d-text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No items match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
