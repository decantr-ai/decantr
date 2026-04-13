import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RegistryAPIClient, API_CONTENT_TYPES } from '@decantr/registry';
import type { ApiContentType } from '@decantr/registry';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const ALL_CONTENT_TYPES: ApiContentType[] = [...API_CONTENT_TYPES];

interface MirrorManifest {
  mirrored_at: string;
  counts: Record<string, number>;
}

export async function cmdRegistryMirror(
  projectRoot: string,
  options: { type?: string } = {}
): Promise<void> {
  const apiUrl = process.env.DECANTR_API_URL || 'https://api.decantr.ai/v1';
  const apiClient = new RegistryAPIClient({
    baseUrl: apiUrl,
    apiKey: process.env.DECANTR_API_KEY || undefined,
  });

  // Check API availability
  const healthy = await apiClient.checkHealth();
  if (!healthy) {
    console.error(`${RED}Registry API is unavailable. Check your connection.${RESET}`);
    process.exitCode = 1;
    return;
  }

  const types = options.type
    ? [options.type as ApiContentType]
    : ALL_CONTENT_TYPES;

  // Validate type filter
  if (options.type && !ALL_CONTENT_TYPES.includes(options.type as ApiContentType)) {
    console.error(`${RED}Unknown content type: ${options.type}${RESET}`);
    console.error(`${DIM}Valid types: ${ALL_CONTENT_TYPES.join(', ')}${RESET}`);
    process.exitCode = 1;
    return;
  }

  const cacheDir = join(projectRoot, '.decantr', 'cache');
  const counts: Record<string, number> = {};
  const failed: string[] = [];

  console.log(`\nMirroring registry content to ${DIM}.decantr/cache/${RESET}\n`);

  for (const type of types) {
    try {
      // Get the list
      const result = await apiClient.listContent(type, { namespace: '@official' });
      const items = result.items as Array<Record<string, unknown>>;

      // Save index
      const typeDir = join(cacheDir, '@official', type);
      mkdirSync(typeDir, { recursive: true });
      writeFileSync(join(typeDir, 'index.json'), JSON.stringify(result, null, 2));

      let itemCount = 0;

      // Fetch and save each item's full data sequentially (avoid API burst)
      for (const item of items) {
        const slug = (item.slug as string) || (item.id as string);
        if (!slug) continue;

        try {
          const fullItem = await apiClient.getContent(type, '@official', slug);
          writeFileSync(join(typeDir, `${slug}.json`), JSON.stringify(fullItem, null, 2));
          itemCount++;
        } catch {
          // Save abbreviated item as fallback
          writeFileSync(join(typeDir, `${slug}.json`), JSON.stringify(item, null, 2));
          itemCount++;
        }
      }

      counts[type] = itemCount;
      console.log(`  ${GREEN}✓${RESET} ${type}: ${CYAN}${itemCount}${RESET} items`);
    } catch (e) {
      failed.push(type);
      console.log(`  ${RED}✗${RESET} ${type}: ${(e as Error).message}`);
    }
  }

  // Save manifest
  const manifest: MirrorManifest = {
    mirrored_at: new Date().toISOString(),
    counts,
  };
  mkdirSync(join(cacheDir), { recursive: true });
  writeFileSync(join(cacheDir, 'mirror-manifest.json'), JSON.stringify(manifest, null, 2));

  // Summary
  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log('');
  if (failed.length > 0) {
    console.log(`${YELLOW}Mirrored ${totalItems} items (${failed.length} type(s) failed)${RESET}`);
  } else {
    console.log(`${GREEN}Mirrored ${totalItems} items across ${Object.keys(counts).length} types${RESET}`);
  }
  console.log(`${DIM}Use \`decantr init --offline\` or \`decantr refresh --offline\` to work without API.${RESET}\n`);
}
