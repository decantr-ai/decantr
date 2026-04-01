import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'runtime/index': 'src/runtime/index.ts',
    'state/index': 'src/state/index.ts',
    'state/scheduler': 'src/state/scheduler.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'esnext',
  splitting: false,
  sourcemap: true,
  external: ['@decantr/css'],
});
