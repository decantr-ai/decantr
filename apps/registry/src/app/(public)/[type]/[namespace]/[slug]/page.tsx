import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/api';
import type { ContentRecord } from '@/lib/api';
import { JsonViewer } from '@/components/json-viewer';
import { getShowcaseMetadata, getShowcaseUrl } from '@/lib/showcase';
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

function formatVerificationLabel(status?: string | null): string | null {
  switch (status) {
    case 'smoke-green':
      return 'smoke verified';
    case 'build-green':
      return 'build verified';
    case 'smoke-red':
      return 'smoke failed';
    case 'build-red':
      return 'build failed';
    case 'pending':
      return 'verification pending';
    default:
      return null;
  }
}

interface DetailPageProps {
  params: Promise<{ type: string; namespace: string; slug: string }>;
}

export default async function ContentDetailPage({ params }: DetailPageProps) {
  const { type, namespace: rawNamespace, slug } = await params;
  const namespace = decodeURIComponent(rawNamespace);

  let content: ContentRecord | null = null;

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
    (content.data?.name as string | undefined) ||
    prettifyName(slug);
  const description =
    content.data?.description as string | undefined;
  const installCmd = `decantr get ${singular} ${namespace}/${slug}`;
  const tags = (content.data?.tags as string[] | undefined) ?? [];
  const intelligence = content.intelligence ?? null;
  const showcaseMeta = singular === 'blueprint' ? await getShowcaseMetadata(slug) : null;
  const showcaseVerification = showcaseMeta?.verification ?? null;

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
              {showcaseMeta && (
                <Link
                  href={getShowcaseUrl(slug)}
                  className="d-interactive no-underline"
                  data-variant="ghost"
                >
                  Open Showcase
                </Link>
              )}
            </div>
          </div>
        </div>

        {intelligence && (
          <div className="d-surface" data-elevation="raised" style={{ marginTop: '1.25rem' }}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {intelligence.recommended && (
                  <span className="d-annotation" data-status="success">
                    recommended
                  </span>
                )}
                <span className="d-annotation">
                  quality {intelligence.quality_score ?? 'n/a'}
                </span>
                <span className="d-annotation">
                  confidence {intelligence.confidence_score ?? 'n/a'}
                </span>
                <span className="d-annotation">
                  {intelligence.benchmark_confidence} benchmark confidence
                </span>
                {formatVerificationLabel(intelligence.verification_status) && (
                  <span
                    className="d-annotation"
                    data-status={
                      intelligence.verification_status === 'smoke-green' ||
                      intelligence.verification_status === 'build-green'
                        ? 'success'
                        : intelligence.verification_status === 'smoke-red' ||
                            intelligence.verification_status === 'build-red'
                          ? 'warning'
                          : undefined
                    }
                  >
                    {formatVerificationLabel(intelligence.verification_status)}
                  </span>
                )}
                <span className="d-annotation">
                  {intelligence.golden_usage === 'shortlisted' ? 'shortlisted benchmark' : 'live benchmark'}
                </span>
                {intelligence.benchmark?.target && (
                  <span className="d-annotation">{intelligence.benchmark.target}</span>
                )}
              </div>
              <p style={{ margin: 0, color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                {intelligence.recommended
                  ? 'This item is currently one of the strongest Decantr benchmark-backed references for its workflow.'
                  : 'This item has benchmark evidence attached in the Decantr corpus, but it is not currently marked as a recommended reference.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: 'var(--d-text-muted)' }}>
                {intelligence.target_coverage.length > 0 && (
                  <span>Targets: {intelligence.target_coverage.join(', ')}</span>
                )}
                {intelligence.last_verified_at && (
                  <span>Last verified: {formatDate(intelligence.last_verified_at)}</span>
                )}
                {intelligence.evidence.length > 0 && (
                  <span>Evidence: {intelligence.evidence.join(', ')}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {showcaseMeta && (
          <div className="d-surface" data-elevation="raised" style={{ marginTop: '1.25rem' }}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="d-annotation" data-status={showcaseMeta.goldenCandidate ? 'success' : undefined}>
                  {showcaseMeta.goldenCandidate ? 'shortlisted showcase candidate' : 'live showcase available'}
                </span>
                <span className="d-annotation">classification {showcaseMeta.classification}</span>
                {showcaseMeta.target && (
                  <span className="d-annotation">{showcaseMeta.target}</span>
                )}
                {showcaseVerification?.smoke.passed && (
                  <span className="d-annotation" data-status="success">
                    smoke verified
                  </span>
                )}
                {!showcaseVerification?.smoke.passed && showcaseVerification?.build.passed && (
                  <span className="d-annotation" data-status="success">
                    build verified
                  </span>
                )}
                {showcaseVerification && (
                  <span className="d-annotation">drift {showcaseVerification.drift.signal}</span>
                )}
              </div>
              <p style={{ margin: 0, color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                {showcaseMeta.notes || 'This blueprint has a live showcase build in the audited Decantr corpus.'}
              </p>
              {showcaseVerification && (
                <p style={{ margin: 0, color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                  Shortlist verification recorded a {showcaseVerification.build.passed ? 'passing' : 'failing'} build in {showcaseVerification.build.durationMs} ms and a {showcaseVerification.smoke.passed ? 'passing' : 'failing'} smoke check in {showcaseVerification.smoke.durationMs} ms, with {showcaseVerification.drift.inlineStyleCount} inline-style signals and {showcaseVerification.drift.hardcodedColorCount} hardcoded-color signals.
                </p>
              )}
            </div>
          </div>
        )}

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
