import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateEssence, evaluateGuard } from '@decantr/essence-spec';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

interface Issue {
  type: 'error' | 'warning';
  rule: string;
  message: string;
  suggestion?: string;
}

export async function cmdHeal(projectRoot: string = process.cwd()): Promise<void> {
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
        message: err
      });
    }
  }

  // Run guard rules
  try {
    const violations = evaluateGuard(essence, { themeRegistry: new Map(), patternRegistry: new Map() });
    for (const v of violations) {
      issues.push({
        type: v.severity === 'error' ? 'error' : 'warning',
        rule: v.rule,
        message: v.message,
        suggestion: v.suggestion
      });
    }
  } catch { /* guard evaluation optional */ }

  if (issues.length === 0) {
    console.log(`${GREEN}No issues found. Project is healthy.${RESET}`);
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
}
