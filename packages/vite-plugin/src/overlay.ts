import type { GuardViolation } from '@decantr/essence-spec';

export interface OverlayError {
  id: string;
  message: string;
  frame: string;
  plugin: string;
}

export function formatViolation(v: GuardViolation): string {
  const layerTag = v.layer ? `[${v.layer === 'dna' ? 'DNA' : 'Blueprint'}] ` : '';
  const fixHint = v.autoFixable ? ' (auto-fixable via decantr_accept_drift)' : '';
  return `${layerTag}[${v.rule}] ${v.message}${fixHint}`;
}

export function formatViolations(violations: GuardViolation[]): OverlayError | null {
  if (violations.length === 0) return null;

  const errors = violations.filter((v) => v.severity === 'error');
  const warnings = violations.filter((v) => v.severity === 'warning');

  const sections: string[] = [];

  if (errors.length > 0) {
    sections.push('Errors:');
    for (const v of errors) {
      sections.push(`  ${formatViolation(v)}`);
    }
  }

  if (warnings.length > 0) {
    if (sections.length > 0) sections.push('');
    sections.push('Warnings:');
    for (const v of warnings) {
      sections.push(`  ${formatViolation(v)}`);
    }
  }

  return {
    id: 'decantr-guard',
    message: `Decantr: ${violations.length} guard violation${violations.length === 1 ? '' : 's'} detected`,
    frame: sections.join('\n'),
    plugin: '@decantr/vite-plugin',
  };
}
