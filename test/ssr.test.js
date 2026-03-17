import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderToString,
  renderToStream,
  hydrate,
  installHydrationRuntime,
  isSSR,
  ssrH,
  ssrText,
  ssrCond,
  ssrList,
  ssrCss,
  ssrOnMount,
  ssrOnDestroy,
  _internals,
} from '../src/ssr/index.js';
import { createSignal, createMemo, createEffect, untrack } from '../src/state/index.js';
import { createDOM } from '../src/test/dom.js';
import { pushScope, popScope, drainMountQueue, runDestroyFns } from '../src/core/lifecycle.js';

// ─── renderToString: Basic Elements ────────────────────────────

describe('renderToString — basic elements', () => {
  it('renders a simple div', () => {
    const html = renderToString(() => ssrH('div', null));
    assert.match(html, /^<div data-d-id="\d+"><\/div>$/);
  });

  it('renders a div with text content', () => {
    const html = renderToString(() => ssrH('div', null, 'Hello'));
    assert.match(html, /<div data-d-id="\d+">Hello<\/div>/);
  });

  it('renders nested elements', () => {
    const html = renderToString(() =>
      ssrH('div', null,
        ssrH('span', null, 'inner'),
        ssrH('p', null, 'paragraph')
      )
    );
    assert.match(html, /<div data-d-id="\d+"><span data-d-id="\d+">inner<\/span><p data-d-id="\d+">paragraph<\/p><\/div>/);
  });

  it('renders deeply nested elements', () => {
    const html = renderToString(() =>
      ssrH('div', null,
        ssrH('ul', null,
          ssrH('li', null, 'one'),
          ssrH('li', null, 'two'),
        )
      )
    );
    assert.ok(html.includes('<ul'));
    assert.ok(html.includes('<li'));
    assert.ok(html.includes('one'));
    assert.ok(html.includes('two'));
  });

  it('renders numeric children', () => {
    const html = renderToString(() => ssrH('span', null, 42));
    assert.ok(html.includes('42'));
  });

  it('skips null children', () => {
    const html = renderToString(() => ssrH('div', null, null, 'text', null));
    assert.ok(html.includes('text'));
    assert.ok(!html.includes('null'));
  });

  it('skips false children', () => {
    const html = renderToString(() => ssrH('div', null, false, 'text', false));
    assert.ok(html.includes('text'));
    assert.ok(!html.includes('false'));
  });

  it('flattens array children', () => {
    const items = ['a', 'b', 'c'];
    const html = renderToString(() =>
      ssrH('div', null, items.map(i => ssrH('span', null, i)))
    );
    assert.ok(html.includes('a'));
    assert.ok(html.includes('b'));
    assert.ok(html.includes('c'));
  });
});

// ─── renderToString: Attributes ─────────────────────────────────

describe('renderToString — attributes', () => {
  it('renders string attributes', () => {
    const html = renderToString(() => ssrH('div', { id: 'test', role: 'main' }));
    assert.ok(html.includes('id="test"'));
    assert.ok(html.includes('role="main"'));
  });

  it('renders class attribute', () => {
    const html = renderToString(() => ssrH('div', { class: 'foo bar' }));
    assert.ok(html.includes('class="foo bar"'));
  });

  it('renders className as class', () => {
    const html = renderToString(() => ssrH('div', { className: 'foo' }));
    assert.ok(html.includes('class="foo"'));
  });

  it('renders boolean attributes when true', () => {
    const html = renderToString(() => ssrH('input', { disabled: true, required: true }));
    assert.ok(html.includes(' disabled'));
    assert.ok(html.includes(' required'));
  });

  it('omits boolean attributes when false', () => {
    const html = renderToString(() => ssrH('input', { disabled: false }));
    assert.ok(!html.includes('disabled'));
  });

  it('omits null/undefined attributes', () => {
    const html = renderToString(() => ssrH('div', { title: null, 'data-x': undefined }));
    assert.ok(!html.includes('title'));
    assert.ok(!html.includes('data-x'));
  });

  it('renders style object as string', () => {
    const html = renderToString(() => ssrH('div', { style: { color: 'red', fontSize: '16px' } }));
    assert.ok(html.includes('style="color:red;font-size:16px"'));
  });

  it('escapes HTML in attribute values', () => {
    const html = renderToString(() => ssrH('div', { title: 'a "quoted" & <value>' }));
    assert.ok(html.includes('title="a &quot;quoted&quot; &amp; &lt;value&gt;"'));
  });

  it('does not serialize event handlers', () => {
    const html = renderToString(() => ssrH('button', { onclick: () => {} }, 'Click'));
    assert.ok(!html.includes('onclick'));
    assert.ok(html.includes('Click'));
  });

  it('does not serialize ref', () => {
    const html = renderToString(() => ssrH('div', { ref: () => {} }));
    assert.ok(!html.includes('ref'));
  });

  it('renders data-d-id on every element', () => {
    const html = renderToString(() =>
      ssrH('div', null, ssrH('span', null, 'text'))
    );
    const matches = html.match(/data-d-id/g);
    assert.equal(matches.length, 2);
  });
});

// ─── renderToString: Self-Closing Tags ──────────────────────────

describe('renderToString — self-closing tags', () => {
  it('renders br as self-closing', () => {
    const html = renderToString(() => ssrH('br', null));
    assert.match(html, /<br data-d-id="\d+">/);
    assert.ok(!html.includes('</br>'));
  });

  it('renders img as self-closing', () => {
    const html = renderToString(() => ssrH('img', { src: '/photo.jpg', alt: 'Photo' }));
    assert.ok(html.includes('src="/photo.jpg"'));
    assert.ok(html.includes('alt="Photo"'));
    assert.ok(!html.includes('</img>'));
  });

  it('renders input as self-closing', () => {
    const html = renderToString(() => ssrH('input', { type: 'text', value: 'hi' }));
    assert.ok(html.includes('type="text"'));
    assert.ok(!html.includes('</input>'));
  });

  it('renders hr as self-closing', () => {
    const html = renderToString(() => ssrH('hr', null));
    assert.ok(!html.includes('</hr>'));
  });

  it('renders meta as self-closing', () => {
    const html = renderToString(() => ssrH('meta', { charset: 'utf-8' }));
    assert.ok(!html.includes('</meta>'));
  });

  it('renders source as self-closing', () => {
    const html = renderToString(() => ssrH('source', { src: 'video.mp4', type: 'video/mp4' }));
    assert.ok(!html.includes('</source>'));
  });
});

// ─── renderToString: HTML Escaping ──────────────────────────────

describe('renderToString — HTML escaping', () => {
  it('escapes text content', () => {
    const html = renderToString(() => ssrH('p', null, '<script>alert("xss")</script>'));
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(!html.includes('<script>'));
  });

  it('escapes ampersands in text', () => {
    const html = renderToString(() => ssrH('p', null, 'foo & bar'));
    assert.ok(html.includes('foo &amp; bar'));
  });

  it('escapes angle brackets in text', () => {
    const html = renderToString(() => ssrH('p', null, '1 < 2 > 0'));
    assert.ok(html.includes('1 &lt; 2 &gt; 0'));
  });
});

// ─── renderToString: Signals ────────────────────────────────────

describe('renderToString — signals', () => {
  it('renders signal values as static text', () => {
    const [count] = createSignal(42);
    const html = renderToString(() =>
      ssrH('span', null, ssrText(() => count()))
    );
    assert.ok(html.includes('42'));
  });

  it('renders reactive class attribute', () => {
    const [cls] = createSignal('active');
    const html = renderToString(() =>
      ssrH('div', { class: () => cls() })
    );
    assert.ok(html.includes('class="active"'));
  });

  it('renders reactive attribute', () => {
    const [title] = createSignal('Hello World');
    const html = renderToString(() =>
      ssrH('div', { title: () => title() })
    );
    assert.ok(html.includes('title="Hello World"'));
  });

  it('does not create effects during SSR', () => {
    let effectCount = 0;
    const [count, setCount] = createSignal(0);

    const html = renderToString(() => {
      // In SSR, this should not create a persistent effect
      return ssrH('div', null, ssrText(() => {
        return count();
      }));
    });

    // Changing the signal should not trigger any SSR-created effects
    setCount(1);
    assert.ok(html.includes('0'));
  });

  it('renders memo values', () => {
    const [a] = createSignal(2);
    const [b] = createSignal(3);
    const sum = createMemo(() => a() + b());

    const html = renderToString(() =>
      ssrH('span', null, ssrText(() => sum()))
    );
    assert.ok(html.includes('5'));
  });

  it('renders function children as text', () => {
    const [name] = createSignal('Alice');
    const html = renderToString(() =>
      ssrH('span', null, () => name())
    );
    assert.ok(html.includes('Alice'));
  });
});

// ─── renderToString: cond() ─────────────────────────────────────

describe('renderToString — cond', () => {
  it('renders true branch', () => {
    const html = renderToString(() =>
      ssrCond(() => true, () => ssrH('span', null, 'yes'))
    );
    assert.ok(html.includes('yes'));
  });

  it('renders false branch', () => {
    const html = renderToString(() =>
      ssrCond(() => false, () => ssrH('span', null, 'yes'), () => ssrH('span', null, 'no'))
    );
    assert.ok(html.includes('no'));
    assert.ok(!html.includes('yes'));
  });

  it('renders empty when false with no elseFn', () => {
    const html = renderToString(() =>
      ssrCond(() => false, () => ssrH('span', null, 'yes'))
    );
    assert.ok(!html.includes('yes'));
    assert.ok(html.includes('d-cond'));
  });

  it('wraps in d-cond element', () => {
    const html = renderToString(() =>
      ssrCond(() => true, () => ssrH('span', null, 'content'))
    );
    assert.ok(html.includes('<d-cond'));
    assert.ok(html.includes('</d-cond>'));
  });

  it('works with signal predicates', () => {
    const [show] = createSignal(true);
    const html = renderToString(() =>
      ssrCond(() => show(), () => ssrH('div', null, 'visible'))
    );
    assert.ok(html.includes('visible'));
  });
});

// ─── renderToString: list() ─────────────────────────────────────

describe('renderToString — list', () => {
  it('renders array of items', () => {
    const html = renderToString(() =>
      ssrList(
        () => ['a', 'b', 'c'],
        (item) => item,
        (item) => ssrH('li', null, item)
      )
    );
    assert.ok(html.includes('a'));
    assert.ok(html.includes('b'));
    assert.ok(html.includes('c'));
    assert.ok(html.includes('<d-list'));
  });

  it('renders empty array', () => {
    const html = renderToString(() =>
      ssrList(
        () => [],
        (item) => item,
        (item) => ssrH('li', null, item)
      )
    );
    assert.ok(html.includes('<d-list'));
    assert.ok(!html.includes('<li'));
  });

  it('passes index to renderFn', () => {
    const html = renderToString(() =>
      ssrList(
        () => ['x', 'y'],
        (_, i) => i,
        (item, i) => ssrH('span', null, `${i}:${item}`)
      )
    );
    assert.ok(html.includes('0:x'));
    assert.ok(html.includes('1:y'));
  });

  it('works with signal items', () => {
    const [items] = createSignal([1, 2, 3]);
    const html = renderToString(() =>
      ssrList(
        () => items(),
        (item) => item,
        (item) => ssrH('div', null, String(item))
      )
    );
    assert.ok(html.includes('1'));
    assert.ok(html.includes('2'));
    assert.ok(html.includes('3'));
  });

  it('handles objects in list', () => {
    const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    const html = renderToString(() =>
      ssrList(
        () => users,
        (u) => u.id,
        (u) => ssrH('div', null, u.name)
      )
    );
    assert.ok(html.includes('Alice'));
    assert.ok(html.includes('Bob'));
  });
});

// ─── renderToString: Components ─────────────────────────────────

describe('renderToString — components', () => {
  it('renders a component function', () => {
    function Greeting({ name }) {
      return ssrH('h1', null, `Hello, ${name}!`);
    }
    const html = renderToString(() => Greeting({ name: 'World' }));
    assert.ok(html.includes('Hello, World!'));
  });

  it('renders nested components', () => {
    function Inner() {
      return ssrH('span', null, 'inner');
    }
    function Outer() {
      return ssrH('div', { class: 'outer' }, Inner());
    }
    const html = renderToString(() => Outer());
    assert.ok(html.includes('class="outer"'));
    assert.ok(html.includes('inner'));
  });

  it('renders components with signal props', () => {
    const [count] = createSignal(7);
    function Counter({ value }) {
      return ssrH('span', null, ssrText(value));
    }
    const html = renderToString(() => Counter({ value: () => count() }));
    assert.ok(html.includes('7'));
  });

  it('renders components with children', () => {
    function Card(props, ...children) {
      return ssrH('div', { class: 'card' }, ...children);
    }
    const html = renderToString(() =>
      Card({}, ssrH('p', null, 'Card content'))
    );
    assert.ok(html.includes('class="card"'));
    assert.ok(html.includes('Card content'));
  });

  it('onMount is a no-op in SSR', () => {
    let mounted = false;
    function App() {
      ssrOnMount(() => { mounted = true; });
      return ssrH('div', null, 'app');
    }
    const html = renderToString(() => App());
    assert.ok(html.includes('app'));
    assert.equal(mounted, false);
  });

  it('onDestroy is a no-op in SSR', () => {
    let destroyed = false;
    function App() {
      ssrOnDestroy(() => { destroyed = true; });
      return ssrH('div', null, 'app');
    }
    const html = renderToString(() => App());
    assert.ok(html.includes('app'));
    assert.equal(destroyed, false);
  });
});

// ─── renderToString: CSS Resolution ─────────────────────────────

describe('renderToString — CSS resolution', () => {
  it('passes through atom class names', () => {
    const html = renderToString(() =>
      ssrH('div', { class: ssrCss('_flex _p4 _gap2') })
    );
    assert.ok(html.includes('class="_flex _p4 _gap2"'));
  });

  it('resolves _group to d-group', () => {
    const cls = ssrCss('_group _flex');
    assert.ok(cls.includes('d-group'));
    assert.ok(cls.includes('_flex'));
  });

  it('resolves _peer to d-peer', () => {
    const cls = ssrCss('_peer');
    assert.equal(cls, 'd-peer');
  });

  it('handles empty/null classes', () => {
    assert.equal(ssrCss(''), '');
    assert.equal(ssrCss(null), '');
    assert.equal(ssrCss(undefined), '');
  });

  it('handles multiple space-separated strings', () => {
    const cls = ssrCss('_flex _col', '_p4 _gap2');
    assert.equal(cls, '_flex _col _p4 _gap2');
  });
});

// ─── renderToString: Edge Cases ─────────────────────────────────

describe('renderToString — edge cases', () => {
  it('renders empty component', () => {
    const html = renderToString(() => ssrH('div', null));
    assert.ok(html.includes('<div'));
    assert.ok(html.includes('</div>'));
  });

  it('renders empty props object', () => {
    const html = renderToString(() => ssrH('div', {}));
    assert.match(html, /^<div data-d-id="\d+"><\/div>$/);
  });

  it('handles component returning null', () => {
    const html = renderToString(() => null);
    assert.equal(html, '');
  });

  it('handles deeply nested structure', () => {
    const html = renderToString(() =>
      ssrH('div', null,
        ssrH('div', null,
          ssrH('div', null,
            ssrH('div', null,
              ssrH('span', null, 'deep')
            )
          )
        )
      )
    );
    assert.ok(html.includes('deep'));
    const divCount = (html.match(/<div/g) || []).length;
    assert.equal(divCount, 4);
  });

  it('assigns unique IDs to each element', () => {
    const html = renderToString(() =>
      ssrH('div', null,
        ssrH('span', null, 'a'),
        ssrH('span', null, 'b')
      )
    );
    const ids = [...html.matchAll(/data-d-id="(\d+)"/g)].map(m => m[1]);
    const uniqueIds = new Set(ids);
    assert.equal(ids.length, uniqueIds.size, 'All IDs should be unique');
  });

  it('resets ID counter between renders', () => {
    const html1 = renderToString(() => ssrH('div', null));
    const html2 = renderToString(() => ssrH('div', null));
    const id1 = html1.match(/data-d-id="(\d+)"/)[1];
    const id2 = html2.match(/data-d-id="(\d+)"/)[1];
    assert.equal(id1, id2, 'ID counter should reset between renders');
  });

  it('handles mixed content types', () => {
    const html = renderToString(() =>
      ssrH('div', null,
        'text',
        ssrH('br', null),
        42,
        ssrH('span', null, 'end')
      )
    );
    assert.ok(html.includes('text'));
    assert.ok(html.includes('<br'));
    assert.ok(html.includes('42'));
    assert.ok(html.includes('end'));
  });
});

// ─── renderToStream ─────────────────────────────────────────────

describe('renderToStream', () => {
  it('produces same output as renderToString', async () => {
    function App() {
      return ssrH('div', { class: 'app' },
        ssrH('h1', null, 'Title'),
        ssrH('p', null, 'Content')
      );
    }
    const stringOutput = renderToString(() => App());
    const stream = renderToStream(() => App());
    const reader = stream.getReader();
    let streamOutput = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      streamOutput += value;
    }
    assert.equal(streamOutput, stringOutput);
  });

  it('returns a ReadableStream', () => {
    const stream = renderToStream(() => ssrH('div', null, 'test'));
    assert.ok(stream instanceof ReadableStream);
  });

  it('yields chunks for nested elements', async () => {
    const stream = renderToStream(() =>
      ssrH('div', null,
        ssrH('span', null, 'hello'),
        ssrH('span', null, 'world')
      )
    );
    const reader = stream.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    // Should have multiple chunks (opening tags, content, closing tags)
    assert.ok(chunks.length > 1, `Expected multiple chunks, got ${chunks.length}`);
    const full = chunks.join('');
    assert.ok(full.includes('hello'));
    assert.ok(full.includes('world'));
  });

  it('streams self-closing elements as single chunk', async () => {
    const stream = renderToStream(() => ssrH('br', null));
    const reader = stream.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    assert.equal(chunks.length, 1);
    assert.ok(chunks[0].includes('<br'));
  });

  it('handles empty component', async () => {
    const stream = renderToStream(() => null);
    const reader = stream.getReader();
    const { done, value } = await reader.read();
    assert.equal(done, true);
  });

  it('streams with signals evaluated', async () => {
    const [name] = createSignal('Decantr');
    const stream = renderToStream(() =>
      ssrH('h1', null, ssrText(() => name()))
    );
    const reader = stream.getReader();
    let output = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      output += value;
    }
    assert.ok(output.includes('Decantr'));
  });
});

// ─── isSSR ──────────────────────────────────────────────────────

describe('isSSR', () => {
  it('returns false outside SSR context', () => {
    assert.equal(isSSR(), false);
  });

  it('returns true during renderToString', () => {
    let wasSSR = false;
    renderToString(() => {
      wasSSR = isSSR();
      return ssrH('div', null);
    });
    // Note: isSSR checks _ssrActive which is set during runInSSRContext
    // But the component function executes within that context
    // Actually isSSR also checks globalThis.__d_ssr_active
    assert.equal(wasSSR, true);
  });
});

// ─── Internal Helpers ───────────────────────────────────────────

describe('_internals', () => {
  it('escapeHTML handles all special chars', () => {
    assert.equal(_internals.escapeHTML('<>&'), '&lt;&gt;&amp;');
  });

  it('escapeAttr handles quotes', () => {
    assert.equal(_internals.escapeAttr('"hello"'), '&quot;hello&quot;');
  });

  it('styleObjToString converts camelCase', () => {
    assert.equal(
      _internals.styleObjToString({ backgroundColor: 'red', fontSize: '14px' }),
      'background-color:red;font-size:14px'
    );
  });

  it('styleObjToString skips null values', () => {
    assert.equal(
      _internals.styleObjToString({ color: 'blue', margin: null }),
      'color:blue'
    );
  });

  it('flattenChildren handles nested arrays', () => {
    const children = _internals.flattenChildren([
      'a',
      [ssrH('span', null), ['b', null, 'c']],
      false,
    ]);
    assert.equal(children.length, 4); // 'a', span, 'b', 'c'
  });

  it('normalizeVNode handles various types', () => {
    assert.equal(_internals.normalizeVNode(null), null);
    assert.equal(_internals.normalizeVNode(false), null);

    const textNode = _internals.normalizeVNode('hello');
    assert.equal(textNode.text, 'hello');

    const numNode = _internals.normalizeVNode(42);
    assert.equal(numNode.text, '42');
  });

  it('VOID_ELEMENTS contains standard void elements', () => {
    assert.ok(_internals.VOID_ELEMENTS.has('br'));
    assert.ok(_internals.VOID_ELEMENTS.has('img'));
    assert.ok(_internals.VOID_ELEMENTS.has('input'));
    assert.ok(_internals.VOID_ELEMENTS.has('hr'));
    assert.ok(_internals.VOID_ELEMENTS.has('meta'));
    assert.ok(!_internals.VOID_ELEMENTS.has('div'));
    assert.ok(!_internals.VOID_ELEMENTS.has('span'));
  });

  it('BOOLEAN_ATTRS contains standard boolean attrs', () => {
    assert.ok(_internals.BOOLEAN_ATTRS.has('disabled'));
    assert.ok(_internals.BOOLEAN_ATTRS.has('checked'));
    assert.ok(_internals.BOOLEAN_ATTRS.has('required'));
    assert.ok(_internals.BOOLEAN_ATTRS.has('readonly'));
    assert.ok(!_internals.BOOLEAN_ATTRS.has('class'));
    assert.ok(!_internals.BOOLEAN_ATTRS.has('id'));
  });
});

// ─── Hydration ──────────────────────────────────────────────────

describe('hydrate', () => {
  let cleanup;
  let doc;

  before(() => {
    const env = createDOM();
    doc = env.document;
    cleanup = env.cleanup;

    // Install hydration runtime with real implementations
    installHydrationRuntime(
      { createEffect },
      { pushScope, popScope, drainMountQueue, runDestroyFns }
    );
  });

  after(() => {
    cleanup();
  });

  it('attaches event listeners to existing DOM', async () => {
    const root = doc.createElement('div');
    // Build SSR DOM manually (innerHTML doesn't parse HTML in test DOM)
    const ssrBtn = doc.createElement('button');
    ssrBtn.setAttribute('data-d-id', '0');
    ssrBtn.appendChild(doc.createTextNode('Click me'));
    root.appendChild(ssrBtn);
    doc.body.appendChild(root);

    let clicked = false;

    // Use the real h/text/cond/list from core for client-side rendering
    const { h } = await import('../src/core/index.js');

    hydrate(root, () => h('button', { onclick: () => { clicked = true; } }, 'Click me'));

    // The SSR button should now have the click handler
    const btn = root.childNodes[0];
    btn.dispatchEvent({ type: 'click', bubbles: true });
    assert.equal(clicked, true);

    doc.body.removeChild(root);
  });

  it('attaches reactive text updates', async () => {
    const { h, text } = await import('../src/core/index.js');

    const root = doc.createElement('div');
    // Simulate SSR output
    root.appendChild(doc.createTextNode('0'));
    doc.body.appendChild(root);

    const [count, setCount] = createSignal(0);

    hydrate(root, () => text(() => count()));

    // Initial value should match
    assert.equal(root.childNodes[0].nodeValue, '0');

    // Update signal — hydrated text node should update
    setCount(5);
    // Allow microtask flush
    await new Promise(r => setTimeout(r, 10));
    assert.equal(root.childNodes[0].nodeValue, '5');

    doc.body.removeChild(root);
  });

  it('reuses existing DOM nodes', async () => {
    const { h } = await import('../src/core/index.js');

    const root = doc.createElement('div');
    const existingSpan = doc.createElement('span');
    existingSpan.appendChild(doc.createTextNode('hello'));
    root.appendChild(existingSpan);
    doc.body.appendChild(root);

    // Store reference to existing node
    const originalSpan = root.childNodes[0];

    hydrate(root, () => h('span', null, 'hello'));

    // Should reuse the existing span, not create a new one
    assert.equal(root.childNodes[0], originalSpan);

    doc.body.removeChild(root);
  });

  it('drains onMount queue after hydration', async () => {
    const { h, onMount } = await import('../src/core/index.js');

    const root = doc.createElement('div');
    root.innerHTML = '<div data-d-id="0">content</div>';
    doc.body.appendChild(root);

    let mounted = false;

    hydrate(root, () => {
      onMount(() => { mounted = true; });
      return h('div', null, 'content');
    });

    assert.equal(mounted, true);

    doc.body.removeChild(root);
  });

  it('handles hydration of empty root', async () => {
    const { h } = await import('../src/core/index.js');

    const root = doc.createElement('div');
    doc.body.appendChild(root);

    // No SSR content, client produces content
    hydrate(root, () => h('p', null, 'client only'));

    assert.equal(root.childNodes.length, 1);
    assert.equal(root.childNodes[0].localName, 'p');

    doc.body.removeChild(root);
  });
});

// ─── Complex SSR Scenarios ──────────────────────────────────────

describe('renderToString — complex scenarios', () => {
  it('renders a full page layout', () => {
    function Header() {
      return ssrH('header', { class: '_flex _jcsb _p4' },
        ssrH('h1', null, 'My App'),
        ssrH('nav', null,
          ssrH('a', { href: '/' }, 'Home'),
          ssrH('a', { href: '/about' }, 'About')
        )
      );
    }

    function Main() {
      return ssrH('main', { class: '_flex _col _gap4 _p6' },
        ssrH('h2', null, 'Welcome'),
        ssrH('p', null, 'This is server-rendered content.')
      );
    }

    function App() {
      return ssrH('div', { id: 'app' },
        Header(),
        Main(),
        ssrH('footer', null, ssrH('p', null, '2026'))
      );
    }

    const html = renderToString(() => App());
    assert.ok(html.includes('id="app"'));
    assert.ok(html.includes('<header'));
    assert.ok(html.includes('My App'));
    assert.ok(html.includes('<nav'));
    assert.ok(html.includes('Home'));
    assert.ok(html.includes('About'));
    assert.ok(html.includes('Welcome'));
    assert.ok(html.includes('server-rendered'));
    assert.ok(html.includes('2026'));
  });

  it('renders a todo list with signals', () => {
    const [todos] = createSignal([
      { id: 1, text: 'Buy milk', done: false },
      { id: 2, text: 'Write tests', done: true },
    ]);

    const html = renderToString(() =>
      ssrH('div', null,
        ssrH('h2', null, ssrText(() => `${todos().length} items`)),
        ssrList(
          () => todos(),
          t => t.id,
          t => ssrH('div', { class: t.done ? 'done' : '' },
            ssrH('input', { type: 'checkbox', checked: t.done }),
            ssrH('span', null, t.text)
          )
        )
      )
    );

    assert.ok(html.includes('2 items'));
    assert.ok(html.includes('Buy milk'));
    assert.ok(html.includes('Write tests'));
    assert.ok(html.includes('checked'));
  });

  it('renders conditional login/logout', () => {
    const [user] = createSignal({ name: 'Alice' });

    const html = renderToString(() =>
      ssrCond(
        () => user() !== null,
        () => ssrH('span', null, ssrText(() => `Welcome, ${user().name}`)),
        () => ssrH('a', { href: '/login' }, 'Sign in')
      )
    );

    assert.ok(html.includes('Welcome, Alice'));
    assert.ok(!html.includes('Sign in'));
  });

  it('renders form with multiple input types', () => {
    const html = renderToString(() =>
      ssrH('form', { action: '/submit', method: 'POST' },
        ssrH('input', { type: 'text', name: 'name', placeholder: 'Name', required: true }),
        ssrH('input', { type: 'email', name: 'email', placeholder: 'Email' }),
        ssrH('textarea', { name: 'message', rows: '4' }, 'Default text'),
        ssrH('select', { name: 'role' },
          ssrH('option', { value: 'user' }, 'User'),
          ssrH('option', { value: 'admin', selected: true }, 'Admin')
        ),
        ssrH('button', { type: 'submit', disabled: false }, 'Submit')
      )
    );

    assert.ok(html.includes('action="/submit"'));
    assert.ok(html.includes('method="POST"'));
    assert.ok(html.includes('required'));
    assert.ok(html.includes('placeholder="Name"'));
    assert.ok(html.includes('type="email"'));
    assert.ok(html.includes('<textarea'));
    assert.ok(html.includes('Default text'));
    assert.ok(html.includes('<select'));
    assert.ok(html.includes('selected'));
    assert.ok(html.includes('Submit'));
    assert.ok(!html.includes('disabled'));
  });

  it('renders table with data', () => {
    const users = [
      { id: 1, name: 'Alice', email: 'alice@test.com' },
      { id: 2, name: 'Bob', email: 'bob@test.com' },
    ];

    const html = renderToString(() =>
      ssrH('table', null,
        ssrH('thead', null,
          ssrH('tr', null,
            ssrH('th', null, 'Name'),
            ssrH('th', null, 'Email')
          )
        ),
        ssrH('tbody', null,
          ...users.map(u =>
            ssrH('tr', { 'data-id': String(u.id) },
              ssrH('td', null, u.name),
              ssrH('td', null, u.email)
            )
          )
        )
      )
    );

    assert.ok(html.includes('<table'));
    assert.ok(html.includes('<thead'));
    assert.ok(html.includes('<tbody'));
    assert.ok(html.includes('Alice'));
    assert.ok(html.includes('bob@test.com'));
    assert.ok(html.includes('data-id="1"'));
  });
});

// ─── SSR + Stream Consistency ───────────────────────────────────

describe('renderToStream — consistency with renderToString', () => {
  async function streamToString(component) {
    const stream = renderToStream(component);
    const reader = stream.getReader();
    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += value;
    }
    return result;
  }

  it('matches for simple element', async () => {
    const component = () => ssrH('div', { id: 'test' }, 'content');
    const str = renderToString(component);
    const stream = await streamToString(component);
    assert.equal(str, stream);
  });

  it('matches for nested elements', async () => {
    const component = () =>
      ssrH('div', null,
        ssrH('header', null, ssrH('h1', null, 'Title')),
        ssrH('main', null, ssrH('p', null, 'Body')),
        ssrH('footer', null, 'Footer')
      );
    const str = renderToString(component);
    const stream = await streamToString(component);
    assert.equal(str, stream);
  });

  it('matches for cond', async () => {
    const component = () =>
      ssrCond(() => true, () => ssrH('span', null, 'yes'), () => ssrH('span', null, 'no'));
    const str = renderToString(component);
    const stream = await streamToString(component);
    assert.equal(str, stream);
  });

  it('matches for list', async () => {
    const component = () =>
      ssrList(() => [1, 2, 3], n => n, n => ssrH('li', null, String(n)));
    const str = renderToString(component);
    const stream = await streamToString(component);
    assert.equal(str, stream);
  });

  it('matches for mixed content', async () => {
    const [name] = createSignal('test');
    const component = () =>
      ssrH('div', { class: '_flex' },
        ssrText(() => name()),
        ssrH('br', null),
        ssrH('img', { src: '/logo.png', alt: 'Logo' })
      );
    const str = renderToString(component);
    const stream = await streamToString(component);
    assert.equal(str, stream);
  });
});

// ─── ssrOnMount / ssrOnDestroy ──────────────────────────────────

describe('ssrOnMount / ssrOnDestroy', () => {
  it('ssrOnMount does not throw', () => {
    assert.doesNotThrow(() => ssrOnMount(() => {}));
  });

  it('ssrOnDestroy does not throw', () => {
    assert.doesNotThrow(() => ssrOnDestroy(() => {}));
  });

  it('ssrOnMount does not execute the callback', () => {
    let called = false;
    ssrOnMount(() => { called = true; });
    assert.equal(called, false);
  });

  it('ssrOnDestroy does not execute the callback', () => {
    let called = false;
    ssrOnDestroy(() => { called = true; });
    assert.equal(called, false);
  });
});

// ─── VNode Structure ────────────────────────────────────────────

describe('VNode structure', () => {
  it('ssrH returns correct VNode shape', () => {
    const vnode = ssrH('div', { id: 'test' }, 'child');
    assert.equal(vnode.tag, 'div');
    assert.equal(vnode.props.id, 'test');
    assert.equal(vnode.children.length, 1);
    assert.equal(vnode.children[0].text, 'child');
    assert.equal(typeof vnode._id, 'number');
  });

  it('ssrText returns correct TextVNode shape', () => {
    const node = ssrText(() => 'hello');
    assert.equal(node.text, 'hello');
    assert.equal(typeof node._id, 'number');
    assert.equal(node._reactive, true);
  });

  it('ssrCond returns d-cond VNode', () => {
    const vnode = ssrCond(() => true, () => ssrH('span', null));
    assert.equal(vnode.tag, 'd-cond');
    assert.equal(vnode.children.length, 1);
  });

  it('ssrList returns d-list VNode', () => {
    const vnode = ssrList(() => [1, 2], n => n, n => ssrH('li', null, String(n)));
    assert.equal(vnode.tag, 'd-list');
    assert.equal(vnode.children.length, 2);
  });

  it('event handlers stored in _handlers', () => {
    const handler = () => {};
    const vnode = ssrH('button', { onclick: handler, class: 'btn' });
    assert.equal(vnode._handlers.onclick, handler);
    assert.ok(!vnode.props.onclick);
    assert.equal(vnode.props.class, 'btn');
  });
});

// ─── installHydrationRuntime ────────────────────────────────────

describe('installHydrationRuntime', () => {
  it('installs state module', () => {
    const mockEffect = () => () => {};
    installHydrationRuntime(
      { createEffect: mockEffect },
      { pushScope: () => {}, popScope: () => [], drainMountQueue: () => [], runDestroyFns: () => {} }
    );
    assert.equal(globalThis.__d_state_createEffect, mockEffect);
  });

  it('installs lifecycle module', () => {
    const mockPush = () => {};
    installHydrationRuntime(
      { createEffect: () => () => {} },
      { pushScope: mockPush, popScope: () => [], drainMountQueue: () => [], runDestroyFns: () => {} }
    );
    assert.equal(globalThis.__d_lifecycle_pushScope, mockPush);
  });
});
