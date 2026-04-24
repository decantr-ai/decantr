import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EssenceFile, EssenceV3, EssenceV31Section } from '@decantr/essence-spec';
import { isV3, migrateV30ToV31 } from '@decantr/essence-spec';
import { RegistryClient } from '../registry.js';
import { refreshDerivedFiles } from '../scaffold.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
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
 * `decantr add section <archetypeId>`
 */
export async function cmdAddSection(
  archetypeId: string,
  args: string[],
  projectRoot: string = process.cwd(),
): Promise<void> {
  if (!archetypeId) {
    console.error(`${RED}Usage: decantr add section <archetypeId>${RESET}`);
    process.exitCode = 1;
    return;
  }

  const loaded = readAndMigrate(projectRoot);
  if (!loaded) return;
  const { essence, essencePath } = loaded;

  const sections = essence.blueprint.sections!;
  if (sections.find((s) => s.id === archetypeId)) {
    console.error(`${RED}Section "${archetypeId}" already exists.${RESET}`);
    console.error(`${DIM}Existing sections: ${sections.map((s) => s.id).join(', ')}${RESET}`);
    process.exitCode = 1;
    return;
  }

  // Fetch archetype from registry
  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
  });

  const result = await registryClient.fetchArchetype(archetypeId);
  if (!result) {
    console.error(`${RED}Archetype "${archetypeId}" not found in registry.${RESET}`);
    console.error(`${DIM}Run \`decantr list archetypes\` to see available archetypes.${RESET}`);
    process.exitCode = 1;
    return;
  }

  const archetype = result.data;

  const newSection: EssenceV31Section = {
    id: archetype.id || archetypeId,
    role: archetype.role || 'auxiliary',
    shell: archetype.pages?.[0]?.shell || essence.blueprint.shell || 'top-nav-main',
    features: archetype.features || [],
    description: archetype.description || '',
    pages: (archetype.pages || []).map((p) => ({
      id: p.id,
      layout: p.default_layout?.length ? p.default_layout : ['hero'],
    })),
  };

  sections.push(newSection);

  // Update global features (merge new section's features)
  const allFeatures = new Set(essence.blueprint.features);
  for (const f of newSection.features) {
    allFeatures.add(f);
  }
  essence.blueprint.features = [...allFeatures];

  writeEssence(essencePath, essence);

  console.log(
    `${GREEN}Added section "${archetypeId}" with ${newSection.pages.length} page(s).${RESET}`,
  );

  await refreshDerivedFiles(projectRoot, essence, registryClient);
  console.log(`${GREEN}Derived files refreshed.${RESET}`);
}

/**
 * `decantr add page <section/page>`
 */
export async function cmdAddPage(
  path: string,
  args: string[],
  projectRoot: string = process.cwd(),
): Promise<void> {
  if (!path || !path.includes('/')) {
    console.error(`${RED}Usage: decantr add page <section>/<page>${RESET}`);
    console.error(`${DIM}Example: decantr add page settings/notifications${RESET}`);
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

  if (section.pages.find((p) => p.id === pageId)) {
    console.error(`${RED}Page "${pageId}" already exists in section "${sectionId}".${RESET}`);
    process.exitCode = 1;
    return;
  }

  section.pages.push({
    id: pageId,
    layout: ['hero'],
  });

  writeEssence(essencePath, essence);

  console.log(`${GREEN}Added page "${pageId}" to section "${sectionId}".${RESET}`);

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
  });
  await refreshDerivedFiles(projectRoot, essence, registryClient);
  console.log(`${GREEN}Derived files refreshed.${RESET}`);
}

/**
 * `decantr add feature <feature>` [--section <sectionId>]
 */
export async function cmdAddFeature(
  feature: string,
  args: string[],
  projectRoot: string = process.cwd(),
): Promise<void> {
  if (!feature) {
    console.error(`${RED}Usage: decantr add feature <feature> [--section <sectionId>]${RESET}`);
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

    if (!section.features.includes(feature)) {
      section.features.push(feature);
    }
  }

  // Add to global features
  if (!essence.blueprint.features.includes(feature)) {
    essence.blueprint.features.push(feature);
  }

  writeEssence(essencePath, essence);

  const target = sectionId ? `section "${sectionId}" and global` : 'global';
  console.log(`${GREEN}Added feature "${feature}" to ${target} features.${RESET}`);

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
  });
  await refreshDerivedFiles(projectRoot, essence, registryClient);
  console.log(`${GREEN}Derived files refreshed.${RESET}`);
}
