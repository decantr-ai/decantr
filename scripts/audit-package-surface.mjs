import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

const registryIndependentSurfaces = [
  'packages/core',
  'packages/verifier',
  'packages/mcp-server',
  'packages/cli',
  'apps/api',
];

function listSourceFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(path);
    return /\.(?:[cm]?[jt]sx?)$/u.test(entry.name) ? [path] : [];
  });
}

for (const packagePath of registryIndependentSurfaces) {
  const packageJsonPath = join(root, packagePath, 'package.json');
  if (existsSync(packageJsonPath)) {
    const manifest = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const dependencySections = [
      manifest.dependencies,
      manifest.devDependencies,
      manifest.optionalDependencies,
      manifest.peerDependencies,
    ];
    if (dependencySections.some((dependencies) => dependencies?.['@decantr/registry'])) {
      findings.push(
        `${packagePath} must use @decantr/content directly; @decantr/registry is an external compatibility facade only.`,
      );
    }
  }

  for (const sourcePath of listSourceFiles(join(root, packagePath, 'src'))) {
    if (/['"]@decantr\/registry(?:\/[^'"]*)?['"]/u.test(readFileSync(sourcePath, 'utf8'))) {
      findings.push(
        `${sourcePath.replace(`${root}/`, '')} imports @decantr/registry; use @decantr/content or local package ownership instead.`,
      );
    }
  }
}

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
console.log(`Stable public packages: ${readiness.stablePackages.join(', ') || 'none'}`);
console.log(`Prerelease public packages: ${readiness.prereleasePackages.join(', ') || 'none'}`);
console.log(`Internal packages: ${readiness.internalPackages.join(', ') || 'none'}`);
console.log(`Experimental packages: ${readiness.experimentalPackages.join(', ') || 'none'}`);
for (const [wave, packages] of Object.entries(readiness.releaseWaves)) {
  console.log(`- release wave ${wave}: ${packages.length}`);
}
