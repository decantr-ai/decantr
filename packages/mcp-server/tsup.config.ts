import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';
import { createBundledDependencyInventory } from '../../scripts/bundled-dependencies-lib.mjs';

const packageDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(packageDir, '../..');
const inventoryDir = join(packageDir, '.decantr-build');
const inventoryPath = join(inventoryDir, 'bundled-dependencies.json');
let buildMetadata:
  | { outputs: Record<string, { inputs: Record<string, { bytesInOutput: number }> }> }
  | undefined;

export default defineConfig({
  entry: ['src/index.ts', 'src/bin.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  noExternal: ['@modelcontextprotocol/sdk'],
  esbuildOptions(options) {
    options.metafile = true;
  },
  esbuildPlugins: [
    {
      name: 'decantr-bundled-inventory',
      setup(build) {
        build.onStart(() => {
          buildMetadata = undefined;
          rmSync(inventoryPath, { force: true });
        });
        build.onEnd((result) => {
          if (!result.errors.length) buildMetadata = result.metafile;
        });
      },
    },
  ],
  async onSuccess() {
    const inventory = createBundledDependencyInventory({
      packageDir,
      repoRoot,
      metafile: buildMetadata,
    });
    mkdirSync(inventoryDir, { recursive: true });
    writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
  },
});
