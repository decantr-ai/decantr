import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { scanStyling } from '../src/analyzers/styling.js';
import { detectProject } from '../src/detect.js';
import {
  acceptBrownfieldLocalLaw,
  createBrownfieldCodifyProposal,
  writeBrownfieldCodifyProposal,
} from '../src/local-law.js';
import {
  acceptStyleBridge,
  createStyleBridgeProposal,
  createStyleBridgeTaskSummary,
  readStyleBridge,
  styleBridgeMatches,
  styleBridgePath,
  writeStyleBridgeProposal,
} from '../src/style-bridge.js';

describe('hybrid style bridge', () => {
  let testDir = '';

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-style-bridge-'));
    mkdirSync(join(testDir, 'src', 'components'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'styles'), { recursive: true });
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { react: '^19.0.0' } }, null, 2),
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'src', 'components', 'Button.tsx'),
      'export function Button() { return <button className="btn primary action">Save</button>; }\n',
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'src', 'components', 'Card.tsx'),
      'export function Card() { return <section className="surface-card rounded shadow" />; }\n',
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'src', 'styles', 'themes.css'),
      [
        ':root { --surface: #fff; --primary: #2563eb; --focus-ring: #93c5fd; }',
        "[data-theme='dark'] { --surface: #111827; }",
        "[data-theme='holiday'] { --surface: #f0fdf4; }",
        '',
      ].join('\n'),
      'utf-8',
    );
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    writeFileSync(
      join(testDir, '.decantr', 'theme-inventory.json'),
      JSON.stringify(
        {
          modes: ['base', 'dark', 'holiday'],
          variants: [{ id: 'dark' }, { id: 'holiday' }],
          darkModeDetected: true,
        },
        null,
        2,
      ),
      'utf-8',
    );
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('proposes, accepts, summarizes, and matches a project-owned style bridge', () => {
    const localLaw = createBrownfieldCodifyProposal({
      projectRoot: testDir,
      detected: detectProject(testDir),
      essence: null,
      fromAudit: true,
    });
    writeBrownfieldCodifyProposal(testDir, localLaw);
    acceptBrownfieldLocalLaw(testDir);

    const proposal = createStyleBridgeProposal({
      projectRoot: testDir,
      detected: detectProject(testDir),
      essence: null,
      styling: scanStyling(testDir),
    });
    const proposalPath = writeStyleBridgeProposal(testDir, proposal);
    expect(existsSync(proposalPath)).toBe(true);
    expect(proposal.version).toBe(2);
    expect(proposal.styling.darkModeDetected).toBe(true);
    expect(proposal.styling.themeModes).toEqual(['base', 'dark', 'holiday']);
    expect(proposal.mappings.find((mapping) => mapping.id === 'surface')).toMatchObject({
      confidence: expect.any(Number),
      source: 'inferred',
      native: { kind: 'css-var', ref: '--surface' },
      essence: { kind: 'treatment', ref: 'surface' },
    });
    expect(proposal.mappings.find((mapping) => mapping.id === 'action')?.classHints).toContain(
      'btn primary action',
    );

    const acceptedPath = acceptStyleBridge(testDir);
    expect(acceptedPath).toBe(styleBridgePath(testDir));
    const accepted = JSON.parse(readFileSync(styleBridgePath(testDir), 'utf-8')) as {
      status?: string;
    };
    expect(accepted.status).toBe('accepted');

    const projectJson = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'project.json'), 'utf-8'),
    ) as { initialized?: { adoptionMode?: string } };
    expect(projectJson.initialized?.adoptionMode).toBe('style-bridge');

    const summary = createStyleBridgeTaskSummary(testDir);
    expect(summary.mappingCount).toBeGreaterThan(0);
    expect(styleBridgeMatches(testDir, 'standardize button action tokens')[0]?.id).toBe('action');
  });

  it('falls back to the styling scan when older projects have no theme inventory', () => {
    rmSync(join(testDir, '.decantr', 'theme-inventory.json'), { force: true });

    const proposal = createStyleBridgeProposal({
      projectRoot: testDir,
      detected: detectProject(testDir),
      essence: null,
      styling: scanStyling(testDir),
    });

    expect(proposal.styling.darkModeDetected).toBe(true);
    expect(proposal.styling.themeModes).toEqual(['base', 'dark']);
    expect(proposal.styling.themeVariantIds).toEqual(['dark']);
  });

  it('does not treat an unaccepted manifest at the authority path as a style bridge', () => {
    writeFileSync(
      styleBridgePath(testDir),
      JSON.stringify({
        version: 2,
        status: 'proposal',
        mappings: [{ id: 'surface', tokenHints: ['--surface'] }],
      }),
      'utf-8',
    );

    expect(readStyleBridge(testDir)).toBeNull();
    expect(createStyleBridgeTaskSummary(testDir)).toMatchObject({
      path: null,
      status: null,
      mappingCount: 0,
    });
    expect(styleBridgeMatches(testDir, 'surface tokens')).toEqual([]);
  });

  it('extracts Tailwind theme config tokens as bridge token hints', () => {
    writeFileSync(
      join(testDir, 'tailwind.config.ts'),
      [
        'export default {',
        '  theme: {',
        '    extend: {',
        '      colors: {',
        "        brand: '#0f766e',",
        "        danger: 'var(--danger)',",
        '      },',
        '    },',
        '  },',
        '}',
        '',
      ].join('\n'),
      'utf-8',
    );

    const styling = scanStyling(testDir);
    expect(styling.approach).toBe('tailwind');
    expect(styling.cssVariables).toEqual(
      expect.arrayContaining(['theme.colors.brand', 'theme.colors.danger']),
    );

    const proposal = createStyleBridgeProposal({
      projectRoot: testDir,
      detected: detectProject(testDir),
      essence: null,
      styling,
    });

    expect(proposal.styling.colorTokenNames).toEqual(expect.arrayContaining(['brand', 'danger']));
    expect(proposal.mappings.find((mapping) => mapping.id === 'action')?.tokenHints).toEqual(
      expect.arrayContaining(['theme.colors.danger']),
    );
  });
});
