import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { detectProject } from '../src/detect.js';
import {
  acceptBrownfieldLocalLaw,
  createBrownfieldCodifyProposal,
  createLocalLawTaskSummary,
  localPatternsPath,
  localRulesPath,
  validateLocalLaw,
  writeBrownfieldCodifyProposal,
} from '../src/local-law.js';

describe('brownfield local law', () => {
  let testDir = '';

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-local-law-'));
    mkdirSync(join(testDir, 'src', 'components'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app'), { recursive: true });
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { react: '^19.0.0' } }, null, 2),
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'src', 'components', 'Button.tsx'),
      'export function Button(props) { return <button className="rounded-md px-3 py-2" {...props} />; }\n',
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'src', 'components', 'Card.tsx'),
      'export function Card(props) { return <section className="rounded-lg border bg-card p-4 shadow-sm" {...props} />; }\n',
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'src', 'app', 'page.tsx'),
      'export default function Page() { return <nav className="theme-switcher actions"><button className="primaryAction tinyGhost secondary-action" style={{ color: "#fff" }}>Save</button></nav>; }\n',
      'utf-8',
    );
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('proposes, accepts, summarizes, and validates project-owned Brownfield law', () => {
    const proposal = createBrownfieldCodifyProposal({
      projectRoot: testDir,
      detected: detectProject(testDir),
      essence: null,
      fromAudit: true,
    });

    const written = writeBrownfieldCodifyProposal(testDir, proposal);
    expect(existsSync(written.patternPath)).toBe(true);
    expect(existsSync(written.rulesPath)).toBe(true);

    const accepted = acceptBrownfieldLocalLaw(testDir);
    expect(accepted.patternAcceptedPath).toBe(localPatternsPath(testDir));
    expect(accepted.rulesAcceptedPath).toBe(localRulesPath(testDir));

    const patterns = JSON.parse(readFileSync(localPatternsPath(testDir), 'utf-8')) as {
      status?: string;
      patterns?: Array<{ id?: string; componentPaths?: string[]; classHints?: string[] }>;
    };
    expect(patterns.status).toBe('accepted');
    expect(patterns.patterns?.find((pattern) => pattern.id === 'button')?.componentPaths).toContain(
      'src/components/Button.tsx',
    );
    expect(patterns.patterns?.find((pattern) => pattern.id === 'button')?.classHints).toContain(
      'primaryAction tinyGhost secondary-action',
    );
    expect(
      patterns.patterns?.find((pattern) => pattern.id === 'button')?.classHints,
    ).not.toContain('theme-switcher actions');

    const summary = createLocalLawTaskSummary(testDir);
    expect(summary.patternCount).toBeGreaterThan(0);
    expect(summary.ruleCount).toBeGreaterThan(0);

    const validation = validateLocalLaw(testDir);
    expect(validation.patternPackPresent).toBe(true);
    expect(validation.ruleManifestPresent).toBe(true);
    expect(validation.findings.map((finding) => finding.ruleId)).toEqual(
      expect.arrayContaining(['no-inline-style', 'no-raw-color-literals', 'prefer-button-wrapper']),
    );
    expect(
      validation.findings.some((finding) => finding.file === 'src/components/Button.tsx'),
    ).toBe(false);
  });
});
