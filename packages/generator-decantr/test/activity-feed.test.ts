import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

describe('activity-feed Decantr generator', () => {
  it('emits page with activity-feed pattern using pattern code example', () => {
    const patternNode: IRPatternNode = {
      type: 'pattern',
      id: 'activity-feed',
      children: [],
      pattern: {
        patternId: 'activity-feed',
        preset: 'standard',
        alias: 'activity-feed',
        layout: 'column',
        contained: true,
        standalone: false,
        code: {
          imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Avatar, Badge, Button, icon } from 'decantr/components';",
          example: "function ActivityFeed({ search, view }) {\n  const { div, span, p, h4, time } = tags;\n  return div({ class: css('_flex _col _gap4') }, 'feed items');\n}",
        },
        components: ['Avatar', 'Badge', 'Button'],
      },
      card: null,
      visualEffects: null,
      wireProps: null,
      spatial: { gap: '4' },
    };

    const page: IRPageNode = {
      type: 'page',
      id: 'feed',
      children: [patternNode],
      pageId: 'feed',
      surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
      wiring: null,
    };

    const result = emitPage(page);
    expect(result.path).toBe('src/pages/feed.js');
    expect(result.content).toContain('ActivityFeed');
    expect(result.content).toContain('decantr/tags');
    expect(result.content).toContain('decantr/css');
    expect(result.content).toContain('feed items');
  });

  it('emits feed with wiring props when connected to filter-bar', () => {
    const patternNode: IRPatternNode = {
      type: 'pattern',
      id: 'activity-feed',
      children: [],
      pattern: {
        patternId: 'activity-feed',
        preset: 'standard',
        alias: 'activity-feed',
        layout: 'column',
        contained: true,
        standalone: false,
        code: {
          imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Avatar, Badge, Button, icon } from 'decantr/components';",
          example: "function ActivityFeed({ search, view }) {\n  const { div } = tags;\n  return div({ class: css('_flex _col _gap4') }, 'feed');\n}",
        },
        components: ['Avatar', 'Badge', 'Button'],
      },
      card: null,
      visualEffects: null,
      wireProps: { search: 'pageSearch', view: 'pageView' },
      spatial: { gap: '4' },
    };

    const page: IRPageNode = {
      type: 'page',
      id: 'feed',
      children: [patternNode],
      pageId: 'feed',
      surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
      wiring: {
        signals: [
          { name: 'pageSearch', init: "''", setter: 'setPageSearch' },
          { name: 'pageView', init: "'all'", setter: 'setPageView' },
        ],
      },
    };

    const result = emitPage(page);
    expect(result.content).toContain('createSignal');
    expect(result.content).toContain('pageSearch');
    expect(result.content).toContain('pageView');
  });
});
