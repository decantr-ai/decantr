# 08 — Build & Deploy

Ship your Decantr app to production.

## Production Build

```bash
npx decantr build
```

This generates an optimized `dist/` folder containing:

```
dist/
├── index.html         # HTML shell with hashed asset references
├── app.[hash].js      # Bundled JavaScript
├── app.[hash].css     # Extracted and purged CSS
├── chunks/            # Code-split lazy-loaded route chunks
└── assets/            # Static assets (images, fonts, etc.)
```

### What the Build Does

1. **Tree shaking** — Removes unused exports from all modules
2. **Code splitting** — Lazy-loaded routes become separate chunk files
3. **CSS purging** — Strips unused atomic CSS classes from the output
4. **Minification** — Compresses JavaScript and CSS
5. **Source maps** — V3 spec source maps for debugging production issues
6. **Incremental builds** — Skips rebuilding unchanged files via hash cache

### Build Output Report

After building, you see a size report:

```
Build complete ✓

  dist/app.a3f9c1.js       48.2 KB (raw)  /  11.8 KB (brotli)
  dist/app.a3f9c1.css       8.4 KB (raw)  /   2.1 KB (brotli)
  dist/chunks/home.js        3.1 KB (raw)  /   0.9 KB (brotli)
  dist/chunks/dashboard.js  12.7 KB (raw)  /   3.4 KB (brotli)
  ──────────────────────────────────────────────────────────
  Total                     72.4 KB (raw)  /  18.2 KB (brotli)
```

## Build Configuration

Configure build behavior in `decantr.config.json`:

```json
{
  "build": {
    "sizeBudget": {
      "jsRaw": 102400,
      "jsBrotli": 25600,
      "cssRaw": 51200,
      "totalBrotli": 51200,
      "chunkRaw": 51200
    }
  }
}
```

The build fails if any budget is exceeded, preventing accidental bloat.

### Build Flags

Override build options from the command line:

```bash
npx decantr build --no-sourcemap      # Skip source maps
npx decantr build --no-code-split     # Bundle everything into one file
npx decantr build --no-purge          # Keep all CSS atoms
npx decantr build --no-tree-shake     # Skip tree shaking
npx decantr build --no-incremental    # Full rebuild (ignore cache)
npx decantr build --no-analyze        # Skip bundle analysis
```

## Pre-Deploy Checks

Before deploying, validate your project:

```bash
# Validate your essence file
npx decantr validate

# Lint for common issues
npx decantr lint

# Run tests
npx decantr test
```

## Deploying to Static Hosts

Decantr builds to static files. Any static file host works.

### Netlify

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npx decantr build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The redirect rule is necessary for history-mode routing. Hash-mode routing works without it.

### Vercel

Create `vercel.json` in your project root:

```json
{
  "buildCommand": "npx decantr build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Cloudflare Pages

In the Cloudflare Pages dashboard:

- **Build command:** `npx decantr build`
- **Build output directory:** `dist`

For history-mode routing, create `dist/_redirects`:

```
/*  /index.html  200
```

### GitHub Pages

In your build step or CI workflow:

```bash
npx decantr build
```

If using hash-mode routing, deploy `dist/` directly. For history mode, you need a 404 fallback — copy `index.html` to `404.html`:

```bash
cp dist/index.html dist/404.html
```

### Docker / Nginx

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively (they have content hashes)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## SPA Routing Configuration

If you use **hash mode** (`mode: 'hash'`), no server configuration is needed. URLs look like `https://app.com/#/about`.

If you use **history mode** (`mode: 'history'`), the server must return `index.html` for all routes. Otherwise, navigating directly to `https://app.com/about` returns a 404.

The redirect/rewrite rules shown above handle this for each platform.

## Environment Considerations

### Base Path

If your app is served from a subdirectory, set the `base` option on the router:

```js
const router = createRouter({
  mode: 'history',
  base: '/my-app',
  routes: [/* ... */]
});
```

### API Proxy in Development

The dev server can proxy API requests. In `decantr.config.json`:

```json
{
  "dev": {
    "port": 3000,
    "proxy": {
      "/api": "http://localhost:8080"
    }
  }
}
```

## What You Have Built

Over the course of this tutorial, you have learned:

1. **Install** — Scaffold and run a project
2. **Pages** — Create pages with tag functions and atomic CSS
3. **Components** — Use 100+ built-in UI components
4. **Styling** — Apply atoms, switch styles and modes, use design tokens
5. **State** — Manage reactivity with signals, effects, memos, and stores
6. **Routing** — Navigate between pages with guards and lazy loading
7. **Data** — Fetch, cache, mutate, and sync data from APIs
8. **Deploy** — Build and ship to any static host

## Next Steps

- **[Cookbook: Dashboard](../cookbook/dashboard.md)** — Build a complete SaaS dashboard
- **[Cookbook: Auth](../cookbook/auth.md)** — Add authentication with login, guards, and token management
- **[Cookbook: Forms](../cookbook/forms.md)** — Advanced form handling with validation and field arrays
- **[Cookbook: i18n](../cookbook/i18n.md)** — Add multi-language support
- **[Cookbook: Data Fetching](../cookbook/data-fetching.md)** — Advanced patterns for REST APIs, optimistic updates, and WebSockets

---

Previous: [07 — Data Fetching](./07-data.md)
