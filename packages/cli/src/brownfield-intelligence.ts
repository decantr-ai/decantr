import {
  type Dirent,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative } from 'node:path';
import type { ComponentsAnalysis } from './analyzers/components.js';
import type { FeaturesAnalysis } from './analyzers/features.js';
import type { LayoutAnalysis } from './analyzers/layout.js';
import type { RoutesAnalysis } from './analyzers/routes.js';
import type { StylingAnalysis } from './analyzers/styling.js';
import type { DetectedProject } from './detect.js';

interface ThemeInventoryEntry {
  id: string;
  selectors: string[];
  tokenCount: number;
  colorTokenCount: number;
  evidence: string[];
}

interface ThemeInventory {
  version: 1;
  generatedAt: string;
  localOnly: true;
  stylingApproach: StylingAnalysis['approach'];
  darkModeDetected: boolean;
  modes: string[];
  variants: ThemeInventoryEntry[];
  tokens: {
    cssVariables: string[];
    colors: Record<string, string>;
  };
  notes: string[];
}

const CSS_SCAN_DIRS = ['src', 'app', 'styles', 'assets'];
const CSS_MAX_FILE_SIZE = 1024 * 1024;

function collectCssFiles(projectRoot: string): string[] {
  const files: string[] = [];
  const seen = new Set<string>();
  const skip = new Set(['node_modules', '.git', '.next', '.decantr', 'dist', 'build', 'coverage']);

  const walk = (dir: string) => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (skip.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.css')) continue;
      try {
        if (statSync(full).size > CSS_MAX_FILE_SIZE) continue;
      } catch {
        continue;
      }
      if (!seen.has(full)) {
        files.push(full);
        seen.add(full);
      }
    }
  };

  for (const dir of CSS_SCAN_DIRS.map((segment) => join(projectRoot, segment))) {
    if (existsSync(dir)) walk(dir);
  }
  return files.sort();
}

function selectorFromMatch(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 120);
}

function isThemeVariantClass(id: string, selector: string): boolean {
  if (
    /^(switcher|toggle|selector|picker|menu|button|btn|control|provider|container|panel|card|icon|label|group|actions?)$/i.test(
      id,
    )
  ) {
    return false;
  }
  const selectors = selector.split(',').map((entry) => entry.trim());
  return selectors.some((entry) =>
    /^(?::root|html|body)?(?:\.[\w-]+)*\.theme-[a-z0-9-]+(?:\s|$|:|\[|\.)/i.test(entry),
  );
}

function createThemeInventory(projectRoot: string, styling: StylingAnalysis): ThemeInventory {
  const files = collectCssFiles(projectRoot);
  const variantMap = new Map<string, ThemeInventoryEntry>();
  const notes: string[] = [];

  const ensureVariant = (id: string, selector: string, evidence: string) => {
    const existing =
      variantMap.get(id) ??
      ({
        id,
        selectors: [],
        tokenCount: 0,
        colorTokenCount: 0,
        evidence: [],
      } satisfies ThemeInventoryEntry);
    if (!existing.selectors.includes(selector)) existing.selectors.push(selector);
    if (!existing.evidence.includes(evidence)) existing.evidence.push(evidence);
    variantMap.set(id, existing);
  };

  for (const file of files) {
    let content = '';
    try {
      content = readFileSync(file, 'utf-8');
    } catch {
      continue;
    }
    const rel = relative(projectRoot, file).replace(/\\/g, '/');
    const selectorRegex =
      /((?:\.[\w-]*dark[\w-]*|\[data-theme=["'][^"']+["']\]|\[data-theme=[^\]]+\]|\[data-[\w-]*theme=["'][^"']+["']\]|html\.dark|:root|\.theme-[\w-]+)[^{]*)\{/g;
    for (const match of content.matchAll(selectorRegex)) {
      const selector = selectorFromMatch(match[1] ?? '');
      if (!selector) continue;
      let id = 'base';
      const dataTheme = selector.match(/data-(?:[\w-]*theme|theme)=["']?([^"'\]\s]+)/i);
      const themeClass = selector.match(/\.theme-([a-z0-9-]+)/i);
      if (/dark/i.test(selector)) id = 'dark';
      if (dataTheme?.[1]) id = dataTheme[1].toLowerCase();
      if (themeClass?.[1]) {
        const classId = themeClass[1].toLowerCase();
        if (!isThemeVariantClass(classId, selector)) continue;
        id = classId;
      }
      if (/^:root(?:\s|$|,)/.test(selector)) id = 'base';
      ensureVariant(id, selector, rel);
    }

    for (const [id, entry] of variantMap) {
      const scopedSelectors = entry.selectors.filter((selector) => content.includes(selector));
      if (scopedSelectors.length === 0) continue;
      const scopedText = scopedSelectors
        .map((selector) => {
          const idx = content.indexOf(selector);
          return idx >= 0 ? content.slice(idx, Math.min(content.length, idx + 3000)) : '';
        })
        .join('\n');
      const tokens = [...scopedText.matchAll(/--[\w-]+\s*:/g)].length;
      const colors = [
        ...scopedText.matchAll(
          /--[\w-]*(?:color|bg|fg|surface|border|accent|primary|secondary)[\w-]*\s*:/gi,
        ),
      ].length;
      variantMap.set(id, {
        ...entry,
        tokenCount: Math.max(entry.tokenCount, tokens),
        colorTokenCount: Math.max(entry.colorTokenCount, colors),
      });
    }
  }

  if (variantMap.size === 0) {
    ensureVariant('base', ':root or existing component styles', 'detected styling inventory');
    notes.push(
      'No explicit theme selectors were found; Decantr will treat the current UI as the existing-app authority.',
    );
  }
  if (styling.darkMode && !variantMap.has('dark')) {
    ensureVariant('dark', 'dark mode signal', 'styling analyzer');
  }

  const variants = [...variantMap.values()].sort((a, b) => a.id.localeCompare(b.id));
  const modes = variants.map((variant) => variant.id);
  const darkModeDetected =
    styling.darkMode || modes.includes('dark') || variants.some((variant) => /dark/i.test(variant.id));
  if (variants.length > 2) {
    notes.push(
      'Multiple theme variants were observed. Essence V4 remains unchanged; variants are reported here for task-time context.',
    );
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    localOnly: true,
    stylingApproach: styling.approach,
    darkModeDetected,
    modes,
    variants,
    tokens: {
      cssVariables: styling.cssVariables,
      colors: styling.colors,
    },
    notes,
  };
}

function readScreenshotEvidence(projectRoot: string): string[] {
  const dir = join(projectRoot, '.decantr', 'evidence', 'screenshots');
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir)
      .filter((file) => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
      .map((file) => `.decantr/evidence/screenshots/${file}`)
      .sort();
  } catch {
    return [];
  }
}

function backlogItems(input: {
  project: DetectedProject;
  routes: RoutesAnalysis;
  components: ComponentsAnalysis;
  styling: StylingAnalysis;
  features: FeaturesAnalysis;
  layout: LayoutAnalysis;
  themeInventory: ThemeInventory;
}): string[] {
  const items = [
    'Confirm the observed personality and visual target in `.decantr/observed-essence.proposal.json` before asking an AI agent to add net-new UI.',
    'Enrich high-traffic routes with precise directives: states, interactions, shared components, responsive behavior, and accessibility expectations.',
    'Run `decantr health --browser --base-url <url> --evidence` after the app is running to attach local screenshot evidence.',
  ];
  if (input.routes.routes.length > 6) {
    items.push(
      'Group mature-app routes into stable zones so future tasks can load focused page or section context instead of the whole app.',
    );
  }
  if (input.components.componentCount > 10) {
    items.push('Identify shared component surfaces and record where reuse beats duplication.');
  }
  if (input.themeInventory.variants.length > 1) {
    items.push(
      'Document which routes use each observed theme variant; do not promote variants into Essence until the contract boundary is reviewed.',
    );
  }
  if (input.features.detected.includes('chat') || input.features.detected.includes('file-upload')) {
    items.push(
      'Enrich AI/chat/upload flows with concrete interaction evidence so agents do not replace product behavior with generic patterns.',
    );
  }
  if (input.styling.approach !== 'decantr-css') {
    items.push(
      `Keep Brownfield implementation in the existing ${input.styling.approach} styling system unless adoption mode changes.`,
    );
  }
  if (input.layout.shellPattern === 'main-only' && input.routes.routes.length > 3) {
    items.push(
      'Review shell ownership; the analyzer did not find a clear nav/sidebar/footer structure for a multi-route app.',
    );
  }
  return items;
}

function renderBacklog(items: string[]): string {
  return [
    '# Decantr Brownfield Enrichment Backlog',
    '',
    'Use this checklist to turn the first Brownfield attach pass into durable task-time context.',
    '',
    ...items.map((item) => `- [ ] ${item}`),
    '',
  ].join('\n');
}

export function writeBrownfieldIntelligenceArtifacts(input: {
  projectRoot: string;
  project: DetectedProject;
  routes: RoutesAnalysis;
  components: ComponentsAnalysis;
  styling: StylingAnalysis;
  layout: LayoutAnalysis;
  features: FeaturesAnalysis;
  dependencies: unknown;
}): {
  intelligencePath: string;
  themeInventoryPath: string;
  backlogPath: string;
} {
  const decantrDir = join(input.projectRoot, '.decantr');
  mkdirSync(decantrDir, { recursive: true });

  const themeInventory = createThemeInventory(input.projectRoot, input.styling);
  const screenshots = readScreenshotEvidence(input.projectRoot);
  const backlog = backlogItems({ ...input, themeInventory });
  const intelligence = {
    version: 1,
    generatedAt: new Date().toISOString(),
    localOnly: true,
    workflow: 'brownfield-attach',
    essenceVersion: '4.0.0',
    project: {
      framework: input.project.framework,
      frameworkVersion: input.project.version ?? null,
      packageManager: input.project.packageManager,
      hasTypeScript: input.project.hasTypeScript,
      hasTailwind: input.project.hasTailwind,
      existingRuleFiles: input.project.existingRuleFiles,
    },
    routeIntelligence: {
      strategy: input.routes.strategy,
      routeCount: input.routes.routes.length,
      routes: input.routes.routes.map((route) => ({
        path: route.path,
        file: route.file,
        hasLayout: route.hasLayout,
      })),
    },
    componentSurface: {
      pageCount: input.components.pageCount,
      componentCount: input.components.componentCount,
      directories: input.components.directories,
    },
    styling: {
      approach: input.styling.approach,
      configFile: input.styling.configFile ?? null,
      darkMode: input.styling.darkMode,
      cssVariableCount: input.styling.cssVariables.length,
      themeInventoryPath: '.decantr/theme-inventory.json',
    },
    layout: input.layout,
    features: input.features,
    dependencies: input.dependencies,
    evidence: {
      screenshotsLocalOnly: true,
      screenshots,
      visualManifestPath: existsSync(join(decantrDir, 'evidence', 'visual-manifest.json'))
        ? '.decantr/evidence/visual-manifest.json'
        : null,
    },
    recommendedNextSteps: backlog,
  };

  const intelligencePath = join(decantrDir, 'brownfield-intelligence.json');
  const themeInventoryPath = join(decantrDir, 'theme-inventory.json');
  const backlogPath = join(decantrDir, 'enrichment-backlog.md');
  writeFileSync(intelligencePath, JSON.stringify(intelligence, null, 2) + '\n', 'utf-8');
  writeFileSync(themeInventoryPath, JSON.stringify(themeInventory, null, 2) + '\n', 'utf-8');
  writeFileSync(backlogPath, renderBacklog(backlog), 'utf-8');
  return { intelligencePath, themeInventoryPath, backlogPath };
}
