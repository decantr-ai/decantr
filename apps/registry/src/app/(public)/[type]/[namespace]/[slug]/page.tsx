import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { JsonViewer } from '@/components/json-viewer';
import { CopyInstallButton } from './copy-install-button';

const TYPE_BADGE_COLORS: Record<string, string> = {
  patterns: 'bg-d-coral/15 text-d-coral',
  themes: 'bg-d-amber/15 text-d-amber',
  blueprints: 'bg-d-cyan/15 text-d-cyan',
  shells: 'bg-d-green/15 text-d-green',
  archetypes: 'bg-d-purple/15 text-d-purple',
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface DetailPageProps {
  params: Promise<{ type: string; namespace: string; slug: string }>;
}

export default async function ContentDetailPage({ params }: DetailPageProps) {
  const { type, namespace, slug } = await params;

  let content: ContentItem | null = null;

  try {
    content = await getContent(type, namespace, slug);
  } catch {
    notFound();
  }

  if (!content) {
    notFound();
  }

  const badgeColor = TYPE_BADGE_COLORS[type] ?? 'bg-d-surface text-d-muted';
  const singularType = type.replace(/s$/, '');
  const installCmd = `decantr get ${singularType} ${namespace}/${slug}`;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-d-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-d-primary transition-colors no-underline text-d-muted">
          Registry
        </Link>
        <span className="opacity-40">/</span>
        <Link
          href={`/browse/${type}`}
          className="hover:text-d-primary transition-colors no-underline text-d-muted capitalize"
        >
          {type}
        </Link>
        <span className="opacity-40">/</span>
        <Link
          href={`/browse?namespace=${namespace}`}
          className="hover:text-d-primary transition-colors no-underline text-d-muted"
        >
          {namespace}
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-d-text font-medium">{slug}</span>
      </nav>

      {/* Content detail hero */}
      <section className="d-section flex flex-col gap-4 pb-6 border-b border-d-border">
        {/* Badge row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`d-annotation ${badgeColor}`}>
            {singularType}
          </span>
          <span className="d-annotation">
            {namespace}
          </span>
          {content.status && content.status !== 'published' && (
            <span className="d-annotation" data-status="warning">
              {content.status}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-d-text leading-tight">
          {content.name || slug}
        </h1>

        {/* Description */}
        {content.description && (
          <p className="text-d-muted text-base leading-relaxed max-w-2xl">
            {content.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-d-muted font-mono">
          <span>v{content.version}</span>
          {content.owner_username && (
            <>
              <span className="opacity-30">&#183;</span>
              <Link
                href={`/profile/${content.owner_username}`}
                className="text-d-muted no-underline hover:text-d-primary transition-colors"
              >
                {content.owner_name || content.owner_username}
              </Link>
            </>
          )}
          {content.published_at && (
            <>
              <span className="opacity-30">&#183;</span>
              <span>{formatDate(content.published_at)}</span>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <CopyInstallButton installCmd={installCmd} />
          {content.data && (
            <CopyInstallButton
              installCmd={JSON.stringify(content.data, null, 2)}
              label="Copy JSON"
              successLabel="Copied"
              variant="ghost"
            />
          )}
        </div>
      </section>

      {/* JSON viewer */}
      {content.data && (
        <section>
          <h2 className="d-label border-l-2 border-d-accent pl-2 mb-4">
            Content Data
          </h2>
          <JsonViewer
            data={content.data}
            title={`${namespace}/${slug} — v${content.version}`}
          />
        </section>
      )}
    </div>
  );
}
