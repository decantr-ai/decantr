import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';

export type AmbientContextRole =
  | 'assistant-specific'
  | 'security-data'
  | 'architecture'
  | 'design-system'
  | 'workflow-ci'
  | 'feature-business'
  | 'stale-or-historical'
  | 'unknown';

export interface AmbientContextItem {
  path: string;
  type: 'file' | 'directory';
  role: AmbientContextRole;
  confidence: number;
  sizeBytes: number;
  safeToCite: boolean;
  reason: string;
}

export interface AmbientContextInventory {
  version: 1;
  scannedAt: string;
  items: AmbientContextItem[];
  summary: Record<AmbientContextRole, number>;
  conflicts: string[];
  staleRisks: string[];
}

const SKIP_DIRS = new Set([
  '.decantr',
  '.git',
  '.next',
  '.nuxt',
  '.svelte-kit',
  '.turbo',
  '.vercel',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
]);

const ROOT_CONTEXT_FILES = new Set([
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'README.md',
  'copilot-instructions.md',
  '.cursorrules',
  '.windsurfrules',
  '.cursorignore',
  '.claudeignore',
  'components.json',
  'tailwind.config.js',
  'tailwind.config.ts',
  'tailwind.config.mjs',
  'tailwind.config.cjs',
  'next.config.js',
  'next.config.ts',
  'next.config.mjs',
  'nuxt.config.js',
  'nuxt.config.ts',
  'astro.config.mjs',
  'astro.config.ts',
  'svelte.config.js',
  'svelte.config.ts',
  'angular.json',
  'vite.config.js',
  'vite.config.ts',
  'vitest.config.ts',
  'vitest.config.js',
  'playwright.config.ts',
  'playwright.config.js',
  'tsconfig.json',
  'package.json',
  'decantr.essence.json',
]);

const CONTEXT_DIRECTORIES = new Set([
  '.agents',
  '.claude',
  '.claude/initiatives',
  '.claude/rules',
  '.codex',
  '.cursor',
  '.cursor/rules',
  '.github/workflows',
  'docs',
  'docs/initiatives',
  'initiatives',
  'memory',
  'memories',
  'project-memory',
  'supabase',
]);

const INHERITED_AUTHORITY_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'copilot-instructions.md',
  '.github/copilot-instructions.md',
  '.cursorrules',
  '.windsurfrules',
];

const INHERITED_AUTHORITY_DIRECTORIES = ['.agents', '.claude/rules', '.codex', '.cursor/rules'];

function shouldSkipDir(name: string): boolean {
  return SKIP_DIRS.has(name);
}

function normalizedPath(relPath: string): string {
  return relPath.split(sep).join('/');
}

function isPotentialContextFile(relPath: string, name: string): boolean {
  const normalized = normalizedPath(relPath);
  if (ROOT_CONTEXT_FILES.has(name)) return true;
  if (name.startsWith('.env')) return true;
  if (normalized.startsWith('.claude/')) return true;
  if (normalized.startsWith('.agents/')) return true;
  if (normalized.startsWith('.codex/')) return true;
  if (normalized.startsWith('.cursor/')) return true;
  if (normalized.startsWith('.github/workflows/')) return true;
  if (normalized.startsWith('docs/')) return true;
  if (normalized.startsWith('initiatives/')) return true;
  if (normalized.startsWith('memory/')) return true;
  if (normalized.startsWith('memories/')) return true;
  if (normalized.startsWith('project-memory/')) return true;
  if (normalized.startsWith('supabase/')) return true;
  if (normalized.startsWith('migrations/')) return true;
  if (normalized.startsWith('db/')) return true;
  if (normalized.startsWith('ROLEMIGRATIONS/')) return true;
  if (normalized === 'src/middleware.ts' || normalized === 'middleware.ts') return true;
  if (normalized.includes('/middleware.')) return true;

  const ext = extname(name).toLowerCase();
  return ext === '.md' || ext === '.mdx' || ext === '.sql' || ext === '.yml' || ext === '.yaml';
}

function classifyContext(
  relPath: string,
): Pick<AmbientContextItem, 'role' | 'confidence' | 'reason'> {
  const normalized = normalizedPath(relPath);
  const lower = normalized.toLowerCase();
  const name = basename(normalized);
  const lowerName = name.toLowerCase();

  if (lower === 'decantr.essence.json') {
    return {
      role: 'architecture',
      confidence: 0.82,
      reason: 'existing Decantr contract evidence',
    };
  }

  if (
    lower === '.claude/initiatives' ||
    lower === 'docs/initiatives' ||
    lower === 'initiatives' ||
    lower === 'memory' ||
    lower === 'memories' ||
    lower === 'project-memory' ||
    lower.startsWith('.claude/initiatives/') ||
    lower.startsWith('docs/initiatives/') ||
    lower.startsWith('initiatives/') ||
    lower.startsWith('memory/') ||
    lower.startsWith('memories/') ||
    lower.startsWith('project-memory/') ||
    lower.includes('/feature/') ||
    lower.includes('feature') ||
    lower.includes('rbac') ||
    lower.includes('billing') ||
    lower.includes('admin') ||
    lower.includes('dashboard')
  ) {
    return {
      role: 'feature-business',
      confidence: 0.78,
      reason: 'feature, initiative, memory, or business-domain evidence',
    };
  }

  if (
    lower === '.agents' ||
    lower === '.claude' ||
    lower === '.codex' ||
    lower === '.cursor' ||
    lowerName === 'claude.md' ||
    lowerName === 'agents.md' ||
    lowerName === 'gemini.md' ||
    lowerName === 'copilot-instructions.md' ||
    lower === '.cursorrules' ||
    lower === '.windsurfrules' ||
    lower.startsWith('.claude/') ||
    lower.startsWith('.agents/') ||
    lower.startsWith('.codex/') ||
    lower.startsWith('.cursor/rules/') ||
    lower.includes('/.claude/') ||
    lower.includes('/.agents/') ||
    lower.includes('/.codex/') ||
    lower.includes('/.cursor/rules/')
  ) {
    return {
      role: 'assistant-specific',
      confidence: 0.98,
      reason: 'assistant or AI-agent instruction surface',
    };
  }

  if (
    lower.includes('security') ||
    lower.includes('auth') ||
    lower.includes('rls') ||
    lower.includes('schema') ||
    lower.includes('migration') ||
    lower.startsWith('supabase/') ||
    lower.startsWith('migrations/') ||
    lower.startsWith('db/') ||
    lower.startsWith('rolemigrations/') ||
    lower.includes('middleware.')
  ) {
    return {
      role: 'security-data',
      confidence: 0.9,
      reason: 'security, auth, schema, middleware, or data-governance evidence',
    };
  }

  if (
    lower.includes('design-system') ||
    lower === 'components.json' ||
    lower.startsWith('tailwind.config') ||
    lower.includes('ui-components') ||
    lower.includes('colors') ||
    lower.includes('typography') ||
    lower.includes('spacing')
  ) {
    return {
      role: 'design-system',
      confidence: 0.88,
      reason: 'design system or styling convention evidence',
    };
  }

  if (
    lower.startsWith('.github/workflows/') ||
    lower.includes('workflow') ||
    lower.includes('testing') ||
    lower.includes('deployment') ||
    lower.includes('vitest.config') ||
    lower.includes('playwright.config') ||
    lower === 'package.json'
  ) {
    return {
      role: 'workflow-ci',
      confidence: 0.84,
      reason: 'workflow, CI, deployment, or validation command evidence',
    };
  }

  if (
    lower === 'docs' ||
    lower.includes('architecture') ||
    lower === 'readme.md' ||
    lower.includes('setup') ||
    lower.includes('contributing') ||
    name === 'tsconfig.json' ||
    lower.endsWith('config.ts') ||
    lower.endsWith('config.js') ||
    lower.endsWith('config.mjs')
  ) {
    return {
      role: 'architecture',
      confidence: 0.72,
      reason: 'architecture, setup, or framework configuration evidence',
    };
  }

  if (
    lower.includes('complete') ||
    lower.includes('summary') ||
    lower.includes('deprecated') ||
    lower.includes('legacy') ||
    lower.includes('migration')
  ) {
    return {
      role: 'stale-or-historical',
      confidence: 0.64,
      reason: 'historical or possibly stale project documentation',
    };
  }

  return { role: 'unknown', confidence: 0.35, reason: 'unclassified context candidate' };
}

function isSafeToCite(relPath: string): boolean {
  const lower = normalizedPath(relPath).toLowerCase();
  if (lower.startsWith('.env') && lower !== '.env.example' && lower !== '.env.sample') return false;
  if (lower.includes('secret') || lower.includes('private-key') || lower.includes('credentials')) {
    return false;
  }
  return true;
}

function addDirectoryContext(
  items: AmbientContextItem[],
  projectRoot: string,
  relPath: string,
): void {
  const fullPath = join(projectRoot, relPath);
  if (!existsSync(fullPath)) return;
  const stats = statSync(fullPath);
  const classified = classifyContext(relPath);
  items.push({
    path: normalizedPath(relPath),
    type: 'directory',
    role: classified.role,
    confidence: classified.confidence,
    sizeBytes: stats.size,
    safeToCite: isSafeToCite(relPath),
    reason: classified.reason,
  });
}

function walk(projectRoot: string, dir: string, items: AmbientContextItem[], depth: number): void {
  if (depth > 6) return;

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (shouldSkipDir(entry)) continue;
    const fullPath = join(dir, entry);
    const relPath = normalizedPath(relative(projectRoot, fullPath));
    let stats: ReturnType<typeof statSync>;
    try {
      stats = statSync(fullPath);
    } catch {
      continue;
    }

    if (stats.isDirectory()) {
      if (CONTEXT_DIRECTORIES.has(relPath)) {
        addDirectoryContext(items, projectRoot, relPath);
      }
      walk(projectRoot, fullPath, items, depth + 1);
      continue;
    }

    if (!stats.isFile() || !isPotentialContextFile(relPath, entry)) continue;
    const classified = classifyContext(relPath);
    items.push({
      path: relPath,
      type: 'file',
      role: classified.role,
      confidence: classified.confidence,
      sizeBytes: stats.size,
      safeToCite: isSafeToCite(relPath),
      reason: classified.reason,
    });
  }
}

function collectInheritedAuthority(
  projectRoot: string,
  workspaceRoot: string,
  items: AmbientContextItem[],
): void {
  const appRoot = resolve(projectRoot);
  const stop = resolve(workspaceRoot);
  if (appRoot === stop || !appRoot.startsWith(`${stop}${sep}`)) return;

  let current = dirname(appRoot);
  while (true) {
    for (const path of INHERITED_AUTHORITY_FILES) {
      const absolute = join(current, path);
      if (!existsSync(absolute)) continue;
      const stats = statSync(absolute);
      if (!stats.isFile()) continue;
      const relPath = normalizedPath(relative(appRoot, absolute));
      const classified = classifyContext(relPath);
      items.push({
        path: relPath,
        type: 'file',
        role: classified.role,
        confidence: classified.confidence,
        sizeBytes: stats.size,
        safeToCite: isSafeToCite(relPath),
        reason: `${classified.reason}; inherited from workspace scope`,
      });
    }
    for (const path of INHERITED_AUTHORITY_DIRECTORIES) {
      const absolute = join(current, path);
      if (existsSync(absolute)) walk(appRoot, absolute, items, 0);
    }
    if (current === stop) break;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
}

function summarize(items: AmbientContextItem[]): Record<AmbientContextRole, number> {
  const summary: Record<AmbientContextRole, number> = {
    'assistant-specific': 0,
    'security-data': 0,
    architecture: 0,
    'design-system': 0,
    'workflow-ci': 0,
    'feature-business': 0,
    'stale-or-historical': 0,
    unknown: 0,
  };
  for (const item of items) summary[item.role] += 1;
  return summary;
}

function readSmallText(projectRoot: string, relPath: string): string {
  const fullPath = join(projectRoot, relPath);
  try {
    const stat = statSync(fullPath);
    if (stat.size > 64_000) return '';
    return readFileSync(fullPath, 'utf-8');
  } catch {
    return '';
  }
}

function detectConflicts(projectRoot: string, items: AmbientContextItem[]): string[] {
  const text = items
    .filter(
      (item) =>
        item.type === 'file' &&
        item.safeToCite &&
        item.path.match(/\.(md|mdx|json|ts|js|yml|yaml)$/),
    )
    .slice(0, 80)
    .map((item) => readSmallText(projectRoot, item.path))
    .join('\n')
    .toLowerCase();

  const conflicts: string[] = [];
  const frameworkSignals = [
    ['next', /\bnext\.?js\b|\bapp router\b|\bpages router\b/],
    ['angular', /\bangular\b/],
    ['svelte', /\bsvelte\b|\bsveltekit\b/],
    ['vue', /\bvue\b|\bnuxt\b/],
  ].filter(([, pattern]) => (pattern as RegExp).test(text));

  if (frameworkSignals.length > 1) {
    conflicts.push(
      `Multiple framework doctrines appear in ambient docs: ${frameworkSignals.map(([name]) => name).join(', ')}.`,
    );
  }

  const forbidsTailwind =
    /\b(do not|don't|avoid|forbid|forbidden)\s+use\s+tailwind\b|\bno\s+tailwind\b/.test(text);
  const endorsesTailwind =
    /\btailwind\.config\b|\btailwindcss\b|\b@tailwind\b|\btailwind\s+classes\b/.test(text);
  if (forbidsTailwind && endorsesTailwind) {
    conflicts.push('Ambient docs contain both Tailwind usage and anti-Tailwind language.');
  }

  if (/\bclient component\b/.test(text) && /\bserver components? only\b/.test(text)) {
    conflicts.push('Ambient docs may conflict on client vs server component boundaries.');
  }

  return conflicts;
}

function detectDecantrEssenceStaleRisk(projectRoot: string, items: AmbientContextItem[]): string[] {
  if (!items.some((item) => item.path === 'decantr.essence.json')) return [];

  const content = readSmallText(projectRoot, 'decantr.essence.json');
  if (!content) return [];

  try {
    const essence = JSON.parse(content) as {
      version?: string;
      dna?: { theme?: { id?: string } };
      structure?: unknown;
    };
    const risks: string[] = [];
    if (essence.version !== '4.0.0') {
      risks.push(
        `decantr.essence.json uses Decantr essence version ${essence.version ?? 'unknown'}; run decantr migrate --to v4 or review before treating it as current brownfield doctrine.`,
      );
    }
    if (essence.dna?.theme?.id === 'luminarum' && essence.structure) {
      risks.push(
        'decantr.essence.json looks like an older Decantr default scaffold; verify before importing its theme or page layout as brownfield truth.',
      );
    }
    return risks;
  } catch {
    return [
      'decantr.essence.json could not be parsed during ambient inventory; review before treating it as current doctrine.',
    ];
  }
}

function detectStaleRisks(projectRoot: string, items: AmbientContextItem[]): string[] {
  const pathRisks = items
    .filter(
      (item) =>
        item.role === 'stale-or-historical' ||
        /complete|summary|legacy|deprecated/i.test(item.path),
    )
    .slice(0, 12)
    .map(
      (item) => `${item.path} may be historical; verify before treating it as current doctrine.`,
    );
  return [...pathRisks, ...detectDecantrEssenceStaleRisk(projectRoot, items)];
}

export function scanAmbientContext(
  projectRoot: string,
  workspaceRoot: string = projectRoot,
): AmbientContextInventory {
  const items: AmbientContextItem[] = [];
  walk(projectRoot, projectRoot, items, 0);
  collectInheritedAuthority(projectRoot, workspaceRoot, items);

  const deduped = [...new Map(items.map((item) => [item.path, item])).values()].sort((a, b) =>
    a.path.localeCompare(b.path),
  );

  return {
    version: 1,
    scannedAt: new Date().toISOString(),
    items: deduped,
    summary: summarize(deduped),
    conflicts: detectConflicts(projectRoot, deduped),
    staleRisks: detectStaleRisks(projectRoot, deduped),
  };
}
