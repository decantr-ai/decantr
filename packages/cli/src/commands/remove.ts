import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EssenceFile, EssenceV3 } from '@decantr/essence-spec';
import { isV3, migrateV30ToV31 } from '@decantr/essence-spec';
import { RegistryClient } from '../registry.js';
import { refreshDerivedFiles } from '../scaffold.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function readAndMigrate(projectRoot: string): { essence: EssenceV3; essencePath: string } | null {
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error(`${RED}No decantr.essence.json found. Run \`decantr init\` first.${RESET}`);
    process.exitCode = 1;
    return null;
  }

  let parsed: EssenceFile;
  try {
    parsed = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceFile;
  } catch (e) {
    console.error(`${RED}Could not read essence: ${(e as Error).message}${RESET}`);
    process.exitCode = 1;
    return null;
  }

  if (!isV3(parsed)) {
    console.error(`${RED}Essence is not v3. Run \`decantr migrate\` first.${RESET}`);
    process.exitCode = 1;
    return null;
  }

  const essence = migrateV30ToV31(parsed);
  return { essence, essencePath };
}

function writeEssence(essencePath: string, essence: EssenceV3): void {
  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');
}

/**
 * Recompute global features from all remaining sections.
 */
function recomputeGlobalFeatures(essence: EssenceV3): void {
  const all = new Set<string>();
  for (const section of essence.blueprint.sections || []) {
    for (const f of section.features) {
      all.add(f);
    }
  }
  essence.blueprint.features = [...all];
}

/**
 * Remove routes that reference a given section (and optionally a specific page).
 */
function removeRoutes(essence: EssenceV3, sectionId: string, pageId?: string): void {
  if (!essence.blueprint.routes) return;
  const routes = essence.blueprint.routes;
  for (const [path, entry] of Object.entries(routes)) {
    if (entry.section === sectionId) {
      if (!pageId || entry.page === pageId) {
        delete routes[path];
      }
    }
  }
}

/**
 * `decantr remove section <sectionId>`
 */
export async function cmdRemoveSection(
  sectionId: string,
  args: string[],
  projectRoot: string = process.cwd(),
): Promise<void> {
  if (!sectionId) {
    console.error(`${RED}Usage: decantr remove section <sectionId>${RESET}`);
    process.exitCode = 1;
    return;
  }

  const loaded = readAndMigrate(projectRoot);
  if (!loaded) return;
  const { essence, essencePath } = loaded;

  const sections = essence.blueprint.sections!;
  const idx = sections.findIndex((s) => s.id === sectionId);
  if (idx === -1) {
    console.error(`${RED}Section "${sectionId}" not found.${RESET}`);
    console.error(`${DIM}Available sections: ${sections.map((s) => s.id).join(', ')}${RESET}`);
    process.exitCode = 1;
    return;
  }

  sections.splice(idx, 1);

  // Recompute global features from remaining sections
  recomputeGlobalFeatures(essence);

  // Remove routes pointing to this section
  removeRoutes(essence, sectionId);

  // Delete the section context file
  const contextFile = join(projectRoot, '.decantr', 'context', `${sectionId}.md`);
  if (existsSync(contextFile)) {
    rmSync(contextFile);
  }

  writeEssence(essencePath, essence);

  console.log(`${GREEN}Removed section "${sectionId}".${RESET}`);

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
  });
  await refreshDerivedFiles(projectRoot, essence, registryClient);
  console.log(`${GREEN}Derived files refreshed.${RESET}`);
}

/**
 * `decantr remove page <section/page>`
 */
export async function cmdRemovePage(
  path: string,
  args: string[],
  projectRoot: string = process.cwd(),
): Promise<void> {
  if (!path || !path.includes('/')) {
    console.error(`${RED}Usage: decantr remove page <section>/<page>${RESET}`);
    console.error(`${DIM}Example: decantr remove page settings/notifications${RESET}`);
    process.exitCode = 1;
    return;
  }

  const [sectionId, pageId] = path.split('/');

  const loaded = readAndMigrate(projectRoot);
  if (!loaded) return;
  const { essence, essencePath } = loaded;

  const sections = essence.blueprint.sections!;
  const section = sections.find((s) => s.id === sectionId);
  if (!section) {
    console.error(`${RED}Section "${sectionId}" not found.${RESET}`);
    console.error(`${DIM}Available sections: ${sections.map((s) => s.id).join(', ')}${RESET}`);
    process.exitCode = 1;
    return;
  }

  const pageIdx = section.pages.findIndex((p) => p.id === pageId);
  if (pageIdx === -1) {
    console.error(`${RED}Page "${pageId}" not found in section "${sectionId}".${RESET}`);
    console.error(`${DIM}Available pages: ${section.pages.map((p) => p.id).join(', ')}${RESET}`);
    process.exitCode = 1;
    return;
  }

  section.pages.splice(pageIdx, 1);

  // Remove routes pointing to this page
  removeRoutes(essence, sectionId, pageId);

  writeEssence(essencePath, essence);

  console.log(`${GREEN}Removed page "${pageId}" from section "${sectionId}".${RESET}`);

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
  });
  await refreshDerivedFiles(projectRoot, essence, registryClient);
  console.log(`${GREEN}Derived files refreshed.${RESET}`);
}

/**
 * `decantr remove feature <feature>` [--section <sectionId>]
 */
export async function cmdRemoveFeature(
  feature: string,
  args: string[],
  projectRoot: string = process.cwd(),
): Promise<void> {
  if (!feature) {
    console.error(`${RED}Usage: decantr remove feature <feature> [--section <sectionId>]${RESET}`);
    process.exitCode = 1;
    return;
  }

  const loaded = readAndMigrate(projectRoot);
  if (!loaded) return;
  const { essence, essencePath } = loaded;

  // Parse --section flag
  let sectionId: string | undefined;
  const sectionIdx = args.indexOf('--section');
  if (sectionIdx !== -1 && args[sectionIdx + 1]) {
    sectionId = args[sectionIdx + 1];
  }

  if (sectionId) {
    const sections = essence.blueprint.sections!;
    const section = sections.find((s) => s.id === sectionId);
    if (!section) {
      console.error(`${RED}Section "${sectionId}" not found.${RESET}`);
      console.error(`${DIM}Available sections: ${sections.map((s) => s.id).join(', ')}${RESET}`);
      process.exitCode = 1;
      return;
    }

    const fIdx = section.features.indexOf(feature);
    if (fIdx !== -1) {
      section.features.splice(fIdx, 1);
    }
  }

  // Remove from global features
  const globalIdx = essence.blueprint.features.indexOf(feature);
  if (globalIdx !== -1) {
    essence.blueprint.features.splice(globalIdx, 1);
  }

  writeEssence(essencePath, essence);

  const target = sectionId ? `section "${sectionId}" and global` : 'global';
  console.log(`${GREEN}Removed feature "${feature}" from ${target} features.${RESET}`);

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
  });
  await refreshDerivedFiles(projectRoot, essence, registryClient);
  console.log(`${GREEN}Derived files refreshed.${RESET}`);
}
