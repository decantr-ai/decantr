import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateGuard, isV4, validateEssence } from '@decantr/essence-spec';
import { scanBrownfieldIssues } from '../brownfield-check.js';
import { buildGuardRegistryContext } from '../guard-context.js';
// V4 C5 wiring — scan source for missing interaction implementations.
import { scanProjectInteractions } from '../lib/scan-interactions.js';
import { collectMetrics, isOptedIn, optIn, sendGuardMetrics } from '../telemetry.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

export interface CheckIssue {
  type: 'error' | 'warning';
  rule: string;
  message: string;
  suggestion?: string;
}

export interface CheckOptions {
  telemetry?: boolean;
  brownfield?: boolean;
}

export interface CheckResult {
  essence: Record<string, unknown> | null;
  issues: CheckIssue[];
  missingEssence: boolean;
}

function isContractOnlyProject(projectRoot: string): boolean {
  const metadataPath = join(projectRoot, '.decantr', 'project.json');
  if (!existsSync(metadataPath)) return false;
  try {
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8')) as {
      initialized?: { adoptionMode?: string };
    };
    return metadata.initialized?.adoptionMode === 'contract-only';
  } catch {
    return false;
  }
}

export function collectCheckIssues(
  projectRoot: string = process.cwd(),
  options: CheckOptions = {},
): CheckResult {
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    return {
      essence: null,
      issues: [
        {
          type: 'error',
          rule: 'essence-missing',
          message: 'No decantr.essence.json found. Run `decantr init` first.',
        },
      ],
      missingEssence: true,
    };
  }

  const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as Record<string, unknown>;
  const issues: CheckIssue[] = [];

  const validation = validateEssence(essence);
  if (!validation.valid) {
    for (const err of validation.errors) {
      issues.push({
        type: 'error',
        rule: 'schema',
        message: err,
      });
    }
    return { essence, issues, missingEssence: false };
  }

  let interactionIssues: string[] = [];
  if (!isContractOnlyProject(projectRoot)) {
    try {
      interactionIssues = scanProjectInteractions(projectRoot);
    } catch {
      /* source scan is non-fatal */
    }
  }

  try {
    const guardContext = buildGuardRegistryContext(projectRoot);
    const violations = evaluateGuard(essence, {
      ...guardContext,
      interaction_issues: interactionIssues,
    });
    for (const v of violations) {
      issues.push({
        type: v.severity === 'error' ? 'error' : 'warning',
        rule: v.rule,
        message: v.message,
        suggestion: v.suggestion,
      });
    }
  } catch {
    /* guard evaluation optional */
  }

  if (options.brownfield) {
    try {
      if (isV4(essence)) {
        const brownfieldIssues = scanBrownfieldIssues(projectRoot, essence);
        issues.push(...brownfieldIssues);
      } else {
        issues.push({
          type: 'warning',
          rule: 'brownfield-check',
          message: 'Brownfield checks require an Essence v4.0.0 Decantr contract.',
        });
      }
    } catch (e) {
      issues.push({
        type: 'warning',
        rule: 'brownfield-check',
        message: `Brownfield check could not complete: ${(e as Error).message}`,
      });
    }
  }

  return { essence, issues, missingEssence: false };
}

export async function cmdHeal(
  projectRoot: string = process.cwd(),
  options: CheckOptions = {},
): Promise<void> {
  const result = collectCheckIssues(projectRoot, options);

  console.log('Scanning for issues...\n');

  if (result.missingEssence) {
    console.error(result.issues[0]?.message ?? 'No decantr.essence.json found.');
    process.exitCode = 1;
    return;
  }

  const issues = result.issues;
  const essence = result.essence ?? {};

  if (issues.length === 0) {
    console.log(`${GREEN}No issues found. Project is healthy.${RESET}`);
    await maybeSendTelemetry(projectRoot, essence, issues, options);
    return;
  }

  console.log(`Found ${issues.length} issue(s):\n`);

  for (const issue of issues) {
    const icon = issue.type === 'error' ? `${RED}x${RESET}` : `${YELLOW}!${RESET}`;
    console.log(`${icon} [${issue.rule}] ${issue.message}`);
    if (issue.suggestion) {
      console.log(`  ${DIM}Suggestion: ${issue.suggestion}${RESET}`);
    }
  }

  // V4 C5: when any issue is severity='error', exit non-zero so CI gates
  // and `npm run check` script wrappers see the failure. Warnings keep
  // exit code 0 (informational).
  const hasError = issues.some((i) => i.type === 'error');
  if (hasError) {
    console.log(`\n${YELLOW}Manual fixes required. Review the issues above.${RESET}`);
  } else {
    console.log(
      `\n${YELLOW}Warnings found. Review the issues above or set stricter gates in CI.${RESET}`,
    );
  }
  if (hasError) {
    process.exitCode = 1;
  }

  await maybeSendTelemetry(projectRoot, essence, issues, options);
}

async function maybeSendTelemetry(
  projectRoot: string,
  essence: Record<string, unknown>,
  issues: CheckIssue[],
  options: CheckOptions,
): Promise<void> {
  if (options.telemetry && !isOptedIn(projectRoot)) {
    optIn(projectRoot);
    console.log(
      `\n${CYAN}Telemetry enabled.${RESET} Decantr will send privacy-filtered CLI product telemetry for this project.`,
    );
    console.log(`${DIM}Set "telemetry": false in .decantr/project.json to opt out.${RESET}`);
  }

  if (isOptedIn(projectRoot)) {
    const metrics = collectMetrics(essence, issues);
    sendGuardMetrics(metrics);
  }
}
