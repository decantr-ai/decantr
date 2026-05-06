import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';
import { readNpmAuthState, readNpmPackageAccess, readNpmRegistry } from './npm-surface-lib.mjs';

const rawArgs = process.argv.slice(2);
const includeExperimental = rawArgs.includes('--include-experimental');
const onlyWave = readArgValue(rawArgs, 'wave');
const onlyNames = new Set(
  readArgValue(rawArgs, 'only')
    ? readArgValue(rawArgs, 'only')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);
const auth = readNpmAuthState();
const root = getRepoRoot();
const surface = loadPackageSurface(root);
const selected = sortReleaseEntries(surface.packages).filter((entry) => {
  if (!entry.publish) return false;
  if (!includeExperimental && entry.maturity === 'experimental') return false;
  if (onlyWave && entry.releaseWave !== onlyWave) return false;
  if (onlyNames.size > 0 && !onlyNames.has(entry.name)) return false;
  return true;
});
const accessResults = auth.authenticated
  ? selected.map((entry) => readNpmPackageAccess(entry.name))
  : [];

console.log('# npm Auth Audit');
console.log('');
console.log(`- Registry: ${readNpmRegistry() ?? 'unknown'}`);
console.log(`- Authenticated: ${auth.authenticated ? 'yes' : 'no'}`);
if (auth.username) {
  console.log(`- Username: ${auth.username}`);
}
if (!auth.authenticated && auth.error) {
  console.log(`- Error: ${auth.error}`);
}
console.log(`- Wave filter: ${onlyWave ?? 'all'}`);
console.log(`- Only filter: ${onlyNames.size > 0 ? [...onlyNames].join(', ') : 'all'}`);
console.log(`- Include experimental: ${includeExperimental ? 'yes' : 'no'}`);
console.log('');
console.log('## Publish Access');
console.log('');

if (!auth.authenticated) {
  console.log('- Skipped package access checks because npm authentication failed.');
} else if (accessResults.length === 0) {
  console.log('- No publishable packages matched the current filters.');
} else {
  for (const result of accessResults) {
    console.log(
      `- ${result.packageName}: ${result.canPublish ? 'write access confirmed' : 'no write access'}${result.access ? ` (${result.access})` : ''}`,
    );
    if (!result.canPublish && result.error) {
      console.log(`  ${result.error}`);
    }
  }
}

if (!auth.authenticated || accessResults.some((result) => !result.canPublish)) {
  process.exitCode = 1;
}
