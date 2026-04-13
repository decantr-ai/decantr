# @decantr/vite-plugin

Support status: `supported-secondary`  
Release channel: `experimental`

Experimental Vite plugin that surfaces Decantr guard violations in local development.

This package is not part of the main Decantr product nucleus and is excluded from the default release wave unless explicitly requested.

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

## License

MIT
