import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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

type ActionSpec = {
  label: string;
  command: string;
  hint: string;
  variant?: 'primary' | 'ghost';
};

type EvidenceSection = {
  title: string;
  items: string[];
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

function formatDuration(value?: number | null): string {
  if (value == null) return 'n/a';
  return `${value} ms`;
}

function prettifyName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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

function hasBenchmarkBackedIntelligence(intelligence: NonNullable<ContentRecord['intelligence']>) {
  return intelligence.source === 'benchmark' || intelligence.source === 'hybrid';
}

function getIntelligenceDescription(
  intelligence: NonNullable<ContentRecord['intelligence']>,
): string {
  switch (intelligence.source) {
    case 'benchmark':
      return intelligence.recommended
        ? 'This item is benchmark-backed and currently treated as one of the strongest Decantr references for this workflow.'
        : 'This item has benchmark evidence in the Decantr corpus, but it is not currently marked as a recommended reference.';
    case 'hybrid':
      return intelligence.recommended
        ? 'This item combines strong authored contract quality with live benchmark evidence for the same workflow.'
        : 'This item combines authored registry signals with benchmark evidence, but it is not currently marked as a recommended reference.';
    case 'authored':
    default:
      return intelligence.recommended
        ? 'This item is curated and recommended from authored completeness, structure, and strong registry intelligence signals.'
        : 'This item is authored and structured, but it is not currently one of the primary recommended references.';
  }
}

function getPrimarySignal(
  content: ContentRecord,
  showcaseAvailable: boolean,
): { label: string; status?: 'success' | 'warning' | 'info' } | null {
  if (content.status && content.status !== 'published') {
    return { label: content.status, status: 'warning' };
  }
  if (content.intelligence?.recommended) {
    return { label: 'recommended', status: 'success' };
  }
  if (showcaseAvailable) {
    return { label: 'live showcase', status: 'info' };
  }
  const verification = formatVerificationLabel(content.intelligence?.verification_status);
  if (verification) {
    return {
      label: verification,
      status:
        content.intelligence?.verification_status === 'smoke-green' ||
        content.intelligence?.verification_status === 'build-green'
          ? 'success'
          : 'warning',
    };
  }
  return null;
}

function getQuickStartContent(
  singular: string,
  namespace: string,
  slug: string,
): {
  eyebrow: string;
  title: string;
  description: string;
  actions: ActionSpec[];
} {
  const official = namespace === '@official';
  const apiUrl = `https://api.decantr.ai/v1/${singular}s/${encodeURIComponent(namespace)}/${slug}`;

  if (!official) {
    return {
      eyebrow: 'Registry reference',
      title: 'Inspect the hosted contract',
      description:
        'This item is not from the official namespace, so the safest next step is to inspect its hosted contract or copy its JSON locally.',
      actions: [
        {
          label: 'Copy API URL',
          command: apiUrl,
          hint: 'Direct hosted contract endpoint',
          variant: 'primary',
        },
      ],
    };
  }

  switch (singular) {
    case 'blueprint':
      return {
        eyebrow: 'Quick start',
        title: 'Start a fresh app from this blueprint',
        description:
          'Use the official blueprint to scaffold a Decantr app, then inspect the contract if you need to customize the result.',
        actions: [
          {
            label: 'Copy new-app command',
            command: `decantr new my-app --blueprint=${slug}`,
            hint: 'Fresh project scaffold',
            variant: 'primary',
          },
          {
            label: 'Copy init command',
            command: `decantr init --blueprint=${slug} --yes`,
            hint: 'Existing project or non-interactive setup',
            variant: 'ghost',
          },
          {
            label: 'Copy inspect command',
            command: `decantr get blueprint ${slug}`,
            hint: 'Fetch the full blueprint contract',
            variant: 'ghost',
          },
        ],
      };
    case 'archetype':
      return {
        eyebrow: 'Composition',
        title: 'Compose this archetype into a project',
        description:
          'Archetypes are section-level building blocks. Add one into an existing Decantr app or inspect the authored contract first.',
        actions: [
          {
            label: 'Copy add-section command',
            command: `decantr add section ${slug}`,
            hint: 'Compose this section into an existing app',
            variant: 'primary',
          },
          {
            label: 'Copy inspect command',
            command: `decantr get archetype ${slug}`,
            hint: 'Fetch the full archetype contract',
            variant: 'ghost',
          },
        ],
      };
    case 'theme':
      return {
        eyebrow: 'Theme workflow',
        title: 'Apply or inspect this theme',
        description:
          'Themes define tokens, treatments, and decorators. Switch to it inside a Decantr project or inspect the authored theme contract.',
        actions: [
          {
            label: 'Copy theme-switch command',
            command: `decantr theme switch ${slug}`,
            hint: 'Apply this theme to a Decantr project',
            variant: 'primary',
          },
          {
            label: 'Copy inspect command',
            command: `decantr get theme ${slug}`,
            hint: 'Fetch the full theme contract',
            variant: 'ghost',
          },
        ],
      };
    case 'pattern':
    case 'shell':
    default:
      return {
        eyebrow: 'Contract access',
        title: `Inspect this ${singular} contract`,
        description:
          'Use the official contract as a reference inside your workflow or copy the hosted endpoint if you want to inspect the raw payload directly.',
        actions: [
          {
            label: `Copy decantr get ${singular}`,
            command: `decantr get ${singular} ${slug}`,
            hint: `Fetch the official ${singular} contract in the CLI`,
            variant: 'primary',
          },
          {
            label: 'Copy API URL',
            command: apiUrl,
            hint: 'Direct hosted contract endpoint',
            variant: 'ghost',
          },
        ],
      };
  }
}

function getUsageBullets(
  singular: string,
  tags: string[],
): string[] {
  const tagSummary = tags.slice(0, 3).join(', ');

  switch (singular) {
    case 'blueprint':
      return [
        `Use this when you need a full Decantr starting point${tagSummary ? ` around ${tagSummary}` : ''}.`,
        'Compare the authored contract with the live showcase before adopting it as a benchmark.',
        'Treat the JSON payload as the canonical source of truth once you scaffold from it.',
      ];
    case 'theme':
      return [
        'Use this to inspect tokens, decorators, and treatment intent before changing project styling.',
        'Switch to the theme in a Decantr app when you want the full token/treatment bundle, not just isolated colors.',
        'Compare the JSON contract against the visual runtime if you are debugging theme drift.',
      ];
    case 'archetype':
      return [
        'Use this to compose a section-level workflow into an existing Decantr app.',
        'Inspect the page topology and shell usage before adding it to your product surface.',
        'Treat the archetype contract as composition guidance, not a complete application on its own.',
      ];
    case 'shell':
      return [
        'Use this to study the frame regions and spacing rhythm for a route family.',
        'Reach for the shell contract when your page layout drifts from the intended top-level structure.',
        'Compare the shell implementation against page spacing before patching child components.',
      ];
    case 'pattern':
    default:
      return [
        `Use this as a high-signal reference for ${tagSummary || 'the interaction and layout it describes'}.`,
        'Inspect the contract before rebuilding the same component by hand.',
        'Keep the pattern structure and responsive behavior intact when translating it into runtime code.',
      ];
  }
}

function getShowcaseDescription(showcaseMeta: NonNullable<Awaited<ReturnType<typeof getShowcaseMetadata>>>) {
  return showcaseMeta.notes || 'This blueprint has a live showcase build in the audited Decantr corpus.';
}

interface DetailPageProps {
  params: Promise<{ type: string; namespace: string; slug: string }>;
}

export default async function ContentDetailPage({ params }: DetailPageProps) {
  const { type, namespace: rawNamespace, slug } = await params;
  const namespace = decodeURIComponent(rawNamespace);
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let content: ContentRecord | null = null;

  try {
    content = await getContent(type, namespace, slug, {
      token: session?.access_token ?? undefined,
    });
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
  const description = content.data?.description as string | undefined;
  const tags = (content.data?.tags as string[] | undefined) ?? [];
  const limitedTags = tags.slice(0, 5);
  const intelligence = content.intelligence ?? null;
  const recommendationReasons = intelligence?.recommendation_reasons ?? [];
  const recommendationBlockers = intelligence?.recommendation_blockers ?? [];
  const benchmarkBackedIntelligence = intelligence ? hasBenchmarkBackedIntelligence(intelligence) : false;
  const showcaseMeta = singular === 'blueprint' ? await getShowcaseMetadata(slug) : null;
  const showcaseVerification = showcaseMeta?.verification ?? null;
  const showcaseUrl = showcaseMeta?.url ? getShowcaseUrl(slug, showcaseMeta) : null;
  const primarySignal = getPrimarySignal(content, Boolean(showcaseUrl));
  const quickStart = getQuickStartContent(singular, namespace, slug);
  const usageBullets = getUsageBullets(singular, tags);
  const artifactCommands: ActionSpec[] = [
    ...quickStart.actions,
    ...(showcaseUrl
      ? [
          {
            label: 'Open showcase URL',
            command: showcaseUrl,
            hint: 'Live showcase destination',
            variant: 'ghost' as const,
          },
        ]
      : []),
  ];
  const artifactEvidence: EvidenceSection[] = [
    ...(intelligence
      ? [
          {
            title: 'Registry intelligence',
            items: [
              getIntelligenceDescription(intelligence),
              ...(intelligence.target_coverage.length > 0
                ? [`Targets: ${intelligence.target_coverage.join(', ')}`]
                : []),
              ...(intelligence.last_verified_at
                ? [`Last verified: ${formatDate(intelligence.last_verified_at)}`]
                : []),
              ...(recommendationReasons.length > 0
                ? [`Recommended because: ${recommendationReasons.join(', ')}`]
                : []),
              ...(!intelligence.recommended && recommendationBlockers.length > 0
                ? [`Holding back: ${recommendationBlockers.join(', ')}`]
                : []),
              ...(intelligence.evidence.length > 0
                ? [`Evidence: ${intelligence.evidence.join(', ')}`]
                : []),
            ],
          },
        ]
      : []),
    ...(showcaseMeta
      ? [
          {
            title: 'Showcase verification',
            items: [
              getShowcaseDescription(showcaseMeta),
              ...(showcaseVerification
                ? [
                    `Build: ${showcaseVerification.build.passed ? 'passing' : 'failing'} in ${formatDuration(showcaseVerification.build.durationMs)}`,
                    `Smoke: ${showcaseVerification.smoke.passed ? 'passing' : 'failing'} in ${formatDuration(showcaseVerification.smoke.durationMs)}`,
                    `Routes: ${showcaseVerification.smoke.routeDocumentsPassed}/${showcaseVerification.smoke.routeDocumentsChecked} route documents passed`,
                    `Hints matched: ${showcaseVerification.smoke.routeHintsMatched}/${showcaseVerification.smoke.routeHintsChecked.length}`,
                    `Drift signal: ${showcaseVerification.drift.signal}`,
                  ]
                : []),
            ],
          },
        ]
      : []),
  ];

  return (
    <main className={`${styles.pageCanvas} ${typeStyles.canvas}`}>
      <div className={styles.pageShellBreakpoint}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/" className={`no-underline transition-colors hover:text-d-primary ${styles.mutedLink}`}>
            Registry
          </Link>
          <span className="opacity-40">/</span>
          <Link href={`/browse/${type}`} className={`no-underline transition-colors hover:text-d-primary capitalize ${styles.mutedLink}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Link>
          <span className="opacity-40">/</span>
          <Link href={`/browse?namespace=${encodeURIComponent(namespace)}`} className={`no-underline transition-colors hover:text-d-primary ${styles.mutedLink}`}>
            {namespace}
          </Link>
          <span className="opacity-40">/</span>
          <span className={styles.currentCrumb}>{slug}</span>
        </nav>

        <section className={`d-surface ${styles.heroSurface}`} data-elevation="raised" aria-labelledby="registry-detail-title">
          <div className={styles.heroGrid}>
            <div className={styles.heroMain}>
              <div className={styles.badgeRow}>
                <span className={`d-annotation ${styles.typeBadge} ${typeStyles.badge}`}>
                  {singular}
                </span>
                <span className="d-annotation">{namespace}</span>
                {primarySignal ? (
                  <span className="d-annotation" data-status={primarySignal.status}>
                    {primarySignal.label}
                  </span>
                ) : null}
              </div>

              <div className={styles.titleRow}>
                <h1 id="registry-detail-title" className={styles.heroTitle}>
                  {name}
                </h1>
                <span className={styles.versionPill}>v{content.version}</span>
              </div>

              {description ? (
                <p className={styles.description}>{description}</p>
              ) : null}

              <div className={styles.metaRow}>
                {content.owner_username ? (
                  <span className={styles.metaItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.metaIcon}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <Link href={`/profile/${content.owner_username}`} className={`no-underline hover:text-d-primary ${styles.mutedLink}`}>
                      {content.owner_name || content.owner_username}
                    </Link>
                  </span>
                ) : null}
                {content.published_at ? (
                  <span className={styles.metaItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.metaIcon}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(content.published_at)}
                  </span>
                ) : null}
              </div>

              {limitedTags.length > 0 ? (
                <div className={styles.capabilityStrip}>
                  {limitedTags.map((tag) => (
                    <span key={tag} className="d-annotation">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <aside className={styles.quickStartPanel} aria-label="Quick start">
              <span className={styles.panelEyebrow}>{quickStart.eyebrow}</span>
              <h2 className={styles.panelTitle}>{quickStart.title}</h2>
              <p className={styles.panelDescription}>{quickStart.description}</p>
              <div className={styles.actionStack}>
                {quickStart.actions.map((action) => (
                  <CopyInstallButton
                    key={action.label}
                    installCmd={action.command}
                    label={action.label}
                    commandText={action.command}
                    hint={action.hint}
                    variant={action.variant}
                  />
                ))}
                {showcaseUrl ? (
                  <a
                    href={showcaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`d-interactive ${styles.actionLink}`}
                    data-variant="ghost"
                  >
                    Open showcase
                  </a>
                ) : null}
              </div>
            </aside>
          </div>
        </section>

        <div className={styles.summaryGrid}>
          <section className={`d-surface ${styles.summaryCard}`} data-elevation="raised" aria-label="Usage guidance">
            <h2 className={styles.summaryTitle}>What to do next</h2>
            <p className={styles.supportingCopy}>
              Use the official command rail first, then inspect the raw contract when you need implementation detail or drift debugging.
            </p>
            <ul className={styles.infoList}>
              {usageBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {intelligence ? (
            <section className={`d-surface ${styles.summaryCard}`} data-elevation="raised" aria-label="Registry intelligence">
              <h2 className={styles.summaryTitle}>Registry intelligence</h2>
              <div className={styles.factRow}>
                {intelligence.recommended ? (
                  <span className="d-annotation" data-status="success">recommended</span>
                ) : null}
                {formatVerificationLabel(intelligence.verification_status) ? (
                  <span className="d-annotation">
                    {formatVerificationLabel(intelligence.verification_status)}
                  </span>
                ) : null}
                <span className="d-annotation">quality {intelligence.quality_score ?? 'n/a'}</span>
                <span className="d-annotation">confidence {intelligence.confidence_score ?? 'n/a'}</span>
              </div>
              <p className={styles.supportingCopy}>{getIntelligenceDescription(intelligence)}</p>
              <details className={styles.detailsBlock}>
                <summary className={styles.detailsSummary}>Why this is trusted</summary>
                <div className={styles.detailsContent}>
                  {intelligence.target_coverage.length > 0 ? (
                    <div>Targets: {intelligence.target_coverage.join(', ')}</div>
                  ) : null}
                  {intelligence.last_verified_at ? (
                    <div>Last verified: {formatDate(intelligence.last_verified_at)}</div>
                  ) : null}
                  {recommendationReasons.length > 0 ? (
                    <div>Recommended because: {recommendationReasons.join(', ')}</div>
                  ) : null}
                  {!intelligence.recommended && recommendationBlockers.length > 0 ? (
                    <div>Holding back: {recommendationBlockers.join(', ')}</div>
                  ) : null}
                  {intelligence.evidence.length > 0 ? (
                    <div>Evidence: {intelligence.evidence.join(', ')}</div>
                  ) : null}
                  {benchmarkBackedIntelligence && intelligence.benchmark?.target ? (
                    <div>Benchmark target: {intelligence.benchmark.target}</div>
                  ) : null}
                </div>
              </details>
            </section>
          ) : null}

          {showcaseMeta ? (
            <section className={`d-surface ${styles.summaryCard}`} data-elevation="raised" aria-label="Showcase verification">
              <h2 className={styles.summaryTitle}>Showcase verification</h2>
              <div className={styles.factRow}>
                <span className="d-annotation" data-status={showcaseMeta.goldenCandidate ? 'success' : 'info'}>
                  {showcaseMeta.goldenCandidate ? 'shortlisted showcase' : 'live showcase'}
                </span>
                <span className="d-annotation">classification {showcaseMeta.classification}</span>
                {showcaseMeta.target ? <span className="d-annotation">{showcaseMeta.target}</span> : null}
                {showcaseVerification ? (
                  <span className="d-annotation">drift {showcaseVerification.drift.signal}</span>
                ) : null}
              </div>
              <p className={styles.supportingCopy}>{getShowcaseDescription(showcaseMeta)}</p>
              {showcaseVerification ? (
                <details className={styles.detailsBlock}>
                  <summary className={styles.detailsSummary}>Technical verification summary</summary>
                  <div className={styles.detailsContent}>
                    <div>Build: {showcaseVerification.build.passed ? 'passing' : 'failing'} in {formatDuration(showcaseVerification.build.durationMs)}</div>
                    <div>Smoke: {showcaseVerification.smoke.passed ? 'passing' : 'failing'} in {formatDuration(showcaseVerification.smoke.durationMs)}</div>
                    <div>Routes: {showcaseVerification.smoke.routeDocumentsPassed}/{showcaseVerification.smoke.routeDocumentsChecked} documents passed</div>
                    <div>Hints matched: {showcaseVerification.smoke.routeHintsMatched}/{showcaseVerification.smoke.routeHintsChecked.length}</div>
                    <div>Assets: {showcaseVerification.smoke.assetCount} files, {showcaseVerification.smoke.totalAssetBytes} total bytes</div>
                  </div>
                </details>
              ) : null}
            </section>
          ) : null}
        </div>

        {content.data ? (
          <div className={styles.jsonSection}>
            <JsonViewer
              data={content.data}
              title={`${namespace}/${slug} — contract JSON`}
              commands={artifactCommands}
              evidence={artifactEvidence}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
