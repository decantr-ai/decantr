import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { RegistryClient } from '../registry.js';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

interface Upgrade {
  type: string;
  id: string;
  currentVersion: string;
  latestVersion: string;
}

export async function cmdUpgrade(projectRoot: string = process.cwd()): Promise<void> {
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error('No decantr.essence.json found. Run `decantr init` first.');
    process.exitCode = 1;
    return;
  }

  const essence = JSON.parse(readFileSync(essencePath, 'utf-8'));
  const client = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache')
  });

  console.log('Checking for updates...\n');

  const upgrades: Upgrade[] = [];

  // Check theme
  if (essence.theme?.style) {
    const theme = await client.fetchTheme(essence.theme.style);
    if (theme && theme.data.version) {
      // Compare versions (simplified)
      const current = essence.theme.version || '0.0.0';
      if (theme.data.version !== current) {
        upgrades.push({
          type: 'theme',
          id: essence.theme.style,
          currentVersion: current,
          latestVersion: theme.data.version as string
        });
      }
    }
  }

  // Check blueprint
  if (essence.blueprint) {
    const blueprint = await client.fetchBlueprint(essence.blueprint);
    if (blueprint && blueprint.data.version) {
      const current = essence.blueprintVersion || '0.0.0';
      if (blueprint.data.version !== current) {
        upgrades.push({
          type: 'blueprint',
          id: essence.blueprint,
          currentVersion: current,
          latestVersion: blueprint.data.version as string
        });
      }
    }
  }

  if (upgrades.length === 0) {
    console.log(`${GREEN}Everything is up to date.${RESET}`);
    return;
  }

  console.log('Available upgrades:\n');
  for (const u of upgrades) {
    console.log(`  ${u.type}/${u.id}: ${DIM}${u.currentVersion}${RESET} -> ${GREEN}${u.latestVersion}${RESET}`);
  }

  console.log(`\n${YELLOW}Run with --apply to apply upgrades.${RESET}`);
}
