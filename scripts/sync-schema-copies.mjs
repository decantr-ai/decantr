import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const registrySourceDir = join(process.cwd(), 'packages', 'registry', 'schema');
const essenceSourceDir = join(process.cwd(), 'packages', 'essence-spec', 'schema');
const coreSourceDir = join(process.cwd(), 'packages', 'core', 'schema');
const publicSchemaDir = join(process.cwd(), 'docs', 'schemas');

mkdirSync(publicSchemaDir, { recursive: true });

function copyJsonFiles(sourceDir, destinationDirs) {
  for (const file of readdirSync(sourceDir).filter(name => name.endsWith('.json'))) {
    for (const destinationDir of destinationDirs) {
      copyFileSync(join(sourceDir, file), join(destinationDir, file));
    }
  }
}

copyJsonFiles(registrySourceDir, [publicSchemaDir]);
copyJsonFiles(essenceSourceDir, [publicSchemaDir]);
copyJsonFiles(coreSourceDir, [publicSchemaDir]);

console.log('Synced public schema copies from package sources');
