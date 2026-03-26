import type {
  PipelineOptions, PipelineResult, IRAppNode,
  IRShellNode, IRStoreNode, IRPageNode,
} from './types.js';
import type { EssenceFile } from '@decantr/essence-spec';
import { validateEssence } from '@decantr/essence-spec';
import { createResolver } from '@decantr/registry';
import { resolveEssence } from './resolve.js';
import { buildPageIR } from './ir.js';

function pascalCase(str: string): string {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

/**
 * Run the generation pipeline:
 *   1. Load and validate Essence
 *   2. Resolve all references (patterns, recipe, wiring)
 *   3. Build IR tree
 *   4. Run plugin.emit() to produce target-specific files
 *   5. Return files (pipeline does NOT write to disk)
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

  // 2. Create resolver and resolve
  const resolver = createResolver({
    contentRoot: options.contentRoot,
    overridePaths: options.overridePaths,
  });

  const resolved = await resolveEssence(essence, resolver);

  // 3. Build IR pages
  const pageNodes: IRPageNode[] = [];
  for (const rp of resolved.pages) {
    const pageIR = buildPageIR(
      rp.page,
      rp.patterns,
      rp.wiring,
      resolved.recipe,
      { gap: resolved.density.gap },
    );
    pageNodes.push(pageIR);
  }

  // Apply page filter
  let filteredPages = pageNodes;
  if (options.pageFilter) {
    filteredPages = pageNodes.filter(p => p.pageId === options.pageFilter);
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
    pageSignals: pageNodes.map(p => ({
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
    routing: (resolved.essence as { platform?: { routing?: string } }).platform?.routing as 'hash' | 'history' || 'hash',
    shell: shellNode,
    store: storeNode,
    features: resolved.features,
  };

  // 7. Emit
  const files = options.plugin.emit(appNode);

  return {
    files,
    ir: appNode,
    dryRun: options.dryRun ?? false,
  };
}
