import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { isV3, migrateV30ToV31 } from '@decantr/essence-spec';
import type { EssenceV3 } from '@decantr/essence-spec';
import { refreshDerivedFiles } from '../scaffold.js';
import { RegistryClient } from '../registry.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

/**
 * `decantr theme switch <themeName>` [--recipe <recipe>] [--shape <shape>] [--mode <mode>]
 */
export async function cmdThemeSwitch(
  themeName: string,
  args: string[],
  projectRoot: string = process.cwd(),
): Promise<void> {
  if (!themeName) {
    console.error(`${RED}Usage: decantr theme switch <themeName> [--recipe <r>] [--shape <s>] [--mode <m>]${RESET}`);
    process.exitCode = 1;
    return;
  }

  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error(`${RED}No decantr.essence.json found. Run \`decantr init\` first.${RESET}`);
    process.exitCode = 1;
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(essencePath, 'utf-8'));
  } catch (e) {
    console.error(`${RED}Could not read essence: ${(e as Error).message}${RESET}`);
    process.exitCode = 1;
    return;
  }

  if (!isV3(parsed as any)) {
    console.error(`${RED}Essence is not v3. Run \`decantr migrate\` first.${RESET}`);
    process.exitCode = 1;
    return;
  }

  const essence = migrateV30ToV31(parsed as EssenceV3);

  // Parse optional flags
  let recipe: string | undefined;
  let shape: string | undefined;
  let mode: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--recipe=')) {
      recipe = arg.split('=')[1];
    } else if (arg === '--recipe' && args[i + 1] && !args[i + 1].startsWith('-')) {
      recipe = args[++i];
    } else if (arg.startsWith('--shape=')) {
      shape = arg.split('=')[1];
    } else if (arg === '--shape' && args[i + 1] && !args[i + 1].startsWith('-')) {
      shape = args[++i];
    } else if (arg.startsWith('--mode=')) {
      mode = arg.split('=')[1];
    } else if (arg === '--mode' && args[i + 1] && !args[i + 1].startsWith('-')) {
      mode = args[++i];
    }
  }

  // Update dna.theme
  const oldStyle = essence.dna.theme.style;
  essence.dna.theme.style = themeName;

  if (recipe) {
    essence.dna.theme.recipe = recipe;
  } else {
    // Default recipe to theme name
    essence.dna.theme.recipe = themeName;
  }

  if (shape) {
    essence.dna.theme.shape = shape as any;
  }

  if (mode) {
    essence.dna.theme.mode = mode as any;
  }

  // Fetch recipe to get radius_hints
  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
  });

  const recipeName = essence.dna.theme.recipe;
  try {
    const recipeResult = await registryClient.fetchRecipe(recipeName);
    if (recipeResult?.data) {
      const raw = recipeResult.data as Record<string, unknown>;
      const inner = (raw.data ?? raw) as Record<string, any>;
      if (inner.radius_hints) {
        essence.dna.radius = {
          ...essence.dna.radius,
          philosophy: inner.radius_hints.philosophy || essence.dna.radius.philosophy,
          base: inner.radius_hints.base ?? essence.dna.radius.base,
        };
      }
    }
  } catch {
    // Continue without recipe data -- radius keeps current values
  }

  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');

  console.log(`${GREEN}Switched theme: ${oldStyle} → ${themeName}${RESET}`);
  if (recipe) console.log(`  ${DIM}Recipe: ${recipe}${RESET}`);
  if (shape) console.log(`  ${DIM}Shape: ${shape}${RESET}`);
  if (mode) console.log(`  ${DIM}Mode: ${mode}${RESET}`);

  await refreshDerivedFiles(projectRoot, essence, registryClient);
  console.log(`${GREEN}Derived files refreshed (tokens.css, decorators.css, all contexts).${RESET}`);
  console.log(`${YELLOW}Guard will flag code using old tokens. Run \`decantr check\`.${RESET}`);
}
