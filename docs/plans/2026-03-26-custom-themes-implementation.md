# Custom Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to create and use local custom themes with `custom:` namespace prefix.

**Architecture:** Custom theme resolution integrated at RegistryClient layer. The `custom:` prefix routes to `.decantr/custom/themes/` while all other content uses the existing API → Cache → Bundled fallback chain. CLI gains a `theme` subcommand for creation and management.

**Tech Stack:** TypeScript, Node.js fs APIs, existing Decantr CLI/registry infrastructure.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `packages/cli/src/registry.ts` | Add `custom:` prefix detection and `loadCustomContent()` helper |
| `packages/cli/src/theme-commands.ts` | New file: `create`, `list`, `validate`, `delete`, `import` commands |
| `packages/cli/src/theme-templates.ts` | New file: skeleton JSON and how-to-theme.md content |
| `packages/cli/src/index.ts` | Add `theme` subcommand routing |
| `packages/cli/test/theme-commands.test.ts` | Tests for theme commands |
| `packages/cli/test/registry-custom.test.ts` | Tests for custom theme resolution |
| `packages/core/src/resolve.ts` | Treat `custom:` styles as addons |
| `packages/mcp-server/src/tools.ts` | Include custom themes in search results |

---

## Task 1: Update RegistrySource Type

**Files:**
- Modify: `packages/cli/src/registry.ts:14-17`

- [ ] **Step 1: Add 'custom' to RegistrySource type**

Open `packages/cli/src/registry.ts` and update the interface:

```typescript
export interface RegistrySource {
  type: 'api' | 'bundled' | 'cache' | 'custom';
  url?: string;
  path?: string;  // For custom: the local file path
}
```

- [ ] **Step 2: Run type check to verify no breaks**

Run: `cd packages/cli && pnpm run lint`
Expected: PASS (no type errors)

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/registry.ts
git commit -m "feat(cli): add 'custom' to RegistrySource type"
```

---

## Task 2: Add loadCustomContent Helper

**Files:**
- Modify: `packages/cli/src/registry.ts`
- Test: `packages/cli/test/registry-custom.test.ts`

- [ ] **Step 1: Write failing test for loadCustomContent**

Create `packages/cli/test/registry-custom.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { RegistryClient } from '../src/registry.js';

describe('RegistryClient custom theme resolution', () => {
  const testDir = join(process.cwd(), 'test-project');
  const customThemesDir = join(testDir, '.decantr', 'custom', 'themes');

  beforeEach(() => {
    mkdirSync(customThemesDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('resolves custom: prefixed theme from .decantr/custom/themes', async () => {
    const themeData = {
      id: 'mytheme',
      name: 'My Theme',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['dark'],
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };
    writeFileSync(join(customThemesDir, 'mytheme.json'), JSON.stringify(themeData));

    const client = new RegistryClient({
      projectRoot: testDir,
      cacheDir: join(testDir, '.decantr', 'cache'),
      offline: true
    });

    const result = await client.fetchTheme('custom:mytheme');

    expect(result).not.toBeNull();
    expect(result?.data.id).toBe('mytheme');
    expect(result?.source.type).toBe('custom');
    expect(result?.source.path).toContain('mytheme.json');
  });

  it('returns null for missing custom theme', async () => {
    const client = new RegistryClient({
      projectRoot: testDir,
      cacheDir: join(testDir, '.decantr', 'cache'),
      offline: true
    });

    const result = await client.fetchTheme('custom:nonexistent');

    expect(result).toBeNull();
  });

  it('does not use custom: path for registry themes', async () => {
    const client = new RegistryClient({
      projectRoot: testDir,
      cacheDir: join(testDir, '.decantr', 'cache'),
      offline: true
    });

    // This should NOT look in custom directory
    const result = await client.fetchTheme('auradecantism');

    // Should fall through to bundled (offline mode)
    expect(result?.source.type).not.toBe('custom');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/cli && pnpm test -- registry-custom`
Expected: FAIL with "projectRoot" not recognized

- [ ] **Step 3: Add projectRoot to RegistryClient constructor**

In `packages/cli/src/registry.ts`, update the constructor:

```typescript
export class RegistryClient {
  private cacheDir: string;
  private apiUrl: string;
  private offline: boolean;
  private projectRoot: string;

  constructor(options: {
    cacheDir?: string;
    apiUrl?: string;
    offline?: boolean;
    projectRoot?: string;
  } = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.cacheDir = options.cacheDir || join(this.projectRoot, '.decantr', 'cache');
    this.apiUrl = options.apiUrl || DEFAULT_API_URL;
    this.offline = options.offline || false;
  }
```

- [ ] **Step 4: Add loadCustomContent private method**

Add after the constructor in `packages/cli/src/registry.ts`:

```typescript
  /**
   * Load content from .decantr/custom/{contentType}/{id}.json
   */
  private loadCustomContent<T>(
    contentType: string,
    id: string
  ): FetchResult<T> | null {
    const customPath = join(
      this.projectRoot,
      '.decantr',
      'custom',
      contentType,
      `${id}.json`
    );

    if (!existsSync(customPath)) {
      return null;
    }

    try {
      const data = JSON.parse(readFileSync(customPath, 'utf-8')) as T;
      return {
        data,
        source: { type: 'custom', path: customPath }
      };
    } catch {
      return null;
    }
  }
```

- [ ] **Step 5: Update fetchTheme to handle custom: prefix**

Modify `fetchTheme` method in `packages/cli/src/registry.ts`:

```typescript
  /**
   * Fetch a single theme.
   */
  async fetchTheme(id: string): Promise<FetchResult<RegistryItem> | null> {
    // Check for custom: prefix
    if (id.startsWith('custom:')) {
      return this.loadCustomContent<RegistryItem>('themes', id.slice(7));
    }

    if (!this.offline) {
      const apiResult = await tryApi<RegistryItem>(`themes/${id}`, this.apiUrl);
      if (apiResult) {
        saveToCache(this.cacheDir, 'themes', id, apiResult.data);
        return apiResult;
      }
    }

    const cacheResult = loadFromCache<RegistryItem>(this.cacheDir, 'themes', id);
    if (cacheResult) return cacheResult;

    return loadFromBundled<RegistryItem>('themes', id);
  }
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd packages/cli && pnpm test -- registry-custom`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/registry.ts packages/cli/test/registry-custom.test.ts
git commit -m "feat(cli): add custom theme resolution with custom: prefix"
```

---

## Task 3: Create Theme Templates

**Files:**
- Create: `packages/cli/src/theme-templates.ts`

- [ ] **Step 1: Create theme-templates.ts with skeleton and docs**

Create `packages/cli/src/theme-templates.ts`:

```typescript
export function getThemeSkeleton(id: string, name: string): object {
  return {
    $schema: 'https://decantr.ai/schemas/style-metadata.v1.json',
    id,
    name,
    description: '',
    tags: [],
    seed: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      background: '#0F172A'
    },
    palette: {},
    modes: ['dark'],
    shapes: ['rounded'],
    decantr_compat: '>=1.0.0',
    source: 'custom'
  };
}

export function getHowToThemeDoc(): string {
  return `# Custom Themes

Create custom themes for your Decantr project.

## Quick Start

\`\`\`bash
decantr theme create mytheme
\`\`\`

## Theme Structure

| Field | Required | Description |
|-------|----------|-------------|
| id | Yes | Unique identifier (matches filename) |
| name | Yes | Display name |
| description | No | Brief description |
| tags | No | Searchable tags |
| seed | Yes | Core colors: primary, secondary, accent, background |
| palette | No | Extended color palette |
| modes | Yes | Supported modes: ["light"], ["dark"], or both |
| shapes | Yes | Supported shapes: sharp, rounded, pill |
| decantr_compat | Yes | Version compatibility (e.g., ">=1.0.0") |
| source | Yes | Must be "custom" |

## Using Your Theme

In \`decantr.essence.json\`:

\`\`\`json
{
  "theme": {
    "style": "custom:mytheme",
    "mode": "dark"
  }
}
\`\`\`

## Validation

\`\`\`bash
decantr theme validate mytheme
\`\`\`

## Reference

See registry themes for examples:

\`\`\`bash
decantr get theme auradecantism
\`\`\`
`;
}
```

- [ ] **Step 2: Run type check**

Run: `cd packages/cli && pnpm run lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/theme-templates.ts
git commit -m "feat(cli): add theme skeleton and documentation templates"
```

---

## Task 4: Implement Theme Validation

**Files:**
- Create: `packages/cli/src/theme-commands.ts`
- Test: `packages/cli/test/theme-commands.test.ts`

- [ ] **Step 1: Write failing test for theme validation**

Create `packages/cli/test/theme-commands.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { validateCustomTheme } from '../src/theme-commands.js';

describe('validateCustomTheme', () => {
  it('returns valid for complete theme', () => {
    const theme = {
      id: 'test',
      name: 'Test',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['dark'],
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors for missing required fields', () => {
    const theme = {
      id: 'test',
      name: 'Test'
      // missing seed, modes, shapes, decantr_compat, source
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: seed');
    expect(result.errors).toContain('Missing required field: modes');
    expect(result.errors).toContain('Missing required field: shapes');
  });

  it('returns errors for missing seed colors', () => {
    const theme = {
      id: 'test',
      name: 'Test',
      seed: { primary: '#000' }, // missing secondary, accent, background
      modes: ['dark'],
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing seed color: secondary');
    expect(result.errors).toContain('Missing seed color: accent');
    expect(result.errors).toContain('Missing seed color: background');
  });

  it('returns errors for invalid modes', () => {
    const theme = {
      id: 'test',
      name: 'Test',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['auto'], // invalid
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid mode "auto" - must be "light" or "dark"');
  });

  it('returns errors for invalid shapes', () => {
    const theme = {
      id: 'test',
      name: 'Test',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['dark'],
      shapes: ['oval'], // invalid
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid shape "oval" - use: sharp, rounded, pill');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/cli && pnpm test -- theme-commands`
Expected: FAIL with "cannot find module"

- [ ] **Step 3: Implement validateCustomTheme**

Create `packages/cli/src/theme-commands.ts`:

```typescript
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { getThemeSkeleton, getHowToThemeDoc } from './theme-templates.js';

export interface ThemeValidationResult {
  valid: boolean;
  errors: string[];
}

const REQUIRED_FIELDS = ['id', 'name', 'seed', 'modes', 'shapes', 'decantr_compat', 'source'];
const REQUIRED_SEED = ['primary', 'secondary', 'accent', 'background'];
const VALID_MODES = ['light', 'dark'];
const VALID_SHAPES = ['sharp', 'rounded', 'pill'];

export function validateCustomTheme(theme: Record<string, unknown>): ThemeValidationResult {
  const errors: string[] = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!(field in theme)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check seed colors
  if (theme.seed && typeof theme.seed === 'object') {
    const seed = theme.seed as Record<string, unknown>;
    for (const color of REQUIRED_SEED) {
      if (!(color in seed)) {
        errors.push(`Missing seed color: ${color}`);
      }
    }
  }

  // Check modes
  if (Array.isArray(theme.modes)) {
    for (const mode of theme.modes) {
      if (!VALID_MODES.includes(mode as string)) {
        errors.push(`Invalid mode "${mode}" - must be "light" or "dark"`);
      }
    }
  }

  // Check shapes
  if (Array.isArray(theme.shapes)) {
    for (const shape of theme.shapes) {
      if (!VALID_SHAPES.includes(shape as string)) {
        errors.push(`Invalid shape "${shape}" - use: sharp, rounded, pill`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/cli && pnpm test -- theme-commands`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/theme-commands.ts packages/cli/test/theme-commands.test.ts
git commit -m "feat(cli): add custom theme validation"
```

---

## Task 5: Implement Theme Create Command

**Files:**
- Modify: `packages/cli/src/theme-commands.ts`
- Modify: `packages/cli/test/theme-commands.test.ts`

- [ ] **Step 1: Write failing test for createTheme**

Add to `packages/cli/test/theme-commands.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateCustomTheme, createTheme } from '../src/theme-commands.js';

describe('createTheme', () => {
  const testDir = join(process.cwd(), 'test-theme-create');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('creates theme file in .decantr/custom/themes', () => {
    const result = createTheme(testDir, 'mytheme', 'My Theme');

    expect(result.success).toBe(true);
    expect(existsSync(join(testDir, '.decantr', 'custom', 'themes', 'mytheme.json'))).toBe(true);
  });

  it('creates how-to-theme.md if not exists', () => {
    createTheme(testDir, 'mytheme', 'My Theme');

    expect(existsSync(join(testDir, '.decantr', 'custom', 'themes', 'how-to-theme.md'))).toBe(true);
  });

  it('does not overwrite existing theme', () => {
    createTheme(testDir, 'mytheme', 'My Theme');
    const result = createTheme(testDir, 'mytheme', 'My Theme Again');

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });

  it('creates valid theme skeleton', () => {
    createTheme(testDir, 'mytheme', 'My Theme');

    const themePath = join(testDir, '.decantr', 'custom', 'themes', 'mytheme.json');
    const theme = JSON.parse(readFileSync(themePath, 'utf-8'));
    const validation = validateCustomTheme(theme);

    expect(validation.valid).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/cli && pnpm test -- theme-commands`
Expected: FAIL with "createTheme is not exported"

- [ ] **Step 3: Implement createTheme**

Add to `packages/cli/src/theme-commands.ts`:

```typescript
export interface CreateThemeResult {
  success: boolean;
  path?: string;
  error?: string;
}

export function createTheme(
  projectRoot: string,
  id: string,
  name: string
): CreateThemeResult {
  const customThemesDir = join(projectRoot, '.decantr', 'custom', 'themes');
  const themePath = join(customThemesDir, `${id}.json`);
  const howToPath = join(customThemesDir, 'how-to-theme.md');

  // Create directory if needed
  mkdirSync(customThemesDir, { recursive: true });

  // Check if theme already exists
  if (existsSync(themePath)) {
    return {
      success: false,
      error: `Theme "${id}" already exists at ${themePath}`
    };
  }

  // Write theme skeleton
  const skeleton = getThemeSkeleton(id, name);
  writeFileSync(themePath, JSON.stringify(skeleton, null, 2));

  // Write how-to doc if not exists
  if (!existsSync(howToPath)) {
    writeFileSync(howToPath, getHowToThemeDoc());
  }

  return {
    success: true,
    path: themePath
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/cli && pnpm test -- theme-commands`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/theme-commands.ts packages/cli/test/theme-commands.test.ts
git commit -m "feat(cli): add theme create command"
```

---

## Task 6: Implement Theme List, Delete, Import Commands

**Files:**
- Modify: `packages/cli/src/theme-commands.ts`
- Modify: `packages/cli/test/theme-commands.test.ts`

- [ ] **Step 1: Write failing tests for list, delete, import**

Add to `packages/cli/test/theme-commands.test.ts`:

```typescript
import { validateCustomTheme, createTheme, listCustomThemes, deleteTheme, importTheme } from '../src/theme-commands.js';

describe('listCustomThemes', () => {
  const testDir = join(process.cwd(), 'test-theme-list');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('returns empty array when no custom themes', () => {
    const themes = listCustomThemes(testDir);
    expect(themes).toHaveLength(0);
  });

  it('returns list of custom themes', () => {
    createTheme(testDir, 'theme1', 'Theme One');
    createTheme(testDir, 'theme2', 'Theme Two');

    const themes = listCustomThemes(testDir);

    expect(themes).toHaveLength(2);
    expect(themes.map(t => t.id)).toContain('theme1');
    expect(themes.map(t => t.id)).toContain('theme2');
  });
});

describe('deleteTheme', () => {
  const testDir = join(process.cwd(), 'test-theme-delete');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('deletes existing theme', () => {
    createTheme(testDir, 'mytheme', 'My Theme');
    const themePath = join(testDir, '.decantr', 'custom', 'themes', 'mytheme.json');

    expect(existsSync(themePath)).toBe(true);

    const result = deleteTheme(testDir, 'mytheme');

    expect(result.success).toBe(true);
    expect(existsSync(themePath)).toBe(false);
  });

  it('returns error for non-existent theme', () => {
    const result = deleteTheme(testDir, 'nonexistent');

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
});

describe('importTheme', () => {
  const testDir = join(process.cwd(), 'test-theme-import');
  const importDir = join(process.cwd(), 'test-theme-import-source');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
    mkdirSync(importDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    rmSync(importDir, { recursive: true, force: true });
  });

  it('imports valid theme file', () => {
    const theme = {
      id: 'imported',
      name: 'Imported Theme',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['dark'],
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };
    const sourcePath = join(importDir, 'external-theme.json');
    writeFileSync(sourcePath, JSON.stringify(theme));

    const result = importTheme(testDir, sourcePath);

    expect(result.success).toBe(true);
    expect(existsSync(join(testDir, '.decantr', 'custom', 'themes', 'imported.json'))).toBe(true);
  });

  it('rejects invalid theme file', () => {
    const theme = { id: 'bad', name: 'Bad' }; // missing required fields
    const sourcePath = join(importDir, 'bad-theme.json');
    writeFileSync(sourcePath, JSON.stringify(theme));

    const result = importTheme(testDir, sourcePath);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/cli && pnpm test -- theme-commands`
Expected: FAIL with functions not exported

- [ ] **Step 3: Implement listCustomThemes**

Add to `packages/cli/src/theme-commands.ts`:

```typescript
export interface CustomThemeInfo {
  id: string;
  name: string;
  description?: string;
  path: string;
}

export function listCustomThemes(projectRoot: string): CustomThemeInfo[] {
  const customThemesDir = join(projectRoot, '.decantr', 'custom', 'themes');

  if (!existsSync(customThemesDir)) {
    return [];
  }

  const themes: CustomThemeInfo[] = [];

  try {
    const files = readdirSync(customThemesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const filePath = join(customThemesDir, file);
      try {
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        themes.push({
          id: data.id || file.replace('.json', ''),
          name: data.name || data.id,
          description: data.description,
          path: filePath
        });
      } catch {
        // Skip invalid JSON files
      }
    }
  } catch {
    // Directory read error
  }

  return themes;
}
```

- [ ] **Step 4: Implement deleteTheme**

Add to `packages/cli/src/theme-commands.ts`:

```typescript
export interface DeleteThemeResult {
  success: boolean;
  error?: string;
}

export function deleteTheme(projectRoot: string, id: string): DeleteThemeResult {
  const themePath = join(projectRoot, '.decantr', 'custom', 'themes', `${id}.json`);

  if (!existsSync(themePath)) {
    return {
      success: false,
      error: `Theme "${id}" not found at ${themePath}`
    };
  }

  try {
    rmSync(themePath);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: `Failed to delete: ${(e as Error).message}`
    };
  }
}
```

- [ ] **Step 5: Implement importTheme**

Add to `packages/cli/src/theme-commands.ts`:

```typescript
export interface ImportThemeResult {
  success: boolean;
  path?: string;
  errors?: string[];
}

export function importTheme(projectRoot: string, sourcePath: string): ImportThemeResult {
  if (!existsSync(sourcePath)) {
    return {
      success: false,
      errors: [`Source file not found: ${sourcePath}`]
    };
  }

  let theme: Record<string, unknown>;
  try {
    theme = JSON.parse(readFileSync(sourcePath, 'utf-8'));
  } catch (e) {
    return {
      success: false,
      errors: [`Invalid JSON: ${(e as Error).message}`]
    };
  }

  // Validate the theme
  const validation = validateCustomTheme(theme);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  // Ensure source is set to custom
  theme.source = 'custom';

  const id = theme.id as string;
  const customThemesDir = join(projectRoot, '.decantr', 'custom', 'themes');
  const destPath = join(customThemesDir, `${id}.json`);

  mkdirSync(customThemesDir, { recursive: true });

  // Write how-to doc if not exists
  const howToPath = join(customThemesDir, 'how-to-theme.md');
  if (!existsSync(howToPath)) {
    writeFileSync(howToPath, getHowToThemeDoc());
  }

  writeFileSync(destPath, JSON.stringify(theme, null, 2));

  return {
    success: true,
    path: destPath
  };
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd packages/cli && pnpm test -- theme-commands`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/theme-commands.ts packages/cli/test/theme-commands.test.ts
git commit -m "feat(cli): add theme list, delete, import commands"
```

---

## Task 7: Add Theme Subcommand to CLI

**Files:**
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Import theme commands**

Add import at top of `packages/cli/src/index.ts`:

```typescript
import {
  createTheme,
  listCustomThemes,
  deleteTheme,
  importTheme,
  validateCustomTheme
} from './theme-commands.js';
```

- [ ] **Step 2: Add cmdTheme function**

Add before the `cmdHelp` function in `packages/cli/src/index.ts`:

```typescript
// ── Theme subcommand ──

async function cmdTheme(args: string[]) {
  const subcommand = args[0];
  const projectRoot = process.cwd();

  if (!subcommand || subcommand === 'help') {
    console.log(`
${BOLD}decantr theme${RESET} — Manage custom themes

${BOLD}Commands:${RESET}
  ${cyan('create')} <name>        Create a new custom theme
  ${cyan('create')} <name> --guided   Interactive theme creation
  ${cyan('list')}                 List custom themes
  ${cyan('validate')} <name>      Validate a custom theme
  ${cyan('delete')} <name>        Delete a custom theme
  ${cyan('import')} <path>        Import theme from JSON file

${BOLD}Examples:${RESET}
  decantr theme create mytheme
  decantr theme list
  decantr theme validate mytheme
  decantr theme import ./external-theme.json
`);
    return;
  }

  switch (subcommand) {
    case 'create': {
      const name = args[1];
      if (!name) {
        console.error(error('Usage: decantr theme create <name>'));
        process.exitCode = 1;
        return;
      }
      // Convert to display name (capitalize first letter)
      const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
      const result = createTheme(projectRoot, name, displayName);
      if (result.success) {
        console.log(success(`Created custom theme "${name}"`));
        console.log(dim(`  Path: ${result.path}`));
        console.log('');
        console.log(`Use in essence: ${cyan(`"style": "custom:${name}"`)}`);
      } else {
        console.error(error(result.error || 'Failed to create theme'));
        process.exitCode = 1;
      }
      break;
    }

    case 'list': {
      const themes = listCustomThemes(projectRoot);
      if (themes.length === 0) {
        console.log(dim('No custom themes found.'));
        console.log(dim('Run "decantr theme create <name>" to create one.'));
      } else {
        console.log(heading(`${themes.length} custom theme(s)`));
        for (const theme of themes) {
          console.log(`  ${cyan(`custom:${theme.id}`)}  ${dim(theme.description || theme.name)}`);
        }
      }
      break;
    }

    case 'validate': {
      const name = args[1];
      if (!name) {
        console.error(error('Usage: decantr theme validate <name>'));
        process.exitCode = 1;
        return;
      }
      const themePath = join(projectRoot, '.decantr', 'custom', 'themes', `${name}.json`);
      if (!existsSync(themePath)) {
        console.error(error(`Theme "${name}" not found at ${themePath}`));
        process.exitCode = 1;
        return;
      }
      try {
        const theme = JSON.parse(readFileSync(themePath, 'utf-8'));
        const result = validateCustomTheme(theme);
        if (result.valid) {
          console.log(success(`Custom theme "${name}" is valid`));
        } else {
          console.error(error('Validation failed:'));
          for (const err of result.errors) {
            console.error(`  ${RED}${err}${RESET}`);
          }
          process.exitCode = 1;
        }
      } catch (e) {
        console.error(error(`Invalid JSON: ${(e as Error).message}`));
        process.exitCode = 1;
      }
      break;
    }

    case 'delete': {
      const name = args[1];
      if (!name) {
        console.error(error('Usage: decantr theme delete <name>'));
        process.exitCode = 1;
        return;
      }
      const result = deleteTheme(projectRoot, name);
      if (result.success) {
        console.log(success(`Deleted custom theme "${name}"`));
      } else {
        console.error(error(result.error || 'Failed to delete theme'));
        process.exitCode = 1;
      }
      break;
    }

    case 'import': {
      const sourcePath = args[1];
      if (!sourcePath) {
        console.error(error('Usage: decantr theme import <path>'));
        process.exitCode = 1;
        return;
      }
      const result = importTheme(projectRoot, sourcePath);
      if (result.success) {
        console.log(success('Theme imported successfully'));
        console.log(dim(`  Path: ${result.path}`));
      } else {
        console.error(error('Import failed:'));
        for (const err of result.errors || []) {
          console.error(`  ${RED}${err}${RESET}`);
        }
        process.exitCode = 1;
      }
      break;
    }

    default:
      console.error(error(`Unknown theme command: ${subcommand}`));
      process.exitCode = 1;
  }
}
```

- [ ] **Step 3: Add theme case to main switch**

In the `main()` function, add a case for 'theme' before the 'default' case:

```typescript
    case 'theme': {
      await cmdTheme(args.slice(1));
      break;
    }
```

- [ ] **Step 4: Update help text**

In `cmdHelp()`, add the theme command:

```typescript
  decantr theme <subcommand>
```

And in the Commands section:

```typescript
  ${cyan('theme')}     Manage custom themes (create, list, validate, delete, import)
```

- [ ] **Step 5: Run CLI to verify theme commands work**

Run: `cd packages/cli && pnpm build && node dist/index.js theme help`
Expected: Shows theme subcommand help

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/index.ts
git commit -m "feat(cli): add theme subcommand for custom theme management"
```

---

## Task 8: Integrate Custom Themes in List Command

**Files:**
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Update cmdList to show custom themes**

Modify the `cmdList` function to include custom themes when listing themes:

```typescript
async function cmdList(type: string) {
  const validTypes = ['patterns', 'archetypes', 'recipes', 'themes', 'blueprints'] as const;
  if (!validTypes.includes(type as any)) {
    console.error(error(`Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  const { readdirSync, existsSync } = await import('node:fs');
  const contentRoot = getContentRoot();
  const mainDir = join(contentRoot, type);
  const coreDir = join(contentRoot, 'core', type);
  const items: Array<{ id: string; description?: string; name?: string; source?: string }> = [];

  // Load from main directory
  try {
    if (existsSync(mainDir)) {
      const files = readdirSync(mainDir).filter(f => f.endsWith('.json'));
      for (const f of files) {
        const data = JSON.parse(readFileSync(join(mainDir, f), 'utf-8'));
        items.push({ id: data.id || f.replace('.json', ''), description: data.description, name: data.name, source: 'registry' });
      }
    }
  } catch { /* local not available */ }

  // Load from core directory (don't duplicate if id already exists)
  try {
    if (existsSync(coreDir)) {
      const files = readdirSync(coreDir).filter(f => f.endsWith('.json'));
      const existingIds = new Set(items.map(i => i.id));
      for (const f of files) {
        const data = JSON.parse(readFileSync(join(coreDir, f), 'utf-8'));
        const itemId = data.id || f.replace('.json', '');
        if (!existingIds.has(itemId)) {
          items.push({ id: itemId, description: data.description, name: data.name, source: 'registry' });
        }
      }
    }
  } catch { /* core not available */ }

  // For themes, also include custom themes
  if (type === 'themes') {
    const customThemes = listCustomThemes(process.cwd());
    for (const theme of customThemes) {
      items.push({
        id: `custom:${theme.id}`,
        description: theme.description,
        name: theme.name,
        source: 'custom'
      });
    }
  }

  if (items.length > 0) {
    // Separate registry and custom items
    const registryItems = items.filter(i => i.source !== 'custom');
    const customItems = items.filter(i => i.source === 'custom');

    if (registryItems.length > 0) {
      console.log(heading(`Registry ${type} (${registryItems.length})`));
      for (const item of registryItems) {
        console.log(`  ${cyan(item.id)}  ${dim(item.description || item.name || '')}`);
      }
    }

    if (customItems.length > 0) {
      console.log(heading(`Custom ${type} (${customItems.length})`));
      for (const item of customItems) {
        console.log(`  ${cyan(item.id)}  ${dim(item.description || item.name || '')}`);
      }
    }
    return;
  }

  // Fallback to API if no local content found
  try {
    const res = await fetch(`https://decantr-registry.fly.dev/v1/${type}`);
    if (res.ok) {
      const data = await res.json() as { total: number; items: Array<{ id: string; name?: string; description?: string }> };
      console.log(heading(`${data.total} ${type}`));
      for (const item of data.items) {
        console.log(`  ${cyan(item.id)}  ${dim(item.description || item.name || '')}`);
      }
      return;
    }
  } catch { /* API unavailable */ }
  console.log(dim(`No ${type} found.`));
}
```

- [ ] **Step 2: Run to verify custom themes appear in list**

Run: `cd packages/cli && pnpm build && node dist/index.js list themes`
Expected: Shows both registry and custom themes (if any exist)

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/index.ts
git commit -m "feat(cli): show custom themes in 'list themes' output"
```

---

## Task 9: Update Core Pipeline for Custom Themes

**Files:**
- Modify: `packages/core/src/resolve.ts`

- [ ] **Step 1: Read current resolve.ts**

Read the file to understand the current `CORE_STYLES` handling.

- [ ] **Step 2: Update isAddon detection**

Find the `CORE_STYLES` set and the addon detection logic. Update to treat `custom:` prefixed styles as addons:

```typescript
const CORE_STYLES = new Set(['auradecantism']);

// In buildTheme or wherever isAddon is determined:
const style = simpleEssence.theme.style;
const isAddon = style.startsWith('custom:') || !CORE_STYLES.has(style);
const theme = buildTheme(simpleEssence, isAddon);
```

- [ ] **Step 3: Run core tests**

Run: `cd packages/core && pnpm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/resolve.ts
git commit -m "feat(core): treat custom: prefixed styles as addons"
```

---

## Task 10: Update Essence Validation for Custom Themes

**Files:**
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Update buildRegistryContext to include custom themes**

Modify `buildRegistryContext` function to also load custom themes:

```typescript
function buildRegistryContext(): { themeRegistry: Map<string, { modes: string[] }>; patternRegistry: Map<string, unknown> } {
  const { readdirSync } = require('node:fs');
  const themeRegistry = new Map<string, { modes: string[] }>();
  const patternRegistry = new Map<string, unknown>();
  const contentRoot = getContentRoot();

  // Load themes from main and core directories
  const themeDirs = [join(contentRoot, 'themes'), join(contentRoot, 'core', 'themes')];
  for (const dir of themeDirs) {
    try {
      if (existsSync(dir)) {
        for (const f of readdirSync(dir).filter((f: string) => f.endsWith('.json'))) {
          const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
          if (data.id && !themeRegistry.has(data.id)) {
            themeRegistry.set(data.id, { modes: data.modes || ['light', 'dark'] });
          }
        }
      }
    } catch { /* skip if unavailable */ }
  }

  // Load custom themes
  const customThemesDir = join(process.cwd(), '.decantr', 'custom', 'themes');
  try {
    if (existsSync(customThemesDir)) {
      for (const f of readdirSync(customThemesDir).filter((f: string) => f.endsWith('.json'))) {
        const data = JSON.parse(readFileSync(join(customThemesDir, f), 'utf-8'));
        if (data.id) {
          // Register with custom: prefix
          themeRegistry.set(`custom:${data.id}`, { modes: data.modes || ['light', 'dark'] });
        }
      }
    }
  } catch { /* skip if unavailable */ }

  // Load patterns from main and core directories
  const patternDirs = [join(contentRoot, 'patterns'), join(contentRoot, 'core', 'patterns')];
  for (const dir of patternDirs) {
    try {
      if (existsSync(dir)) {
        for (const f of readdirSync(dir).filter((f: string) => f.endsWith('.json'))) {
          const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
          if (data.id && !patternRegistry.has(data.id)) {
            patternRegistry.set(data.id, data);
          }
        }
      }
    } catch { /* skip if unavailable */ }
  }

  return { themeRegistry, patternRegistry };
}
```

- [ ] **Step 2: Run validate to verify custom themes work**

Run: `cd packages/cli && pnpm build && node dist/index.js validate`
Expected: PASS (no errors about custom themes)

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/index.ts
git commit -m "feat(cli): include custom themes in guard validation context"
```

---

## Task 11: Build and Integration Test

**Files:**
- All packages

- [ ] **Step 1: Build all packages**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 2: Run all tests**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 3: Manual integration test**

```bash
# Create a test project
mkdir /tmp/decantr-test && cd /tmp/decantr-test

# Create a custom theme
decantr theme create mytest

# Verify it was created
ls -la .decantr/custom/themes/

# List themes
decantr list themes

# Validate the theme
decantr theme validate mytest

# Clean up
cd .. && rm -rf /tmp/decantr-test
```

- [ ] **Step 4: Commit final integration**

```bash
git add -A
git commit -m "feat: complete custom themes implementation"
```

---

## Summary

This implementation adds:
1. `custom:` prefix routing in RegistryClient
2. Theme validation with strict schema checking
3. CLI `theme` subcommand (create, list, validate, delete, import)
4. Integration with `list themes` to show custom themes
5. Core pipeline treating custom themes as addons
6. Guard validation aware of custom themes
