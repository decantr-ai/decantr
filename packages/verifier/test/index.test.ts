import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { auditProject, critiqueFile } from '../src/index.js';

function createProjectRoot(): string {
  return mkdtempSync(join(tmpdir(), 'decantr-verifier-'));
}

describe('verifier', () => {
  it('audits project contract and reports missing review packs', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(join(projectRoot, 'decantr.essence.json'), JSON.stringify({
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

      const report = await auditProject(projectRoot);
      expect(report.valid).toBe(true);
      expect(report.summary.reviewPackPresent).toBe(false);
      expect(report.findings.some(finding => finding.id === 'review-pack-file-missing')).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('critiques files against the compiled review contract', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, '.decantr', 'context'), { recursive: true });
      mkdirSync(join(projectRoot, 'src', 'styles'), { recursive: true });
      writeFileSync(join(projectRoot, '.decantr', 'context', 'review-pack.json'), JSON.stringify({
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
          {
            id: 'hardcoded-colors',
            summary: 'Avoid hardcoded color literals.',
            guidance: 'Use CSS variables and theme decorators instead of hex, rgb, or hsl values.',
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
          focusAreas: ['theme-consistency', 'accessibility', 'responsive-design'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      }, null, 2));
      writeFileSync(join(projectRoot, 'src', 'styles', 'treatments.css'), '.brand-accent { color: var(--d-primary); }\n');
      const filePath = join(projectRoot, 'Example.tsx');
      writeFileSync(filePath, '<button className="plain" style={{ color: "#ff00ff" }}>Click me</button>\n');

      const report = await critiqueFile(filePath, projectRoot);
      expect(report.reviewPack?.packType).toBe('review');
      expect(report.focusAreas).toContain('accessibility');
      expect(report.findings.some(finding => finding.id === 'theme-consistency-weak')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'anti-pattern-inline-styles')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'anti-pattern-hardcoded-colors')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'responsive-signals-missing')).toBe(true);
      expect(report.scores.some(score => score.category === 'Topology Context')).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });
});
