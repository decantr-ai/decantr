import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { validateEssence, evaluateGuard } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';
import { createRegistryClient, resolvePatternPreset } from '@decantr/registry';
import { validateStringArg, getResolver } from './helpers.js';

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
    description: 'Get full pattern details including blend spec, components, presets, and code examples.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Pattern ID (e.g. "hero", "data-table", "kpi-grid")' },
        preset: { type: 'string', description: 'Optional preset name (e.g. "product", "content")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_resolve_archetype',
    title: 'Resolve Archetype',
    description: 'Get archetype details including default pages, blends, tannins, and suggested vintage.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Archetype ID (e.g. "saas-dashboard", "ecommerce")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY,
  },
];

export async function handleTool(name: string, args: Record<string, unknown>): Promise<unknown> {
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

      // Also run guard if valid
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
        const client = createRegistryClient();
        const results = await client.search(args.query as string, args.type as string | undefined);
        return {
          total: results.length,
          results: results.map((r) => ({
            type: r.type,
            id: r.id,
            name: r.name,
            description: r.description,
            install: `decantr registry add ${r.type}/${r.id}`,
          })),
        };
      } catch (e) {
        return { error: `Search failed: ${(e as Error).message}` };
      }
    }

    case 'decantr_resolve_pattern': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const resolver = getResolver();
      const resolved = await resolver.resolve('pattern', args.id as string);
      if (!resolved) {
        return { found: false, message: `Pattern "${args.id}" not found.` };
      }
      const result: Record<string, unknown> = { found: true, ...resolved.item };
      // Apply preset if requested
      if (args.preset && typeof args.preset === 'string') {
        const preset = resolvePatternPreset(resolved.item, args.preset as string);
        if (preset) result.resolvedPreset = preset;
      }
      return result;
    }

    case 'decantr_resolve_archetype': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const resolver = getResolver();
      const resolved = await resolver.resolve('archetype', args.id as string);
      if (!resolved) {
        return { found: false, message: `Archetype "${args.id}" not found.` };
      }
      return { found: true, ...resolved.item };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
