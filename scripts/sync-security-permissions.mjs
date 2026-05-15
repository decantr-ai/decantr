import { writeFileSync } from 'node:fs';
import {
  getSecurityPermissionsDocPath,
  loadPackagePermissions,
  renderSecurityPermissionsMarkdown,
} from './package-permissions-lib.mjs';
import { getRepoRoot, loadPackageSurface } from './package-surface-lib.mjs';

const root = getRepoRoot();
const outputPath = getSecurityPermissionsDocPath(root);
const markdown = renderSecurityPermissionsMarkdown(
  loadPackagePermissions(root),
  loadPackageSurface(root),
);

writeFileSync(outputPath, markdown, 'utf8');
console.log(`Wrote ${outputPath.replace(`${root}/`, '')}.`);
