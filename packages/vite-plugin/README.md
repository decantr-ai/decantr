# @decantr/vite-plugin

Support status: `supported-secondary`  
Release channel: `experimental`

Experimental Vite plugin for local Decantr guard feedback during Vite development.

This package is useful when you already have a Vite app with `decantr.essence.json` and want faster feedback while editing. It is not part of the main Decantr product nucleus and is excluded from the default release wave unless explicitly requested.

## Install

```bash
npm install -D @decantr/vite-plugin
```

## Usage

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { decantrPlugin } from '@decantr/vite-plugin';

export default defineConfig({
  plugins: [react(), decantrPlugin()],
});
```

By default the plugin watches `decantr.essence.json` and re-runs Decantr guard checks as source files change.

## Recommended First

Most teams should start with the CLI:

```bash
npx @decantr/cli analyze
npx @decantr/cli init --existing --accept-proposal
npx @decantr/cli health
```

The Vite plugin is a secondary local feedback surface after the project has an accepted Decantr contract.

## What It Is Not

- Not a replacement for `decantr health --ci`.
- Not a hosted telemetry or reporting surface.
- Not a general Vite design-system plugin.
- Not a stable default install for all Decantr projects yet.

## License

MIT
