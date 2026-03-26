import { describe, it, expect } from 'vitest';
import { validateReactOutput } from '../src/quality-rules.js';
import { emitApp } from '../src/emit-app.js';
import { emitPage } from '../src/emit-page.js';
import { emitNotFound } from '../src/emit-shared.js';
import type { GeneratedFile, IRAppNode, IRShellNode, IRStoreNode, IRPageNode, IRPatternNode, IRWiring } from '@decantr/generator-core';

// ─── Helpers ─────────────────────────────────────────────────

function makeFile(path: string, content: string): GeneratedFile {
  return { path, content };
}

function makeApp(overrides?: Partial<IRAppNode>): IRAppNode {
  const shell: IRShellNode = {
    type: 'shell', id: 'shell', children: [],
    config: {
      type: 'sidebar-main', brand: 'TestApp',
      nav: [
        { href: '/', icon: 'home', label: 'Home' },
        { href: '/settings', icon: 'settings', label: 'Settings' },
      ],
      inset: false, recipe: null,
    },
  };
  const store: IRStoreNode = { type: 'store', id: 'store', children: [], pageSignals: [] };
  return {
    type: 'app', id: 'app', children: [],
    theme: { style: 'auradecantism', mode: 'dark', shape: null, recipe: 'auradecantism', isAddon: false },
    routes: [{ path: '/', pageId: 'overview' }, { path: '/settings', pageId: 'settings' }],
    routing: 'hash', shell, store, features: [], ...overrides,
  };
}

function makePatternNode(id: string, overrides?: Partial<IRPatternNode>): IRPatternNode {
  return {
    type: 'pattern', id, children: [],
    pattern: {
      patternId: id, preset: 'default', alias: id,
      layout: 'column', contained: true, standalone: false,
      code: null, components: ['Card'],
    },
    card: { mode: 'always', headerLabel: id },
    visualEffects: null, wireProps: null, spatial: { gap: '4' },
    ...overrides,
  };
}

function makePage(id: string, children: any[], wiring?: IRWiring | null): IRPageNode {
  return {
    type: 'page', id, children, pageId: id,
    surface: '_flex _col _gap4 _p4', wiring: wiring || null,
  };
}

// ─── Rule Tests ──────────────────────────────────────────────

describe('React Quality Rules', () => {

  // ── CRITICAL: no-barrel-imports ────────────────────────────

  describe('no-barrel-imports', () => {
    it('flags import from lucide-react barrel', () => {
      const file = makeFile('src/App.tsx', `import { Home } from 'lucide-react';`);
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'no-barrel-imports')).toBe(true);
    });

    it('allows import from lucide-react deep path', () => {
      const file = makeFile('src/App.tsx', `import { Home } from 'lucide-react/dist/esm/icons/home';`);
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'no-barrel-imports')).toBe(false);
    });

    it('flags import from @/components/ui barrel', () => {
      const file = makeFile('src/pages/foo.tsx', `import { Button } from '@/components/ui';`);
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'no-barrel-imports')).toBe(true);
    });

    it('allows import from @/components/ui/button', () => {
      const file = makeFile('src/pages/foo.tsx', `import { Button } from '@/components/ui/button';`);
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'no-barrel-imports')).toBe(false);
    });
  });

  // ── CRITICAL: no-inline-components ─────────────────────────

  describe('no-inline-components', () => {
    it('flags function component inside function component', () => {
      const file = makeFile('src/pages/test.tsx', [
        'function Outer() {',
        '  function Inner() {',
        '    return <div>inner</div>;',
        '  }',
        '  return <Inner />;',
        '}',
      ].join('\n'));
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'no-inline-components')).toBe(true);
    });

    it('flags arrow component inside function component', () => {
      const file = makeFile('src/pages/test.tsx', [
        'function Outer() {',
        '  const Inner = () => {',
        '    return <div>inner</div>;',
        '  };',
        '  return <Inner />;',
        '}',
      ].join('\n'));
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'no-inline-components')).toBe(true);
    });

    it('allows top-level component definitions', () => {
      const file = makeFile('src/pages/test.tsx', [
        'function First() {',
        '  return <div>first</div>;',
        '}',
        '',
        'function Second() {',
        '  return <First />;',
        '}',
      ].join('\n'));
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'no-inline-components')).toBe(false);
    });
  });

  // ── CRITICAL: use-lazy-imports ─────────────────────────────

  describe('use-lazy-imports', () => {
    it('flags direct page import in router file', () => {
      const file = makeFile('src/App.tsx', [
        `import OverviewPage from './pages/overview';`,
        '<Route path="/" element={<OverviewPage />} />',
      ].join('\n'));
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'use-lazy-imports')).toBe(true);
    });

    it('allows React.lazy() wrapped import', () => {
      const file = makeFile('src/App.tsx', [
        `const OverviewPage = React.lazy(() => import('./pages/overview.tsx'));`,
        '<Route path="/" element={<React.Suspense fallback={<div>Loading...</div>}><OverviewPage /></React.Suspense>} />',
      ].join('\n'));
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'use-lazy-imports')).toBe(false);
    });
  });

  // ── CRITICAL: use-suspense-boundaries ──────────────────────

  describe('use-suspense-boundaries', () => {
    it('flags lazy component without Suspense wrapper', () => {
      const file = makeFile('src/App.tsx', [
        `const Page = React.lazy(() => import('./pages/page.tsx'));`,
        '<Route path="/" element={<Page />} />',
      ].join('\n'));
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'use-suspense-boundaries')).toBe(true);
    });

    it('allows lazy component inside Suspense', () => {
      const file = makeFile('src/App.tsx', [
        `const Page = React.lazy(() => import('./pages/page.tsx'));`,
        '<Route path="/" element={<React.Suspense fallback={<div>Loading</div>}><Page /></React.Suspense>} />',
      ].join('\n'));
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'use-suspense-boundaries')).toBe(false);
    });
  });

  // ── HIGH: functional-setstate ──────────────────────────────

  describe('functional-setstate', () => {
    it('flags setState(count + 1) pattern', () => {
      const file = makeFile('src/pages/counter.tsx', [
        'function Counter() {',
        '  const [count, setCount] = useState(0);',
        '  return <button onClick={() => setCount(count + 1)}>+</button>;',
        '}',
      ].join('\n'));
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'functional-setstate')).toBe(true);
    });

    it('allows setState(prev => prev + 1) pattern', () => {
      const file = makeFile('src/pages/counter.tsx', [
        'function Counter() {',
        '  const [count, setCount] = useState(0);',
        '  return <button onClick={() => setCount(prev => prev + 1)}>+</button>;',
        '}',
      ].join('\n'));
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'functional-setstate')).toBe(false);
    });
  });

  // ── HIGH: no-effect-derived-state ──────────────────────────

  describe('no-effect-derived-state', () => {
    it('flags useEffect that only sets derived state', () => {
      const file = makeFile('src/pages/derived.tsx', [
        'function Derived() {',
        '  const [items, setItems] = useState([]);',
        '  const [count, setCount] = useState(0);',
        '  useEffect(() => { setCount(items.length); }, [items]);',
        '  return <div>{count}</div>;',
        '}',
      ].join('\n'));
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'no-effect-derived-state')).toBe(true);
    });

    it('allows useEffect with side effects (event listeners)', () => {
      const file = makeFile('src/App.tsx', [
        'function App() {',
        '  useEffect(() => {',
        '    const handler = (e: KeyboardEvent) => { console.log(e); };',
        '    document.addEventListener("keydown", handler);',
        '    return () => document.removeEventListener("keydown", handler);',
        '  }, []);',
        '  return <div />;',
        '}',
      ].join('\n'));
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'no-effect-derived-state')).toBe(false);
    });
  });

  // ── HIGH: hoist-default-props ──────────────────────────────

  describe('hoist-default-props', () => {
    it('flags default array in component params', () => {
      const file = makeFile('src/pages/list.tsx',
        `function List({ items = [] }) {\n  return <div />;\n}`,
      );
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'hoist-default-props')).toBe(true);
    });

    it('flags default object in component params', () => {
      const file = makeFile('src/pages/config.tsx',
        `function Config({ options = {} }) {\n  return <div />;\n}`,
      );
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'hoist-default-props')).toBe(true);
    });

    it('allows default primitive values', () => {
      const file = makeFile('src/pages/counter.tsx',
        `function Counter({ start = 0, label = 'Count' }) {\n  return <div />;\n}`,
      );
      const v = validateReactOutput([file]);
      expect(v.some(v => v.rule === 'hoist-default-props')).toBe(false);
    });
  });

  // ── Integration: generated output passes all rules ─────────

  describe('integration: generated output passes all rules', () => {
    it('emit-app sidebar output has zero violations', () => {
      const app = makeApp();
      const file = emitApp(app);
      const violations = validateReactOutput([file]);
      if (violations.length > 0) {
        console.log('emit-app violations:', violations);
      }
      expect(violations).toHaveLength(0);
    });

    it('emit-app top-nav output has zero violations', () => {
      const app = makeApp();
      app.shell.config.type = 'top-nav-main';
      const file = emitApp(app);
      const violations = validateReactOutput([file]);
      expect(violations).toHaveLength(0);
    });

    it('emit-app full-bleed output has zero violations', () => {
      const app = makeApp();
      app.shell.config.type = 'full-bleed';
      const file = emitApp(app);
      const violations = validateReactOutput([file]);
      expect(violations).toHaveLength(0);
    });

    it('emit-page output has zero violations', () => {
      const pattern = makePatternNode('kpi-grid', { card: null });
      const page = makePage('overview', [pattern]);
      const file = emitPage(page);
      const violations = validateReactOutput([file]);
      if (violations.length > 0) {
        console.log('emit-page violations:', violations);
      }
      expect(violations).toHaveLength(0);
    });

    it('emit-page with wiring has zero violations', () => {
      const wiring: IRWiring = {
        signals: [
          { name: 'search', setter: 'setSearch', init: "''", hookType: 'search' },
        ],
        props: {},
        hooks: ['search'],
        hookProps: {
          'data-table': { search: 'search' },
        },
      };
      const pattern = makePatternNode('data-table', {
        card: null,
        wireProps: { search: 'search' },
      });
      const page = makePage('overview', [pattern], wiring);
      const file = emitPage(page);
      const violations = validateReactOutput([file]);
      expect(violations).toHaveLength(0);
    });

    it('emit-page with legacy wireProps uses no any type', () => {
      const pattern = makePatternNode('my-widget', {
        card: null,
        wireProps: { data: 'fetchedData', onAction: 'handleAction' },
      });
      const page = makePage('dashboard', [pattern]);
      const file = emitPage(page);
      expect(file.content).not.toContain(': any');
      expect(file.content).toContain(': unknown');
    });

    it('emitNotFound output has zero violations', () => {
      const file = emitNotFound();
      const violations = validateReactOutput([file]);
      if (violations.length > 0) {
        console.log('emitNotFound violations:', violations);
      }
      expect(violations).toHaveLength(0);
    });
  });
});
