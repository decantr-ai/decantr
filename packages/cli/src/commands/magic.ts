import { join } from 'node:path';
import { existsSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import { RegistryClient } from '../registry.js';
import { detectProject } from '../detect.js';
import { mergeWithDefaults } from '../prompts.js';
import type { InitOptions } from '../prompts.js';
import {
  scaffoldProject,
  composeSections,
  deriveZones,
  deriveTransitions,
  generateTopologySection,
  type ArchetypeData,
  type ThemeData,
  type ComposeSectionsResult,
  type PatternSpecSummary,
  type ZoneInput,
  type LayoutItem,
} from '../scaffold.js';
import type { ComposeEntry } from '@decantr/registry';

// ── ANSI helpers ──

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';

function success(text: string): string { return `${GREEN}${text}${RESET}`; }
function error(text: string): string { return `${RED}${text}${RESET}`; }
function dim(text: string): string { return `${DIM}${text}${RESET}`; }
function cyan(text: string): string { return `${CYAN}${text}${RESET}`; }
function magenta(text: string): string { return `${MAGENTA}${text}${RESET}`; }

// ── Prompt Parsing ──

export interface MagicIntent {
  description: string;
  themeHints: string[];
  personalityHints: string[];
  constraints: string[];
  archetype?: string;
}

const THEME_KEYWORDS: Record<string, string[]> = {
  dark: ['dark', 'noir', 'midnight'],
  light: ['light', 'bright', 'white'],
  neon: ['neon', 'cyber', 'cyberpunk', 'synthwave'],
  glass: ['glass', 'glassmorphic', 'frosted', 'translucent'],
  minimal: ['minimal', 'minimalist', 'clean', 'simple'],
  warm: ['warm', 'cozy', 'earthy', 'organic'],
  cool: ['cool', 'cold', 'icy', 'arctic'],
  corporate: ['corporate', 'enterprise', 'business', 'professional'],
  playful: ['playful', 'fun', 'vibrant', 'colorful'],
  brutalist: ['brutalist', 'brutal', 'raw'],
  elegant: ['elegant', 'luxury', 'premium', 'refined'],
  retro: ['retro', 'vintage', 'nostalgic'],
};

const ARCHETYPE_KEYWORDS: Record<string, string[]> = {
  'ai-chatbot': ['chat', 'chatbot', 'conversational', 'ai-chat', 'messaging'],
  'dashboard-analytics': ['dashboard', 'analytics', 'metrics', 'monitoring', 'overview'],
  'marketplace-platform': ['marketplace', 'store', 'shop', 'ecommerce', 'e-commerce'],
  'portfolio-creative': ['portfolio', 'showcase', 'gallery'],
  'blog-editorial': ['blog', 'editorial', 'journal', 'magazine', 'news'],
  'docs-knowledge': ['docs', 'documentation', 'knowledge', 'wiki', 'help-center'],
  'admin-panel': ['admin', 'panel', 'backoffice', 'back-office', 'management'],
  'saas-platform': ['saas', 'platform', 'subscription', 'service'],
  'marketing-saas': ['landing', 'marketing', 'homepage', 'launch'],
  'social-feed': ['social', 'feed', 'community', 'forum'],
  'agent-orchestrator': ['agent', 'orchestrator', 'workflow', 'automation', 'pipeline'],
};

const CONSTRAINT_KEYWORDS = [
  'mobile-first', 'mobile first',
  'accessible', 'accessibility', 'a11y', 'wcag',
  'offline', 'offline-first',
  'real-time', 'realtime', 'real time',
  'responsive',
  'high-contrast',
  'performance', 'fast',
  'seo',
];

/**
 * Parse a natural language prompt into structured intent.
 * Uses keyword matching — no LLM call, works fully offline.
 */
export function parseMagicPrompt(prompt: string): MagicIntent {
  const lower = prompt.toLowerCase();
  // Tokenize for word-boundary matching
  const tokens = lower.split(/[\s,;—–\-]+/).filter(Boolean);

  // Extract theme hints
  const themeHints: string[] = [];
  for (const [hint, keywords] of Object.entries(THEME_KEYWORDS)) {
    if (keywords.some(kw => tokens.includes(kw) || lower.includes(kw))) {
      themeHints.push(hint);
    }
  }

  // Extract archetype hints
  let archetype: string | undefined;
  let bestArchetypeScore = 0;
  for (const [archetypeId, keywords] of Object.entries(ARCHETYPE_KEYWORDS)) {
    const score = keywords.filter(kw => tokens.includes(kw) || lower.includes(kw)).length;
    if (score > bestArchetypeScore) {
      bestArchetypeScore = score;
      archetype = archetypeId;
    }
  }

  // Extract constraints
  const constraints: string[] = [];
  for (const kw of CONSTRAINT_KEYWORDS) {
    if (lower.includes(kw)) {
      // Normalize to kebab-case
      constraints.push(kw.replace(/\s+/g, '-'));
    }
  }

  // Extract personality hints — everything that isn't a recognized keyword
  // Personality is visual direction: "confident", "bold", "sleek", "futuristic"
  const personalityWords = [
    'confident', 'bold', 'sleek', 'futuristic', 'modern', 'classic',
    'edgy', 'sharp', 'soft', 'rounded', 'angular', 'geometric',
    'organic', 'fluid', 'rigid', 'dense', 'airy', 'spacious',
    'technical', 'creative', 'artistic', 'industrial', 'natural',
    'techy', 'hacker', 'startup', 'enterprise',
    'friendly', 'serious', 'formal', 'casual', 'approachable',
    'luxurious', 'premium', 'polished', 'rough', 'gritty',
  ];
  const personalityHints = personalityWords.filter(w => tokens.includes(w));

  // Build description by stripping recognized keywords
  const allRecognized = new Set([
    ...Object.values(THEME_KEYWORDS).flat(),
    ...Object.values(ARCHETYPE_KEYWORDS).flat(),
    ...CONSTRAINT_KEYWORDS.flatMap(c => c.split(/\s+/)),
    ...personalityWords,
  ]);

  // The description is the cleaned-up prompt minus noise words
  const descTokens = tokens.filter(t =>
    !allRecognized.has(t) && t.length > 2
  );
  const description = descTokens.length > 0
    ? descTokens.join(' ')
    : prompt.trim();

  return {
    description,
    themeHints,
    personalityHints,
    constraints,
    archetype,
  };
}

/**
 * Resolve the best theme ID from theme hints.
 * When online, scores registry themes against intent hints by matching
 * personality strings and tags. Falls back to hardcoded map offline.
 */
async function resolveTheme(
  intent: MagicIntent,
  registryClient?: any,
): Promise<{ style: string; mode: 'dark' | 'light' | 'auto' }> {
  const hints = intent.themeHints;

  // Try registry-based scoring first
  if (registryClient) {
    try {
      const themes = await registryClient.fetchThemes();
      if (themes && themes.length > 0) {
        const scored = themes.map((t: any) => {
          let score = 0;
          const personality = (t.personality || '').toLowerCase();
          const tags = (t.tags || []).map((tag: string) => tag.toLowerCase());
          for (const hint of intent.themeHints) {
            if (personality.includes(hint)) score += 3;
            if (tags.some((tag: string) => tag.includes(hint))) score += 2;
          }
          if (intent.themeHints.includes('dark') && t.modes?.includes('dark')) score += 1;
          if (intent.themeHints.includes('light') && t.modes?.includes('light')) score += 1;
          return { id: t.id || t.slug, score, modes: t.modes };
        }).sort((a: any, b: any) => b.score - a.score);

        if (scored[0] && scored[0].score > 0) {
          const mode: 'dark' | 'light' | 'auto' = intent.themeHints.includes('light') ? 'light'
            : intent.themeHints.includes('dark') ? 'dark'
            : scored[0].modes?.includes('dark') ? 'dark' : 'light';
          return { style: scored[0].id, mode };
        }
      }
    } catch { /* fall through to hardcoded map */ }
  }

  // Hardcoded map as offline fallback
  let mode: 'dark' | 'light' | 'auto' = 'dark';
  if (hints.includes('light')) mode = 'light';

  // Map hints to known theme IDs
  if (hints.includes('neon') || hints.includes('glass')) return { style: 'obsidianite', mode };
  if (hints.includes('warm') || hints.includes('elegant')) return { style: 'aurealis', mode };
  if (hints.includes('cool') || hints.includes('minimal')) return { style: 'glacialis', mode };
  if (hints.includes('brutalist')) return { style: 'ferrocrete', mode };
  if (hints.includes('corporate')) return { style: 'luminarum', mode };
  if (hints.includes('playful')) return { style: 'solstice', mode };
  if (hints.includes('retro')) return { style: 'oxidian', mode };

  // Default
  return { style: 'luminarum', mode };
}

/**
 * Build a personality narrative from hints and theme context.
 */
function buildPersonality(intent: MagicIntent): string[] {
  if (intent.personalityHints.length > 0) {
    return intent.personalityHints;
  }
  // Synthesize a default from theme hints
  if (intent.themeHints.includes('neon')) return ['bold', 'futuristic'];
  if (intent.themeHints.includes('minimal')) return ['clean', 'focused'];
  if (intent.themeHints.includes('corporate')) return ['professional', 'reliable'];
  if (intent.themeHints.includes('playful')) return ['friendly', 'energetic'];
  return ['professional'];
}

/**
 * Build a richer personality string from intent, blueprint, and theme data.
 */
function buildRichPersonality(
  intent: MagicIntent,
  blueprintData?: any,
  themeData?: any,
): string {
  const parts: string[] = [];
  if (blueprintData?.personality && typeof blueprintData.personality === 'string')
    parts.push(blueprintData.personality);
  if (intent.personalityHints.length > 0 && !parts.some(p => intent.personalityHints.every(h => p.toLowerCase().includes(h))))
    parts.push(`Visual character: ${intent.personalityHints.join(', ')}.`);
  if (themeData?.personality && !parts.some(p => p.toLowerCase().includes(themeData.personality.toLowerCase())))
    parts.push(`Theme influence: ${themeData.personality}.`);
  if (parts.length === 0)
    parts.push(`Modern, production-ready ${intent.description}. Clean typography, intentional spacing, polished interactions.`);
  return parts.join(' ');
}

// ── Magic Options ──

export interface MagicOptions {
  dryRun?: boolean;
  offline?: boolean;
  registry?: string;
}

// ── Main Command ──

export async function cmdMagic(prompt: string, projectRoot: string, options: MagicOptions): Promise<void> {
  console.log('');
  console.log(`${MAGENTA}${BOLD} Decantr Magic${RESET}`);
  console.log('');

  // 1. Parse the prompt
  const intent = parseMagicPrompt(prompt);

  console.log(`${BOLD} Parsed intent:${RESET}`);
  console.log(`   Description:  ${intent.description}`);
  if (intent.themeHints.length > 0) {
    console.log(`   Theme:        ${intent.themeHints.join(', ')}`);
  }
  if (intent.personalityHints.length > 0) {
    console.log(`   Personality:  ${intent.personalityHints.join(', ')}`);
  }
  if (intent.constraints.length > 0) {
    console.log(`   Constraints:  ${intent.constraints.join(', ')}`);
  }
  if (intent.archetype) {
    console.log(`   Archetype:    ${intent.archetype}`);
  }
  console.log('');

  // 2. Check for existing essence
  const essencePath = join(projectRoot, 'decantr.essence.json');
  if (existsSync(essencePath)) {
    console.log(error('  decantr.essence.json already exists in this directory.'));
    console.log(dim('  Remove it first or use a different directory.'));
    process.exitCode = 1;
    return;
  }

  // 3. Create registry client
  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: options.registry,
    offline: options.offline,
  });

  const apiAvailable = await registryClient.checkApiAvailability();

  // 4. Try to match a blueprint
  let matchedBlueprint: string | undefined;
  let blueprintData: Record<string, any> | undefined;

  if (apiAvailable) {
    console.log(dim('  Searching registry for matching blueprints...'));
    const blueprintsResult = await registryClient.fetchBlueprints();
    const blueprints = blueprintsResult.data.items;

    // Score blueprints against the prompt
    const scored = blueprints.map(bp => {
      const bpLower = `${bp.id} ${bp.name || ''} ${bp.description || ''}`.toLowerCase();
      let score = 0;

      // Match archetype hint against blueprint ID/description
      if (intent.archetype) {
        const archetypeTokens = intent.archetype.split('-');
        for (const token of archetypeTokens) {
          if (bpLower.includes(token)) score += 3;
        }
      }

      // Match description words
      const descTokens = intent.description.toLowerCase().split(/\s+/);
      for (const token of descTokens) {
        if (token.length > 2 && bpLower.includes(token)) score += 2;
      }

      // Match theme hints
      for (const hint of intent.themeHints) {
        if (bpLower.includes(hint)) score += 1;
      }

      return { id: bp.id, name: bp.name, description: bp.description, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    if (best && best.score >= 4) {
      matchedBlueprint = best.id;
      console.log('');
      console.log(`${BOLD} Matched blueprint:${RESET} ${cyan(best.id)}`);
      if (best.description) {
        console.log(`   ${dim(best.description)}`);
      }

      // Fetch the full blueprint
      const bpResult = await registryClient.fetchBlueprint(best.id);
      if (bpResult) {
        const rawBp = bpResult.data as Record<string, unknown>;
        blueprintData = (rawBp.data ?? rawBp) as Record<string, any>;
      }
    } else {
      console.log(dim('  No strong blueprint match found. Using archetype-based scaffold.'));
    }
  } else {
    console.log(dim('  Offline mode — using defaults.'));
  }

  // 5. Resolve theme and build options
  const themeResolved = await resolveTheme(intent, apiAvailable ? registryClient : undefined);
  const personality = buildPersonality(intent);

  const initOptions: InitOptions = {
    blueprint: matchedBlueprint,
    archetype: intent.archetype || blueprintData?.compose?.[0]?.archetype || blueprintData?.compose?.[0] || 'dashboard-analytics',
    theme: themeResolved.style,
    mode: themeResolved.mode,
    shape: 'rounded',
    target: 'react',
    guard: 'guided',
    density: intent.constraints.includes('mobile-first') ? 'compact' : 'comfortable',
    shell: 'sidebar-main',
    personality,
    features: [],
    existing: false,
  };

  // Apply blueprint overrides
  if (blueprintData) {
    if (blueprintData.theme?.id) initOptions.theme = blueprintData.theme.id;
    if (blueprintData.theme?.mode) initOptions.mode = blueprintData.theme.mode;
    if (blueprintData.theme?.shape) initOptions.shape = blueprintData.theme.shape;
    if (blueprintData.personality) {
      initOptions.personality = typeof blueprintData.personality === 'string'
        ? [blueprintData.personality]
        : blueprintData.personality;
    }
    // Merge prompt personality into blueprint personality
    if (intent.personalityHints.length > 0) {
      const merged = new Set([...initOptions.personality, ...intent.personalityHints]);
      initOptions.personality = [...merged];
    }
  }

  // Map constraints to essence options
  if (intent.constraints.includes('accessible')) {
    initOptions.accessibility = { wcag_level: 'AA' };
  }
  if (intent.constraints.includes('mobile-first')) {
    initOptions.density = 'comfortable';
  }
  if (intent.constraints.includes('real-time')) {
    initOptions.features = [...(initOptions.features || []), 'websockets', 'live-updates'];
  }

  // Dry run — show what would be created and exit
  if (options.dryRun) {
    const personalityStr = initOptions.personality.join('. ');
    console.log('');
    console.log(`${BOLD}decantr magic preview${RESET}`);
    console.log('\u2500'.repeat(60));
    console.log(`  Blueprint:    ${matchedBlueprint || 'none (archetype-direct)'}`);
    console.log(`  Theme:        ${initOptions.theme} (${initOptions.mode}${initOptions.shape ? ', ' + initOptions.shape : ''})`);
    console.log(`  Archetype:    ${initOptions.archetype || 'auto-detected'}`);
    console.log(`  Personality:  ${personalityStr.slice(0, 80)}${personalityStr.length > 80 ? '...' : ''}`);
    console.log(`  WCAG:         ${initOptions.accessibility?.wcag_level || 'AA'} | Density: ${initOptions.density} | Guard: ${initOptions.guard}`);
    if (intent.constraints.length > 0)
      console.log(`  Constraints:  ${intent.constraints.join(', ')}`);
    console.log('\u2500'.repeat(60));
    return;
  }

  console.log('');

  // 6. Scaffold — reuse cmdInit's registry fetch + scaffold flow
  const detected = detectProject(projectRoot);

  let archetypeData: ArchetypeData | undefined;
  let composedSections: ComposeSectionsResult | undefined;
  let routeMap: Record<string, { section: string; page: string }> | undefined;
  let patternSpecs: Record<string, PatternSpecSummary> | undefined;
  let topologyMarkdown = '';
  let themeData: ThemeData | undefined;
  let registrySource: 'api' | 'cache' = apiAvailable ? 'api' : 'cache';

  // If we have a blueprint with compose entries, do full composition
  if (blueprintData?.compose && blueprintData.compose.length > 0) {
    const entries: ComposeEntry[] = blueprintData.compose;

    // Fetch archetypes sequentially
    const archetypeMap = new Map<string, ArchetypeData | null>();
    for (const entry of entries) {
      const id = typeof entry === 'string' ? entry : entry.archetype;
      const result = await registryClient.fetchArchetype(id);
      if (result) {
        const raw = result.data as Record<string, unknown>;
        archetypeMap.set(id, (raw.data ?? raw) as ArchetypeData);
      } else {
        archetypeMap.set(id, null);
      }
    }

    // Compose sections
    composedSections = composeSections(entries, archetypeMap, blueprintData.overrides);

    // Set primary archetype
    const primaryId = typeof entries[0] === 'string' ? entries[0] : entries[0].archetype;
    initOptions.archetype = primaryId;
    if (composedSections.sections[0]?.shell) {
      initOptions.shell = composedSections.sections[0].shell;
    }

    // Build archetypeData for scaffoldProject (flattened view)
    const allPages = composedSections.sections.flatMap(s =>
      s.pages.map(p => ({
        id: p.id,
        shell: p.shell_override || s.shell,
        default_layout: p.layout as LayoutItem[],
      }))
    );
    archetypeData = {
      id: primaryId,
      pages: allPages,
      features: composedSections.features,
    };

    // Map routes
    routeMap = {};
    if (blueprintData.routes) {
      for (const [path, entry] of Object.entries(blueprintData.routes as Record<string, any>)) {
        if (entry.archetype && entry.page) {
          routeMap[path] = { section: entry.archetype, page: entry.page };
          const section = composedSections.sections.find(s => s.id === entry.archetype);
          const page = section?.pages.find(p => p.id === entry.page);
          if (page) page.route = path;
        }
      }
    }

    // Fetch pattern specs
    const allPatternIds = new Set<string>();
    for (const section of composedSections.sections) {
      for (const page of section.pages) {
        if (page.patterns) {
          for (const ref of page.patterns) allPatternIds.add(ref.pattern);
        }
        for (const item of page.layout) {
          if (typeof item === 'string') allPatternIds.add(item);
        }
      }
    }

    patternSpecs = {};
    for (const pid of allPatternIds) {
      try {
        const result = await registryClient.fetchPattern(pid);
        if (result) {
          const raw = result.data as Record<string, unknown>;
          const inner = (raw.data ?? raw) as Record<string, any>;
          const defaultPreset = inner.default_preset || 'standard';
          const preset = inner.presets?.[defaultPreset];
          patternSpecs[pid] = {
            description: (inner.description as string) || '',
            components: (inner.components as string[]) || [],
            slots: preset?.layout?.slots || {},
          };
        }
      } catch { /* skip */ }
    }

    // Derive topology
    const zoneInputs: ZoneInput[] = [];
    for (const entry of entries) {
      const arcId = typeof entry === 'string' ? entry : entry.archetype;
      const archData = archetypeMap.get(arcId);
      if (archData) {
        const explicitRole = typeof entry === 'object' && 'role' in entry ? (entry as any).role : undefined;
        zoneInputs.push({
          archetypeId: arcId,
          role: explicitRole || (archData as any).role || 'auxiliary',
          shell: (archData.pages as any)?.[0]?.shell || initOptions.shell,
          features: archData.features || [],
          description: archData.description || '',
        });
      }
    }
    const zones = deriveZones(zoneInputs);
    const transitions = deriveTransitions(zones);
    if (zones.length > 0) {
      topologyMarkdown = generateTopologySection(
        {
          intent: blueprintData.description || initOptions.archetype || 'Application',
          zones,
          transitions,
          entryPoints: {
            anonymous: '/',
            authenticated: `/${archetypeData.pages?.[0]?.id || 'home'}`,
          },
        },
        initOptions.personality,
      );
    }

    // Print composition summary
    console.log(`${BOLD} Composition:${RESET}`);
    console.log(`   Sections:  ${composedSections.sections.length} (${composedSections.sections.map(s => s.id).join(', ')})`);
    const totalRoutes = Object.keys(routeMap).length;
    if (totalRoutes > 0) console.log(`   Routes:    ${totalRoutes}`);
    if (composedSections.features.length > 0) {
      console.log(`   Features:  ${composedSections.features.join(', ')}`);
    }
    console.log('');
  } else if (intent.archetype && apiAvailable) {
    // No blueprint match — try direct archetype fetch
    const archResult = await registryClient.fetchArchetype(initOptions.archetype!);
    if (archResult) {
      const raw = archResult.data as Record<string, unknown>;
      archetypeData = (raw.data ?? raw) as ArchetypeData;
    }
  }

  // Fetch theme data (single fetch — theme now contains all visual treatment data)
  if (apiAvailable && initOptions.theme) {
    const themeResult = await registryClient.fetchTheme(initOptions.theme);
    if (themeResult) {
      const rawTheme = themeResult.data as Record<string, unknown>;
      const theme = (rawTheme.data ?? rawTheme) as Record<string, any>;
      themeData = {
        seed: theme.seed,
        palette: theme.palette,
        tokens: theme.tokens,
        cvd_support: theme.cvd_support,
        typography: theme.typography,
        motion: theme.motion,
        decorators: theme.decorators,
        treatments: theme.treatments,
        spatial: theme.spatial,
        radius: theme.radius,
        shell: theme.shell,
        effects: theme.effects,
        compositions: theme.compositions,
        pattern_preferences: theme.pattern_preferences,
      };
    }
  }

  // Build rich personality from all available data
  const richPersonality = buildRichPersonality(intent, blueprintData, themeData);
  if (richPersonality) {
    initOptions.personality = [richPersonality];
  }

  // Scaffold
  console.log(`${BOLD} Scaffolding...${RESET}`);

  const result = await scaffoldProject(
    projectRoot,
    initOptions,
    detected,
    registryClient,
    archetypeData,
    registrySource,
    themeData,
    topologyMarkdown,
    composedSections,
    routeMap,
    patternSpecs,
    blueprintData,
  );

  // 7. Print summary
  console.log(`   ${success('Created')} decantr.essence.json (V3.1)`);
  console.log(`   ${success('Created')} DECANTR.md`);

  if (result.cssFiles && result.cssFiles.length > 0) {
    for (const cssFile of result.cssFiles) {
      const name = cssFile.split('/').pop();
      console.log(`   ${success('Created')} src/styles/${name}`);
    }
  }

  if (result.contextFiles && result.contextFiles.length > 0) {
    const sectionContexts = result.contextFiles.filter(f => f.includes('section-'));
    const otherContexts = result.contextFiles.filter(f => !f.includes('section-'));
    if (sectionContexts.length > 0) {
      console.log(`   ${success('Created')} ${sectionContexts.length} section context(s)`);
    }
    for (const f of otherContexts) {
      const name = f.split('/').pop();
      if (name && !name.startsWith('task-') && !name.startsWith('essence-summary')) {
        console.log(`   ${success('Created')} ${name}`);
      }
    }
  }

  if (result.gitignoreUpdated) {
    console.log(`   ${dim('.gitignore updated')}`);
  }

  // Quality summary
  const contextDir = join(projectRoot, '.decantr', 'context');
  let sectionCount = 0;
  try {
    const files = await fs.readdir(contextDir);
    sectionCount = files.filter((f: string) => f.startsWith('section-')).length;
  } catch {}

  const treatmentsPath = join(projectRoot, 'src', 'styles', 'treatments.css');
  let hasLayers = false;
  try {
    const css = await fs.readFile(treatmentsPath, 'utf-8');
    hasLayers = css.includes('@layer');
  } catch {}

  console.log(`\n${GREEN}${BOLD}Quality summary:${RESET}`);
  console.log(`  Context files:   ${sectionCount} sections + scaffold.md + DECANTR.md`);
  console.log(`  CSS:             tokens.css + treatments.css + global.css`);
  console.log(`  @layer cascade:  ${hasLayers ? GREEN + 'yes' + RESET : YELLOW + 'missing' + RESET}`);

  console.log('');
  console.log(`${BOLD} Ready!${RESET} Next steps:`);
  console.log(`   1. Read ${cyan('DECANTR.md')} to understand the design system`);
  console.log(`   2. Read ${cyan('.decantr/context/scaffold.md')} for the full app overview`);
  console.log(`   3. Start building pages from the route map`);
  console.log('');
}
