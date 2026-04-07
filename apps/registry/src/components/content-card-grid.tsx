import type { ContentItem } from '@/lib/api';
import { ContentCard } from './content-card';

interface Props {
  items: ContentItem[];
  editable?: boolean;
  onDelete?: (id: string) => void;
}

export function ContentCardGrid({ items, editable, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3" style={{ padding: '3rem 0' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
          No content found. Try broadening your filters or browse popular items.
        </p>
      </div>
    );
  }

  return (
    <div className="content-card-grid lum-stagger">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} editable={editable} onDelete={onDelete} />
      ))}
    </div>
  );
}
