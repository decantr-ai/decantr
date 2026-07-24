import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { discoverProject, type ProjectDiscovery } from '@decantr/verifier';

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

/**
 * Detect project configuration from the file system.
 * Scans for framework, package manager, TypeScript, Tailwind, and existing rule files.
 */
export function detectProject(
  projectRoot: string = process.cwd(),
  discovery: ProjectDiscovery = discoverProject(projectRoot),
): DetectedProject {
  return {
    framework: discovery.project.framework,
    version: discovery.project.frameworkVersion ?? undefined,
    packageManager: discovery.project.packageManager,
    hasTypeScript: discovery.project.hasTypeScript,
    hasTailwind: discovery.project.hasTailwind,
    existingRuleFiles: discovery.assistant.ruleFiles,
    existingEssence: existsSync(join(projectRoot, 'decantr.essence.json')),
    projectRoot,
  };
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
