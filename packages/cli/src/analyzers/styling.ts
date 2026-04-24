import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface StylingAnalysis {
  approach: 'tailwind' | 'css-modules' | 'css' | 'decantr-css' | 'unknown';
  configFile?: string;
  colors: Record<string, string>;
  darkMode: boolean;
  cssVariables: string[];
}

const TAILWIND_CONFIGS = [
  'tailwind.config.js',
  'tailwind.config.ts',
  'tailwind.config.mjs',
  'tailwind.config.cjs',
];

const GLOBALS_CSS_PATHS = [
  'src/app/globals.css',
  'app/globals.css',
  'src/styles/global.css',
  'src/styles/globals.css',
  'styles/globals.css',
  'src/index.css',
  'src/global.css',
];

const DECANTR_STYLE_PATHS = [
  'src/styles/tokens.css',
  'src/styles/treatments.css',
  'src/styles/global.css',
];

/**
 * Extract CSS custom properties from a CSS file.
 * Looks for --property: value declarations inside :root or other selectors.
 */
function extractCSSVariables(content: string): {
  colors: Record<string, string>;
  variables: string[];
} {
  const colors: Record<string, string> = {};
  const variables: string[] = [];

  // Match CSS custom property declarations
  const varRegex = /--([\w-]+)\s*:\s*([^;]+)/g;
  let match: RegExpExecArray | null;

  while ((match = varRegex.exec(content)) !== null) {
    const name = match[1];
    const value = match[2].trim();
    variables.push(`--${name}`);

    // Detect color values (hex, rgb, hsl, named colors used as theme tokens)
    const colorPatterns = [
      'primary',
      'secondary',
      'accent',
      'bg',
      'fg',
      'border',
      'success',
      'warning',
      'error',
      'surface',
      'muted',
    ];
    if (
      value.startsWith('#') ||
      value.startsWith('rgb') ||
      value.startsWith('hsl') ||
      colorPatterns.some((p) => name.includes(p))
    ) {
      colors[name] = value;
    }
  }

  return { colors, variables };
}

/**
 * Detect dark mode support.
 */
function detectDarkMode(projectRoot: string, cssContents: string[]): boolean {
  // Check CSS for dark mode selectors
  for (const cssContent of cssContents) {
    if (
      cssContent.includes('.dark') ||
      cssContent.includes('[data-theme="dark"]') ||
      cssContent.includes('prefers-color-scheme: dark') ||
      cssContent.includes('color-scheme: dark')
    ) {
      return true;
    }
  }

  // Check for dark class on html element in layout
  const layoutPaths = [
    'src/app/layout.tsx',
    'app/layout.tsx',
    'src/app/layout.jsx',
    'app/layout.jsx',
  ];

  for (const rel of layoutPaths) {
    const fullPath = join(projectRoot, rel);
    if (existsSync(fullPath)) {
      try {
        const layoutContent = readFileSync(fullPath, 'utf-8');
        if (
          layoutContent.includes('className="dark"') ||
          layoutContent.includes("className='dark'") ||
          layoutContent.includes('class="dark"')
        ) {
          return true;
        }
      } catch {
        // Ignore read errors
      }
    }
  }

  // Check for next-themes or other dark mode packages
  const pkgPath = join(projectRoot, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps['next-themes'] || allDeps['theme-toggle'] || allDeps['use-dark-mode']) {
        return true;
      }
    } catch {
      // Ignore
    }
  }

  const essencePath = join(projectRoot, 'decantr.essence.json');
  if (existsSync(essencePath)) {
    try {
      const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as {
        dna?: { theme?: { mode?: string } };
      };
      const mode = essence.dna?.theme?.mode;
      if (mode === 'dark' || mode === 'auto') {
        return true;
      }
    } catch {
      // Ignore
    }
  }

  return false;
}

/**
 * Scan for styling approach, CSS variables, colors, and dark mode.
 */
export function scanStyling(projectRoot: string): StylingAnalysis {
  let approach: StylingAnalysis['approach'] = 'unknown';
  let configFile: string | undefined;

  // Detect Tailwind
  for (const cfg of TAILWIND_CONFIGS) {
    if (existsSync(join(projectRoot, cfg))) {
      approach = 'tailwind';
      configFile = cfg;
      break;
    }
  }

  // If no config file, check if tailwindcss is a dependency (v4 uses CSS-based config)
  if (approach === 'unknown') {
    const pkgPath = join(projectRoot, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (allDeps['@decantr/css']) {
          approach = 'decantr-css';
          configFile = 'src/styles/tokens.css';
        }
        if (
          allDeps.tailwindcss ||
          allDeps['@tailwindcss/postcss'] ||
          allDeps['@tailwindcss/vite']
        ) {
          approach = 'tailwind';
        }
      } catch {
        // Ignore
      }
    }
  }

  const decantrStyleFiles = DECANTR_STYLE_PATHS.filter((rel) => existsSync(join(projectRoot, rel)));
  if (decantrStyleFiles.length >= 2) {
    approach = 'decantr-css';
    configFile = decantrStyleFiles.join(' + ');
  }

  // Find and parse globals CSS
  const cssContents: string[] = [];
  for (const rel of GLOBALS_CSS_PATHS) {
    const fullPath = join(projectRoot, rel);
    if (existsSync(fullPath)) {
      try {
        cssContents.push(readFileSync(fullPath, 'utf-8'));
      } catch {
        // Ignore
      }
    }
  }

  for (const rel of DECANTR_STYLE_PATHS) {
    if (GLOBALS_CSS_PATHS.includes(rel)) continue;
    const fullPath = join(projectRoot, rel);
    if (existsSync(fullPath)) {
      try {
        cssContents.push(readFileSync(fullPath, 'utf-8'));
      } catch {
        // Ignore
      }
    }
  }

  let colors: Record<string, string> = {};
  let cssVariables: string[] = [];

  for (const cssContent of cssContents) {
    const extracted = extractCSSVariables(cssContent);
    colors = { ...colors, ...extracted.colors };
    cssVariables.push(...extracted.variables);
  }

  cssVariables = [...new Set(cssVariables)];

  const darkMode = detectDarkMode(projectRoot, cssContents);

  if (approach === 'unknown' && cssContents.length > 0) {
    approach = 'css';
    configFile = GLOBALS_CSS_PATHS.find((rel) => existsSync(join(projectRoot, rel)));
  }

  return {
    approach,
    configFile,
    colors,
    darkMode,
    cssVariables,
  };
}
