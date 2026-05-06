import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateShowcaseManifest } from '../../../scripts/validate-showcase-manifest.mjs';

const createdRoots: string[] = [];

afterEach(() => {
  for (const root of createdRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function createSandbox() {
  const root = mkdtempSync(join(tmpdir(), 'decantr-showcase-validator-'));
  createdRoots.push(root);

  const capsuleRoot = join(root, 'capsules');
  const thumbnailRoot = join(root, 'thumbnails');
  const contentRoot = join(root, 'content');

  mkdirSync(capsuleRoot, { recursive: true });
  mkdirSync(thumbnailRoot, { recursive: true });
  mkdirSync(contentRoot, { recursive: true });

  return { capsuleRoot, thumbnailRoot, contentRoot };
}

function createEntry(slug: string, overrides: Record<string, unknown> = {}) {
  return {
    slug,
    status: 'active',
    classification: 'pending',
    origin: 'test-fixture',
    thumbnail: {
      src: `/showcase/thumbnails/${slug}.png`,
      alt: `${slug} blueprint showcase screenshot`,
      width: 1600,
      height: 1000,
    },
    ...overrides,
  };
}

function validateWithSandbox(sandbox: ReturnType<typeof createSandbox>, apps: Array<Record<string, unknown>>) {
  return validateShowcaseManifest({
    manifest: { apps },
    shortlistReport: { results: [] },
    capsuleRoot: sandbox.capsuleRoot,
    thumbnailSourcePathForSlug: (slug: string) => join(sandbox.thumbnailRoot, `${slug}.png`),
    contentRoot: sandbox.contentRoot,
  });
}

describe('validateShowcaseManifest', () => {
  it('accepts an active showcase with a capsule and declared thumbnail file', () => {
    const sandbox = createSandbox();
    mkdirSync(join(sandbox.capsuleRoot, 'alpha'));
    writeFileSync(join(sandbox.thumbnailRoot, 'alpha.png'), 'png');

    const result = validateWithSandbox(sandbox, [createEntry('alpha')]);

    expect(result.errors).toEqual([]);
  });

  it('reports active showcase entries without matching capsules', () => {
    const sandbox = createSandbox();
    writeFileSync(join(sandbox.thumbnailRoot, 'alpha.png'), 'png');

    const result = validateWithSandbox(sandbox, [createEntry('alpha')]);

    expect(result.errors).toContain(
      `Active showcase "alpha" is missing its capsule at ${join(sandbox.capsuleRoot, 'alpha')}.`,
    );
  });

  it('reports declared showcase thumbnails missing on disk', () => {
    const sandbox = createSandbox();
    mkdirSync(join(sandbox.capsuleRoot, 'alpha'));

    const result = validateWithSandbox(sandbox, [createEntry('alpha')]);

    expect(result.errors).toContain(
      `Showcase "alpha" thumbnail file is missing at ${join(sandbox.thumbnailRoot, 'alpha.png')}.`,
    );
  });

  it('reports official blueprint files without active showcase coverage', () => {
    const sandbox = createSandbox();
    mkdirSync(join(sandbox.capsuleRoot, 'alpha'));
    mkdirSync(join(sandbox.contentRoot, 'blueprints'));
    writeFileSync(join(sandbox.thumbnailRoot, 'alpha.png'), 'png');
    writeFileSync(join(sandbox.contentRoot, 'blueprints', 'alpha.json'), '{}');
    writeFileSync(join(sandbox.contentRoot, 'blueprints', 'beta.json'), '{}');

    const result = validateWithSandbox(sandbox, [createEntry('alpha')]);

    expect(result.errors).toContain('Official blueprint "beta" is missing an active showcase manifest entry.');
  });
});
