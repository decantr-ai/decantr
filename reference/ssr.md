# Server-Side Rendering (SSR)

Decantr supports server-side rendering via a dedicated `decantr/ssr` module that works in pure Node.js without DOM globals.

## When to Use SSR

- **SEO**: Search engines need HTML content to index pages
- **Initial load performance**: Users see content before JavaScript loads
- **Social sharing**: Open Graph scrapers need static HTML
- **Accessibility**: Content available before JS executes

## Architecture

The SSR module is a **separate entry point** that never imports `document` at module level. It provides SSR-safe versions of Decantr's core primitives:

| Client | SSR |
|--------|-----|
| `h(tag, props, ...children)` → HTMLElement | `ssrH(tag, props, ...children)` → VNode |
| `text(getter)` → reactive Text node | `ssrText(getter)` → TextVNode (evaluated once) |
| `cond(pred, trueFn, falseFn)` → reactive branch | `ssrCond(pred, trueFn, falseFn)` → static branch |
| `list(items, keyFn, renderFn)` → reactive list | `ssrList(items, keyFn, renderFn)` → static list |
| `css(...atoms)` → class string + DOM injection | `ssrCss(...atoms)` → class string only |
| `onMount(fn)` → runs after mount | `ssrOnMount(fn)` → no-op |
| `onDestroy(fn)` → runs on teardown | `ssrOnDestroy(fn)` → no-op |

## Quick Start

### Server

```js
import { renderToString } from 'decantr/ssr';
import { ssrH, ssrText, ssrCond, ssrList, ssrCss } from 'decantr/ssr';
import { createSignal } from 'decantr/state';

function App() {
  const [count] = createSignal(0);
  return ssrH('div', { class: ssrCss('_flex _col _gap4 _p6') },
    ssrH('h1', null, 'Hello from SSR'),
    ssrH('p', null, ssrText(() => `Count: ${count()}`))
  );
}

const html = renderToString(() => App());
// => '<div data-d-id="0" class="_flex _col _gap4 _p6"><h1 data-d-id="1">Hello from SSR</h1>...'
```

### Client (Hydration)

```js
import { hydrate, installHydrationRuntime } from 'decantr/ssr';
import { createEffect } from 'decantr/state';
import { pushScope, popScope, drainMountQueue, runDestroyFns } from 'decantr/core';
import { h, text, cond, list, onMount } from 'decantr/core';

// Install runtime once before hydrating
installHydrationRuntime(
  { createEffect },
  { pushScope, popScope, drainMountQueue, runDestroyFns }
);

// Hydrate — reuses existing DOM, attaches event listeners + signal bindings
hydrate(document.getElementById('app'), () => App());
```

## API Reference

### `renderToString(component)`

Renders a component function to an HTML string.

- Signals are read once without creating subscriptions
- Effects are not created
- `onMount`/`onDestroy` callbacks are ignored
- Each element gets a `data-d-id` attribute for hydration matching
- Returns a complete HTML string

```js
const html = renderToString(() => App());
res.send(`<!DOCTYPE html><html><body><div id="app">${html}</div></body></html>`);
```

### `renderToStream(component)`

Same as `renderToString` but returns a `ReadableStream` that yields HTML chunks incrementally. Useful for large pages where you want to start sending HTML before the entire tree is serialized.

```js
const stream = renderToStream(() => App());

// Node.js HTTP response
const reader = stream.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  res.write(value);
}
res.end();

// Or pipe to a Response (Deno, Bun, edge functions)
return new Response(stream, {
  headers: { 'Content-Type': 'text/html' }
});
```

### `hydrate(root, component)`

Walks the existing server-rendered DOM and attaches:
- Event listeners from component props
- Signal subscriptions for reactive text/attribute updates
- Conditional (`cond`) and list (`list`) reactivity
- `onMount` callbacks

The existing DOM is **reused**, not recreated. Matching is done by position (depth-first tree walk), not by `data-d-id`.

```js
hydrate(document.getElementById('app'), () => App());
```

### `installHydrationRuntime(stateMod, lifecycleMod)`

Must be called once on the client before `hydrate()`. Provides the reactive runtime:

```js
installHydrationRuntime(
  { createEffect },                    // from decantr/state
  { pushScope, popScope, drainMountQueue, runDestroyFns }  // from decantr/core
);
```

### `isSSR()`

Returns `true` during `renderToString`/`renderToStream` execution, `false` otherwise. Use this to conditionally skip browser-only code:

```js
function App() {
  if (!isSSR()) {
    // Browser-only initialization
    window.addEventListener('resize', handleResize);
  }
  return ssrH('div', null, 'content');
}
```

## Signal State During SSR

During SSR, signals are **evaluated once** without creating reactive subscriptions:

```js
const [count, setCount] = createSignal(0);

renderToString(() => {
  // count() reads the current value (0) but does NOT subscribe
  return ssrH('span', null, ssrText(() => count()));
});

setCount(5);
// The rendered HTML still shows "0" — no reactive updates during SSR
```

This is by design: SSR produces a static snapshot of your UI. Reactivity only activates after hydration on the client.

## Limitations

1. **No browser APIs during SSR**: `window`, `document`, `localStorage`, `fetch` (unless polyfilled), `requestAnimationFrame` are not available
2. **No effects**: `createEffect` callbacks are not executed during SSR
3. **No lifecycle**: `onMount`/`onDestroy` are no-ops during SSR
4. **No DOM manipulation**: Components must use `ssrH`/`ssrText`/`ssrCond`/`ssrList` instead of `h`/`text`/`cond`/`list`
5. **No Portals**: `Portal` components are not supported in SSR
6. **Static routing**: The router must be configured to resolve the correct page for the request URL before calling `renderToString`
7. **CSS is not injected**: The atomic CSS runtime does not inject styles during SSR. Include your CSS in the HTML shell or use build-time extraction

## Hydration Mismatch

If the SSR HTML doesn't match the client-side render, hydration will still work but may produce visual glitches. Common causes:

- Different signal values between server and client
- Browser-only branches (`if (typeof window !== 'undefined')`)
- Date/time-dependent content
- Random values

Guard against mismatches by ensuring the component produces identical output for the same inputs on both server and client.

## Integration Example: Express

```js
import express from 'express';
import { renderToString, ssrH, ssrText, ssrCss } from 'decantr/ssr';
import { createSignal } from 'decantr/state';

const app = express();

app.get('/', (req, res) => {
  const html = renderToString(() =>
    ssrH('div', { id: 'app', class: ssrCss('_flex _col _gap4') },
      ssrH('h1', null, 'Server-Rendered Decantr App'),
      ssrH('p', null, 'Hydration will activate interactivity.')
    )
  );

  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>My App</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div id="app">${html}</div>
  <script type="module" src="/client.js"></script>
</body>
</html>`);
});

app.listen(3000);
```

## Integration Example: Hono (Edge)

```js
import { Hono } from 'hono';
import { renderToStream, ssrH } from 'decantr/ssr';

const app = new Hono();

app.get('/', (c) => {
  const stream = renderToStream(() =>
    ssrH('div', { id: 'app' }, ssrH('h1', null, 'Edge SSR'))
  );
  return new Response(stream, {
    headers: { 'Content-Type': 'text/html' }
  });
});

export default app;
```
