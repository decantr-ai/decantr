import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../../docs',
    emptyOutDir: false,
    assetsDir: 'homepage-assets',
    rollupOptions: {
      output: {
        entryFileNames: 'homepage-assets/home.js',
        assetFileNames: 'homepage-assets/home.[ext]',
      },
    },
  },
});
