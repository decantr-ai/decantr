import { readFileSync } from 'node:fs';
import {
  collectNpmPackSurfaces,
  getSecurityPermissionsDocPath,
  loadPackagePermissions,
  renderSecurityPermissionsMarkdown,
  validatePackagePermissions,
} from './package-permissions-lib.mjs';
import { getRepoRoot, loadPackageSurface } from './package-surface-lib.mjs';

const root = getRepoRoot();
const permissions = loadPackagePermissions(root);
const surface = loadPackageSurface(root);
const { surfaces: packSurfaces, findings: packFindings } = collectNpmPackSurfaces(root, surface.packages);
const findings = [
  ...validatePackagePermissions(permissions, surface, packSurfaces),
  ...packFindings,
];
const docPath = getSecurityPermissionsDocPath(root);
const renderedDoc = renderSecurityPermissionsMarkdown(permissions, surface);
const currentDoc = readFileSync(docPath, 'utf8');

if (currentDoc !== renderedDoc) {
  findings.push('Security permissions reference is out of sync. Run node scripts/sync-security-permissions.mjs.');
}

if (findings.length > 0) {
  console.error('Package permissions audit failed:\n');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('Package permissions audit passed.');
console.log(`Permission manifest packages: ${permissions.packages.length}`);
console.log(`npm pack dry-run packages: ${packSurfaces.length}`);
console.log(`Security permissions reference: ${docPath.replace(`${root}/`, '')}`);
for (const pack of packSurfaces) {
  console.log(
    `- ${pack.name}@${pack.version}: ${pack.npmPack.entryCount} files, ${formatBytes(
      pack.npmPack.unpackedSize,
    )} unpacked, install scripts: ${pack.lifecycleScripts.length}`,
  );
}

function formatBytes(value) {
  if (!Number.isFinite(value)) return 'unknown';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
