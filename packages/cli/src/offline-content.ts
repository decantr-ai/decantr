import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  strategy: 'workspace-cache' | 'configured-content-root' | 'workspace-content-root' | 'installed-content-package' | null;
}

/**
 * Seed a fresh Decantr project with local content corpus data so offline init/new
 * can resolve blueprints, archetypes, themes, shells, and patterns without the
 * hosted API. Resolution order favors the most explicit local source first:
 * 1. DECANTR_CONTENT_DIR
 * 2. Existing workspace .decantr/cache or .decantr/custom
 * 3. Workspace packages/content
 * 4. Installed @decantr/content package
 */
export function seedOfflineRegistry(
  projectDir: string,
  workspaceRoot: string,
): OfflineRegistrySeedResult {
  const projectDecantrRoot = join(projectDir, '.decantr');
  mkdirSync(projectDecantrRoot, { recursive: true });

  const configuredContentRoot = process.env.DECANTR_CONTENT_DIR
    ? resolve(process.env.DECANTR_CONTENT_DIR)
    : null;
  if (configuredContentRoot && hydrateContentRoot(projectDir, configuredContentRoot)) {
    return { seeded: true, strategy: 'configured-content-root' };
  }

  const copiedCache = copyIfExists(
    join(workspaceRoot, '.decantr', 'cache'),
    join(projectDecantrRoot, 'cache'),
  );
  const copiedCustom = copyIfExists(
    join(workspaceRoot, '.decantr', 'custom'),
    join(projectDecantrRoot, 'custom'),
  );
  if (copiedCache || copiedCustom) {
    return { seeded: true, strategy: 'workspace-cache' };
  }

  const workspaceContentRoot = resolve(workspaceRoot, 'packages', 'content');
  if (hydrateContentRoot(projectDir, workspaceContentRoot)) {
    return { seeded: true, strategy: 'workspace-content-root' };
  }

  const installedContentRoot = resolveInstalledContentRoot();
  if (installedContentRoot && hydrateContentRoot(projectDir, installedContentRoot)) {
    return { seeded: true, strategy: 'installed-content-package' };
  }

  return { seeded: false, strategy: null };
}

function resolveInstalledContentRoot(): string | null {
  try {
    const entry = fileURLToPath(import.meta.resolve('@decantr/content'));
    return resolve(dirname(entry), '..');
  } catch {
    return null;
  }
}
