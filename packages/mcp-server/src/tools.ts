import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { validateEssence, evaluateGuard, isV3, migrateV2ToV3 } from '@decantr/essence-spec';
import type { EssenceFile, EssenceV3, GuardViolation } from '@decantr/essence-spec';
import { resolvePatternPreset } from '@decantr/registry';
import type { Pattern, ArchetypeRole } from '@decantr/registry';
import {
  validateStringArg,
  fuzzyScore,
  getAPIClient,
  readEssenceFile,
  mutateEssenceFile,
  readDriftLog,
  writeDriftLog,
} from './helpers.js';
import type { DriftLogEntry } from './helpers.js';

// ── Inline topology derivation (lightweight version of cli/scaffold.ts) ──

interface ZoneInput {
  archetypeId: string;
  role: ArchetypeRole;
  shell: string;
  features: string[];
  description: string;
}

interface ComposedZone {
  role: ArchetypeRole;
  archetypes: string[];
  shell: string;
  features: string[];
  descriptions: string[];
}

interface ZoneTransition {
  from: string;
  to: string;
  type: string;
  trigger: string;
}

const ZONE_ORDER: ArchetypeRole[] = ['public', 'gateway', 'primary', 'auxiliary'];

function deriveZones(inputs: ZoneInput[]): ComposedZone[] {
  const zoneMap = new Map<ArchetypeRole, ComposedZone>();

  for (const input of inputs) {
    const existing = zoneMap.get(input.role);
    if (existing) {
      existing.archetypes.push(input.archetypeId);
      existing.features.push(...input.features);
      existing.descriptions.push(input.description);
    } else {
      zoneMap.set(input.role, {
        role: input.role,
        archetypes: [input.archetypeId],
        shell: input.shell,
        features: [...input.features],
        descriptions: [input.description],
      });
    }
  }

  for (const zone of zoneMap.values()) {
    zone.features = [...new Set(zone.features)];
  }

  return ZONE_ORDER
    .filter(role => zoneMap.has(role))
    .map(role => zoneMap.get(role)!);
}

const GATEWAY_TRIGGER_MAP: Record<string, string> = {
  auth: 'authentication',
  login: 'authentication',
  mfa: 'authentication',
  payment: 'payment',
  subscription: 'payment',
  checkout: 'payment',
  onboarding: 'onboarding',
  'setup-wizard': 'onboarding',
  welcome: 'onboarding',
  invite: 'invitation',
  'access-code': 'invitation',
};

function resolveGatewayTrigger(features: string[]): string {
  for (const feature of features) {
    const trigger = GATEWAY_TRIGGER_MAP[feature];
    if (trigger) return trigger;
  }
  return 'authentication';
}

function deriveTransitions(zones: ComposedZone[]): ZoneTransition[] {
  const transitions: ZoneTransition[] = [];
  const roles = new Set(zones.map(z => z.role));
  const gateway = zones.find(z => z.role === 'gateway');
  const gatewayTrigger = gateway ? resolveGatewayTrigger(gateway.features) : 'authentication';

  const hasApp = roles.has('primary') || roles.has('auxiliary');
  const hasGateway = roles.has('gateway');
  const hasPublic = roles.has('public');

  if (hasPublic && hasGateway) {
    transitions.push({ from: 'public', to: 'gateway', type: 'conversion', trigger: gatewayTrigger });
  }
  if (hasPublic && hasApp && !hasGateway) {
    transitions.push({ from: 'public', to: 'app', type: 'conversion', trigger: 'navigation' });
  }
  if (hasGateway && hasApp) {
    transitions.push({ from: 'gateway', to: 'app', type: 'gate-pass', trigger: gatewayTrigger });
    transitions.push({ from: 'app', to: 'gateway', type: 'gate-return', trigger: gatewayTrigger });
  }
  if (hasApp && hasPublic) {
    transitions.push({ from: 'app', to: 'public', type: 'navigation', trigger: 'external' });
  }

  return transitions;
}

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

/** Read-only but makes network calls */
const READ_ONLY_NETWORK = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

/** Write tool annotations */
const WRITE_TOOL = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
};

export const TOOLS = [
  // 1. decantr_read_essence — local read
  {
    name: 'decantr_read_essence',
    title: 'Read Essence',
    description: 'Read and return the current decantr.essence.json file from the working directory. For v3 files, optionally filter by layer (dna, blueprint, or full).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Optional path to essence file. Defaults to ./decantr.essence.json.' },
        layer: { type: 'string', enum: ['dna', 'blueprint', 'full'], description: 'For v3 essences: return only the specified layer. Defaults to full.' },
      },
    },
    annotations: READ_ONLY,
  },
  // 2. decantr_validate — local read
  {
    name: 'decantr_validate',
    title: 'Validate Essence',
    description: 'Validate a decantr.essence.json file against the schema and guard rules. For v3, reports DNA vs Blueprint violations separately.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Path to essence file. Defaults to ./decantr.essence.json.' },
      },
    },
    annotations: READ_ONLY,
  },
  // 3. decantr_search_registry — network
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
    annotations: READ_ONLY_NETWORK,
  },
  // 4. decantr_resolve_pattern — network
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
    annotations: READ_ONLY_NETWORK,
  },
  // 5. decantr_resolve_archetype — network
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
    annotations: READ_ONLY_NETWORK,
  },
  // 6. decantr_resolve_recipe — network
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
    annotations: READ_ONLY_NETWORK,
  },
  // 7. decantr_resolve_blueprint — network
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
    annotations: READ_ONLY_NETWORK,
  },
  // 8. decantr_suggest_patterns — network
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
    annotations: READ_ONLY_NETWORK,
  },
  // 9. decantr_check_drift — local read
  {
    name: 'decantr_check_drift',
    title: 'Check Drift',
    description: 'Check if code changes violate the design intent captured in the Essence spec. For v3, returns separate dna_violations and blueprint_drift with autoFixable flags.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Path to essence file. Defaults to ./decantr.essence.json.' },
        page_id: { type: 'string', description: 'Page ID being modified (e.g. "overview", "settings")' },
        components_used: {
          type: 'array' as const,
          items: { type: 'string' },
          description: 'List of component names used in the generated code. Checked against page layout patterns.',
        },
        theme_used: { type: 'string', description: 'Theme/style name used in the generated code' },
      },
    },
    annotations: READ_ONLY,
  },
  // 10. decantr_create_essence — network (fetches archetype)
  {
    name: 'decantr_create_essence',
    title: 'Create Essence',
    description: 'Generate a valid v3 Essence spec skeleton from a project description. Returns a structured essence.json template based on the closest matching archetype and blueprint.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        description: { type: 'string', description: 'Natural language project description (e.g. "SaaS dashboard with analytics, user management, and billing")' },
        framework: { type: 'string', description: 'Target framework (e.g. "react", "vue", "svelte"). Defaults to "react".' },
      },
      required: ['description'],
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 11. decantr_accept_drift — WRITE tool (NEW)
  {
    name: 'decantr_accept_drift',
    title: 'Accept Drift',
    description: 'Resolve guard violations by accepting, scoping, rejecting, or deferring drift. For DNA violations, requires explicit confirmation. Updates the essence file or drift log.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        violations: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              rule: { type: 'string' },
              page_id: { type: 'string' },
              details: { type: 'string' },
            },
            required: ['rule'],
          },
          description: 'The violations to resolve.',
        },
        resolution: {
          type: 'string',
          enum: ['accept', 'accept_scoped', 'reject', 'defer'],
          description: 'How to resolve: accept updates the essence, accept_scoped limits to a page, reject is a no-op, defer logs for later.',
        },
        scope: { type: 'string', description: 'For accept_scoped: the page or section scope.' },
        path: { type: 'string', description: 'Path to essence file. Defaults to ./decantr.essence.json.' },
        confirm_dna: { type: 'boolean', description: 'Required to be true when accepting DNA-layer violations.' },
      },
      required: ['violations', 'resolution'],
    },
    annotations: WRITE_TOOL,
  },
  // 12. decantr_update_essence — WRITE tool (NEW)
  {
    name: 'decantr_update_essence',
    title: 'Update Essence',
    description: 'Mutate the essence file: add/remove/update pages, update DNA or blueprint fields, add/remove features. Operates on v3 format (auto-migrates v2).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        operation: {
          type: 'string',
          enum: ['add_page', 'remove_page', 'update_page_layout', 'update_dna', 'update_blueprint', 'add_feature', 'remove_feature'],
          description: 'The mutation operation to perform.',
        },
        payload: {
          type: 'object' as const,
          description: 'Operation-specific payload. See tool docs for each operation.',
        },
        path: { type: 'string', description: 'Path to essence file. Defaults to ./decantr.essence.json.' },
      },
      required: ['operation', 'payload'],
    },
    annotations: WRITE_TOOL,
  },
];

export async function handleTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiClient = getAPIClient();

  switch (name) {
    case 'decantr_read_essence': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      try {
        const raw = await readFile(essencePath, 'utf-8');
        const essence = JSON.parse(raw) as EssenceFile;
        const layer = args.layer as string | undefined;
        if (layer && isV3(essence)) {
          if (layer === 'dna') return essence.dna;
          if (layer === 'blueprint') return essence.blueprint;
        }
        return essence;
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

      let guardViolations: GuardViolation[] = [];
      if (result.valid && typeof essence === 'object' && essence !== null) {
        try {
          guardViolations = evaluateGuard(essence as EssenceFile, {});
        } catch { /* guard evaluation is optional */ }
      }

      // For v3 essences, separate violations by layer
      if (result.valid && typeof essence === 'object' && essence !== null && isV3(essence as EssenceFile)) {
        const dnaViolations = guardViolations.filter(v => v.layer === 'dna');
        const blueprintViolations = guardViolations.filter(v => v.layer === 'blueprint');
        const otherViolations = guardViolations.filter(v => !v.layer);
        return {
          ...result,
          format: 'v3',
          dna_violations: dnaViolations,
          blueprint_violations: blueprintViolations,
          guardViolations: otherViolations,
        };
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

        // Derive topology from composed archetypes
        let topology = null;
        const composeEntries = (blueprint as any).compose || (blueprint as any).data?.compose;
        if (composeEntries && Array.isArray(composeEntries) && composeEntries.length > 0) {
          const zoneInputs: ZoneInput[] = [];
          const archetypePromises = composeEntries.map(async (entry: any) => {
            const arcId = typeof entry === 'string' ? entry : entry.archetype;
            try {
              const arch = await apiClient.getContent('archetypes', namespace, arcId);
              const archData = (arch as any).data || arch;
              const explicitRole = typeof entry === 'object' ? entry.role : undefined;
              zoneInputs.push({
                archetypeId: arcId,
                role: explicitRole || archData.role || 'auxiliary',
                shell: archData.pages?.[0]?.shell || 'sidebar-main',
                features: archData.features || [],
                description: archData.description || '',
              });
            } catch {
              // Archetype not found — skip
            }
          });
          await Promise.all(archetypePromises);

          if (zoneInputs.length > 0) {
            const zones = deriveZones(zoneInputs);
            const transitions = deriveTransitions(zones);
            const primaryArchetype = zoneInputs.find(z => z.role === 'primary');
            topology = {
              zones: zones.map(z => ({
                role: z.role,
                archetypes: z.archetypes,
                shell: z.shell,
                features: z.features,
                purpose: z.descriptions.join(' '),
              })),
              transitions,
              entryPoints: {
                anonymous: '/',
                authenticated: primaryArchetype ? `/${primaryArchetype.archetypeId}` : '/home',
              },
            };
          }
        }

        return { found: true, ...blueprint, ...(topology ? { topology } : {}) };
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

      const violations: { rule: string; severity: string; message: string; layer?: string; autoFixable?: boolean; autoFix?: unknown }[] = [];

      if (args.theme_used && typeof args.theme_used === 'string') {
        let expectedStyle: string | undefined;
        if (isV3(essence)) {
          expectedStyle = essence.dna.theme.style;
        } else {
          const expectedTheme = (essence as Record<string, unknown>).theme as Record<string, string> | undefined;
          expectedStyle = expectedTheme?.style;
        }
        if (expectedStyle && args.theme_used !== expectedStyle) {
          violations.push({
            rule: 'theme-match',
            severity: 'critical',
            message: `Theme drift: code uses "${args.theme_used}" but Essence specifies "${expectedStyle}". Do not switch themes.`,
            ...(isV3(essence) ? { layer: 'dna', autoFixable: false } : {}),
          });
        }
      }

      if (args.page_id && typeof args.page_id === 'string') {
        let pages: Array<{ id: string }>;
        if (isV3(essence)) {
          pages = essence.blueprint.pages;
        } else {
          pages = ((essence as Record<string, unknown>).structure as Array<{ id: string }>) || [];
        }
        if (!pages.find(p => p.id === args.page_id)) {
          violations.push({
            rule: 'page-exists',
            severity: 'critical',
            message: `Page "${args.page_id}" not found in Essence structure. Add it to the Essence before generating code for it.`,
            ...(isV3(essence) ? {
              layer: 'blueprint',
              autoFixable: true,
              autoFix: { type: 'add_page', patch: { id: args.page_id } },
            } : {}),
          });
        }
      }

      // Implement components_used checking
      if (args.components_used && Array.isArray(args.components_used) && args.page_id && typeof args.page_id === 'string') {
        let pages: Array<{ id: string; layout: unknown[] }>;
        if (isV3(essence)) {
          pages = essence.blueprint.pages;
        } else {
          pages = ((essence as Record<string, unknown>).structure as Array<{ id: string; layout: unknown[] }>) || [];
        }
        const page = pages.find(p => p.id === args.page_id);
        if (page && page.layout) {
          // Extract expected patterns from layout
          const expectedPatterns = new Set<string>();
          for (const item of page.layout) {
            if (typeof item === 'string') {
              expectedPatterns.add(item);
            } else if (typeof item === 'object' && item !== null && 'pattern' in item) {
              expectedPatterns.add((item as { pattern: string }).pattern);
            }
          }

          // Check if any components_used don't have a matching pattern in the layout
          const componentsUsed = args.components_used as string[];
          const unmatchedComponents: string[] = [];
          for (const comp of componentsUsed) {
            // Check if the component fuzzy-matches any expected pattern
            const compLower = comp.toLowerCase().replace(/[_\s]/g, '-');
            let matched = false;
            for (const pattern of expectedPatterns) {
              const patternLower = pattern.toLowerCase();
              if (compLower.includes(patternLower) || patternLower.includes(compLower) || fuzzyScore(compLower, patternLower) >= 60) {
                matched = true;
                break;
              }
            }
            if (!matched) {
              unmatchedComponents.push(comp);
            }
          }

          if (unmatchedComponents.length > 0) {
            violations.push({
              rule: 'component-pattern-match',
              severity: 'warning',
              message: `Components [${unmatchedComponents.join(', ')}] do not match any pattern in page "${args.page_id}" layout. Expected patterns: [${[...expectedPatterns].join(', ')}].`,
              ...(isV3(essence) ? { layer: 'blueprint', autoFixable: false } : {}),
            });
          }
        }
      }

      try {
        const guardViolations = evaluateGuard(essence, {
          pageId: args.page_id as string | undefined,
        });
        for (const gv of guardViolations) {
          violations.push({
            rule: gv.rule || 'guard',
            severity: gv.severity || 'warning',
            message: gv.message || 'Guard violation',
            ...(gv.layer ? { layer: gv.layer } : {}),
            ...(gv.autoFixable !== undefined ? { autoFixable: gv.autoFixable } : {}),
            ...(gv.autoFix ? { autoFix: gv.autoFix } : {}),
          });
        }
      } catch { /* guard is optional */ }

      // For v3, separate by layer
      if (isV3(essence)) {
        const dnaViolations = violations.filter(v => v.layer === 'dna');
        const blueprintDrift = violations.filter(v => v.layer === 'blueprint');
        const other = violations.filter(v => !v.layer);
        return {
          drifted: violations.length > 0,
          dna_violations: dnaViolations,
          blueprint_drift: blueprintDrift,
          other_violations: other,
          checkedAgainst: essencePath,
        };
      }

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

      const rawPages = pages || [{ id: 'home', shell: 'full-bleed', default_layout: ['hero'] }];
      const defaultShell = rawPages[0]?.shell || 'sidebar-main';

      // Generate v3 essence
      const essence: EssenceV3 = {
        version: '3.0.0',
        dna: {
          theme: {
            style: 'auradecantism',
            mode: 'dark',
            recipe: 'auradecantism',
            shape: 'rounded',
          },
          spacing: {
            base_unit: 4,
            scale: 'linear',
            density: 'comfortable',
            content_gap: '4',
          },
          typography: {
            scale: 'modular',
            heading_weight: 600,
            body_weight: 400,
          },
          color: {
            palette: 'semantic',
            accent_count: 1,
            cvd_preference: 'auto',
          },
          radius: {
            philosophy: 'rounded',
            base: 8,
          },
          elevation: {
            system: 'layered',
            max_levels: 3,
          },
          motion: {
            preference: 'subtle',
            duration_scale: 1.0,
            reduce_motion: true,
          },
          accessibility: {
            wcag_level: 'AA',
            focus_visible: true,
            skip_nav: true,
          },
          personality: ['professional'],
        },
        blueprint: {
          shell: defaultShell,
          pages: rawPages.map(p => ({
            id: p.id,
            ...(p.shell !== defaultShell ? { shell_override: p.shell } : {}),
            layout: p.default_layout || [],
          })),
          features,
        },
        meta: {
          archetype: bestMatch,
          target: framework,
          platform: { type: 'spa', routing: 'hash' },
          guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
        },
      };

      return {
        essence,
        archetype: bestMatch,
        format: 'v3',
        instructions: `Save this as decantr.essence.json in your project root. Review the dna (design tokens), blueprint (pages/features), and meta (project config) sections and adjust to match your needs. The guard rules will validate your code against this spec.`,
        _generated: {
          matched_archetype: bestMatch,
          confidence: archetypeScores[0]?.score || 0,
          alternatives: archetypeScores.slice(1, 4).map(a => a.id),
          description: args.description,
        },
      };
    }

    case 'decantr_accept_drift': {
      const violations = args.violations as Array<{ rule: string; page_id?: string; details?: string }> | undefined;
      const resolution = args.resolution as string;

      if (!violations || !Array.isArray(violations) || violations.length === 0) {
        return { error: 'Required parameter "violations" must be a non-empty array.' };
      }
      if (!resolution || !['accept', 'accept_scoped', 'reject', 'defer'].includes(resolution)) {
        return { error: 'Required parameter "resolution" must be one of: accept, accept_scoped, reject, defer.' };
      }

      // Check if any violations are DNA-layer; if so, require confirm_dna
      const hasDnaViolation = violations.some(v => {
        const rule = v.rule;
        // DNA-layer rules: style, recipe, density, theme-mode, accessibility
        return ['style', 'recipe', 'density', 'theme-mode', 'accessibility', 'theme-match'].includes(rule);
      });

      if (hasDnaViolation && resolution !== 'reject' && resolution !== 'defer' && !args.confirm_dna) {
        return {
          error: 'DNA-layer violations detected. Set confirm_dna: true to accept changes to design axioms (theme, style, density, etc.).',
          requires_confirmation: true,
          dna_rules_affected: violations.filter(v =>
            ['style', 'recipe', 'density', 'theme-mode', 'accessibility', 'theme-match'].includes(v.rule)
          ).map(v => v.rule),
        };
      }

      if (resolution === 'reject') {
        return {
          status: 'rejected',
          message: 'Violations rejected. No changes made. Revert the code to match the essence spec.',
          violations_count: violations.length,
        };
      }

      if (resolution === 'defer') {
        const projectRoot = args.path ? dirname(args.path as string) : undefined;
        const existingLog = await readDriftLog(projectRoot);
        const newEntries: DriftLogEntry[] = violations.map(v => ({
          rule: v.rule,
          page_id: v.page_id,
          details: v.details,
          resolution: 'deferred',
          scope: (args.scope as string) || undefined,
          timestamp: new Date().toISOString(),
        }));
        const updatedLog = [...existingLog, ...newEntries];
        const logPath = await writeDriftLog(updatedLog, projectRoot);
        return {
          status: 'deferred',
          message: `${violations.length} violation(s) deferred to drift log.`,
          log_path: logPath,
          total_deferred: updatedLog.length,
        };
      }

      // resolution === 'accept' or 'accept_scoped'
      try {
        const { essence, path } = await mutateEssenceFile(args.path as string | undefined, (v3) => {
          for (const v of violations) {
            applyDriftAcceptance(v3, v, resolution, args.scope as string | undefined);
          }
          return v3;
        });

        return {
          status: resolution === 'accept_scoped' ? 'accepted_scoped' : 'accepted',
          message: `${violations.length} violation(s) resolved. Essence updated.`,
          path,
          scope: resolution === 'accept_scoped' ? (args.scope || 'unscoped') : undefined,
        };
      } catch (e) {
        return { error: `Failed to update essence: ${(e as Error).message}` };
      }
    }

    case 'decantr_update_essence': {
      const operation = args.operation as string;
      const payload = args.payload as Record<string, unknown>;

      if (!operation) {
        return { error: 'Required parameter "operation" is missing.' };
      }
      if (!payload || typeof payload !== 'object') {
        return { error: 'Required parameter "payload" must be an object.' };
      }

      const validOps = ['add_page', 'remove_page', 'update_page_layout', 'update_dna', 'update_blueprint', 'add_feature', 'remove_feature'];
      if (!validOps.includes(operation)) {
        return { error: `Invalid operation "${operation}". Must be one of: ${validOps.join(', ')}` };
      }

      try {
        const { essence, path } = await mutateEssenceFile(args.path as string | undefined, (v3) => {
          return applyEssenceUpdate(v3, operation, payload);
        });

        return {
          status: 'updated',
          operation,
          path,
          summary: describeUpdate(operation, payload),
        };
      } catch (e) {
        return { error: `Failed to update essence: ${(e as Error).message}` };
      }
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// --- Internal helpers for accept_drift ---

function applyDriftAcceptance(
  essence: EssenceV3,
  violation: { rule: string; page_id?: string; details?: string },
  resolution: string,
  scope?: string,
): void {
  switch (violation.rule) {
    case 'theme-match':
    case 'style': {
      // Accept a style change: update the DNA theme style
      if (violation.details) {
        essence.dna.theme.style = violation.details;
      }
      break;
    }
    case 'page-exists':
    case 'structure': {
      // Accept a missing page: add it to the blueprint
      if (violation.page_id) {
        const existing = essence.blueprint.pages.find(p => p.id === violation.page_id);
        if (!existing) {
          essence.blueprint.pages.push({
            id: violation.page_id,
            layout: [],
          });
        }
      }
      break;
    }
    case 'layout': {
      // Layout drift: this is typically accept_scoped to a page
      // No automatic patch for layout acceptance — it's acknowledged
      break;
    }
    case 'recipe': {
      if (violation.details) {
        essence.dna.theme.recipe = violation.details;
      }
      break;
    }
    case 'density': {
      // density drift: acknowledged
      break;
    }
    default:
      break;
  }
}

// --- Internal helpers for update_essence ---

function applyEssenceUpdate(
  essence: EssenceV3,
  operation: string,
  payload: Record<string, unknown>,
): EssenceV3 {
  switch (operation) {
    case 'add_page': {
      const id = payload.id as string;
      if (!id) throw new Error('Payload must include "id" for add_page.');
      const existing = essence.blueprint.pages.find(p => p.id === id);
      if (existing) throw new Error(`Page "${id}" already exists.`);
      essence.blueprint.pages.push({
        id,
        layout: (payload.layout as string[]) || [],
        ...(payload.shell_override ? { shell_override: payload.shell_override as string } : {}),
        ...(payload.surface ? { surface: payload.surface as string } : {}),
      });
      break;
    }
    case 'remove_page': {
      const id = payload.id as string;
      if (!id) throw new Error('Payload must include "id" for remove_page.');
      const idx = essence.blueprint.pages.findIndex(p => p.id === id);
      if (idx === -1) throw new Error(`Page "${id}" not found.`);
      essence.blueprint.pages.splice(idx, 1);
      break;
    }
    case 'update_page_layout': {
      const id = payload.id as string;
      const layout = payload.layout as unknown[];
      if (!id) throw new Error('Payload must include "id" for update_page_layout.');
      if (!layout || !Array.isArray(layout)) throw new Error('Payload must include "layout" array for update_page_layout.');
      const page = essence.blueprint.pages.find(p => p.id === id);
      if (!page) throw new Error(`Page "${id}" not found.`);
      page.layout = layout as EssenceV3['blueprint']['pages'][0]['layout'];
      break;
    }
    case 'update_dna': {
      // Shallow merge payload into dna
      for (const [key, value] of Object.entries(payload)) {
        if (key in essence.dna && typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Deep merge one level for sub-objects like theme, spacing, etc.
          (essence.dna as Record<string, unknown>)[key] = {
            ...(essence.dna as Record<string, Record<string, unknown>>)[key],
            ...(value as Record<string, unknown>),
          };
        } else {
          (essence.dna as Record<string, unknown>)[key] = value;
        }
      }
      break;
    }
    case 'update_blueprint': {
      // Shallow merge payload into blueprint (except pages, which is managed via add/remove/update_page)
      for (const [key, value] of Object.entries(payload)) {
        if (key === 'pages') continue; // Use add_page/remove_page/update_page_layout
        (essence.blueprint as Record<string, unknown>)[key] = value;
      }
      break;
    }
    case 'add_feature': {
      const feature = payload.feature as string;
      if (!feature) throw new Error('Payload must include "feature" for add_feature.');
      if (!essence.blueprint.features.includes(feature)) {
        essence.blueprint.features.push(feature);
      }
      break;
    }
    case 'remove_feature': {
      const feature = payload.feature as string;
      if (!feature) throw new Error('Payload must include "feature" for remove_feature.');
      const idx = essence.blueprint.features.indexOf(feature);
      if (idx === -1) throw new Error(`Feature "${feature}" not found.`);
      essence.blueprint.features.splice(idx, 1);
      break;
    }
  }
  return essence;
}

function describeUpdate(operation: string, payload: Record<string, unknown>): string {
  switch (operation) {
    case 'add_page': return `Added page "${payload.id}".`;
    case 'remove_page': return `Removed page "${payload.id}".`;
    case 'update_page_layout': return `Updated layout for page "${payload.id}".`;
    case 'update_dna': return `Updated DNA: ${Object.keys(payload).join(', ')}.`;
    case 'update_blueprint': return `Updated blueprint: ${Object.keys(payload).join(', ')}.`;
    case 'add_feature': return `Added feature "${payload.feature}".`;
    case 'remove_feature': return `Removed feature "${payload.feature}".`;
    default: return `Performed ${operation}.`;
  }
}
