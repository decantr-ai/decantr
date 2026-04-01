import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

// Step 1: Vite build (bundles JS/CSS)
console.log('Building with Vite...');
execSync('npx vite build', { cwd: root, stdio: 'inherit' });

// Step 2: Copy index.html to all route paths for GitHub Pages
// GitHub Pages serves index.html for / but 404s on /components without a file
const routes = [
  '/components',
  '/charts',
  '/icons',
  '/css',
  '/getting-started',
  '/why',
];

for (const route of routes) {
  const routeDir = join(dist, route);
  if (!existsSync(routeDir)) mkdirSync(routeDir, { recursive: true });
  cpSync(join(dist, 'index.html'), join(routeDir, 'index.html'));
}

// Dynamic routes (/components/:slug, /charts/:slug) are handled client-side
// GitHub Pages 404 fallback will serve the root index.html via 404.html
cpSync(join(dist, 'index.html'), join(dist, '404.html'));

console.log('Build complete! Output in dist/');
