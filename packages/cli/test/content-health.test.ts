import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createContentHealthReport,
  formatContentHealthMarkdown,
  shouldFailContentHealth,
} from '../src/commands/content-health.js';

let testDir = '';

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function ensureContentDirs(): void {
  for (const dir of ['patterns', 'themes', 'blueprints', 'archetypes', 'shells']) {
    mkdirSync(join(testDir, dir), { recursive: true });
  }
}

function writeHealthyContent(): void {
  ensureContentDirs();
  writeJson(join(testDir, 'patterns', 'hero.json'), {
    $schema: 'https://decantr.ai/schemas/pattern.v2.json',
    id: 'hero',
    version: '1.0.0',
    name: 'Hero',
    description: 'A polished hero section for first-viewport product storytelling.',
    components: ['Button'],
    default_preset: 'default',
    presets: {
      default: {
        description: 'Detailed hero preset with headline, supporting copy, and primary action.',
        layout: { layout: 'stack', atoms: '_flex _col _gap4' },
      },
    },
    visual_brief:
      'A crisp full-width hero with generous spacing, clear brand signal, and strong CTA hierarchy.',
    interactions: ['scale-hover'],
  });
  writeJson(join(testDir, 'themes', 'clean.json'), {
    $schema: 'https://decantr.ai/schemas/theme.v1.json',
    id: 'clean',
    name: 'Clean',
    description: 'Quiet neutral theme with restrained borders and focused accent states.',
    palette: {
      background: { light: '#ffffff', dark: '#111111' },
      surface: { light: '#f8f8f8', dark: '#1a1a1a' },
      text: { light: '#111111', dark: '#ffffff' },
      muted: { light: '#666666', dark: '#aaaaaa' },
      accent: { light: '#2563eb', dark: '#60a5fa' },
    },
    decorators: {
      'clean-panel': 'Subtle bordered panel for dense operational content surfaces.',
    },
  });
  writeJson(join(testDir, 'shells', 'top-nav-footer.json'), {
    $schema: 'https://decantr.ai/schemas/shell.v1.json',
    id: 'top-nav-footer',
    name: 'Top Nav Footer',
  });
  writeJson(join(testDir, 'archetypes', 'marketing.json'), {
    $schema: 'https://decantr.ai/schemas/archetype.v2.json',
    id: 'marketing',
    version: '1.0.0',
    name: 'Marketing',
    description: 'Public marketing surface with a home route and conversion-friendly layout.',
    tags: ['marketing'],
    role: 'public',
    pages: [{ id: 'home', shell: 'top-nav-footer', default_layout: ['hero'] }],
    features: [],
    page_briefs: {
      home: 'Homepage should establish the product, proof, and primary conversion path.',
    },
  });
  writeJson(join(testDir, 'blueprints', 'portfolio.json'), {
    $schema: 'https://decantr.ai/schemas/blueprint.v1.json',
    id: 'portfolio',
    version: '1.0.0',
    name: 'Portfolio',
    theme: { id: 'clean' },
    compose: ['marketing'],
    personality:
      'Precise, editorial portfolio with quiet surfaces, confident hierarchy, and restrained motion that keeps the work itself in focus.',
    voice: {
      tone: 'Confident and direct.',
      cta_verbs: ['View', 'Contact'],
      avoid: ['Click here'],
      empty_states: 'Keep states concise.',
      errors: 'Actionable and specific.',
      loading: 'Calm skeletons.',
    },
    routes: {
      '/': { archetype: 'marketing', shell: 'top-nav-footer', page: 'home' },
    },
  });
}

describe('Content Health report', () => {
  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-content-health-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('produces a healthy report for a valid content repository', async () => {
    writeHealthyContent();

    const report = await createContentHealthReport(testDir);

    expect(report.$schema).toBe('https://decantr.ai/schemas/content-health-report.v1.json');
    expect(report.status).toBe('healthy');
    expect(report.summary.itemCount).toBe(5);
    expect(report.references.missing).toBe(0);
    expect(report.quality.patternVisualBriefCoverage).toBe(1);
  });

  it('emits JSON that validates against the public content-health schema', async () => {
    writeHealthyContent();

    const report = await createContentHealthReport(testDir);
    const require = createRequire(import.meta.url);
    const schema = require('@decantr/registry/schema/content-health-report.v1.json');
    const ajv = new Ajv2020({ strict: false, formats: { 'date-time': true } });
    const validate = ajv.compile(schema);

    expect(validate(report)).toBe(true);
  });

  it('reports invalid JSON and fails an error CI gate', async () => {
    ensureContentDirs();
    writeFileSync(join(testDir, 'patterns', 'hero.json'), '{ invalid json', 'utf-8');

    const report = await createContentHealthReport(testDir);

    expect(report.status).toBe('error');
    expect(report.findings.some((finding) => finding.rule === 'json-invalid')).toBe(true);
    expect(shouldFailContentHealth(report, 'error')).toBe(true);
  });

  it('reports missing registry references', async () => {
    writeHealthyContent();
    writeJson(join(testDir, 'blueprints', 'portfolio.json'), {
      $schema: 'https://decantr.ai/schemas/blueprint.v1.json',
      id: 'portfolio',
      version: '1.0.0',
      name: 'Portfolio',
      theme: { id: 'clean' },
      compose: ['missing-archetype'],
      personality:
        'Precise, editorial portfolio with quiet surfaces, confident hierarchy, and restrained motion that keeps the work itself in focus.',
      routes: {
        '/': { archetype: 'missing-archetype', shell: 'top-nav-footer', page: 'home' },
      },
    });

    const report = await createContentHealthReport(testDir);

    expect(report.status).toBe('error');
    expect(report.references.missingByType.archetype).toBeGreaterThan(0);
    expect(report.findings.some((finding) => finding.rule === 'blueprint-compose-archetype')).toBe(
      true,
    );
  });

  it('renders markdown and scoped remediation prompts for quality findings', async () => {
    writeHealthyContent();
    writeJson(join(testDir, 'patterns', 'hero.json'), {
      $schema: 'https://decantr.ai/schemas/pattern.v2.json',
      id: 'hero',
      version: '1.0.0',
      name: 'Hero',
      description: 'A polished hero section for first-viewport product storytelling.',
      components: ['Button'],
      default_preset: 'default',
      presets: {
        default: {
          description: 'Detailed hero preset with headline, supporting copy, and primary action.',
          layout: { layout: 'stack', atoms: '_flex _col _gap4' },
        },
      },
    });

    const report = await createContentHealthReport(testDir);
    const markdown = formatContentHealthMarkdown(report);
    const finding = report.findings.find((entry) => entry.rule === 'pattern-guidance-missing');

    expect(report.status).toBe('warning');
    expect(shouldFailContentHealth(report, 'error')).toBe(false);
    expect(shouldFailContentHealth(report, 'warn')).toBe(true);
    expect(markdown).toContain('# Decantr Content Health');
    expect(finding?.remediation.prompt).toContain(
      'You are fixing one Decantr Content Health finding',
    );
  });
});
