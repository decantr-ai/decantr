import { describe, it, expect } from 'vitest';
import { formatViolations, formatViolation } from '../src/overlay.js';
import type { GuardViolation } from '@decantr/essence-spec';

describe('formatViolation', () => {
  it('formats a DNA error violation', () => {
    const v: GuardViolation = {
      rule: 'style',
      severity: 'error',
      message: 'Style "glassmorphism" does not match essence theme "luminarum".',
      layer: 'dna',
      autoFixable: false,
    };
    const result = formatViolation(v);
    expect(result).toContain('[DNA]');
    expect(result).toContain('[style]');
    expect(result).toContain('glassmorphism');
  });

  it('formats a blueprint warning with autofix hint', () => {
    const v: GuardViolation = {
      rule: 'structure',
      severity: 'warning',
      message: 'Page "settings" does not exist in essence structure.',
      layer: 'blueprint',
      autoFixable: true,
      autoFix: { type: 'add_page', patch: { id: 'settings' } },
    };
    const result = formatViolation(v);
    expect(result).toContain('[Blueprint]');
    expect(result).toContain('[structure]');
    expect(result).toContain('auto-fixable');
  });

  it('formats a v2 violation without layer', () => {
    const v: GuardViolation = {
      rule: 'style',
      severity: 'error',
      message: 'Style mismatch.',
    };
    const result = formatViolation(v);
    expect(result).not.toContain('[DNA]');
    expect(result).not.toContain('[Blueprint]');
    expect(result).toContain('[style]');
  });
});

describe('formatViolations', () => {
  it('returns null for empty violations', () => {
    expect(formatViolations([])).toBeNull();
  });

  it('returns structured error for violations', () => {
    const violations: GuardViolation[] = [
      { rule: 'style', severity: 'error', message: 'Bad style.', layer: 'dna' },
      { rule: 'structure', severity: 'warning', message: 'Missing page.', layer: 'blueprint' },
    ];
    const result = formatViolations(violations);
    expect(result).not.toBeNull();
    expect(result!.message).toContain('2 guard violation');
    expect(result!.id).toBe('decantr-guard');
    expect(result!.frame).toContain('[DNA]');
    expect(result!.frame).toContain('[Blueprint]');
  });

  it('splits errors and warnings in output', () => {
    const violations: GuardViolation[] = [
      { rule: 'style', severity: 'error', message: 'Error one.' },
      { rule: 'density', severity: 'warning', message: 'Warning one.' },
    ];
    const result = formatViolations(violations);
    expect(result!.frame).toContain('Errors');
    expect(result!.frame).toContain('Warnings');
  });
});
