# WS5: Guard Validation Improvements

## Problems

| Issue | Details | Severity |
|-------|---------|----------|
| No theme/mode compatibility check | User can set `luminarum` theme with `light` mode, but luminarum only supports `dark` | Critical |
| No pattern existence validation | Essence can reference patterns that don't exist | Critical |
| No suggestion for compatible themes | When validation fails, no helpful alternatives offered | Medium |

## Current Guard Implementation

In `packages/essence-spec/src/guard.ts`, the guard only checks:
- Style consistency (theme matches)
- Structure (pages exist)
- Layout order (pattern sequence)
- Recipe consistency
- Density (spacing tokens)

It does NOT validate:
- Whether the theme supports the specified mode
- Whether referenced patterns exist in the registry

## Solution

### 1. Add Theme/Mode Compatibility Check

Update `packages/essence-spec/src/guard.ts`:

```typescript
export interface GuardContext {
  // Existing context...
  themeRegistry?: Map<string, { modes: string[] }>;
}

export interface GuardViolation {
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;  // NEW: helpful alternatives
}

function checkThemeModeCompatibility(
  essence: EssenceFile,
  context: GuardContext
): GuardViolation | null {
  if (!context.themeRegistry) return null;

  const themeId = essence.theme?.style;
  const mode = essence.theme?.mode;

  if (!themeId || !mode) return null;

  const theme = context.themeRegistry.get(themeId);
  if (!theme) {
    // Theme not found - separate validation
    return null;
  }

  if (!theme.modes.includes(mode) && mode !== 'auto') {
    const supportedModes = theme.modes.join(', ');
    const suggestion = theme.modes.length > 0
      ? `Use mode: "${theme.modes[0]}" instead, or choose a theme that supports ${mode} mode.`
      : undefined;

    return {
      rule: 'theme-mode',
      severity: 'error',
      message: `Theme "${themeId}" does not support "${mode}" mode. Supported modes: ${supportedModes}.`,
      suggestion,
    };
  }

  return null;
}
```

### 2. Add Pattern Existence Validation

```typescript
function checkPatternExistence(
  essence: EssenceFile,
  context: GuardContext
): GuardViolation[] {
  if (!context.patternRegistry) return [];

  const violations: GuardViolation[] = [];
  const referencedPatterns = new Set<string>();

  // Collect all pattern references from structure
  for (const page of essence.structure || []) {
    for (const item of page.layout || []) {
      collectPatternIds(item, referencedPatterns);
    }
  }

  // Check each pattern exists
  for (const patternId of referencedPatterns) {
    if (!context.patternRegistry.has(patternId)) {
      // Find similar patterns for suggestion
      const similar = findSimilarPatterns(patternId, context.patternRegistry);
      const suggestion = similar.length > 0
        ? `Similar patterns: ${similar.join(', ')}`
        : `Run "decantr search ${patternId}" to find alternatives.`;

      violations.push({
        rule: 'pattern-exists',
        severity: 'error',
        message: `Pattern "${patternId}" is referenced but does not exist in the registry.`,
        suggestion,
      });
    }
  }

  return violations;
}

function collectPatternIds(item: unknown, ids: Set<string>): void {
  if (typeof item === 'string') {
    ids.add(item);
    return;
  }
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    if (typeof obj.pattern === 'string') {
      ids.add(obj.pattern);
    }
    if (Array.isArray(obj.cols)) {
      for (const col of obj.cols) {
        collectPatternIds(col, ids);
      }
    }
  }
}

function findSimilarPatterns(target: string, registry: Map<string, unknown>): string[] {
  const similar: string[] = [];
  const targetLower = target.toLowerCase();

  for (const id of registry.keys()) {
    // Simple similarity: contains target or target contains id
    if (id.includes(targetLower) || targetLower.includes(id)) {
      similar.push(id);
    }
  }

  return similar.slice(0, 3);  // Top 3 suggestions
}
```

### 3. Update Main Guard Evaluation

```typescript
export function evaluateGuard(
  essence: EssenceFile,
  context: GuardContext = {}
): GuardViolation[] {
  const violations: GuardViolation[] = [];
  const mode = essence.guard?.mode || 'guided';

  // Existing checks...

  // NEW: Theme/mode compatibility (always checked)
  const themeModeViolation = checkThemeModeCompatibility(essence, context);
  if (themeModeViolation) {
    violations.push(themeModeViolation);
  }

  // NEW: Pattern existence (always checked)
  const patternViolations = checkPatternExistence(essence, context);
  violations.push(...patternViolations);

  return violations;
}
```

### 4. Update CLI to Pass Registry Context

In `packages/cli/src/index.ts`, update the validate and audit commands:

```typescript
async function cmdValidate(path?: string) {
  // ... existing code ...

  // Build registry context for guard
  const resolver = getResolver();
  const themeRegistry = new Map<string, { modes: string[] }>();
  const patternRegistry = new Map<string, unknown>();

  // Load themes
  const themesDir = join(getContentRoot(), 'themes');
  if (existsSync(themesDir)) {
    for (const f of readdirSync(themesDir).filter(f => f.endsWith('.json'))) {
      const data = JSON.parse(readFileSync(join(themesDir, f), 'utf-8'));
      themeRegistry.set(data.id, { modes: data.modes || [] });
    }
  }

  // Load patterns
  const patternsDir = join(getContentRoot(), 'patterns');
  if (existsSync(patternsDir)) {
    for (const f of readdirSync(patternsDir).filter(f => f.endsWith('.json'))) {
      const data = JSON.parse(readFileSync(join(patternsDir, f), 'utf-8'));
      patternRegistry.set(data.id, data);
    }
  }

  // Pass context to guard
  const violations = evaluateGuard(essence, {
    themeRegistry,
    patternRegistry
  });

  // ... rest of function with improved output ...
}
```

### 5. Add Suggestion Output

Update violation display to show suggestions:

```typescript
for (const v of violations) {
  console.log(`  ${YELLOW}[${v.rule}]${RESET} ${v.message}`);
  if (v.suggestion) {
    console.log(`    ${DIM}Suggestion: ${v.suggestion}${RESET}`);
  }
}
```

## Files to Modify

1. `packages/essence-spec/src/guard.ts`
   - Add `GuardContext` interface with registry maps
   - Add `suggestion` field to `GuardViolation`
   - Implement `checkThemeModeCompatibility()`
   - Implement `checkPatternExistence()`
   - Update `evaluateGuard()` to run new checks

2. `packages/essence-spec/src/types.ts`
   - Export updated interfaces

3. `packages/cli/src/index.ts`
   - Build registry context from content
   - Pass context to guard evaluation
   - Display suggestions in output

## Test Cases

```typescript
describe('guard - theme mode compatibility', () => {
  it('rejects incompatible theme/mode combination', () => {
    const essence = {
      theme: { style: 'luminarum', mode: 'light' },
      // ...
    };
    const context = {
      themeRegistry: new Map([
        ['luminarum', { modes: ['dark'] }]
      ])
    };

    const violations = evaluateGuard(essence, context);

    expect(violations).toContainEqual(expect.objectContaining({
      rule: 'theme-mode',
      severity: 'error',
      message: expect.stringContaining('does not support "light" mode')
    }));
  });

  it('accepts auto mode for any theme', () => {
    const essence = {
      theme: { style: 'luminarum', mode: 'auto' },
      // ...
    };
    const context = {
      themeRegistry: new Map([
        ['luminarum', { modes: ['dark'] }]
      ])
    };

    const violations = evaluateGuard(essence, context);

    expect(violations.filter(v => v.rule === 'theme-mode')).toHaveLength(0);
  });
});

describe('guard - pattern existence', () => {
  it('reports missing patterns with suggestions', () => {
    const essence = {
      structure: [
        { id: 'main', layout: ['leaderbord'] }  // typo
      ],
      // ...
    };
    const context = {
      patternRegistry: new Map([
        ['leaderboard', {}],
        ['activity-feed', {}]
      ])
    };

    const violations = evaluateGuard(essence, context);

    expect(violations).toContainEqual(expect.objectContaining({
      rule: 'pattern-exists',
      message: expect.stringContaining('leaderbord'),
      suggestion: expect.stringContaining('leaderboard')
    }));
  });

  it('extracts patterns from nested layouts', () => {
    const essence = {
      structure: [{
        id: 'main',
        layout: [
          { cols: ['missing-a', 'missing-b'], at: 'lg' }
        ]
      }],
    };
    const context = { patternRegistry: new Map() };

    const violations = evaluateGuard(essence, context);

    const patternViolations = violations.filter(v => v.rule === 'pattern-exists');
    expect(patternViolations).toHaveLength(2);
  });
});
```

## Validation

```bash
# Build packages
pnpm build

# Test with intentionally bad essence
cat > /tmp/bad-essence.json << 'EOF'
{
  "version": "2.0.0",
  "theme": {
    "style": "luminarum",
    "mode": "light"
  },
  "structure": [
    { "id": "main", "layout": ["nonexistent-pattern"] }
  ]
}
EOF

npx decantr validate /tmp/bad-essence.json
# Should show:
# [theme-mode] Theme "luminarum" does not support "light" mode
#   Suggestion: Use mode: "dark" instead
# [pattern-exists] Pattern "nonexistent-pattern" does not exist
#   Suggestion: Run "decantr search nonexistent-pattern" to find alternatives

# Cleanup
rm /tmp/bad-essence.json
```

## Checklist

- [ ] Add `GuardContext` interface with theme/pattern registries
- [ ] Add `suggestion` field to `GuardViolation` interface
- [ ] Implement `checkThemeModeCompatibility()` function
- [ ] Implement `checkPatternExistence()` function
- [ ] Implement `collectPatternIds()` helper for nested layouts
- [ ] Implement `findSimilarPatterns()` for suggestions
- [ ] Update `evaluateGuard()` to run new checks
- [ ] Update CLI `cmdValidate()` to build and pass context
- [ ] Update CLI `cmdAudit()` to build and pass context
- [ ] Display suggestions in CLI output
- [ ] Add tests for theme/mode compatibility
- [ ] Add tests for pattern existence
- [ ] Run full test suite: `pnpm test`
- [ ] Commit: `feat(guard): add theme/mode compatibility and pattern existence validation`
