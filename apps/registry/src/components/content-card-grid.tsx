import type { ContentItem } from '@/lib/api';
import { ContentCard } from '@/components/content-card';
import { getShowcaseMetadataMap } from '@/lib/showcase';

interface ContentCardGridProps {
  items: ContentItem[];
  emptyMessage?: string;
  editable?: boolean;
}

function singularType(type: string): string {
  return type.endsWith('s') ? type.slice(0, -1) : type;
}

export async function ContentCardGrid({ items, emptyMessage, editable }: ContentCardGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-d-muted mb-4 opacity-50"
        >
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-d-muted text-sm">
          {emptyMessage ?? 'No content found.'}
        </p>
      </div>
    );
  }

  const showcaseMetadataBySlug = await getShowcaseMetadataMap(
    items
      .filter((item) => singularType(item.type) === 'blueprint')
      .map((item) => item.slug),
  );

  return (
    <div className="content-card-grid">
      {items.map((item) => (
        <ContentCard
          key={item.id}
          item={item}
          editable={editable}
          showcaseMetadata={showcaseMetadataBySlug[item.slug] ?? null}
        />
      ))}
    </div>
  );
}
