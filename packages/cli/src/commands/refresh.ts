import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { isV3 } from '@decantr/essence-spec';
import type { EssenceV3 } from '@decantr/essence-spec';
import { refreshDerivedFiles } from '../scaffold.js';
import { RegistryClient } from '../registry.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

export async function cmdRefresh(projectRoot: string = process.cwd()): Promise<void> {
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error(`${RED}No decantr.essence.json found. Run \`decantr init\` first.${RESET}`);
    process.exitCode = 1;
    return;
  }

  let essence: EssenceV3;
  try {
    const raw = readFileSync(essencePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!isV3(parsed)) {
      console.error(`${RED}Essence is not v3. Run \`decantr migrate\` first.${RESET}`);
      process.exitCode = 1;
      return;
    }
    essence = parsed;
  } catch (e) {
    console.error(`${RED}Could not read essence: ${(e as Error).message}${RESET}`);
    process.exitCode = 1;
    return;
  }

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
  });

  console.log('Regenerating derived files...\n');

  const result = await refreshDerivedFiles(projectRoot, essence, registryClient);

  console.log(`${GREEN}Regenerated:${RESET}`);
  console.log(`  ${DIM}DECANTR.md${RESET}`);
  for (const css of result.cssFiles) {
    const rel = css.replace(projectRoot + '/', '');
    console.log(`  ${DIM}${rel}${RESET}`);
  }
  for (const ctx of result.contextFiles) {
    const rel = ctx.replace(projectRoot + '/', '');
    console.log(`  ${DIM}${rel}${RESET}`);
  }
  console.log('');
  console.log(`${GREEN}Done.${RESET}`);
}
