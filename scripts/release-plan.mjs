import { writeFileSync } from 'node:fs';
import { readArgValue } from './cli-arg-lib.mjs';
import { createReleasePlan, getRepoRoot, listPublicPackages, loadPackageRetirements, loadPackageSurface } from './package-surface-lib.mjs';
import { readNpmAuthState } from './npm-surface-lib.mjs';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const jsonOutput = args.has('--json');
const reportJsonValue = readArgValue(rawArgs, 'report-json');
const summaryMarkdownValue = readArgValue(rawArgs, 'summary-markdown');
const onlySupport = readArgValue(rawArgs, 'support');
const onlyWave = readArgValue(rawArgs, 'wave');

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const retirements = loadPackageRetirements(root);
const publicPackages = listPublicPackages(root);
const plan = createReleasePlan(surface, publicPackages, retirements);
const npmAuth = readNpmAuthState();
const filteredPackages = onlySupport
  ? plan.packages.filter((entry) => entry.support === onlySupport)
  : plan.packages;
const filteredByWave = onlyWave
  ? filteredPackages.filter((entry) => entry.releaseWave === onlyWave)
  : filteredPackages;

const output = {
  ...plan,
  npmAuth,
  packages: filteredByWave,
  counts: {
    publishLatest: filteredByWave.filter((entry) => entry.recommendedAction === 'publish-latest').length,
    publishBeta: filteredByWave.filter((entry) => entry.recommendedAction === 'publish-beta').length,
    readyToGraduate: filteredByWave.filter((entry) => entry.recommendedAction === 'ready-to-graduate').length,
    holdExperimental: filteredByWave.filter((entry) => entry.recommendedAction === 'hold-experimental').length,
    retired: filteredByWave.filter((entry) => entry.recommendedAction === 'retired').length,
    byWave: filteredByWave.reduce((acc, entry) => {
      acc[entry.releaseWave] = (acc[entry.releaseWave] || 0) + 1;
      return acc;
    }, {}),
  },
};

const markdownLines = [
  '# Package Release Plan',
  '',
  `- Generated at: ${output.generatedAt}`,
  `- Packages in scope: ${output.packages.length}`,
  `- Support filter: ${onlySupport ?? 'all'}`,
  `- Release wave filter: ${onlyWave ?? 'all'}`,
  `- npm auth: ${npmAuth.authenticated ? `authenticated${npmAuth.username ? ` as ${npmAuth.username}` : ''}` : 'not authenticated'}`,
  `- Publish latest: ${output.counts.publishLatest}`,
  `- Publish beta: ${output.counts.publishBeta}`,
  `- Ready to graduate: ${output.counts.readyToGraduate}`,
  `- Hold experimental: ${output.counts.holdExperimental}`,
  `- Retired: ${output.counts.retired}`,
  '',
  '## npm Auth',
  '',
  npmAuth.authenticated
    ? `- authenticated${npmAuth.username ? ` as ${npmAuth.username}` : ''}`
    : `- not authenticated: ${npmAuth.error}`,
  '',
  '| Package | Wave | Order | Current version | Stable target | Maturity | Action | Dist-tag | Notes |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...output.packages.map((entry) => {
    const note = entry.recommendedAction === 'retired'
      ? (entry.retirement?.replacement ? `Replacement: ${entry.retirement.replacement}` : entry.summary)
      : entry.blockers.length > 0
        ? entry.blockers[0]
        : entry.summary;
    return `| ${entry.name} | ${entry.releaseWave} | ${entry.publishOrder} | ${entry.version ?? '-'} | ${entry.stableTargetVersion ?? '-'} | ${entry.maturity} | ${entry.recommendedAction} | ${entry.releaseTag ?? '-'} | ${note.replace(/\|/g, '\\|')} |`;
  }),
  '',
];
const markdown = `${markdownLines.join('\n')}\n`;

if (reportJsonValue) {
  writeFileSync(reportJsonValue, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
}

if (summaryMarkdownValue) {
  writeFileSync(summaryMarkdownValue, markdown, 'utf8');
}

if (jsonOutput) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(markdown);
}
