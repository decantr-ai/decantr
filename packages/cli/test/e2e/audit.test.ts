import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

function runCli(cwd: string, args: string): string {
  const cliPath = join(__dirname, '..', '..', 'dist', 'bin.js');
  try {
    return execSync(`node ${cliPath} ${args}`, {
      cwd,
      encoding: 'utf-8',
      env: process.env,
    });
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string };
    return `${execError.stdout ?? ''}${execError.stderr ?? ''}`;
  }
}

describe('audit command (e2e)', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-audit-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('audits the project contract and reports missing review packs', () => {
    writeFileSync(join(testDir, 'decantr.essence.json'), JSON.stringify({
      version: '3.0.0',
      dna: {
        theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
        spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
        typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
        color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
        radius: { philosophy: 'rounded', base: 8 },
        elevation: { system: 'layered', max_levels: 3 },
        motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
        accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
        personality: ['professional'],
      },
      blueprint: {
        shell: 'sidebar-main',
        pages: [{ id: 'home', layout: ['hero'] }],
        features: [],
      },
      meta: {
        archetype: 'marketing',
        target: 'react',
        platform: { type: 'spa', routing: 'hash' },
        guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
      },
    }, null, 2));

    const output = runCli(testDir, 'audit');

    expect(output).toContain('Project contract is valid.');
    expect(output).toContain('Review pack: missing');
    expect(output).toContain('review pack file is missing');
  });

  it('critiques a specific file against the compiled review pack', () => {
    mkdirSync(join(testDir, '.decantr', 'context'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'styles'), { recursive: true });
    writeFileSync(join(testDir, '.decantr', 'context', 'review-pack.json'), JSON.stringify({
      $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
      packVersion: '1.0.0',
      packType: 'review',
      objective: 'Review generated output against the compiled Decantr contract.',
      target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
      preset: null,
      scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
      requiredSetup: [],
      allowedVocabulary: [],
      examples: [],
      antiPatterns: [
        {
          id: 'inline-styles',
          summary: 'Avoid inline style literals as the primary styling path.',
          guidance: 'Move visual styling into tokens.css and treatments.css instead of component-local style objects.',
        },
      ],
      successChecks: [
        {
          id: 'theme-consistency',
          label: 'Theme identity and mode remain consistent across scaffolded routes.',
          severity: 'warn',
        },
      ],
      tokenBudget: { target: 1400, max: 2200, strategy: [] },
      data: {
        reviewType: 'app',
        shell: 'sidebar-main',
        theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
        routing: 'hash',
        features: [],
        routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
        focusAreas: ['theme-consistency', 'responsive-design'],
        workflow: [],
      },
      renderedMarkdown: '# Review Pack\n',
    }, null, 2));
    writeFileSync(join(testDir, 'src', 'styles', 'treatments.css'), '.brand-accent { color: var(--d-primary); }\n');
    const filePath = join(testDir, 'Example.tsx');
    writeFileSync(filePath, '<button style={{ color: "#ff00ff" }}>Click me</button>\n');

    const output = runCli(testDir, `audit ${filePath}`);

    expect(output).toContain('Overall score:');
    expect(output).toContain('Focus areas: theme-consistency, responsive-design');
    expect(output).toContain('Inline style literals were detected');
  });
});
