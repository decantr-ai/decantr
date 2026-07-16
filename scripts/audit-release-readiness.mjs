import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { getRepoRoot, loadPackageSurface, summarizeReleaseReadiness, validatePackageSurface, listPublicPackages } from './package-surface-lib.mjs';

const root = process.env.NODE_ENV === 'test' && process.env.DECANTR_RELEASE_TEST_ROOT
  ? resolve(process.env.DECANTR_RELEASE_TEST_ROOT)
  : getRepoRoot();
const surface = loadPackageSurface(root);
const publicPackages = listPublicPackages(root);
const findings = validatePackageSurface(surface, publicPackages);
const readiness = summarizeReleaseReadiness(surface);
const activeLanes = new Map();

for (const pkg of publicPackages) {
  const laneMatch = Object.entries(surface.releaseLanes ?? {}).find(([line]) =>
    pkg.version.startsWith(`${line}.`),
  );
  if (laneMatch) activeLanes.set(laneMatch[0], laneMatch[1]);
}

for (const [line, lane] of activeLanes) {
  for (const gate of lane.requiredGates ?? []) {
    if (!gate.phases?.includes('readiness')) continue;
    const result = spawnSync(process.execPath, [join(root, gate.script)], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });
    if (result.status !== 0) {
      const detail = [result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n')
        .trim();
      findings.push(
        `${gate.label} blocks the Decantr ${line} release${detail ? `:\n${detail}` : '.'}`,
      );
    }
  }
}

if (findings.length > 0) {
  console.error('Release readiness audit failed:\n');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('Release readiness audit passed.');
console.log(`Stable public packages: ${readiness.stablePackages.join(', ') || 'none'}`);
console.log(`Prerelease public packages: ${readiness.prereleasePackages.join(', ') || 'none'}`);
console.log(`Internal packages: ${readiness.internalPackages.join(', ') || 'none'}`);
console.log(`Experimental packages: ${readiness.experimentalPackages.join(', ') || 'none'}`);
console.log('Release waves:');
for (const [wave, packages] of Object.entries(readiness.releaseWaves)) {
  console.log(`- ${wave}: ${packages.join(', ') || 'none'}`);
}
