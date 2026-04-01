import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@decantr/ui': resolve(__dirname, '../../packages/ui/src'),
      '@decantr/ui-catalog': resolve(__dirname, '../../packages/ui-catalog/src'),
      '@decantr/ui-chart': resolve(__dirname, '../../packages/ui-chart/src'),
      '@decantr/css': resolve(__dirname, '../../packages/css/src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 4000,
    open: false,
  },
});
