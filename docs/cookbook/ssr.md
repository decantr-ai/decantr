# Cookbook: Server-Side Rendering (SSR)

Production-ready SSR patterns for Decantr apps.

## Express Integration

A complete Express SSR server with static asset serving and route handling:

```js
// server.js
import express from 'express';
import { renderToString, ssrH, ssrText, ssrCss, ssrCond, ssrList, isSSR } from 'decantr/ssr';
import { createSignal } from 'decantr/state';

const app = express();

// Serve built client assets
app.use('/assets', express.static('dist'));

// Page components
function HomePage() {
  const [title] = createSignal('Welcome');
  return ssrH('div', { class: ssrCss('_flex _col _gap6 _p6 _flex1') },
    ssrH('h1', { class: ssrCss('_fgfg _text3xl _fontBold') }, ssrText(() => title())),
    ssrH('p', { class: ssrCss('_fgmuted') }, 'Server-rendered with Decantr.')
  );
}

function AboutPage() {
  return ssrH('div', { class: ssrCss('_flex _col _gap4 _p6') },
    ssrH('h1', null, 'About'),
    ssrH('p', null, 'This page was rendered on the server.')
  );
}

// Route → component map
const routes = {
  '/': HomePage,
  '/about': AboutPage,
};

// HTML shell template
function htmlShell(content, title = 'My App') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link rel="stylesheet" href="/assets/app.css">
</head>
<body>
  <div id="app">${content}</div>
  <script type="module" src="/assets/client.js"></script>
</body>
</html>`;
}

// SSR route handler
app.get('*', (req, res) => {
  const Component = routes[req.path];
  if (!Component) {
    res.status(404).send(htmlShell('<h1>404 Not Found</h1>', '404'));
    return;
  }

  try {
    const html = renderToString(() => Component());
    res.send(htmlShell(html));
  } catch (err) {
    console.error('SSR error:', err);
    res.status(500).send(htmlShell('<h1>Server Error</h1>', 'Error'));
  }
});

app.listen(3000, () => console.log('SSR server running on :3000'));
```

## Edge Runtime Integration (Hono / Cloudflare Workers)

Use `renderToStream` for edge runtimes that support the Web Streams API:

```js
// worker.js
import { Hono } from 'hono';
import { renderToStream, ssrH, ssrText, ssrCss } from 'decantr/ssr';
import { createSignal } from 'decantr/state';

const app = new Hono();

function HomePage() {
  const [title] = createSignal('Edge SSR');
  return ssrH('html', { lang: 'en' },
    ssrH('head', null,
      ssrH('meta', { charset: 'utf-8' }),
      ssrH('title', null, 'My App'),
      ssrH('link', { rel: 'stylesheet', href: '/app.css' })
    ),
    ssrH('body', null,
      ssrH('div', { id: 'app', class: ssrCss('_flex _col _gap6 _p6') },
        ssrH('h1', null, ssrText(() => title())),
        ssrH('p', null, 'Rendered at the edge.')
      ),
      ssrH('script', { type: 'module', src: '/client.js' })
    )
  );
}

app.get('/', (c) => {
  const stream = renderToStream(() => HomePage());
  return new Response(stream, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
});

export default app;
```

## Data Prefetching

Fetch data on the server, serialize it into the HTML, and reuse it during hydration to avoid a redundant client fetch:

```js
// server.js — fetch data, render with it, embed state
app.get('/users', async (req, res) => {
  // 1. Fetch data on the server
  const response = await fetch('https://api.example.com/users');
  const users = await response.json();

  // 2. Render the component with prefetched data
  function UsersPage() {
    return ssrH('div', { class: ssrCss('_flex _col _gap4 _p6') },
      ssrH('h1', null, 'Users'),
      ssrList(
        () => users,
        (u) => u.id,
        (user) => ssrH('div', { class: ssrCss('_flex _gap2 _p2 _bgmuted _r2') },
          ssrH('span', { class: ssrCss('_fontBold') }, user.name),
          ssrH('span', { class: ssrCss('_fgmuted') }, user.email)
        )
      )
    );
  }

  const html = renderToString(() => UsersPage());

  // 3. Embed the prefetched data for the client to reuse
  res.send(`<!DOCTYPE html>
<html>
<head><title>Users</title><link rel="stylesheet" href="/app.css"></head>
<body>
  <div id="app">${html}</div>
  <script>window.__PREFETCHED__ = ${JSON.stringify(users)};</script>
  <script type="module" src="/client.js"></script>
</body>
</html>`);
});
```

```js
// client.js — hydrate with the same data to avoid mismatch
import { hydrate, installHydrationRuntime } from 'decantr/ssr';
import { createEffect } from 'decantr/state';
import { pushScope, popScope, drainMountQueue, runDestroyFns } from 'decantr/core';

installHydrationRuntime(
  { createEffect },
  { pushScope, popScope, drainMountQueue, runDestroyFns }
);

// Use prefetched data so the initial render matches SSR output
const users = window.__PREFETCHED__ || [];
hydrate(document.getElementById('app'), () => UsersPage(users));
```

## Streaming with Early Flush

Send the HTML `<head>` immediately so the browser can start loading CSS/JS while the body is still rendering:

```js
app.get('/', async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // Flush head immediately — browser starts fetching CSS/JS
  res.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>My App</title>
  <link rel="stylesheet" href="/app.css">
</head>
<body><div id="app">`);

  // Stream the component body
  const stream = renderToStream(() => App());
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }

  res.write('</div><script type="module" src="/client.js"></script></body></html>');
  res.end();
});
```

## CSS Handling for SSR

During SSR, the atomic CSS runtime doesn't inject styles into the DOM. You have two options:

**Option 1: Build-time CSS extraction (recommended)**

Run `npx decantr build` — the build extracts all used atoms into a static CSS file. Reference it in your HTML shell:

```html
<link rel="stylesheet" href="/dist/app.css">
```

**Option 2: Inline critical CSS**

If you need CSS before the external stylesheet loads, inline the critical styles:

```js
import fs from 'fs';

const criticalCSS = fs.readFileSync('dist/app.css', 'utf8');

function htmlShell(content) {
  return `<!DOCTYPE html>
<html>
<head>
  <style>${criticalCSS}</style>
</head>
<body><div id="app">${content}</div></body>
</html>`;
}
```

## Error Handling During SSR

Wrap `renderToString` in try/catch to gracefully handle rendering errors:

```js
app.get('*', (req, res) => {
  try {
    const html = renderToString(() => App());
    res.send(htmlShell(html));
  } catch (err) {
    console.error('SSR render error:', err);

    // Option 1: Send a fallback page that loads the SPA client-side
    res.status(500).send(`<!DOCTYPE html>
<html>
<head><title>My App</title><link rel="stylesheet" href="/app.css"></head>
<body>
  <div id="app"></div>
  <script type="module" src="/client.js"></script>
</body>
</html>`);
  }
});
```

This fallback sends an empty shell — the client-side app boots normally as an SPA, so users still get a working app even if SSR fails.

## Route Resolution for SSR

For multi-page apps, map the request URL to the correct page component:

```js
import { createRouter } from 'decantr/router';

// Define routes the same way as in your client app
const routeMap = {
  '/': HomePage,
  '/about': AboutPage,
  '/users': UsersPage,
  '/users/:id': UserDetailPage,
};

// Simple route matcher
function matchRoute(url) {
  // Exact match first
  if (routeMap[url]) return { component: routeMap[url], params: {} };

  // Pattern match
  for (const [pattern, component] of Object.entries(routeMap)) {
    const paramNames = [];
    const regex = pattern.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    const match = url.match(new RegExp(`^${regex}$`));
    if (match) {
      const params = {};
      paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
      return { component, params };
    }
  }

  return null;
}

app.get('*', (req, res) => {
  const matched = matchRoute(req.path);
  if (!matched) {
    res.status(404).send(htmlShell('<h1>404</h1>'));
    return;
  }

  const html = renderToString(() => matched.component(matched.params));
  res.send(htmlShell(html));
});
```

## Avoiding Hydration Mismatches

Hydration expects identical structure between server and client renders. Follow these rules:

**1. Same initial signal values**

```js
// Server
const [count] = createSignal(0);  // starts at 0

// Client — must also start at 0, or use prefetched state
const [count] = createSignal(window.__STATE__?.count ?? 0);
```

**2. No browser-only branches in the initial render**

```js
// BAD — different output on server vs client
function App() {
  return ssrH('div', null,
    typeof window !== 'undefined'
      ? ssrH('span', null, 'Client')
      : ssrH('span', null, 'Server')
  );
}

// GOOD — use isSSR() but render the same structure
import { isSSR } from 'decantr/ssr';

function App() {
  // Defer browser-only logic to onMount (runs after hydration)
  if (!isSSR()) {
    onMount(() => {
      window.addEventListener('resize', handleResize);
    });
  }

  return ssrH('div', null, ssrH('span', null, 'Works everywhere'));
}
```

**3. Avoid time/random-dependent content in the initial render**

```js
// BAD — different on each render
ssrH('span', null, new Date().toLocaleString())

// GOOD — use a fixed value, update after hydration
const [time, setTime] = createSignal('--:--');
onMount(() => setTime(new Date().toLocaleString()));
```
