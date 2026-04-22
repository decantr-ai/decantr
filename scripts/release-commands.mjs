import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';
import { planNpmSurfaceRepairs, readNpmAuthState, readNpmVersions } from './npm-surface-lib.mjs';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const jsonOutput = args.has('--json');
const includeExperimental = args.has('--include-experimental');
const onlyWave = readArgValue(rawArgs, 'wave');
const tagOverride = readArgValue(rawArgs, 'tag-override');
const onlyNames = new Set(
  readArgValue(rawArgs, 'only')
    ? readArgValue(rawArgs, 'only')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const npmAuth = readNpmAuthState();
const repairPlan = planNpmSurfaceRepairs(surface);

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
  const provenanceFlag = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true' ? ' --provenance' : '';
  const preflight = versionAlreadyPublished
    ? `cd ${cwd} && pnpm pack --pack-destination /tmp`
    : `cd ${cwd} && pnpm publish --access public${provenanceFlag} --tag ${distTag} --no-git-checks --dry-run`;
  const publish = versionAlreadyPublished
    ? `cd ${cwd} && pnpm pack --pack-destination /tmp`
    : `cd ${cwd} && pnpm publish --access public${provenanceFlag} --tag ${distTag} --no-git-checks`;

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

const selectedNames = new Set(commands.map((entry) => entry.name));
const selectedRepairs = repairPlan
  .filter((result) => selectedNames.has(result.name))
  .map((result) => {
    const executableCommands = result.actions.flatMap((action) => {
      if (action.type === 'add-dist-tag') {
        return [`npm dist-tag add ${result.name}@${action.version} ${action.tag}`];
      }
      if (action.type === 'remove-dist-tag') {
        return [`npm dist-tag rm ${result.name} ${action.tag}`];
      }
      return [];
    });
    const manualSteps = result.actions.flatMap((action) => {
      if (action.type !== 'manual-latest-retag') return [];
      return [
        action.recommendedVersion
          ? `Decide whether npm latest should move from ${action.version} to stable ${action.recommendedVersion} for ${result.name}.`
          : `Publish a stable version for ${result.name} before moving npm latest away from prerelease ${action.version}.`,
      ];
    });

    return {
      name: result.name,
      findings: result.findings,
      executableCommands,
      manualSteps,
    };
  })
  .filter((result) => result.findings.length > 0);

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
  npmRepairs: selectedRepairs,
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
  `- Auth check: \`npm whoami\``,
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

lines.push('## npm Repair Commands', '');
if (selectedRepairs.length === 0) {
  lines.push('- No npm dist-tag repair steps are currently needed for the selected packages.');
} else {
  for (const repair of selectedRepairs) {
    lines.push(`## ${repair.name} npm repairs`);
    for (const finding of repair.findings) {
      lines.push(`- finding: ${finding}`);
    }
    for (const command of repair.executableCommands) {
      lines.push(`- command: \`${command}\``);
    }
    for (const step of repair.manualSteps) {
      lines.push(`- manual: ${step}`);
    }
    lines.push('');
  }
}

console.log(`${lines.join('\n')}\n`);
