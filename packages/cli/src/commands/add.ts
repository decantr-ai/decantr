import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EssenceFile, EssenceSection, EssenceV4 } from '@decantr/essence-spec';
import { isV4 } from '@decantr/essence-spec';
import { RegistryClient } from '../registry.js';
import { refreshDerivedFiles } from '../scaffold.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function readV4Essence(projectRoot: string): { essence: EssenceV4; essencePath: string } | null {
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

  if (!isV4(parsed)) {
    console.error(
      `${RED}Active workflows require Essence v4.0.0. Run \`decantr migrate --to v4\` first.${RESET}`,
    );
    process.exitCode = 1;
    return null;
  }

  return { essence: parsed, essencePath };
}

function writeEssence(essencePath: string, essence: EssenceV4): void {
  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');
}

function readFlagValue(args: string[], name: string): string | undefined {
  const prefix = `--${name}=`;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === `--${name}` && args[index + 1]) return args[index + 1];
    if (arg.startsWith(prefix)) return arg.slice(prefix.length);
  }
  return undefined;
}

function normalizeRoute(route: string): string {
  const trimmed = route.trim();
  if (!trimmed || trimmed === '/') return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function resolveSectionForPage(
  sections: EssenceSection[],
  requestedSectionId: string,
): { section: EssenceSection; resolvedFromAlias: boolean } | null {
  const exact = sections.find((section) => section.id === requestedSectionId);
  if (exact) return { section: exact, resolvedFromAlias: false };

  const lower = requestedSectionId.toLowerCase();
  const roleByAlias: Record<string, EssenceSection['role']> = {
    app: 'primary',
    main: 'primary',
    primary: 'primary',
    public: 'public',
    marketing: 'public',
    auth: 'gateway',
    gateway: 'gateway',
    auxiliary: 'auxiliary',
  };
  const desiredRole = roleByAlias[lower];
  if (!desiredRole) return null;

  const roleMatches = sections.filter((section) => section.role === desiredRole);
  if (roleMatches.length === 1) return { section: roleMatches[0], resolvedFromAlias: true };
  if (roleMatches.length > 1) return null;

  const observedMatch = sections.find((section) => section.id === `observed-${desiredRole}`);
  return observedMatch ? { section: observedMatch, resolvedFromAlias: true } : null;
}

function printSectionNotFound(
  sectionId: string,
  sections: EssenceSection[],
  pageId?: string,
): void {
  console.error(`${RED}Section "${sectionId}" not found.${RESET}`);
  console.error(`${DIM}Available sections: ${sections.map((s) => s.id).join(', ')}${RESET}`);
  if (pageId && sections.length > 0) {
    const primary = sections.find((section) => section.role === 'primary') ?? sections[0];
    console.error(`${DIM}Try: decantr add page ${primary.id}/${pageId}${RESET}`);
  }
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

  const loaded = readV4Essence(projectRoot);
  if (!loaded) return;
  const { essence, essencePath } = loaded;

  const sections = essence.blueprint.sections;
  if (sections.find((s) => s.id === archetypeId)) {
    console.error(`${RED}Section "${archetypeId}" already exists.${RESET}`);
    console.error(`${DIM}Existing sections: ${sections.map((s) => s.id).join(', ')}${RESET}`);
    process.exitCode = 1;
    return;
  }

  // Fetch archetype from the official corpus client
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

  const newSection: EssenceSection = {
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
  if (!path?.includes('/')) {
    console.error(`${RED}Usage: decantr add page <section>/<page>${RESET}`);
    console.error(`${DIM}Example: decantr add page settings/notifications${RESET}`);
    process.exitCode = 1;
    return;
  }

  const [sectionId, pageId] = path.split('/');

  const loaded = readV4Essence(projectRoot);
  if (!loaded) return;
  const { essence, essencePath } = loaded;

  const sections = essence.blueprint.sections;
  const resolved = resolveSectionForPage(sections, sectionId);
  if (!resolved) {
    printSectionNotFound(sectionId, sections, pageId);
    process.exitCode = 1;
    return;
  }
  const { section } = resolved;
  const resolvedSectionId = section.id;

  if (section.pages.find((p) => p.id === pageId)) {
    console.error(
      `${RED}Page "${pageId}" already exists in section "${resolvedSectionId}".${RESET}`,
    );
    process.exitCode = 1;
    return;
  }

  const route = normalizeRoute(readFlagValue(args, 'route') ?? pageId);
  essence.blueprint.routes ??= {};
  const routes = essence.blueprint.routes;
  const existingRoute = routes[route];
  if (existingRoute) {
    console.error(
      `${RED}Route "${route}" already maps to ${existingRoute.section}/${existingRoute.page}.${RESET}`,
    );
    console.error(`${DIM}Pass a unique route with --route /some-path.${RESET}`);
    process.exitCode = 1;
    return;
  }

  section.pages.push({
    id: pageId,
    route,
    layout: ['hero'],
  });
  routes[route] = { section: resolvedSectionId, page: pageId };

  writeEssence(essencePath, essence);

  if (resolved.resolvedFromAlias) {
    console.log(
      `${YELLOW}Resolved section alias "${sectionId}" to "${resolvedSectionId}".${RESET}`,
    );
  }
  console.log(
    `${GREEN}Added page "${pageId}" to section "${resolvedSectionId}" at route "${route}".${RESET}`,
  );

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

  const loaded = readV4Essence(projectRoot);
  if (!loaded) return;
  const { essence, essencePath } = loaded;

  // Parse --section flag
  let sectionId: string | undefined;
  sectionId = readFlagValue(args, 'section');

  if (sectionId) {
    const sections = essence.blueprint.sections;
    const resolved = resolveSectionForPage(sections, sectionId);
    if (!resolved) {
      printSectionNotFound(sectionId, sections);
      process.exitCode = 1;
      return;
    }
    const { section } = resolved;
    const resolvedSectionId = section.id;

    if (!section.features.includes(feature)) {
      section.features.push(feature);
    }
    if (resolved.resolvedFromAlias) {
      console.log(
        `${YELLOW}Resolved section alias "${sectionId}" to "${resolvedSectionId}".${RESET}`,
      );
    }
    sectionId = resolvedSectionId;
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
