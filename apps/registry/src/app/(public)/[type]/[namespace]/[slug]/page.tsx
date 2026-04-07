import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { JsonViewer } from '@/components/json-viewer';
import { CopyInstallButton } from './copy-install-button';

const TYPE_COLORS: Record<string, string> = {
  pattern: 'var(--d-coral)',
  theme: 'var(--d-amber)',
  blueprint: 'var(--d-cyan)',
  shell: 'var(--d-green)',
  archetype: 'var(--d-purple)',
  patterns: 'var(--d-coral)',
  themes: 'var(--d-amber)',
  blueprints: 'var(--d-cyan)',
  shells: 'var(--d-green)',
  archetypes: 'var(--d-purple)',
};

function singularType(type: string): string {
  return type.endsWith('s') ? type.slice(0, -1) : type;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function prettifyName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface DetailPageProps {
  params: Promise<{ type: string; namespace: string; slug: string }>;
}

export default async function ContentDetailPage({ params }: DetailPageProps) {
  const { type, namespace: rawNamespace, slug } = await params;
  const namespace = decodeURIComponent(rawNamespace);

  let content: ContentItem | null = null;

  try {
    content = await getContent(type, namespace, slug);
  } catch {
    notFound();
  }

  if (!content) {
    notFound();
  }

  const singular = singularType(type);
  const typeColor = TYPE_COLORS[type] ?? 'var(--d-primary)';
  const name =
    content.name ||
    (content.data?.name as string | undefined) ||
    prettifyName(slug);
  const description =
    content.description || (content.data?.description as string | undefined);
  const installCmd = `decantr get ${singular} ${namespace}/${slug}`;
  const tags = (content.data?.tags as string[] | undefined) ?? [];

  return (
    <div
      style={{
        background: `linear-gradient(180deg, color-mix(in srgb, ${typeColor} 5%, transparent) 0%, transparent 100%)`,
        minHeight: '100%',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs"
          style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="no-underline transition-colors hover:text-d-primary"
            style={{ color: 'var(--d-text-muted)' }}
          >
            Registry
          </Link>
          <span className="opacity-40">/</span>
          <Link
            href={`/browse/${type}`}
            className="no-underline transition-colors hover:text-d-primary capitalize"
            style={{ color: 'var(--d-text-muted)' }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Link>
          <span className="opacity-40">/</span>
          <Link
            href={`/browse?namespace=${encodeURIComponent(namespace)}`}
            className="no-underline transition-colors hover:text-d-primary"
            style={{ color: 'var(--d-text-muted)' }}
          >
            {namespace}
          </Link>
          <span className="opacity-40">/</span>
          <span style={{ color: 'var(--d-text)', fontWeight: 500 }}>{slug}</span>
        </nav>

        {/* Hero card */}
        <div className="d-surface" data-elevation="raised">
          <div className="flex flex-col gap-4">
            {/* Type + namespace badges */}
            <div className="flex items-center gap-2">
              <span
                className="d-annotation"
                style={{
                  background: typeColor,
                  color: '#141414',
                  fontWeight: 600,
                }}
              >
                {singular}
              </span>
              <span className="d-annotation">{namespace}</span>
              {content.status && content.status !== 'published' && (
                <span className="d-annotation" data-status="warning">
                  {content.status}
                </span>
              )}
            </div>

            {/* Name + version */}
            <div>
              <h1
                className="font-bold"
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  color: 'var(--d-text)',
                }}
              >
                {name}
              </h1>
              <span
                className="text-sm"
                style={{
                  color: 'var(--d-text-muted)',
                  fontFamily: 'var(--d-font-mono, monospace)',
                }}
              >
                v{content.version}
              </span>
            </div>

            {/* Description */}
            {description && (
              <p
                style={{
                  margin: 0,
                  color: 'var(--d-text-muted)',
                  lineHeight: 1.6,
                  maxWidth: '42rem',
                }}
              >
                {description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap text-sm">
              {content.owner_username && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--d-text-muted)' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <Link
                    href={`/profile/${content.owner_username}`}
                    className="no-underline hover:text-d-primary transition-colors"
                    style={{ color: 'var(--d-text)' }}
                  >
                    {content.owner_name || content.owner_username}
                  </Link>
                </div>
              )}
              {content.published_at && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--d-text-muted)' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span style={{ color: 'var(--d-text-muted)' }}>
                    {formatDate(content.published_at)}
                  </span>
                </div>
              )}
              {tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--d-text-muted)' }}>
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  {tags.map((tag) => (
                    <span key={tag} className="d-annotation">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
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
          </div>
        </div>

        {/* JSON viewer */}
        {content.data && (
          <div style={{ marginTop: '2.5rem' }}>
            <JsonViewer
              data={content.data}
              title={`${namespace}/${slug} — v${content.version}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
