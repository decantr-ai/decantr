import type { GuardViolation } from '@decantr/essence-spec';

export function guardWarn(violation: GuardViolation): void {
  console.warn(`[decantr guard] ${violation.rule}: ${violation.message}`);
  if (violation.suggestion) console.warn(`  suggestion: ${violation.suggestion}`);
}

export function guardError(violation: GuardViolation): void {
  throw new Error(`[decantr guard] ${violation.rule}: ${violation.message}`);
}

export function handleViolations(
  violations: GuardViolation[],
  dnaEnforcement: 'error' | 'warn' | 'off',
  blueprintEnforcement: 'warn' | 'off',
): void {
  for (const v of violations) {
    if (v.layer === 'dna') {
      if (dnaEnforcement === 'error') guardError(v);
      else if (dnaEnforcement === 'warn') guardWarn(v);
    } else if (v.layer === 'blueprint') {
      if (blueprintEnforcement === 'warn') guardWarn(v);
    }
  }
}
