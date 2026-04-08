import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const sourceDir = join(process.cwd(), 'docs', 'schemas');
const targetDir = join(process.cwd(), 'apps', 'api', 'src', 'schemas');

mkdirSync(targetDir, { recursive: true });

for (const file of readdirSync(sourceDir).filter(name => name.endsWith('.json'))) {
  copyFileSync(join(sourceDir, file), join(targetDir, file));
}

console.log('Synced schema copies from docs/schemas to apps/api/src/schemas');
