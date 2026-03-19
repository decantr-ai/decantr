# 09 — Server-Side Rendering

Render your Decantr app on the server for SEO, faster initial loads, and social sharing.

## Why SSR?

Client-side SPAs start as an empty `<div>` — search engines, social scrapers, and users on slow connections all see nothing until JavaScript loads. SSR sends fully-rendered HTML from the server, then **hydrates** it on the client to restore interactivity.

| Benefit | How SSR Helps |
|---------|--------------|
| SEO | Crawlers index real HTML content |
| Performance | Users see content before JS loads (better FCP/LCP) |
| Social sharing | Open Graph scrapers get real `<meta>` tags |
| Accessibility | Content available before JS executes |

## The Dual-API Concept

Decantr's SSR module provides parallel primitives that produce VNodes instead of DOM elements:

| Client (browser) | SSR (server) | Purpose |
|-------------------|--------------|---------|
| `h()` | `ssrH()` | Create elements / VNodes |
| `text()` | `ssrText()` | Reactive text / static text |
| `cond()` | `ssrCond()` | Conditional rendering |
| `list()` | `ssrList()` | List rendering |
| `css()` | `ssrCss()` | Class string (no DOM injection) |
| `onMount()` | `ssrOnMount()` | No-op on server |
| `onDestroy()` | `ssrOnDestroy()` | No-op on server |

During SSR, signals are **read once** without creating subscriptions. Effects don't run. Lifecycle callbacks are no-ops. The result is a static HTML snapshot.

## Basic Example: renderToString

Let's render a simple page on the server.

```js
// server.js
import { renderToString, ssrH, ssrText, ssrCss } from 'decantr/ssr';
import { createSignal } from 'decantr/state';

function HomePage() {
  const [title] = createSignal('Welcome to Decantr');

  return ssrH('div', { class: ssrCss('_flex _col _gap6 _p6') },
    ssrH('h1', { class: ssrCss('_fgfg _text3xl _fontBold') },
      ssrText(() => title())
    ),
    ssrH('p', { class: ssrCss('_fgmuted') },
      'Server-rendered and ready to hydrate.'
    )
  );
}

const html = renderToString(() => HomePage());
console.log(html);
// <div data-d-id="0" class="_flex _col _gap6 _p6"><h1 data-d-id="1" ...>Welcome to Decantr</h1>...
```

Each element gets a `data-d-id` attribute for hydration matching. The signal value is captured once — no reactive subscriptions are created.

## Serving with Express

Wrap the rendered HTML in a full HTML shell:

```js
// server.js
import express from 'express';
import { renderToString, ssrH, ssrText, ssrCss } from 'decantr/ssr';
import { createSignal } from 'decantr/state';

const app = express();

// Serve your built client assets
app.use(express.static('dist'));

function HomePage() {
  const [title] = createSignal('Welcome');
  return ssrH('div', { id: 'app', class: ssrCss('_flex _col _gap6 _p6') },
    ssrH('h1', null, ssrText(() => title())),
    ssrH('p', null, 'Hydration will activate interactivity.')
  );
}

app.get('/', (req, res) => {
  const html = renderToString(() => HomePage());

  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>My App</title>
  <link rel="stylesheet" href="/app.css">
</head>
<body>
  <div id="app">${html}</div>
  <script type="module" src="/client.js"></script>
</body>
</html>`);
});

app.listen(3000, () => console.log('SSR server on :3000'));
```

## Streaming with renderToStream

For large pages, stream HTML chunks instead of building the entire string in memory:

```js
import { renderToStream, ssrH } from 'decantr/ssr';

app.get('/', async (req, res) => {
  const stream = renderToStream(() => App());
  const reader = stream.getReader();

  res.setHeader('Content-Type', 'text/html');
  res.write('<!DOCTYPE html><html><body><div id="app">');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }

  res.write('</div><script type="module" src="/client.js"></script></body></html>');
  res.end();
});
```

On edge runtimes (Deno, Bun, Cloudflare Workers), return the stream directly:

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

## Client Hydration

On the client, `hydrate()` walks the existing server-rendered DOM and attaches event listeners, signal subscriptions, and reactive effects — without recreating elements.

```js
// client.js
import { hydrate, installHydrationRuntime } from 'decantr/ssr';
import { createEffect } from 'decantr/state';
import { pushScope, popScope, drainMountQueue, runDestroyFns } from 'decantr/core';
import { h, text, cond, list, onMount } from 'decantr/core';

// Step 1: Install the reactive runtime (once, before any hydrate call)
installHydrationRuntime(
  { createEffect },
  { pushScope, popScope, drainMountQueue, runDestroyFns }
);

// Step 2: Hydrate — reuses existing DOM, attaches reactivity
hydrate(document.getElementById('app'), () => App());
```

After hydration, signals become live — updating a signal value updates the DOM, just like a client-rendered app.

## Universal Components with ssrComponent

Writing separate server and client versions of every component is tedious. `ssrComponent()` creates a wrapper that automatically delegates to SSR or client primitives:

```js
import { ssrComponent } from 'decantr/ssr';

const Greeting = ssrComponent((h, text, cond, list, css) => {
  return (props) => {
    return h('div', { class: css('_flex _col _gap4 _p4') },
      h('h2', null, text(() => `Hello, ${props.name}!`)),
      cond(
        () => props.showDetails,
        () => h('p', null, 'Here are the details...')
      )
    );
  };
});

// During SSR — uses ssrH, ssrText, ssrCond, ssrCss
renderToString(() => Greeting({ name: 'World', showDetails: true }));

// On the client — import h, text, cond, list, css normally
```

The factory function receives `(h, text, cond, list, css)` — during SSR these are the SSR versions, so the same component code works in both contexts.

## Browser-Only Guards with isSSR

Some code should only run in the browser (DOM APIs, `window`, `localStorage`). Use `isSSR()` to guard:

```js
import { isSSR } from 'decantr/ssr';

function App() {
  if (!isSSR()) {
    // Only runs in the browser
    window.addEventListener('resize', handleResize);
  }

  return ssrH('div', null, 'Works on server and client');
}
```

## Limitations

Keep these constraints in mind when writing SSR components:

1. **No browser APIs** — `window`, `document`, `localStorage`, `fetch` (unless polyfilled), `requestAnimationFrame` are unavailable on the server
2. **No effects** — `createEffect` callbacks don't execute during SSR
3. **No lifecycle** — `onMount`/`onDestroy` are no-ops
4. **No Portals** — `Portal` components are not supported in SSR
5. **CSS not injected** — The atomic CSS runtime doesn't inject styles during SSR; include CSS in your HTML shell or use build-time extraction
6. **Static routing** — Resolve the correct page for each request URL before calling `renderToString`

## Avoiding Hydration Mismatch

Hydration expects the client render to produce the same structure as the SSR output. Mismatches cause visual glitches. Common causes:

- Different signal initial values on server vs client
- Browser-only conditional branches (`if (typeof window !== 'undefined')`)
- Date/time or random values that differ between renders

Guard against this by ensuring components produce identical output for the same inputs on both sides.

## What You Have Built

You now know how to:

1. Render pages on the server with `renderToString` and `renderToStream`
2. Hydrate server HTML on the client with `hydrate` + `installHydrationRuntime`
3. Write universal components with `ssrComponent()`
4. Guard browser-only code with `isSSR()`

## Next Steps

- **[Cookbook: SSR](../cookbook/ssr.md)** — Production patterns: data prefetching, error handling, edge runtimes
- **[Cookbook: Dashboard](../cookbook/dashboard.md)** — Build a complete SaaS dashboard
- **[Cookbook: Auth](../cookbook/auth.md)** — Add authentication with login, guards, and token management

---

Previous: [08 — Build & Deploy](./08-deploy.md)
