import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { detectProject } from '../src/detect.js';
import {
  acceptBrownfieldLocalLaw,
  changedFiles,
  createBrownfieldCodifyProposal,
  createLocalLawTaskSummary,
  localPatternsPath,
  localRulesPath,
  validateLocalLaw,
  writeBrownfieldCodifyProposal,
  writeHostedPatternMappingProposal,
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
      join(testDir, 'src', 'components', 'Input.tsx'),
      'export function Input(props) { return <input className="border px-3 py-2" {...props} />; }\n',
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'src', 'components', 'Dialog.tsx'),
      'export function Dialog(props) { return <div role="dialog" aria-modal="true" {...props} />; }\n',
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'src', 'app', 'page.tsx'),
      'export default function Page() { return <nav className="theme-switcher actions"><button className="primaryAction tinyGhost secondary-action" style={{ color: "#fff" }}>Save</button><Dialog><button>Delete account</button></Dialog></nav>; }\n',
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
    expect(patterns.patterns?.find((pattern) => pattern.id === 'button')?.confidence?.tier).toBe(
      'medium',
    );
    expect(
      patterns.patterns
        ?.find((pattern) => pattern.id === 'button')
        ?.variants?.map((variant) => variant.id),
    ).toContain('secondary-action');
    expect(patterns.patterns?.find((pattern) => pattern.id === 'button')?.classHints).not.toContain(
      'theme-switcher actions',
    );
    expect(
      patterns.patterns?.find((pattern) => pattern.id === 'form-control')?.behavior_obligations
        ?.obligations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'label-associated' }),
        expect.objectContaining({ id: 'explicit-form-button-type' }),
      ]),
    );
    expect(
      patterns.patterns?.find((pattern) => pattern.id === 'confirmation-dialog')
        ?.behavior_obligations?.obligations,
    ).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'accessible-name' })]));

    const summary = createLocalLawTaskSummary(testDir);
    expect(summary.patternCount).toBeGreaterThan(0);
    expect(summary.ruleCount).toBeGreaterThan(0);
    expect(summary.behaviorObligations.map((entry) => entry.patternId)).toEqual(
      expect.arrayContaining(['form-control', 'confirmation-dialog']),
    );
    expect(
      summary.patterns.find((pattern) => pattern.id === 'confirmation-dialog')?.behaviorObligations
        ?.obligations[0]?.id,
    ).toBe('project-dialog-primitive');

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

  it('maps a hosted registry pattern into advisory local law without source takeover', () => {
    const result = writeHostedPatternMappingProposal({
      projectRoot: testDir,
      hostedPattern: {
        slug: 'hero',
        source: 'bundled',
        name: 'Hero',
        description: 'A high-signal entry section with copy and actions.',
        tags: ['landing', 'entry'],
        components: ['headline', 'cta'],
        interactions: ['primary-action'],
        visualBrief: 'Confident first-screen composition.',
      },
    });

    expect(result.localPatternId).toBe('hero');
    const proposal = JSON.parse(readFileSync(result.patternPath, 'utf-8')) as {
      patterns?: Array<{
        id?: string;
        componentPaths?: string[];
        hostedPatternRefs?: Array<{ slug?: string }>;
        enforcement?: { level?: string; status?: string };
      }>;
    };
    const mapped = proposal.patterns?.find((pattern) => pattern.id === 'hero');
    expect(mapped?.componentPaths).toEqual([]);
    expect(mapped?.hostedPatternRefs?.[0]?.slug).toBe('hero');
    expect(mapped?.enforcement?.level).toBe('advisory');
    expect(mapped?.enforcement?.status).toBe('needs-mapping');

    const validation = validateLocalLaw(testDir);
    expect(validation.patternPackPresent).toBe(false);
  });
});

describe('local law git changed files', () => {
  let repoRoot = '';

  beforeEach(() => {
    repoRoot = mkdtempSync(join(tmpdir(), 'decantr-local-law-git-'));
    mkdirSync(join(repoRoot, 'apps', 'web', 'src'), { recursive: true });
    mkdirSync(join(repoRoot, 'apps', 'admin', 'src'), { recursive: true });
    writeFileSync(join(repoRoot, 'apps', 'web', 'src', 'page.tsx'), 'export const web = 1;\n');
    writeFileSync(join(repoRoot, 'apps', 'admin', 'src', 'page.tsx'), 'export const admin = 1;\n');
    execFileSync('git', ['init'], { cwd: repoRoot, stdio: 'ignore' });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
    execFileSync('git', ['config', 'user.name', 'Decantr Test'], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
    execFileSync('git', ['add', '.'], { cwd: repoRoot, stdio: 'ignore' });
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: repoRoot, stdio: 'ignore' });
  });

  afterEach(() => {
    rmSync(repoRoot, { recursive: true, force: true });
  });

  it('scopes git changed files to the selected project root', () => {
    writeFileSync(join(repoRoot, 'apps', 'web', 'src', 'page.tsx'), 'export const web = 2;\n');
    writeFileSync(join(repoRoot, 'apps', 'admin', 'src', 'page.tsx'), 'export const admin = 2;\n');

    expect(changedFiles(join(repoRoot, 'apps', 'web'))).toEqual(['src/page.tsx']);
  });
});
