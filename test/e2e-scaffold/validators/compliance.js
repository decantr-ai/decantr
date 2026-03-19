/**
 * Compliance Validator
 *
 * Checks generated code against Decantr rules and best practices.
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// ─── Rules ───────────────────────────────────────────────────────────────────

const RULES = {
  'no-inline-css': {
    description: 'No inline styles allowed',
    severity: 'error',
    check: checkNoInlineCSS,
  },
  'use-atoms': {
    description: 'Use atom classes for styling',
    severity: 'warning',
    check: checkAtomsUsage,
  },
  'valid-imports': {
    description: 'Import from correct Decantr modules',
    severity: 'error',
    check: checkImports,
  },
  'no-foreign-frameworks': {
    description: 'No React/Vue/Svelte/Angular imports',
    severity: 'error',
    check: checkNoForeignFrameworks,
  },
  'essence-structure': {
    description: 'Essence.json follows schema',
    severity: 'error',
    check: checkEssenceStructure,
  },
  'pattern-registry': {
    description: 'Patterns should come from registry',
    severity: 'warning',
    check: checkPatternRegistry,
  },
  'component-registry': {
    description: 'Components should come from Decantr',
    severity: 'warning',
    check: checkComponentRegistry,
  },
};

// ─── Rule Implementations ────────────────────────────────────────────────────

async function checkNoInlineCSS(projectDir) {
  const violations = [];
  const srcDir = join(projectDir, 'src');

  if (!existsSync(srcDir)) return violations;

  const files = await readdir(srcDir, { recursive: true });

  for (const file of files.filter(f => f.endsWith('.js'))) {
    const content = await readFile(join(srcDir, file), 'utf-8');

    // Check for style= attributes
    const styleAttrMatches = content.match(/style\s*=\s*[{'"]/g);
    if (styleAttrMatches) {
      violations.push({
        rule: 'no-inline-css',
        file,
        message: `Found ${styleAttrMatches.length} inline style attributes`,
        severity: 'error',
      });
    }

    // Check for style: object patterns in h() calls
    const styleObjMatches = content.match(/style\s*:\s*\{/g);
    if (styleObjMatches) {
      violations.push({
        rule: 'no-inline-css',
        file,
        message: `Found ${styleObjMatches.length} style object patterns`,
        severity: 'error',
      });
    }
  }

  return violations;
}

async function checkAtomsUsage(projectDir) {
  const violations = [];
  const srcDir = join(projectDir, 'src');

  if (!existsSync(srcDir)) return violations;

  const files = await readdir(srcDir, { recursive: true });

  for (const file of files.filter(f => f.endsWith('.js'))) {
    const content = await readFile(join(srcDir, file), 'utf-8');

    // Count atom usage
    const atomMatches = content.match(/_[a-z][a-z0-9\[\]\/]*/g) || [];

    // Count raw CSS class names that should be atoms
    const rawCssPatterns = [
      /class(Name)?\s*[:=]\s*['"]([^_][a-z-]+)['"]/g, // Non-atom classes
      /flex|grid|padding|margin|gap|color|bg|text-/g, // Raw CSS-like names
    ];

    let rawCount = 0;
    for (const pattern of rawCssPatterns) {
      const matches = content.match(pattern);
      if (matches) rawCount += matches.length;
    }

    if (rawCount > atomMatches.length && rawCount > 5) {
      violations.push({
        rule: 'use-atoms',
        file,
        message: `Found ${rawCount} raw CSS references vs ${atomMatches.length} atoms`,
        severity: 'warning',
      });
    }
  }

  return violations;
}

async function checkImports(projectDir) {
  const violations = [];
  const srcDir = join(projectDir, 'src');

  if (!existsSync(srcDir)) return violations;

  const files = await readdir(srcDir, { recursive: true });

  const validModules = [
    'decantr/core',
    'decantr/state',
    'decantr/data',
    'decantr/router',
    'decantr/css',
    'decantr/components',
    'decantr/tags',
    'decantr/i18n',
    'decantr/icons',
    'decantr/ssr',
    'decantr/tannins/',
    'decantr/styles/',
  ];

  for (const file of files.filter(f => f.endsWith('.js'))) {
    const content = await readFile(join(srcDir, file), 'utf-8');

    // Find all decantr imports
    const importMatches = content.matchAll(/from\s+['"]decantr\/([^'"]+)['"]/g);

    for (const match of importMatches) {
      const modulePath = `decantr/${match[1]}`;
      const isValid = validModules.some(vm => modulePath.startsWith(vm));

      if (!isValid) {
        violations.push({
          rule: 'valid-imports',
          file,
          message: `Invalid import: ${modulePath}`,
          severity: 'error',
        });
      }
    }
  }

  return violations;
}

async function checkNoForeignFrameworks(projectDir) {
  const violations = [];
  const srcDir = join(projectDir, 'src');

  if (!existsSync(srcDir)) return violations;

  const files = await readdir(srcDir, { recursive: true });

  const foreignFrameworks = ['react', 'vue', 'svelte', 'angular', '@angular', 'solid-js', 'preact'];

  for (const file of files.filter(f => f.endsWith('.js'))) {
    const content = await readFile(join(srcDir, file), 'utf-8');

    for (const framework of foreignFrameworks) {
      const importMatch = content.match(new RegExp(`from\\s+['"]${framework}[/'"]`, 'g'));
      if (importMatch) {
        violations.push({
          rule: 'no-foreign-frameworks',
          file,
          message: `Found ${framework} import`,
          severity: 'error',
        });
      }
    }

    // Check for JSX syntax
    if (content.match(/<[A-Z][a-zA-Z]*[\s>]/)) {
      violations.push({
        rule: 'no-foreign-frameworks',
        file,
        message: 'JSX syntax detected - use Decantr h() or tags',
        severity: 'error',
      });
    }
  }

  return violations;
}

async function checkEssenceStructure(projectDir) {
  const violations = [];
  const essencePath = join(projectDir, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    violations.push({
      rule: 'essence-structure',
      file: 'decantr.essence.json',
      message: 'Missing essence.json',
      severity: 'error',
    });
    return violations;
  }

  try {
    const content = await readFile(essencePath, 'utf-8');
    const essence = JSON.parse(content);

    // Required fields
    if (!essence.version) {
      violations.push({
        rule: 'essence-structure',
        file: 'decantr.essence.json',
        message: 'Missing version field',
        severity: 'warning',
      });
    }

    // Must have either terroir or sections
    if (!essence.terroir && !essence.sections) {
      violations.push({
        rule: 'essence-structure',
        file: 'decantr.essence.json',
        message: 'Missing terroir or sections',
        severity: 'error',
      });
    }

    // Vintage structure
    if (essence.vintage) {
      if (!essence.vintage.style) {
        violations.push({
          rule: 'essence-structure',
          file: 'decantr.essence.json',
          message: 'Missing vintage.style',
          severity: 'warning',
        });
      }
      if (!essence.vintage.mode) {
        violations.push({
          rule: 'essence-structure',
          file: 'decantr.essence.json',
          message: 'Missing vintage.mode',
          severity: 'warning',
        });
      }
    }

    // Structure validation
    if (essence.structure && Array.isArray(essence.structure)) {
      for (const page of essence.structure) {
        if (!page.id) {
          violations.push({
            rule: 'essence-structure',
            file: 'decantr.essence.json',
            message: 'Page missing id field',
            severity: 'error',
          });
        }
        if (!page.skeleton) {
          violations.push({
            rule: 'essence-structure',
            file: 'decantr.essence.json',
            message: `Page "${page.id}" missing skeleton`,
            severity: 'warning',
          });
        }
      }
    }
  } catch (err) {
    violations.push({
      rule: 'essence-structure',
      file: 'decantr.essence.json',
      message: `Parse error: ${err.message}`,
      severity: 'error',
    });
  }

  return violations;
}

async function checkPatternRegistry(projectDir) {
  const violations = [];

  // Check for local patterns (indicating registry gaps)
  const localPatternsDir = join(projectDir, 'src', 'patterns');
  if (existsSync(localPatternsDir)) {
    const files = await readdir(localPatternsDir);
    if (files.length > 0) {
      violations.push({
        rule: 'pattern-registry',
        file: 'src/patterns/',
        message: `${files.length} local patterns created (may indicate registry gaps)`,
        severity: 'warning',
      });
    }
  }

  return violations;
}

async function checkComponentRegistry(projectDir) {
  const violations = [];

  // Check for local components that duplicate Decantr components
  const localComponentsDir = join(projectDir, 'src', 'components');
  if (existsSync(localComponentsDir)) {
    const files = await readdir(localComponentsDir);

    const decantrComponents = [
      'Button', 'Input', 'Card', 'Modal', 'Tabs', 'Dropdown',
      'Select', 'Checkbox', 'Radio', 'Toggle', 'Badge', 'Alert',
      'Toast', 'Tooltip', 'Popover', 'Progress', 'Skeleton',
    ];

    for (const file of files) {
      const name = file.replace('.js', '');
      if (decantrComponents.includes(name)) {
        violations.push({
          rule: 'component-registry',
          file: `src/components/${file}`,
          message: `Local ${name} duplicates Decantr component`,
          severity: 'warning',
        });
      }
    }
  }

  return violations;
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Validate a project against all compliance rules.
 *
 * @param {string} projectDir - Path to project
 * @returns {Promise<Object>} Validation results
 */
export async function validateCompliance(projectDir) {
  const allViolations = [];

  for (const [ruleName, rule] of Object.entries(RULES)) {
    try {
      const violations = await rule.check(projectDir);
      allViolations.push(...violations);
    } catch (err) {
      allViolations.push({
        rule: ruleName,
        message: `Check failed: ${err.message}`,
        severity: 'error',
      });
    }
  }

  const errors = allViolations.filter(v => v.severity === 'error');
  const warnings = allViolations.filter(v => v.severity === 'warning');

  return {
    valid: errors.length === 0,
    violations: allViolations,
    errorCount: errors.length,
    warningCount: warnings.length,
    summary: `${errors.length} errors, ${warnings.length} warnings`,
  };
}

/**
 * Get all available rules.
 */
export function getRules() {
  return Object.entries(RULES).map(([name, rule]) => ({
    name,
    description: rule.description,
    severity: rule.severity,
  }));
}
