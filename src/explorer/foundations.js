import { h, cond, list, text } from 'decantr/core';
import { createSignal, createEffect, createMemo, createStore, batch,
         createRoot, on, createHistory, createContext, createSelector,
         untrack } from 'decantr/state';
import { withMiddleware, validationMiddleware, undoMiddleware } from '../state/middleware.js';
import { createEntityStore } from 'decantr/data';
import { createForm, validators } from 'decantr/form';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Button, Input, Badge, Chip, Separator, CodeBlock } from 'decantr/components';
import { injectExplorerCSS } from './styles.js';
injectExplorerCSS();

const { div, h2, h3, h4, p, span, section, label, code, pre } = tags;

// ─── Shared section structure ───────────────────────────────
// Follows component-showcase pattern layout: _flex _col _gap6

function DemoSection(title, description, ...children) {
  return div({ class: css('_flex _col _gap4') },
    Separator({}),
    div({ class: css('_flex _col _gap1') },
      h3({ class: css('_heading5') }, title),
      description ? p({ class: css('_body _fgmutedfg') }, description) : null
    ),
    ...children
  );
}

function DemoRow(...children) {
  return div({ class: css('_flex _gap3 _wrap _aic') }, ...children);
}

function LogPanel() {
  const el = div({ class: css('_fontmono _caption _fgmutedfg _p3 _bgmuted/10 _radius _oauto _mh[160px] _flex _col _gap1') });
  const entries = [];
  return {
    el,
    log(msg) {
      entries.push(msg);
      if (entries.length > 50) entries.shift();
      el.textContent = '';
      for (let i = entries.length - 1; i >= 0; i--) {
        el.appendChild(div({}, entries[i]));
      }
    },
    clear() {
      entries.length = 0;
      el.textContent = '';
    }
  };
}

// ─── Core Demos ─────────────────────────────────────────────

function CoreDemo() {
  return div({ class: css('_flex _col _gap6') },
    DemoSection(
      'h() — Element Creation',
      'Creates DOM elements. Tags proxy provides the same capability with terser syntax.',
      DemoRow(
        Button({ variant: 'primary' }, 'Click me'),
        span({ class: css('_body _fgmutedfg') }, 'Created with Button({variant:\'primary\'}, \'Click me\')')
      ),
      CodeBlock({ language: 'javascript' },
        `import { h } from 'decantr/core';\nimport { tags } from 'decantr/tags';\n\n// Using h()\nconst el = h('div', { class: 'my-class' }, 'Hello');\n\n// Using tags proxy (~25% fewer tokens)\nconst { div, span } = tags;\nconst el2 = div({ class: 'my-class' }, 'Hello');`
      )
    ),
    DemoSection(
      'cond() — Conditional Rendering',
      'Reactively toggles between two DOM branches.',
      CondDemo(),
      CodeBlock({ language: 'javascript' },
        `const [show, setShow] = createSignal(true);\nconst el = cond(show,\n  () => Badge({ variant: 'success' }, 'Visible'),\n  () => Badge({ variant: 'error' }, 'Hidden')\n);`
      )
    ),
    DemoSection(
      'list() — Keyed List Rendering',
      'Renders a reactive list with keyed reconciliation.',
      ListDemo(),
      CodeBlock({ language: 'javascript' },
        `const [items, setItems] = createSignal(['Alpha', 'Beta']);\nconst el = list(items, item => item, item =>\n  Chip({ variant: 'primary', label: item })\n);`
      )
    )
  );
}

function CondDemo() {
  const [show, setShow] = createSignal(true);
  const toggle = Button({ variant: 'outline', size: 'sm', onclick: () => setShow(!show()) }, 'Toggle');
  const conditional = cond(show,
    () => Badge({ variant: 'success' }, 'Visible'),
    () => Badge({ variant: 'error' }, 'Hidden')
  );
  return DemoRow(toggle, span({ class: css('_body') }, conditional));
}

function ListDemo() {
  const [items, setItems] = createSignal(['Alpha', 'Beta', 'Gamma']);
  const addBtn = Button({ variant: 'outline', size: 'sm', onclick: () => {
    setItems([...items(), `Item-${items().length + 1}`]);
  }}, 'Add Item');
  const rendered = list(items, (item) => item, (item) =>
    Chip({ variant: 'primary', label: item })
  );
  return div({ class: css('_flex _col _gap4') },
    addBtn,
    div({ class: css('_flex _gap2 _wrap') }, rendered)
  );
}

// ─── State Demos ────────────────────────────────────────────

function StateDemo() {
  return div({ class: css('_flex _col _gap6') },
    DemoSection(
      'createSignal — Reactive Primitive',
      'Returns [getter, setter]. Reading the getter inside createEffect auto-tracks.',
      SignalDemo(),
      CodeBlock({ language: 'javascript' },
        `const [count, setCount] = createSignal(0);\ncreateEffect(() => {\n  console.log('Count:', count()); // auto-tracked\n});`
      )
    ),
    DemoSection(
      'createMemo — Cached Derivation',
      'Derives a cached value from other signals. Recomputes only when dependencies change.',
      MemoDemo(),
      CodeBlock({ language: 'javascript' },
        `const sum = createMemo(() => a() + b());\nconst product = createMemo(() => a() * b());`
      )
    ),
    DemoSection(
      'createStore — Reactive Object',
      'Returns a Proxy that tracks per-property reads/writes. Direct assignment triggers effects.',
      StoreDemo(),
      CodeBlock({ language: 'javascript' },
        `const store = createStore({ name: 'Decantr', stars: 0 });\nstore.stars = store.stars + 1; // triggers effects`
      )
    ),
    DemoSection(
      'batch() — Batched Updates',
      'Groups multiple signal writes into a single flush. Effects run once instead of per-write.',
      BatchDemo(),
      CodeBlock({ language: 'javascript' },
        `const [x, setX] = createSignal(0);\nconst [y, setY] = createSignal(0);\n\n// Without batch: effect fires twice\nsetX(1); setY(1);\n\n// With batch: effect fires once\nbatch(() => { setX(2); setY(2); });`
      )
    ),
    DemoSection(
      'on() — Explicit Dependency Tracking',
      'Declares which signals to track explicitly. The effect body runs inside untrack().',
      OnDemo(),
      CodeBlock({ language: 'javascript' },
        `const [search, setSearch] = createSignal('');\nconst [mode, setMode] = createSignal('all');\n\n// Only fires when search changes, not mode\non(search, (value, prev) => {\n  console.log('Search:', value, 'Mode:', mode());\n});`
      )
    ),
    DemoSection(
      'createHistory — Undo/Redo',
      'Wraps a signal with an undo/redo stack. Time-travel for any reactive value.',
      HistoryDemo(),
      CodeBlock({ language: 'javascript' },
        `const signal = createSignal('hello');\nconst { undo, redo, canUndo, canRedo } = createHistory(signal);\n\nsignal[1]('world'); // pushes to history\nundo();             // back to 'hello'\nredo();             // forward to 'world'`
      )
    ),
    DemoSection(
      'createRoot — Ownership & Cleanup',
      'Creates an isolated reactive scope. Disposing it stops all effects inside.',
      RootDemo(),
      CodeBlock({ language: 'javascript' },
        `createRoot(dispose => {\n  const [count, setCount] = createSignal(0);\n  createEffect(() => console.log(count()));\n  // Later: dispose() stops the effect\n});`
      )
    ),
    DemoSection(
      'createSelector — Efficient Selection',
      'Only notifies the previous and current matching items on change — O(1) instead of O(n).',
      SelectorDemo(),
      CodeBlock({ language: 'javascript' },
        `const [selected, setSelected] = createSignal('a');\nconst isSelected = createSelector(selected);\n\n// Only 'a' and 'b' re-render when switching a→b\nisSelected('a'); // false (was true)\nisSelected('b'); // true  (was false)\nisSelected('c'); // not notified at all`
      )
    ),
    DemoSection(
      'createContext — Provider/Consumer',
      'Dependency injection via context. Nested providers override for their subtree.',
      ContextDemo(),
      CodeBlock({ language: 'javascript' },
        `const ThemeCtx = createContext('light');\n\n// Provide\nconst restore = ThemeCtx.Provider('dark');\n\n// Consume (reads nearest provider)\nThemeCtx.consume(); // 'dark'\n\nrestore(); // back to 'light'`
      )
    ),
    DemoSection(
      'createEffect — Dependency Cleanup',
      'Effects re-track on every run. Switching which signal is read drops stale subscriptions.',
      EffectCleanupDemo(),
      CodeBlock({ language: 'javascript' },
        `const [useA, setUseA] = createSignal(true);\nconst [a, setA] = createSignal('A');\nconst [b, setB] = createSignal('B');\n\ncreateEffect(() => {\n  // Only subscribes to whichever branch runs\n  console.log(useA() ? a() : b());\n});\n// After setUseA(false): changing a() won't fire`
      )
    )
  );
}

function SignalDemo() {
  const [count, setCount] = createSignal(0);
  const [effectRuns, setEffectRuns] = createSignal(0);
  const inc = Button({ variant: 'primary', size: 'sm', onclick: () => setCount(count() + 1) }, '+1');
  const dec = Button({ variant: 'outline', size: 'sm', onclick: () => setCount(count() - 1) }, '-1');
  const display = span({ class: css('_heading3') });
  const runsDisplay = span({});

  createEffect(() => {
    display.textContent = String(count());
    setEffectRuns(r => r + 1);
  });
  createEffect(() => { runsDisplay.textContent = String(effectRuns()); });

  return div({ class: css('_flex _col _gap4') },
    DemoRow(dec, display, inc),
    DemoRow(
      span({ class: css('_caption _fgmutedfg') }, 'Effects fired:'),
      Badge({ variant: 'accent', count: effectRuns })
    )
  );
}

function MemoDemo() {
  const [a, setA] = createSignal(3);
  const [b, setB] = createSignal(5);
  const sum = createMemo(() => a() + b());
  const product = createMemo(() => a() * b());

  const aDisplay = span({});
  const bDisplay = span({});

  createEffect(() => { aDisplay.textContent = String(a()); });
  createEffect(() => { bDisplay.textContent = String(b()); });

  return div({ class: css('_flex _col _gap4') },
    DemoRow(
      Button({ size: 'sm', variant: 'outline', onclick: () => setA(a() + 1) }, 'a++'),
      span({}, 'a='), aDisplay,
      Button({ size: 'sm', variant: 'outline', onclick: () => setB(b() + 1) }, 'b++'),
      span({}, 'b='), bDisplay
    ),
    DemoRow(
      span({ class: css('_flex _gap1 _aic') }, 'sum:', Badge({ variant: 'primary', count: sum })),
      span({ class: css('_flex _gap1 _aic') }, 'product:', Badge({ variant: 'accent', count: product }))
    )
  );
}

function StoreDemo() {
  const store = createStore({ name: 'Decantr', version: '0.5.0', stars: 0 });
  const nameEl = span({});
  const versionEl = span({});
  const starsEl = span({});

  createEffect(() => { nameEl.textContent = store.name; });
  createEffect(() => { versionEl.textContent = store.version; });
  createEffect(() => { starsEl.textContent = String(store.stars); });

  return div({ class: css('_flex _col _gap4') },
    DemoRow(
      span({ class: css('_fgmutedfg') }, 'name:'), nameEl,
      Separator({ vertical: true }),
      span({ class: css('_fgmutedfg') }, 'version:'), versionEl,
      Separator({ vertical: true }),
      span({ class: css('_fgmutedfg') }, 'stars:'), starsEl
    ),
    DemoRow(
      Button({ size: 'sm', variant: 'outline', onclick: () => { store.stars = store.stars + 1; } }, 'Star'),
      Button({ size: 'sm', variant: 'outline', onclick: () => { store.name = 'Decantr Pro'; } }, 'Rename')
    )
  );
}

function BatchDemo() {
  const [x, setX] = createSignal(0);
  const [y, setY] = createSignal(0);
  const [effectRuns, setEffectRuns] = createSignal(0);
  const log = LogPanel();

  createEffect(() => {
    const xv = x();
    const yv = y();
    setEffectRuns(r => r + 1);
    log.log(`Effect fired — x=${xv}, y=${yv}`);
  });

  return div({ class: css('_flex _col _gap4') },
    DemoRow(
      span({ class: css('_fgmutedfg _caption') }, 'x:'), Badge({ variant: 'primary', count: x }),
      span({ class: css('_fgmutedfg _caption') }, 'y:'), Badge({ variant: 'primary', count: y }),
      Separator({ vertical: true }),
      span({ class: css('_caption _fgmutedfg') }, 'Effect runs:'),
      Badge({ variant: 'accent', count: effectRuns })
    ),
    DemoRow(
      Button({ size: 'sm', variant: 'outline', onclick: () => {
        setX(x() + 1);
        setY(y() + 1);
      }}, 'Update Both (no batch)'),
      Button({ size: 'sm', variant: 'primary', onclick: () => {
        batch(() => { setX(x() + 1); setY(y() + 1); });
      }}, 'Update Both (batched)')
    ),
    div({ class: css('_flex _col _gap2') },
      span({ class: css('_caption _fgmutedfg') }, 'Effect log (newest first):'),
      log.el
    )
  );
}

function OnDemo() {
  const [search, setSearch] = createSignal('');
  const [filterMode, setFilterMode] = createSignal('all');
  const log = LogPanel();

  on(search, (value, prev) => {
    const mode = filterMode();
    log.log(`search changed: "${prev}" → "${value}" (mode: ${mode})`);
  }, { defer: true });

  const modeDisplay = span({ class: css('_fontmono') });
  createEffect(() => { modeDisplay.textContent = filterMode(); });

  return div({ class: css('_flex _col _gap4') },
    DemoRow(
      Input({
        placeholder: 'Type to search...',
        size: 'sm',
        oninput: (e) => setSearch(e.target.value)
      }),
      Button({ size: 'sm', variant: 'outline', onclick: () => {
        setFilterMode(filterMode() === 'all' ? 'active' : 'all');
      }}, 'Toggle Mode'),
      span({ class: css('_caption _fgmutedfg') }, 'Mode:'), modeDisplay
    ),
    div({ class: css('_flex _col _gap2') },
      span({ class: css('_caption _fgmutedfg') }, 'on(search, ...) log — changing mode does NOT fire:'),
      log.el
    ),
    DemoRow(
      Button({ size: 'sm', variant: 'outline', onclick: () => {
        setFilterMode(filterMode() === 'all' ? 'active' : 'all');
        log.log(`(manually toggled mode to "${filterMode()}" — no effect fired)`);
      }}, 'Toggle Mode + Log Proof')
    )
  );
}

function HistoryDemo() {
  const signal = createSignal('');
  const [getText, setText] = signal;
  const { undo, redo, canUndo, canRedo, clear } = createHistory(signal);

  const display = span({ class: css('_heading3 _fontmono') });
  const undoBtn = Button({ variant: 'outline', size: 'sm' }, 'Undo');
  const redoBtn = Button({ variant: 'outline', size: 'sm' }, 'Redo');

  createEffect(() => { display.textContent = getText() || '(empty)'; });
  createEffect(() => { undoBtn.disabled = !canUndo(); });
  createEffect(() => { redoBtn.disabled = !canRedo(); });

  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);

  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_p4 _bgmuted/10 _radius _b1 _bcborder _flex _col _gap3') },
      span({ class: css('_caption _fgmutedfg') }, 'Current value:'),
      display
    ),
    DemoRow(
      Input({
        placeholder: 'Type something...',
        size: 'sm',
        oninput: (e) => setText(e.target.value)
      })
    ),
    DemoRow(
      undoBtn,
      redoBtn,
      Button({ variant: 'outline', size: 'sm', onclick: clear }, 'Clear History'),
      Separator({ vertical: true }),
      span({ class: css('_caption _fgmutedfg') }, 'Can undo:'),
      Badge({ variant: 'primary', count: () => canUndo() ? 'Yes' : 'No' }),
      span({ class: css('_caption _fgmutedfg') }, 'Can redo:'),
      Badge({ variant: 'accent', count: () => canRedo() ? 'Yes' : 'No' })
    )
  );
}

function RootDemo() {
  const [activeScopes, setActiveScopes] = createSignal(0);
  const container = div({ class: css('_flex _col _gap3') });
  const disposers = [];

  function spawnScope() {
    const id = Date.now();
    let scopeDispose;

    createRoot(dispose => {
      scopeDispose = dispose;
      const [count, setCount] = createSignal(0);
      const countDisplay = span({ class: css('_heading5 _fontmono') });
      const statusEl = span({ class: css('_caption') });

      createEffect(() => { countDisplay.textContent = String(count()); });
      createEffect(() => { statusEl.textContent = 'active'; });

      const interval = setInterval(() => setCount(c => c + 1), 500);

      const row = div({ class: css('_flex _gap3 _aic _p3 _bgmuted/10 _radius _b1 _bcborder') },
        Chip({ variant: 'primary', label: `Scope #${disposers.length + 1}` }),
        span({ class: css('_caption _fgmutedfg') }, 'Counter:'),
        countDisplay,
        Badge({ variant: 'success' }, statusEl),
        Button({ size: 'sm', variant: 'outline', onclick: () => {
          clearInterval(interval);
          scopeDispose();
          statusEl.textContent = 'disposed';
          row.style.opacity = '0.4';
          setActiveScopes(n => n - 1);
        }}, 'Dispose')
      );

      container.appendChild(row);
      disposers.push({ dispose: scopeDispose, interval, row });
    });

    setActiveScopes(n => n + 1);
  }

  return div({ class: css('_flex _col _gap4') },
    DemoRow(
      Button({ variant: 'primary', size: 'sm', onclick: spawnScope }, 'Create Scope'),
      Separator({ vertical: true }),
      span({ class: css('_caption _fgmutedfg') }, 'Active scopes:'),
      Badge({ variant: 'accent', count: activeScopes })
    ),
    container
  );
}

function SelectorDemo() {
  const items = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
  const [selected, setSelected] = createSignal('Alpha');
  const isSelected = createSelector(selected);

  const renderCounts = {};
  items.forEach(item => { renderCounts[item] = { count: 0 }; });

  const itemEls = items.map(item => {
    const countEl = span({ class: css('_caption _fontmono _fgmutedfg') });
    const itemEl = div({ class: css('_flex _gap2 _aic _p3 _radius _pointer') });

    createEffect(() => {
      const sel = isSelected(item);
      renderCounts[item].count++;
      countEl.textContent = `renders: ${renderCounts[item].count}`;
      itemEl.className = css(sel
        ? '_flex _gap2 _aic _p3 _radius _pointer _bgprimary _fgprimaryon'
        : '_flex _gap2 _aic _p3 _radius _pointer _bgmuted/10 _fgfg'
      );
      itemEl.textContent = '';
      itemEl.appendChild(span({ class: css('_body _fw600') }, item));
      itemEl.appendChild(countEl);
    });

    itemEl.addEventListener('click', () => setSelected(item));
    return itemEl;
  });

  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _gap2 _wrap') }, ...itemEls),
    DemoRow(
      span({ class: css('_caption _fgmutedfg') }, 'Selected:'),
      Badge({ variant: 'primary', count: selected }),
      span({ class: css('_caption _fgmutedfg') }, '— click an item. Only prev+current re-render.')
    )
  );
}

function ContextDemo() {
  const ThemeCtx = createContext('light');
  const [activeTheme, setActiveTheme] = createSignal('(none)');

  function readAndDisplay(label) {
    const value = ThemeCtx.consume();
    const el = div({ class: css('_p3 _radius _b1 _bcborder _flex _gap2 _aic') },
      span({ class: css('_caption _fgmutedfg') }, label + ':'),
      Chip({ variant: value === 'dark' ? 'accent' : 'primary', label: value })
    );
    if (value === 'dark') {
      el.style.background = 'var(--d-surface-2)';
    } else {
      el.style.background = 'var(--d-surface-0)';
    }
    return el;
  }

  const outerBox = div({ class: css('_flex _col _gap3 _p4 _bgmuted/10 _radius _b1 _bcborder') });
  const innerBox = div({ class: css('_flex _col _gap3 _p4 _radius _b1 _bcborder') });

  function rebuild() {
    outerBox.textContent = '';
    innerBox.textContent = '';

    // Outer: provide 'light'
    const restoreOuter = ThemeCtx.Provider('light');
    outerBox.appendChild(span({ class: css('_caption _fgmutedfg _fw600') }, 'Outer Provider: light'));
    outerBox.appendChild(readAndDisplay('consume()'));

    // Inner: provide 'dark'
    const restoreInner = ThemeCtx.Provider('dark');
    innerBox.appendChild(span({ class: css('_caption _fgmutedfg _fw600') }, 'Inner Provider: dark'));
    innerBox.appendChild(readAndDisplay('consume()'));
    innerBox.style.background = 'var(--d-surface-2)';
    restoreInner();

    outerBox.appendChild(innerBox);
    outerBox.appendChild(readAndDisplay('After inner (restored)'));
    restoreOuter();

    setActiveTheme('demo rendered');
  }

  rebuild();

  return div({ class: css('_flex _col _gap4') },
    outerBox,
    DemoRow(
      Button({ size: 'sm', variant: 'outline', onclick: rebuild }, 'Re-render Demo'),
      span({ class: css('_caption _fgmutedfg') }, 'Nested providers override for their subtree only.')
    )
  );
}

function EffectCleanupDemo() {
  const [useA, setUseA] = createSignal(true);
  const [a, setA] = createSignal('Alpha');
  const [b, setB] = createSignal('Beta');
  const log = LogPanel();

  createEffect(() => {
    const reading = useA() ? a() : b();
    const source = useA() ? 'A' : 'B';
    log.log(`Effect ran — reading ${source}: "${reading}"`);
  });

  const branchDisplay = span({ class: css('_fontmono _fw600') });
  createEffect(() => { branchDisplay.textContent = useA() ? 'Signal A' : 'Signal B'; });

  return div({ class: css('_flex _col _gap4') },
    DemoRow(
      span({ class: css('_caption _fgmutedfg') }, 'Reading:'), branchDisplay,
      Separator({ vertical: true }),
      Button({ size: 'sm', variant: 'primary', onclick: () => setUseA(!useA()) }, 'Toggle Branch')
    ),
    DemoRow(
      Button({ size: 'sm', variant: 'outline', onclick: () => setA(a() + '+') }, 'Mutate A'),
      Button({ size: 'sm', variant: 'outline', onclick: () => setB(b() + '+') }, 'Mutate B'),
      span({ class: css('_caption _fgmutedfg') }, 'Only the active branch triggers the effect.')
    ),
    div({ class: css('_flex _col _gap2') },
      span({ class: css('_caption _fgmutedfg') }, 'Effect log (newest first):'),
      log.el
    )
  );
}

// ─── Data Demos ─────────────────────────────────────────────

function DataDemo() {
  return div({ class: css('_flex _col _gap6') },
    DemoSection(
      'createQuery — Server State (Simulated)',
      'Manages async data fetching with loading/error/success states. Simulated with setTimeout.',
      QueryDemo(),
      CodeBlock({ language: 'javascript' },
        `import { createQuery } from 'decantr/data';\n\nconst users = createQuery({\n  key: 'users',\n  fn: () => fetch('/api/users').then(r => r.json()),\n  staleTime: 30_000\n});\n\n// users.data()   — resolved value\n// users.loading() — boolean\n// users.error()  — Error | null\n// users.refetch() — manual refresh`
      )
    ),
    DemoSection(
      'createEntityStore — Entity Management',
      'Normalized collection with O(1) lookups, per-entity reactivity, and derived views.',
      EntityDemo(),
      CodeBlock({ language: 'javascript' },
        `import { createEntityStore } from 'decantr/data';\n\nconst users = createEntityStore({ getId: u => u.id });\nusers.addMany([{ id: '1', name: 'Alice' }]);\n\nconst alice = users.get('1'); // per-entity memo\nconst active = users.filter(u => u.active);\nconst sorted = users.sorted((a, b) => a.name.localeCompare(b.name));`
      )
    ),
    DemoSection(
      'withMiddleware — Signal Middleware',
      'Intercept signal reads/writes with composable middleware. Validation, undo, logging.',
      MiddlewareDemo(),
      CodeBlock({ language: 'javascript' },
        `import { withMiddleware, validationMiddleware, undoMiddleware } from 'decantr/state/middleware';\n\nconst undo = undoMiddleware({ maxLength: 50 });\nconst [value, setValue] = withMiddleware(\n  createSignal(50),\n  [\n    validationMiddleware(v => v >= 0 && v <= 100 ? true : 'Out of range'),\n    undo.middleware\n  ]\n);\n\nsetValue(150);  // rejected — stays at 50\nundo.undo();    // time travel`
      )
    )
  );
}

function QueryDemo() {
  const [data, setData] = createSignal(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);
  const [errorMode, setErrorMode] = createSignal(false);
  const [fetchCount, setFetchCount] = createSignal(0);

  function simulateFetch() {
    setLoading(true);
    setError(null);
    setData(null);
    setFetchCount(c => c + 1);

    setTimeout(() => {
      if (errorMode()) {
        setLoading(false);
        setError('NetworkError: simulated failure');
      } else {
        setLoading(false);
        setData({
          users: [
            { id: 1, name: 'Alice Chen', role: 'Engineer' },
            { id: 2, name: 'Bob Park', role: 'Designer' },
            { id: 3, name: 'Carol Wu', role: 'PM' }
          ],
          fetchedAt: new Date().toLocaleTimeString()
        });
      }
    }, 800);
  }

  // Initial fetch
  simulateFetch();

  const statusEl = div({});
  const dataEl = div({});

  createEffect(() => {
    statusEl.textContent = '';
    if (loading()) {
      statusEl.appendChild(
        div({ class: css('_flex _gap2 _aic') },
          Badge({ variant: 'warning' }, 'Loading...'),
          span({ class: css('_caption _fgmutedfg _fontmono') }, 'Fetching data...')
        )
      );
    } else if (error()) {
      statusEl.appendChild(
        div({ class: css('_flex _gap2 _aic') },
          Badge({ variant: 'error' }, 'Error'),
          span({ class: css('_caption _fgerror _fontmono') }, error())
        )
      );
    } else {
      statusEl.appendChild(
        Badge({ variant: 'success' }, 'Success')
      );
    }
  });

  createEffect(() => {
    dataEl.textContent = '';
    const d = data();
    if (d) {
      const rows = d.users.map(u =>
        div({ class: css('_flex _gap3 _aic _p2 _bgmuted/10 _radius') },
          Chip({ variant: 'primary', label: u.name }),
          span({ class: css('_caption _fgmutedfg') }, u.role)
        )
      );
      dataEl.appendChild(
        div({ class: css('_flex _col _gap2') },
          ...rows,
          span({ class: css('_caption _fgmutedfg _fontmono') }, `Fetched at: ${d.fetchedAt}`)
        )
      );
    }
  });

  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_p4 _bgmuted/10 _radius _b1 _bcborder _flex _col _gap3') },
      statusEl,
      dataEl
    ),
    DemoRow(
      Button({ size: 'sm', variant: 'primary', onclick: simulateFetch }, 'Refetch'),
      Button({ size: 'sm', variant: errorMode() ? 'error' : 'outline', onclick: () => setErrorMode(!errorMode()) }, 'Toggle Error Mode'),
      Separator({ vertical: true }),
      span({ class: css('_caption _fgmutedfg') }, 'Fetches:'),
      Badge({ variant: 'accent', count: fetchCount })
    )
  );
}

function EntityDemo() {
  const users = createEntityStore({ getId: u => u.id });
  const [filterText, setFilterText] = createSignal('');
  const [sortAsc, setSortAsc] = createSignal(true);
  let nextId = 6;

  // Seed data
  users.addMany([
    { id: '1', name: 'Alice Chen', role: 'Engineer' },
    { id: '2', name: 'Bob Park', role: 'Designer' },
    { id: '3', name: 'Carol Wu', role: 'PM' },
    { id: '4', name: 'David Kim', role: 'Engineer' },
    { id: '5', name: 'Eve Singh', role: 'Designer' }
  ]);

  const filtered = users.filter(u => {
    const ft = filterText();
    if (!ft) return true;
    return u.name.toLowerCase().includes(ft.toLowerCase());
  });

  const sortedFiltered = createMemo(() => {
    const items = filtered();
    const asc = sortAsc();
    return [...items].sort((a, b) => asc
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
    );
  });

  const listEl = div({ class: css('_flex _col _gap2') });

  createEffect(() => {
    listEl.textContent = '';
    const items = sortedFiltered();
    for (const user of items) {
      listEl.appendChild(
        div({ class: css('_flex _gap3 _aic _p2 _bgmuted/10 _radius') },
          Chip({ variant: 'primary', label: user.name }),
          span({ class: css('_caption _fgmutedfg') }, user.role),
          Button({ size: 'sm', variant: 'outline', onclick: () => {
            users.update(user.id, { role: user.role === 'Engineer' ? 'Lead' : 'Engineer' });
          }}, 'Toggle Role'),
          Button({ size: 'sm', variant: 'outline', onclick: () => {
            users.remove(user.id);
          }}, 'Remove')
        )
      );
    }
    if (items.length === 0) {
      listEl.appendChild(span({ class: css('_caption _fgmutedfg _p3') }, 'No matching entities.'));
    }
  });

  const names = ['Fay Li', 'Gus Roy', 'Hana Ito', 'Ivan Popov', 'Jade Moon', 'Kai Xu'];
  const roles = ['Engineer', 'Designer', 'PM', 'QA'];

  return div({ class: css('_flex _col _gap4') },
    DemoRow(
      span({ class: css('_caption _fgmutedfg') }, 'Count:'),
      Badge({ variant: 'accent', count: users.count }),
      Separator({ vertical: true }),
      Input({
        placeholder: 'Filter by name...',
        size: 'sm',
        oninput: (e) => setFilterText(e.target.value)
      }),
      Button({ size: 'sm', variant: 'outline', onclick: () => setSortAsc(!sortAsc()) },
        () => sortAsc() ? 'Sort A→Z' : 'Sort Z→A'
      )
    ),
    div({ class: css('_p4 _bgmuted/10 _radius _b1 _bcborder') }, listEl),
    DemoRow(
      Button({ size: 'sm', variant: 'primary', onclick: () => {
        const name = names[nextId % names.length];
        const role = roles[nextId % roles.length];
        users.upsert({ id: String(nextId++), name, role });
      }}, 'Add Entity'),
      Button({ size: 'sm', variant: 'outline', onclick: () => users.clear() }, 'Clear All')
    )
  );
}

function MiddlewareDemo() {
  const undoCtrl = undoMiddleware({ maxLength: 50 });
  const [rejections, setRejections] = createSignal(0);
  const [lastRejected, setLastRejected] = createSignal('');

  const [value, setValue] = withMiddleware(
    createSignal(50),
    [
      validationMiddleware(
        v => (typeof v === 'number' && v >= 0 && v <= 100) ? true : `Out of range: ${v}`,
        { onError: (err, v) => { setRejections(r => r + 1); setLastRejected(String(v)); } }
      ),
      undoCtrl.middleware
    ]
  );

  const display = span({ class: css('_heading3 _fontmono') });
  const rangeBar = div({ class: css('_radius _h[8px] _bgprimary') });

  createEffect(() => {
    const v = value();
    display.textContent = String(v);
    rangeBar.style.width = v + '%';
  });

  const undoBtn = Button({ variant: 'outline', size: 'sm' }, 'Undo');
  const redoBtn = Button({ variant: 'outline', size: 'sm' }, 'Redo');
  createEffect(() => { undoBtn.disabled = !undoCtrl.canUndo(); });
  createEffect(() => { redoBtn.disabled = !undoCtrl.canRedo(); });
  undoBtn.addEventListener('click', () => undoCtrl.undo());
  redoBtn.addEventListener('click', () => undoCtrl.redo());

  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_p4 _bgmuted/10 _radius _b1 _bcborder _flex _col _gap3') },
      DemoRow(
        span({ class: css('_caption _fgmutedfg') }, 'Value (0–100):'),
        display
      ),
      div({ class: css('_bgmuted/10 _radius _h[8px] _w[100%]') }, rangeBar)
    ),
    DemoRow(
      Button({ size: 'sm', variant: 'outline', onclick: () => setValue(v => v - 10) }, '-10'),
      Button({ size: 'sm', variant: 'outline', onclick: () => setValue(v => v + 10) }, '+10'),
      Button({ size: 'sm', variant: 'outline', onclick: () => setValue(150) }, 'Set 150 (rejected)'),
      Button({ size: 'sm', variant: 'outline', onclick: () => setValue(-20) }, 'Set -20 (rejected)')
    ),
    DemoRow(
      undoBtn,
      redoBtn,
      Separator({ vertical: true }),
      span({ class: css('_caption _fgmutedfg') }, 'Rejections:'),
      Badge({ variant: 'error', count: rejections }),
      cond(
        () => lastRejected() !== '',
        () => span({ class: css('_caption _fgmutedfg') }, () => `Last rejected: ${lastRejected()}`)
      )
    )
  );
}

// ─── Router Demo ────────────────────────────────────────────

function RouterDemo() {
  return div({ class: css('_flex _col _gap6') },
    DemoSection(
      'Client-Side Routing',
      'Hash and History mode routing with nested routes, guards, and lazy loading.',
      p({ class: css('_body _fgmutedfg') }, 'Router demos require full page context. The workbench itself uses hash routing.'),
      CodeBlock({ language: 'javascript' },
        `import { createRouter, navigate, link, useRoute } from 'decantr/router';\n\nconst router = createRouter({\n  mode: 'hash',\n  routes: [\n    { path: '/', component: HomePage },\n    { path: '/about', component: AboutPage },\n    { path: '/user/:id', component: UserPage }\n  ]\n});\n\n// Programmatic navigation\nnavigate('/about');\n\n// Route-aware links\nconst nav = link('/about', { class: 'nav-link' }, 'About');`
      )
    )
  );
}

// ─── Forms Demo ─────────────────────────────────────────────

function FormsDemo() {
  return div({ class: css('_flex _col _gap6') },
    DemoSection(
      'Form System',
      'createForm with validators, field-level reactivity, and fieldArray for dynamic fields.',
      FormsInteractiveDemo(),
      CodeBlock({ language: 'javascript' },
        `import { createForm, validators } from 'decantr/form';\n\nconst form = createForm({\n  fields: {\n    email: { validators: [validators.required, validators.email] },\n    password: { validators: [validators.required, validators.minLength(8)] }\n  },\n  onSubmit: (values) => console.log(values)\n});\n\n// Get field state\nform.field('email'); // { value, error, touched, dirty }`
      )
    )
  );
}

function FormsInteractiveDemo() {
  const [submitted, setSubmitted] = createSignal('');

  const form = createForm({
    fields: {
      email: { validators: [validators.required, validators.email] },
      name: { validators: [validators.required] }
    },
    onSubmit: (values) => { setSubmitted(JSON.stringify(values, null, 2)); }
  });

  const emailField = form.field('email');
  const nameField = form.field('name');

  const emailError = span({ class: css('_caption _fgerror') });
  const nameError = span({ class: css('_caption _fgerror') });
  const resultEl = span({ class: css('_caption _fgprimary') });

  createEffect(() => { emailError.textContent = emailField.error() || ''; });
  createEffect(() => { nameError.textContent = nameField.error() || ''; });
  createEffect(() => { resultEl.textContent = submitted(); });

  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      label({ class: css('_caption _fgmutedfg') }, 'Name'),
      Input({
        placeholder: 'Enter name...',
        value: nameField.value,
        oninput: (e) => nameField.setValue(e.target.value),
        ref: (el) => { el.addEventListener('blur', () => nameField.setTouched(true)); }
      }),
      nameError
    ),
    div({ class: css('_flex _col _gap1') },
      label({ class: css('_caption _fgmutedfg') }, 'Email'),
      Input({
        placeholder: 'Enter email...',
        value: emailField.value,
        oninput: (e) => emailField.setValue(e.target.value),
        ref: (el) => { el.addEventListener('blur', () => emailField.setTouched(true)); }
      }),
      emailError
    ),
    DemoRow(
      Button({ variant: 'primary', size: 'sm', onclick: () => form.submit() }, 'Submit'),
      Button({ variant: 'outline', size: 'sm', onclick: () => form.reset() }, 'Reset')
    ),
    submitted() ? div({ class: css('_p3 _bgmuted/10 _radius _caption _fgmutedfg') }, 'Submitted: ', resultEl) : null
  );
}

// ─── Subsection Registry ────────────────────────────────────

const SUBSECTIONS = {
  core: { label: 'Core', render: CoreDemo },
  state: { label: 'State', render: StateDemo },
  data: { label: 'Data', render: DataDemo },
  router: { label: 'Router', render: RouterDemo },
  forms: { label: 'Forms', render: FormsDemo },
};

export function FoundationsExplorer(subsection) {
  const sub = SUBSECTIONS[subsection] || SUBSECTIONS.core;
  return section({ id: 'foundations-' + subsection, class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, `Foundations — ${sub.label}`),
      p({ class: css('_body _fgmutedfg') }, 'Interactive API playgrounds for Decantr primitives.')
    ),
    sub.render()
  );
}

export async function loadFoundationItems() {
  try {
    const resp = await fetch('/__decantr/registry/foundations.json');
    const data = await resp.json();
    return Object.entries(data.subsections || {}).map(([id, sub]) => ({
      id, label: sub.label
    }));
  } catch {
    // Fallback to local subsections
    return Object.entries(SUBSECTIONS).map(([id, sub]) => ({ id, label: sub.label }));
  }
}
