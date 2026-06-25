import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export interface DetectedProject {
  framework:
    | 'react'
    | 'vue'
    | 'svelte'
    | 'angular'
    | 'solid'
    | 'nextjs'
    | 'nuxt'
    | 'astro'
    | 'html'
    | 'unknown';
  version?: string;
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
  hasTypeScript: boolean;
  hasTailwind: boolean;
  existingRuleFiles: string[];
  existingEssence: boolean;
  projectRoot: string;
}

interface PackageJson {
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const RULE_FILES = [
  'CLAUDE.md',
  '.claude/rules',
  '.cursorrules',
  '.cursor/rules',
  'AGENTS.md',
  'GEMINI.md',
  'copilot-instructions.md',
  '.github/copilot-instructions.md',
  '.windsurfrules',
];

const STATIC_HTML_ENTRY_FILES = [
  'index.html',
  'docs/index.html',
  'src/index.html',
  'public/index.html',
  'dist/index.html',
];
const STATIC_HTML_ROUTE_DIRS = ['demos', 'examples'];

function hasAnyFile(projectRoot: string, relPaths: string[]): boolean {
  return relPaths.some((relPath) => existsSync(join(projectRoot, relPath)));
}

function hasStaticHtmlSurface(projectRoot: string): boolean {
  if (hasAnyFile(projectRoot, STATIC_HTML_ENTRY_FILES)) return true;
  return STATIC_HTML_ROUTE_DIRS.some((dir) => existsSync(join(projectRoot, dir, 'index.html')));
}

function readPackageJson(dir: string): PackageJson | null {
  const path = join(dir, 'package.json');
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as PackageJson;
  } catch {
    return null;
  }
}

function packageManagerFromName(name?: string): DetectedProject['packageManager'] {
  if (name === 'pnpm' || name === 'yarn' || name === 'bun' || name === 'npm') return name;
  return 'unknown';
}

function detectPackageManager(projectRoot: string): DetectedProject['packageManager'] {
  let current = projectRoot;
  while (true) {
    const pkg = readPackageJson(current);
    const declared = packageManagerFromName(pkg?.packageManager?.split('@')[0]);
    if (declared !== 'unknown') return declared;

    if (existsSync(join(current, 'pnpm-lock.yaml'))) return 'pnpm';
    if (existsSync(join(current, 'yarn.lock'))) return 'yarn';
    if (existsSync(join(current, 'bun.lockb'))) return 'bun';
    if (existsSync(join(current, 'package-lock.json'))) return 'npm';

    const parent = dirname(current);
    if (parent === current) return 'unknown';
    current = parent;
  }
}

/**
 * Detect project configuration from the file system.
 * Scans for framework, package manager, TypeScript, Tailwind, and existing rule files.
 */
export function detectProject(projectRoot: string = process.cwd()): DetectedProject {
  const result: DetectedProject = {
    framework: 'unknown',
    packageManager: 'unknown',
    hasTypeScript: false,
    hasTailwind: false,
    existingRuleFiles: [],
    existingEssence: false,
    projectRoot,
  };

  // Check for existing essence file
  result.existingEssence = existsSync(join(projectRoot, 'decantr.essence.json'));

  // Check for existing rule files
  for (const ruleFile of RULE_FILES) {
    if (existsSync(join(projectRoot, ruleFile))) {
      result.existingRuleFiles.push(ruleFile);
    }
  }

  result.packageManager = detectPackageManager(projectRoot);

  // Check for TypeScript
  result.hasTypeScript = existsSync(join(projectRoot, 'tsconfig.json'));

  // Check for Tailwind
  result.hasTailwind =
    existsSync(join(projectRoot, 'tailwind.config.js')) ||
    existsSync(join(projectRoot, 'tailwind.config.ts')) ||
    existsSync(join(projectRoot, 'tailwind.config.mjs')) ||
    existsSync(join(projectRoot, 'tailwind.config.cjs'));

  // Detect framework from config files first (more specific)
  if (
    existsSync(join(projectRoot, 'next.config.js')) ||
    existsSync(join(projectRoot, 'next.config.ts')) ||
    existsSync(join(projectRoot, 'next.config.mjs'))
  ) {
    result.framework = 'nextjs';
    result.version = getPackageVersion(projectRoot, 'next');
    return result;
  }

  if (
    existsSync(join(projectRoot, 'nuxt.config.js')) ||
    existsSync(join(projectRoot, 'nuxt.config.ts'))
  ) {
    result.framework = 'nuxt';
    result.version = getPackageVersion(projectRoot, 'nuxt');
    return result;
  }

  if (
    existsSync(join(projectRoot, 'astro.config.mjs')) ||
    existsSync(join(projectRoot, 'astro.config.ts'))
  ) {
    result.framework = 'astro';
    result.version = getPackageVersion(projectRoot, 'astro');
    return result;
  }

  if (
    existsSync(join(projectRoot, 'svelte.config.js')) ||
    existsSync(join(projectRoot, 'svelte.config.ts'))
  ) {
    result.framework = 'svelte';
    result.version = getPackageVersion(projectRoot, 'svelte');
    return result;
  }

  if (existsSync(join(projectRoot, 'angular.json'))) {
    result.framework = 'angular';
    result.version = getPackageVersion(projectRoot, '@angular/core');
    return result;
  }

  // Fall back to package.json dependencies
  const packageJsonPath = join(projectRoot, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps.next) {
        result.framework = 'nextjs';
        result.version = deps.next.replace(/^\^|~/, '');
      } else if (deps.nuxt) {
        result.framework = 'nuxt';
        result.version = deps.nuxt.replace(/^\^|~/, '');
      } else if (deps.astro) {
        result.framework = 'astro';
        result.version = deps.astro.replace(/^\^|~/, '');
      } else if (deps.svelte) {
        result.framework = 'svelte';
        result.version = deps.svelte.replace(/^\^|~/, '');
      } else if (deps['@angular/core']) {
        result.framework = 'angular';
        result.version = deps['@angular/core'].replace(/^\^|~/, '');
      } else if (deps['solid-js']) {
        result.framework = 'solid';
        result.version = deps['solid-js'].replace(/^\^|~/, '');
      } else if (deps.vue) {
        result.framework = 'vue';
        result.version = deps.vue.replace(/^\^|~/, '');
      } else if (deps.react) {
        result.framework = 'react';
        result.version = deps.react.replace(/^\^|~/, '');
      }
    } catch {
      // Invalid package.json, continue with unknown
    }
  }

  // Check for framework-neutral static HTML surfaces, including package-managed legacy apps.
  if (result.framework === 'unknown') {
    if (hasStaticHtmlSurface(projectRoot)) {
      result.framework = 'html';
    }
  }

  return result;
}

function getPackageVersion(projectRoot: string, packageName: string): string | undefined {
  const packageJsonPath = join(projectRoot, 'package.json');
  if (!existsSync(packageJsonPath)) return undefined;

  try {
    const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const version = deps[packageName];
    return version?.replace(/^\^|~/, '');
  } catch {
    return undefined;
  }
}

/**
 * Get recommendations based on detected project.
 */
export function getRecommendations(detected: DetectedProject): {
  suggestedShell: string;
  suggestedGuardMode: 'creative' | 'guided' | 'strict';
  warnings: string[];
} {
  const warnings: string[] = [];
  let suggestedShell = 'sidebar-main';
  let suggestedGuardMode: 'creative' | 'guided' | 'strict' = 'guided';

  // Existing essence means we should be more careful
  if (detected.existingEssence) {
    warnings.push('Existing decantr.essence.json found. Running init will overwrite it.');
  }

  // SSR frameworks suggest different shells
  if (
    detected.framework === 'nextjs' ||
    detected.framework === 'nuxt' ||
    detected.framework === 'astro'
  ) {
    suggestedShell = 'top-nav-main';
  }

  // Existing rule files - useful context
  if (detected.existingRuleFiles.length > 0) {
    warnings.push(`Found existing AI rule files: ${detected.existingRuleFiles.join(', ')}`);
  }

  // For mature projects (existing essence), suggest guided mode
  if (detected.existingEssence) {
    suggestedGuardMode = 'guided';
  }

  return { suggestedShell, suggestedGuardMode, warnings };
}

/**
 * Format detection results for display.
 */
export function formatDetection(detected: DetectedProject): string {
  const lines: string[] = [];

  if (detected.framework !== 'unknown') {
    const version = detected.version ? ` ${detected.version}` : '';
    lines.push(`Framework: ${detected.framework}${version}`);
  }

  if (detected.packageManager !== 'unknown') {
    lines.push(`Package manager: ${detected.packageManager}`);
  }

  if (detected.hasTypeScript) {
    lines.push('TypeScript: yes');
  }

  if (detected.hasTailwind) {
    lines.push('Tailwind CSS: yes');
  }

  if (detected.existingRuleFiles.length > 0) {
    lines.push(`AI rule files: ${detected.existingRuleFiles.join(', ')}`);
  }

  if (detected.existingEssence) {
    lines.push('Existing essence: yes');
  }

  return lines.join('\n');
}
