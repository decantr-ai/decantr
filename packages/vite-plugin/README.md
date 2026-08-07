# @decantr/vite-plugin

Support status: `supported-secondary`  
Release channel: `experimental`

Experimental Vite plugin for local Decantr guard feedback during Vite development.

This package is useful when you already have a Vite app with `decantr.essence.json` and want faster feedback while editing. It is not part of the main Decantr product nucleus and is excluded from the default release wave unless explicitly requested.

Decantr 3.11 did not version-bump this experimental package solely for alignment. The release assigns it no feature investment; canonical Changed-UI Assurance, UI-surface authority, adoption truth, task context, verification, and report contracts belong in `@decantr/verifier` and the primary CLI/MCP/CI loop instead. Plugin feedback is not runtime proof and must not be promoted into a clean authority claim.

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
npx @decantr/cli adopt --yes
npx @decantr/cli doctor
npx @decantr/cli verify
```

The Vite plugin is a secondary local feedback surface after the project has an accepted Decantr contract.

## What It Is Not

- Not a replacement for `decantr ci`.
- Not a hosted telemetry or reporting surface.
- Not a general Vite design-system plugin.
- Not a stable default install for all Decantr projects yet.

## Security And Permissions

`@decantr/vite-plugin` is an opt-in experimental local development sidecar. It reads Vite project files while the dev server runs, but it does not write files, call hosted services, spawn processes, emit telemetry, or upload source. See [security permissions](https://decantr.ai/reference/security-permissions.md).

## License

MIT
