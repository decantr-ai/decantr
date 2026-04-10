import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/api';
import type { ContentRecord } from '@/lib/api';
import { JsonViewer } from '@/components/json-viewer';
import { getShowcaseMetadata, getShowcaseUrl } from '@/lib/showcase';
import { CopyInstallButton } from './copy-install-button';
import styles from './page.module.css';

const TYPE_STYLES: Record<string, { canvas: string; badge: string }> = {
  pattern: { canvas: styles.canvasPattern, badge: styles.typeBadgePattern },
  theme: { canvas: styles.canvasTheme, badge: styles.typeBadgeTheme },
  blueprint: { canvas: styles.canvasBlueprint, badge: styles.typeBadgeBlueprint },
  shell: { canvas: styles.canvasShell, badge: styles.typeBadgeShell },
  archetype: { canvas: styles.canvasArchetype, badge: styles.typeBadgeArchetype },
  patterns: { canvas: styles.canvasPattern, badge: styles.typeBadgePattern },
  themes: { canvas: styles.canvasTheme, badge: styles.typeBadgeTheme },
  blueprints: { canvas: styles.canvasBlueprint, badge: styles.typeBadgeBlueprint },
  shells: { canvas: styles.canvasShell, badge: styles.typeBadgeShell },
  archetypes: { canvas: styles.canvasArchetype, badge: styles.typeBadgeArchetype },
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

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(2)} MB`;
  }
  return `${Math.round(bytes / 1_000)} KB`;
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

function hasBenchmarkBackedIntelligence(intelligence: NonNullable<ContentRecord['intelligence']>): boolean {
  return intelligence.source === 'benchmark' || intelligence.source === 'hybrid';
}

function getIntelligenceDescription(
  intelligence: NonNullable<ContentRecord['intelligence']>,
): string {
  switch (intelligence.source) {
    case 'benchmark':
      return intelligence.recommended
        ? 'This item is currently one of the strongest Decantr benchmark-backed references for its workflow.'
        : 'This item has benchmark evidence attached in the Decantr corpus, but it is not currently marked as a recommended reference.';
    case 'hybrid':
      return intelligence.recommended
        ? 'This item combines strong authored registry signals with live Decantr benchmark evidence for its workflow.'
        : 'This item combines authored registry signals with benchmark evidence in the Decantr corpus, but it is not currently marked as a recommended reference.';
    case 'authored':
    default:
      return intelligence.recommended
        ? 'This item is currently one of the strongest curated Decantr references based on authored completeness and registry intelligence signals.'
        : 'This item carries registry intelligence metadata based on authored completeness and structured evidence, but it is not currently a recommended reference.';
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
  const typeStyles = TYPE_STYLES[type] ?? TYPE_STYLES[singular] ?? TYPE_STYLES.blueprint;
  const name =
    (content.data?.name as string | undefined) ||
    prettifyName(slug);
  const description =
    content.data?.description as string | undefined;
  const installCmd = `decantr get ${singular} ${namespace}/${slug}`;
  const tags = (content.data?.tags as string[] | undefined) ?? [];
  const intelligence = content.intelligence ?? null;
  const recommendationReasons = intelligence?.recommendation_reasons ?? [];
  const recommendationBlockers = intelligence?.recommendation_blockers ?? [];
  const benchmarkBackedIntelligence = intelligence ? hasBenchmarkBackedIntelligence(intelligence) : false;
  const showcaseMeta = singular === 'blueprint' ? await getShowcaseMetadata(slug) : null;
  const showcaseVerification = showcaseMeta?.verification ?? null;

  return (
    <main className={`${styles.pageCanvas} ${typeStyles.canvas}`}>
      <div className={styles.pageShellBreakpoint}>
        {/* Breadcrumb */}
        <nav
          className={`flex items-center gap-1.5 text-xs ${styles.breadcrumbs}`}
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className={`no-underline transition-colors hover:text-d-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--d-primary)] ${styles.mutedLink}`}
          >
            Registry
          </Link>
          <span className="opacity-40">/</span>
          <Link
            href={`/browse/${type}`}
            className={`no-underline transition-colors hover:text-d-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--d-primary)] capitalize ${styles.mutedLink}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Link>
          <span className="opacity-40">/</span>
          <Link
            href={`/browse?namespace=${encodeURIComponent(namespace)}`}
            className={`no-underline transition-colors hover:text-d-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--d-primary)] ${styles.mutedLink}`}
          >
            {namespace}
          </Link>
          <span className="opacity-40">/</span>
          <span className={styles.currentCrumb}>{slug}</span>
        </nav>

        {/* Hero card */}
        <section className="d-surface" data-elevation="raised" aria-labelledby="registry-detail-title">
          <div className="flex flex-col gap-4">
            {/* Type + namespace badges */}
            <div className="flex items-center gap-2">
              <span className={`d-annotation ${styles.typeBadge} ${typeStyles.badge}`}>
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
              <h1 id="registry-detail-title" className={`font-bold ${styles.heroTitle}`}>
                {name}
              </h1>
              <span className={`text-sm ${styles.versionText}`}>
                v{content.version}
              </span>
            </div>

            {/* Description */}
            {description && (
              <p className={styles.description}>
                {description}
              </p>
            )}

            {/* Meta row */}
            <div className={styles.metaRow}>
              {content.owner_username && (
                <div className={styles.metaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.metaIcon}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <Link
                    href={`/profile/${content.owner_username}`}
                    className={`no-underline hover:text-d-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--d-primary)] ${styles.textDefault}`}
                  >
                    {content.owner_name || content.owner_username}
                  </Link>
                </div>
              )}
              {content.published_at && (
                <div className={styles.metaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.metaIcon}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className={styles.textMuted}>
                    {formatDate(content.published_at)}
                  </span>
                </div>
              )}
              {tags.length > 0 && (
                <div className={styles.metaWrap}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.metaIcon}>
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
                  className="d-interactive no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--d-primary)]"
                  data-variant="ghost"
                >
                  Open Showcase
                </Link>
              )}
            </div>
          </div>
        </section>

        {intelligence && (
          <section className={`d-surface ${styles.contentSectionSpacing}`} data-elevation="raised" aria-label="Registry intelligence summary">
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
                {benchmarkBackedIntelligence ? (
                  <span className="d-annotation">
                    {intelligence.benchmark_confidence} benchmark confidence
                  </span>
                ) : (
                  <span className="d-annotation">
                    authored intelligence
                  </span>
                )}
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
                {benchmarkBackedIntelligence && (
                  <span className="d-annotation">
                    {intelligence.golden_usage === 'shortlisted' ? 'shortlisted benchmark' : 'live benchmark'}
                  </span>
                )}
                {intelligence.benchmark?.target && (
                  <span className="d-annotation">{intelligence.benchmark.target}</span>
                )}
              </div>
              <p className={styles.supportingCopy}>
                {getIntelligenceDescription(intelligence)}
              </p>
              <div className={styles.metricsRowBreakpoint}>
                {intelligence.target_coverage.length > 0 && (
                  <span>Targets: {intelligence.target_coverage.join(', ')}</span>
                )}
                {intelligence.last_verified_at && (
                  <span>Last verified: {formatDate(intelligence.last_verified_at)}</span>
                )}
                {intelligence.evidence.length > 0 && (
                  <span>Evidence: {intelligence.evidence.join(', ')}</span>
                )}
                {recommendationReasons.length > 0 && (
                  <span>Recommended because: {recommendationReasons.join(', ')}</span>
                )}
                {!intelligence.recommended && recommendationBlockers.length > 0 && (
                  <span>Holding back: {recommendationBlockers.join(', ')}</span>
                )}
              </div>
            </div>
          </section>
        )}

        {showcaseMeta && (
          <section className={`d-surface ${styles.contentSectionSpacing}`} data-elevation="raised" aria-label="Showcase verification summary">
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
              <p className={styles.supportingCopy}>
                {showcaseMeta.notes || 'This blueprint has a live showcase build in the audited Decantr corpus.'}
              </p>
              {showcaseVerification && (
                <p className={styles.supportingCopy}>
                  Shortlist verification recorded a {showcaseVerification.build.passed ? 'passing' : 'failing'} build in {showcaseVerification.build.durationMs} ms and a {showcaseVerification.smoke.passed ? 'passing' : 'failing'} smoke check in {showcaseVerification.smoke.durationMs} ms, covering {showcaseVerification.smoke.routeDocumentsPassed}/{showcaseVerification.smoke.routeDocumentsChecked} audited route documents with {showcaseVerification.smoke.routeDocumentsHardenedCount}/{showcaseVerification.smoke.routeDocumentsChecked} hardened route shells preserved, plus {showcaseVerification.smoke.routeHintsMatched}/{showcaseVerification.smoke.routeHintsChecked.length} compiled route hints, with {showcaseVerification.smoke.fullRouteCoverageOk ? 'full route coverage preserved' : 'partial route coverage only'}. The current build ships {formatBytes(showcaseVerification.smoke.totalAssetBytes)} total assets ({formatBytes(showcaseVerification.smoke.jsAssetBytes)} JS, {formatBytes(showcaseVerification.smoke.cssAssetBytes)} CSS) with {showcaseVerification.smoke.langOk ? 'an explicit language hint' : 'no language hint'}, {showcaseVerification.smoke.viewportOk ? 'a viewport tag present' : 'no viewport tag'}, {showcaseVerification.smoke.charsetOk ? 'a charset declaration' : 'no charset declaration'}, and {showcaseVerification.smoke.cspSignalOk ? 'a CSP signal present' : 'no CSP signal'}, alongside {showcaseVerification.smoke.inlineScriptCount} inline script tag(s), {showcaseVerification.smoke.inlineEventHandlerCount} inline event handler(s), {showcaseVerification.smoke.externalScriptsWithoutIntegrityCount} external script(s) without integrity, {showcaseVerification.smoke.externalScriptsWithIntegrityMissingCrossoriginCount} external script(s) missing crossorigin despite integrity, {showcaseVerification.smoke.externalStylesheetsWithoutIntegrityCount} external stylesheet(s) without integrity, {showcaseVerification.smoke.externalStylesheetsWithIntegrityMissingCrossoriginCount} external stylesheet(s) missing crossorigin despite integrity, {showcaseVerification.smoke.externalScriptsWithInsecureTransportCount} external script(s) over insecure transport, {showcaseVerification.smoke.externalStylesheetsWithInsecureTransportCount} external stylesheet(s) over insecure transport, {showcaseVerification.smoke.externalMediaSourcesWithInsecureTransportCount} remote media source(s) over insecure transport, {showcaseVerification.drift.inlineStyleCount} inline-style signals, and {showcaseVerification.drift.hardcodedColorCount} hardcoded-color signals.
                </p>
              )}
            </div>
          </section>
        )}

        {/* JSON viewer */}
        {content.data && (
          <div className={styles.jsonSection}>
            <JsonViewer
              data={content.data}
              title={`${namespace}/${slug} — v${content.version}`}
            />
          </div>
        )}
      </div>
    </main>
  );
}
