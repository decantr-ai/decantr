import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { validateEssence, evaluateGuard } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';
import { resolvePatternPreset } from '@decantr/registry';
import type { Pattern } from '@decantr/registry';
import { validateStringArg, fuzzyScore, getAPIClient } from './helpers.js';

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

export const TOOLS = [
  {
    name: 'decantr_read_essence',
    title: 'Read Essence',
    description: 'Read and return the current decantr.essence.json file from the working directory.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Optional path to essence file. Defaults to ./decantr.essence.json.' },
      },
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_validate',
    title: 'Validate Essence',
    description: 'Validate a decantr.essence.json file against the schema and guard rules. Returns errors and warnings.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Path to essence file. Defaults to ./decantr.essence.json.' },
      },
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_search_registry',
    title: 'Search Registry',
    description: 'Search the Decantr community content registry for patterns, archetypes, recipes, and styles.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query (e.g. "kanban", "neon", "dashboard")' },
        type: { type: 'string', description: 'Filter by type: pattern, archetype, recipe, style' },
      },
      required: ['query'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_resolve_pattern',
    title: 'Resolve Pattern',
    description: 'Get full pattern details including layout spec, components, presets, and code examples.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Pattern ID (e.g. "hero", "data-table", "kpi-grid")' },
        preset: { type: 'string', description: 'Optional preset name (e.g. "product", "content")' },
        namespace: { type: 'string', description: 'Namespace (default: "@official")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_resolve_archetype',
    title: 'Resolve Archetype',
    description: 'Get archetype details including default pages, layouts, features, and suggested theme.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Archetype ID (e.g. "saas-dashboard", "ecommerce")' },
        namespace: { type: 'string', description: 'Namespace (default: "@official")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_resolve_recipe',
    title: 'Resolve Recipe',
    description: 'Get recipe decoration rules including shell styles, spatial hints, visual effects, and pattern preferences.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Recipe ID (e.g. "auradecantism")' },
        namespace: { type: 'string', description: 'Namespace (default: "@official")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_resolve_blueprint',
    title: 'Resolve Blueprint',
    description: 'Get a blueprint (app composition) with its archetype list, suggested theme, personality traits, and full page structure.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Blueprint ID (e.g. "saas-dashboard", "ecommerce", "portfolio")' },
        namespace: { type: 'string', description: 'Namespace (default: "@official")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_suggest_patterns',
    title: 'Suggest Patterns',
    description: 'Given a page description, suggest appropriate patterns from the registry. Returns ranked pattern matches with layout specs and component lists.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        description: { type: 'string', description: 'Description of the page or section (e.g. "dashboard with metrics and charts", "settings form with toggles")' },
      },
      required: ['description'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_check_drift',
    title: 'Check Drift',
    description: 'Check if code changes violate the design intent captured in the Essence spec. Returns guard rule violations with severity and fix suggestions.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Path to essence file. Defaults to ./decantr.essence.json.' },
        page_id: { type: 'string', description: 'Page ID being modified (e.g. "overview", "settings")' },
        components_used: {
          type: 'array' as const,
          items: { type: 'string' },
          description: 'List of component names used in the generated code',
        },
        theme_used: { type: 'string', description: 'Theme/style name used in the generated code' },
      },
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_create_essence',
    title: 'Create Essence',
    description: 'Generate a valid Essence spec skeleton from a project description. Returns a structured essence.json template based on the closest matching archetype and blueprint.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        description: { type: 'string', description: 'Natural language project description (e.g. "SaaS dashboard with analytics, user management, and billing")' },
        framework: { type: 'string', description: 'Target framework (e.g. "react", "vue", "svelte"). Defaults to "react".' },
      },
      required: ['description'],
    },
    annotations: READ_ONLY,
  },
];

export async function handleTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiClient = getAPIClient();

  switch (name) {
    case 'decantr_read_essence': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      try {
        const raw = await readFile(essencePath, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        return { error: `Could not read essence file: ${(e as Error).message}` };
      }
    }

    case 'decantr_validate': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      let essence: unknown;
      try {
        essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      } catch (e) {
        return { valid: false, errors: [`Could not read: ${(e as Error).message}`], guardViolations: [] };
      }
      const result = validateEssence(essence);

      let guardViolations: unknown[] = [];
      if (result.valid && typeof essence === 'object' && essence !== null) {
        try {
          guardViolations = evaluateGuard(essence as EssenceFile, {});
        } catch { /* guard evaluation is optional */ }
      }

      return { ...result, guardViolations };
    }

    case 'decantr_search_registry': {
      const err = validateStringArg(args, 'query');
      if (err) return { error: err };
      try {
        const response = await apiClient.search({
          q: args.query as string,
          type: args.type as string | undefined,
        });
        return {
          total: response.total,
          results: response.results.map((r) => ({
            type: r.type,
            id: r.slug,
            namespace: r.namespace,
            name: r.name,
            description: r.description,
            install: `decantr get ${r.type} ${r.slug}`,
          })),
        };
      } catch (e) {
        return { error: `Search failed: ${(e as Error).message}` };
      }
    }

    case 'decantr_resolve_pattern': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const pattern = await apiClient.getPattern(namespace, args.id as string);
        const result: Record<string, unknown> = { found: true, ...pattern };
        if (args.preset && typeof args.preset === 'string') {
          const preset = resolvePatternPreset(pattern as Pattern, args.preset);
          if (preset) result.resolvedPreset = preset;
        }
        return result;
      } catch {
        return { found: false, message: `Pattern "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_resolve_archetype': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const archetype = await apiClient.getArchetype(namespace, args.id as string);
        return { found: true, ...archetype };
      } catch {
        return { found: false, message: `Archetype "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_resolve_recipe': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const recipe = await apiClient.getRecipe(namespace, args.id as string);
        return { found: true, ...recipe };
      } catch {
        return { found: false, message: `Recipe "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_resolve_blueprint': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const blueprint = await apiClient.getBlueprint(namespace, args.id as string);
        return { found: true, ...blueprint };
      } catch {
        return { found: false, message: `Blueprint "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_suggest_patterns': {
      const err = validateStringArg(args, 'description');
      if (err) return { error: err };
      const desc = (args.description as string).toLowerCase();

      try {
        const patternsResponse = await apiClient.listContent<Pattern>('patterns', {
          namespace: '@official',
          limit: 100,
        });

        const suggestions: { id: string; score: number; name: string; description: string; components: string[]; layout: string }[] = [];

        for (const p of patternsResponse.items) {
          const searchable = [
            p.name || '',
            p.description || '',
            ...(p.components || []),
            ...(p.tags || []),
          ].join(' ').toLowerCase();

          let score = 0;
          const words = desc.split(/\s+/);
          for (const word of words) {
            if (word.length < 3) continue;
            if (searchable.includes(word)) score += 10;
          }

          // Boost for common keyword associations
          if (desc.includes('dashboard') && ['kpi-grid', 'chart-grid', 'data-table', 'filter-bar'].includes(p.id)) score += 20;
          if (desc.includes('metric') && p.id === 'kpi-grid') score += 15;
          if (desc.includes('chart') && p.id === 'chart-grid') score += 15;
          if (desc.includes('table') && p.id === 'data-table') score += 15;
          if (desc.includes('form') && p.id === 'form-sections') score += 15;
          if (desc.includes('setting') && p.id === 'form-sections') score += 15;
          if (desc.includes('landing') && ['hero', 'cta-section', 'card-grid'].includes(p.id)) score += 20;
          if (desc.includes('hero') && p.id === 'hero') score += 20;
          if (desc.includes('ecommerce') && ['card-grid', 'filter-bar', 'detail-header'].includes(p.id)) score += 15;
          if (desc.includes('product') && p.id === 'card-grid') score += 15;
          if (desc.includes('feed') && p.id === 'activity-feed') score += 15;
          if (desc.includes('filter') && p.id === 'filter-bar') score += 15;
          if (desc.includes('search') && p.id === 'filter-bar') score += 10;

          if (score > 0) {
            const preset = p.presets ? Object.values(p.presets)[0] : null;
            suggestions.push({
              id: p.id,
              score,
              name: p.name || p.id,
              description: p.description || '',
              components: p.components || [],
              layout: preset?.layout ? preset.layout.layout : 'grid',
            });
          }
        }

        suggestions.sort((a, b) => b.score - a.score);

        return {
          query: args.description,
          suggestions: suggestions.slice(0, 5),
          total: suggestions.length,
        };
      } catch (e) {
        return { error: `Could not fetch patterns: ${(e as Error).message}` };
      }
    }

    case 'decantr_check_drift': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      let essence: EssenceFile;
      try {
        essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      } catch (e) {
        return { error: `Could not read essence: ${(e as Error).message}` };
      }

      const validation = validateEssence(essence);
      if (!validation.valid) {
        return { drifted: true, reason: 'invalid_essence', errors: validation.errors };
      }

      const violations: { rule: string; severity: string; message: string }[] = [];

      if (args.theme_used && typeof args.theme_used === 'string') {
        const expectedTheme = (essence as Record<string, unknown>).theme as Record<string, string> | undefined;
        if (expectedTheme?.style && args.theme_used !== expectedTheme.style) {
          violations.push({
            rule: 'theme-match',
            severity: 'critical',
            message: `Theme drift: code uses "${args.theme_used}" but Essence specifies "${expectedTheme.style}". Do not switch themes.`,
          });
        }
      }

      if (args.page_id && typeof args.page_id === 'string') {
        const structure = (essence as Record<string, unknown>).structure as Array<{ id: string }> | undefined;
        if (structure && !structure.find(p => p.id === args.page_id)) {
          violations.push({
            rule: 'page-exists',
            severity: 'critical',
            message: `Page "${args.page_id}" not found in Essence structure. Add it to the Essence before generating code for it.`,
          });
        }
      }

      try {
        const guardViolations = evaluateGuard(essence, {
          pageId: args.page_id as string | undefined,
        });
        for (const gv of guardViolations) {
          violations.push({
            rule: (gv as Record<string, string>).rule || 'guard',
            severity: (gv as Record<string, string>).severity || 'warning',
            message: (gv as Record<string, string>).message || 'Guard violation',
          });
        }
      } catch { /* guard is optional */ }

      return {
        drifted: violations.length > 0,
        violations,
        checkedAgainst: essencePath,
      };
    }

    case 'decantr_create_essence': {
      const err = validateStringArg(args, 'description');
      if (err) return { error: err };
      const desc = (args.description as string).toLowerCase();
      const framework = (args.framework as string) || 'react';

      const archetypeScores: { id: string; score: number }[] = [];
      const archetypeIds = [
        'saas-dashboard', 'ecommerce', 'portfolio', 'content-site',
        'financial-dashboard', 'cloud-platform', 'gaming-platform',
        'ecommerce-admin', 'workbench',
      ];

      for (const id of archetypeIds) {
        let score = 0;
        if (desc.includes('dashboard') && id.includes('dashboard')) score += 20;
        if (desc.includes('saas') && id.includes('saas')) score += 20;
        if (desc.includes('ecommerce') && id.includes('ecommerce')) score += 20;
        if (desc.includes('shop') && id.includes('ecommerce')) score += 15;
        if (desc.includes('portfolio') && id.includes('portfolio')) score += 20;
        if (desc.includes('blog') && id.includes('content')) score += 15;
        if (desc.includes('content') && id.includes('content')) score += 15;
        if (desc.includes('finance') && id.includes('financial')) score += 20;
        if (desc.includes('cloud') && id.includes('cloud')) score += 15;
        if (desc.includes('game') && id.includes('gaming')) score += 15;
        if (desc.includes('admin') && id.includes('admin')) score += 15;
        if (desc.includes('analytics') && id.includes('dashboard')) score += 10;
        if (desc.includes('tool') && id === 'workbench') score += 10;
        if (score > 0) archetypeScores.push({ id, score });
      }

      archetypeScores.sort((a, b) => b.score - a.score);
      const bestMatch = archetypeScores[0]?.id || 'saas-dashboard';

      // Try to fetch archetype from API for richer skeleton
      let pages: Array<{ id: string; shell: string; default_layout: string[] }> | undefined;
      let features: string[] = [];

      try {
        const archetype = await apiClient.getArchetype('@official', bestMatch);
        pages = archetype.pages as Array<{ id: string; shell: string; default_layout: string[] }>;
        features = archetype.features || [];
      } catch {
        // API unavailable, use minimal defaults
      }

      const structure = (pages || [{ id: 'home', shell: 'full-bleed', default_layout: ['hero'] }]).map(p => ({
        id: p.id,
        shell: p.shell || 'sidebar-main',
        layout: p.default_layout || [],
      }));

      const essence = {
        version: '2.0.0',
        archetype: bestMatch,
        theme: {
          style: 'auradecantism',
          mode: 'dark',
          recipe: 'auradecantism',
          shape: 'rounded',
        },
        personality: ['professional'],
        platform: { type: 'spa', routing: 'hash' },
        structure,
        features,
        guard: { enforce_style: true, enforce_recipe: true, mode: 'strict' },
        density: { level: 'comfortable', content_gap: '_gap4' },
        target: framework,
        _generated: {
          matched_archetype: bestMatch,
          confidence: archetypeScores[0]?.score || 0,
          alternatives: archetypeScores.slice(1, 4).map(a => a.id),
          description: args.description,
        },
      };

      return {
        essence,
        archetype: bestMatch,
        instructions: `Save this as decantr.essence.json in your project root. Review the structure (pages, patterns) and adjust to match your needs. The guard rules will validate your code against this spec.`,
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
