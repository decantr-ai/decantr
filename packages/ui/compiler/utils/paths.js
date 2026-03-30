/**
 * Decantr Compiler - Path Resolution Utilities
 */

import { resolve, dirname, join, extname } from 'node:path';
import { existsSync } from 'node:fs';

const BUILD_IMPORT_MAP = {
  'themes': 'css/theme-registry.js',
  'styles': 'css/theme-registry.js'
};

/**
 * Check if import is from decantr framework
 */
export function isDecantrImport(specifier) {
  return specifier === 'decantr' || specifier.startsWith('decantr/');
}

/**
 * Check if import is relative
 */
export function isRelativeImport(specifier) {
  return specifier.startsWith('./') || specifier.startsWith('../');
}

/**
 * Resolve decantr framework import
 */
export function resolveDecantrImport(specifier, frameworkSrc) {
  const subpath = specifier.replace('decantr/', '').replace('decantr', 'core');
  const mapped = BUILD_IMPORT_MAP[subpath];

  if (mapped) {
    return join(frameworkSrc, mapped);
  }

  // Handle styles/community/* path
  if (subpath.startsWith('styles/community/')) {
    const styleName = subpath.replace('styles/community/', '');
    return join(frameworkSrc, 'css/styles/community', styleName + '.js');
  }

  // Handle styles/* (non-community)
  if (subpath.startsWith('styles/')) {
    const styleName = subpath.replace('styles/', '');
    const directPath = join(frameworkSrc, 'css/styles', styleName + '.js');
    if (existsSync(directPath)) {
      return directPath;
    }
    // Also check the addons/ subdirectory (e.g. glassmorphism lives in addons/)
    return join(frameworkSrc, 'css/styles/addons', styleName + '.js');
  }

  // If subpath has .js extension, use it directly
  if (subpath.endsWith('.js')) {
    const direct = join(frameworkSrc, subpath);
    if (existsSync(direct)) {
      return direct;
    }
  }

  // Try as directory with index.js
  const indexPath = join(frameworkSrc, subpath, 'index.js');
  if (existsSync(indexPath)) {
    return indexPath;
  }

  // Try adding .js extension
  const withExt = join(frameworkSrc, subpath + '.js');
  if (existsSync(withExt)) {
    return withExt;
  }

  // Fallback to index.js (will error at read time if doesn't exist)
  return indexPath;
}

/**
 * Resolve relative import path
 */
export function resolvePath(specifier, fromFile) {
  const dir = dirname(fromFile);
  let resolved = resolve(dir, specifier);

  // Try extensions
  if (!extname(resolved)) {
    const extensions = ['.js', '.mjs', '.json'];

    for (const ext of extensions) {
      if (existsSync(resolved + ext)) {
        return resolved + ext;
      }
    }

    // Try index.js
    const indexPath = join(resolved, 'index.js');
    if (existsSync(indexPath)) {
      return indexPath;
    }
  }

  // If has extension but doesn't exist, still return it
  // (error will be caught during file read)
  if (!existsSync(resolved) && !extname(resolved)) {
    resolved += '.js';
  }

  return resolved;
}

/**
 * Get relative path for output
 */
export function getOutputPath(file, root, outDir) {
  const rel = file.startsWith(root)
    ? file.slice(root.length + 1)
    : file;
  return join(outDir, rel);
}

/**
 * Normalize path separators for consistent keys
 */
export function normalizePath(p) {
  return p.replace(/\\/g, '/');
}
