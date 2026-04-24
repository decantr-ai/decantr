import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EssenceFile, EssenceV3, ThemeMode, ThemeShape } from '@decantr/essence-spec';
import { isV3, migrateV30ToV31 } from '@decantr/essence-spec';
import { RegistryClient } from '../registry.js';
import { refreshDerivedFiles } from '../scaffold.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const VALID_THEME_SHAPES: ThemeShape[] = ['sharp', 'rounded', 'pill'];
const VALID_THEME_MODES: ThemeMode[] = ['light', 'dark', 'auto'];

/**
 * `decantr theme switch <themeName>` [--shape <shape>] [--mode <mode>]
 */
export async function cmdThemeSwitch(
  themeName: string,
  args: string[],
  projectRoot: string = process.cwd(),
): Promise<void> {
  if (!themeName) {
    console.error(
      `${RED}Usage: decantr theme switch <themeName> [--shape <s>] [--mode <m>]${RESET}`,
    );
    process.exitCode = 1;
    return;
  }

  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error(`${RED}No decantr.essence.json found. Run \`decantr init\` first.${RESET}`);
    process.exitCode = 1;
    return;
  }

  let parsed: EssenceFile;
  try {
    parsed = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceFile;
  } catch (e) {
    console.error(`${RED}Could not read essence: ${(e as Error).message}${RESET}`);
    process.exitCode = 1;
    return;
  }

  if (!isV3(parsed)) {
    console.error(`${RED}Essence is not v3. Run \`decantr migrate\` first.${RESET}`);
    process.exitCode = 1;
    return;
  }

  const essence = migrateV30ToV31(parsed);

  // Parse optional flags
  let shape: string | undefined;
  let mode: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--shape=')) {
      shape = arg.split('=')[1];
    } else if (arg === '--shape' && args[i + 1] && !args[i + 1].startsWith('-')) {
      shape = args[++i];
    } else if (arg.startsWith('--mode=')) {
      mode = arg.split('=')[1];
    } else if (arg === '--mode' && args[i + 1] && !args[i + 1].startsWith('-')) {
      mode = args[++i];
    }
  }

  if (shape && !VALID_THEME_SHAPES.includes(shape as ThemeShape)) {
    console.error(
      `${RED}Invalid shape "${shape}". Must be one of: ${VALID_THEME_SHAPES.join(', ')}.${RESET}`,
    );
    process.exitCode = 1;
    return;
  }

  if (mode && !VALID_THEME_MODES.includes(mode as ThemeMode)) {
    console.error(
      `${RED}Invalid mode "${mode}". Must be one of: ${VALID_THEME_MODES.join(', ')}.${RESET}`,
    );
    process.exitCode = 1;
    return;
  }

  // Update dna.theme
  const oldThemeId = essence.dna.theme.id;
  essence.dna.theme.id = themeName;

  if (shape) {
    essence.dna.theme.shape = shape as ThemeShape;
  }

  if (mode) {
    essence.dna.theme.mode = mode as ThemeMode;
  }

  // Fetch theme to get radius hints
  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
  });

  try {
    const themeResult = await registryClient.fetchTheme(themeName);
    if (themeResult?.data) {
      if (themeResult.data.radius) {
        essence.dna.radius = {
          ...essence.dna.radius,
          philosophy: themeResult.data.radius.philosophy || essence.dna.radius.philosophy,
          base: themeResult.data.radius.base ?? essence.dna.radius.base,
        };
      }
    }
  } catch {
    // Continue without theme data -- radius keeps current values
  }

  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');

  console.log(`${GREEN}Switched theme: ${oldThemeId} → ${themeName}${RESET}`);
  if (shape) console.log(`  ${DIM}Shape: ${shape}${RESET}`);
  if (mode) console.log(`  ${DIM}Mode: ${mode}${RESET}`);

  await refreshDerivedFiles(projectRoot, essence, registryClient);
  console.log(
    `${GREEN}Derived files refreshed (tokens.css, treatments.css, all contexts).${RESET}`,
  );
  console.log(`${YELLOW}Guard will flag code using old tokens. Run \`decantr check\`.${RESET}`);
}
