import { getRepoRoot, loadPackageSurface } from './package-surface-lib.mjs';
import { planNpmSurfaceRepairs } from './npm-surface-lib.mjs';

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has('--json');
const root = getRepoRoot();
const surface = loadPackageSurface(root);
const results = planNpmSurfaceRepairs(surface);
const findings = results.flatMap((result) => {
  if (!result.published) {
    return [`${result.name} is marked publish:true but is not currently published on npm.`];
  }

  return result.findings.map((finding) => {
    if (finding.startsWith('unexpected dist-tag ')) {
      const tag = finding.slice('unexpected dist-tag '.length);
      return `${result.name} has unexpected npm dist-tag "${tag}".`;
    }
    if (finding.startsWith('missing expected ')) {
      const tag = finding.slice('missing expected '.length).replace(/ dist-tag$/, '');
      return `${result.name} is missing its expected npm dist-tag "${tag}".`;
    }
    if (finding.startsWith('beta version on latest ')) {
      const suffix = result.stableFallbackVersion
        ? ` Suggested stable fallback: ${result.stableFallbackVersion}.`
        : ' No stable npm version is published yet.';
      return `${result.name} is ${result.maturity} but npm latest currently points to prerelease ${result.tags.latest}.${suffix}`;
    }
    return `${result.name}: ${finding}`;
  });
});

const output = {
  generatedAt: new Date().toISOString(),
  packageCount: results.length,
  findings,
  results,
};

if (jsonOutput) {
  console.log(JSON.stringify(output, null, 2));
} else if (findings.length === 0) {
  console.log('npm surface audit passed.');
  for (const result of results) {
    const tagSummary = Object.entries(result.tags).map(([tag, version]) => `${tag}=${version}`).join(', ') || 'none';
    console.log(`- ${result.name}: ${tagSummary}`);
  }
} else {
  console.error('npm surface audit found release-policy drift:\n');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exitCode = 1;
}
