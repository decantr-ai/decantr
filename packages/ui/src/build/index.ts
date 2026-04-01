/**
 * Build-time Essence Resolver
 *
 * Pre-computes the component tree from essence.json at BUILD time,
 * emitting optimized static HTML that only needs hydration for interactivity.
 *
 * This module runs in Node.js — no browser DOM required.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { runPipeline, walkIR, findNodes } from '@decantr/core';
import type { IRAppNode, IRPageNode } from '@decantr/core';
import { renderToString } from '../ssr/index.js';
import { mapIRToVNode } from './ir-mapper.js';

// Default content root: bundled content in @decantr/cli
const DEFAULT_CONTENT_ROOT = resolve(
  dirname(new URL(import.meta.url).pathname),
  '../../../../cli/src/bundled',
);

export interface BuildOptions {
  /** Path to essence.json */
  essencePath: string;
  /** Path to content directory (for pattern resolution) */
  contentRoot?: string;
  /** Output directory */
  outDir: string;
  /** Pages to build (default: all from blueprint) */
  pages?: string[];
}

export interface BuildResult {
  pages: Array<{
    pageId: string;
    html: string;
    route: string;
  }>;
}

/**
 * Build static HTML pages from an essence.json file.
 *
 * 1. Reads essence.json from `essencePath`
 * 2. Runs the Decantr core pipeline to produce an IR tree
 * 3. Walks the IR tree and maps nodes to SSR VNodes
 * 4. Renders each page to static HTML
 * 5. Writes HTML files to `outDir`
 */
export async function buildFromEssence(options: BuildOptions): Promise<BuildResult> {
  const { essencePath, outDir, pages: pageFilter } = options;
  const contentRoot = options.contentRoot || DEFAULT_CONTENT_ROOT;

  // 1. Read essence.json
  const essenceRaw = await readFile(essencePath, 'utf-8');
  const essence = JSON.parse(essenceRaw);

  // 2. Run the core pipeline to get the IR tree
  let ir: IRAppNode;
  try {
    const result = await runPipeline(essence, { contentRoot });
    ir = result.ir;
  } catch (err) {
    // Pipeline failed — generate fallback pages from blueprint directly
    return buildFallbackPages(essence, outDir, pageFilter);
  }

  // 3. Find page nodes from the IR tree
  const pageNodes = findNodes<IRPageNode>(ir, 'page');
  const filteredPages = pageFilter
    ? pageNodes.filter(p => pageFilter.includes(p.pageId))
    : pageNodes;

  // 4. Render each page to HTML
  const results: BuildResult['pages'] = [];

  for (const pageNode of filteredPages) {
    const route = resolveRoute(ir, pageNode.pageId);

    // Map the full page IR to VNodes and render via SSR
    const html = renderToString(() => {
      // Build a page-level VNode tree including shell context
      const pageVNode = mapIRToVNode(pageNode);
      return pageVNode;
    });

    // Wrap in full HTML document
    const fullHtml = wrapInDocument(html, ir, pageNode.pageId);

    results.push({
      pageId: pageNode.pageId,
      html: fullHtml,
      route,
    });
  }

  // 5. Write files to outDir
  await mkdir(outDir, { recursive: true });

  for (const page of results) {
    const filePath = page.route === '/'
      ? join(outDir, 'index.html')
      : join(outDir, page.route, 'index.html');

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, page.html, 'utf-8');
  }

  // Write hydration manifest
  const manifest = {
    pages: results.map(p => ({
      pageId: p.pageId,
      route: p.route,
    })),
    theme: ir.theme,
    routing: ir.routing,
  };
  await writeFile(join(outDir, '_decantr-manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  return { pages: results };
}

/**
 * Resolve the route path for a page from the IR routes table.
 */
function resolveRoute(ir: IRAppNode, pageId: string): string {
  const route = ir.routes.find(r => r.pageId === pageId);
  if (route) return route.path;
  // Default: page ID as path, with "home" mapping to "/"
  return pageId === 'home' ? '/' : `/${pageId}`;
}

/**
 * Wrap rendered page HTML in a full HTML document with theme attributes
 * and a hydration script tag.
 */
function wrapInDocument(bodyHtml: string, ir: IRAppNode, pageId: string): string {
  const { style, mode } = ir.theme;
  return `<!DOCTYPE html>
<html lang="en" data-theme="${style}" data-mode="${mode}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="generator" content="decantr-build">
  <title>${pageId}</title>
</head>
<body>
  <div id="app">${bodyHtml}</div>
  <script type="module">
    // Hydration entry — resolved at runtime by the app's bundler
    import { hydrate } from '@decantr/ui/ssr';
    const manifest = await fetch('/_decantr-manifest.json').then(r => r.json());
    // Hydration is handled by the app's entry point
  </script>
</body>
</html>`;
}

/**
 * Fallback: when the pipeline fails (e.g., missing content), generate
 * minimal pages from the blueprint that resolve patterns at runtime.
 */
async function buildFallbackPages(
  essence: any,
  outDir: string,
  pageFilter?: string[],
): Promise<BuildResult> {
  const blueprint = essence.blueprint;
  if (!blueprint?.pages) {
    return { pages: [] };
  }

  const pages = blueprint.pages as Array<{ id: string; shell?: string; layout: string[] }>;
  const filtered = pageFilter
    ? pages.filter(p => pageFilter.includes(p.id))
    : pages;

  const results: BuildResult['pages'] = [];

  for (const page of filtered) {
    const route = page.id === 'home' ? '/' : `/${page.id}`;

    // Generate HTML with compose() calls that resolve at runtime
    const patternsHtml = page.layout
      .map(patternId => `<section data-pattern="${patternId}" data-compose="${patternId}"></section>`)
      .join('\n    ');

    const shellId = page.shell || blueprint.shell || 'marketing';
    const style = essence.dna?.theme?.style || 'clean';
    const mode = essence.dna?.theme?.mode || 'light';

    const html = `<!DOCTYPE html>
<html lang="en" data-theme="${style}" data-mode="${mode}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="generator" content="decantr-build-fallback">
  <title>${page.id}</title>
</head>
<body>
  <div id="app" data-shell="${shellId}">
    ${patternsHtml}
  </div>
  <script type="module">
    // Runtime resolution — patterns will be composed client-side
    import { composePage } from '@decantr/ui/compose';
  </script>
</body>
</html>`;

    results.push({ pageId: page.id, html, route });
  }

  // Write fallback files
  await mkdir(outDir, { recursive: true });
  for (const page of results) {
    const filePath = page.route === '/'
      ? join(outDir, 'index.html')
      : join(outDir, page.route, 'index.html');
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, page.html, 'utf-8');
  }

  return { pages: results };
}

export { mapIRToVNode } from './ir-mapper.js';
