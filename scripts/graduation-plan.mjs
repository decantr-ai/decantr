import { writeFileSync } from 'node:fs';
import {
  createReleasePlan,
  getRepoRoot,
  listPublicPackages,
  loadPackageRetirements,
  loadPackageSurface,
} from './package-surface-lib.mjs';
import { planNpmSurfaceRepairs, readNpmAuthState } from './npm-surface-lib.mjs';

function describeNpmAction(result, action) {
  if (action.type === 'add-dist-tag') {
    return `Add npm dist-tag \`${action.tag}\` -> \`${result.name}@${action.version}\`.`;
  }
  if (action.type === 'remove-dist-tag') {
    return `Remove unexpected npm dist-tag \`${action.tag}\` from \`${result.name}\`.`;
  }
  if (action.type === 'manual-latest-retag') {
    return action.recommendedVersion
      ? `Decide whether npm \`latest\` should move from \`${action.version}\` to stable \`${action.recommendedVersion}\`.`
      : `Publish a real stable version before moving npm \`latest\` away from prerelease \`${action.version}\`.`;
  }
  return `${result.name}: ${action.type}`;
}

function describeNpmFinding(result, finding) {
  if (finding === 'unpublished') {
    return `Publish ${result.name} to npm before graduation can proceed.`;
  }
  if (finding.startsWith('unexpected dist-tag ')) {
    const tag = finding.slice('unexpected dist-tag '.length);
    return `Remove unexpected npm dist-tag \`${tag}\`.`;
  }
  if (finding.startsWith('missing expected ')) {
    const tag = finding.slice('missing expected '.length).replace(/ dist-tag$/, '');
    return `Restore expected npm dist-tag \`${tag}\`.`;
  }
  if (finding.startsWith('beta version on latest ')) {
    return result.stableFallbackVersion
      ? `Move npm \`latest\` back to stable \`${result.stableFallbackVersion}\` before graduation work.`
      : 'Publish a stable version before npm `latest` can stop pointing at a prerelease.';
  }
  return finding;
}

function classifyEntry(entry, npmResult) {
  const blockers = entry.blockers ?? [];
  const npmFindings = npmResult?.findings ?? [];
  const npmActions = npmResult?.actions ?? [];

  if (entry.recommendedAction === 'retired') {
    return {
      status: 'retired',
      nextStep: entry.retirement?.replacement
        ? `Keep consumers on the replacement surface: ${entry.retirement.replacement}.`
        : 'No graduation work; package is retired from the active surface.',
    };
  }

  if (entry.recommendedAction === 'hold-experimental') {
    return {
      status: 'experimental-hold',
      nextStep: blockers[0] ?? 'Keep the package out of the default graduation path until strategy changes.',
    };
  }

  if (entry.maturity === 'stable') {
    return {
      status: npmFindings.length > 0 ? 'stable-needs-npm-normalization' : 'stable-live',
      nextStep: npmFindings.length > 0
        ? describeNpmFinding(npmResult, npmFindings[0])
        : 'No graduation action needed; keep publishing under `latest` in its release wave.',
    };
  }

  if (entry.recommendedAction === 'ready-to-graduate') {
    return {
      status: npmFindings.length > 0 ? 'ready-but-npm-blocked' : 'ready-to-graduate',
      nextStep: npmFindings.length > 0
        ? describeNpmFinding(npmResult, npmFindings[0])
        : 'Bump version if needed and publish this package under `latest` in its release wave.',
    };
  }

  if (blockers.length > 0 && npmFindings.length > 0) {
    return {
      status: 'blocked-contract-and-npm',
      nextStep: blockers[0],
    };
  }

  if (blockers.length > 0) {
    return {
      status: 'blocked-contract',
      nextStep: blockers[0],
    };
  }

  if (npmFindings.length > 0) {
    return {
      status: 'blocked-npm',
      nextStep: describeNpmFinding(npmResult, npmFindings[0]),
    };
  }

  return {
    status: 'beta-publish',
    nextStep: 'Keep publishing under `beta` until stable-graduation criteria are explicitly met.',
  };
}

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has('--json');
const reportJsonArg = [...args].find((arg) => arg.startsWith('--report-json='));
const summaryMarkdownArg = [...args].find((arg) => arg.startsWith('--summary-markdown='));

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const retirements = loadPackageRetirements(root);
const publicPackages = listPublicPackages(root);
const releasePlan = createReleasePlan(surface, publicPackages, retirements);
const npmAuth = readNpmAuthState();
const npmSurfaceResults = planNpmSurfaceRepairs(surface);
const npmByName = new Map(npmSurfaceResults.map((result) => [result.name, result]));

const packages = releasePlan.packages.map((entry) => {
  const npmResult = npmByName.get(entry.name) ?? null;
  const classification = classifyEntry(entry, npmResult);
  return {
    ...entry,
    graduationStatus: classification.status,
    nextStep: classification.nextStep,
    npmFindings: npmResult?.findings ?? [],
    npmActions: (npmResult?.actions ?? []).map((action) => describeNpmAction(npmResult, action)),
  };
});

const counts = packages.reduce((acc, entry) => {
  acc[entry.graduationStatus] = (acc[entry.graduationStatus] || 0) + 1;
  return acc;
}, {});

const output = {
  generatedAt: new Date().toISOString(),
  npmAuth,
  counts,
  packages,
};

const stableNow = packages.filter((entry) => entry.graduationStatus === 'stable-live' || entry.graduationStatus === 'stable-needs-npm-normalization');
const readyNow = packages.filter((entry) => entry.graduationStatus === 'ready-to-graduate' || entry.graduationStatus === 'ready-but-npm-blocked');
const blocked = packages.filter((entry) => entry.graduationStatus === 'blocked-contract' || entry.graduationStatus === 'blocked-contract-and-npm' || entry.graduationStatus === 'blocked-npm' || entry.graduationStatus === 'beta-publish');
const experimentalOrRetired = packages.filter((entry) => entry.graduationStatus === 'experimental-hold' || entry.graduationStatus === 'retired');

const markdownLines = [
  '# Package Graduation Plan',
  '',
  `- Generated at: ${output.generatedAt}`,
  `- Stable now: ${stableNow.length}`,
  `- Ready to graduate: ${readyNow.length}`,
  `- Still blocked: ${blocked.length}`,
  `- Experimental or retired: ${experimentalOrRetired.length}`,
  `- npm auth: ${npmAuth.authenticated ? `authenticated${npmAuth.username ? ` as ${npmAuth.username}` : ''}` : 'not authenticated'}`,
  '',
  'Package graduation means moving a package from prerelease/public-beta semantics into an intentional `latest` contract with a stable npm tag, cleared blockers, and an explicit publish wave.',
  '',
  '## npm Auth',
];

if (npmAuth.authenticated) {
  markdownLines.push(`- authenticated${npmAuth.username ? ` as ${npmAuth.username}` : ''}`);
} else {
  markdownLines.push(`- not authenticated: ${npmAuth.error}`);
}

markdownLines.push(
  '',
  '## Stable Now',
);

if (stableNow.length === 0) {
  markdownLines.push('- none');
} else {
  for (const entry of stableNow) {
    markdownLines.push(`- \`${entry.name}\` (${entry.graduationStatus})`);
    markdownLines.push(`  - current version: ${entry.version ?? 'unknown'}`);
    markdownLines.push(`  - next step: ${entry.nextStep}`);
  }
}

markdownLines.push('', '## Ready To Graduate');
if (readyNow.length === 0) {
  markdownLines.push('- none');
} else {
  for (const entry of readyNow) {
    markdownLines.push(`- \`${entry.name}\` (${entry.graduationStatus})`);
    markdownLines.push(`  - current version: ${entry.version ?? 'unknown'}`);
    markdownLines.push(`  - stable target: ${entry.stableTargetVersion ?? 'unknown'}`);
    markdownLines.push(`  - next step: ${entry.nextStep}`);
  }
}

markdownLines.push('', '## Still Blocked');
if (blocked.length === 0) {
  markdownLines.push('- none');
} else {
  for (const entry of blocked) {
    markdownLines.push(`- \`${entry.name}\` (${entry.graduationStatus})`);
    markdownLines.push(`  - current version: ${entry.version ?? 'unknown'}`);
    if (entry.maturity === 'beta') {
      markdownLines.push(`  - stable target: ${entry.stableTargetVersion ?? 'unknown'}`);
    }
    markdownLines.push(`  - next step: ${entry.nextStep}`);
    if (entry.blockers.length > 0) {
      for (const blocker of entry.blockers) {
        markdownLines.push(`  - blocker: ${blocker}`);
      }
    }
    if (entry.npmFindings.length > 0) {
      for (const finding of entry.npmFindings) {
        markdownLines.push(`  - npm finding: ${describeNpmFinding(npmByName.get(entry.name), finding)}`);
      }
    }
    if (entry.npmActions.length > 0) {
      for (const action of entry.npmActions) {
        markdownLines.push(`  - npm: ${action}`);
      }
    }
  }
}

markdownLines.push('', '## Experimental Or Retired');
if (experimentalOrRetired.length === 0) {
  markdownLines.push('- none');
} else {
  for (const entry of experimentalOrRetired) {
    markdownLines.push(`- \`${entry.name}\` (${entry.graduationStatus})`);
    markdownLines.push(`  - next step: ${entry.nextStep}`);
  }
}

markdownLines.push('', '## Full Matrix');
markdownLines.push('| Package | Wave | Current version | Stable target | Maturity | Graduation status | Recommended action | Next step |');
markdownLines.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const entry of packages) {
  markdownLines.push(`| ${entry.name} | ${entry.releaseWave} | ${entry.version ?? '-'} | ${entry.stableTargetVersion ?? '-'} | ${entry.maturity} | ${entry.graduationStatus} | ${entry.recommendedAction} | ${String(entry.nextStep).replace(/\|/g, '\\|')} |`);
}
markdownLines.push('');

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
  console.log(markdown.trimEnd());
}
