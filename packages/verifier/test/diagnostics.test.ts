import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { deriveVerificationDiagnostic, KNOWN_VERIFICATION_DIAGNOSTICS } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..', '..');

describe('verification diagnostics', () => {
  it('exports the curated diagnostic catalog used by stable code lookup', () => {
    expect(KNOWN_VERIFICATION_DIAGNOSTICS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: 'typed-graph-current',
          code: 'GRAPH001',
          repairId: 'regenerate-typed-graph',
        }),
        expect.objectContaining({
          rule: 'style-bridge-arbitrary-value',
          code: 'TOKEN010',
          repairId: 'replace-arbitrary-style-with-bridge-token',
        }),
      ]),
    );
  });

  it('keeps the public diagnostic code reference aligned with the typed catalog', () => {
    const reference = readFileSync(
      join(repoRoot, 'docs', 'reference', 'diagnostic-codes.md'),
      'utf-8',
    );

    for (const entry of KNOWN_VERIFICATION_DIAGNOSTICS) {
      expect(reference, entry.code).toContain(`\`${entry.code}\``);
      expect(reference, entry.rule).toContain(`\`${entry.rule}\``);
      expect(reference, entry.repairId).toContain(`\`${entry.repairId}\``);
    }
  });

  it('assigns curated stable codes and repair IDs for known rules', () => {
    const diagnostic = deriveVerificationDiagnostic({
      id: 'assertion-contract-route',
      source: 'assertion',
      category: 'Contract route',
      message: 'A page has no route.',
      rule: 'page-route-required',
      target: 'marketing/home',
      evidence: ['marketing/home has no route'],
    });

    expect(diagnostic.code).toBe('STRUCT001');
    expect(diagnostic.repair).toMatchObject({
      id: 'add-page-route',
      payload: {
        source: 'assertion',
        rule: 'page-route-required',
        target: 'marketing/home',
      },
    });
  });

  it('derives deterministic fallback codes from source and finding identity', () => {
    const first = deriveVerificationDiagnostic({
      id: 'custom-local-rule',
      source: 'check',
      category: 'Contract Check',
      message: 'Custom local rule failed.',
      rule: 'custom-local-rule',
    });
    const second = deriveVerificationDiagnostic({
      id: 'custom-local-rule',
      source: 'check',
      category: 'Contract Check',
      message: 'Custom local rule failed.',
      rule: 'custom-local-rule',
    });

    expect(first.code).toBe(second.code);
    expect(first.code).toMatch(/^CHECK\d{3}$/);
    expect(first.repair.id).toBe('repair-contract-check');
  });

  it('uses typed repair metadata for component reuse drift', () => {
    const diagnostic = deriveVerificationDiagnostic({
      id: 'component-reuse-primitive-reimplemented',
      source: 'audit',
      category: 'Component Reuse',
      message: 'Button was reimplemented locally.',
      rule: 'component-reuse-primitive-reimplemented',
      target: 'Button',
      file: 'src/app/dashboard/page.tsx',
    });

    expect(diagnostic.code).toBe('COMP001');
    expect(diagnostic.repair).toMatchObject({
      id: 'import-existing-component',
      payload: {
        source: 'audit',
        rule: 'component-reuse-primitive-reimplemented',
        target: 'Button',
        file: 'src/app/dashboard/page.tsx',
      },
    });
  });

  it('uses typed repair metadata for raw control drift', () => {
    const diagnostic = deriveVerificationDiagnostic({
      id: 'component-reuse-raw-control',
      source: 'audit',
      category: 'Component Reuse',
      message: 'Raw button was used where Button exists.',
      rule: 'component-reuse-raw-control',
      target: 'Button',
      file: 'src/app/dashboard/page.tsx',
    });

    expect(diagnostic.code).toBe('COMP010');
    expect(diagnostic.repair).toMatchObject({
      id: 'replace-raw-control-with-local-component',
      payload: {
        source: 'audit',
        rule: 'component-reuse-raw-control',
        target: 'Button',
        file: 'src/app/dashboard/page.tsx',
      },
    });
  });

  it('uses typed repair metadata for accepted style bridge drift', () => {
    const diagnostic = deriveVerificationDiagnostic({
      id: 'style-bridge-arbitrary-value',
      source: 'style-bridge',
      category: 'Style Bridge',
      message: 'An arbitrary Tailwind value bypassed the accepted bridge.',
      rule: 'style-bridge-arbitrary-value',
      target: 'bg-[#0f172a]',
      file: 'src/app/dashboard/page.tsx',
    });

    expect(diagnostic.code).toBe('TOKEN010');
    expect(diagnostic.repair).toMatchObject({
      id: 'replace-arbitrary-style-with-bridge-token',
      payload: {
        source: 'style-bridge',
        rule: 'style-bridge-arbitrary-value',
        target: 'bg-[#0f172a]',
        file: 'src/app/dashboard/page.tsx',
      },
    });
  });
});
