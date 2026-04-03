import type { ContentItem } from '@/lib/api';
import { ContentCard } from './content-card';

export function ContentGrid({ items }: { items: ContentItem[] }) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-[var(--fg-muted)]">
        No content found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
}
