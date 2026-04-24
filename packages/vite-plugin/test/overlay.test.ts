import type { GuardViolation } from '@decantr/essence-spec';
import { describe, expect, it } from 'vitest';
import { formatViolation, formatViolations } from '../src/overlay.js';

describe('formatViolation', () => {
  it('formats a DNA error violation', () => {
    const v: GuardViolation = {
      rule: 'theme',
      severity: 'error',
      message: 'Theme "glassmorphism" does not match essence theme "luminarum".',
      layer: 'dna',
      autoFixable: false,
    };
    const result = formatViolation(v);
    expect(result).toContain('[DNA]');
    expect(result).toContain('[theme]');
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
      rule: 'theme',
      severity: 'error',
      message: 'Theme mismatch.',
    };
    const result = formatViolation(v);
    expect(result).not.toContain('[DNA]');
    expect(result).not.toContain('[Blueprint]');
    expect(result).toContain('[theme]');
  });
});

describe('formatViolations', () => {
  it('returns null for empty violations', () => {
    expect(formatViolations([])).toBeNull();
  });

  it('returns structured error for violations', () => {
    const violations: GuardViolation[] = [
      { rule: 'theme', severity: 'error', message: 'Bad theme.', layer: 'dna' },
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
      { rule: 'theme', severity: 'error', message: 'Error one.' },
      { rule: 'density', severity: 'warning', message: 'Warning one.' },
    ];
    const result = formatViolations(violations);
    expect(result!.frame).toContain('Errors');
    expect(result!.frame).toContain('Warnings');
  });
});
