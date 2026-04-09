import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  getRepoRoot,
  listPublicPackages,
  loadPackageSurface,
  validatePackageSurface,
} from './package-surface-lib.mjs';

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const publicPackages = listPublicPackages(root);
const findings = validatePackageSurface(surface, publicPackages);

for (const pkg of publicPackages) {
  const readmePath = join(root, pkg.path, 'README.md');
  if (!existsSync(readmePath)) {
    findings.push(`Public package ${pkg.name} is missing README.md.`);
  }
}

if (findings.length > 0) {
  console.error('Package surface audit failed:\n');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

const supportCounts = surface.packages.reduce((acc, entry) => {
  acc[entry.support] = (acc[entry.support] || 0) + 1;
  return acc;
}, {});

console.log('Package surface audit passed.');
console.log(`Public packages: ${publicPackages.length}`);
console.log(`Manifest packages: ${surface.packages.length}`);
for (const [support, count] of Object.entries(supportCounts)) {
  console.log(`- ${support}: ${count}`);
}
