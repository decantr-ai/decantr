import { walkIR } from './ir-helpers.js';
import type { IRAppNode, IRNode, IRPageNode, IRPatternNode } from './types.js';

export type ExecutionPackType = 'scaffold' | 'section' | 'page' | 'mutation' | 'review';

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

export function buildScaffoldPack(
  appNode: IRAppNode,
  options: ScaffoldPackBuilderOptions = {},
): ScaffoldExecutionPack {
  const routes = summarizeRoutes(appNode);
  const scopePatternIds = [...new Set(routes.flatMap(route => route.patternIds))];

  const pack: ScaffoldExecutionPack = {
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
