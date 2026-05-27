import { describe, expect, it } from 'vitest';
import { type PublicContentSummary, sortPublicContent } from '../src/index.js';

describe('public content ranking', () => {
  it('prioritizes certified and featured blueprints in recommended ordering', () => {
    const items: PublicContentSummary[] = [
      {
        id: 'supported',
        slug: 'supported',
        namespace: '@official',
        type: 'blueprint',
        name: 'Supported',
        blueprint_portfolio: {
          visibility: 'public',
          maturity: 'supported-contract',
          rationale: 'Supported',
          artifact: { status: 'candidate' },
        },
      },
      {
        id: 'flagship',
        slug: 'flagship',
        namespace: '@official',
        type: 'blueprint',
        name: 'Flagship',
        blueprint_portfolio: {
          visibility: 'featured',
          maturity: 'certified-flagship',
          rationale: 'Certified',
          artifact: { status: 'certified' },
        },
      },
    ];

    expect(sortPublicContent(items, 'recommended').map((item) => item.slug)).toEqual([
      'flagship',
      'supported',
    ]);
  });
});
