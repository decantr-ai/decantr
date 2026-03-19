import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { version as v050, migrate as m050 } from '../tools/migrations/0.5.0.js';
import { version as v060, migrate as m060 } from '../tools/migrations/0.6.0.js';

// ============================================================
// Version Detection
// ============================================================

describe('version detection', () => {
  it('0.5.0 migration exports correct version', () => {
    assert.equal(v050, '0.5.0');
  });

  it('0.6.0 migration exports correct version', () => {
    assert.equal(v060, '0.6.0');
  });

  it('missing version field defaults to 0.4.0 (convention)', () => {
    // The CLI uses essence.version || '0.4.0' — migrations don't need
    // to handle detection, but we verify the assumption
    const essence = { terroir: 'ecommerce' };
    assert.equal(essence.version || '0.4.0', '0.4.0');
  });
});

// ============================================================
// 0.5.0 Migration: organs → tannins, anatomy → structure
// ============================================================

describe('0.5.0 migration', () => {
  it('renames organs to tannins', () => {
    const input = { organs: ['auth', 'search'], terroir: 'ecommerce' };
    const result = m050(input);
    assert.deepEqual(result.tannins, ['auth', 'search']);
    assert.equal(result.organs, undefined);
  });

  it('renames anatomy to structure', () => {
    const input = {
      anatomy: [{ id: 'home', skeleton: 'full-bleed', blend: ['hero'] }],
      terroir: 'portfolio',
    };
    const result = m050(input);
    assert.deepEqual(result.structure, [{ id: 'home', skeleton: 'full-bleed', blend: ['hero'] }]);
    assert.equal(result.anatomy, undefined);
  });

  it('renames both organs and anatomy in one pass', () => {
    const input = {
      terroir: 'ecommerce',
      organs: ['payments'],
      anatomy: [{ id: 'catalog', skeleton: 'sidebar-main', blend: ['card-grid'] }],
    };
    const result = m050(input);
    assert.deepEqual(result.tannins, ['payments']);
    assert.deepEqual(result.structure, [{ id: 'catalog', skeleton: 'sidebar-main', blend: ['card-grid'] }]);
    assert.equal(result.organs, undefined);
    assert.equal(result.anatomy, undefined);
  });

  it('sets version to 0.5.0', () => {
    const result = m050({ terroir: 'ecommerce' });
    assert.equal(result.version, '0.5.0');
  });

  it('does not overwrite existing tannins field', () => {
    const input = {
      organs: ['old-auth'],
      tannins: ['new-auth'],
    };
    const result = m050(input);
    assert.deepEqual(result.tannins, ['new-auth']);
    // organs left in place since tannins already exists
    assert.deepEqual(result.organs, ['old-auth']);
  });

  it('does not overwrite existing structure field', () => {
    const input = {
      anatomy: [{ id: 'old' }],
      structure: [{ id: 'new' }],
    };
    const result = m050(input);
    assert.deepEqual(result.structure, [{ id: 'new' }]);
    assert.deepEqual(result.anatomy, [{ id: 'old' }]);
  });

  it('handles sectioned essence — organs in sections', () => {
    const input = {
      sections: [
        { id: 'brand', organs: ['analytics'], anatomy: [{ id: 'home' }] },
        { id: 'app', organs: ['auth'], anatomy: [{ id: 'dashboard' }] },
      ],
    };
    const result = m050(input);
    assert.deepEqual(result.sections[0].tannins, ['analytics']);
    assert.deepEqual(result.sections[0].structure, [{ id: 'home' }]);
    assert.equal(result.sections[0].organs, undefined);
    assert.equal(result.sections[0].anatomy, undefined);
    assert.deepEqual(result.sections[1].tannins, ['auth']);
    assert.deepEqual(result.sections[1].structure, [{ id: 'dashboard' }]);
  });

  it('renames shared_organs to shared_tannins', () => {
    const input = {
      sections: [{ id: 'brand' }],
      shared_organs: ['auth'],
    };
    const result = m050(input);
    assert.deepEqual(result.shared_tannins, ['auth']);
    assert.equal(result.shared_organs, undefined);
  });

  it('no-op when already has tannins and structure', () => {
    const input = {
      terroir: 'ecommerce',
      tannins: ['auth'],
      structure: [{ id: 'home' }],
      version: '0.4.2',
    };
    const result = m050(input);
    assert.deepEqual(result.tannins, ['auth']);
    assert.deepEqual(result.structure, [{ id: 'home' }]);
    assert.equal(result.version, '0.5.0');
  });
});

// ============================================================
// 0.6.0 Migration: pattern consolidation to presets
// ============================================================

describe('0.6.0 migration', () => {
  it('converts recipe-hero to hero preset', () => {
    const input = {
      structure: [{ id: 'home', blend: ['recipe-hero'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'hero', preset: 'image-overlay', as: 'recipe-hero',
    });
  });

  it('converts product-grid to card-grid preset', () => {
    const input = {
      structure: [{ id: 'catalog', blend: ['product-grid'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'card-grid', preset: 'product', as: 'product-grid',
    });
  });

  it('converts profile-header to detail-header preset', () => {
    const input = {
      structure: [{ id: 'profile', blend: ['profile-header'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'detail-header', preset: 'profile', as: 'profile-header',
    });
  });

  it('converts recipe-stats-bar to stats-bar (no preset)', () => {
    const input = {
      structure: [{ id: 'recipe', blend: ['recipe-stats-bar'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], { pattern: 'stats-bar' });
  });

  it('converts recipe-ingredients to checklist-card', () => {
    const input = {
      structure: [{ id: 'recipe', blend: ['recipe-ingredients'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], { pattern: 'checklist-card' });
  });

  it('converts recipe-instructions to steps-card', () => {
    const input = {
      structure: [{ id: 'recipe', blend: ['recipe-instructions'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], { pattern: 'steps-card' });
  });

  it('converts nutrition-card to stat-card', () => {
    const input = {
      structure: [{ id: 'recipe', blend: ['nutrition-card'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], { pattern: 'stat-card' });
  });

  it('converts cookbook-hero to hero image-overlay-compact preset', () => {
    const input = {
      structure: [{ id: 'cookbook', blend: ['cookbook-hero'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'hero', preset: 'image-overlay-compact', as: 'cookbook-hero',
    });
  });

  it('converts recipe-card-grid to card-grid content preset', () => {
    const input = {
      structure: [{ id: 'feed', blend: ['recipe-card-grid'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'card-grid', preset: 'content', as: 'recipe-card-grid',
    });
  });

  it('converts cookbook-grid to card-grid collection preset', () => {
    const input = {
      structure: [{ id: 'cookbooks', blend: ['cookbook-grid'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'card-grid', preset: 'collection', as: 'cookbook-grid',
    });
  });

  it('converts feature-grid to card-grid icon preset', () => {
    const input = {
      structure: [{ id: 'features', blend: ['feature-grid'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'card-grid', preset: 'icon', as: 'feature-grid',
    });
  });

  it('converts recipe-form-simple to form-sections creation preset', () => {
    const input = {
      structure: [{ id: 'create', blend: ['recipe-form-simple'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'form-sections', preset: 'creation', as: 'recipe-form-simple',
    });
  });

  it('converts recipe-form-chef to form-sections structured preset', () => {
    const input = {
      structure: [{ id: 'create', blend: ['recipe-form-chef'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'form-sections', preset: 'structured', as: 'recipe-form-chef',
    });
  });

  it('leaves unknown pattern strings unchanged', () => {
    const input = {
      structure: [{ id: 'home', blend: ['hero', 'data-table', 'custom-thing'] }],
    };
    const result = m060(input);
    assert.equal(result.structure[0].blend[0], 'hero');
    assert.equal(result.structure[0].blend[1], 'data-table');
    assert.equal(result.structure[0].blend[2], 'custom-thing');
  });

  it('handles multiple old patterns in one blend', () => {
    const input = {
      structure: [{
        id: 'recipe',
        blend: ['recipe-hero', 'recipe-stats-bar', 'recipe-ingredients', 'recipe-instructions', 'nutrition-card'],
      }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend, [
      { pattern: 'hero', preset: 'image-overlay', as: 'recipe-hero' },
      { pattern: 'stats-bar' },
      { pattern: 'checklist-card' },
      { pattern: 'steps-card' },
      { pattern: 'stat-card' },
    ]);
  });

  it('preserves cols objects in blend', () => {
    const input = {
      structure: [{
        id: 'home',
        blend: [
          'recipe-hero',
          { cols: ['a', 'b'], at: 'lg' },
          'data-table',
        ],
      }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'hero', preset: 'image-overlay', as: 'recipe-hero',
    });
    assert.deepEqual(result.structure[0].blend[1], { cols: ['a', 'b'], at: 'lg' });
    assert.equal(result.structure[0].blend[2], 'data-table');
  });

  it('handles sectioned essences', () => {
    const input = {
      sections: [
        {
          id: 'recipes',
          structure: [{ id: 'detail', blend: ['recipe-hero', 'recipe-ingredients'] }],
        },
      ],
    };
    const result = m060(input);
    assert.deepEqual(result.sections[0].structure[0].blend, [
      { pattern: 'hero', preset: 'image-overlay', as: 'recipe-hero' },
      { pattern: 'checklist-card' },
    ]);
  });

  it('sets version to 0.6.0', () => {
    const result = m060({ structure: [] });
    assert.equal(result.version, '0.6.0');
  });

  it('no-op when no old pattern names in blend', () => {
    const input = {
      structure: [{ id: 'home', blend: ['hero', 'card-grid', 'data-table'] }],
    };
    const result = m060(input);
    assert.equal(result.structure[0].blend[0], 'hero');
    assert.equal(result.structure[0].blend[1], 'card-grid');
    assert.equal(result.structure[0].blend[2], 'data-table');
    assert.equal(result.version, '0.6.0');
  });

  it('handles empty blend array', () => {
    const input = { structure: [{ id: 'empty', blend: [] }] };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend, []);
  });

  it('handles missing structure', () => {
    const input = { terroir: 'portfolio' };
    const result = m060(input);
    assert.equal(result.structure, undefined);
    assert.equal(result.version, '0.6.0');
  });

  it('preserves existing v2 preset references', () => {
    const input = {
      structure: [{
        id: 'catalog',
        blend: [
          { pattern: 'hero', preset: 'landing' },
          'product-grid',
        ],
      }],
    };
    const result = m060(input);
    // Existing preset ref should pass through unchanged
    assert.deepEqual(result.structure[0].blend[0], { pattern: 'hero', preset: 'landing' });
    // Old name should be converted
    assert.deepEqual(result.structure[0].blend[1], {
      pattern: 'card-grid', preset: 'product', as: 'product-grid',
    });
  });

  it('handles patterns key as alias for blend', () => {
    const input = {
      structure: [{ id: 'home', patterns: ['recipe-hero'] }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].patterns[0], {
      pattern: 'hero', preset: 'image-overlay', as: 'recipe-hero',
    });
  });
});

// ============================================================
// Migration Chain
// ============================================================

describe('migration chain (0.5.0 then 0.6.0)', () => {
  it('applies both migrations in sequence', () => {
    const input = {
      terroir: 'recipe-community',
      organs: ['auth', 'search'],
      anatomy: [
        { id: 'home', skeleton: 'top-nav-main', blend: ['recipe-hero', 'recipe-card-grid'] },
        { id: 'detail', skeleton: 'top-nav-main', blend: ['recipe-hero', 'recipe-stats-bar', 'recipe-ingredients', 'recipe-instructions', 'nutrition-card'] },
      ],
    };

    const after050 = m050(input);
    assert.equal(after050.version, '0.5.0');
    assert.deepEqual(after050.tannins, ['auth', 'search']);
    assert.ok(after050.structure);
    assert.equal(after050.organs, undefined);
    assert.equal(after050.anatomy, undefined);

    const after060 = m060(after050);
    assert.equal(after060.version, '0.6.0');
    assert.deepEqual(after060.structure[0].blend[0], {
      pattern: 'hero', preset: 'image-overlay', as: 'recipe-hero',
    });
    assert.deepEqual(after060.structure[0].blend[1], {
      pattern: 'card-grid', preset: 'content', as: 'recipe-card-grid',
    });
    assert.deepEqual(after060.structure[1].blend, [
      { pattern: 'hero', preset: 'image-overlay', as: 'recipe-hero' },
      { pattern: 'stats-bar' },
      { pattern: 'checklist-card' },
      { pattern: 'steps-card' },
      { pattern: 'stat-card' },
    ]);
  });

  it('chain works on sectioned essence', () => {
    const input = {
      sections: [
        {
          id: 'recipes',
          path: '/recipes',
          organs: ['search'],
          anatomy: [{ id: 'feed', blend: ['recipe-card-grid'] }],
        },
      ],
      shared_organs: ['auth'],
    };

    const after050 = m050(input);
    assert.deepEqual(after050.sections[0].tannins, ['search']);
    assert.ok(after050.sections[0].structure);
    assert.deepEqual(after050.shared_tannins, ['auth']);

    const after060 = m060(after050);
    assert.deepEqual(after060.sections[0].structure[0].blend[0], {
      pattern: 'card-grid', preset: 'content', as: 'recipe-card-grid',
    });
  });
});

// ============================================================
// Essence Integrity
// ============================================================

describe('essence integrity', () => {
  it('0.5.0 preserves unrelated fields', () => {
    const input = {
      terroir: 'ecommerce',
      vintage: { style: 'glassmorphism', mode: 'dark' },
      character: ['elegant', 'premium'],
      vessel: { type: 'spa', routing: 'hash' },
      organs: ['payments'],
      anatomy: [{ id: 'home' }],
      cork: { enforce_style: true },
      custom_field: 'preserved',
    };
    const result = m050(input);
    assert.equal(result.terroir, 'ecommerce');
    assert.deepEqual(result.vintage, { style: 'glassmorphism', mode: 'dark' });
    assert.deepEqual(result.character, ['elegant', 'premium']);
    assert.deepEqual(result.vessel, { type: 'spa', routing: 'hash' });
    assert.deepEqual(result.cork, { enforce_style: true });
    assert.equal(result.custom_field, 'preserved');
  });

  it('0.6.0 preserves unrelated fields', () => {
    const input = {
      terroir: 'ecommerce',
      vintage: { style: 'auradecantism', mode: 'dark', recipe: 'auradecantism' },
      character: ['tactical'],
      tannins: ['auth'],
      structure: [{ id: 'home', skeleton: 'sidebar-main', blend: ['hero'], surface: '_flex _col' }],
      cork: { enforce_style: true, enforce_recipe: true },
      custom_field: 42,
    };
    const result = m060(input);
    assert.equal(result.terroir, 'ecommerce');
    assert.deepEqual(result.vintage, { style: 'auradecantism', mode: 'dark', recipe: 'auradecantism' });
    assert.deepEqual(result.character, ['tactical']);
    assert.deepEqual(result.tannins, ['auth']);
    assert.deepEqual(result.cork, { enforce_style: true, enforce_recipe: true });
    assert.equal(result.custom_field, 42);
    // surface preserved on page
    assert.equal(result.structure[0].surface, '_flex _col');
  });

  it('0.6.0 preserves page-level fields (skeleton, surface, id)', () => {
    const input = {
      structure: [{
        id: 'recipe-detail',
        skeleton: 'top-nav-main',
        surface: '_flex _col _gap6 _p6',
        blend: ['recipe-hero', 'data-table'],
      }],
    };
    const result = m060(input);
    assert.equal(result.structure[0].id, 'recipe-detail');
    assert.equal(result.structure[0].skeleton, 'top-nav-main');
    assert.equal(result.structure[0].surface, '_flex _col _gap6 _p6');
  });

  it('migrations do not mutate the original essence', () => {
    const input = {
      organs: ['auth'],
      anatomy: [{ id: 'home', blend: ['recipe-hero'] }],
    };
    const inputCopy = JSON.parse(JSON.stringify(input));
    m050(input);
    assert.deepEqual(input, inputCopy);
  });

  it('0.6.0 does not mutate the original essence', () => {
    const input = {
      structure: [{ id: 'home', blend: ['recipe-hero'] }],
    };
    const inputCopy = JSON.parse(JSON.stringify(input));
    m060(input);
    assert.deepEqual(input, inputCopy);
  });
});

// ============================================================
// Edge Cases
// ============================================================

describe('edge cases', () => {
  it('empty essence object', () => {
    const result050 = m050({});
    assert.equal(result050.version, '0.5.0');

    const result060 = m060({});
    assert.equal(result060.version, '0.6.0');
  });

  it('structure with no blend', () => {
    const input = {
      structure: [{ id: 'home', skeleton: 'full-bleed' }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0], { id: 'home', skeleton: 'full-bleed' });
  });

  it('sections with empty structure arrays', () => {
    const input = {
      sections: [{ id: 'brand', structure: [] }],
    };
    const result = m060(input);
    assert.deepEqual(result.sections[0].structure, []);
  });

  it('sections without structure field', () => {
    const input = {
      sections: [{ id: 'brand', path: '/' }],
    };
    const result = m060(input);
    assert.equal(result.sections[0].structure, undefined);
  });

  it('blend with mixed string and object items', () => {
    const input = {
      structure: [{
        id: 'home',
        blend: [
          'recipe-hero',
          { pattern: 'card-grid', preset: 'product' },
          { cols: ['a', 'b'], span: { a: 2 }, at: 'lg' },
          'recipe-instructions',
        ],
      }],
    };
    const result = m060(input);
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'hero', preset: 'image-overlay', as: 'recipe-hero',
    });
    assert.deepEqual(result.structure[0].blend[1], { pattern: 'card-grid', preset: 'product' });
    assert.deepEqual(result.structure[0].blend[2], { cols: ['a', 'b'], span: { a: 2 }, at: 'lg' });
    assert.deepEqual(result.structure[0].blend[3], { pattern: 'steps-card' });
  });

  it('handles null sections gracefully', () => {
    const input = { sections: null };
    // Should not throw
    const result = m050(input);
    assert.equal(result.sections, null);
  });

  it('version field is overwritten by each migration', () => {
    const input = { version: '0.3.0' };
    const after050 = m050(input);
    assert.equal(after050.version, '0.5.0');
    const after060 = m060(after050);
    assert.equal(after060.version, '0.6.0');
  });
});
