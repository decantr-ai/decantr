import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getContent } from '@/lib/api';
import type { ContentRecord } from '@/lib/api';
import { JsonViewer } from '@/components/json-viewer';
import { getShowcaseMetadata, getShowcaseUrl } from '@/lib/showcase';
import { CopyInstallButton } from './copy-install-button';
import { getDisplaySourceLine } from '@/lib/content-presentation';
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

type BlueprintRoute = {
  path: string;
  page?: string;
  shell?: string;
  archetype?: string;
  section?: string;
};

type BlueprintRouteGroup = {
  id: string;
  routes: BlueprintRoute[];
};

type BlueprintLaunchpadModel = {
  compose: string[];
  features: string[];
  routeGroups: BlueprintRouteGroup[];
  routes: BlueprintRoute[];
  shells: string[];
  suggestedThemes: string[];
  theme: {
    id: string;
    mode?: string;
    shape?: string;
  } | null;
  voiceTone: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function getBlueprintCompose(data: Record<string, unknown>): string[] {
  const compose = data.compose;
  if (!Array.isArray(compose)) return [];

  return compose
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      if (isRecord(entry) && typeof entry.archetype === 'string') return entry.archetype;
      return null;
    })
    .filter((entry): entry is string => Boolean(entry));
}

function getBlueprintRoutes(data: Record<string, unknown>): BlueprintRoute[] {
  const rawRoutes = data.routes;
  if (!isRecord(rawRoutes)) return [];

  return Object.entries(rawRoutes).map(([path, value]) => {
    const route = isRecord(value) ? value : {};
    return {
      path,
      page: typeof route.page === 'string' ? route.page : undefined,
      shell: typeof route.shell === 'string' ? route.shell : undefined,
      archetype: typeof route.archetype === 'string' ? route.archetype : undefined,
      section: typeof route.section === 'string' ? route.section : undefined,
    };
  });
}

function getBlueprintTheme(data: Record<string, unknown>): BlueprintLaunchpadModel['theme'] {
  if (!isRecord(data.theme)) return null;

  return {
    id: typeof data.theme.id === 'string' ? data.theme.id : 'custom theme',
    mode: typeof data.theme.mode === 'string' ? data.theme.mode : undefined,
    shape: typeof data.theme.shape === 'string' ? data.theme.shape : undefined,
  };
}

function buildRouteGroups(routes: BlueprintRoute[]): BlueprintRouteGroup[] {
  const groups = new Map<string, BlueprintRoute[]>();

  for (const route of routes) {
    const key = route.archetype || route.section || route.shell || 'routes';
    groups.set(key, [...(groups.get(key) ?? []), route]);
  }

  return Array.from(groups.entries()).map(([id, groupRoutes]) => ({
    id,
    routes: groupRoutes,
  }));
}

function getBlueprintLaunchpadModel(data: Record<string, unknown>): BlueprintLaunchpadModel {
  const routes = getBlueprintRoutes(data);
  const shells = [...new Set(routes.map((route) => route.shell).filter((shell): shell is string => Boolean(shell)))];
  const voice = isRecord(data.voice) ? data.voice : null;

  return {
    compose: getBlueprintCompose(data),
    features: getStringArray(data.features),
    routeGroups: buildRouteGroups(routes),
    routes,
    shells,
    suggestedThemes: getStringArray(data.suggested_themes),
    theme: getBlueprintTheme(data),
    voiceTone: voice && typeof voice.tone === 'string' ? voice.tone : null,
  };
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

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

function getShowcaseEmbedUrl(showcaseUrl: string) {
  return showcaseUrl.includes('?') ? `${showcaseUrl}&embed=1` : `${showcaseUrl}?embed=1`;
}

function getThemeLabel(theme: BlueprintLaunchpadModel['theme']): string {
  if (!theme) return 'Custom theme';
  return [theme.id, theme.mode, theme.shape].filter(Boolean).join(' / ');
}

function LaunchMetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: 'pink' | 'amber' | 'cyan' | 'green';
}) {
  return (
    <div className={styles.launchMetricCard} data-tone={tone}>
      <span className={styles.launchMetricLabel}>{label}</span>
      <strong className={styles.launchMetricValue}>{value}</strong>
      <span className={styles.launchMetricDetail}>{detail}</span>
    </div>
  );
}

function BlueprintPreview({
  model,
  showcaseUrl,
  screenshotUrl,
  name,
}: {
  model: BlueprintLaunchpadModel;
  showcaseUrl: string | null;
  screenshotUrl?: string | null;
  name: string;
}) {
  const previewGroups = model.routeGroups.slice(0, 4);

  return (
    <div className={styles.launchPreview} aria-label="Blueprint composition preview">
      <div className={styles.previewHeader}>
        <span>Contract topology</span>
        <strong>{model.theme?.id ?? 'blueprint contract'}</strong>
      </div>
      <div className={styles.previewStage}>
        <div className={styles.previewMedia} data-empty={!screenshotUrl}>
          {screenshotUrl ? (
            <img src={screenshotUrl} alt={`${name} screenshot preview`} loading="lazy" />
          ) : showcaseUrl ? (
            <iframe
              src={getShowcaseEmbedUrl(showcaseUrl)}
              title={`${name} live showcase preview`}
              loading="lazy"
            />
          ) : (
            <div className={styles.previewMediaPlaceholder}>
              <span>Screenshot pending</span>
              <strong>{name}</strong>
            </div>
          )}
        </div>

        <div className={styles.previewBody}>
          <div className={styles.previewRail}>
            {(model.compose.length > 0 ? model.compose : ['registry-browser']).slice(0, 4).map((section) => (
              <span key={section}>{section}</span>
            ))}
          </div>
          <div className={styles.previewCanvas}>
            {previewGroups.length > 0 ? (
              previewGroups.map((group, index) => (
                <div key={group.id} className={styles.previewRouteCluster} data-index={index}>
                  <div className={styles.previewRouteHeader}>
                    <span>{group.id}</span>
                    <strong>{group.routes.length}</strong>
                  </div>
                  <div className={styles.previewRouteLines}>
                    {group.routes.slice(0, 3).map((route) => (
                      <span key={route.path}>{route.path}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.previewEmpty}>Route map appears after the contract declares routes.</div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.previewFooter}>
        <span>{formatCompactNumber(model.routes.length)} routes mapped</span>
        {showcaseUrl ? (
          <a href={showcaseUrl} target="_blank" rel="noopener noreferrer" className={styles.previewShowcaseLink}>
            Open live preview
          </a>
        ) : null}
      </div>
    </div>
  );
}

function BlueprintAnatomy({ model }: { model: BlueprintLaunchpadModel }) {
  if (model.routeGroups.length === 0) return null;

  return (
    <section className={styles.launchSection} aria-labelledby="blueprint-anatomy-title">
      <div className={styles.launchSectionHeader}>
        <span className={styles.launchEyebrow}>Blueprint anatomy</span>
        <h2 id="blueprint-anatomy-title" className={styles.launchSectionTitle}>
          The app structure before you scaffold
        </h2>
        <p className={styles.launchSectionCopy}>
          Decantr packages the product topology into sections, shells, pages, and route intent so the scaffold starts with a coherent application shape.
        </p>
      </div>

      <div className={styles.anatomyGrid}>
        {model.routeGroups.map((group) => (
          <article key={group.id} className={styles.anatomyCard}>
            <div className={styles.anatomyCardHeader}>
              <h3>{group.id}</h3>
              <span>{group.routes.length} routes</span>
            </div>
            <div className={styles.anatomyRouteList}>
              {group.routes.slice(0, 5).map((route) => (
                <div key={route.path} className={styles.anatomyRoute}>
                  <code>{route.path}</code>
                  <span>{route.page ?? route.shell ?? 'page'}</span>
                </div>
              ))}
              {group.routes.length > 5 ? (
                <span className={styles.anatomyMore}>+{group.routes.length - 5} more routes</span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RegistryEvidenceDisclosure({ evidence }: { evidence: EvidenceSection[] }) {
  if (evidence.length === 0) return null;

  return (
    <section className={styles.evidenceSection} aria-label="Registry evidence">
      <details className={styles.evidenceDisclosure}>
        <summary className={styles.evidenceSummary}>
          <span>
            Registry evidence
            <small>Publisher and verification details</small>
          </span>
        </summary>
        <div className={styles.evidenceGrid}>
          {evidence.map((section) => (
            <article key={section.title} className={styles.evidenceCard}>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}

interface DetailPageProps {
  params: Promise<{ type: string; namespace: string; slug: string }>;
}

export default async function ContentDetailPage({ params }: DetailPageProps) {
  const { type, namespace: rawNamespace, slug } = await params;
  const namespace = decodeURIComponent(rawNamespace);
  let session:
    | {
        access_token?: string | null;
      }
    | null = null;

  try {
    const supabase = await createClient();
    const result = await supabase.auth.getSession();
    session = result.data.session;
  } catch {
    // Public detail pages should still render without Supabase envs or auth context.
    session = null;
  }

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
  const showcaseUrl = showcaseMeta ? getShowcaseUrl(slug, showcaseMeta) : null;
  const previewImageUrl = showcaseMeta?.thumbnail?.src ?? content.thumbnail_url ?? null;
  const primarySignal = getPrimarySignal(content, Boolean(showcaseUrl));
  const quickStart = getQuickStartContent(singular, namespace, slug);
  const usageBullets = getUsageBullets(singular, tags);
  const displaySourceLine = getDisplaySourceLine(content);
  const contentData = isRecord(content.data) ? content.data : {};
  const blueprintModel = singular === 'blueprint' ? getBlueprintLaunchpadModel(contentData) : null;
  const artifactDefaultTab = blueprintModel || intelligence || showcaseMeta ? 'overview' : 'json';
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
          <Link
            href={`/browse/${type}`}
            className={`no-underline transition-colors hover:text-d-primary capitalize ${styles.mutedLink}`}
            aria-label={`Browse ${type}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Link>
          <span className="opacity-40">/</span>
          <Link
            href={`/browse?namespace=${encodeURIComponent(namespace)}`}
            className={`no-underline transition-colors hover:text-d-primary ${styles.mutedLink}`}
            aria-label={`Browse ${namespace}`}
          >
            {namespace}
          </Link>
          <span className="opacity-40">/</span>
          <span className={styles.currentCrumb}>{slug}</span>
        </nav>

        {blueprintModel ? (
          <>
            <section className={styles.launchHero} aria-labelledby="registry-detail-title">
              <div className={styles.launchHeroCopy}>
                <div className={styles.launchTitleBlock}>
                  <span className={styles.launchKicker}>
                    {namespace === '@official' ? 'Official blueprint' : `${namespace} blueprint`}
                  </span>
                  <h1 id="registry-detail-title" className={styles.launchTitle}>
                    {name}
                  </h1>
                  {description ? <p className={styles.launchDescription}>{description}</p> : null}
                </div>

                <div className={styles.launchMetaRow}>
                  <span>{displaySourceLine}</span>
                  <span>v{content.version}</span>
                  {content.published_at ? <span>{formatDate(content.published_at)}</span> : null}
                </div>

                <div className={styles.launchMetrics}>
                  <LaunchMetricCard
                    label="Sections"
                    value={formatCompactNumber(blueprintModel.compose.length || blueprintModel.routeGroups.length)}
                    detail="product zones"
                    tone="pink"
                  />
                  <LaunchMetricCard
                    label="Routes"
                    value={formatCompactNumber(blueprintModel.routes.length)}
                    detail="pages mapped"
                    tone="cyan"
                  />
                  <LaunchMetricCard
                    label="Features"
                    value={formatCompactNumber(blueprintModel.features.length)}
                    detail="capabilities"
                    tone="amber"
                  />
                  <LaunchMetricCard
                    label="Showcase"
                    value={showcaseMeta?.goldenCandidate ? 'Benchmark' : showcaseMeta ? 'Live' : 'Pending'}
                    detail={showcaseVerification?.smoke.passed ? 'smoke verified' : 'preview status'}
                    tone="green"
                  />
                </div>
              </div>

              <div className={styles.launchHeroAside}>
                <aside id="launch-commands" className={styles.launchCommandRail} aria-label="Launch commands">
                  <span className={styles.launchEyebrow}>{quickStart.eyebrow}</span>
                  <h2>{quickStart.title}</h2>
                  <p>{quickStart.description}</p>
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
                        rel="noopener noreferrer"
                        className={`d-interactive ${styles.actionLink}`}
                        data-variant="showcase"
                      >
                        <span className={styles.actionLinkIcon} aria-hidden="true">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M7 17 17 7" />
                            <path d="M9 7h8v8" />
                            <path d="M5 5h6" />
                            <path d="M5 5v14h14v-6" />
                          </svg>
                        </span>
                        <span className={styles.actionLinkCopy}>
                          <strong>Open live showcase</strong>
                          <span>Preview the generated app</span>
                        </span>
                      </a>
                    ) : null}
                  </div>
                </aside>
              </div>
            </section>

            <section className={styles.launchSection} aria-labelledby="blueprint-preview-title">
              <div className={styles.launchSectionHeader}>
                <span className={styles.launchEyebrow}>Preview</span>
                <h2 id="blueprint-preview-title" className={styles.launchSectionTitle}>
                  See the product shape before you scaffold
                </h2>
                <p className={styles.launchSectionCopy}>
                  The launch map turns route, shell, and archetype data into a quick read of the application you are about to generate.
                </p>
              </div>
              <BlueprintPreview
                model={blueprintModel}
                showcaseUrl={showcaseUrl}
                screenshotUrl={previewImageUrl}
                name={name}
              />
            </section>

            <section className={styles.launchSection} aria-labelledby="what-ships-title">
              <div className={styles.launchSectionHeader}>
                <span className={styles.launchEyebrow}>What ships</span>
                <h2 id="what-ships-title" className={styles.launchSectionTitle}>
                  A complete starting point, not a loose component bundle
                </h2>
                <p className={styles.launchSectionCopy}>
                  This blueprint carries application topology, shell choices, theme intent, route mapping, and feature coverage into the scaffold.
                </p>
              </div>

              <div className={styles.shipGrid}>
                <article className={styles.shipCard}>
                  <span>Theme system</span>
                  <strong>{getThemeLabel(blueprintModel.theme)}</strong>
                  <p>Tokens, treatments, decorators, and interaction states are pre-bound to the blueprint.</p>
                </article>
                <article className={styles.shipCard}>
                  <span>Shells</span>
                  <strong>{blueprintModel.shells.length ? blueprintModel.shells.join(', ') : 'Declared by sections'}</strong>
                  <p>Top-level layout contracts define the public, dashboard, admin, and gateway frames.</p>
                </article>
                <article className={styles.shipCard}>
                  <span>Suggested variants</span>
                  <strong>{blueprintModel.suggestedThemes.length ? blueprintModel.suggestedThemes.join(', ') : 'Theme-ready'}</strong>
                  <p>Useful when you want the same product topology with a different Decantr visual system.</p>
                </article>
              </div>

              {blueprintModel.features.length > 0 ? (
                <div className={styles.featureCloud} aria-label="Blueprint features">
                  {blueprintModel.features.map((feature) => (
                    <span key={feature}>{feature}</span>
                  ))}
                </div>
              ) : null}

              {blueprintModel.voiceTone ? (
                <p className={styles.voiceNote}>{blueprintModel.voiceTone}</p>
              ) : null}
            </section>

            <BlueprintAnatomy model={blueprintModel} />
          </>
        ) : (
          <>
            <section className={`d-surface ${styles.heroSurface}`} data-elevation="raised" aria-labelledby="registry-detail-title">
              <div className={styles.heroGrid}>
                <div className={styles.heroMain}>
                  <div className={styles.badgeRow}>
                    <span className={`d-annotation ${styles.typeBadge} ${typeStyles.badge}`}>
                      {singular}
                    </span>
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

                  {description ? <p className={styles.description}>{description}</p> : null}

                  <div className={styles.metaRow}>
                    <span className={styles.metaItem}>{displaySourceLine}</span>
                    {content.published_at ? <span className={styles.metaItem}>{formatDate(content.published_at)}</span> : null}
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
                  </div>
                </aside>
              </div>
            </section>

            <section className={styles.launchSection} aria-label="Usage guidance">
              <div className={styles.launchSectionHeader}>
                <span className={styles.launchEyebrow}>How to use this</span>
                <h2 className={styles.launchSectionTitle}>What to do next</h2>
              </div>
              <ul className={styles.infoList}>
                {usageBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </>
        )}

        {content.data ? (
          <section className={styles.contractSection} aria-labelledby="contract-explorer-title">
            <div className={styles.launchSectionHeader}>
              <span className={styles.launchEyebrow}>Contract explorer</span>
              <h2 id="contract-explorer-title" className={styles.launchSectionTitle}>
                Inspect the source of truth
              </h2>
              <p className={styles.launchSectionCopy}>
                The contract remains available when you need route detail, theme bindings, or raw JSON for automation.
              </p>
            </div>
            <JsonViewer
              data={content.data}
              title={`${namespace}/${slug} — contract`}
              defaultTab={artifactDefaultTab}
              commands={blueprintModel ? [] : artifactCommands}
              evidence={[]}
            />
          </section>
        ) : null}

        <RegistryEvidenceDisclosure evidence={artifactEvidence} />
      </div>
    </main>
  );
}
