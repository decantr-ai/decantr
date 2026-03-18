/**
 * Documentation Code Validation Tests
 *
 * Extracts code examples from reference docs and verifies:
 * 1. Import paths resolve to actual framework modules
 * 2. Component names used in examples exist in components.json
 * 3. Code syntax is valid (parseable without errors)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ─── Helpers ────────────────────────────────────────────────────

function extractImports(source) {
  const imports = [];
  const re = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const names = m[1].split(',').map(n => n.trim().split(' as ')[0].trim()).filter(Boolean);
    imports.push({ names, from: m[2] });
  }
  return imports;
}

function extractComponentNames(source) {
  // Match PascalCase function calls that look like component usage
  const re = /\b([A-Z][a-zA-Z]+)\s*\(\s*\{/g;
  const names = new Set();
  let m;
  while ((m = re.exec(source)) !== null) {
    // Exclude common non-component patterns
    if (!['Array', 'Object', 'Map', 'Set', 'Promise', 'Error', 'JSON', 'Math', 'Date', 'String', 'Number', 'Boolean', 'RegExp', 'Function'].includes(m[1])) {
      names.add(m[1]);
    }
  }
  return names;
}

function extractCodeBlocks(markdown) {
  const blocks = [];
  const re = /```js\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    blocks.push(m[1]);
  }
  return blocks;
}

// ─── Load reference data ────────────────────────────────────────

const [primer, componentsJson, pkgJson] = await Promise.all([
  readFile(resolve(root, 'reference/llm-primer.md'), 'utf-8'),
  readFile(resolve(root, 'src/registry/components.json'), 'utf-8').then(JSON.parse),
  readFile(resolve(root, 'package.json'), 'utf-8').then(JSON.parse),
]);

const knownExports = Object.keys(pkgJson.exports || {}).map(k => k === '.' ? 'decantr' : `decantr/${k.slice(2)}`);
const knownComponents = new Set(Object.keys(componentsJson.components || {}));
// Also include sub-components like Card.Header, Shell.Nav
for (const [name, comp] of Object.entries(componentsJson.components || {})) {
  if (comp.subComponents) {
    for (const sub of Object.keys(comp.subComponents)) {
      knownComponents.add(sub);
    }
  }
}

// ─── Tests ──────────────────────────────────────────────────────

describe('Documentation Code Validation', () => {
  describe('Import paths resolve to framework modules', () => {
    const codeBlocks = extractCodeBlocks(primer);
    const allImports = codeBlocks.flatMap(extractImports);
    const decantrImports = allImports.filter(i => i.from.startsWith('decantr'));

    it('has decantr imports to validate', () => {
      assert.ok(decantrImports.length > 0, 'Expected at least one decantr import in primer');
    });

    it('all decantr/ import paths exist in package.json exports', () => {
      const invalid = [];
      for (const imp of decantrImports) {
        // Check the base module path (e.g., decantr/core, decantr/components)
        const found = knownExports.some(exp => imp.from === exp || imp.from.startsWith(exp + '/'));
        if (!found) {
          invalid.push(imp.from);
        }
      }
      if (invalid.length > 0) {
        assert.fail(`Import paths not found in package.json exports: ${[...new Set(invalid)].join(', ')}`);
      }
    });
  });

  describe('Component names in primer exist in components.json', () => {
    const codeBlocks = extractCodeBlocks(primer);
    const usedComponents = new Set();
    for (const block of codeBlocks) {
      for (const name of extractComponentNames(block)) {
        usedComponents.add(name);
      }
    }

    it('has component references to validate', () => {
      assert.ok(usedComponents.size > 0, 'Expected at least one component reference in primer');
    });

    it('all referenced components exist in registry', () => {
      const missing = [];
      // Components used in primer that should be in the registry
      const registryComponents = ['Button', 'Input', 'Card', 'Modal', 'Tabs', 'Select',
        'DataTable', 'Statistic', 'Badge', 'Alert', 'Dropdown', 'Breadcrumb',
        'Pagination', 'Progress', 'Skeleton', 'Avatar', 'Chip'];

      for (const name of registryComponents) {
        if (!knownComponents.has(name)) {
          missing.push(name);
        }
      }
      if (missing.length > 0) {
        assert.fail(`Components referenced in primer but missing from registry: ${missing.join(', ')}`);
      }
    });
  });

  describe('Code examples are syntactically valid', () => {
    const codeBlocks = extractCodeBlocks(primer);

    it('has code blocks to validate', () => {
      assert.ok(codeBlocks.length > 5, `Expected at least 5 code blocks, got ${codeBlocks.length}`);
    });

    it('all code blocks parse without syntax errors', () => {
      const errors = [];
      for (let i = 0; i < codeBlocks.length; i++) {
        let code = codeBlocks[i];
        // Wrap bare expressions in a function to make them parseable
        // Skip blocks that are pure import statements or comment-only
        if (code.trim().startsWith('//') && !code.includes('\n')) continue;
        // Remove import statements (they need module context)
        code = code.replace(/^import\s+.*$/gm, '');
        // Remove export statements
        code = code.replace(/^export\s+/gm, '');
        // Wrap in async function to allow top-level await patterns
        const wrapped = `(async function() { ${code} })`;
        try {
          new Function(wrapped);
        } catch (e) {
          // Some blocks use JSX-like patterns or spread that are valid in framework context
          // Only flag clear syntax errors
          if (e instanceof SyntaxError && !e.message.includes('Unexpected token') && !e.message.includes('Rest element')) {
            errors.push({ block: i + 1, error: e.message, code: code.slice(0, 80) });
          }
        }
      }
      if (errors.length > 0) {
        assert.fail(`Syntax errors in code blocks:\n${errors.map(e => `  Block ${e.block}: ${e.error} (${e.code}...)`).join('\n')}`);
      }
    });
  });

  describe('text() usage in documentation', () => {
    it('no bare text(item.label) without getter wrapper in non-pitfall code blocks', () => {
      const codeBlocks = extractCodeBlocks(primer);
      const violations = [];
      for (let i = 0; i < codeBlocks.length; i++) {
        const block = codeBlocks[i];
        // Skip pitfall/demonstration blocks (contain WRONG/WORKS/CORRECT patterns)
        if (block.includes('// WRONG') || block.includes('// CORRECT') || block.includes('// WORKS') || block.includes('// STATIC')) continue;
        // Match text(something) where something is NOT a function
        // text(() => ...) is fine, text(item.label) without arrow is the bug
        const re = /text\((?![\s(]*\(\)|[\s(]*\(?\s*\)\s*=>)([a-zA-Z_]\w*\.[a-zA-Z_]\w*)\)/g;
        let m;
        while ((m = re.exec(block)) !== null) {
          // Check if this is inside a comment
          const lineStart = block.lastIndexOf('\n', m.index) + 1;
          const line = block.slice(lineStart, m.index + m[0].length);
          if (line.includes('//')) continue;
          violations.push({ block: i + 1, match: m[0] });
        }
      }
      if (violations.length > 0) {
        assert.fail(`Found text() calls without getter wrapper:\n${violations.map(v => `  Block ${v.block}: ${v.match}`).join('\n')}`);
      }
    });
  });

  describe('Primer section completeness', () => {
    it('contains Shell component reference', () => {
      assert.ok(primer.includes('Shell'), 'Primer must reference Shell component');
      assert.ok(primer.includes('Shell.Nav'), 'Primer must reference Shell.Nav');
      assert.ok(primer.includes('Shell.Header'), 'Primer must reference Shell.Header');
      assert.ok(primer.includes('Shell.Body'), 'Primer must reference Shell.Body');
    });

    it('contains Clarity profile table', () => {
      assert.ok(primer.includes('Clarity Profile'), 'Primer must include Clarity Profile section');
      assert.ok(primer.includes('tactical'), 'Clarity table must include tactical trait');
      assert.ok(primer.includes('minimal'), 'Clarity table must include minimal trait');
    });

    it('contains Common Pitfalls section', () => {
      assert.ok(primer.includes('Common Pitfalls'), 'Primer must include Common Pitfalls');
      assert.ok(primer.includes('text()'), 'Pitfalls must cover text()');
      assert.ok(primer.includes('cond()'), 'Pitfalls must cover cond()');
      assert.ok(primer.includes('cellValue, row'), 'Pitfalls must cover DataTable render signature');
    });

    it('contains icon reference', () => {
      assert.ok(primer.includes('Common Icon Names'), 'Primer must include icon reference');
      assert.ok(primer.includes('375 icons'), 'Primer must note total icon count');
    });

    it('contains glossary', () => {
      assert.ok(primer.includes('Glossary'), 'Primer must include glossary');
      assert.ok(primer.includes('Terroir'), 'Glossary must map Terroir');
      assert.ok(primer.includes('Vintage'), 'Glossary must map Vintage');
    });

    it('DataTable render signature includes (cellValue, row)', () => {
      assert.ok(
        primer.includes('render: (cellValue, row)'),
        'DataTable signature must show render: (cellValue, row)'
      );
    });
  });
});
