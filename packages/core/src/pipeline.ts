import type { EssenceFile } from '@decantr/essence-spec';
import { isV3, migrateV2ToV3, validateEssence } from '@decantr/essence-spec';
import type { ContentResolver } from '@decantr/registry';
import { createResolver } from '@decantr/registry';
import { buildPageIR } from './ir.js';
import { resolveEssence } from './resolve.js';
import type { IRAppNode, IRLayer, IRPageNode, IRShellNode, IRStoreNode } from './types.js';
import { pascalCase } from './utils.js';

function extractRouting(essence: EssenceFile): 'hash' | 'history' | 'pathname' {
  // Modern-SPA default. See packages/cli/src/scaffold.ts getPlatformMeta for rationale.
  if (isV3(essence)) {
    return essence.meta.platform.routing || 'history';
  }
  return (
    ((essence as { platform?: { routing?: string } }).platform?.routing as
      | 'hash'
      | 'history'
      | 'pathname') || 'history'
  );
}

export interface PipelineOptions {
  /** Path to content directory (patterns, archetypes, themes) */
  contentRoot?: string;

  /** Override paths for local content resolution */
  overridePaths?: string[];

  /** Only resolve specific page(s) */
  pageFilter?: string;

  /** Optional custom resolver for hosted or in-memory execution */
  resolver?: ContentResolver;
}

export interface PipelineResult {
  /** The framework-agnostic intermediate representation */
  ir: IRAppNode;
}

/**
 * Run the Design Pipeline:
 *   1. Validate Essence against schema + guard rules
 *   2. Resolve all references (patterns, theme, wiring) from registry
 *   3. Build framework-agnostic IR tree
 *   4. Return IR (no code generation — that's the consumer's job)
 */
export async function runPipeline(
  essence: EssenceFile,
  options: PipelineOptions,
): Promise<PipelineResult> {
  // 1. Validate
  const validation = validateEssence(essence);
  if (!validation.valid) {
    throw new Error(`Invalid essence: ${validation.errors.join(', ')}`);
  }

  // 2. Auto-migrate v2 → v3 before processing
  const effectiveEssence = isV3(essence) ? essence : migrateV2ToV3(essence);

  // 3. Create resolver and resolve
  const resolver =
    options.resolver ??
    (() => {
      if (!options.contentRoot) {
        throw new Error('Pipeline options must include either a contentRoot or a resolver.');
      }

      return createResolver({
        contentRoot: options.contentRoot,
        overridePaths: options.overridePaths,
      });
    })();

  const resolved = await resolveEssence(effectiveEssence, resolver);

  // 4. Build IR pages (v3 sources get layer metadata)
  const layer: IRLayer | undefined = resolved.isV3Source ? 'blueprint' : undefined;
  const pageNodes: IRPageNode[] = [];
  for (const rp of resolved.pages) {
    const pageIR = buildPageIR(
      rp.page,
      rp.patterns,
      rp.wiring,
      resolved.registryTheme,
      { gap: resolved.density.gap },
      layer,
    );
    pageNodes.push(pageIR);
  }

  // Apply page filter
  let filteredPages = pageNodes;
  if (options.pageFilter) {
    filteredPages = pageNodes.filter((p) => p.pageId === options.pageFilter);
  }

  // 4. Build shell node
  const shellNode: IRShellNode = {
    type: 'shell',
    id: 'shell',
    children: [],
    config: resolved.shell,
  };

  // 5. Build store node
  const storeNode: IRStoreNode = {
    type: 'store',
    id: 'store',
    children: [],
    pageSignals: pageNodes.map((p) => ({
      name: p.pageId,
      pascalName: pascalCase(p.pageId),
    })),
  };

  // 6. Assemble app node
  const appNode: IRAppNode = {
    type: 'app',
    id: 'app',
    children: filteredPages,
    theme: resolved.theme,
    routes: resolved.routes,
    routing: extractRouting(resolved.essence),
    shell: shellNode,
    store: storeNode,
    features: resolved.features,
  };

  return { ir: appNode };
}
