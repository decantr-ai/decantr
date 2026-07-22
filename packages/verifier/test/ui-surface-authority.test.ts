import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  classifyProjectSourceScope,
  discoverProject,
  evaluateDiscoveryReadiness,
  isProductionAuthorityPath,
} from '../src/index.js';

describe('UI surface authority', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'decantr-ui-authority-'));
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('never promotes Cypress support navigation to production route authority', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: {
          react: '^19.0.0',
          'react-router-dom': '^7.0.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    mkdirSync(join(projectRoot, 'cypress', 'support'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      [
        'import { Route, Routes } from "react-router-dom";',
        'export function App() {',
        '  return <Routes><Route path="/settings" element={<main />} /></Routes>;',
        '}',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'cypress', 'support', 'component.tsx'),
      [
        'import { Route, Routes } from "react-router-dom";',
        'export const Fixture = () => <Routes><Route path="/fixture-admin" element={<div />} /></Routes>;',
      ].join('\n'),
    );

    const discovery = discoverProject(projectRoot);

    expect(discovery.routes.routeSignals.map((signal) => signal.path)).toContain('/settings');
    expect(discovery.routes.routeSignals.map((signal) => signal.path)).not.toContain(
      '/fixture-admin',
    );
    expect(discovery.routes.authorityFiles).not.toContain('cypress/support/component.tsx');
  });

  it('represents component, story, overlay, and package surfaces without inventing routes', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ name: '@example/ui', dependencies: { react: '^19.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'src', 'components'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Dialog.tsx'),
      'export function Dialog() { return <dialog />; }\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Button.tsx'),
      'export function Button() { return <button />; }\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Button.stories.tsx'),
      'export default { title: "Button" };\n',
    );
    writeFileSync(join(projectRoot, 'src', 'theme.css'), ':root { --surface: #fff; }\n');

    const discovery = discoverProject(projectRoot);
    const readiness = evaluateDiscoveryReadiness(discovery);

    expect(discovery.surfaces.primaryMode).toBe('component-library');
    expect(discovery.surfaces.counts).toMatchObject({
      route: 0,
      component: 2,
      story: 1,
      overlay: 1,
      package: 1,
    });
    expect(discovery.surfaces.status).toBe('limited');
    expect(readiness.routeScopedContext).toBe('not_proven');
    expect(readiness.status).toBe('limited');
  });

  it('does not let route signals override unresolved styling authority', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: {
          react: '^19.0.0',
          'react-router-dom': '^7.0.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      'import { Route } from "react-router-dom"; export const App = () => <Route path="/" element={<main />} />;\n',
    );

    const discovery = discoverProject(projectRoot);

    expect(discovery.routes.authority).toBe('inferred');
    expect(discovery.surfaces.axes.stylingAuthority.status).toBe('unresolved');
    expect(discovery.surfaces.status).toBe('blocked');
    expect(discovery.confidence.score).toBeLessThanOrEqual(44);
  });

  it('proves PrimeVue styling only when runtime configuration is present', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { vue: '^3.5.0', primevue: '^4.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'main.js'),
      "import PrimeVue from 'primevue/config'; void PrimeVue;\n",
    );

    const discovery = discoverProject(projectRoot);

    expect(discovery.styling.approach).toBe('primevue');
    expect(discovery.styling.configFile).toBe('src/main.js');
    expect(discovery.styling.confidence).toBe('high');
    expect(discovery.surfaces.axes.stylingAuthority.status).toBe('proven');
  });

  it('uses a production workspace-style import as Ant Design Vue authority', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: {
          vue: '^3.5.0',
          'ant-design-vue': '^4.0.0',
          '@vben/styles': 'workspace:*',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'bootstrap.ts'),
      "import '@vben/styles';\nimport 'ant-design-vue';\n",
    );

    const discovery = discoverProject(projectRoot);

    expect(discovery.styling.approach).toBe('ant-design-vue-workspace-styles');
    expect(discovery.styling.configFile).toBe('src/bootstrap.ts');
    expect(discovery.styling.confidence).toBe('high');
  });

  it('uses Code Connect and stories to identify a design-system package over a demo entry', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        name: '@example/design-system',
        dependencies: { react: '^19.0.0', '@figma/code-connect': '^1.0.0' },
      }),
    );
    writeFileSync(join(projectRoot, 'index.html'), '<main id="root"></main>\n');
    mkdirSync(join(projectRoot, 'src', 'components'), { recursive: true });
    for (let index = 0; index < 20; index += 1) {
      writeFileSync(
        join(projectRoot, 'src', 'components', `Component${index}.tsx`),
        `export function Component${index}() { return <div />; }\n`,
      );
    }
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Component0.stories.tsx'),
      'export default { title: "Component" };\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Component0.figma.tsx'),
      'export const connected = true;\n',
    );
    writeFileSync(join(projectRoot, 'src', 'theme.css'), ':root { --surface: #fff; }\n');

    const discovery = discoverProject(projectRoot);

    expect(discovery.routes.taskableRouteCount).toBe(1);
    expect(discovery.surfaces.evidenceAdapters.figmaCodeConnect.status).toBe('available');
    expect(discovery.surfaces.primaryMode).toBe('design-system');
  });

  it('proves Naive UI, UnoCSS, and SCSS as combined Vue styling authority', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: { vue: '^3.5.0', 'naive-ui': '^2.0.0' },
        devDependencies: { unocss: '^66.0.0', sass: '^1.0.0' },
      }),
    );
    writeFileSync(join(projectRoot, 'uno.config.ts'), 'export default {};\n');
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'App.vue'),
      [
        '<script setup lang="ts">',
        'import { NConfigProvider } from "naive-ui";',
        'import "uno.css";',
        '</script>',
        '<template><NConfigProvider><main /></NConfigProvider></template>',
        '<style lang="scss">main { color: #111; }</style>',
      ].join('\n'),
    );
    writeFileSync(join(projectRoot, 'src', 'theme.scss'), '$surface: #fff;\n');

    const discovery = discoverProject(projectRoot);

    expect(discovery.styling.approach).toBe('naive-ui-unocss-scss');
    expect(discovery.styling.configFile).toBe('uno.config.ts');
    expect(discovery.styling.confidence).toBe('high');
    expect(discovery.styling.evidence).toEqual(
      expect.arrayContaining([
        'Naive UI theme provider found in src/App.vue',
        'UnoCSS runtime stylesheet import found in src/App.vue',
      ]),
    );
  });

  it('uses a production entry stylesheet import as CSS authority', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { 'solid-js': '^1.9.0' } }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'app.tsx'),
      'import "./app.css"; export default () => <main />;\n',
    );
    writeFileSync(join(projectRoot, 'src', 'app.css'), 'main { color: #123456; }\n');

    const discovery = discoverProject(projectRoot);

    expect(discovery.styling.approach).toBe('css');
    expect(discovery.styling.configFile).toBe('src/app.css');
    expect(discovery.styling.confidence).toBe('high');
    expect(discovery.styling.evidence).toContain(
      'Production source src/app.tsx imports src/app.css',
    );
  });
});

describe('project source scopes', () => {
  it.each([
    ['src/App.tsx', 'production', true],
    ['packages/ui/src/Button.tsx', 'package', true],
    ['src/Button.stories.tsx', 'story', false],
    ['cypress/support/component.tsx', 'test', false],
    ['examples/dashboard/App.tsx', 'example', false],
    ['src/routes.gen.ts', 'generated', false],
    ['dist/index.js', 'build-output', false],
    ['scripts/check-routes.ts', 'supporting', false],
    ['src/Button.figma.tsx', 'supporting', false],
  ] as const)('classifies %s as %s', (path, expectedScope, productionAuthority) => {
    expect(classifyProjectSourceScope(path)).toBe(expectedScope);
    expect(isProductionAuthorityPath(path)).toBe(productionAuthority);
  });
});
