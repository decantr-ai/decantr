import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { collectSourceImports, createProjectSourceProgram } from '../source/program.js';
import { isProductionAuthorityPath } from '../source/scope.js';
import type { FrameworkRouteAuthorityInput, FrameworkRouteAuthorityResult } from './types.js';

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'];
const ENTRY_BASENAMES = [
  'src/main',
  'src/index',
  'src/entry-client',
  'src/entry.client',
  'src/bootstrap',
  'main.wasp',
];

export function assessFrameworkRouteAuthority(
  input: FrameworkRouteAuthorityInput,
): FrameworkRouteAuthorityResult {
  if (input.framework === 'angular' && input.angular) {
    return {
      adapter: 'angular-compiler',
      authority: input.angular.authority,
      completeness: input.angular.completeness,
      authorityFiles: input.angular.authorityFiles,
      evidence: input.angular.evidence,
      limitations: input.angular.limitations,
    };
  }

  if (input.signals.length === 0) {
    return {
      adapter: 'none',
      authority: 'unresolved',
      completeness: 'unknown',
      authorityFiles: [],
      evidence: [],
      limitations: ['No route declaration was discovered from production-scoped source.'],
    };
  }

  const authorityFiles = [
    ...new Set(input.signals.map((signal) => signal.declarationFile ?? signal.file)),
  ];
  const nonProductionFiles = authorityFiles.filter((file) => !isProductionAuthorityPath(file));
  if (nonProductionFiles.length > 0) {
    return {
      adapter: 'source-scope-rejection',
      authority: 'unresolved',
      completeness: 'unknown',
      authorityFiles: authorityFiles.filter(isProductionAuthorityPath),
      evidence: [],
      limitations: [
        `Non-production route source was rejected: ${nonProductionFiles.slice(0, 5).join(', ')}`,
      ],
    };
  }

  if (
    ['app-router', 'mixed-next-router', 'pages-router'].includes(input.strategy) &&
    input.framework === 'nextjs'
  ) {
    return conventionalFileRouter('next-file-router', authorityFiles);
  }
  if (input.strategy === 'nuxt-router' && input.framework === 'nuxt') {
    return conventionalFileRouter('nuxt-file-router', authorityFiles);
  }
  if (input.strategy === 'sveltekit-router' && input.framework === 'svelte') {
    return conventionalFileRouter('sveltekit-file-router', authorityFiles);
  }
  if (input.strategy === 'pages-router' && input.framework === 'astro') {
    return conventionalFileRouter('astro-file-router', authorityFiles);
  }
  if (input.strategy === 'static-html' && input.framework === 'html') {
    return conventionalFileRouter('static-entry', authorityFiles);
  }
  if (input.strategy === 'react-router-file-router' && input.framework === 'react') {
    return conventionalFileRouter('react-router-file-router', [
      ...new Set([...authorityFiles, ...input.signals.map((signal) => signal.file)]),
    ]);
  }
  if (input.strategy === 'solidstart-router' && input.framework === 'solid') {
    return conventionalFileRouter('solidstart-file-router', [
      ...new Set([...authorityFiles, ...input.signals.map((signal) => signal.file)]),
    ]);
  }

  const allTanstack = input.signals.every((signal) => signal.kind === 'tanstack-router');
  const hasTanstack = Boolean(
    input.dependencies['@tanstack/react-router'] || input.dependencies['@tanstack/router-core'],
  );
  if (
    allTanstack &&
    hasTanstack &&
    authorityFiles.every((file) => /(?:^|\/)src\/routes\//u.test(file))
  ) {
    return {
      adapter: 'tanstack-file-router',
      authority: 'proven',
      completeness: 'complete',
      authorityFiles,
      evidence: ['TanStack file-route declarations are inside the selected app route root.'],
      limitations: [],
    };
  }

  const reachability = productionReachability(input.projectRoot, authorityFiles);
  if (reachability.allReachable) {
    return {
      adapter: `${input.framework}-production-reachability`,
      authority: 'proven',
      completeness: 'partial',
      authorityFiles: [...new Set([...reachability.entrypoints, ...authorityFiles])],
      evidence: [
        `All route declaration files are reachable from ${reachability.entrypoints.join(', ')}.`,
      ],
      limitations: [
        'Production reachability is proven, but generic source extraction cannot prove a complete framework route graph.',
      ],
    };
  }

  return {
    adapter: `${input.framework}-source-signals`,
    authority: 'inferred',
    completeness: 'partial',
    authorityFiles,
    evidence: [`${input.signals.length} production-scoped route signal(s) found.`],
    limitations: [
      reachability.entrypoints.length === 0
        ? 'No selected-app production entrypoint was found for route reachability.'
        : `Route declaration files are not all reachable from the selected entrypoint: ${reachability.unreachable.slice(0, 5).join(', ')}`,
      'Generic source signals are supporting evidence and are not promoted to complete framework authority.',
    ],
  };
}

function conventionalFileRouter(
  adapter: string,
  authorityFiles: string[],
): FrameworkRouteAuthorityResult {
  return {
    adapter,
    authority: 'proven',
    completeness: 'complete',
    authorityFiles,
    evidence: [`${adapter} convention resolves route files inside the selected app.`],
    limitations: [],
  };
}

function productionReachability(
  projectRoot: string,
  targets: string[],
): { allReachable: boolean; entrypoints: string[]; unreachable: string[] } {
  const context = createProjectSourceProgram(projectRoot, {
    includeTests: false,
    includeFixtures: false,
    maxFiles: 8000,
  });
  const inventoryPaths = new Set(context.inventory.files.map((file) => file.relativePath));
  const entrypoints = ENTRY_BASENAMES.flatMap((base) =>
    SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
  ).filter((file) => inventoryPaths.has(file) || existsSync(join(projectRoot, file)));
  const reachable = new Set(entrypoints);
  const queue = [...entrypoints];

  while (queue.length > 0) {
    const file = queue.shift();
    if (!file) continue;
    for (const reference of collectSourceImports(context, file)) {
      const imported = reference.resolved.relativePath;
      if (!imported || reachable.has(imported) || !isProductionAuthorityPath(imported)) continue;
      if (!SOURCE_EXTENSIONS.includes(extname(imported))) continue;
      reachable.add(imported);
      queue.push(imported);
    }
    for (const imported of collectImportMetaGlobFiles(projectRoot, file, inventoryPaths)) {
      if (reachable.has(imported) || !isProductionAuthorityPath(imported)) continue;
      reachable.add(imported);
      queue.push(imported);
    }
  }

  const unreachable = targets.filter((file) => !reachable.has(file));
  return {
    allReachable: entrypoints.length > 0 && unreachable.length === 0,
    entrypoints,
    unreachable,
  };
}

function collectImportMetaGlobFiles(
  projectRoot: string,
  sourceFile: string,
  inventoryPaths: Set<string>,
): string[] {
  let content = '';
  try {
    content = readFileSync(join(projectRoot, sourceFile), 'utf8');
  } catch {
    return [];
  }
  const files = new Set<string>();
  for (const match of content.matchAll(/import\.meta\.glob(?:<[^>]+>)?\(\s*["']([^"']+)["']/gu)) {
    const pattern = match[1];
    const wildcard = pattern.search(/[*!?[\]{}]/u);
    const prefix = wildcard >= 0 ? pattern.slice(0, wildcard) : pattern;
    const absolutePrefix = resolve(dirname(join(projectRoot, sourceFile)), prefix);
    const relativePrefix = relative(projectRoot, absolutePrefix)
      .replace(/\\/g, '/')
      .replace(/\/$/u, '');
    for (const candidate of inventoryPaths) {
      if (candidate === relativePrefix || candidate.startsWith(`${relativePrefix}/`)) {
        files.add(candidate);
      }
    }
  }
  return [...files];
}
