import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getPackageSupportMatrixPath,
  getRepoRoot,
  listPublicPackages,
  loadPackageRetirements,
  loadPackageSurface,
  renderPackageSupportMatrix,
  summarizeReleaseReadiness,
  validatePackageRetirements,
  validatePackageSurface,
} from './package-surface-lib.mjs';

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const retirements = loadPackageRetirements(root);
const publicPackages = listPublicPackages(root);
const findings = validatePackageSurface(surface, publicPackages);
findings.push(...validatePackageRetirements(surface, retirements));
const matrixPath = getPackageSupportMatrixPath(root);
const renderedMatrix = renderPackageSupportMatrix(surface, retirements);
const currentMatrix = readFileSync(matrixPath, 'utf8');

for (const pkg of publicPackages) {
  const readmePath = join(root, pkg.path, 'README.md');
  if (!existsSync(readmePath)) {
    findings.push(`Public package ${pkg.name} is missing README.md.`);
  }
}

if (currentMatrix !== renderedMatrix) {
  findings.push(`Package support matrix is out of sync. Run node scripts/sync-package-support-matrix.mjs.`);
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
const readiness = summarizeReleaseReadiness(surface);

console.log('Package surface audit passed.');
console.log(`Public packages: ${publicPackages.length}`);
console.log(`Manifest packages: ${surface.packages.length}`);
console.log(`Retired package entries: ${(retirements.packages ?? []).length}`);
console.log(`Support matrix: ${matrixPath.replace(`${root}/`, '')}`);
for (const [support, count] of Object.entries(supportCounts)) {
  console.log(`- ${support}: ${count}`);
}
console.log(`Stable candidates: ${readiness.stableCandidates.join(', ') || 'none'}`);
console.log(`Beta packages with blockers: ${readiness.betaWithBlockers.length}`);
console.log(`Experimental packages: ${readiness.experimentalPackages.join(', ') || 'none'}`);
for (const [wave, packages] of Object.entries(readiness.releaseWaves)) {
  console.log(`- release wave ${wave}: ${packages.length}`);
}
