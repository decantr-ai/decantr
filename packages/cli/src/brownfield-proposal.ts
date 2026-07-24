import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EssenceSection, EssenceV4 } from '@decantr/essence-spec';
import { isV4 } from '@decantr/essence-spec';
import type { AmbientContextInventory } from './ambient-context.js';
import type { ComponentsAnalysis } from './analyzers/components.js';
import type { DependenciesAnalysis } from './analyzers/dependencies.js';
import type { FeaturesAnalysis } from './analyzers/features.js';
import type { LayoutAnalysis } from './analyzers/layout.js';
import type { RoutesAnalysis } from './analyzers/routes.js';
import type { StylingAnalysis } from './analyzers/styling.js';
import type { DetectedProject } from './detect.js';
import type { DoctrineMap } from './doctrine-map.js';

export interface BrownfieldProposalInput {
  project: DetectedProject;
  routes: RoutesAnalysis;
  components: ComponentsAnalysis;
  styling: StylingAnalysis;
  layout: LayoutAnalysis;
  features: FeaturesAnalysis;
  dependencies: DependenciesAnalysis;
  ambient: AmbientContextInventory;
}

export interface BrownfieldProposal {
  version: 1;
  kind: 'brownfield-observed-essence';
  generatedAt: string;
  status: 'proposed';
  essence: EssenceV4;
  evidence: {
    routeCount: number;
    candidateRouteCount?: number;
    routeAuthority?: RoutesAnalysis['authority'];
    routeCompleteness?: RoutesAnalysis['completeness'];
    componentCount: number;
    featureCount: number;
    ambientContextCount: number;
    stylingApproach: string;
    shell: string;
    semanticSectionCount: number;
  };
  conflicts: string[];
  staleRisks: string[];
  acceptance: {
    create: string;
    merge: string;
    replace: string;
  };
}

function slugify(value: string, fallback: string): string {
  const slug = value
    .replace(/^\//, '')
    .replace(/:[^/]+/g, 'param')
    .replace(/\*/g, 'all')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  if (!slug) return fallback;
  return /^[a-z]/u.test(slug) ? slug : `route-${slug}`;
}

interface RouteDomain {
  sectionId: string;
  role: EssenceSection['role'];
  label: string;
  description: string;
  featureHints: string[];
  priority: number;
}

const ROUTE_DOMAINS: RouteDomain[] = [
  {
    sectionId: 'observed-auth',
    role: 'gateway',
    label: 'Authentication',
    description: 'Observed authentication, sign-in, sign-up, callback, and account-entry surfaces.',
    featureHints: ['auth'],
    priority: 10,
  },
  {
    sectionId: 'observed-rbac',
    role: 'auxiliary',
    label: 'RBAC and User Administration',
    description:
      'Observed role, permission, user-management, and access-control administration surfaces.',
    featureHints: ['admin', 'team', 'settings', 'auth'],
    priority: 30,
  },
  {
    sectionId: 'observed-billing',
    role: 'auxiliary',
    label: 'Billing',
    description: 'Observed billing, subscription, plan, payment, invoice, and checkout surfaces.',
    featureHints: ['billing', 'admin'],
    priority: 34,
  },
  {
    sectionId: 'observed-admin',
    role: 'auxiliary',
    label: 'Administration',
    description: 'Observed administrative and operational management surfaces.',
    featureHints: ['admin', 'team'],
    priority: 36,
  },
  {
    sectionId: 'observed-settings',
    role: 'auxiliary',
    label: 'Settings',
    description:
      'Observed account, profile, client-settings, organization, and user-preference surfaces.',
    featureHints: ['settings', 'profile', 'team'],
    priority: 38,
  },
  {
    sectionId: 'observed-api-access',
    role: 'auxiliary',
    label: 'API Access',
    description: 'Observed developer, API key, token, and credential-management surfaces.',
    featureHints: ['api-keys', 'admin'],
    priority: 40,
  },
  {
    sectionId: 'observed-reporting',
    role: 'primary',
    label: 'Reporting',
    description: 'Observed reporting, analytics, metrics, dashboard, and compliance surfaces.',
    featureHints: ['dashboard', 'admin'],
    priority: 58,
  },
  {
    sectionId: 'observed-facilities',
    role: 'primary',
    label: 'Facilities',
    description: 'Observed facility, location, bin, lifecycle, and operational surfaces.',
    featureHints: ['file-upload', 'dashboard'],
    priority: 60,
  },
  {
    sectionId: 'observed-lab-results',
    role: 'primary',
    label: 'Lab Results',
    description: 'Observed lab result, report detail, compliance, and evidence-review surfaces.',
    featureHints: ['dashboard', 'file-upload'],
    priority: 62,
  },
  {
    sectionId: 'observed-ai-insights',
    role: 'primary',
    label: 'AI Insights',
    description:
      'Observed AI insight, assistant, intelligence, recommendation, and automation surfaces.',
    featureHints: ['dashboard', 'chat'],
    priority: 64,
  },
  {
    sectionId: 'observed-communications',
    role: 'primary',
    label: 'Communications',
    description: 'Observed chat, message, inbox, notification, and announcement surfaces.',
    featureHints: ['chat', 'notifications'],
    priority: 66,
  },
  {
    sectionId: 'observed-brand-portal',
    role: 'primary',
    label: 'Brand Portal',
    description: 'Observed brand, asset, media, gallery, and upload surfaces.',
    featureHints: ['file-upload', 'content'],
    priority: 68,
  },
  {
    sectionId: 'observed-content',
    role: 'primary',
    label: 'Content',
    description: 'Observed CMS, editor, article, post, catalog, and content-management surfaces.',
    featureHints: ['content', 'search'],
    priority: 70,
  },
  {
    sectionId: 'observed-dashboard',
    role: 'primary',
    label: 'Dashboard',
    description: 'Observed dashboard, overview, workspace, and primary application surfaces.',
    featureHints: ['dashboard', 'search'],
    priority: 72,
  },
  {
    sectionId: 'observed-public',
    role: 'public',
    label: 'Public',
    description: 'Observed public-facing, marketing, docs, blog, legal, contact, and home routes.',
    featureHints: ['content', 'search'],
    priority: 0,
  },
  {
    sectionId: 'observed-primary',
    role: 'primary',
    label: 'Primary Application',
    description: 'Observed primary application routes from the existing application.',
    featureHints: [],
    priority: 90,
  },
];

function routeDomain(path: string): RouteDomain {
  const lower = path.toLowerCase();
  if (
    /\/(login|signin|sign-in|signup|sign-up|register|auth|callback|reset-password|forgot-password)/.test(
      lower,
    )
  ) {
    return ROUTE_DOMAINS[0];
  }
  if (
    /\/(rbac|roles?|permissions?|manage-rbac|manage-users|user-management|access-control)\b/.test(
      lower,
    )
  ) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-rbac')!;
  }
  if (
    /\/(billing|subscription|subscriptions|pricing|plans|checkout|payment|payments|stripe|invoice|invoices)\b/.test(
      lower,
    )
  ) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-billing')!;
  }
  if (/\/(admin|moderation|moderate|system-logs)\b/.test(lower)) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-admin')!;
  }
  if (
    /\/(settings|profile|account|client-settings|user-settings|preferences|organization|org|team|members)\b/.test(
      lower,
    )
  ) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-settings')!;
  }
  if (/\/(api-keys?|api-key-management|developer|developers|tokens?|credentials?)\b/.test(lower)) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-api-access')!;
  }
  if (/\/(reports?|analytics|metrics|stats|compliance|environmental|operations)\b/.test(lower)) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-reporting')!;
  }
  if (/\/(facilities|facility|locations?|bins?|lifecycle)\b/.test(lower)) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-facilities')!;
  }
  if (/\/(lab-results?|lab|results?)\b/.test(lower)) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-lab-results')!;
  }
  if (/\/(ai-insights?|insights?|ai|assistant|automation|recommendations?)\b/.test(lower)) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-ai-insights')!;
  }
  if (/\/(chat|messages?|messaging|conversations?|inbox|notifications?|alerts?)\b/.test(lower)) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-communications')!;
  }
  if (/\/(brand|brand-portal|assets?|media|gallery|uploads?)\b/.test(lower)) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-brand-portal')!;
  }
  if (
    /\/(content|cms|editor|posts?|articles?|catalog|library|registry|marketplace)\b/.test(lower)
  ) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-content')!;
  }
  if (
    path === '/' ||
    /\/(about|contact|pricing|blog|docs|legal|privacy|terms|marketing)\b/.test(lower)
  ) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-public')!;
  }
  if (/\/(dashboard|overview|workspace|home)\b/.test(lower)) {
    return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-dashboard')!;
  }
  return ROUTE_DOMAINS.find((domain) => domain.sectionId === 'observed-primary')!;
}

function platformForTarget(target: string, routeStrategy: RoutesAnalysis['strategy']) {
  const normalized = target.toLowerCase();
  if (
    routeStrategy === 'app-router' ||
    routeStrategy === 'pages-router' ||
    routeStrategy === 'mixed-next-router' ||
    routeStrategy === 'sveltekit-router' ||
    routeStrategy === 'nuxt-router'
  ) {
    return { type: 'ssr' as const, routing: 'pathname' as const };
  }
  if (normalized === 'nextjs' || normalized === 'nuxt' || normalized === 'astro') {
    return { type: 'ssr' as const, routing: 'pathname' as const };
  }
  if (routeStrategy === 'react-router')
    return { type: 'spa' as const, routing: 'history' as const };
  if (normalized === 'html') return { type: 'static' as const, routing: 'pathname' as const };
  return { type: 'spa' as const, routing: 'history' as const };
}

function featuresForSection(sectionId: string, features: string[]): string[] {
  const domain = ROUTE_DOMAINS.find((candidate) => candidate.sectionId === sectionId);
  if (domain && domain.featureHints.length > 0) {
    return features.filter((f) => domain.featureHints.includes(f));
  }
  return features;
}

function doctrineEffects(ambient: AmbientContextInventory): Record<string, string> | undefined {
  const effects: Record<string, string> = {};
  if (ambient.summary['security-data'] > 0) {
    effects['doctrine-security-data'] =
      'Preserve existing auth, middleware, schema, migration, RLS, and data-boundary rules unless the user explicitly approves a reviewed migration.';
  }
  if (ambient.summary['design-system'] > 0) {
    effects['doctrine-design-system'] =
      'Preserve existing design-system tokens, component conventions, and styling framework unless the user explicitly opts into style migration.';
  }
  if (ambient.summary['workflow-ci'] > 0) {
    effects['doctrine-workflow-ci'] =
      'Use existing package-manager, build, test, lint, deployment, and CI conventions as validation evidence.';
  }
  if (ambient.summary['feature-business'] > 0) {
    effects['doctrine-feature-business'] =
      'Treat initiative, memory, and feature docs as business-domain evidence; verify stale risks before enforcing them.';
  }
  return Object.keys(effects).length > 0 ? effects : undefined;
}

function readRouteSource(projectRoot: string, file: string): string {
  if (!file || file === '.') return '';
  try {
    return readFileSync(join(projectRoot, file), 'utf-8');
  } catch {
    return '';
  }
}

function publicSurfaceShell(input: BrownfieldProposalInput, code: string): string {
  const hasFooter = input.layout.hasFooter || /\bfooter\b|<\s*Footer\b/i.test(code);
  const hasTopNav =
    input.layout.hasTopNav ||
    /\b(?:topnav|top-nav|navbar|header)\b|<\s*(?:Header|Nav|Navbar)\b/i.test(code);
  if (hasTopNav && hasFooter) return 'topnav-main-footer';
  if (hasTopNav) return 'topnav-main';
  if (hasFooter) return 'main-footer';
  return 'main-only';
}

function routeShellPattern(
  input: BrownfieldProposalInput,
  route: { path: string; file: string },
  classified: RouteDomain,
  fallbackShell: string,
): string {
  const code = readRouteSource(input.project.projectRoot, route.file);
  const routeEvidence = `${route.path} ${route.file} ${code}`;
  if (
    classified.role === 'public' ||
    /\b(?:pricing|plans|marketing|landing|public|hero|full-bleed|fullbleed|marketing-bleed)\b/i.test(
      routeEvidence,
    )
  ) {
    return publicSurfaceShell(input, code);
  }
  if (/\b(?:sidebar|side-nav|sidenav|app-frame|dashboard-shell)\b/i.test(routeEvidence)) {
    return fallbackShell;
  }
  return fallbackShell;
}

export function createBrownfieldProposal(input: BrownfieldProposalInput): BrownfieldProposal {
  const target = input.project.framework !== 'unknown' ? input.project.framework : 'generic-web';
  const shell = input.layout.shellPattern || 'observed-existing-shell';
  const routeMap: EssenceV4['blueprint']['routes'] = {};
  const sectionMap = new Map<string, EssenceSection>();

  const observedRoutes = input.routes.routes;

  if (observedRoutes.length === 0) {
    sectionMap.set('observed-ui', {
      id: 'observed-ui',
      role: 'primary',
      shell,
      features: input.features.detected,
      description:
        'Selected UI package attached without promoting unresolved route candidates to governed topology.',
      pages: [
        {
          id: 'surface-reference',
          layout: ['existing-surface'],
          directives: [
            'No production route is governed yet. Select an exact component, story, or proven route target before editing.',
            'Preserve the selected package runtime, styling authority, and project-owned source boundaries.',
          ],
        },
      ],
      directives: [
        `Route authority is ${input.routes.authority} with ${input.routes.completeness} topology completeness.`,
        'Candidate routes are observation evidence only and must not be treated as contract truth.',
      ],
    });
  }

  for (const route of observedRoutes) {
    const classified = routeDomain(route.path);
    const observedShell = routeShellPattern(input, route, classified, shell);
    const section =
      sectionMap.get(classified.sectionId) ??
      ({
        id: classified.sectionId,
        role: classified.role,
        shell: observedShell,
        features: featuresForSection(classified.sectionId, input.features.detected),
        description: classified.description,
        pages: [],
        directives: [
          `Semantic domain: ${classified.label}. Use this as an observed product-domain grouping, not a scaffold category.`,
          'Preserve existing route files, layouts, data boundaries, and styling conventions unless the user explicitly approves a migration.',
        ],
      } satisfies EssenceSection);

    const pageId = route.path === '/' ? 'home' : slugify(route.path, 'observed-page');
    if (!section.pages.some((page) => page.id === pageId)) {
      section.pages.push({
        id: pageId,
        route: route.path,
        layout: ['existing-surface'],
        directives: [
          `Observed source: ${route.file}. Treat this route as existing product surface, not scaffold territory.`,
          `Observed shell: ${observedShell}. Preserve this route's shell posture unless the user explicitly approves a layout migration.`,
        ],
      });
    }
    routeMap[route.path] = { section: section.id, page: pageId };
    sectionMap.set(section.id, section);
  }

  const sections = [...sectionMap.values()].sort((a, b) => {
    const aPriority = ROUTE_DOMAINS.find((domain) => domain.sectionId === a.id)?.priority ?? 99;
    const bPriority = ROUTE_DOMAINS.find((domain) => domain.sectionId === b.id)?.priority ?? 99;
    return aPriority - bPriority || a.id.localeCompare(b.id);
  });

  const essence: EssenceV4 = {
    version: '4.0.0',
    dna: {
      theme: {
        id: 'existing',
        mode: input.styling.darkMode ? 'dark' : 'auto',
        shape: 'rounded',
      },
      spacing: {
        base_unit: 4,
        scale: 'observed',
        density: 'comfortable',
        content_gap: '_gap4',
      },
      typography: {
        scale: 'observed',
        heading_weight: 600,
        body_weight: 400,
      },
      color: {
        palette: input.styling.approach === 'unknown' ? 'observed' : input.styling.approach,
        accent_count: Math.max(1, Object.keys(input.styling.colors).length),
        cvd_preference: 'auto',
      },
      radius: {
        philosophy: 'observed',
        base: 8,
      },
      elevation: {
        system: 'observed',
        max_levels: 3,
      },
      motion: {
        preference: input.dependencies.ui.includes('framer-motion') ? 'expressive' : 'subtle',
        duration_scale: 1,
        reduce_motion: true,
      },
      accessibility: {
        wcag_level: 'AA',
        focus_visible: true,
        skip_nav: true,
      },
      personality: ['observed brownfield product'],
      constraints: {
        mode: 'existing project wins',
        typography: 'derive from existing docs, CSS variables, and component conventions',
        borders: 'derive from existing design system',
        corners: 'derive from existing design system',
        shadows: 'derive from existing design system',
        effects: doctrineEffects(input.ambient),
      },
    },
    blueprint: {
      sections,
      features: input.features.detected,
      routes: routeMap,
    },
    meta: {
      archetype: 'observed-brownfield',
      target,
      platform: platformForTarget(target, input.routes.strategy),
      guard: {
        mode: 'guided',
        dna_enforcement: 'error',
        blueprint_enforcement: 'warn',
        interactions_enforcement: 'warn',
      },
      navigation: {
        command_palette: false,
      },
    },
  };

  return {
    version: 1,
    kind: 'brownfield-observed-essence',
    generatedAt: new Date().toISOString(),
    status: 'proposed',
    essence,
    evidence: {
      routeCount: input.routes.routes.length,
      candidateRouteCount: input.routes.candidateRoutes.length,
      routeAuthority: input.routes.authority,
      routeCompleteness: input.routes.completeness,
      componentCount: input.components.componentCount,
      featureCount: input.features.detected.length,
      ambientContextCount: input.ambient.items.length,
      stylingApproach: input.styling.approach,
      shell,
      semanticSectionCount: sections.length,
    },
    conflicts: input.ambient.conflicts,
    staleRisks: input.ambient.staleRisks,
    acceptance: {
      create: 'decantr init --existing --accept-proposal',
      merge: 'decantr init --existing --merge-proposal',
      replace: 'decantr init --existing --replace-essence',
    },
  };
}

export function proposalPath(projectRoot: string): string {
  return join(projectRoot, '.decantr', 'observed-essence.proposal.json');
}

export function writeBrownfieldProposal(projectRoot: string, proposal: BrownfieldProposal): void {
  const decantrDir = join(projectRoot, '.decantr');
  mkdirSync(decantrDir, { recursive: true });
  writeFileSync(proposalPath(projectRoot), JSON.stringify(proposal, null, 2) + '\n', 'utf-8');
}

export function readBrownfieldProposal(projectRoot: string): BrownfieldProposal | null {
  const path = proposalPath(projectRoot);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf-8')) as BrownfieldProposal;
    if (parsed.kind !== 'brownfield-observed-essence' || !isV4(parsed.essence)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function generateBrownfieldReport(
  proposal: BrownfieldProposal,
  ambient: AmbientContextInventory,
  doctrine?: DoctrineMap,
): string {
  const lines: string[] = [];
  lines.push('# Decantr Brownfield Report');
  lines.push('');
  lines.push(
    'Decantr analyzed this app as an existing product. The proposal below is observed from the codebase and ambient project doctrine; it is not a Decantr scaffold.',
  );
  lines.push('');
  lines.push('## Proposal');
  lines.push('');
  lines.push(`- Routes observed: ${proposal.evidence.routeCount}`);
  lines.push(`- Semantic sections inferred: ${proposal.evidence.semanticSectionCount}`);
  lines.push(`- Components observed: ${proposal.evidence.componentCount}`);
  lines.push(`- Features observed: ${proposal.evidence.featureCount}`);
  lines.push(`- Styling approach: ${proposal.evidence.stylingApproach}`);
  lines.push(`- Shell signal: ${proposal.evidence.shell}`);
  lines.push(`- Ambient context items: ${proposal.evidence.ambientContextCount}`);
  lines.push(`- Theme posture: existing project wins`);
  if (doctrine) {
    lines.push(`- Doctrine sources ranked: ${doctrine.sources.length}`);
    lines.push(`- Highest precedence source: ${doctrine.sources[0]?.path ?? 'none'}`);
  }
  lines.push('');
  lines.push('## Immediate Value');
  lines.push('');
  lines.push(
    '- Converts scattered brownfield routes, styling signals, docs, rules, schemas, and CI evidence into one Decantr contract without scaffolding runtime code.',
  );
  lines.push(
    '- Gives assistants a compiled contract layer while keeping original docs/rules available as cited evidence.',
  );
  lines.push(
    '- Enables `decantr check --brownfield` to catch route drift, unsafe defaults, doctrine conflicts, and missing context.',
  );
  lines.push('');
  lines.push('## Non-Goals By Default');
  lines.push('');
  lines.push(
    '- Does not install Decantr CSS, switch themes, replace layouts, rewrite docs, mutate assistant rules, or import official corpus patterns unless explicitly requested.',
  );
  lines.push(
    '- Does not treat stale migration or completion summaries as current doctrine without verification.',
  );
  lines.push('');
  lines.push('## Accepted Evidence');
  lines.push('');
  lines.push(
    '- Existing framework, routes, layout shell, feature names, styling signals, and ambient doctrine were used as evidence for the proposal.',
  );
  lines.push(
    '- Decantr official corpus content, Decantr CSS, and default Decantr themes were not accepted as brownfield defaults.',
  );
  lines.push('');
  lines.push('## Uncertain Evidence');
  lines.push('');
  const uncertain: string[] = [];
  if (proposal.evidence.routeCount === 0)
    uncertain.push(
      'No explicit route declarations were found; proposal uses `/` as a placeholder observation.',
    );
  if (proposal.evidence.stylingApproach === 'unknown')
    uncertain.push('Styling approach was not confidently detected.');
  if (proposal.evidence.ambientContextCount === 0)
    uncertain.push('No ambient docs, rules, CI, schema, or project-memory files were detected.');
  if (uncertain.length === 0) {
    lines.push('- No major uncertainty detected by the first-pass scanners.');
  } else {
    for (const item of uncertain) lines.push(`- ${item}`);
  }
  lines.push('');
  lines.push('## Acceptance');
  lines.push('');
  lines.push(`- Create initial essence: \`${proposal.acceptance.create}\``);
  lines.push(`- Merge into existing essence: \`${proposal.acceptance.merge}\``);
  lines.push(`- Replace existing essence: \`${proposal.acceptance.replace}\``);
  lines.push('');
  lines.push('## Ambient Context Summary');
  lines.push('');
  for (const [role, count] of Object.entries(ambient.summary)) {
    if (count > 0) lines.push(`- ${role}: ${count}`);
  }
  lines.push('');
  if (doctrine) {
    lines.push('## Doctrine Precedence');
    lines.push('');
    for (const source of doctrine.sources.slice(0, 12)) {
      lines.push(
        `- ${source.path}: ${source.area}, precedence ${source.precedence}, ${source.currency}`,
      );
    }
    if (doctrine.sources.length > 12) {
      lines.push(`- +${doctrine.sources.length - 12} more source(s) in .decantr/doctrine-map.json`);
    }
    lines.push('');
    lines.push('## Doctrine Resolution Suggestions');
    lines.push('');
    if (doctrine.resolutions.length === 0) {
      lines.push('- No doctrine resolution suggestions were needed.');
    } else {
      for (const resolution of doctrine.resolutions.slice(0, 8)) {
        lines.push(`- ${resolution.issue} ${resolution.recommendation}`);
        if (resolution.preferredSources.length > 0) {
          lines.push(`  Preferred evidence: ${resolution.preferredSources.join(', ')}`);
        }
      }
      if (doctrine.resolutions.length > 8) {
        lines.push(
          `- +${doctrine.resolutions.length - 8} more resolution suggestion(s) in .decantr/doctrine-map.json`,
        );
      }
    }
    lines.push('');
  }
  lines.push('## Notable Context Evidence');
  lines.push('');
  const notable = ambient.items.slice(0, 30);
  if (notable.length === 0) {
    lines.push('- None detected.');
  } else {
    for (const item of notable) {
      const cite = item.safeToCite ? 'safe to cite' : 'do not cite directly';
      lines.push(
        `- ${item.path} (${item.role}, ${item.type}, ${cite}, confidence ${item.confidence.toFixed(2)})`,
      );
    }
    if (ambient.items.length > notable.length) {
      lines.push(
        `- +${ambient.items.length - notable.length} more item(s) in .decantr/ambient-context.json`,
      );
    }
  }
  lines.push('');
  lines.push('## Conflicts And Stale Risks');
  lines.push('');
  if (proposal.conflicts.length === 0 && proposal.staleRisks.length === 0) {
    lines.push('- No obvious doctrine conflicts or stale-document risks were detected.');
  } else {
    for (const conflict of proposal.conflicts) lines.push(`- Conflict: ${conflict}`);
    for (const risk of proposal.staleRisks.slice(0, 8)) lines.push(`- Stale risk: ${risk}`);
  }
  lines.push('');
  lines.push('## Assistant Posture');
  lines.push('');
  lines.push(
    'LLMs should treat Decantr as the compiled contract layer and the original files as cited evidence. Do not migrate, rewrite, or delete existing docs/rules unless the user explicitly asks for doctrine migration.',
  );
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function mergeEssenceWithProposal(
  existing: EssenceV4,
  proposal: BrownfieldProposal,
): EssenceV4 {
  const next: EssenceV4 = JSON.parse(JSON.stringify(existing)) as EssenceV4;
  const proposed = proposal.essence;
  next.version = '4.0.0';
  next.blueprint.features = [
    ...new Set([...(next.blueprint.features ?? []), ...(proposed.blueprint.features ?? [])]),
  ];
  next.blueprint.routes = {
    ...(proposed.blueprint.routes ?? {}),
    ...(next.blueprint.routes ?? {}),
  };

  const existingSections = new Map(
    (next.blueprint.sections ?? []).map((section) => [section.id, section]),
  );
  for (const proposedSection of proposed.blueprint.sections ?? []) {
    const current = existingSections.get(proposedSection.id);
    if (!current) {
      existingSections.set(proposedSection.id, proposedSection);
      continue;
    }
    const pageIds = new Set(current.pages.map((page) => page.id));
    current.pages.push(...proposedSection.pages.filter((page) => !pageIds.has(page.id)));
    current.features = [
      ...new Set([...(current.features ?? []), ...(proposedSection.features ?? [])]),
    ];
  }
  next.blueprint.sections = [...existingSections.values()];
  delete next.blueprint.pages;
  delete next.blueprint.shell;
  return next;
}
