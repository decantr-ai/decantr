import { readFileSync, writeFileSync } from 'node:fs';
import {
  getPackageSupportMatrixPath,
  getRepoRoot,
  loadPackageRetirements,
  loadPackageSurface,
  renderPackageSupportMatrix,
} from './package-surface-lib.mjs';

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const retirements = loadPackageRetirements(root);
const matrixPath = getPackageSupportMatrixPath(root);
const rendered = renderPackageSupportMatrix(surface, retirements);
const current = readFileSync(matrixPath, 'utf8');

if (checkOnly) {
  if (current !== rendered) {
    console.error(`Package support matrix is out of sync: ${matrixPath}`);
    console.error('Run: node scripts/sync-package-support-matrix.mjs');
    process.exit(1);
  }

  console.log(`Package support matrix is in sync: ${matrixPath}`);
  process.exit(0);
}

writeFileSync(matrixPath, rendered, 'utf8');
console.log(`Updated package support matrix: ${matrixPath}`);
