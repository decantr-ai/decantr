import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const contentSourceDir = join(process.cwd(), 'packages', 'content', 'schemas');
const registryCompatibilityDir = join(process.cwd(), 'packages', 'registry', 'schema');
const essenceSourceDir = join(process.cwd(), 'packages', 'essence-spec', 'schema');
const coreSourceDir = join(process.cwd(), 'packages', 'core', 'schema');
const verifierSourceDir = join(process.cwd(), 'packages', 'verifier', 'schema');
const publicSchemaDir = join(process.cwd(), 'docs', 'schemas');

mkdirSync(publicSchemaDir, { recursive: true });

function copyJsonFiles(sourceDir, destinationDirs) {
  for (const file of readdirSync(sourceDir).filter(name => name.endsWith('.json'))) {
    for (const destinationDir of destinationDirs) {
      copyFileSync(join(sourceDir, file), join(destinationDir, file));
    }
  }
}

const registryCompatibilitySchemas = [
  'common.v1.json',
  'content-intelligence.v1.json',
  'content-health-report.v1.json',
  'pattern.v2.json',
  'theme.v1.json',
  'blueprint.v1.json',
  'archetype.v2.json',
  'shell.v1.json',
  'public-content-summary.v1.json',
  'public-content-record.v1.json',
  'public-content-list.v1.json',
  'search-response.v1.json',
  'showcase-manifest-entry.v1.json',
  'showcase-manifest.v1.json',
  'showcase-shortlist.v1.json',
  'registry-intelligence-summary.v1.json',
];

mkdirSync(registryCompatibilityDir, { recursive: true });
for (const file of registryCompatibilitySchemas) {
  copyFileSync(join(contentSourceDir, file), join(registryCompatibilityDir, file));
}

copyFileSync(
  join(essenceSourceDir, 'essence.v4.json'),
  join(contentSourceDir, 'essence.v4.json'),
);
for (const file of ['execution-pack.common.v1.json', 'page-pack.v1.json', 'section-pack.v1.json']) {
  copyFileSync(join(coreSourceDir, file), join(contentSourceDir, file));
}

copyJsonFiles(contentSourceDir, [publicSchemaDir]);
copyJsonFiles(essenceSourceDir, [publicSchemaDir]);
copyJsonFiles(coreSourceDir, [publicSchemaDir]);
copyJsonFiles(verifierSourceDir, [publicSchemaDir]);

console.log('Synced owner schemas to compatibility packages and public docs');
