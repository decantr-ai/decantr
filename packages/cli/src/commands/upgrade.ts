import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EssenceV3 } from '@decantr/essence-spec';
import { isV3 } from '@decantr/essence-spec';
import { RegistryClient } from '../registry.js';
import { refreshDerivedFiles } from '../scaffold.js';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';

interface Upgrade {
  type: string;
  id: string;
  currentVersion: string;
  latestVersion: string;
  data?: Record<string, unknown>;
}

export async function cmdUpgrade(
  projectRoot: string = process.cwd(),
  options: { apply?: boolean } = {},
): Promise<void> {
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error('No decantr.essence.json found. Run `decantr init` first.');
    process.exitCode = 1;
    return;
  }

  const essence = JSON.parse(readFileSync(essencePath, 'utf-8'));
  const client = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    projectRoot,
  });

  console.log('Checking for updates...\n');

  const upgrades: Upgrade[] = [];

  // Check theme using the normalized theme id.
  const themeId = essence.dna?.theme?.id || essence.theme?.id;
  if (themeId) {
    const theme = await client.fetchTheme(themeId);
    if (theme) {
      const latestVersion = theme.data.version;
      if (latestVersion) {
        const current = essence.dna?.theme?.version || essence.theme?.version || '0.0.0';
        if (latestVersion !== current) {
          upgrades.push({
            type: 'theme',
            id: themeId,
            currentVersion: current,
            latestVersion,
            data: theme.data,
          });
        }
      }
    }
  }

  // Check blueprint (v2-only field; v3 has inline blueprint)
  if (essence.blueprint && typeof essence.blueprint === 'string') {
    const blueprint = await client.fetchBlueprint(essence.blueprint);
    if (blueprint) {
      const latestVersion = blueprint.data.version;
      if (latestVersion) {
        const current = essence.blueprintVersion || '0.0.0';
        if (latestVersion !== current) {
          upgrades.push({
            type: 'blueprint',
            id: essence.blueprint,
            currentVersion: current,
            latestVersion,
            data: blueprint.data,
          });
        }
      }
    }
  }

  if (upgrades.length === 0) {
    console.log(`${GREEN}Everything is up to date.${RESET}`);
    return;
  }

  console.log('Available upgrades:\n');
  for (const u of upgrades) {
    console.log(
      `  ${u.type}/${u.id}: ${DIM}${u.currentVersion}${RESET} -> ${GREEN}${u.latestVersion}${RESET}`,
    );
  }

  if (!options.apply) {
    console.log(`\n${YELLOW}Run with --apply to apply upgrades.${RESET}`);
    return;
  }

  // ── Apply upgrades ──
  console.log(`\n${CYAN}Applying upgrades...${RESET}\n`);

  let essenceModified = false;

  for (const upgrade of upgrades) {
    console.log(`  Updating ${upgrade.type}/${upgrade.id} to ${upgrade.latestVersion}...`);

    switch (upgrade.type) {
      case 'theme': {
        // Re-fetch theme to ensure cache is updated (fetchTheme saves to cache)
        await client.fetchTheme(upgrade.id);

        // Update version in essence if tracked
        if (essence.dna?.theme) {
          // v3 essence
          essence.dna.theme.version = upgrade.latestVersion;
          essenceModified = true;
        } else if (essence.theme) {
          // v2 essence
          essence.theme.version = upgrade.latestVersion;
          essenceModified = true;
        }
        console.log(`    ${GREEN}Theme cache updated.${RESET}`);
        break;
      }

      case 'blueprint': {
        // Re-fetch blueprint to ensure cache is updated
        await client.fetchBlueprint(upgrade.id);

        // Update version in essence
        essence.blueprintVersion = upgrade.latestVersion;
        essenceModified = true;
        console.log(`    ${GREEN}Blueprint cache updated.${RESET}`);
        break;
      }
    }
  }

  // Save updated essence if modified
  if (essenceModified) {
    writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');
    console.log(`\n  ${GREEN}Essence file updated.${RESET}`);
  }

  // Regenerate context files for v3 essences
  if (isV3(essence)) {
    console.log(`\n  Regenerating context files...`);
    try {
      const result = await refreshDerivedFiles(projectRoot, essence as EssenceV3, client);
      console.log(
        `    ${GREEN}Updated ${result.contextFiles.length} context file(s) and ${result.cssFiles.length} CSS file(s).${RESET}`,
      );
    } catch (e) {
      console.log(
        `    ${YELLOW}Warning: Could not regenerate context files: ${(e as Error).message}${RESET}`,
      );
    }
  }

  console.log(`\n${GREEN}All upgrades applied.${RESET}`);
}
