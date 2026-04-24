/**
 * v2.1 Tier C — CLI wiring for the experiential interaction guard rule.
 *
 * This module connects the dots:
 *   - Reads the project's pack-manifest.json (.decantr/context/)
 *   - Loads each page-pack JSON and extracts declared `interactions[]`
 *     from `data.patterns[]`
 *   - Walks the project source tree
 *   - Calls @decantr/verifier's `verifyInteractionsInSource()` to find
 *     missing implementations
 *   - Formats the missing interactions as `interaction_issues` strings
 *     for `evaluateGuard()` to consume
 *
 * Without this wiring, the C5 guard rule definition exists but has
 * nothing to fire on. With it, `decantr check --strict` fails the build
 * when patterns declare interactions that aren't implemented.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { verifyInteractionsInSource } from '@decantr/verifier';

interface PackManifest {
  pages?: Array<{ id: string; json: string }>;
}

interface PagePackJSON {
  data?: {
    patterns?: Array<{
      interactions?: string[];
    }>;
  };
}

/**
 * File extensions to scan for interaction implementations. Covers JSX/TSX
 * for React, plain JS/TS for vanilla, HTML for marketing scaffolds, MDX
 * for content sites, and CSS for keyframes/class refs.
 */
const SCAN_EXTENSIONS = new Set(['.tsx', '.jsx', '.ts', '.js', '.html', '.mdx', '.css']);

/** Directories to skip when walking the source tree. */
const SKIP_DIRECTORIES = new Set([
  'node_modules',
  '.decantr',
  '.git',
  'dist',
  'build',
  '.next',
  '.turbo',
  'coverage',
  '.cache',
]);

/** Maximum file size to scan (1MB). Larger files are usually generated. */
const MAX_FILE_SIZE = 1024 * 1024;

/**
 * Recursively walk a directory and collect source files for scanning.
 * Skips well-known build/cache directories. Only includes files with
 * extensions in SCAN_EXTENSIONS. Caps individual file size to avoid
 * scanning generated bundles.
 */
function walkSourceTree(rootDir: string): Map<string, string> {
  const sources = new Map<string, string>();

  function walk(dir: string) {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (SKIP_DIRECTORIES.has(entry)) continue;
      const fullPath = join(dir, entry);
      let s;
      try {
        s = statSync(fullPath);
      } catch {
        continue;
      }
      if (s.isDirectory()) {
        walk(fullPath);
      } else if (s.isFile() && SCAN_EXTENSIONS.has(extname(entry))) {
        if (s.size > MAX_FILE_SIZE) continue;
        try {
          sources.set(fullPath, readFileSync(fullPath, 'utf8'));
        } catch {
          // unreadable file — skip silently
        }
      }
    }
  }

  walk(rootDir);
  return sources;
}

/**
 * Read the pack-manifest, load each page-pack, and collect every
 * declared interaction across the project.
 */
function collectDeclaredInteractions(projectRoot: string): string[] {
  const manifestPath = join(projectRoot, '.decantr', 'context', 'pack-manifest.json');
  if (!existsSync(manifestPath)) return [];

  let manifest: PackManifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as PackManifest;
  } catch {
    return [];
  }

  const all: string[] = [];
  const pages = manifest.pages ?? [];

  for (const page of pages) {
    // page.json is a path relative to the project root (e.g.
    // ".decantr/context/page-home.json").
    const packPath = join(projectRoot, page.json);
    if (!existsSync(packPath)) continue;
    let pack: PagePackJSON;
    try {
      pack = JSON.parse(readFileSync(packPath, 'utf8')) as PagePackJSON;
    } catch {
      continue;
    }
    const patterns = pack.data?.patterns ?? [];
    for (const pat of patterns) {
      if (Array.isArray(pat.interactions)) {
        all.push(...pat.interactions);
      }
    }
  }

  return all;
}

/**
 * Top-level helper called from `decantr check`. Returns a list of
 * formatted `interaction_issues` strings ready to pass to
 * `evaluateGuard()` via `GuardContext.interaction_issues`.
 *
 * If the project has no pack-manifest, no declared interactions, or no
 * source files, returns an empty array — guard rule gracefully no-ops.
 */
export function scanProjectInteractions(projectRoot: string): string[] {
  const declared = collectDeclaredInteractions(projectRoot);
  if (declared.length === 0) return [];

  const sources = walkSourceTree(projectRoot);
  if (sources.size === 0) return [];

  const missing = verifyInteractionsInSource(declared, sources);
  return missing.map(({ interaction, suggestion }) => `${interaction} → ${suggestion}`);
}
