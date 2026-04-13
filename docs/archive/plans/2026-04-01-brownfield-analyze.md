# Phase 4: Brownfield Analysis — `decantr analyze`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `decantr analyze` command that scans an existing project and produces `.decantr/analysis.json` — a structured report the AI reads to propose an essence mapping. The CLI collects facts. The AI interprets them.

**Architecture:** Modular scanner pipeline — each scanner (framework, routes, components, styling, layout, features, dependencies) is a pure function that reads the filesystem and returns structured data. The command orchestrates all scanners and writes the combined report.

**Tech Stack:** TypeScript, Node.js fs, Vitest

---

## Design Summary

`decantr analyze` scans an existing project and outputs `.decantr/analysis.json`. It does NOT match archetypes, suggest patterns, or propose a theme — that's the AI's job. The CLI provides structured facts that make the AI's interpretation more accurate.

The existing `detectProject()` function already handles framework/package-manager detection. `decantr analyze` extends this with deeper scanning: routes, component inventory, styling analysis, layout heuristics, feature detection, and dependency categorization.

After analysis, the user asks the AI: "Set up Decantr for this project." The AI reads `.decantr/analysis.json`, searches the registry for matching archetypes, and proposes an essence. The user confirms. `decantr refresh` generates all derived files.

---

## File Map

| File | Change | Responsibility |
|------|--------|---------------|
| `packages/cli/src/commands/analyze.ts` | Create | Command handler: orchestrate scanners, write report |
| `packages/cli/src/analyzers/routes.ts` | Create | Extract routes from framework-specific config |
| `packages/cli/src/analyzers/components.ts` | Create | Inventory page/component files |
| `packages/cli/src/analyzers/styling.ts` | Create | Detect CSS approach, extract colors, dark mode |
| `packages/cli/src/analyzers/layout.ts` | Create | Detect shell patterns (sidebar, nav, footer) |
| `packages/cli/src/analyzers/features.ts` | Create | Detect features from routes, files, imports |
| `packages/cli/src/analyzers/dependencies.ts` | Create | Categorize package.json dependencies |
| `packages/cli/src/index.ts` | Modify | Register analyze command |
| `packages/cli/test/analyzers.test.ts` | Create | Tests for all analyzers |

---

## Task 1: Route Scanner

**Files:**
- Create: `packages/cli/src/analyzers/routes.ts`

- [ ] **Step 1: Create route scanner**

```ts
// packages/cli/src/analyzers/routes.ts

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface DetectedRoute {
  path: string;
  file: string;
  hasLayout: boolean;
}

export interface RouteAnalysis {
  strategy: 'app-router' | 'pages-router' | 'react-router' | 'file-based' | 'unknown';
  routes: DetectedRoute[];
}

export function analyzeRoutes(projectRoot: string, framework: string): RouteAnalysis {
  // Next.js App Router
  const appDir = findDir(projectRoot, ['app', 'src/app']);
  if (appDir && (framework === 'nextjs' || framework === 'react')) {
    const routes = scanAppRouter(projectRoot, appDir);
    return { strategy: 'app-router', routes };
  }

  // Next.js Pages Router
  const pagesDir = findDir(projectRoot, ['pages', 'src/pages']);
  if (pagesDir) {
    const routes = scanPagesRouter(projectRoot, pagesDir);
    return { strategy: 'pages-router', routes };
  }

  return { strategy: 'unknown', routes: [] };
}

function findDir(root: string, candidates: string[]): string | null {
  for (const dir of candidates) {
    const full = join(root, dir);
    if (existsSync(full) && statSync(full).isDirectory()) return full;
  }
  return null;
}

function scanAppRouter(projectRoot: string, appDir: string): DetectedRoute[] {
  const routes: DetectedRoute[] = [];

  function walk(dir: string, routePath: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    const hasPage = entries.some(e => e.name.startsWith('page.'));
    const hasLayout = entries.some(e => e.name.startsWith('layout.'));

    if (hasPage) {
      const pageFile = entries.find(e => e.name.startsWith('page.'))!;
      routes.push({
        path: routePath || '/',
        file: relative(projectRoot, join(dir, pageFile.name)),
        hasLayout,
      });
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      // Skip route groups (parenthesized), api routes, private folders
      const name = entry.name;
      if (name.startsWith('_') || name === 'api' || name === 'node_modules') continue;

      // Route groups don't add to the path
      const isGroup = name.startsWith('(') && name.endsWith(')');
      const nextPath = isGroup ? routePath : `${routePath}/${name}`;
      walk(join(dir, name), nextPath);
    }
  }

  walk(appDir, '');
  return routes;
}

function scanPagesRouter(projectRoot: string, pagesDir: string): DetectedRoute[] {
  const routes: DetectedRoute[] = [];

  function walk(dir: string, routePath: string) {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('_') || entry.name === 'api') continue;

      if (entry.isDirectory()) {
        walk(join(dir, entry.name), `${routePath}/${entry.name}`);
      } else if (entry.name.match(/\.(tsx?|jsx?)$/)) {
        const name = entry.name.replace(/\.(tsx?|jsx?)$/, '');
        const path = name === 'index' ? (routePath || '/') : `${routePath}/${name}`;
        routes.push({
          path,
          file: relative(projectRoot, join(dir, entry.name)),
          hasLayout: false,
        });
      }
    }
  }

  walk(pagesDir, '');
  return routes;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/cli/src/analyzers/routes.ts
git commit -m "feat(cli): add route scanner for brownfield analysis"
```

---

## Task 2: Component, Styling, Layout, Feature, and Dependency Scanners

**Files:**
- Create: `packages/cli/src/analyzers/components.ts`
- Create: `packages/cli/src/analyzers/styling.ts`
- Create: `packages/cli/src/analyzers/layout.ts`
- Create: `packages/cli/src/analyzers/features.ts`
- Create: `packages/cli/src/analyzers/dependencies.ts`

- [ ] **Step 1: Create component scanner**

```ts
// packages/cli/src/analyzers/components.ts

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface ComponentAnalysis {
  pageCount: number;
  componentCount: number;
  directories: string[];
}

export function analyzeComponents(projectRoot: string): ComponentAnalysis {
  const pageDirs = ['app', 'src/app', 'pages', 'src/pages'];
  const componentDirs = ['components', 'src/components', 'ui', 'src/ui'];
  const allDirs = [...pageDirs, ...componentDirs];

  let pageCount = 0;
  let componentCount = 0;
  const foundDirs: string[] = [];

  for (const dir of allDirs) {
    const full = join(projectRoot, dir);
    if (!existsSync(full) || !statSync(full).isDirectory()) continue;
    foundDirs.push(dir);
    const count = countFiles(full, /\.(tsx?|jsx?|vue|svelte)$/);
    if (pageDirs.includes(dir)) pageCount += count;
    else componentCount += count;
  }

  return { pageCount, componentCount, directories: foundDirs };
}

function countFiles(dir: string, pattern: RegExp): number {
  let count = 0;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules') continue;
    if (entry.isDirectory()) count += countFiles(join(dir, entry.name), pattern);
    else if (pattern.test(entry.name)) count++;
  }
  return count;
}
```

- [ ] **Step 2: Create styling scanner**

```ts
// packages/cli/src/analyzers/styling.ts

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface StylingAnalysis {
  approach: 'tailwind' | 'css-modules' | 'css-variables' | 'styled-components' | 'unknown';
  configFile?: string;
  colors: Record<string, string>;
  darkMode: boolean;
  cssVariables: string[];
}

export function analyzeStyling(projectRoot: string): StylingAnalysis {
  const result: StylingAnalysis = {
    approach: 'unknown',
    colors: {},
    darkMode: false,
    cssVariables: [],
  };

  // Tailwind detection
  const tailwindConfigs = ['tailwind.config.ts', 'tailwind.config.js', 'tailwind.config.mjs'];
  for (const config of tailwindConfigs) {
    if (existsSync(join(projectRoot, config))) {
      result.approach = 'tailwind';
      result.configFile = config;
      break;
    }
  }

  // CSS variable extraction from common CSS files
  const cssFiles = ['src/app/globals.css', 'app/globals.css', 'styles/globals.css', 'src/index.css'];
  for (const cssFile of cssFiles) {
    const full = join(projectRoot, cssFile);
    if (!existsSync(full)) continue;
    const content = readFileSync(full, 'utf-8');

    // Extract CSS custom properties
    const varMatches = content.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+)/g);
    for (const match of varMatches) {
      result.cssVariables.push(`--${match[1]}`);
      // Detect color values
      const value = match[2].trim();
      if (value.match(/^#[0-9a-fA-F]{3,8}$|^rgb|^hsl|^oklch/)) {
        const name = match[1].replace(/-/g, '_');
        result.colors[name] = value;
      }
    }

    // Dark mode detection
    if (content.includes('dark') || content.includes('color-scheme: dark')) {
      result.darkMode = true;
    }
  }

  // Package-based detection
  const pkgPath = join(projectRoot, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps['styled-components']) result.approach = 'styled-components';
    if (allDeps['tailwindcss'] && result.approach === 'unknown') result.approach = 'tailwind';
  }

  return result;
}
```

- [ ] **Step 3: Create layout scanner**

```ts
// packages/cli/src/analyzers/layout.ts

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface LayoutAnalysis {
  hasSidebar: boolean;
  hasTopNav: boolean;
  hasFooter: boolean;
  shellPattern: string;
}

export function analyzeLayout(projectRoot: string): LayoutAnalysis {
  const result: LayoutAnalysis = {
    hasSidebar: false,
    hasTopNav: false,
    hasFooter: false,
    shellPattern: 'unknown',
  };

  // Check root layout for structural clues
  const layoutFiles = ['app/layout.tsx', 'src/app/layout.tsx', 'app/layout.jsx', 'src/app/layout.jsx'];
  for (const file of layoutFiles) {
    const full = join(projectRoot, file);
    if (!existsSync(full)) continue;
    const content = readFileSync(full, 'utf-8').toLowerCase();
    if (content.includes('sidebar') || content.includes('side-bar') || content.includes('sidenav')) result.hasSidebar = true;
    if (content.includes('navbar') || content.includes('nav-bar') || content.includes('topnav') || content.includes('header')) result.hasTopNav = true;
    if (content.includes('footer')) result.hasFooter = true;
  }

  // Check for sidebar/nav component files
  const componentPatterns = [
    { pattern: /sidebar/i, field: 'hasSidebar' as const },
    { pattern: /nav/i, field: 'hasTopNav' as const },
    { pattern: /footer/i, field: 'hasFooter' as const },
  ];

  const componentDirs = ['components', 'src/components'];
  for (const dir of componentDirs) {
    const full = join(projectRoot, dir);
    if (!existsSync(full)) continue;
    try {
      const files = readFileSync(full, 'utf-8'); // won't work — need readdirSync
    } catch {}
    // Simple check: look for files with sidebar/nav/footer in name
    const { readdirSync } = require('node:fs');
    try {
      const files = readdirSync(full) as string[];
      for (const file of files) {
        for (const { pattern, field } of componentPatterns) {
          if (pattern.test(file)) result[field] = true;
        }
      }
    } catch {}
  }

  // Determine shell pattern
  if (result.hasSidebar && result.hasTopNav) result.shellPattern = 'sidebar-main';
  else if (result.hasSidebar) result.shellPattern = 'sidebar-main';
  else if (result.hasTopNav && result.hasFooter) result.shellPattern = 'top-nav-footer';
  else if (result.hasTopNav) result.shellPattern = 'top-nav-main';
  else result.shellPattern = 'full-bleed';

  return result;
}
```

- [ ] **Step 4: Create feature scanner**

```ts
// packages/cli/src/analyzers/features.ts

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface FeatureAnalysis {
  detected: string[];
  evidence: Record<string, string[]>;
}

const FEATURE_PATTERNS: Array<{ feature: string; filePatterns: RegExp[]; dirPatterns: string[] }> = [
  { feature: 'auth', filePatterns: [/login/i, /register/i, /sign-?in/i, /sign-?up/i, /auth/i], dirPatterns: ['auth', 'login'] },
  { feature: 'settings', filePatterns: [/settings/i, /preferences/i, /account/i], dirPatterns: ['settings'] },
  { feature: 'dashboard', filePatterns: [/dashboard/i, /analytics/i, /metrics/i], dirPatterns: ['dashboard'] },
  { feature: 'chat', filePatterns: [/chat/i, /message/i, /conversation/i], dirPatterns: ['chat'] },
  { feature: 'billing', filePatterns: [/billing/i, /pricing/i, /subscription/i, /payment/i], dirPatterns: ['billing', 'pricing'] },
  { feature: 'search', filePatterns: [/search/i], dirPatterns: ['search'] },
  { feature: 'notifications', filePatterns: [/notification/i, /alert/i], dirPatterns: ['notifications'] },
  { feature: 'admin', filePatterns: [/admin/i, /moderat/i], dirPatterns: ['admin'] },
];

export function analyzeFeatures(projectRoot: string): FeatureAnalysis {
  const detected: string[] = [];
  const evidence: Record<string, string[]> = {};

  // Scan page/route directories
  const scanDirs = ['app', 'src/app', 'pages', 'src/pages'];
  const allFiles: string[] = [];

  for (const dir of scanDirs) {
    const full = join(projectRoot, dir);
    if (!existsSync(full)) continue;
    collectFiles(full, allFiles, projectRoot);
  }

  for (const { feature, filePatterns, dirPatterns } of FEATURE_PATTERNS) {
    const matches: string[] = [];

    for (const file of allFiles) {
      for (const pattern of filePatterns) {
        if (pattern.test(file)) {
          matches.push(file);
          break;
        }
      }
    }

    // Check for feature directories
    for (const dir of dirPatterns) {
      for (const scanDir of scanDirs) {
        const full = join(projectRoot, scanDir, dir);
        if (existsSync(full)) matches.push(`${scanDir}/${dir}/`);
      }
    }

    if (matches.length > 0) {
      detected.push(feature);
      evidence[feature] = [...new Set(matches)];
    }
  }

  // Dark mode detection from package.json
  const pkgPath = join(projectRoot, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(require('node:fs').readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps['next-themes'] || allDeps['theme-toggles']) {
      detected.push('dark-mode');
      evidence['dark-mode'] = ['package.json (next-themes)'];
    }
  }

  return { detected, evidence };
}

function collectFiles(dir: string, files: string[], projectRoot: string) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, files, projectRoot);
    else files.push(full.replace(projectRoot + '/', ''));
  }
}
```

- [ ] **Step 5: Create dependency scanner**

```ts
// packages/cli/src/analyzers/dependencies.ts

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface DependencyAnalysis {
  ui: string[];
  auth: string[];
  db: string[];
  state: string[];
  styling: string[];
  other: string[];
}

const CATEGORIES: Record<string, RegExp[]> = {
  ui: [/radix/i, /shadcn/i, /lucide/i, /headless/i, /mui/i, /chakra/i, /mantine/i, /ant-design/i],
  auth: [/clerk/i, /auth0/i, /next-auth/i, /supabase.*auth/i, /passport/i],
  db: [/prisma/i, /drizzle/i, /neon/i, /supabase/i, /mongoose/i, /pg\b/i, /postgres/i, /redis/i, /upstash/i],
  state: [/zustand/i, /redux/i, /jotai/i, /recoil/i, /valtio/i, /mobx/i],
  styling: [/tailwind/i, /styled-components/i, /emotion/i, /sass\b/i, /less\b/i],
};

export function analyzeDependencies(projectRoot: string): DependencyAnalysis {
  const result: DependencyAnalysis = { ui: [], auth: [], db: [], state: [], styling: [], other: [] };

  const pkgPath = join(projectRoot, 'package.json');
  if (!existsSync(pkgPath)) return result;

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const allDeps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

  for (const dep of allDeps) {
    let categorized = false;
    for (const [category, patterns] of Object.entries(CATEGORIES)) {
      for (const pattern of patterns) {
        if (pattern.test(dep)) {
          (result as any)[category].push(dep);
          categorized = true;
          break;
        }
      }
      if (categorized) break;
    }
  }

  return result;
}
```

- [ ] **Step 6: Commit all scanners**

```bash
git add packages/cli/src/analyzers/
git commit -m "feat(cli): add brownfield project scanners (routes, components, styling, layout, features, deps)"
```

---

## Task 3: decantr analyze Command + Registration

**Files:**
- Create: `packages/cli/src/commands/analyze.ts`
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Create the analyze command**

```ts
// packages/cli/src/commands/analyze.ts

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { detectProject } from '../detect.js';
import { analyzeRoutes } from '../analyzers/routes.js';
import { analyzeComponents } from '../analyzers/components.js';
import { analyzeStyling } from '../analyzers/styling.js';
import { analyzeLayout } from '../analyzers/layout.js';
import { analyzeFeatures } from '../analyzers/features.js';
import { analyzeDependencies } from '../analyzers/dependencies.js';

export interface ProjectAnalysis {
  framework: string;
  version: string;
  packageManager: string;
  routing: ReturnType<typeof analyzeRoutes>;
  components: ReturnType<typeof analyzeComponents>;
  styling: ReturnType<typeof analyzeStyling>;
  layout: ReturnType<typeof analyzeLayout>;
  features: ReturnType<typeof analyzeFeatures>;
  dependencies: ReturnType<typeof analyzeDependencies>;
  analyzedAt: string;
}

export function cmdAnalyze() {
  const projectRoot = process.cwd();

  console.log('Analyzing project...\n');

  // Use existing framework detection
  const detected = detectProject(projectRoot);

  // Run all scanners
  const routing = analyzeRoutes(projectRoot, detected.framework);
  const components = analyzeComponents(projectRoot);
  const styling = analyzeStyling(projectRoot);
  const layout = analyzeLayout(projectRoot);
  const features = analyzeFeatures(projectRoot);
  const dependencies = analyzeDependencies(projectRoot);

  const analysis: ProjectAnalysis = {
    framework: detected.framework,
    version: detected.frameworkVersion || 'unknown',
    packageManager: detected.packageManager,
    routing,
    components,
    styling,
    layout,
    features,
    dependencies,
    analyzedAt: new Date().toISOString(),
  };

  // Write report
  const decantrDir = join(projectRoot, '.decantr');
  mkdirSync(decantrDir, { recursive: true });
  const reportPath = join(decantrDir, 'analysis.json');
  writeFileSync(reportPath, JSON.stringify(analysis, null, 2) + '\n');

  // Print summary
  console.log(`Framework:    ${analysis.framework} ${analysis.version}`);
  console.log(`Routes:       ${routing.routes.length} detected (${routing.strategy})`);
  console.log(`Components:   ${components.pageCount} pages, ${components.componentCount} components`);
  console.log(`Styling:      ${styling.approach}${styling.darkMode ? ' (dark mode)' : ''}`);
  console.log(`Layout:       ${layout.shellPattern}`);
  console.log(`Features:     ${features.detected.join(', ') || 'none detected'}`);
  console.log(`Dependencies: ${dependencies.ui.length} UI, ${dependencies.auth.length} auth, ${dependencies.db.length} DB`);
  console.log(`\nReport written to: .decantr/analysis.json`);
  console.log(`\nNext: Ask your AI assistant to read .decantr/analysis.json and set up Decantr.`);
  console.log(`  Example: "Read .decantr/analysis.json and create a decantr.essence.json for this project."`);
}
```

- [ ] **Step 2: Register in index.ts**

```ts
case 'analyze':
  cmdAnalyze();
  break;
```

Import: `import { cmdAnalyze } from './commands/analyze.js';`

- [ ] **Step 3: Update help text**

Add to help output:
```
decantr analyze         Scan existing project and produce analysis report
```

- [ ] **Step 4: Build and test**

```bash
pnpm --filter decantr run build
pnpm test
```

- [ ] **Step 5: Manual verification**

```bash
# Test on the web app (a real Next.js project)
cd /Users/davidaimi/projects/decantr-monorepo/apps/web
node ../../packages/cli/dist/bin.js analyze
cat .decantr/analysis.json | python3 -m json.tool | head -30
```

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/commands/analyze.ts packages/cli/src/index.ts
git commit -m "feat(cli): add decantr analyze command for brownfield projects"
```

---

## Task 4: Tests

**Files:**
- Create: `packages/cli/test/analyzers.test.ts`

- [ ] **Step 1: Write tests**

Test each scanner with a mock filesystem or by running against known project structures in the monorepo. The showcase project and web app are both real projects to test against.

Key tests:
1. Route scanner finds App Router routes in apps/web
2. Component scanner counts files correctly
3. Styling scanner detects Tailwind from config file
4. Layout scanner detects sidebar from component names
5. Feature scanner detects auth from login/register routes
6. Dependency scanner categorizes @clerk/nextjs as auth

- [ ] **Step 2: Run all tests**

```bash
pnpm test
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/test/analyzers.test.ts
git commit -m "test(cli): add brownfield analyzer tests"
```
