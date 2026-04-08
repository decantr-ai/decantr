import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const contentSourceDir = join(process.cwd(), 'docs', 'schemas');
const essenceSourceDir = join(process.cwd(), 'packages', 'essence-spec', 'schema');
const targetDir = join(process.cwd(), 'apps', 'api', 'src', 'schemas');

mkdirSync(targetDir, { recursive: true });

for (const file of readdirSync(contentSourceDir).filter(name => name.endsWith('.json'))) {
  copyFileSync(join(contentSourceDir, file), join(targetDir, file));
}

for (const file of readdirSync(essenceSourceDir).filter(name => name.endsWith('.json'))) {
  copyFileSync(join(essenceSourceDir, file), join(targetDir, file));
}

console.log('Synced content and essence schema copies to apps/api/src/schemas');
