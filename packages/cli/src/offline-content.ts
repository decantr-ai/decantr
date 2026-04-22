import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const CONTENT_TYPES = ['archetypes', 'blueprints', 'patterns', 'themes', 'shells'] as const;

function copyIfExists(source: string, target: string): boolean {
  if (!existsSync(source)) return false;
  if (resolve(source) === resolve(target)) return true;
  cpSync(source, target, { recursive: true });
  return true;
}

function hydrateContentRoot(projectDir: string, contentRoot: string): boolean {
  if (!existsSync(contentRoot)) return false;

  const customRoot = join(projectDir, '.decantr', 'custom');
  const cacheRoot = join(projectDir, '.decantr', 'cache', '@official');
  mkdirSync(customRoot, { recursive: true });
  mkdirSync(cacheRoot, { recursive: true });

  let copiedAny = false;
  for (const type of CONTENT_TYPES) {
    const sourceDir = join(contentRoot, type);
    if (!existsSync(sourceDir)) continue;
    cpSync(sourceDir, join(customRoot, type), { recursive: true });
    cpSync(sourceDir, join(cacheRoot, type), { recursive: true });
    copiedAny = true;
  }

  return copiedAny;
}

export interface OfflineRegistrySeedResult {
  seeded: boolean;
  strategy: 'workspace-cache' | 'configured-content-root' | 'sibling-content-root' | null;
}

/**
 * Seed a fresh Decantr project with local registry content so offline init/new
 * can resolve blueprints, archetypes, themes, shells, and patterns without the
 * hosted API. Resolution order favors the most explicit local source first:
 * 1. DECANTR_CONTENT_DIR
 * 2. Existing workspace .decantr/cache or .decantr/custom
 * 3. Sibling ../decantr-content checkout
 */
export function seedOfflineRegistry(
  projectDir: string,
  workspaceRoot: string,
): OfflineRegistrySeedResult {
  const projectDecantrRoot = join(projectDir, '.decantr');
  mkdirSync(projectDecantrRoot, { recursive: true });

  const configuredContentRoot = process.env.DECANTR_CONTENT_DIR ? resolve(process.env.DECANTR_CONTENT_DIR) : null;
  if (configuredContentRoot && hydrateContentRoot(projectDir, configuredContentRoot)) {
    return { seeded: true, strategy: 'configured-content-root' };
  }

  const copiedCache = copyIfExists(join(workspaceRoot, '.decantr', 'cache'), join(projectDecantrRoot, 'cache'));
  const copiedCustom = copyIfExists(join(workspaceRoot, '.decantr', 'custom'), join(projectDecantrRoot, 'custom'));
  if (copiedCache || copiedCustom) {
    return { seeded: true, strategy: 'workspace-cache' };
  }

  const siblingContentRoot = resolve(workspaceRoot, '..', 'decantr-content');
  if (hydrateContentRoot(projectDir, siblingContentRoot)) {
    return { seeded: true, strategy: 'sibling-content-root' };
  }

  return { seeded: false, strategy: null };
}
