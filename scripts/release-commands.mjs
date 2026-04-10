import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';
import { readNpmAuthState, readNpmVersions } from './npm-surface-lib.mjs';

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has('--json');
const onlyArg = [...args].find((arg) => arg.startsWith('--only='));
const waveArg = [...args].find((arg) => arg.startsWith('--wave='));
const tagOverrideArg = [...args].find((arg) => arg.startsWith('--tag-override='));
const includeExperimental = args.has('--include-experimental');
const onlyWave = waveArg ? waveArg.split('=')[1] : null;
const tagOverride = tagOverrideArg ? tagOverrideArg.split('=')[1] : null;
const onlyNames = new Set(
  onlyArg
    ? onlyArg
        .split('=')[1]
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const npmAuth = readNpmAuthState();

const selected = sortReleaseEntries(surface.packages).filter((entry) => {
  if (!entry.publish) return false;
  if (!includeExperimental && entry.maturity === 'experimental') return false;
  if (onlyWave && entry.releaseWave !== onlyWave) return false;
  if (onlyNames.size > 0 && !onlyNames.has(entry.name)) return false;
  return true;
});

const commands = selected.map((entry) => {
  const cwd = join(root, entry.path);
  const packageJson = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const version = packageJson.version;
  const distTag = tagOverride || entry.defaultDistTag;
  const npmVersions = readNpmVersions(entry.name);
  const versionAlreadyPublished = npmVersions.published && Array.isArray(npmVersions.versions) && npmVersions.versions.includes(version);
  const preflight = versionAlreadyPublished
    ? `cd ${cwd} && npm pack --dry-run`
    : `cd ${cwd} && npm publish --access public --provenance --tag ${distTag} --dry-run`;
  const publish = versionAlreadyPublished
    ? `cd ${cwd} && npm pack`
    : `cd ${cwd} && npm publish --access public --provenance --tag ${distTag}`;

  return {
    name: entry.name,
    path: entry.path,
    cwd,
    version,
    releaseWave: entry.releaseWave,
    distTag,
    versionAlreadyPublished,
    preflight,
    publish,
  };
});

const output = {
  generatedAt: new Date().toISOString(),
  npmAuth,
  filters: {
    wave: onlyWave,
    only: [...onlyNames],
    includeExperimental,
    tagOverride,
  },
  commands,
};

if (jsonOutput) {
  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}

const lines = [
  '# Release Commands',
  '',
  `- Generated at: ${output.generatedAt}`,
  `- npm auth: ${npmAuth.authenticated ? `authenticated${npmAuth.username ? ` as ${npmAuth.username}` : ''}` : `not authenticated${npmAuth.error ? ` (${npmAuth.error})` : ''}`}`,
  `- Wave filter: ${onlyWave ?? 'all'}`,
  `- Only filter: ${onlyNames.size > 0 ? [...onlyNames].join(', ') : 'all'}`,
  `- Include experimental: ${includeExperimental ? 'yes' : 'no'}`,
  `- Tag override: ${tagOverride ?? 'none'}`,
  '',
];

if (commands.length === 0) {
  lines.push('No publishable packages matched the current filters.');
} else {
  for (const entry of commands) {
    lines.push(`## ${entry.name}`);
    lines.push(`- version: ${entry.version}`);
    lines.push(`- wave: ${entry.releaseWave}`);
    lines.push(`- dist-tag: ${entry.distTag}`);
    lines.push(`- already published: ${entry.versionAlreadyPublished ? 'yes' : 'no'}`);
    lines.push(`- preflight: \`${entry.preflight}\``);
    lines.push(`- publish: \`${entry.publish}\``);
    lines.push('');
  }
}

console.log(`${lines.join('\n')}\n`);
