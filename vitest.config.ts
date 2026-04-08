import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'apps/api/vitest.config.ts',
      'packages/cli/vitest.config.ts',
      'packages/core/vitest.config.ts',
      'packages/css/vitest.config.ts',
      'packages/essence-spec/vitest.config.ts',
      'packages/mcp-server/vitest.config.ts',
      'packages/registry/vitest.config.ts',
      'packages/vite-plugin/vitest.config.ts',
    ],
  },
});
