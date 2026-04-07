import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getContent } from '@/lib/api';
import { JsonViewer } from '@/components/json-viewer';
import { ShowcasePreviewHero } from '@/components/showcase-preview-hero';
import { CopyInstallButton } from './copy-install-button';

const TYPE_COLORS: Record<string, string> = {
  pattern: 'var(--d-coral)',
  theme: 'var(--d-amber)',
  blueprint: 'var(--d-cyan)',
  shell: 'var(--d-green)',
  archetype: 'var(--d-purple)',
};

interface Props {
  params: Promise<{ type: string; namespace: string; slug: string }>;
}

export default async function ContentDetailPage({ params }: Props) {
  const { type, namespace: rawNamespace, slug } = await params;
  const namespace = decodeURIComponent(rawNamespace);
  const singularType = type.endsWith('s') ? type.slice(0, -1) : type;
  const typeColor = TYPE_COLORS[singularType] || 'var(--d-primary)';

  let content: any;
  try {
    content = await getContent(type, namespace, slug);
  } catch (error: any) {
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      notFound();
    }
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className="d-surface flex flex-col items-center gap-3" style={{ padding: '3rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--d-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
            Failed to load content. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const installCmd = `decantr get ${singularType} ${namespace}/${slug}`;
  const isBlueprint = singularType === 'blueprint';

  return (
    <div>
      {/* Type-colored gradient background */}
      <div
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${typeColor} 6%, var(--d-bg)) 0%, var(--d-bg) 100%)`,
          paddingBottom: '2rem',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 0' }}>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="text-sm" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Registry</Link>
            <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>/</span>
            <Link href={`/browse/${type}`} className="text-sm" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Link>
            <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>/</span>
            <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>{namespace}</span>
            <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>/</span>
            <span className="text-sm" style={{ color: 'var(--d-text)' }}>{slug}</span>
          </nav>

          {/* Hero card */}
          <div className="d-surface" data-elevation="raised">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="d-annotation"
                style={{
                  background: typeColor,
                  color: '#141414',
                }}
              >
                {singularType}
              </span>
              <span className="d-annotation">{namespace}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold" style={{ marginBottom: '0.5rem' }}>
              {content.name || slug}
            </h1>

            {/* Description */}
            {content.description && (
              <p className="text-sm" style={{ color: 'var(--d-text-muted)', marginBottom: '1rem', maxWidth: '70ch' }}>
                {content.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
              <span style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>v{content.version}</span>
              {content.owner_name && <span>{content.owner_name}</span>}
              {content.published_at && <span>{new Date(content.published_at).toLocaleDateString()}</span>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <CopyInstallButton text={installCmd} />
            </div>
          </div>
        </div>
      </div>

      {/* Blueprint screenshot preview */}
      {isBlueprint && content.slug && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <ShowcasePreviewHero slug={content.slug} title={content.name || slug} />
        </div>
      )}

      {/* JSON viewer */}
      {content.data && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
          <JsonViewer data={content.data} title={`${namespace}/${slug}`} />
        </div>
      )}
    </div>
  );
}
