import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  publicDir: 'static',
  build: {
    outDir: '../../docs',
    emptyOutDir: false,
    assetsDir: 'homepage-assets',
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        flux: fileURLToPath(new URL('./flux/index.html', import.meta.url)),
      },
      output: {
        entryFileNames: 'homepage-assets/[name]-[hash].js',
        assetFileNames: 'homepage-assets/[name]-[hash][extname]',
      },
    },
  },
});
