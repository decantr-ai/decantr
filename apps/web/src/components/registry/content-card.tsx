import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NamespaceBadge } from './namespace-badge';
import type { ContentItem } from '@/lib/api';

export function ContentCard({ item }: { item: ContentItem }) {
  const name = item.name || (item.data?.name as string) || item.slug;
  const description = item.description || (item.data?.description as string) || '';

  return (
    <Link href={`/registry/${item.type}/${encodeURIComponent(item.namespace)}/${item.slug}`}>
      <Card hover className="h-full">
        <div className="mb-3 flex items-center justify-between">
          <Badge>{item.type}</Badge>
          <NamespaceBadge namespace={item.namespace} />
        </div>
        <h3 className="mb-1 text-sm font-semibold text-[var(--fg)]">{name}</h3>
        <p className="mb-3 line-clamp-2 text-xs text-[var(--fg-muted)]">{description}</p>
        <span className="text-xs text-[var(--fg-muted)]">v{item.version}</span>
      </Card>
    </Link>
  );
}
