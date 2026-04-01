# Composition Pipeline Phase 3: Progressive Mutation Commands

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add CLI commands that mutate the essence structurally — add/remove sections, pages, features; switch themes; and regenerate all derived files — so the essence evolves with the app instead of being a one-shot scaffold.

**Architecture:** Each mutation command reads the essence, applies a structural change, writes the updated essence, and calls `refresh` to regenerate all derived files (DECANTR.md, section contexts, scaffold.md, CSS). The `refresh` command is the foundation — it regenerates everything from essence + registry.

**Tech Stack:** TypeScript, Vitest, CLI (packages/cli)

**Spec:** `docs/specs/2026-04-01-composition-pipeline-v2-design.md` (Phase 3 section)

---

## File Map

| File | Change | Responsibility |
|------|--------|---------------|
| `packages/cli/src/commands/refresh.ts` | Create | Regenerate all derived files from essence + registry |
| `packages/cli/src/commands/add.ts` | Create | `decantr add section/page/feature` mutations |
| `packages/cli/src/commands/remove.ts` | Create | `decantr remove section/page/feature` mutations |
| `packages/cli/src/commands/theme-switch.ts` | Create | `decantr theme switch` with CSS regeneration |
| `packages/cli/src/index.ts` | Modify | Register new commands |
| `packages/cli/src/scaffold.ts` | Modify | Extract `refreshDerivedFiles()` from scaffoldProject |
| `packages/cli/test/refresh.test.ts` | Create | Tests for refresh |
| `packages/cli/test/add-remove.test.ts` | Create | Tests for add/remove mutations |

---

## Task 1: Extract refreshDerivedFiles from scaffoldProject

The refresh logic currently lives inside `scaffoldProject`. Extract it into a standalone function that can be called by `decantr refresh` and by mutation commands after they modify the essence.

**Files:**
- Modify: `packages/cli/src/scaffold.ts`

- [ ] **Step 1: Identify the refresh-relevant code in scaffoldProject**

In `scaffoldProject`, the section that generates derived files is (after the essence is written):
- Generate DECANTR.md
- Generate tokens.css + decorators.css
- Generate section context files
- Generate scaffold.md

- [ ] **Step 2: Create refreshDerivedFiles function**

```ts
export interface RefreshInput {
  projectRoot: string;
  essence: EssenceV3;
  registryClient: RegistryClient;
  themeData?: ThemeData;
  recipeData?: RecipeData;
}

export async function refreshDerivedFiles(input: RefreshInput): Promise<{
  decantrMd: string;
  sectionContexts: string[];
  scaffoldMd: string;
  tokensCss: string;
  decoratorsCss: string;
}> {
  // 1. Read essence to get sections, routes, DNA, meta
  // 2. Fetch theme + recipe from registry for CSS generation
  // 3. Fetch patterns referenced by sections for context inlining
  // 4. Generate DECANTR.md (simplified primer)
  // 5. Generate tokens.css + decorators.css
  // 6. Derive topology from sections
  // 7. Generate section context files with inlined everything
  // 8. Generate scaffold.md
  // 9. Write all files
  // Return list of generated files
}
```

This function needs to:
- Read the essence from disk (or accept it as parameter)
- Fetch theme/recipe/pattern data from registry
- Call generateDecantrMdV31, generateTokensCSS, generateDecoratorsCSS, generateSectionContext, generateScaffoldContext, deriveZones, deriveTransitions, generateTopologySection
- Write all output files

The key is that refresh should work from JUST the essence + registry — no blueprint data needed (the essence already has everything).

- [ ] **Step 3: Update scaffoldProject to call refreshDerivedFiles**

After writing the essence in scaffoldProject, call refreshDerivedFiles instead of the inline generation code.

- [ ] **Step 4: Build and test**

```bash
pnpm --filter decantr run build
pnpm test
```

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/scaffold.ts
git commit -m "refactor(cli): extract refreshDerivedFiles from scaffoldProject"
```

---

## Task 2: decantr refresh Command

**Files:**
- Create: `packages/cli/src/commands/refresh.ts`
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Create the refresh command**

```ts
// packages/cli/src/commands/refresh.ts

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isV3 } from '@decantr/essence-spec';
import type { EssenceV3 } from '@decantr/essence-spec';
import { refreshDerivedFiles } from '../scaffold.js';
import { RegistryClient } from '../registry.js';

export async function cmdRefresh(args: { registry?: string; offline?: boolean }) {
  const projectRoot = process.cwd();
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error('No decantr.essence.json found. Run decantr init first.');
    process.exit(1);
  }

  const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceV3;
  if (!isV3(essence)) {
    console.error('Essence is not V3 format. Run decantr migrate first.');
    process.exit(1);
  }

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: args.registry,
    offline: args.offline,
  });

  console.log('Refreshing derived files...');
  const result = await refreshDerivedFiles({ projectRoot, essence, registryClient });

  console.log('Files regenerated:');
  console.log('  DECANTR.md');
  console.log('  src/styles/tokens.css');
  console.log('  src/styles/decorators.css');
  console.log(`  ${result.sectionContexts.length} section context files`);
  console.log('  scaffold.md');
}
```

- [ ] **Step 2: Register in index.ts**

Add to the command switch in `cmdInit`... actually, in the main command dispatcher. Find the switch statement that handles commands and add:

```ts
case 'refresh':
  await cmdRefresh({ registry: initArgs.registry, offline: initArgs.offline });
  break;
```

Import: `import { cmdRefresh } from './commands/refresh.js';`

- [ ] **Step 3: Build and test manually**

```bash
pnpm --filter decantr run build
cd apps/showcase/carbon-ai-portal
node ../../../packages/cli/dist/bin.js refresh
```

Expected: "Refreshing derived files..." → list of regenerated files.

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/commands/refresh.ts packages/cli/src/index.ts
git commit -m "feat(cli): add decantr refresh command"
```

---

## Task 3: decantr add section Command

**Files:**
- Create: `packages/cli/src/commands/add.ts`
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Create the add command handler**

```ts
// packages/cli/src/commands/add.ts

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isV3, migrateV30ToV31 } from '@decantr/essence-spec';
import type { EssenceV3, EssenceV31Section } from '@decantr/essence-spec';
import { RegistryClient } from '../registry.js';
import { refreshDerivedFiles } from '../scaffold.js';

export async function cmdAddSection(archetypeId: string, args: { registry?: string; offline?: boolean }) {
  const projectRoot = process.cwd();
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error('No decantr.essence.json found. Run decantr init first.');
    process.exit(1);
  }

  let essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceV3;
  if (!isV3(essence)) {
    console.error('Essence is not V3 format. Run decantr migrate first.');
    process.exit(1);
  }

  // Auto-migrate V3.0 to V3.1 if needed
  essence = migrateV30ToV31(essence);

  // Check if section already exists
  if (essence.blueprint.sections?.some(s => s.id === archetypeId)) {
    console.error(`Section "${archetypeId}" already exists.`);
    process.exit(1);
  }

  // Fetch archetype from registry
  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: args.registry,
    offline: args.offline,
  });

  const archetypeResult = await registryClient.fetchArchetype(archetypeId);
  if (!archetypeResult) {
    console.error(`Archetype "${archetypeId}" not found in registry.`);
    process.exit(1);
  }

  const raw = archetypeResult.data as Record<string, unknown>;
  const archData = (raw.data ?? raw) as Record<string, any>;

  // Build the new section
  const newSection: EssenceV31Section = {
    id: archetypeId,
    role: archData.role || 'auxiliary',
    shell: archData.pages?.[0]?.shell || 'sidebar-main',
    features: archData.features || [],
    description: archData.description || '',
    pages: (archData.pages || []).map((p: any) => ({
      id: p.id,
      layout: p.default_layout || ['hero'],
      ...(p.shell !== (archData.pages?.[0]?.shell) ? { shell_override: p.shell } : {}),
    })),
  };

  // Add section to essence
  essence.blueprint.sections = essence.blueprint.sections || [];
  essence.blueprint.sections.push(newSection);

  // Update global features
  const allFeatures = new Set(essence.blueprint.features);
  for (const f of newSection.features) allFeatures.add(f);
  essence.blueprint.features = [...allFeatures];

  // Write updated essence
  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');
  console.log(`Added section: ${archetypeId} (${newSection.role})`);
  console.log(`  Shell: ${newSection.shell}`);
  console.log(`  Pages: ${newSection.pages.map(p => p.id).join(', ')}`);
  console.log(`  Features: ${newSection.features.join(', ')}`);

  // Refresh derived files
  console.log('\nRefreshing derived files...');
  await refreshDerivedFiles({ projectRoot, essence, registryClient });
  console.log('Done.');
}

export async function cmdAddPage(path: string, args: { registry?: string; offline?: boolean }) {
  const [sectionId, pageId] = path.split('/');
  if (!sectionId || !pageId) {
    console.error('Usage: decantr add page <section>/<page>');
    process.exit(1);
  }

  const projectRoot = process.cwd();
  const essencePath = join(projectRoot, 'decantr.essence.json');

  let essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceV3;
  essence = migrateV30ToV31(essence);

  const section = essence.blueprint.sections?.find(s => s.id === sectionId);
  if (!section) {
    console.error(`Section "${sectionId}" not found. Available: ${essence.blueprint.sections?.map(s => s.id).join(', ')}`);
    process.exit(1);
  }

  if (section.pages.some(p => p.id === pageId)) {
    console.error(`Page "${pageId}" already exists in section "${sectionId}".`);
    process.exit(1);
  }

  // Add page with default layout
  section.pages.push({ id: pageId, layout: ['hero'] });

  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');
  console.log(`Added page: ${sectionId}/${pageId}`);

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: args.registry,
    offline: args.offline,
  });

  console.log('Refreshing derived files...');
  await refreshDerivedFiles({ projectRoot, essence, registryClient });
  console.log('Done.');
}

export async function cmdAddFeature(feature: string, args: { section?: string; registry?: string; offline?: boolean }) {
  const projectRoot = process.cwd();
  const essencePath = join(projectRoot, 'decantr.essence.json');

  let essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceV3;
  essence = migrateV30ToV31(essence);

  // Add to specific section if specified
  if (args.section) {
    const section = essence.blueprint.sections?.find(s => s.id === args.section);
    if (!section) {
      console.error(`Section "${args.section}" not found.`);
      process.exit(1);
    }
    if (!section.features.includes(feature)) {
      section.features.push(feature);
    }
  }

  // Add to global features
  if (!essence.blueprint.features.includes(feature)) {
    essence.blueprint.features.push(feature);
  }

  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');
  console.log(`Added feature: ${feature}${args.section ? ` (section: ${args.section})` : ' (global)'}`);

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: args.registry,
    offline: args.offline,
  });

  console.log('Refreshing derived files...');
  await refreshDerivedFiles({ projectRoot, essence, registryClient });
  console.log('Done.');
}
```

- [ ] **Step 2: Register add commands in index.ts**

```ts
case 'add': {
  const subcommand = args[1]; // section, page, or feature
  const target = args[2];     // archetype ID, section/page path, or feature name
  if (!subcommand || !target) {
    console.error('Usage: decantr add <section|page|feature> <target>');
    process.exit(1);
  }
  switch (subcommand) {
    case 'section':
      await cmdAddSection(target, { registry: initArgs.registry, offline: initArgs.offline });
      break;
    case 'page':
      await cmdAddPage(target, { registry: initArgs.registry, offline: initArgs.offline });
      break;
    case 'feature':
      await cmdAddFeature(target, { section: args[3], registry: initArgs.registry, offline: initArgs.offline });
      break;
    default:
      console.error(`Unknown add target: ${subcommand}. Use: section, page, feature`);
  }
  break;
}
```

- [ ] **Step 3: Build and test**

```bash
pnpm --filter decantr run build
pnpm test
```

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/commands/add.ts packages/cli/src/index.ts
git commit -m "feat(cli): add decantr add section/page/feature commands"
```

---

## Task 4: decantr remove section/page/feature Command

**Files:**
- Create: `packages/cli/src/commands/remove.ts`
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Create the remove command handler**

```ts
// packages/cli/src/commands/remove.ts

import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { isV3, migrateV30ToV31 } from '@decantr/essence-spec';
import type { EssenceV3 } from '@decantr/essence-spec';
import { RegistryClient } from '../registry.js';
import { refreshDerivedFiles } from '../scaffold.js';

export async function cmdRemoveSection(sectionId: string, args: { registry?: string; offline?: boolean }) {
  const projectRoot = process.cwd();
  const essencePath = join(projectRoot, 'decantr.essence.json');

  let essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceV3;
  essence = migrateV30ToV31(essence);

  const sectionIndex = essence.blueprint.sections?.findIndex(s => s.id === sectionId) ?? -1;
  if (sectionIndex === -1) {
    console.error(`Section "${sectionId}" not found.`);
    process.exit(1);
  }

  const removed = essence.blueprint.sections!.splice(sectionIndex, 1)[0];

  // Recompute global features from remaining sections
  const allFeatures = new Set<string>();
  for (const s of essence.blueprint.sections!) {
    for (const f of s.features) allFeatures.add(f);
  }
  essence.blueprint.features = [...allFeatures];

  // Remove routes pointing to this section
  if (essence.blueprint.routes) {
    for (const [path, entry] of Object.entries(essence.blueprint.routes)) {
      if (entry.section === sectionId) {
        delete essence.blueprint.routes[path];
      }
    }
  }

  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');
  console.log(`Removed section: ${sectionId} (${removed.pages.length} pages, ${removed.features.length} features)`);

  // Remove the section context file
  const contextPath = join(projectRoot, '.decantr', 'context', `section-${sectionId}.md`);
  if (existsSync(contextPath)) unlinkSync(contextPath);

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: args.registry,
    offline: args.offline,
  });

  console.log('Refreshing derived files...');
  await refreshDerivedFiles({ projectRoot, essence, registryClient });
  console.log('Done.');
}

export async function cmdRemovePage(path: string, args: { registry?: string; offline?: boolean }) {
  const [sectionId, pageId] = path.split('/');
  if (!sectionId || !pageId) {
    console.error('Usage: decantr remove page <section>/<page>');
    process.exit(1);
  }

  const projectRoot = process.cwd();
  const essencePath = join(projectRoot, 'decantr.essence.json');

  let essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceV3;
  essence = migrateV30ToV31(essence);

  const section = essence.blueprint.sections?.find(s => s.id === sectionId);
  if (!section) {
    console.error(`Section "${sectionId}" not found.`);
    process.exit(1);
  }

  const pageIndex = section.pages.findIndex(p => p.id === pageId);
  if (pageIndex === -1) {
    console.error(`Page "${pageId}" not found in section "${sectionId}".`);
    process.exit(1);
  }

  section.pages.splice(pageIndex, 1);

  // Remove route for this page
  if (essence.blueprint.routes) {
    for (const [path, entry] of Object.entries(essence.blueprint.routes)) {
      if (entry.section === sectionId && entry.page === pageId) {
        delete essence.blueprint.routes[path];
      }
    }
  }

  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');
  console.log(`Removed page: ${sectionId}/${pageId}`);

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: args.registry,
    offline: args.offline,
  });

  console.log('Refreshing derived files...');
  await refreshDerivedFiles({ projectRoot, essence, registryClient });
  console.log('Done.');
}

export async function cmdRemoveFeature(feature: string, args: { section?: string; registry?: string; offline?: boolean }) {
  const projectRoot = process.cwd();
  const essencePath = join(projectRoot, 'decantr.essence.json');

  let essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceV3;
  essence = migrateV30ToV31(essence);

  if (args.section) {
    const section = essence.blueprint.sections?.find(s => s.id === args.section);
    if (section) {
      section.features = section.features.filter(f => f !== feature);
    }
  }

  essence.blueprint.features = essence.blueprint.features.filter(f => f !== feature);

  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');
  console.log(`Removed feature: ${feature}`);

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: args.registry,
    offline: args.offline,
  });

  console.log('Refreshing derived files...');
  await refreshDerivedFiles({ projectRoot, essence, registryClient });
  console.log('Done.');
}
```

- [ ] **Step 2: Register in index.ts**

```ts
case 'remove': {
  const subcommand = args[1];
  const target = args[2];
  if (!subcommand || !target) {
    console.error('Usage: decantr remove <section|page|feature> <target>');
    process.exit(1);
  }
  switch (subcommand) {
    case 'section':
      await cmdRemoveSection(target, { registry: initArgs.registry, offline: initArgs.offline });
      break;
    case 'page':
      await cmdRemovePage(target, { registry: initArgs.registry, offline: initArgs.offline });
      break;
    case 'feature':
      await cmdRemoveFeature(target, { section: args[3], registry: initArgs.registry, offline: initArgs.offline });
      break;
    default:
      console.error(`Unknown remove target: ${subcommand}. Use: section, page, feature`);
  }
  break;
}
```

- [ ] **Step 3: Build and test**

```bash
pnpm --filter decantr run build
pnpm test
```

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/commands/remove.ts packages/cli/src/index.ts
git commit -m "feat(cli): add decantr remove section/page/feature commands"
```

---

## Task 5: decantr theme switch Command

**Files:**
- Create: `packages/cli/src/commands/theme-switch.ts`
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Create the theme switch command**

```ts
// packages/cli/src/commands/theme-switch.ts

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isV3, migrateV30ToV31 } from '@decantr/essence-spec';
import type { EssenceV3 } from '@decantr/essence-spec';
import { RegistryClient } from '../registry.js';
import { refreshDerivedFiles } from '../scaffold.js';

export async function cmdThemeSwitch(
  themeName: string,
  args: { recipe?: string; shape?: string; mode?: string; registry?: string; offline?: boolean }
) {
  const projectRoot = process.cwd();
  const essencePath = join(projectRoot, 'decantr.essence.json');

  let essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceV3;
  essence = migrateV30ToV31(essence);

  const oldTheme = essence.dna.theme.style;

  // Update DNA theme
  essence.dna.theme.style = themeName;
  essence.dna.theme.recipe = args.recipe || themeName;
  if (args.shape) essence.dna.theme.shape = args.shape;
  if (args.mode) essence.dna.theme.mode = args.mode;

  // Fetch new theme to update radius hints
  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: args.registry,
    offline: args.offline,
  });

  const themeResult = await registryClient.fetchTheme(themeName);
  if (!themeResult) {
    console.error(`Theme "${themeName}" not found in registry.`);
    process.exit(1);
  }

  // Fetch recipe for radius/animation hints
  const recipeResult = await registryClient.fetchRecipe(args.recipe || themeName);
  if (recipeResult) {
    const raw = recipeResult.data as Record<string, unknown>;
    const recipe = (raw.data ?? raw) as Record<string, any>;
    if (recipe.radius_hints) {
      essence.dna.radius = recipe.radius_hints;
    }
  }

  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');
  console.log(`Theme switched: ${oldTheme} → ${themeName}`);
  console.log(`  Recipe: ${essence.dna.theme.recipe}`);
  console.log(`  Mode: ${essence.dna.theme.mode}`);
  console.log(`  Shape: ${essence.dna.theme.shape}`);

  console.log('\nRefreshing derived files (tokens.css, decorators.css, context files)...');
  await refreshDerivedFiles({ projectRoot, essence, registryClient });
  console.log('Done.');
  console.log('\nNote: Guard will flag code using old theme tokens. Run decantr check to see violations.');
}
```

- [ ] **Step 2: Register in index.ts**

Update the existing `theme` command handler to support a `switch` subcommand:

```ts
case 'theme': {
  const subcommand = args[1];
  if (subcommand === 'switch') {
    const themeName = args[2];
    if (!themeName) {
      console.error('Usage: decantr theme switch <theme-name> [--recipe=X] [--shape=X] [--mode=X]');
      process.exit(1);
    }
    await cmdThemeSwitch(themeName, {
      recipe: initArgs.recipe,
      shape: initArgs.shape,
      mode: initArgs.mode,
      registry: initArgs.registry,
      offline: initArgs.offline,
    });
    break;
  }
  // ... existing theme subcommands (create, list, validate, delete, import)
}
```

- [ ] **Step 3: Build and test**

```bash
pnpm --filter decantr run build
pnpm test
```

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/commands/theme-switch.ts packages/cli/src/index.ts
git commit -m "feat(cli): add decantr theme switch command"
```

---

## Task 6: Update Help Text and Verify

**Files:**
- Modify: `packages/cli/src/index.ts` (help function)

- [ ] **Step 1: Update help text**

Add the new commands to the help output:

```
decantr refresh         Regenerate all context files from essence + registry
decantr add section X   Compose a new archetype into the project
decantr add page X/Y    Add a page to a section
decantr add feature X   Enable a feature (--section=X for section-scoped)
decantr remove section X Remove a section and its pages
decantr remove page X/Y  Remove a page from a section
decantr remove feature X Disable a feature
decantr theme switch X   Change theme (regenerates CSS + contexts)
```

- [ ] **Step 2: Full test run**

```bash
pnpm build
pnpm test
```

- [ ] **Step 3: Manual verification with showcase**

```bash
cd apps/showcase/carbon-ai-portal

# Test refresh
node ../../../packages/cli/dist/bin.js refresh

# Test add feature
node ../../../packages/cli/dist/bin.js add feature webhooks --section=ai-chatbot

# Verify feature was added
grep webhooks decantr.essence.json

# Test remove feature
node ../../../packages/cli/dist/bin.js remove feature webhooks

# Verify feature was removed
grep webhooks decantr.essence.json || echo "removed successfully"

# Test theme switch
node ../../../packages/cli/dist/bin.js theme switch terminal --shape=sharp
cat src/styles/tokens.css | head -5
# Switch back
node ../../../packages/cli/dist/bin.js theme switch carbon --shape=rounded
```

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/index.ts
git commit -m "feat(cli): update help text with mutation commands"
```
