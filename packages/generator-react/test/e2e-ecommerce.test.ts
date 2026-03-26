import { describe, it, expect } from 'vitest';
import { runPipeline } from '@decantr/generator-core';
import { createReactPlugin } from '../src/plugin.js';
import { validateReactOutput } from '../src/quality-rules.js';
import type { EssenceFile } from '@decantr/essence-spec';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// AUTO: Use content/core as contentRoot (recipes live there) and content/ as override (patterns live there)
const repoRoot = join(import.meta.dirname, '..', '..', '..');
const contentRoot = join(repoRoot, 'content', 'core');
const overridePaths = [join(repoRoot, 'content')];

function loadEssence(): EssenceFile {
  const path = join(repoRoot, 'examples', 'ecommerce', 'decantr.essence.json');
  return JSON.parse(readFileSync(path, 'utf-8'));
}

async function generate() {
  return runPipeline(loadEssence(), {
    projectRoot: '/tmp/test-react-ecommerce',
    contentRoot,
    overridePaths,
    plugin: createReactPlugin(),
    dryRun: true,
  });
}

describe('E2E: React E-commerce Generation', () => {
  it('loads essence, validates, and generates React project', async () => {
    const result = await generate();
    expect(result.files.length).toBeGreaterThan(0);
    expect(result.dryRun).toBe(true);
  });

  it('generates 4 page files: home, catalog, product-detail, cart', async () => {
    const result = await generate();
    const paths = result.files.map(f => f.path);
    expect(paths).toContain('src/pages/home.tsx');
    expect(paths).toContain('src/pages/catalog.tsx');
    expect(paths).toContain('src/pages/product-detail.tsx');
    expect(paths).toContain('src/pages/cart.tsx');
  });

  it('generates App.tsx with top-nav-main shell (NavigationMenu, not Sidebar)', async () => {
    const result = await generate();
    const appTsx = result.files.find(f => f.path === 'src/App.tsx')!;
    expect(appTsx).toBeDefined();

    // Top nav shell uses NavigationMenu
    expect(appTsx.content).toContain('NavigationMenu');
    expect(appTsx.content).toContain('NavigationMenuList');

    // Should NOT have sidebar components
    expect(appTsx.content).not.toContain('<Sidebar ');
    expect(appTsx.content).not.toContain('SidebarProvider');
    expect(appTsx.content).not.toContain('SidebarContent');

    // Router and lazy loading
    expect(appTsx.content).toContain('HashRouter');
    expect(appTsx.content).toContain('React.lazy');
    expect(appTsx.content).toContain('<React.Suspense');
  });

  it('home page contains hero + two card-grid instances + cta-section', async () => {
    const result = await generate();
    const home = result.files.find(f => f.path === 'src/pages/home.tsx')!;
    expect(home).toBeDefined();
    expect(home.content).toContain('export default function HomePage');

    // Hero pattern
    expect(home.content).toContain('Hero');

    // Two card-grid instances use their aliases as component names
    // AUTO: aliased patterns get PascalCase of alias, not the pattern id
    expect(home.content).toContain('FeaturedCollections');
    expect(home.content).toContain('TrendingProducts');

    // CTA section
    expect(home.content).toContain('CtaSection');
  });

  it('catalog page contains filter-bar + card-grid with wired search state', async () => {
    const result = await generate();
    const catalog = result.files.find(f => f.path === 'src/pages/catalog.tsx')!;
    expect(catalog).toBeDefined();
    expect(catalog.content).toContain('export default function CatalogPage');

    // Filter bar pattern
    expect(catalog.content).toContain('FilterBar');

    // Card grid pattern
    expect(catalog.content).toContain('CardGrid');

    // Wiring: should have search hook or state shared between filter-bar and card-grid
    // AUTO: The wiring system generates usePageSearch/usePageFilters hooks
    expect(catalog.content).toMatch(/usePageSearch|usePageFilter|search/i);
  });

  it('product-detail page contains detail-header + card-grid (related products)', async () => {
    const result = await generate();
    const detail = result.files.find(f => f.path === 'src/pages/product-detail.tsx')!;
    expect(detail).toBeDefined();
    expect(detail.content).toContain('export default function ProductDetailPage');

    // Detail header pattern
    expect(detail.content).toContain('DetailHeader');

    // Related products card grid (aliased as "related-products")
    expect(detail.content).toContain('RelatedProducts');
  });

  it('cart page contains data-table + cta-section', async () => {
    const result = await generate();
    const cart = result.files.find(f => f.path === 'src/pages/cart.tsx')!;
    expect(cart).toBeDefined();
    expect(cart.content).toContain('export default function CartPage');

    // Data table pattern
    expect(cart.content).toContain('DataTable');

    // CTA section
    expect(cart.content).toContain('CtaSection');
  });

  it('product-detail route has :id parameter', async () => {
    const result = await generate();
    const appTsx = result.files.find(f => f.path === 'src/App.tsx')!;
    // AUTO: Pages ending in "-detail" get a dynamic :id route parameter
    expect(appTsx.content).toContain('/product-detail/:id');
  });

  it('all shadcn imports use specific paths (no barrel imports)', async () => {
    const result = await generate();
    const tsxFiles = result.files.filter(f => f.path.endsWith('.tsx'));
    for (const file of tsxFiles) {
      // No barrel imports from @/components/ui (must use @/components/ui/button etc.)
      expect(file.content).not.toMatch(/from ['"]@\/components\/ui['"]/);
      // No barrel imports from lucide-react
      expect(file.content).not.toMatch(/from ['"]lucide-react['"]/);
    }
  });

  it('navigation items match all 4 pages', async () => {
    const result = await generate();
    const appTsx = result.files.find(f => f.path === 'src/App.tsx')!;
    expect(appTsx.content).toContain('Home');
    expect(appTsx.content).toContain('Catalog');
    expect(appTsx.content).toContain('Product detail');
    expect(appTsx.content).toContain('Cart');
  });

  it('auth scaffolding is generated (essence has auth feature)', async () => {
    const result = await generate();
    const paths = result.files.map(f => f.path);
    expect(paths).toContain('src/contexts/AuthContext.tsx');
    expect(paths).toContain('src/components/ProtectedRoute.tsx');
    expect(paths).toContain('src/pages/LoginPage.tsx');

    const appTsx = result.files.find(f => f.path === 'src/App.tsx')!;
    expect(appTsx.content).toContain('AuthProvider');
    expect(appTsx.content).toContain('ProtectedRoute');
  });

  it('page files have correct React imports and export patterns', async () => {
    const result = await generate();
    const pageFiles = result.files.filter(
      f => f.path.startsWith('src/pages/') && f.path !== 'src/pages/LoginPage.tsx'
    );
    for (const page of pageFiles) {
      expect(page.content).toMatch(/import .+ from ['"]react['"]/);
      expect(page.content).toMatch(/export default function \w+Page\(/);
    }
  });

  it('TypeScript imports are syntactically valid', async () => {
    const result = await generate();
    const tsFiles = result.files.filter(f => f.path.endsWith('.tsx') || f.path.endsWith('.ts'));
    for (const file of tsFiles) {
      const importBlocks = file.content.match(/import\s[\s\S]*?from\s+['"][^'"]+['"]\s*;?/g) || [];
      if (file.content.trim().length > 0 && file.content.includes('import ')) {
        expect(importBlocks.length).toBeGreaterThan(0);
      }
      for (const block of importBlocks) {
        expect(block).toMatch(/from\s+['"][^'"]+['"]/);
      }
    }
  });

  it('generated React code has zero CRITICAL or HIGH quality violations', async () => {
    const result = await generate();
    const violations = validateReactOutput(result.files);
    const critical = violations.filter(v => v.severity === 'critical');
    const high = violations.filter(v => v.severity === 'high');

    if (critical.length > 0) {
      const msgs = critical.map(v => `[${v.rule}] ${v.file}:${v.line ?? '?'} - ${v.message}`);
      expect.fail(`CRITICAL quality violations:\n${msgs.join('\n')}`);
    }
    if (high.length > 0) {
      const msgs = high.map(v => `[${v.rule}] ${v.file}:${v.line ?? '?'} - ${v.message}`);
      expect.fail(`HIGH quality violations:\n${msgs.join('\n')}`);
    }
  });

  it('project scaffolding files are present', async () => {
    const result = await generate();
    const paths = result.files.map(f => f.path);
    expect(paths).toContain('package.json');
    expect(paths).toContain('tailwind.config.ts');
    expect(paths).toContain('vite.config.ts');
    expect(paths).toContain('tsconfig.json');
    expect(paths).toContain('src/globals.css');
    expect(paths).toContain('index.html');
  });
});
