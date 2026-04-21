import { getRepoRoot, loadPackageSurface, summarizeReleaseReadiness, validatePackageSurface, listPublicPackages } from './package-surface-lib.mjs';

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const publicPackages = listPublicPackages(root);
const findings = validatePackageSurface(surface, publicPackages);
const readiness = summarizeReleaseReadiness(surface);

if (findings.length > 0) {
  console.error('Release readiness audit failed:\n');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('Release readiness audit passed.');
console.log(`Stable public packages: ${readiness.stablePackages.join(', ') || 'none'}`);
console.log(`Internal packages: ${readiness.internalPackages.join(', ') || 'none'}`);
console.log(`Experimental packages: ${readiness.experimentalPackages.join(', ') || 'none'}`);
console.log('Release waves:');
for (const [wave, packages] of Object.entries(readiness.releaseWaves)) {
  console.log(`- ${wave}: ${packages.join(', ') || 'none'}`);
}
