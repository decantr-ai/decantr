import { describe, expect, it } from 'vitest';
import type {
  ShowcaseManifestResponse,
  ShowcaseShortlistResponse,
} from '@decantr/registry/client';
import {
  buildShowcaseDataset,
  getStaticShowcaseDataset,
  getStaticShowcaseManifestResponse,
  getStaticShowcaseShortlistResponse,
} from './showcase-dataset';

describe('registry showcase dataset', () => {
  it('builds a usable static fallback from bundled verified showcase artifacts', () => {
    const manifest = getStaticShowcaseManifestResponse();
    const shortlist = getStaticShowcaseShortlistResponse();
    const dataset = getStaticShowcaseDataset();

    expect(manifest.apps.length).toBeGreaterThan(0);
    expect(shortlist.apps.length).toBeGreaterThan(0);
    expect(dataset.apps.length).toBe(manifest.apps.length);
    expect(dataset.bySlug['product-landing']?.url).toBe('/showcase/product-landing');
    expect(dataset.bySlug['product-landing']?.verification?.build.passed).toBe(true);
    expect(dataset.bySlug['product-landing']?.verification?.smoke.passed).toBe(true);
    expect(dataset.apps.every((entry) => entry.status === 'active')).toBe(true);
    expect(
      dataset.apps.every(
        (entry) =>
          entry.verification?.build.passed === true &&
          entry.verification?.smoke.passed === true,
      ),
    ).toBe(true);
  });

  it('keeps live showcase coverage when the shortlist response is unavailable', () => {
    const manifest: ShowcaseManifestResponse = {
      total: 2,
      shortlisted: 1,
      apps: [
        {
          slug: 'live-showcase',
          status: 'active',
          classification: 'B',
          goldenCandidate: 'shortlist',
        },
        {
          slug: 'inactive-showcase',
          status: 'inactive',
          classification: 'B',
          goldenCandidate: 'shortlist',
        },
      ],
    };

    const dataset = buildShowcaseDataset(manifest, null);

    expect(dataset.apps).toHaveLength(1);
    expect(dataset.bySlug['live-showcase']?.url).toBe('/showcase/live-showcase');
    expect(dataset.bySlug['live-showcase']?.verification).toBeNull();
    expect(dataset.bySlug['inactive-showcase']).toBeUndefined();
    expect(dataset.shortlisted.map((entry) => entry.slug)).toEqual(['live-showcase']);
  });

  it('prefers manifest metadata when reconciling shortlist entries by slug', () => {
    const manifest: ShowcaseManifestResponse = {
      total: 1,
      shortlisted: 1,
      apps: [
        {
          slug: 'visual-proof',
          status: 'active',
          classification: 'A',
          goldenCandidate: 'shortlist',
          thumbnail: {
            src: '/showcase/thumbnails/visual-proof.png',
            alt: 'Visual Proof showcase screenshot',
            width: 1600,
            height: 1000,
          },
          url: '/showcase/visual-proof',
        },
      ],
    };
    const shortlist: ShowcaseShortlistResponse = {
      generatedAt: '2026-05-08T00:00:00.000Z',
      summary: null,
      apps: [
        {
          slug: 'visual-proof',
          status: 'active',
          classification: 'A',
        },
      ],
    };

    const dataset = buildShowcaseDataset(manifest, shortlist);

    expect(dataset.shortlisted).toHaveLength(1);
    expect(dataset.shortlisted[0]?.thumbnail?.src).toBe('/showcase/thumbnails/visual-proof.png');
    expect(dataset.shortlisted[0]?.url).toBe('/showcase/visual-proof');
  });
});
