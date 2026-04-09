import { isV3, migrateV2ToV3 } from '@decantr/essence-spec';
import type { EssenceFile, EssenceV3 } from '@decantr/essence-spec';
import type { ContentResolver } from '@decantr/registry';
import { walkIR } from './ir-helpers.js';
import { runPipeline } from './pipeline.js';
import type { IRAppNode, IRNode, IRPageNode, IRPatternNode } from './types.js';

export type ExecutionPackType = 'scaffold' | 'section' | 'page' | 'mutation' | 'review';

export const EXECUTION_PACK_SCHEMA_URLS = {
  scaffold: 'https://decantr.ai/schemas/scaffold-pack.v1.json',
  section: 'https://decantr.ai/schemas/section-pack.v1.json',
  page: 'https://decantr.ai/schemas/page-pack.v1.json',
  mutation: 'https://decantr.ai/schemas/mutation-pack.v1.json',
  review: 'https://decantr.ai/schemas/review-pack.v1.json',
} as const;

export const PACK_MANIFEST_SCHEMA_URL = 'https://decantr.ai/schemas/pack-manifest.v1.json';
export const EXECUTION_PACK_BUNDLE_SCHEMA_URL = 'https://decantr.ai/schemas/execution-pack-bundle.v1.json';
export const SELECTED_EXECUTION_PACK_SCHEMA_URL = 'https://decantr.ai/schemas/selected-execution-pack.v1.json';

export interface ExecutionPackTarget {
  platform: 'web';
  framework: string | null;
  runtime: string | null;
  adapter: string;
}

export interface ExecutionPackScope {
  appId: string;
  pageIds: string[];
  patternIds: string[];
}

export interface ExecutionPackExample {
  id: string;
  label: string;
  language: string;
  snippet: string;
}

export interface ExecutionPackAntiPattern {
  id: string;
  summary: string;
  guidance: string;
}

export interface ExecutionPackSuccessCheck {
  id: string;
  label: string;
  severity: 'error' | 'warn' | 'info';
}

export interface ExecutionPackTokenBudget {
  target: number;
  max: number;
  strategy: string[];
}

export interface ExecutionPackBase<TData> {
  $schema: string;
  packVersion: '1.0.0';
  packType: ExecutionPackType;
  objective: string;
  target: ExecutionPackTarget;
  preset: string | null;
  scope: ExecutionPackScope;
  requiredSetup: string[];
  allowedVocabulary: string[];
  examples: ExecutionPackExample[];
  antiPatterns: ExecutionPackAntiPattern[];
  successChecks: ExecutionPackSuccessCheck[];
  tokenBudget: ExecutionPackTokenBudget;
  data: TData;
  renderedMarkdown: string;
}

export interface PackManifestEntry {
  id: string;
  markdown: string;
  json: string;
}

export interface PackManifestSectionEntry extends PackManifestEntry {
  pageIds: string[];
}

export interface PackManifestPageEntry extends PackManifestEntry {
  sectionId: string | null;
  sectionRole: string | null;
}

export interface PackManifestMutationEntry extends PackManifestEntry {
  mutationType: MutationPackKind;
}

export interface ExecutionPackManifest {
  $schema: string;
  version: '1.0.0';
  generatedAt: string;
  scaffold: PackManifestEntry | null;
  review: PackManifestEntry | null;
  sections: PackManifestSectionEntry[];
  pages: PackManifestPageEntry[];
  mutations: PackManifestMutationEntry[];
}

export interface ScaffoldPackRoute {
  pageId: string;
  path: string;
  patternIds: string[];
}

export interface ScaffoldPackData {
  shell: string;
  theme: {
    id: string;
    mode: string;
    shape: string | null;
  };
  routing: 'hash' | 'history';
  features: string[];
  routes: ScaffoldPackRoute[];
}

export interface ScaffoldExecutionPack extends ExecutionPackBase<ScaffoldPackData> {
  packType: 'scaffold';
}

export interface SectionPackInput {
  id: string;
  role: string;
  shell: string;
  description: string;
  features: string[];
  pageIds: string[];
}

export interface SectionPackRoute {
  pageId: string;
  path: string;
  patternIds: string[];
}

export interface SectionPackData {
  sectionId: string;
  role: string;
  shell: string;
  description: string;
  features: string[];
  theme: {
    id: string;
    mode: string;
    shape: string | null;
  };
  routes: SectionPackRoute[];
}

export interface SectionExecutionPack extends ExecutionPackBase<SectionPackData> {
  packType: 'section';
}

export interface PagePackInput {
  pageId: string;
  shell: string;
  sectionId: string | null;
  sectionRole: string | null;
  features: string[];
}

export interface PagePackPattern {
  id: string;
  alias: string;
  preset: string;
  layout: string;
}

export interface PagePackData {
  pageId: string;
  path: string;
  shell: string;
  sectionId: string | null;
  sectionRole: string | null;
  features: string[];
  surface: string;
  theme: {
    id: string;
    mode: string;
    shape: string | null;
  };
  wiringSignals: string[];
  patterns: PagePackPattern[];
}

export interface PageExecutionPack extends ExecutionPackBase<PagePackData> {
  packType: 'page';
}

export type MutationPackKind = 'add-page' | 'modify';

export interface MutationPackData {
  mutationType: MutationPackKind;
  shell: string;
  theme: {
    id: string;
    mode: string;
    shape: string | null;
  };
  routing: 'hash' | 'history';
  features: string[];
  routes: ScaffoldPackRoute[];
  workflow: string[];
}

export interface MutationExecutionPack extends ExecutionPackBase<MutationPackData> {
  packType: 'mutation';
}

export type ReviewPackKind = 'app';

export interface ReviewPackData {
  reviewType: ReviewPackKind;
  shell: string;
  theme: {
    id: string;
    mode: string;
    shape: string | null;
  };
  routing: 'hash' | 'history';
  features: string[];
  routes: ScaffoldPackRoute[];
  focusAreas: string[];
  workflow: string[];
}

export interface ReviewExecutionPack extends ExecutionPackBase<ReviewPackData> {
  packType: 'review';
}

export interface ExecutionPackBundle {
  $schema: string;
  generatedAt: string;
  sourceEssenceVersion: string;
  manifest: ExecutionPackManifest;
  scaffold: ScaffoldExecutionPack;
  review: ReviewExecutionPack;
  sections: SectionExecutionPack[];
  pages: PageExecutionPack[];
  mutations: MutationExecutionPack[];
}

export type SelectedExecutionPack =
  | ScaffoldExecutionPack
  | ReviewExecutionPack
  | SectionExecutionPack
  | PageExecutionPack
  | MutationExecutionPack;

export interface ExecutionPackSelector {
  packType: ExecutionPackType;
  id?: string | null;
}

export interface SelectedExecutionPackResponse {
  $schema: string;
  generatedAt: string;
  sourceEssenceVersion: string;
  manifest: ExecutionPackManifest;
  selector: {
    packType: ExecutionPackType;
    id: string | null;
  };
  pack: SelectedExecutionPack;
}

export interface ScaffoldPackBuilderOptions {
  objective?: string;
  target?: Partial<ExecutionPackTarget>;
  preset?: string | null;
  requiredSetup?: string[];
  examples?: ExecutionPackExample[];
  antiPatterns?: ExecutionPackAntiPattern[];
  successChecks?: ExecutionPackSuccessCheck[];
  tokenBudget?: Partial<ExecutionPackTokenBudget>;
}

export interface SectionPackBuilderOptions extends ScaffoldPackBuilderOptions {}
export interface PagePackBuilderOptions extends ScaffoldPackBuilderOptions {}
export interface MutationPackBuilderOptions extends ScaffoldPackBuilderOptions {
  mutationType: MutationPackKind;
  workflow?: string[];
}
export interface ReviewPackBuilderOptions extends ScaffoldPackBuilderOptions {
  reviewType?: ReviewPackKind;
  focusAreas?: string[];
  workflow?: string[];
}

export interface CompileExecutionPackBundleOptions {
  contentRoot?: string;
  overridePaths?: string[];
  resolver?: ContentResolver;
}

const DEFAULT_TARGET: ExecutionPackTarget = {
  platform: 'web',
  framework: null,
  runtime: null,
  adapter: 'generic-web',
};

const DEFAULT_TOKEN_BUDGET: ExecutionPackTokenBudget = {
  target: 1400,
  max: 2200,
  strategy: [
    'Prefer route summaries over repeated prose.',
    'Use compact vocabulary lists instead of large reference tables.',
    'Include only task-relevant examples and checks.',
  ],
};

const DEFAULT_SUCCESS_CHECKS: ExecutionPackSuccessCheck[] = [
  {
    id: 'route-topology',
    label: 'Routes and page IDs match the compiled topology.',
    severity: 'error',
  },
  {
    id: 'shell-consistency',
    label: 'The declared shell contract is preserved unless the task explicitly mutates it.',
    severity: 'error',
  },
  {
    id: 'theme-consistency',
    label: 'Theme identity and mode remain consistent across scaffolded routes.',
    severity: 'warn',
  },
];

const DEFAULT_SECTION_SUCCESS_CHECKS: ExecutionPackSuccessCheck[] = [
  {
    id: 'section-route-coherence',
    label: 'Section pages and routes remain coherent with the compiled topology.',
    severity: 'error',
  },
  {
    id: 'section-shell-consistency',
    label: 'The section shell contract stays consistent across its routes.',
    severity: 'error',
  },
  {
    id: 'section-pattern-coverage',
    label: 'Primary section patterns are represented without adding off-contract filler sections.',
    severity: 'warn',
  },
];

const DEFAULT_PAGE_SUCCESS_CHECKS: ExecutionPackSuccessCheck[] = [
  {
    id: 'page-route-contract',
    label: 'The page keeps the compiled route, shell, and section contract intact.',
    severity: 'error',
  },
  {
    id: 'page-pattern-contract',
    label: 'The page preserves its primary compiled patterns instead of drifting into unrelated layouts.',
    severity: 'error',
  },
  {
    id: 'page-state-contract',
    label: 'Any declared wiring signals remain coherent with the rendered page structure.',
    severity: 'warn',
  },
];

const DEFAULT_MUTATION_SUCCESS_CHECKS: Record<MutationPackKind, ExecutionPackSuccessCheck[]> = {
  'add-page': [
    {
      id: 'mutation-essence-first',
      label: 'New pages are declared in the essence before any code generation begins.',
      severity: 'error',
    },
    {
      id: 'mutation-shell-contract',
      label: 'New routes inherit an existing shell and section contract unless the essence changes first.',
      severity: 'error',
    },
    {
      id: 'mutation-refresh',
      label: 'Refresh compiled packs after the mutation so downstream tasks read current topology.',
      severity: 'warn',
    },
  ],
  modify: [
    {
      id: 'mutation-existing-topology',
      label: 'Modified routes remain coherent with the compiled topology unless the essence changes first.',
      severity: 'error',
    },
    {
      id: 'mutation-theme-contract',
      label: 'Theme, shell, and page identity stay aligned with the current contract during edits.',
      severity: 'error',
    },
    {
      id: 'mutation-page-pack-first',
      label: 'Route-local edits should start from the compiled page pack rather than improvised structure.',
      severity: 'warn',
    },
  ],
};

const DEFAULT_REVIEW_SUCCESS_CHECKS: ExecutionPackSuccessCheck[] = [
  {
    id: 'review-contract-baseline',
    label: 'Review findings should use the compiled route, shell, and theme contract as the baseline.',
    severity: 'error',
  },
  {
    id: 'review-evidence',
    label: 'Each critique finding should cite concrete evidence from the generated workspace.',
    severity: 'error',
  },
  {
    id: 'review-remediation',
    label: 'Suggested fixes should point back to code changes or essence updates when contract drift exists.',
    severity: 'warn',
  },
];

const DEFAULT_REVIEW_ANTI_PATTERNS: ExecutionPackAntiPattern[] = [
  {
    id: 'inline-styles',
    summary: 'Avoid inline style literals as the primary styling path.',
    guidance: 'Move visual styling into tokens.css and treatments.css instead of component-local style objects.',
  },
  {
    id: 'hardcoded-colors',
    summary: 'Avoid hardcoded color literals.',
    guidance: 'Use CSS variables and theme decorators instead of hex, rgb, or hsl values.',
  },
  {
    id: 'utility-framework-leakage',
    summary: 'Avoid utility-framework leakage as the primary design language.',
    guidance: 'Prefer compiled Decantr treatments and contract vocabulary over ad hoc utility class stacks.',
  },
];

function collectPatternIds(page: IRPageNode): string[] {
  const patternIds: string[] = [];
  walkIR(page, (node: IRNode) => {
    if (node.type !== 'pattern') return;
    const patternNode = node as IRPatternNode;
    patternIds.push(patternNode.pattern.patternId);
  });
  return [...new Set(patternIds)];
}

function summarizeRoutes(appNode: IRAppNode): ScaffoldPackRoute[] {
  return appNode.children.map((page) => {
    const pageNode = page as IRPageNode;
    const route = appNode.routes.find((entry) => entry.pageId === pageNode.pageId);
    return {
      pageId: pageNode.pageId,
      path: route?.path || `/${pageNode.pageId}`,
      patternIds: collectPatternIds(pageNode),
    };
  });
}

function summarizeSectionRoutes(appNode: IRAppNode, input: SectionPackInput): SectionPackRoute[] {
  return summarizeRoutes(appNode).filter(route => input.pageIds.includes(route.pageId));
}

function summarizePageRoute(appNode: IRAppNode, pageId: string): ScaffoldPackRoute | null {
  return summarizeRoutes(appNode).find(route => route.pageId === pageId) ?? null;
}

function findPageNode(appNode: IRAppNode, pageId: string): IRPageNode | null {
  const page = appNode.children.find(node => (node as IRPageNode).pageId === pageId);
  return page ? page as IRPageNode : null;
}

function collectPagePatterns(page: IRPageNode): PagePackPattern[] {
  const patterns: PagePackPattern[] = [];
  walkIR(page, (node: IRNode) => {
    if (node.type !== 'pattern') return;
    const patternNode = node as IRPatternNode;
    patterns.push({
      id: patternNode.pattern.patternId,
      alias: patternNode.pattern.alias,
      preset: patternNode.pattern.preset,
      layout: patternNode.pattern.layout,
    });
  });
  return patterns;
}

function mergeTokenBudget(overrides?: Partial<ExecutionPackTokenBudget>): ExecutionPackTokenBudget {
  return {
    target: overrides?.target ?? DEFAULT_TOKEN_BUDGET.target,
    max: overrides?.max ?? DEFAULT_TOKEN_BUDGET.max,
    strategy: overrides?.strategy ?? DEFAULT_TOKEN_BUDGET.strategy,
  };
}

function renderList(title: string, entries: string[]): string[] {
  if (entries.length === 0) return [];
  return [title, ...entries.map(entry => `- ${entry}`), ''];
}

export function renderExecutionPackMarkdown(pack: ExecutionPackBase<unknown>): string {
  const lines: string[] = [];

  lines.push(`# ${pack.packType.charAt(0).toUpperCase()}${pack.packType.slice(1)} Pack`);
  lines.push('');
  lines.push(`**Objective:** ${pack.objective}`);
  lines.push(`**Target:** ${pack.target.adapter}${pack.target.framework ? ` (${pack.target.framework})` : ''}`);
  lines.push(`**Scope:** pages=${pack.scope.pageIds.join(', ') || 'none'} | patterns=${pack.scope.patternIds.join(', ') || 'none'}`);
  lines.push('');

  if (pack.packType === 'scaffold') {
    const scaffoldPack = pack as ScaffoldExecutionPack;
    lines.push('## Scaffold Contract');
    lines.push(`- Shell: ${scaffoldPack.data.shell}`);
    lines.push(`- Theme: ${scaffoldPack.data.theme.id} (${scaffoldPack.data.theme.mode})`);
    lines.push(`- Routing: ${scaffoldPack.data.routing}`);
    if (scaffoldPack.data.features.length > 0) {
      lines.push(`- Features: ${scaffoldPack.data.features.join(', ')}`);
    }
    lines.push('');

    lines.push('## Route Plan');
    for (const route of scaffoldPack.data.routes) {
      const patterns = route.patternIds.length > 0 ? route.patternIds.join(', ') : 'none';
      lines.push(`- ${route.path} -> ${route.pageId} [${patterns}]`);
    }
    lines.push('');
  }

  if (pack.packType === 'section') {
    const sectionPack = pack as SectionExecutionPack;
    lines.push('## Section Contract');
    lines.push(`- Section: ${sectionPack.data.sectionId}`);
    lines.push(`- Role: ${sectionPack.data.role}`);
    lines.push(`- Shell: ${sectionPack.data.shell}`);
    lines.push(`- Theme: ${sectionPack.data.theme.id} (${sectionPack.data.theme.mode})`);
    if (sectionPack.data.features.length > 0) {
      lines.push(`- Features: ${sectionPack.data.features.join(', ')}`);
    }
    if (sectionPack.data.description) {
      lines.push(`- Description: ${sectionPack.data.description}`);
    }
    lines.push('');

    lines.push('## Section Routes');
    for (const route of sectionPack.data.routes) {
      const patterns = route.patternIds.length > 0 ? route.patternIds.join(', ') : 'none';
      lines.push(`- ${route.path} -> ${route.pageId} [${patterns}]`);
    }
    lines.push('');
  }

  if (pack.packType === 'page') {
    const pagePack = pack as PageExecutionPack;
    lines.push('## Page Contract');
    lines.push(`- Page: ${pagePack.data.pageId}`);
    lines.push(`- Path: ${pagePack.data.path}`);
    lines.push(`- Shell: ${pagePack.data.shell}`);
    if (pagePack.data.sectionId) {
      const role = pagePack.data.sectionRole ? ` (${pagePack.data.sectionRole})` : '';
      lines.push(`- Section: ${pagePack.data.sectionId}${role}`);
    }
    lines.push(`- Theme: ${pagePack.data.theme.id} (${pagePack.data.theme.mode})`);
    if (pagePack.data.features.length > 0) {
      lines.push(`- Features: ${pagePack.data.features.join(', ')}`);
    }
    if (pagePack.data.surface) {
      lines.push(`- Surface: ${pagePack.data.surface}`);
    }
    lines.push('');

    lines.push('## Page Patterns');
    for (const pattern of pagePack.data.patterns) {
      lines.push(`- ${pattern.alias} -> ${pattern.id} [${pattern.layout}${pattern.preset ? ` | ${pattern.preset}` : ''}]`);
    }
    lines.push('');

    if (pagePack.data.wiringSignals.length > 0) {
      lines.push('## Wiring Signals');
      for (const signal of pagePack.data.wiringSignals) {
        lines.push(`- ${signal}`);
      }
      lines.push('');
    }
  }

  if (pack.packType === 'mutation') {
    const mutationPack = pack as MutationExecutionPack;
    lines.push('## Mutation Contract');
    lines.push(`- Operation: ${mutationPack.data.mutationType}`);
    lines.push(`- Shell: ${mutationPack.data.shell}`);
    lines.push(`- Theme: ${mutationPack.data.theme.id} (${mutationPack.data.theme.mode})`);
    lines.push(`- Routing: ${mutationPack.data.routing}`);
    if (mutationPack.data.features.length > 0) {
      lines.push(`- Features: ${mutationPack.data.features.join(', ')}`);
    }
    lines.push('');

    lines.push('## Route Topology');
    for (const route of mutationPack.data.routes) {
      const patterns = route.patternIds.length > 0 ? route.patternIds.join(', ') : 'none';
      lines.push(`- ${route.path} -> ${route.pageId} [${patterns}]`);
    }
    lines.push('');

    if (mutationPack.data.workflow.length > 0) {
      lines.push('## Workflow');
      for (const step of mutationPack.data.workflow) {
        lines.push(`- ${step}`);
      }
      lines.push('');
    }
  }

  if (pack.packType === 'review') {
    const reviewPack = pack as ReviewExecutionPack;
    lines.push('## Review Contract');
    lines.push(`- Review Type: ${reviewPack.data.reviewType}`);
    lines.push(`- Shell: ${reviewPack.data.shell}`);
    lines.push(`- Theme: ${reviewPack.data.theme.id} (${reviewPack.data.theme.mode})`);
    lines.push(`- Routing: ${reviewPack.data.routing}`);
    if (reviewPack.data.features.length > 0) {
      lines.push(`- Features: ${reviewPack.data.features.join(', ')}`);
    }
    lines.push('');

    lines.push('## Review Topology');
    for (const route of reviewPack.data.routes) {
      const patterns = route.patternIds.length > 0 ? route.patternIds.join(', ') : 'none';
      lines.push(`- ${route.path} -> ${route.pageId} [${patterns}]`);
    }
    lines.push('');

    if (reviewPack.data.focusAreas.length > 0) {
      lines.push('## Focus Areas');
      for (const focusArea of reviewPack.data.focusAreas) {
        lines.push(`- ${focusArea}`);
      }
      lines.push('');
    }

    if (reviewPack.data.workflow.length > 0) {
      lines.push('## Review Workflow');
      for (const step of reviewPack.data.workflow) {
        lines.push(`- ${step}`);
      }
      lines.push('');
    }
  }

  lines.push('## Required Setup');
  if (pack.requiredSetup.length === 0) {
    lines.push('- None declared.');
  } else {
    lines.push(...pack.requiredSetup.map(entry => `- ${entry}`));
  }
  lines.push('');

  lines.push('## Allowed Vocabulary');
  if (pack.allowedVocabulary.length === 0) {
    lines.push('- None declared.');
  } else {
    lines.push(...pack.allowedVocabulary.map(entry => `- ${entry}`));
  }
  lines.push('');

  lines.push(...renderList('## Success Checks', pack.successChecks.map(entry => `${entry.label} [${entry.severity}]`)));
  lines.push(...renderList('## Anti-Patterns', pack.antiPatterns.map(entry => `${entry.summary}: ${entry.guidance}`)));
  lines.push(...renderList('## Examples', pack.examples.map(entry => `${entry.label} (${entry.language})`)));

  lines.push('## Token Budget');
  lines.push(`- Target: ${pack.tokenBudget.target}`);
  lines.push(`- Max: ${pack.tokenBudget.max}`);
  lines.push(...pack.tokenBudget.strategy.map(entry => `- ${entry}`));
  lines.push('');

  return lines.join('\n').trimEnd() + '\n';
}

export function resolvePackAdapter(
  target: string | undefined,
  platformType: string | undefined,
): string {
  if (target === 'react' && platformType === 'spa') return 'react-vite';
  if (target === 'react') return 'react-web';
  if (target === 'vue' && platformType === 'spa') return 'vue-vite';
  if (target === 'svelte' && platformType === 'spa') return 'sveltekit';
  if (target) return target;
  return 'generic-web';
}

export function listPackSections(essence: EssenceV3): SectionPackInput[] {
  const declaredSections = essence.blueprint.sections;
  if (declaredSections && declaredSections.length > 0) {
    return declaredSections.map(section => ({
      id: section.id,
      role: section.role,
      shell: section.shell as string,
      description: section.description,
      features: section.features,
      pageIds: section.pages.map(page => page.id),
    }));
  }

  const pages = essence.blueprint.pages ?? [{ id: 'home', layout: ['hero'] }];
  return [{
    id: essence.meta.archetype || 'default',
    role: 'primary',
    shell: (essence.blueprint.shell ?? 'sidebar-main') as string,
    description: `${essence.meta.archetype || 'Application'} section`,
    features: essence.blueprint.features || [],
    pageIds: pages.map(page => page.id),
  }];
}

export function listPackPages(essence: EssenceV3): PagePackInput[] {
  const declaredSections = essence.blueprint.sections;
  if (declaredSections && declaredSections.length > 0) {
    return declaredSections.flatMap(section =>
      section.pages.map(page => ({
        pageId: page.id,
        shell: (page.shell_override ?? section.shell) as string,
        sectionId: section.id,
        sectionRole: section.role,
        features: section.features,
      })),
    );
  }

  const pages = essence.blueprint.pages ?? [{ id: 'home', layout: ['hero'] }];
  const defaultShell = (essence.blueprint.shell ?? 'sidebar-main') as string;
  return pages.map(page => ({
    pageId: page.id,
    shell: (page.shell_override ?? defaultShell) as string,
    sectionId: essence.meta.archetype || 'default',
    sectionRole: 'primary',
    features: essence.blueprint.features || [],
  }));
}

export function buildScaffoldPack(
  appNode: IRAppNode,
  options: ScaffoldPackBuilderOptions = {},
): ScaffoldExecutionPack {
  const routes = summarizeRoutes(appNode);
  const scopePatternIds = [...new Set(routes.flatMap(route => route.patternIds))];

  const pack: ScaffoldExecutionPack = {
    $schema: EXECUTION_PACK_SCHEMA_URLS.scaffold,
    packVersion: '1.0.0',
    packType: 'scaffold',
    objective: options.objective ?? `Scaffold the ${appNode.theme.id} app shell and declared routes.`,
    target: {
      ...DEFAULT_TARGET,
      ...options.target,
    },
    preset: options.preset ?? null,
    scope: {
      appId: appNode.id,
      pageIds: routes.map(route => route.pageId),
      patternIds: scopePatternIds,
    },
    requiredSetup: options.requiredSetup ?? [
      'Treat the declared routes as the topology source of truth.',
      'Preserve the resolved theme and shell contract unless the task explicitly mutates them.',
    ],
    allowedVocabulary: [...new Set([
      appNode.shell.config.type,
      appNode.theme.id,
      appNode.theme.mode,
      ...appNode.features,
      ...scopePatternIds,
    ])],
    examples: options.examples ?? [],
    antiPatterns: options.antiPatterns ?? [],
    successChecks: options.successChecks ?? DEFAULT_SUCCESS_CHECKS,
    tokenBudget: mergeTokenBudget(options.tokenBudget),
    data: {
      shell: appNode.shell.config.type,
      theme: {
        id: appNode.theme.id,
        mode: appNode.theme.mode,
        shape: appNode.theme.shape,
      },
      routing: appNode.routing,
      features: appNode.features,
      routes,
    },
    renderedMarkdown: '',
  };

  pack.renderedMarkdown = renderExecutionPackMarkdown(pack);
  return pack;
}

export function buildSectionPack(
  appNode: IRAppNode,
  input: SectionPackInput,
  options: SectionPackBuilderOptions = {},
): SectionExecutionPack {
  const routes = summarizeSectionRoutes(appNode, input);
  const scopePatternIds = [...new Set(routes.flatMap(route => route.patternIds))];

  const pack: SectionExecutionPack = {
    $schema: EXECUTION_PACK_SCHEMA_URLS.section,
    packVersion: '1.0.0',
    packType: 'section',
    objective: options.objective ?? `Implement the ${input.id} section using the compiled ${input.shell} shell contract.`,
    target: {
      ...DEFAULT_TARGET,
      ...options.target,
    },
    preset: options.preset ?? null,
    scope: {
      appId: appNode.id,
      pageIds: routes.map(route => route.pageId),
      patternIds: scopePatternIds,
    },
    requiredSetup: options.requiredSetup ?? [
      'Use the declared section routes as the source of truth for this slice of the app.',
      'Keep the section shell consistent unless the task explicitly changes the shell contract.',
    ],
    allowedVocabulary: [...new Set([
      input.id,
      input.role,
      input.shell,
      appNode.theme.id,
      appNode.theme.mode,
      ...input.features,
      ...scopePatternIds,
    ])],
    examples: options.examples ?? [],
    antiPatterns: options.antiPatterns ?? [],
    successChecks: options.successChecks ?? DEFAULT_SECTION_SUCCESS_CHECKS,
    tokenBudget: mergeTokenBudget(options.tokenBudget),
    data: {
      sectionId: input.id,
      role: input.role,
      shell: input.shell,
      description: input.description,
      features: input.features,
      theme: {
        id: appNode.theme.id,
        mode: appNode.theme.mode,
        shape: appNode.theme.shape,
      },
      routes,
    },
    renderedMarkdown: '',
  };

  pack.renderedMarkdown = renderExecutionPackMarkdown(pack);
  return pack;
}

export function buildPagePack(
  appNode: IRAppNode,
  input: PagePackInput,
  options: PagePackBuilderOptions = {},
): PageExecutionPack {
  const pageNode = findPageNode(appNode, input.pageId);
  const route = summarizePageRoute(appNode, input.pageId);

  if (!pageNode || !route) {
    throw new Error(`Unknown page for page pack: ${input.pageId}`);
  }

  const patterns = collectPagePatterns(pageNode);

  const pack: PageExecutionPack = {
    $schema: EXECUTION_PACK_SCHEMA_URLS.page,
    packVersion: '1.0.0',
    packType: 'page',
    objective: options.objective ?? `Implement the ${input.pageId} route using the compiled page contract.`,
    target: {
      ...DEFAULT_TARGET,
      ...options.target,
    },
    preset: options.preset ?? null,
    scope: {
      appId: appNode.id,
      pageIds: [route.pageId],
      patternIds: [...new Set(patterns.map(pattern => pattern.id))],
    },
    requiredSetup: options.requiredSetup ?? [
      'Keep the compiled route and shell contract stable for this page.',
      'Treat the listed page patterns as the primary structure for this route.',
    ],
    allowedVocabulary: [...new Set([
      input.pageId,
      input.shell,
      input.sectionId ?? '',
      input.sectionRole ?? '',
      appNode.theme.id,
      appNode.theme.mode,
      ...input.features,
      ...patterns.flatMap(pattern => [pattern.id, pattern.alias, pattern.layout]),
    ].filter(Boolean))],
    examples: options.examples ?? [],
    antiPatterns: options.antiPatterns ?? [],
    successChecks: options.successChecks ?? DEFAULT_PAGE_SUCCESS_CHECKS,
    tokenBudget: mergeTokenBudget(options.tokenBudget),
    data: {
      pageId: route.pageId,
      path: route.path,
      shell: input.shell,
      sectionId: input.sectionId,
      sectionRole: input.sectionRole,
      features: input.features,
      surface: pageNode.surface,
      theme: {
        id: appNode.theme.id,
        mode: appNode.theme.mode,
        shape: appNode.theme.shape,
      },
      wiringSignals: pageNode.wiring?.signals.map(signal => signal.name) ?? [],
      patterns,
    },
    renderedMarkdown: '',
  };

  pack.renderedMarkdown = renderExecutionPackMarkdown(pack);
  return pack;
}

export function buildMutationPack(
  appNode: IRAppNode,
  options: MutationPackBuilderOptions,
): MutationExecutionPack {
  const routes = summarizeRoutes(appNode);
  const scopePatternIds = [...new Set(routes.flatMap(route => route.patternIds))];
  const defaultWorkflow = options.mutationType === 'add-page'
    ? [
        'Declare the new page in the essence before generating code.',
        'Refresh Decantr context so section and page packs include the new route.',
        'Read the relevant section pack and new page pack before implementation.',
      ]
    : [
        'Read the page pack for the route you are modifying first.',
        'Stop and update the essence before changing route, shell, or pattern contracts.',
        'Validate and check drift after code changes complete.',
      ];

  const pack: MutationExecutionPack = {
    $schema: EXECUTION_PACK_SCHEMA_URLS.mutation,
    packVersion: '1.0.0',
    packType: 'mutation',
    objective: options.objective ?? `Execute the ${options.mutationType} workflow against the compiled app contract.`,
    target: {
      ...DEFAULT_TARGET,
      ...options.target,
    },
    preset: options.preset ?? null,
    scope: {
      appId: appNode.id,
      pageIds: routes.map(route => route.pageId),
      patternIds: scopePatternIds,
    },
    requiredSetup: options.requiredSetup ?? [
      'Treat the compiled topology as the source of truth until the essence changes.',
      'Refresh Decantr context after structural mutations so downstream tasks read current packs.',
    ],
    allowedVocabulary: [...new Set([
      options.mutationType,
      appNode.shell.config.type,
      appNode.theme.id,
      appNode.theme.mode,
      ...appNode.features,
      ...scopePatternIds,
    ])],
    examples: options.examples ?? [],
    antiPatterns: options.antiPatterns ?? [],
    successChecks: options.successChecks ?? DEFAULT_MUTATION_SUCCESS_CHECKS[options.mutationType],
    tokenBudget: mergeTokenBudget(options.tokenBudget),
    data: {
      mutationType: options.mutationType,
      shell: appNode.shell.config.type,
      theme: {
        id: appNode.theme.id,
        mode: appNode.theme.mode,
        shape: appNode.theme.shape,
      },
      routing: appNode.routing,
      features: appNode.features,
      routes,
      workflow: options.workflow ?? defaultWorkflow,
    },
    renderedMarkdown: '',
  };

  pack.renderedMarkdown = renderExecutionPackMarkdown(pack);
  return pack;
}

export function buildReviewPack(
  appNode: IRAppNode,
  options: ReviewPackBuilderOptions = {},
): ReviewExecutionPack {
  const routes = summarizeRoutes(appNode);
  const scopePatternIds = [...new Set(routes.flatMap(route => route.patternIds))];
  const reviewType = options.reviewType ?? 'app';
  const focusAreas = options.focusAreas ?? [
    'route-topology',
    'theme-consistency',
    'treatment-usage',
    'accessibility',
    'responsive-design',
  ];
  const workflow = options.workflow ?? [
    'Read the scaffold pack and page packs before evaluating generated code.',
    'Compare findings against the compiled route, shell, and theme contract first.',
    'Escalate contract drift into essence updates when the requested output intentionally changes topology or theme identity.',
  ];

  const pack: ReviewExecutionPack = {
    $schema: EXECUTION_PACK_SCHEMA_URLS.review,
    packVersion: '1.0.0',
    packType: 'review',
    objective: options.objective ?? 'Review generated output against the compiled Decantr contract.',
    target: {
      ...DEFAULT_TARGET,
      ...options.target,
    },
    preset: options.preset ?? null,
    scope: {
      appId: appNode.id,
      pageIds: routes.map(route => route.pageId),
      patternIds: scopePatternIds,
    },
    requiredSetup: options.requiredSetup ?? [
      'Read the compiled scaffold and route packs before reviewing code.',
      'Use concrete evidence from the workspace instead of purely stylistic intuition.',
    ],
    allowedVocabulary: [...new Set([
      reviewType,
      appNode.shell.config.type,
      appNode.theme.id,
      appNode.theme.mode,
      ...appNode.features,
      ...scopePatternIds,
      ...focusAreas,
    ])],
    examples: options.examples ?? [],
    antiPatterns: options.antiPatterns ?? DEFAULT_REVIEW_ANTI_PATTERNS,
    successChecks: options.successChecks ?? DEFAULT_REVIEW_SUCCESS_CHECKS,
    tokenBudget: mergeTokenBudget(options.tokenBudget),
    data: {
      reviewType,
      shell: appNode.shell.config.type,
      theme: {
        id: appNode.theme.id,
        mode: appNode.theme.mode,
        shape: appNode.theme.shape,
      },
      routing: appNode.routing,
      features: appNode.features,
      routes,
      focusAreas,
      workflow,
    },
    renderedMarkdown: '',
  };

  pack.renderedMarkdown = renderExecutionPackMarkdown(pack);
  return pack;
}

export async function compileExecutionPackBundle(
  essence: EssenceFile,
  options: CompileExecutionPackBundleOptions = {},
): Promise<ExecutionPackBundle> {
  const effectiveEssence = isV3(essence) ? essence : migrateV2ToV3(essence);
  const generatedAt = new Date().toISOString();
  const sharedTarget = {
    framework: effectiveEssence.meta.target || null,
    runtime: effectiveEssence.meta.platform.type || null,
    adapter: resolvePackAdapter(effectiveEssence.meta.target, effectiveEssence.meta.platform.type),
  };

  const pipeline = await runPipeline(essence, {
    contentRoot: options.contentRoot,
    overridePaths: options.overridePaths,
    resolver: options.resolver,
  });

  const scaffold = buildScaffoldPack(pipeline.ir, {
    target: sharedTarget,
  });
  const review = buildReviewPack(pipeline.ir, {
    target: sharedTarget,
  });
  const sections = listPackSections(effectiveEssence).map(section => buildSectionPack(pipeline.ir, section, {
    target: sharedTarget,
  }));
  const pages = listPackPages(effectiveEssence).map(page => buildPagePack(pipeline.ir, page, {
    target: sharedTarget,
  }));
  const mutations = (['add-page', 'modify'] as const).map(mutationType => buildMutationPack(pipeline.ir, {
    mutationType,
    target: sharedTarget,
  }));

  const manifest: ExecutionPackManifest = {
    $schema: PACK_MANIFEST_SCHEMA_URL,
    version: '1.0.0',
    generatedAt,
    scaffold: {
      id: 'scaffold',
      markdown: 'scaffold-pack.md',
      json: 'scaffold-pack.json',
    },
    review: {
      id: 'review',
      markdown: 'review-pack.md',
      json: 'review-pack.json',
    },
    sections: listPackSections(effectiveEssence).map(section => ({
      id: section.id,
      markdown: `section-${section.id}-pack.md`,
      json: `section-${section.id}-pack.json`,
      pageIds: section.pageIds,
    })),
    pages: listPackPages(effectiveEssence).map(page => ({
      id: page.pageId,
      markdown: `page-${page.pageId}-pack.md`,
      json: `page-${page.pageId}-pack.json`,
      sectionId: page.sectionId,
      sectionRole: page.sectionRole,
    })),
    mutations: (['add-page', 'modify'] as const).map(mutationType => ({
      id: mutationType,
      markdown: `mutation-${mutationType}-pack.md`,
      json: `mutation-${mutationType}-pack.json`,
      mutationType,
    })),
  };

  return {
    $schema: EXECUTION_PACK_BUNDLE_SCHEMA_URL,
    generatedAt,
    sourceEssenceVersion: essence.version,
    manifest,
    scaffold,
    review,
    sections,
    pages,
    mutations,
  };
}

export function selectExecutionPackFromBundle(
  bundle: ExecutionPackBundle,
  selector: ExecutionPackSelector,
): SelectedExecutionPackResponse | null {
  const id = selector.id ?? null;
  let pack: SelectedExecutionPack | null = null;

  switch (selector.packType) {
    case 'scaffold':
      pack = bundle.scaffold;
      break;
    case 'review':
      pack = bundle.review;
      break;
    case 'section':
      pack = id ? bundle.sections.find((entry) => entry.data.sectionId === id) ?? null : null;
      break;
    case 'page':
      pack = id ? bundle.pages.find((entry) => entry.data.pageId === id) ?? null : null;
      break;
    case 'mutation':
      pack = id ? bundle.mutations.find((entry) => entry.data.mutationType === id) ?? null : null;
      break;
    default:
      pack = null;
      break;
  }

  if (!pack) {
    return null;
  }

  return {
    $schema: SELECTED_EXECUTION_PACK_SCHEMA_URL,
    generatedAt: bundle.generatedAt,
    sourceEssenceVersion: bundle.sourceEssenceVersion,
    manifest: bundle.manifest,
    selector: {
      packType: selector.packType,
      id,
    },
    pack,
  };
}

export async function compileSelectedExecutionPack(
  essence: EssenceFile,
  selector: ExecutionPackSelector,
  options: CompileExecutionPackBundleOptions = {},
): Promise<SelectedExecutionPackResponse | null> {
  const bundle = await compileExecutionPackBundle(essence, options);
  return selectExecutionPackFromBundle(bundle, selector);
}
