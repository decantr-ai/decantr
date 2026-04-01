import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'types': 'src/types.ts',
    'version': 'src/version.ts',
    'runtime/index': 'src/runtime/index.ts',
    'runtime/component': 'src/runtime/component.ts',
    'runtime/lifecycle': 'src/runtime/lifecycle.ts',
    'runtime/show': 'src/runtime/show.ts',
    'runtime/for': 'src/runtime/for.ts',
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
