import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts', 'src/client.ts', 'src/content-types.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
});
