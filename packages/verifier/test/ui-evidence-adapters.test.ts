import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { discoverProject, scanProject } from '../src/index.js';

describe('UI evidence adapter discovery', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'decantr-ui-evidence-'));
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('reports all adapters independently without promoting UI authority or readiness', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: {
          react: '^19.0.0',
          'react-router-dom': '^7.0.0',
          storybook: '^9.0.0',
          '@figma/code-connect': '^1.0.0',
          'style-dictionary': '^5.0.0',
          vitest: '^3.0.0',
          '@playwright/test': '^1.0.0',
          '@axe-core/playwright': '^4.0.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    mkdirSync(join(projectRoot, '.storybook'), { recursive: true });
    mkdirSync(join(projectRoot, 'tokens'), { recursive: true });
    mkdirSync(join(projectRoot, '.decantr', 'evidence', 'runtime'), { recursive: true });
    mkdirSync(join(projectRoot, '.decantr', 'evidence', 'visual'), { recursive: true });
    mkdirSync(join(projectRoot, '.decantr', 'evidence', 'accessibility'), {
      recursive: true,
    });
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      'import { Route } from "react-router-dom"; export const App = () => <Route path="/settings" element={<main />} />;\n',
    );
    writeFileSync(join(projectRoot, '.storybook', 'main.ts'), 'export default {};\n');
    writeFileSync(
      join(projectRoot, 'src', 'Button.stories.tsx'),
      'export default { title: "Button" };\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'Button.figma.tsx'),
      'export const ButtonConnect = true;\n',
    );
    writeFileSync(
      join(projectRoot, 'tokens', 'design-tokens.json'),
      JSON.stringify({ color: { accent: { $type: 'color', $value: '#06f' } } }),
    );
    writeFileSync(
      join(projectRoot, 'src', 'Button.test.tsx'),
      'test("button", async () => { await expect(page).toHaveScreenshot(); await axe(page); });\n',
    );
    writeFileSync(join(projectRoot, '.decantr', 'evidence', 'runtime', 'settings.json'), '{}\n');
    writeFileSync(join(projectRoot, '.decantr', 'evidence', 'visual', 'Button.png'), 'fixture');
    writeFileSync(
      join(projectRoot, '.decantr', 'evidence', 'accessibility', 'Button-axe.json'),
      '{}\n',
    );

    const discovery = discoverProject(projectRoot);
    const adapters = discovery.surfaces.evidenceAdapters;

    expect(discovery.routes.authority).toBe('inferred');
    expect(discovery.surfaces.status).toBe('blocked');
    expect(discovery.components.items.map((item) => item.file)).not.toContain(
      'src/Button.figma.tsx',
    );
    expect(adapters.storybook.status).toBe('available');
    expect(adapters.storybook.files.map((entry) => entry.file)).toEqual(
      expect.arrayContaining(['.storybook/main.ts', 'src/Button.stories.tsx']),
    );
    expect(adapters.figmaCodeConnect.status).toBe('available');
    expect(adapters.designTokens.status).toBe('available');
    expect(adapters.projectTests.status).toBe('available');
    expect(adapters.runtime.status).toBe('available');
    expect(adapters.visual.status).toBe('available');
    expect(adapters.accessibility.status).toBe('available');
    expect(Object.values(adapters).every((adapter) => adapter.limitations.length > 0)).toBe(true);
  });

  it('reports absence explicitly and keeps configuration distinct from collected evidence', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { react: '^19.0.0', storybook: '^9.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'Button.tsx'),
      'export const Button = () => <button />;\n',
    );

    const adapters = discoverProject(projectRoot).surfaces.evidenceAdapters;

    expect(adapters.storybook.status).toBe('configured');
    expect(adapters.storybook.files).toEqual([]);
    expect(adapters.runtime.status).toBe('absent');
    expect(adapters.visual.status).toBe('absent');
    expect(adapters.accessibility.status).toBe('absent');
    expect(adapters.runtime.limitations).toContain(
      'No project-owned runtime evidence artifact was found.',
    );
  });

  it('does not let story evidence promote an unsupported package to UI authority', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ name: '@example/story-sources', dependencies: {} }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'Button.stories.mdx'),
      'import { Meta } from "@storybook/blocks";\n<Meta title="Button" />\n',
    );

    const discovery = discoverProject(projectRoot);

    expect(discovery.surfaces.evidenceAdapters.storybook.status).toBe('available');
    expect(discovery.surfaces.axes.surfaceAuthority.status).toBe('unresolved');
    expect(discovery.surfaces.status).toBe('unsupported');
  });

  it('does not relabel visual-only artifacts as runtime evidence', () => {
    writeFileSync(join(projectRoot, 'package.json'), JSON.stringify({ dependencies: {} }));
    mkdirSync(join(projectRoot, '.decantr', 'evidence', 'visual'), { recursive: true });
    writeFileSync(join(projectRoot, '.decantr', 'evidence', 'visual', 'Button.png'), 'fixture');

    const adapters = discoverProject(projectRoot).surfaces.evidenceAdapters;

    expect(adapters.visual.status).toBe('available');
    expect(adapters.runtime.status).toBe('absent');
  });

  it('excludes example, fixture, generated, and build-output files from source evidence', () => {
    writeFileSync(join(projectRoot, 'package.json'), JSON.stringify({ dependencies: {} }));
    mkdirSync(join(projectRoot, 'examples'), { recursive: true });
    mkdirSync(join(projectRoot, 'fixtures'), { recursive: true });
    mkdirSync(join(projectRoot, 'dist', 'tokens'), { recursive: true });
    mkdirSync(join(projectRoot, 'src', 'design-tokens'), { recursive: true });
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(join(projectRoot, 'examples', 'Demo.stories.tsx'), 'export default {};\n');
    writeFileSync(join(projectRoot, 'examples', 'Demo.figma.tsx'), 'export const Demo = true;\n');
    writeFileSync(join(projectRoot, 'fixtures', 'Demo.test.tsx'), 'test("demo", () => {});\n');
    writeFileSync(
      join(projectRoot, 'dist', 'tokens', 'tokens.json'),
      JSON.stringify({ color: { $value: '#fff' } }),
    );
    writeFileSync(join(projectRoot, 'src', 'Button.figma.tsx'), 'export const Button = true;\n');
    writeFileSync(
      join(projectRoot, 'src', 'design-tokens', 'theme.yaml'),
      'color:\n  accent:\n    $type: color\n    $value: "#06f"\n',
    );

    const adapters = discoverProject(projectRoot).surfaces.evidenceAdapters;

    expect(adapters.storybook.status).toBe('absent');
    expect(adapters.figmaCodeConnect.files.map((entry) => entry.file)).toEqual([
      'src/Button.figma.tsx',
    ]);
    expect(adapters.projectTests.status).toBe('absent');
    expect(adapters.designTokens.files.map((entry) => entry.file)).toEqual([
      'src/design-tokens/theme.yaml',
    ]);
  });

  it('projects the closed adapter shape into scan-report v2', async () => {
    writeFileSync(join(projectRoot, 'index.html'), '<!doctype html><main>Example</main>\n');
    writeFileSync(join(projectRoot, 'styles.css'), ':root { --accent: #06f; }\n');

    const report = await scanProject(projectRoot);

    expect(report.discovery.uiSurfaces.evidenceAdapters).toMatchObject({
      storybook: { kind: 'storybook', status: 'absent' },
      figmaCodeConnect: { kind: 'figma-code-connect', status: 'absent' },
      designTokens: { kind: 'design-tokens', status: 'absent' },
      projectTests: { kind: 'project-tests', status: 'absent' },
      runtime: { kind: 'runtime', status: 'absent' },
      visual: { kind: 'visual', status: 'absent' },
      accessibility: { kind: 'accessibility', status: 'absent' },
    });
  });
});
