# WS3: Content Resolver Fix

## Problem

The registry resolver only looks in `content/{type}/` but some content is in `content/core/{type}/`:

```
content/
├── patterns/           ← resolver looks here
├── recipes/            ← resolver looks here
├── themes/             ← resolver looks here
└── core/
    ├── patterns/       ← resolver IGNORES (has hero.json)
    ├── recipes/        ← resolver IGNORES (has auradecantism.json)
    └── shells.json
```

## Root Cause

In `packages/registry/src/resolver.ts`:

```typescript
export function createResolver(options: ResolverOptions): ContentResolver {
  const { contentRoot, overridePaths = [] } = options;
  return {
    async resolve<T extends ContentType>(type: T, id: string) {
      // Only checks contentRoot/{type}/, not contentRoot/core/{type}/
      const corePath = join(contentRoot, dir, fileName);
      // ...
    }
  }
}
```

Similarly, in `packages/cli/src/registry.ts`:

```typescript
function loadFromBundled<T>(contentType: string, id?: string) {
  // Only loads from content/{type}/, not content/core/{type}/
  const dir = join(contentRoot, contentType);
  // ...
}
```

## Solution

Update both resolvers to check `content/core/{type}/` as a fallback.

## Files to Modify

### 1. `packages/registry/src/resolver.ts`

```typescript
export function createResolver(options: ResolverOptions): ContentResolver {
  const { contentRoot, overridePaths = [] } = options;
  return {
    async resolve<T extends ContentType>(type: T, id: string): Promise<ResolvedContent<ContentMap[T]> | null> {
      const dir = TYPE_DIRS[type];
      const fileName = `${id}.json`;

      // Check override paths first
      for (const overridePath of overridePaths) {
        const filePath = join(overridePath, dir, fileName);
        const item = await tryLoadJson<ContentMap[T]>(filePath);
        if (item) return { item, source: 'local', path: filePath };
      }

      // Check main content directory
      const mainPath = join(contentRoot, dir, fileName);
      const mainItem = await tryLoadJson<ContentMap[T]>(mainPath);
      if (mainItem) return { item: mainItem, source: 'core', path: mainPath };

      // NEW: Check content/core/{type}/ as fallback
      const corePath = join(contentRoot, 'core', dir, fileName);
      const coreItem = await tryLoadJson<ContentMap[T]>(corePath);
      if (coreItem) return { item: coreItem, source: 'core', path: corePath };

      return null;
    },
  };
}
```

### 2. `packages/cli/src/registry.ts`

Update `loadFromBundled` function:

```typescript
function loadFromBundled<T>(
  contentType: string,
  id?: string
): FetchResult<T> | null {
  const contentRoot = getBundledContentRoot();

  if (id) {
    // Load single item - check main dir first, then core
    const mainPath = join(contentRoot, contentType, `${id}.json`);
    if (existsSync(mainPath)) {
      try {
        const data = JSON.parse(readFileSync(mainPath, 'utf-8')) as T;
        return { data, source: { type: 'bundled' } };
      } catch { /* fall through */ }
    }

    // Check core directory
    const corePath = join(contentRoot, 'core', contentType, `${id}.json`);
    if (existsSync(corePath)) {
      try {
        const data = JSON.parse(readFileSync(corePath, 'utf-8')) as T;
        return { data, source: { type: 'bundled' } };
      } catch { /* fall through */ }
    }

    return null;
  } else {
    // Load all items - merge main and core directories
    const mainDir = join(contentRoot, contentType);
    const coreDir = join(contentRoot, 'core', contentType);
    const items: Array<{ id: string; [key: string]: unknown }> = [];

    // Load from main directory
    if (existsSync(mainDir)) {
      try {
        const files = readdirSync(mainDir).filter(f => f.endsWith('.json'));
        for (const f of files) {
          const content = JSON.parse(readFileSync(join(mainDir, f), 'utf-8'));
          items.push({ id: content.id || f.replace('.json', ''), ...content });
        }
      } catch { /* ignore errors */ }
    }

    // Load from core directory (don't duplicate if id already exists)
    if (existsSync(coreDir)) {
      try {
        const files = readdirSync(coreDir).filter(f => f.endsWith('.json'));
        const existingIds = new Set(items.map(i => i.id));
        for (const f of files) {
          const content = JSON.parse(readFileSync(join(coreDir, f), 'utf-8'));
          const itemId = content.id || f.replace('.json', '');
          if (!existingIds.has(itemId)) {
            items.push({ id: itemId, ...content });
          }
        }
      } catch { /* ignore errors */ }
    }

    if (items.length === 0) return null;

    return {
      data: { items, total: items.length } as unknown as T,
      source: { type: 'bundled' },
    };
  }
}
```

## Tests to Add

### `packages/registry/test/resolver.test.ts`

Add test case:

```typescript
describe('createResolver', () => {
  // ... existing tests ...

  it('resolves content from core directory as fallback', async () => {
    const resolver = createResolver({ contentRoot: FIXTURES_ROOT });

    // Assuming hero.json is in core/patterns/
    const result = await resolver.resolve('pattern', 'hero');

    expect(result).not.toBeNull();
    expect(result?.source).toBe('core');
    expect(result?.path).toContain('core/patterns/hero.json');
  });

  it('prefers main directory over core directory', async () => {
    const resolver = createResolver({ contentRoot: FIXTURES_ROOT });

    // If kpi-grid exists in both, main should win
    const result = await resolver.resolve('pattern', 'kpi-grid');

    expect(result).not.toBeNull();
    expect(result?.path).not.toContain('/core/');
  });
});
```

### `packages/cli/test/registry.test.ts`

Add test case:

```typescript
describe('loadFromBundled', () => {
  it('loads single item from core directory', () => {
    const result = loadFromBundled('patterns', 'hero');
    expect(result).not.toBeNull();
    expect(result?.data.id).toBe('hero');
  });

  it('lists items from both main and core directories', () => {
    const result = loadFromBundled('patterns');
    expect(result).not.toBeNull();

    const ids = result?.data.items.map(i => i.id);
    expect(ids).toContain('kpi-grid');  // from main
    expect(ids).toContain('hero');       // from core
  });

  it('does not duplicate items if same id in both', () => {
    const result = loadFromBundled('patterns');
    const ids = result?.data.items.map(i => i.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids?.length).toBe(uniqueIds.length);
  });
});
```

## Validation

```bash
# Build packages
pnpm build

# Test resolver directly
cd packages/registry && pnpm test

# Test CLI resolution
npx decantr get pattern hero  # Should find it in core/
npx decantr list patterns     # Should include hero

# Full test suite
pnpm test
```

## Checklist

- [ ] Update `packages/registry/src/resolver.ts` to check `content/core/{type}/`
- [ ] Update `packages/cli/src/registry.ts` `loadFromBundled` to check core directory
- [ ] Add tests for core directory resolution in `packages/registry/test/resolver.test.ts`
- [ ] Add tests for CLI bundled loading in `packages/cli/test/registry.test.ts`
- [ ] Run full test suite: `pnpm test`
- [ ] Verify CLI commands work with core content
- [ ] Commit: `fix(registry): resolve content from core directory as fallback`
