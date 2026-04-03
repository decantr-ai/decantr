import Link from 'next/link';
import type { ContentItem } from '@/lib/api';

const TYPE_BADGE_COLORS: Record<string, string> = {
  patterns: 'bg-d-coral/15 text-d-coral',
  themes: 'bg-d-amber/15 text-d-amber',
  blueprints: 'bg-d-cyan/15 text-d-cyan',
  shells: 'bg-d-green/15 text-d-green',
  archetypes: 'bg-d-purple/15 text-d-purple',
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ContentCard({ item }: { item: ContentItem }) {
  const href = `/${item.type}/${item.namespace}/${item.slug}`;
  const badgeColor = TYPE_BADGE_COLORS[item.type] ?? 'bg-d-surface text-d-muted';

  return (
    <Link
      href={href}
      className="lum-card-outlined block no-underline"
      data-type={item.type}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`d-annotation ${badgeColor}`}>
          {item.type.replace(/s$/, '')}
        </span>
        <span className="d-annotation">
          {item.namespace}
        </span>
      </div>

      <h3 className="text-base font-semibold text-d-text mb-1.5 leading-snug">
        {item.name || item.slug}
      </h3>

      {item.description && (
        <p className="text-sm text-d-muted line-clamp-2 mb-3">
          {item.description}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-d-muted font-mono mt-auto pt-2 border-t border-d-border/50">
        <span>v{item.version}</span>
        {item.owner_username && (
          <>
            <span className="opacity-40">|</span>
            <span>{item.owner_username}</span>
          </>
        )}
        {item.published_at && (
          <>
            <span className="opacity-40">|</span>
            <span>{formatDate(item.published_at)}</span>
          </>
        )}
      </div>
    </Link>
  );
}
