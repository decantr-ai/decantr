// AUTO: React quality validation enforcing Vercel best practices
// Rules derived from https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices

import type { GeneratedFile } from '@decantr/generator-core';

export interface QualityViolation {
  rule: string;
  severity: 'critical' | 'high' | 'medium';
  file: string;
  line?: number;
  message: string;
}

/**
 * Validate generated React/TSX files against Vercel React best practices.
 * Returns an array of violations found across all files.
 */
export function validateReactOutput(files: GeneratedFile[]): QualityViolation[] {
  const violations: QualityViolation[] = [];

  for (const file of files) {
    if (!file.path.endsWith('.tsx') && !file.path.endsWith('.ts')) continue;
    const lines = file.content.split('\n');

    // CRITICAL rules
    checkNoBarrelImports(file, lines, violations);
    checkNoInlineComponents(file, lines, violations);
    checkUseLazyImports(file, lines, violations);
    checkUseSuspenseBoundaries(file, lines, violations);

    // HIGH rules
    checkFunctionalSetState(file, lines, violations);
    checkNoEffectDerivedState(file, lines, violations);
    checkHoistDefaultProps(file, lines, violations);

    // MEDIUM rules
    checkHoistStaticJsx(file, lines, violations);
    checkMemoExpensiveComponents(file, lines, violations);
    checkPrimitiveEffectDeps(file, lines, violations);
  }

  return violations;
}

// ─── CRITICAL Rules ──────────────────────────────────────────

/** Flag barrel imports from lucide-react or @/components/ui */
function checkNoBarrelImports(
  file: GeneratedFile, lines: string[], violations: QualityViolation[],
) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Flag: import { X } from '@/components/ui' (barrel, not specific component)
    if (/import\s+\{[^}]+\}\s+from\s+['"]@\/components\/ui['"]/.test(line)) {
      violations.push({
        rule: 'no-barrel-imports',
        severity: 'critical',
        file: file.path,
        line: i + 1,
        message: 'Import from @/components/ui/[component] instead of @/components/ui barrel',
      });
    }
  }
}

/** Flag component definitions nested inside other components */
function checkNoInlineComponents(
  file: GeneratedFile, lines: string[], violations: QualityViolation[],
) {
  const funcComponentRe = /^\s*(?:export\s+)?(?:default\s+)?function\s+([A-Z]\w*)\s*\(/;
  const arrowComponentRe = /^\s*(?:export\s+)?const\s+([A-Z]\w*)\s*(?::\s*\w+)?\s*=\s*\([^)]*\)\s*=>/;

  let depth = 0;
  let componentDepth = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const funcMatch = line.match(funcComponentRe);
    const arrowMatch = line.match(arrowComponentRe);
    const match = funcMatch || arrowMatch;

    if (match) {
      if (componentDepth >= 0 && depth > componentDepth) {
        violations.push({
          rule: 'no-inline-components',
          severity: 'critical',
          file: file.path,
          line: i + 1,
          message: `Component "${match[1]}" defined inside another component — causes remount every render`,
        });
      } else {
        componentDepth = depth;
      }
    }

    // Track brace depth (sufficient for generated code with consistent formatting)
    for (const ch of line) {
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (componentDepth >= 0 && depth <= componentDepth) {
          componentDepth = -1;
        }
      }
    }
  }
}

/** Flag direct page imports in files that use <Route> (should use React.lazy) */
function checkUseLazyImports(
  file: GeneratedFile, lines: string[], violations: QualityViolation[],
) {
  const hasRoutes = lines.some(l => l.includes('<Route'));
  if (!hasRoutes) return;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Flag: import XPage from './pages/x' (direct import, not lazy)
    const match = line.match(/import\s+(\w+)\s+from\s+['"]\.\/pages\//);
    if (match) {
      violations.push({
        rule: 'use-lazy-imports',
        severity: 'critical',
        file: file.path,
        line: i + 1,
        message: `Page "${match[1]}" should use React.lazy() for code splitting`,
      });
    }
  }
}

/** Flag React.lazy usage without Suspense boundaries */
function checkUseSuspenseBoundaries(
  file: GeneratedFile, lines: string[], violations: QualityViolation[],
) {
  const hasLazy = lines.some(l => /React\.lazy\(/.test(l) || /\blazy\(/.test(l));
  if (!hasLazy) return;

  const hasSuspense = lines.some(l =>
    /<Suspense[\s>]/.test(l) || /<React\.Suspense[\s>]/.test(l),
  );
  if (!hasSuspense) {
    violations.push({
      rule: 'use-suspense-boundaries',
      severity: 'critical',
      file: file.path,
      message: 'Lazy-loaded components must be wrapped in <Suspense fallback={...}>',
    });
  }
}

// ─── HIGH Rules ──────────────────────────────────────────────

/** Flag setState(value) where functional setState(prev => ...) should be used */
function checkFunctionalSetState(
  file: GeneratedFile, lines: string[], violations: QualityViolation[],
) {
  // Collect state variable names from useState calls
  const stateVars: { name: string; setter: string }[] = [];
  for (const line of lines) {
    const match = line.match(/const\s+\[(\w+),\s*(\w+)\]\s*=\s*useState/);
    if (match) {
      stateVars.push({ name: match[1], setter: match[2] });
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { name, setter } of stateVars) {
      // Look for setter calls that reference the state variable but don't use functional form
      const callRe = new RegExp(`\\b${setter}\\(([^)]+)\\)`);
      const callMatch = line.match(callRe);
      if (!callMatch) continue;

      const arg = callMatch[1].trim();
      // Skip if already using functional form: setter(prev => ...)
      if (/^\w+\s*=>/.test(arg) || /^function/.test(arg)) continue;
      // Flag if the argument references the state variable (depends on previous state)
      if (new RegExp(`\\b${name}\\b`).test(arg) && arg !== name) {
        violations.push({
          rule: 'functional-setstate',
          severity: 'high',
          file: file.path,
          line: i + 1,
          message: `Use ${setter}(prev => ...) when new state depends on "${name}"`,
        });
      }
    }
  }
}

/** Flag useEffect that only sets derived state (should use useMemo) */
function checkNoEffectDerivedState(
  file: GeneratedFile, lines: string[], violations: QualityViolation[],
) {
  const content = file.content;
  // Match: useEffect(() => { setSomething(expr); }, [deps])
  // where the effect body contains only a single setState call
  const re = /useEffect\(\(\)\s*=>\s*\{\s*(set\w+)\([^)]+\);?\s*\},\s*\[/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split('\n').length;
    violations.push({
      rule: 'no-effect-derived-state',
      severity: 'high',
      file: file.path,
      line: lineNum,
      message: `Derived state via ${match[1]} in useEffect — compute during render with useMemo instead`,
    });
  }
}

/** Flag non-primitive default values ([] or {}) in component parameters */
function checkHoistDefaultProps(
  file: GeneratedFile, lines: string[], violations: QualityViolation[],
) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Only check lines in function/const component parameter destructuring
    if (!/(?:function\s+[A-Z]|const\s+[A-Z]\w*\s*=)/.test(line) && !/^\s*\{.*=\s*[\[{]/.test(line)) {
      continue;
    }
    if (/\w+\s*=\s*\[\]/.test(line)) {
      violations.push({
        rule: 'hoist-default-props',
        severity: 'high',
        file: file.path,
        line: i + 1,
        message: 'Default [] creates new reference every render — hoist to module-level constant',
      });
    }
    if (/\w+\s*=\s*\{\s*\}/.test(line)) {
      violations.push({
        rule: 'hoist-default-props',
        severity: 'high',
        file: file.path,
        line: i + 1,
        message: 'Default {} creates new reference every render — hoist to module-level constant',
      });
    }
  }
}

// ─── MEDIUM Rules ────────────────────────────────────────────

/** Flag static JSX assigned to variables inside components (could be hoisted) */
function checkHoistStaticJsx(
  file: GeneratedFile, lines: string[], violations: QualityViolation[],
) {
  let depth = 0;
  let componentDepth = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/(?:function|const)\s+[A-Z]\w*/.test(line) && componentDepth < 0) {
      componentDepth = depth;
    }

    // Only flag inside components: const x = <Tag>literal</Tag> with no {expressions}
    if (componentDepth >= 0 && depth > componentDepth) {
      const m = line.match(/const\s+(\w+)\s*=\s*(<[a-z]\w*[^{]*>[^{]*<\/[a-z]\w*>)\s*;/);
      if (m) {
        violations.push({
          rule: 'hoist-static-jsx',
          severity: 'medium',
          file: file.path,
          line: i + 1,
          message: `Static JSX "${m[1]}" can be hoisted to module level`,
        });
      }
    }

    for (const ch of line) {
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (componentDepth >= 0 && depth <= componentDepth) componentDepth = -1;
      }
    }
  }
}

/** Flag components receiving many object props without React.memo */
function checkMemoExpensiveComponents(
  file: GeneratedFile, lines: string[], violations: QualityViolation[],
) {
  if (file.content.includes('React.memo') || file.content.includes('memo(')) return;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Heuristic: <Component with 3+ expression-value props
    const m = line.match(/<([A-Z]\w+)\s/);
    if (!m) continue;
    const exprProps = (line.match(/\w+=\{/g) || []).length;
    if (exprProps >= 3) {
      violations.push({
        rule: 'memo-expensive-components',
        severity: 'medium',
        file: file.path,
        line: i + 1,
        message: `Component "${m[1]}" receives ${exprProps} expression props — consider React.memo()`,
      });
    }
  }
}

/** Flag useEffect with object/array literals in dependency array */
function checkPrimitiveEffectDeps(
  file: GeneratedFile, lines: string[], violations: QualityViolation[],
) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match: }, [dep1, {obj}, [arr]]) or similar
    const m = line.match(/\]\s*,\s*\[([^\]]+)\]\s*\)/);
    if (m && /[\[{]/.test(m[1])) {
      violations.push({
        rule: 'primitive-effect-deps',
        severity: 'medium',
        file: file.path,
        line: i + 1,
        message: 'useEffect dependencies should be primitive — inline objects/arrays cause unnecessary re-runs',
      });
    }
  }
}
