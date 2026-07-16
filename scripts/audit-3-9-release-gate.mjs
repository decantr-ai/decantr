import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import {
  THREE_NINE_QUALIFIED_MODE,
  THREE_NINE_SOLE_MAINTAINER_MODE,
  THREE_NINE_WAIVED_REQUIREMENTS,
  readThreeNineReleasePolicy,
} from './3-9-release-policy.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const policy = readThreeNineReleasePolicy(root);
const qualification = spawnSync(
  process.execPath,
  [join(root, 'scripts/audit-3-9-qualification-baseline.mjs'), '--json'],
  {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  },
);

const errors = [...policy.errors];
let summary = null;
try {
  summary = JSON.parse(qualification.stdout);
} catch {
  errors.push('The underlying 3.9 qualification audit did not emit valid JSON.');
}

if (summary?.errors?.length > 0) {
  errors.push(...summary.errors.map((entry) => `Qualification audit: ${entry}`));
}

if (policy.mode === THREE_NINE_QUALIFIED_MODE) {
  if (qualification.status !== 0 || summary?.qualificationClaim !== true) {
    errors.push('The human-qualified release policy requires a passing qualification audit.');
  }
} else if (policy.mode === THREE_NINE_SOLE_MAINTAINER_MODE) {
  if (
    qualification.status !== 1
    || summary?.status !== 'incomplete'
    || summary?.qualificationClaim !== false
    || JSON.stringify(summary?.missingEvidence) !== JSON.stringify(THREE_NINE_WAIVED_REQUIREMENTS)
  ) {
    errors.push('The sole-maintainer release gate accepts only the exact four declared human-evidence gaps.');
  }
}

if (errors.length > 0) {
  console.error('Decantr 3.9 release evidence gate: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (policy.mode === THREE_NINE_QUALIFIED_MODE) {
  console.log('Decantr 3.9 release evidence gate: PASS (HUMAN QUALIFIED)');
} else {
  console.log('Decantr 3.9 release evidence gate: PASS (SOLE-MAINTAINER UNQUALIFIED)');
  console.log(`Waived evidence: ${THREE_NINE_WAIVED_REQUIREMENTS.join(', ')}`);
  console.log('Prohibited claims: release qualification, human finding precision/recall, adoption proven');
}

