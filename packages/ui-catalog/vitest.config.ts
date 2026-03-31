import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@decantr/ui': resolve(__dirname, '../ui/src'),
      '@decantr/css': resolve(__dirname, '../css/src'),
      '@decantr/ui-chart': resolve(__dirname, '../ui-chart/src'),
    },
  },
});
