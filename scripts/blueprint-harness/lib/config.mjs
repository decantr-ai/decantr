// Shared harness configuration.
// Keep in sync with the scaffold's auth key (src/lib/auth.ts in a scaffolded app).

export const AUTH_STORAGE_KEY = 'decantr_authenticated';

export const DEFAULT_ROUTES = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/#/login' },
  { name: 'primary', path: '/#/agents' },
  { name: 'secondary', path: '/#/marketplace' },
];

export const DEFAULT_VIEWPORTS = [
  { name: 'iphone-se', width: 375, height: 667, dpr: 2, mobile: true },
  { name: 'iphone-14pro', width: 393, height: 852, dpr: 3, mobile: true },
  { name: 'ipad', width: 768, height: 1024, dpr: 2, mobile: false },
  { name: 'desktop', width: 1440, height: 900, dpr: 2, mobile: false },
];

export const CHROME_BINARY =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Fallback search order for resolving the decantr CLI.
export const CLI_RESOLUTION = [
  { kind: 'local', path: 'packages/cli/dist/bin.js' },
  { kind: 'path', name: 'decantr' },
  { kind: 'npx', package: 'decantr@latest' },
];
