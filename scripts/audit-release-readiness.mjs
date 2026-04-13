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
console.log(`Stable candidates: ${readiness.stableCandidates.join(', ') || 'none'}`);
console.log(`Experimental packages: ${readiness.experimentalPackages.join(', ') || 'none'}`);
console.log('Release waves:');
for (const [wave, packages] of Object.entries(readiness.releaseWaves)) {
  console.log(`- ${wave}: ${packages.join(', ') || 'none'}`);
}
console.log('');
console.log('Beta package blockers:');
for (const entry of readiness.betaWithBlockers) {
  console.log(`- ${entry.name}`);
  for (const blocker of entry.blockers) {
    console.log(`    • ${blocker}`);
  }
}
