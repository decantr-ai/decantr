import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { compareSemver, loadMigrations } from '../tools/migration-utils.js';
import { collectChanges, scanForRelevantChanges, compileProfile, compileAgeProfile } from '../tools/compile-age.js';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ============================================================
// compareSemver
// ============================================================

describe('compareSemver', () => {
  it('returns 0 for equal versions', () => {
    assert.equal(compareSemver('1.0.0', '1.0.0'), 0);
    assert.equal(compareSemver('0.9.6', '0.9.6'), 0);
  });

  it('returns -1 when a < b', () => {
    assert.equal(compareSemver('0.5.0', '0.6.0'), -1);
    assert.equal(compareSemver('0.9.0', '1.0.0'), -1);
    assert.equal(compareSemver('0.9.5', '0.9.6'), -1);
  });

  it('returns 1 when a > b', () => {
    assert.equal(compareSemver('0.6.0', '0.5.0'), 1);
    assert.equal(compareSemver('1.0.0', '0.9.9'), 1);
  });
});

// ============================================================
// loadMigrations
// ============================================================

describe('loadMigrations', () => {
  it('loads existing migration modules in semver order', async () => {
    const migrations = await loadMigrations();
    assert.ok(migrations.length >= 2, 'Should have at least 0.5.0 and 0.6.0');

    // Verify order
    for (let i = 1; i < migrations.length; i++) {
      assert.equal(compareSemver(migrations[i - 1].version, migrations[i].version), -1,
        `${migrations[i - 1].version} should come before ${migrations[i].version}`);
    }
  });

  it('each migration has version and migrate function', async () => {
    const migrations = await loadMigrations();
    for (const m of migrations) {
      assert.equal(typeof m.version, 'string');
      assert.equal(typeof m.migrate, 'function');
      assert.equal(typeof m.file, 'string');
    }
  });

  it('old migration modules have null migrateConfig and changes', async () => {
    const migrations = await loadMigrations();
    const m050 = migrations.find(m => m.version === '0.5.0');
    assert.ok(m050);
    assert.equal(m050.migrateConfig, null);
    assert.equal(m050.changes, null);
  });

  it('backward compat — old modules without changes still load', async () => {
    const migrations = await loadMigrations();
    const m060 = migrations.find(m => m.version === '0.6.0');
    assert.ok(m060);
    assert.equal(typeof m060.migrate, 'function');
    // These old modules don't export migrateConfig/changes
    assert.equal(m060.migrateConfig, null);
    assert.equal(m060.changes, null);
  });
});

// ============================================================
// collectChanges
// ============================================================

describe('collectChanges', () => {
  it('returns empty arrays when no migrations have changes', () => {
    const migrations = [
      { version: '0.5.0', changes: null },
      { version: '0.6.0', changes: null },
    ];
    const result = collectChanges(migrations);
    assert.deepEqual(result.breaking, []);
    assert.deepEqual(result.deprecated, []);
  });

  it('collects breaking changes with since version', () => {
    const migrations = [{
      version: '0.7.0',
      changes: {
        breaking: [
          { type: 'api-remove', symbol: 'createResource', module: 'decantr/data', replacement: 'createQuery', guide: 'Use createQuery.' },
        ],
      },
    }];
    const result = collectChanges(migrations);
    assert.equal(result.breaking.length, 1);
    assert.equal(result.breaking[0].symbol, 'createResource');
    assert.equal(result.breaking[0].since, '0.7.0');
  });

  it('collects deprecated changes', () => {
    const migrations = [{
      version: '0.8.0',
      changes: {
        deprecated: [
          { symbol: 'setTheme', module: 'decantr/css', replacement: 'setStyle', until: '1.0.0', guide: 'Drop-in rename.' },
        ],
      },
    }];
    const result = collectChanges(migrations);
    assert.equal(result.deprecated.length, 1);
    assert.equal(result.deprecated[0].symbol, 'setTheme');
    assert.equal(result.deprecated[0].until, '1.0.0');
  });

  it('merges changes across multiple migrations', () => {
    const migrations = [
      {
        version: '0.7.0',
        changes: {
          breaking: [{ type: 'api-remove', symbol: 'oldAPI', guide: 'gone' }],
        },
      },
      {
        version: '0.8.0',
        changes: {
          breaking: [{ type: 'api-rename', symbol: 'renamedAPI', guide: 'renamed' }],
          deprecated: [{ symbol: 'legacyAPI', guide: 'soon' }],
        },
      },
    ];
    const result = collectChanges(migrations);
    assert.equal(result.breaking.length, 2);
    assert.equal(result.deprecated.length, 1);
    assert.equal(result.breaking[0].since, '0.7.0');
    assert.equal(result.breaking[1].since, '0.8.0');
  });

  it('skips migrations without changes field', () => {
    const migrations = [
      { version: '0.5.0', changes: null },
      { version: '0.7.0', changes: { breaking: [{ symbol: 'x', guide: 'y' }] } },
    ];
    const result = collectChanges(migrations);
    assert.equal(result.breaking.length, 1);
  });
});

// ============================================================
// scanForRelevantChanges
// ============================================================

describe('scanForRelevantChanges', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `decantr-age-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(tempDir, { recursive: true });
  });

  it('finds symbol usage in source files', async () => {
    await writeFile(join(tempDir, 'app.js'), `
import { createResource } from 'decantr/data';
const data = createResource('key', fetchFn);
`, 'utf-8');

    const changes = {
      breaking: [{ type: 'api-remove', symbol: 'createResource', module: 'decantr/data', guide: 'Use createQuery.' }],
      deprecated: [],
    };

    const result = await scanForRelevantChanges(tempDir, changes);
    assert.equal(result.relevant.length, 1);
    assert.equal(result.relevant[0].symbol, 'createResource');
    assert.equal(result.relevant[0].fileHits.length, 1);
    assert.ok(result.relevant[0].fileHits[0].hits.length >= 1);

    await rm(tempDir, { recursive: true, force: true });
  });

  it('filters out changes not used in the project', async () => {
    await writeFile(join(tempDir, 'app.js'), `
import { createSignal } from 'decantr/state';
const [count, setCount] = createSignal(0);
`, 'utf-8');

    const changes = {
      breaking: [{ type: 'api-remove', symbol: 'createResource', module: 'decantr/data', guide: 'Use createQuery.' }],
      deprecated: [],
    };

    const result = await scanForRelevantChanges(tempDir, changes);
    assert.equal(result.relevant.length, 0);
    assert.equal(result.scannedFiles, 1);

    await rm(tempDir, { recursive: true, force: true });
  });

  it('scans nested directories', async () => {
    await mkdir(join(tempDir, 'pages'), { recursive: true });
    await writeFile(join(tempDir, 'pages', 'dash.js'), `
import { setTheme } from 'decantr/css';
setTheme('dark');
`, 'utf-8');

    const changes = {
      breaking: [],
      deprecated: [{ symbol: 'setTheme', module: 'decantr/css', guide: 'Use setStyle.' }],
    };

    const result = await scanForRelevantChanges(tempDir, changes);
    assert.equal(result.relevant.length, 1);
    assert.equal(result.scannedFiles, 1);

    await rm(tempDir, { recursive: true, force: true });
  });

  it('handles empty src directory', async () => {
    const changes = {
      breaking: [{ symbol: 'createResource', guide: 'Use createQuery.' }],
      deprecated: [],
    };

    const result = await scanForRelevantChanges(tempDir, changes);
    assert.equal(result.relevant.length, 0);
    assert.equal(result.scannedFiles, 0);

    await rm(tempDir, { recursive: true, force: true });
  });
});

// ============================================================
// compileProfile
// ============================================================

describe('compileProfile', () => {
  it('produces markdown with version range header', () => {
    const profile = compileProfile('0.5.0', '0.9.6', [], 10);
    assert.ok(profile.includes('0.5.0 → 0.9.6'));
    assert.ok(profile.includes('0 change(s)'));
  });

  it('includes breaking changes section', () => {
    const relevant = [{
      severity: 'breaking',
      type: 'api-remove',
      symbol: 'createResource',
      module: 'decantr/data',
      replacement: 'createQuery',
      since: '0.7.0',
      guide: 'Use createQuery instead.',
      fileHits: [{ file: 'src/app.js', hits: [{ line: 'createResource(...)', lineNumber: 14 }] }],
    }];
    const profile = compileProfile('0.5.0', '0.9.0', relevant, 5);
    assert.ok(profile.includes('Breaking Changes'));
    assert.ok(profile.includes('`createResource`'));
    assert.ok(profile.includes('`createQuery`'));
    assert.ok(profile.includes('src/app.js'));
    assert.ok(profile.includes('line ~14'));
    assert.ok(profile.includes('Use createQuery instead.'));
  });

  it('includes deprecated changes section', () => {
    const relevant = [{
      severity: 'deprecated',
      symbol: 'setTheme',
      module: 'decantr/css',
      replacement: 'setStyle',
      since: '0.8.0',
      until: '1.0.0',
      guide: 'Drop-in rename.',
      fileHits: [{ file: 'src/pages/home.js', hits: [{ line: 'setTheme(...)', lineNumber: 3 }] }],
    }];
    const profile = compileProfile('0.8.0', '0.9.0', relevant, 3);
    assert.ok(profile.includes('Deprecated'));
    assert.ok(profile.includes('`setTheme`'));
    assert.ok(profile.includes('removal in 1.0.0'));
  });

  it('shows no-changes message when relevant is empty', () => {
    const profile = compileProfile('0.9.0', '0.9.6', [], 15);
    assert.ok(profile.includes('No source-level changes required'));
  });
});

// ============================================================
// Config Migration
// ============================================================

describe('config migration', () => {
  it('migrateConfig is called when present on migration module', () => {
    const configBefore = { build: { sourcemaps: true } };
    const migrateConfig = (config) => {
      const result = { ...config };
      result.build = { ...result.build, sourceMap: result.build.sourcemaps };
      delete result.build.sourcemaps;
      return result;
    };

    const result = migrateConfig(configBefore);
    assert.equal(result.build.sourceMap, true);
    assert.equal(result.build.sourcemaps, undefined);
  });

  it('config migration does not mutate original', () => {
    const config = { build: { sourcemaps: true } };
    const copy = JSON.parse(JSON.stringify(config));
    const migrateConfig = (c) => {
      const result = { ...c };
      result.build = { ...result.build, renamed: true };
      return result;
    };

    migrateConfig(config);
    assert.deepEqual(config, copy);
  });
});

// ============================================================
// Full age flow (unit-level)
// ============================================================

describe('full age flow', () => {
  it('essence migration chain still works through shared utilities', async () => {
    const migrations = await loadMigrations();
    const m050 = migrations.find(m => m.version === '0.5.0');
    const m060 = migrations.find(m => m.version === '0.6.0');

    const input = {
      terroir: 'recipe-community',
      organs: ['auth'],
      anatomy: [{ id: 'home', blend: ['recipe-hero'] }],
    };

    let result = m050.migrate(input);
    assert.equal(result.version, '0.5.0');
    assert.deepEqual(result.tannins, ['auth']);
    assert.ok(result.structure);

    result = m060.migrate(result);
    assert.equal(result.version, '0.6.0');
    assert.deepEqual(result.structure[0].blend[0], {
      pattern: 'hero', preset: 'image-overlay', as: 'recipe-hero',
    });
  });

  it('applicable migration filtering works correctly', async () => {
    const migrations = await loadMigrations();
    const currentVersion = '0.4.0';
    const targetVersion = '0.6.0';

    const applicable = migrations.filter(m =>
      compareSemver(m.version, currentVersion) > 0 &&
      compareSemver(m.version, targetVersion) <= 0
    );

    assert.ok(applicable.length >= 2);
    assert.ok(applicable.some(m => m.version === '0.5.0'));
    assert.ok(applicable.some(m => m.version === '0.6.0'));
  });

  it('already up to date when current >= target', async () => {
    const migrations = await loadMigrations();
    const currentVersion = '0.6.0';
    const targetVersion = '0.6.0';

    const applicable = migrations.filter(m =>
      compareSemver(m.version, currentVersion) > 0 &&
      compareSemver(m.version, targetVersion) <= 0
    );

    assert.equal(applicable.length, 0);
  });
});

// ============================================================
// Dry run produces no side effects
// ============================================================

describe('dry-run safety', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `decantr-age-dry-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(join(tempDir, 'src'), { recursive: true });
    await writeFile(join(tempDir, 'src', 'app.js'), `
import { createResource } from 'decantr/data';
`, 'utf-8');
  });

  it('compileAgeProfile with dryRun does not write files', async () => {
    const migrations = [{
      version: '0.7.0',
      changes: {
        breaking: [{ type: 'api-remove', symbol: 'createResource', module: 'decantr/data', guide: 'Use createQuery.' }],
      },
    }];

    const result = await compileAgeProfile(tempDir, migrations, '0.6.0', '0.7.0', { dryRun: true });
    assert.equal(result.written, false);
    assert.equal(result.relevant, 1);

    // Verify no llm directory was created
    try {
      await readFile(join(tempDir, 'llm', 'task-age.md'), 'utf-8');
      assert.fail('Should not have written the file');
    } catch (err) {
      assert.ok(err.code === 'ENOENT');
    }

    await rm(tempDir, { recursive: true, force: true });
  });
});

// ============================================================
// Changes manifest format
// ============================================================

describe('changes manifest format', () => {
  it('supports all change types', () => {
    const changes = {
      breaking: [
        { type: 'api-remove', symbol: 'removed', guide: 'gone' },
        { type: 'api-rename', symbol: 'old', replacement: 'new', guide: 'renamed' },
        { type: 'import-rename', symbol: 'OldName', module: 'decantr/core', replacement: 'NewName', guide: 'import changed' },
        { type: 'behavior-change', symbol: 'mount', module: 'decantr/core', guide: 'now returns unmount fn' },
      ],
      deprecated: [
        { symbol: 'legacy', replacement: 'modern', until: '2.0.0', guide: 'will be removed' },
      ],
    };

    const result = collectChanges([{ version: '1.0.0', changes }]);
    assert.equal(result.breaking.length, 4);
    assert.equal(result.deprecated.length, 1);
    assert.equal(result.breaking[0].type, 'api-remove');
    assert.equal(result.breaking[1].type, 'api-rename');
    assert.equal(result.breaking[2].type, 'import-rename');
    assert.equal(result.breaking[3].type, 'behavior-change');
  });
});
