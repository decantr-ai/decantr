import { writeFileSync } from 'node:fs';
import { getRepoRoot, loadPackageSurface, loadPackageRetirements, listPublicPackages, createReleasePlan } from './package-surface-lib.mjs';

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has('--json');
const reportJsonArg = [...args].find((arg) => arg.startsWith('--report-json='));
const summaryMarkdownArg = [...args].find((arg) => arg.startsWith('--summary-markdown='));
const supportArg = [...args].find((arg) => arg.startsWith('--support='));
const onlySupport = supportArg ? supportArg.split('=')[1] : null;

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const retirements = loadPackageRetirements(root);
const publicPackages = listPublicPackages(root);
const plan = createReleasePlan(surface, publicPackages, retirements);
const filteredPackages = onlySupport
  ? plan.packages.filter((entry) => entry.support === onlySupport)
  : plan.packages;

const output = {
  ...plan,
  packages: filteredPackages,
  counts: {
    publishLatest: filteredPackages.filter((entry) => entry.recommendedAction === 'publish-latest').length,
    publishBeta: filteredPackages.filter((entry) => entry.recommendedAction === 'publish-beta').length,
    readyToGraduate: filteredPackages.filter((entry) => entry.recommendedAction === 'ready-to-graduate').length,
    holdExperimental: filteredPackages.filter((entry) => entry.recommendedAction === 'hold-experimental').length,
    retired: filteredPackages.filter((entry) => entry.recommendedAction === 'retired').length,
  },
};

const markdownLines = [
  '# Package Release Plan',
  '',
  `- Generated at: ${output.generatedAt}`,
  `- Packages in scope: ${output.packages.length}`,
  `- Publish latest: ${output.counts.publishLatest}`,
  `- Publish beta: ${output.counts.publishBeta}`,
  `- Ready to graduate: ${output.counts.readyToGraduate}`,
  `- Hold experimental: ${output.counts.holdExperimental}`,
  `- Retired: ${output.counts.retired}`,
  '',
  '| Package | Version | Maturity | Action | Dist-tag | Notes |',
  '| --- | --- | --- | --- | --- | --- |',
  ...output.packages.map((entry) => {
    const note = entry.recommendedAction === 'retired'
      ? (entry.retirement?.replacement ? `Replacement: ${entry.retirement.replacement}` : entry.summary)
      : entry.blockers.length > 0
        ? entry.blockers[0]
        : entry.summary;
    return `| ${entry.name} | ${entry.version ?? '-'} | ${entry.maturity} | ${entry.recommendedAction} | ${entry.releaseTag ?? '-'} | ${note.replace(/\|/g, '\\|')} |`;
  }),
  '',
];
const markdown = `${markdownLines.join('\n')}\n`;

if (reportJsonArg) {
  writeFileSync(reportJsonArg.split('=')[1], `${JSON.stringify(output, null, 2)}\n`, 'utf8');
}

if (summaryMarkdownArg) {
  writeFileSync(summaryMarkdownArg.split('=')[1], markdown, 'utf8');
}

if (jsonOutput) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(markdown);
}
