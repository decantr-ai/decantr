import { writeFileSync } from 'node:fs';
import { getRepoRoot, loadPackageRetirements, loadPackageSurface, listPublicPackages, validatePackageSurface, summarizeReleaseReadiness, createReleasePlan } from './package-surface-lib.mjs';
import { planNpmSurfaceRepairs, readNpmAuthState } from './npm-surface-lib.mjs';

const args = new Set(process.argv.slice(2));
const reportJsonArg = [...args].find((arg) => arg.startsWith('--report-json='));
const summaryMarkdownArg = [...args].find((arg) => arg.startsWith('--summary-markdown='));
const failOnError = args.has('--fail-on-error');
const failOnNpmDrift = args.has('--fail-on-npm-drift');

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const retirements = loadPackageRetirements(root);
const publicPackages = listPublicPackages(root);
const packageSurfaceFindings = validatePackageSurface(surface, publicPackages);
const releaseReadiness = summarizeReleaseReadiness(surface);
const releasePlan = createReleasePlan(surface, publicPackages, retirements);
const npmAuth = readNpmAuthState();
const npmSurfaceResults = planNpmSurfaceRepairs(surface);

function describeNpmFinding(result, finding) {
  if (finding.startsWith('unexpected dist-tag ')) {
    const tag = finding.slice('unexpected dist-tag '.length);
    return `${result.name} has unexpected npm dist-tag "${tag}".`;
  }
  if (finding.startsWith('missing expected ')) {
    const tag = finding.slice('missing expected '.length).replace(/ dist-tag$/, '');
    return `${result.name} is missing its expected npm dist-tag "${tag}".`;
  }
  if (finding.startsWith('prerelease version on latest ')) {
    const suffix = result.stableFallbackVersion
      ? ` Suggested stable fallback: ${result.stableFallbackVersion}.`
      : ' No stable npm version is published yet.';
    return `${result.name} is ${result.maturity} but npm latest currently points to prerelease ${result.tags.latest}.${suffix}`;
  }
  if (finding.startsWith('workspace protocol leaked in published manifest ')) {
    const detail = finding.slice('workspace protocol leaked in published manifest '.length);
    return `${result.name} still exposes a workspace protocol dependency in the published manifest (${detail}).`;
  }
  if (finding === 'unpublished') {
    return `${result.name} is marked publish:true but is not currently published on npm.`;
  }
  return `${result.name}: ${finding}`;
}

const npmSurfaceFindings = npmSurfaceResults.flatMap((result) => result.findings.map((finding) => describeNpmFinding(result, finding)));
const npmExecutableActions = npmSurfaceResults.flatMap((result) => result.actions.filter((action) => action.type !== 'manual-latest-retag').map((action) => {
  if (action.type === 'add-dist-tag') {
    return `Add dist-tag ${action.tag} -> ${result.name}@${action.version}`;
  }
  if (action.type === 'remove-dist-tag') {
    return `Remove dist-tag ${action.tag} from ${result.name}`;
  }
  return `${result.name}: ${action.type}`;
}));
const npmManualActions = npmSurfaceResults.flatMap((result) => result.actions.filter((action) => action.type === 'manual-latest-retag').map((action) => (
  action.recommendedVersion
    ? `${result.name}: decide whether npm latest should move from ${action.version} to stable ${action.recommendedVersion}`
    : `${result.name}: npm latest points to ${action.version}, but no stable published version exists yet`
)));

const output = {
  generatedAt: new Date().toISOString(),
  packageSurface: {
    findings: packageSurfaceFindings,
  },
  releaseReadiness,
  releasePlan,
  npmAuth,
  npmSurface: {
    findings: npmSurfaceFindings,
    executableActions: npmExecutableActions,
    manualActions: npmManualActions,
    results: npmSurfaceResults,
  },
};

const markdownLines = [
  '# Package Release Surface Audit',
  '',
  `- Generated at: ${output.generatedAt}`,
  `- Package surface findings: ${packageSurfaceFindings.length}`,
  `- Stable public packages: ${releaseReadiness.stablePackages.length}`,
  `- Internal packages: ${releaseReadiness.internalPackages.length}`,
  `- Experimental packages: ${releaseReadiness.experimentalPackages.length}`,
  `- npm surface findings: ${npmSurfaceFindings.length}`,
  `- npm executable actions: ${npmExecutableActions.length}`,
  `- npm manual actions: ${npmManualActions.length}`,
  `- npm auth: ${npmAuth.authenticated ? `authenticated${npmAuth.username ? ` as ${npmAuth.username}` : ''}` : 'not authenticated'}`,
  '',
  '## Release Waves',
  ...Object.entries(releaseReadiness.releaseWaves).map(([wave, packages]) => `- ${wave}: ${packages.join(', ') || 'none'}`),
  '',
  '',
];

if (packageSurfaceFindings.length > 0) {
  markdownLines.push('## Package Surface Findings');
  for (const finding of packageSurfaceFindings) {
    markdownLines.push(`- ${finding}`);
  }
  markdownLines.push('');
}

markdownLines.push('## Stable Public Packages');
if (releaseReadiness.stablePackages.length === 0) {
  markdownLines.push('- none');
} else {
  for (const candidate of releaseReadiness.stablePackages) {
    markdownLines.push(`- ${candidate}`);
  }
}
markdownLines.push('');

markdownLines.push('## Internal Packages');
if (releaseReadiness.internalPackages.length === 0) {
  markdownLines.push('- none');
} else {
  for (const name of releaseReadiness.internalPackages) {
    markdownLines.push(`- ${name}`);
  }
}
markdownLines.push('');

markdownLines.push('## Experimental Packages');
if (releaseReadiness.experimentalPackages.length === 0) {
  markdownLines.push('- none');
} else {
  for (const name of releaseReadiness.experimentalPackages) {
    markdownLines.push(`- ${name}`);
  }
}
markdownLines.push('');

markdownLines.push('## npm Auth');
if (npmAuth.authenticated) {
  markdownLines.push(`- authenticated${npmAuth.username ? ` as ${npmAuth.username}` : ''}`);
} else {
  markdownLines.push(`- not authenticated: ${npmAuth.error}`);
}
markdownLines.push('');

markdownLines.push('## npm Surface Drift');
if (npmSurfaceFindings.length === 0) {
  markdownLines.push('- none');
} else {
  for (const finding of npmSurfaceFindings) {
    markdownLines.push(`- ${finding}`);
  }
}
markdownLines.push('');

markdownLines.push('## npm Executable Actions');
if (npmExecutableActions.length === 0) {
  markdownLines.push('- none');
} else {
  for (const action of npmExecutableActions) {
    markdownLines.push(`- ${action}`);
  }
}
markdownLines.push('');

markdownLines.push('## npm Manual Actions');
if (npmManualActions.length === 0) {
  markdownLines.push('- none');
} else {
  for (const action of npmManualActions) {
    markdownLines.push(`- ${action}`);
  }
}
markdownLines.push('');

markdownLines.push('## Release Plan');
markdownLines.push('| Package | Wave | Version | Maturity | Action | Dist-tag |');
markdownLines.push('| --- | --- | --- | --- | --- | --- |');
for (const entry of releasePlan.packages) {
  markdownLines.push(`| ${entry.name} | ${entry.releaseWave} | ${entry.version ?? '-'} | ${entry.maturity} | ${entry.recommendedAction} | ${entry.releaseTag ?? '-'} |`);
}
markdownLines.push('');

const markdown = `${markdownLines.join('\n')}\n`;

if (reportJsonArg) {
  writeFileSync(reportJsonArg.split('=')[1], `${JSON.stringify(output, null, 2)}\n`, 'utf8');
}

if (summaryMarkdownArg) {
  writeFileSync(summaryMarkdownArg.split('=')[1], markdown, 'utf8');
}

console.log(markdown.trimEnd());

if (failOnError && packageSurfaceFindings.length > 0) {
  process.exitCode = 1;
}

if (failOnNpmDrift && npmSurfaceFindings.length > 0) {
  process.exitCode = 1;
}
