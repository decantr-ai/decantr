import { describe, expect, it } from 'vitest';
import { patternToDiscoveryCandidate, rankPatternCandidates } from '../src/index.js';

describe('pattern discovery', () => {
  it('ranks domain language across visual briefs, interactions, and layout hints', () => {
    const matches = rankPatternCandidates(
      {
        query: 'recipe feed with infinite scroll, avatars, likes, and food photos',
        route: '/feed',
        code: 'const observer = new IntersectionObserver(loadMore); <Avatar /> <button>Like</button>',
      },
      [
        patternToDiscoveryCandidate({
          id: 'content-feed',
          name: 'Content Feed',
          description: 'Infinite social feed for cards and updates.',
          tags: ['feed', 'social'],
          components: ['avatar', 'card-grid'],
          interactions: ['scroll-reveal'],
          visual_brief: 'Food-forward card grid with author identity and engagement metadata.',
          layout_hints: { density: '3 column responsive grid' },
        }),
        patternToDiscoveryCandidate({
          id: 'pricing-table',
          name: 'Pricing Table',
          description: 'Plan comparison cards for SaaS checkout.',
          tags: ['commerce'],
          components: ['price-card'],
        }),
      ],
    );

    expect(matches[0]?.candidate.id).toBe('content-feed');
    expect(matches[0]?.score ?? 0).toBeGreaterThan(0);
    expect(matches[0]?.reasons.join(' ')).toContain('domain');
  });

  it('uses aliases and route names as high-weight signals', () => {
    const matches = rankPatternCandidates(
      { query: 'photo to recipe generator', route: '/generate' },
      [
        {
          id: 'upload-zone',
          slug: 'upload-zone',
          name: 'Upload Zone',
          aliases: ['photo generator', 'image upload', 'vision input'],
          description: 'Drop zone with preview and result panel.',
        },
        {
          id: 'footer',
          slug: 'footer',
          name: 'Footer',
          description: 'Site footer links.',
        },
      ],
    );

    expect(matches[0]?.candidate.id).toBe('upload-zone');
    expect(matches[0]?.reasons).toContain('matched slug, name, alias, category, or domain');
  });
});
