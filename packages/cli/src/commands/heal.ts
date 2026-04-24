import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateGuard, validateEssence } from '@decantr/essence-spec';
import { buildGuardRegistryContext } from '../guard-context.js';
import { collectMetrics, isOptedIn, optIn, sendGuardMetrics } from '../telemetry.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

interface Issue {
  type: 'error' | 'warning';
  rule: string;
  message: string;
  suggestion?: string;
}

export interface CheckOptions {
  telemetry?: boolean;
}

export async function cmdHeal(
  projectRoot: string = process.cwd(),
  options: CheckOptions = {},
): Promise<void> {
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error('No decantr.essence.json found. Run `decantr init` first.');
    process.exitCode = 1;
    return;
  }

  const essence = JSON.parse(readFileSync(essencePath, 'utf-8'));

  console.log('Scanning for issues...\n');

  const issues: Issue[] = [];

  // Validate schema
  const validation = validateEssence(essence);
  if (!validation.valid) {
    for (const err of validation.errors) {
      issues.push({
        type: 'error',
        rule: 'schema',
        message: err,
      });
    }
  }

  // Run guard rules
  try {
    const violations = evaluateGuard(essence, buildGuardRegistryContext(projectRoot));
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

  console.log(`\n${YELLOW}Manual fixes required. Review the issues above.${RESET}`);

  await maybeSendTelemetry(projectRoot, essence, issues, options);
}

async function maybeSendTelemetry(
  projectRoot: string,
  essence: Record<string, unknown>,
  issues: Issue[],
  options: CheckOptions,
): Promise<void> {
  if (options.telemetry && !isOptedIn(projectRoot)) {
    optIn(projectRoot);
    console.log(
      `\n${CYAN}Telemetry enabled.${RESET} Anonymous guard metrics will be sent on future checks.`,
    );
    console.log(`${DIM}Set "telemetry": false in .decantr/project.json to opt out.${RESET}`);
  }

  if (isOptedIn(projectRoot)) {
    const metrics = collectMetrics(essence, issues);
    sendGuardMetrics(metrics);
  }
}
