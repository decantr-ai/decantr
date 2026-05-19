import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface StylingAnalysis {
  approach:
    | 'tailwind'
    | 'css-modules'
    | 'css'
    | 'decantr-css'
    | 'bootstrap'
    | 'mui'
    | 'chakra'
    | 'unknown';
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
  'src/styles/main.css',
  'src/styles/themes.css',
  'src/styles.css',
  'styles/globals.css',
  'styles/themes.css',
  'styles.css',
  'assets/css/main.css',
  'src/index.css',
  'src/app.css',
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
  const darkSelectors = [
    /\.dark\b/i,
    /html\.dark\b/i,
    /\[data-theme\s*=\s*["']dark["']\]/i,
    /prefers-color-scheme\s*:\s*dark/i,
    /color-scheme\s*:\s*dark/i,
  ];
  // Check CSS for dark mode selectors
  for (const cssContent of cssContents) {
    if (darkSelectors.some((selector) => selector.test(cssContent))) {
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

function collectCssFiles(projectRoot: string): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  const add = (path: string) => {
    if (seen.has(path)) return;
    if (!existsSync(join(projectRoot, path))) return;
    seen.add(path);
    ordered.push(path);
  };

  for (const rel of GLOBALS_CSS_PATHS) add(rel);
  for (const rel of DECANTR_STYLE_PATHS) add(rel);

  const roots = ['src/styles', 'styles', 'assets/css', 'src/app', 'app'];
  const visit = (dir: string) => {
    const absolute = join(projectRoot, dir);
    if (!existsSync(absolute)) return;
    let entries: string[];
    try {
      entries = readdirSync(absolute);
    } catch {
      return;
    }
    for (const entry of entries) {
      const child = join(absolute, entry);
      let stat: ReturnType<typeof statSync>;
      try {
        stat = statSync(child);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue;
        visit(relative(projectRoot, child).replace(/\\/g, '/'));
      } else if (stat.isFile() && /\.css$/i.test(entry)) {
        add(relative(projectRoot, child).replace(/\\/g, '/'));
      }
    }
  };
  for (const root of roots) visit(root);

  return ordered.slice(0, 80);
}

/**
 * Scan for styling approach, CSS variables, colors, and dark mode.
 */
export function scanStyling(projectRoot: string): StylingAnalysis {
  let approach: StylingAnalysis['approach'] = 'unknown';
  let configFile: string | undefined;
  let packageDeps: Record<string, string> = {};

  const pkgPath = join(projectRoot, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      packageDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    } catch {
      packageDeps = {};
    }
  }

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
    if (packageDeps['@decantr/css']) {
      approach = 'decantr-css';
      configFile = 'src/styles/tokens.css';
    }
    if (
      packageDeps.tailwindcss ||
      packageDeps['@tailwindcss/postcss'] ||
      packageDeps['@tailwindcss/vite']
    ) {
      approach = 'tailwind';
      configFile = configFile ?? 'package.json';
    }
  }

  if (approach === 'unknown') {
    if (packageDeps.bootstrap || packageDeps['react-bootstrap']) {
      approach = 'bootstrap';
      configFile = 'package.json';
    } else if (
      packageDeps['@mui/material'] ||
      packageDeps['@mui/system'] ||
      packageDeps['@mui/joy']
    ) {
      approach = 'mui';
      configFile = 'package.json';
    } else if (
      packageDeps['@chakra-ui/react'] ||
      packageDeps['@chakra-ui/vue-next'] ||
      packageDeps['@chakra-ui/system']
    ) {
      approach = 'chakra';
      configFile = 'package.json';
    }
  }

  const decantrStyleFiles = DECANTR_STYLE_PATHS.filter((rel) => existsSync(join(projectRoot, rel)));
  if (decantrStyleFiles.length >= 2) {
    approach = 'decantr-css';
    configFile = decantrStyleFiles.join(' + ');
  }

  // Find and parse app CSS. Brownfield projects often keep theme files outside
  // canonical globals names, so include shallow style directories as evidence.
  const cssContents: string[] = [];
  const cssFiles = collectCssFiles(projectRoot);
  for (const rel of cssFiles) {
    const fullPath = join(projectRoot, rel);
    try {
      cssContents.push(readFileSync(fullPath, 'utf-8'));
    } catch {
      // Ignore
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
    configFile = cssFiles[0];
  }

  return {
    approach,
    configFile,
    colors,
    darkMode,
    cssVariables,
  };
}
