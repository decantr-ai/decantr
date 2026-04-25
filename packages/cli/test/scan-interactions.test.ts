import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { scanProjectInteractions } from '../src/lib/scan-interactions.js';

describe('scanProjectInteractions (v2.1 C5 wiring)', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'decantr-scan-'));
  });

  afterEach(() => {
    if (projectRoot) rmSync(projectRoot, { recursive: true, force: true });
  });

  function setupProject(opts: {
    manifestPages: Array<{ id: string; pack: { interactions?: string[] }[] }>;
    sourceFiles: Record<string, string>;
  }): void {
    const contextDir = join(projectRoot, '.decantr', 'context');
    mkdirSync(contextDir, { recursive: true });

    // Write each page-pack as JSON. Manifest stores filename-only
    // relative to the manifest's directory (matches harness output).
    const pageEntries = opts.manifestPages.map((p) => {
      const fileName = `page-${p.id}.json`;
      writeFileSync(
        join(contextDir, fileName),
        JSON.stringify({ data: { patterns: p.pack } }, null, 2),
      );
      return { id: p.id, json: fileName };
    });

    // Manifest references those pack files
    writeFileSync(
      join(contextDir, 'pack-manifest.json'),
      JSON.stringify({ pages: pageEntries }, null, 2),
    );

    // Write source files at the project root (mock src/)
    const srcDir = join(projectRoot, 'src');
    mkdirSync(srcDir, { recursive: true });
    for (const [name, content] of Object.entries(opts.sourceFiles)) {
      writeFileSync(join(srcDir, name), content);
    }
  }

  it('returns empty when no manifest exists', () => {
    expect(scanProjectInteractions(projectRoot)).toEqual([]);
  });

  it('returns empty when manifest has no pages', () => {
    mkdirSync(join(projectRoot, '.decantr', 'context'), { recursive: true });
    writeFileSync(
      join(projectRoot, '.decantr', 'context', 'pack-manifest.json'),
      JSON.stringify({ pages: [] }),
    );
    expect(scanProjectInteractions(projectRoot)).toEqual([]);
  });

  it('flags missing status-pulse when source lacks d-pulse', () => {
    setupProject({
      manifestPages: [
        { id: 'overview', pack: [{ interactions: ['status-pulse'] }] },
      ],
      sourceFiles: {
        'App.tsx': 'export default function App() { return <div>hello</div>; }',
      },
    });

    const issues = scanProjectInteractions(projectRoot);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('status-pulse');
    expect(issues[0]).toContain('d-pulse');
  });

  it('passes when source uses d-pulse for status-pulse', () => {
    setupProject({
      manifestPages: [
        { id: 'overview', pack: [{ interactions: ['status-pulse'] }] },
      ],
      sourceFiles: {
        'Indicator.tsx': '<span className="d-pulse" data-status="active" />',
      },
    });

    expect(scanProjectInteractions(projectRoot)).toEqual([]);
  });

  it('aggregates declarations across multiple page packs', () => {
    setupProject({
      manifestPages: [
        { id: 'home', pack: [{ interactions: ['animate-on-mount'] }] },
        { id: 'detail', pack: [{ interactions: ['glow-hover', 'lift-hover'] }] },
      ],
      sourceFiles: {
        'Home.tsx': '<div className="d-enter-fade" />',
        // intentionally omit glow-hover and lift-hover
      },
    });

    const issues = scanProjectInteractions(projectRoot);
    const interactions = issues.map((s) => s.split(' →')[0]).sort();
    expect(interactions).toEqual(['glow-hover', 'lift-hover']);
  });

  it('skips node_modules and dist when walking', () => {
    setupProject({
      manifestPages: [
        { id: 'home', pack: [{ interactions: ['status-pulse'] }] },
      ],
      sourceFiles: {
        // src has at least one file but it does NOT contain d-pulse
        'App.tsx': 'export default function App() { return null; }',
      },
    });
    // Plant a "would match" signal inside node_modules — should be ignored
    const nm = join(projectRoot, 'node_modules', 'some-pkg');
    mkdirSync(nm, { recursive: true });
    writeFileSync(join(nm, 'index.tsx'), '<span className="d-pulse" />');

    const dist = join(projectRoot, 'dist');
    mkdirSync(dist, { recursive: true });
    writeFileSync(join(dist, 'bundle.js'), 'd-pulse');

    // Source has files but none contain d-pulse → status-pulse is missing.
    // node_modules + dist hits should be skipped, so they don't satisfy.
    const issues = scanProjectInteractions(projectRoot);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('status-pulse');
  });

  it('handles manifest pointing to missing pack files gracefully', () => {
    mkdirSync(join(projectRoot, '.decantr', 'context'), { recursive: true });
    writeFileSync(
      join(projectRoot, '.decantr', 'context', 'pack-manifest.json'),
      JSON.stringify({
        pages: [{ id: 'home', json: 'missing.json' }],
      }),
    );

    expect(scanProjectInteractions(projectRoot)).toEqual([]);
  });

  it('handles malformed pack JSON gracefully', () => {
    mkdirSync(join(projectRoot, '.decantr', 'context'), { recursive: true });
    writeFileSync(
      join(projectRoot, '.decantr', 'context', 'page-broken.json'),
      'not valid json {{',
    );
    writeFileSync(
      join(projectRoot, '.decantr', 'context', 'pack-manifest.json'),
      JSON.stringify({ pages: [{ id: 'broken', json: 'page-broken.json' }] }),
    );

    expect(scanProjectInteractions(projectRoot)).toEqual([]);
  });

  it('multi-pattern in same page-pack with mixed implementation', () => {
    setupProject({
      manifestPages: [
        {
          id: 'detail',
          pack: [
            { interactions: ['drag-nodes', 'pan-background'] },
            { interactions: ['glow-hover'] },
          ],
        },
      ],
      sourceFiles: {
        'Canvas.tsx':
          'function C() { return <div onPointerDown={s} onPointerMove={m} className="d-glow-hover" style={{ transform: "translate(0,0)" }} />; }',
      },
    });

    // drag-nodes → onPointerDown/Move match
    // glow-hover → d-glow-hover match
    // pan-background → looks for transform.*translate (matches via inline style)
    expect(scanProjectInteractions(projectRoot)).toEqual([]);
  });

  it('deduplicates interactions across pages', () => {
    setupProject({
      manifestPages: [
        { id: 'a', pack: [{ interactions: ['status-pulse'] }] },
        { id: 'b', pack: [{ interactions: ['status-pulse'] }] },
        { id: 'c', pack: [{ interactions: ['status-pulse'] }] },
      ],
      sourceFiles: {
        'App.tsx': 'export default function() { return null; }',
      },
    });

    const issues = scanProjectInteractions(projectRoot);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('status-pulse');
  });
});
